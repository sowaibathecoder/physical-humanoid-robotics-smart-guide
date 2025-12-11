# Week 7 Lab: Unity ROS TCP Connector

## Overview

In this lab, you will set up Unity with the ROS TCP Connector and create photorealistic simulation environments that integrate with ROS 2 systems.

## Learning Objectives

- Install and configure Unity with ROS TCP Connector
- Create Unity scenes that communicate with ROS 2
- Implement sensor simulation in Unity
- Integrate Unity with ROS 2 systems for perception tasks

## Prerequisites

- Unity Hub and Unity 2021.3 LTS or later installed
- ROS 2 Humble installed
- Basic Unity and C# programming knowledge

## Lab Instructions

### Step 1: Install Unity and ROS TCP Connector

1. Install Unity Hub from [Unity's website](https://unity3d.com/get-unity/download)
2. Install Unity 2021.3 LTS or later through Unity Hub
3. Download the ROS TCP Connector package from the [Unity Robotics GitHub](https://github.com/Unity-Technologies/ROS-TCP-Connector)
4. Import the ROS TCP Connector into your Unity project

### Step 2: Create a Basic Unity Scene

Create a simple Unity scene with a robot model:

1. Create a new 3D project in Unity
2. Import a robot model (or create a simple one with primitives)
3. Add a camera to represent a robot's camera sensor
4. Add lighting to the scene

### Step 3: Set Up ROS TCP Connector in Unity

Create a C# script `UnityRosBridge.cs` to handle ROS communication:

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using ROS2;

public class UnityRosBridge : MonoBehaviour
{
    ROS2UnityComponent ros2Unity;
    ROS2Socket ros2Socket;

    // Publishers
    Publisher<std_msgs.msg.String> stringPublisher;
    Publisher<geometry_msgs.msg.Twist> cmdVelPublisher;
    Publisher<sensor_msgs.msg.Image> cameraImagePublisher;

    // Subscribers
    Subscriber<std_msgs.msg.String> stringSubscriber;
    Subscriber<geometry_msgs.msg.Twist> cmdVelSubscriber;

    // Game objects to control
    public GameObject robot;
    private float linearVelocity = 0.0f;
    private float angularVelocity = 0.0f;

    void Start()
    {
        ros2Unity = GetComponent<ROS2UnityComponent>();
        ros2Unity.Init();
        ros2Socket = ros2Unity.ROS2Assemblies.GetComponent<ROS2Socket>();

        // Initialize publishers
        stringPublisher = ros2Socket.advertise<std_msgs.msg.String>("/unity_status");
        cmdVelPublisher = ros2Socket.advertise<geometry_msgs.msg.Twist>("/cmd_vel");
        cameraImagePublisher = ros2Socket.advertise<sensor_msgs.msg.Image>("/unity_camera/image_raw");

        // Initialize subscribers
        stringSubscriber = ros2Socket.subscribe<std_msgs.msg.String>("/unity_commands", ProcessStringMessage);
        cmdVelSubscriber = ros2Socket.subscribe<geometry_msgs.msg.Twist>("/cmd_vel", ProcessCmdVelMessage);
    }

    void Update()
    {
        if (ros2Socket.Ok())
        {
            // Publish status message
            var statusMsg = new std_msgs.msg.String();
            statusMsg.data = "Unity simulation running";
            stringPublisher.Publish(statusMsg);

            // Move robot based on received velocities
            if (robot != null)
            {
                robot.transform.Translate(Vector3.forward * linearVelocity * Time.deltaTime);
                robot.transform.Rotate(Vector3.up, angularVelocity * Time.deltaTime);
            }
        }
    }

    void ProcessStringMessage(std_msgs.msg.String msg)
    {
        Debug.Log("Received command: " + msg.data);
        // Process the command based on the message content
    }

    void ProcessCmdVelMessage(geometry_msgs.msg.Twist msg)
    {
        linearVelocity = (float)msg.linear.x;
        angularVelocity = (float)msg.angular.z;
        Debug.Log("Received cmd_vel: linear=" + linearVelocity + ", angular=" + angularVelocity);
    }

    void OnDestroy()
    {
        if (ros2Socket.Ok())
        {
            ros2Socket.Shutdown();
        }
    }
}
```

### Step 4: Create a Camera Publisher

Create a C# script `CameraPublisher.cs` to publish camera images:

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using ROS2;
using System.Threading.Tasks;

public class CameraPublisher : MonoBehaviour
{
    ROS2Socket ros2Socket;
    Publisher<sensor_msgs.msg.Image> imagePublisher;

    public Camera unityCamera;
    public int imageWidth = 640;
    public int imageHeight = 480;
    public float publishRate = 30.0f; // Hz

    private RenderTexture renderTexture;
    private Texture2D texture2D;
    private float nextPublishTime;

    void Start()
    {
        // Initialize ROS
        var ros2Unity = GetComponent<ROS2UnityComponent>();
        ros2Unity.Init();
        ros2Socket = ros2Unity.ROS2Assemblies.GetComponent<ROS2Socket>();

        // Create publishers
        imagePublisher = ros2Socket.advertise<sensor_msgs.msg.Image>("/unity_camera/image_raw");

        // Create render texture for camera
        renderTexture = new RenderTexture(imageWidth, imageHeight, 24);
        unityCamera.targetTexture = renderTexture;

        // Create texture2D for reading pixels
        texture2D = new Texture2D(imageWidth, imageHeight, TextureFormat.RGB24, false);

        nextPublishTime = Time.time;
    }

    void Update()
    {
        if (ros2Socket.Ok() && Time.time >= nextPublishTime)
        {
            // Set the active render texture and read pixels
            RenderTexture.active = renderTexture;
            texture2D.ReadPixels(new Rect(0, 0, imageWidth, imageHeight), 0, 0);
            texture2D.Apply();

            // Convert texture to ROS image message
            var imageMsg = new sensor_msgs.msg.Image();
            imageMsg.width = (uint)imageWidth;
            imageMsg.height = (uint)imageHeight;
            imageMsg.encoding = "rgb8";
            imageMsg.is_bigendian = 0;
            imageMsg.step = (uint)(imageWidth * 3); // 3 bytes per pixel for RGB

            // Convert texture data to byte array
            byte[] imageData = texture2D.GetRawTextureData<byte>();
            imageMsg.data = imageData;

            // Set timestamp
            var time = new builtin_interfaces.msg.Time();
            time.sec = (int)Time.time;
            time.nanosec = (int)((Time.time - (int)Time.time) * 1000000000);
            imageMsg.header.stamp = time;
            imageMsg.header.frame_id = "unity_camera";

            // Publish image
            imagePublisher.Publish(imageMsg);

            // Calculate next publish time
            nextPublishTime += 1.0f / publishRate;
        }
    }
}
```

### Step 5: Set Up ROS Bridge Node

Create a ROS 2 bridge node `unity_bridge.py` to facilitate communication:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np

class UnityBridge(Node):
    def __init__(self):
        super().__init__('unity_bridge')

        # Create publisher for Unity commands
        self.unity_cmd_publisher = self.create_publisher(String, '/unity_commands', 10)

        # Create subscriber for Unity status
        self.unity_status_subscriber = self.create_subscription(
            String,
            '/unity_status',
            self.status_callback,
            10
        )

        # Create subscriber for robot commands (to forward to Unity)
        self.cmd_vel_subscriber = self.create_subscription(
            Twist,
            '/cmd_vel',
            self.cmd_vel_callback,
            10
        )

        # Create publisher for Unity camera images
        self.image_publisher = self.create_publisher(Image, '/unity_camera/image_raw', 10)

        # Create subscriber for Unity camera images
        self.unity_image_subscriber = self.create_subscription(
            Image,
            '/unity_camera/image_raw',
            self.image_callback,
            10
        )

        # Create CvBridge for image conversion
        self.bridge = CvBridge()

        self.get_logger().info('Unity Bridge Node Started')

    def status_callback(self, msg):
        self.get_logger().info(f'Unity Status: {msg.data}')

    def cmd_vel_callback(self, msg):
        # Forward command to Unity via a service call or direct connection
        self.get_logger().info(f'Received cmd_vel: linear={msg.linear.x}, angular={msg.angular.z}')

    def image_callback(self, msg):
        try:
            # Convert ROS image to OpenCV image
            cv_image = self.bridge.imgmsg_to_cv2(msg, "rgb8")

            # Display the image
            cv2.imshow("Unity Camera", cv_image)
            cv2.waitKey(1)

        except Exception as e:
            self.get_logger().error(f'Error processing image: {e}')

def main(args=None):
    rclpy.init(args=args)

    unity_bridge = UnityBridge()

    try:
        rclpy.spin(unity_bridge)
    except KeyboardInterrupt:
        pass
    finally:
        unity_bridge.destroy_node()
        rclpy.shutdown()
        cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
```

### Step 6: Create a Launch File

Create a launch file `unity_simulation.launch.py`:

```python
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import ExecuteProcess
import os

def generate_launch_description():
    return LaunchDescription([
        # Launch the Unity bridge node
        Node(
            package='unity_ros_integration',
            executable='unity_bridge.py',
            name='unity_bridge',
            output='screen'
        ),

        # Launch RViz for visualization
        Node(
            package='rviz2',
            executable='rviz2',
            name='rviz2',
            output='screen'
        )
    ])
```

### Step 7: Test Unity-ROS Integration

1. Start ROS 2:
```bash
# Terminal 1
source /opt/ros/humble/setup.bash
ros2 launch unity_ros_integration unity_simulation.launch.py
```

2. Start Unity:
   - Open your Unity project
   - Make sure the ROS TCP Connector is configured with the correct IP and port
   - Run the scene

3. Test communication by sending commands:
```bash
# Terminal 2
source /opt/ros/humble/setup.bash
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist '{linear: {x: 0.5}, angular: {z: 0.2}}'
```

## Success Criteria

- [ ] Successfully install Unity and ROS TCP Connector
- [ ] Create Unity scene that communicates with ROS 2
- [ ] Publish and subscribe to ROS topics from Unity
- [ ] Integrate camera sensor simulation with ROS 2

## Troubleshooting

- If Unity can't connect to ROS, check IP addresses and ports match
- For camera issues, verify texture format and size match ROS message expectations
- If messages don't appear, check that ROS network is properly configured
- Use `ros2 topic list` and `ros2 topic echo` to verify communication

## Additional Resources

- [Unity ROS TCP Connector Documentation](https://github.com/Unity-Technologies/ROS-TCP-Connector)
- [Unity Robotics Hub](https://github.com/Unity-Technologies/Unity-Robotics-Hub)
- [Unity Scripting API](https://docs.unity3d.com/ScriptReference/)