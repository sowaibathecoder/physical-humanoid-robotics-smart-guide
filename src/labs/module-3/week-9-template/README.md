# Week 9 Lab: Isaac ROS Gems for Perception and AI

## Overview

In this lab, you will install and configure Isaac ROS Gems and implement perception pipelines that leverage NVIDIA's hardware-accelerated AI capabilities.

## Learning Objectives

- Install and configure Isaac ROS Gems
- Implement perception pipelines using Isaac ROS
- Integrate AI models with ROS 2 systems
- Optimize perception systems for real-time performance

## Prerequisites

- ROS 2 Humble installed
- NVIDIA GPU with CUDA support
- Isaac ROS packages installed
- Basic understanding of ROS 2 and AI concepts

## Lab Instructions

### Step 1: Install Isaac ROS Gems

Install the core Isaac ROS packages:

```bash
# Add NVIDIA package repository
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository "deb https://packages.nvidia.com/ubuntu/$(lsb_release -cs)/nvidia-container-runtime stable"
sudo apt update

# Install Isaac ROS packages
sudo apt install ros-humble-isaac-ros-common
sudo apt install ros-humble-isaac-ros-apriltag
sudo apt install ros-humble-isaac-ros-dnn-inference
sudo apt install ros-humble-isaac-ros-stereo-dnn
sudo apt install ros-humble-isaac-ros-visual-slam
sudo apt install ros-humble-isaac-ros-augmenter
```

### Step 2: Basic Isaac ROS Pipeline

Create a simple launch file `basic_perception_pipeline.launch.py` that uses Isaac ROS components:

```python
from launch import LaunchDescription
from launch_ros.actions import ComposableNodeContainer
from launch_ros.descriptions import ComposableNode

def generate_launch_description():
    # Create a composable node container
    container = ComposableNodeContainer(
        name=' perception_container',
        namespace='',
        package='rclcpp_components',
        executable='component_container_mt',
        composable_node_descriptions=[
            # Isaac ROS DNN Inference node
            ComposableNode(
                package='isaac_ros_dnn_inference',
                plugin='nvidia::isaac_ros::dnn_inference::DNNInferenceNode',
                name='dnn_inference',
                parameters=[{
                    'model_file_path': '/path/to/model/engine.plan',  # Path to TensorRT engine
                    'input_tensor_names': ['input'],
                    'input_tensor_formats': ['nitros_tensor_list_nchw'],
                    'output_tensor_names': ['output'],
                    'output_tensor_formats': ['nitros_tensor_list_nhwc'],
                    'tensorrt_engine_file_path': '/path/to/engine.plan',
                    'model_input_width': 224,
                    'model_input_height': 224,
                    'model_input_channel': 3,
                    'enable_padding': True
                }],
                remappings=[
                    ('tensor_sub', 'tensor_sub'),
                    ('tensor_pub', 'tensor_pub')
                ]
            ),

            # Isaac ROS Image Format Converter (for input)
            ComposableNode(
                package='isaac_ros_image_proc',
                plugin='nvidia::isaac_ros::image_proc::ResizeNode',
                name='resize_node',
                parameters=[{
                    'output_width': 224,
                    'output_height': 224,
                }],
                remappings=[
                    ('image', 'image_in'),
                    ('camera_info', 'camera_info'),
                    ('image_out', 'resized_image')
                ]
            )
        ],
        output='screen'
    )

    return LaunchDescription([container])
```

### Step 3: Isaac ROS Apriltag Detection

Create a launch file `apriltag_detection.launch.py` for fiducial marker detection:

```python
from launch import LaunchDescription
from launch_ros.actions import ComposableNodeContainer
from launch_ros.descriptions import ComposableNode

def generate_launch_description():
    apriltag_container = ComposableNodeContainer(
        name='apriltag_container',
        namespace='apriltag',
        package='rclcpp_components',
        executable='component_container_mt',
        composable_node_descriptions=[
            ComposableNode(
                package='isaac_ros_apriltag',
                plugin='nvidia::isaac_ros::apriltag::AprilTagNode',
                name='apriltag',
                parameters=[{
                    'size': 0.32,  # Size of the tag in meters
                    'max_tags': 64,
                    'tile_size': 2,
                    'quad_decimate': 2.0,
                    'quad_sigma': 0.0,
                    'refine_edges': True,
                    'decode_sharpening': 0.25,
                    'min_tag_width': 6,
                    'max_hamming': 1,
                    'default_tag_family': 'tag36h11',
                    'default_tag_threads': 4,
                    'default_decoder_threads': 1,
                    'default_max_hamming_distance': 1,
                    'default_quads_to_detect': 1000
                }],
                remappings=[
                    ('image', '/camera/image_rect'),
                    ('camera_info', '/camera/camera_info'),
                    ('detections', 'tag_detections')
                ]
            )
        ],
        output='screen'
    )

    return LaunchDescription([apriltag_container])
```

### Step 4: Isaac ROS Stereo DNN Pipeline

Create a launch file `stereo_dnn_pipeline.launch.py` for stereo vision and DNN processing:

```python
from launch import LaunchDescription
from launch_ros.actions import ComposableNodeContainer
from launch_ros.descriptions import ComposableNode

def generate_launch_description():
    stereo_dnn_container = ComposableNodeContainer(
        name='stereo_dnn_container',
        namespace='stereo_dnn',
        package='rclcpp_components',
        executable='component_container_mt',
        composable_node_descriptions=[
            # Left rectify
            ComposableNode(
                package='isaac_ros_image_proc',
                plugin='nvidia::isaac_ros::image_proc::RectifyNode',
                name='left_rectify_node',
                parameters=[{
                    'output_width': 1280,
                    'output_height': 800,
                }],
                remappings=[
                    ('image_raw', '/camera/left/image_raw'),
                    ('camera_info', '/camera/left/camera_info'),
                    ('image_rect', '/stereo/rectified_left')
                ]
            ),

            # Right rectify
            ComposableNode(
                package='isaac_ros_image_proc',
                plugin='nvidia::isaac_ros::image_proc::RectifyNode',
                name='right_rectify_node',
                parameters=[{
                    'output_width': 1280,
                    'output_height': 800,
                }],
                remappings=[
                    ('image_raw', '/camera/right/image_raw'),
                    ('camera_info', '/camera/right/camera_info'),
                    ('image_rect', '/stereo/rectified_right')
                ]
            ),

            # Stereo DNN
            ComposableNode(
                package='isaac_ros_stereo_dnn',
                plugin='nvidia::isaac_ros::stereo_dnn::StereoDNNNode',
                name='stereo_dnn_node',
                parameters=[{
                    'network_type': 'disparity',
                    'input_tensor_rows': 800,
                    'input_tensor_cols': 1280,
                    'input_tensor_channels': 4,
                    'output_tensor_strides': [4],
                    'tensor_padding': [0, 0, 0, 0],
                    'min_disparity': 0.0,
                    'max_disparity': 128.0,
                    'baseline': 0.54,  # Baseline distance between cameras
                    'do_rectify_inputs': False,
                    'subpixel_disp_scaling': 32.0,
                    'disp_scale': 1.0,
                    'min_depth': 0.2,
                    'max_depth': 50.0
                }],
                remappings=[
                    ('left_image', '/stereo/rectified_left'),
                    ('right_image', '/stereo/rectified_right'),
                    ('disparity', 'disparity_output'),
                    ('depth', 'depth_output')
                ]
            )
        ],
        output='screen'
    )

    return LaunchDescription([stereo_dnn_container])
```

### Step 5: Isaac ROS Visual SLAM

Create a launch file `visual_slam.launch.py` for visual SLAM:

```python
from launch import LaunchDescription
from launch_ros.actions import ComposableNodeContainer
from launch_ros.descriptions import ComposableNode

def generate_launch_description():
    visual_slam_container = ComposableNodeContainer(
        name='visual_slam_container',
        namespace='visual_slam',
        package='rclcpp_components',
        executable='component_container_mt',
        composable_node_descriptions=[
            ComposableNode(
                package='isaac_ros_visual_slam',
                plugin='nvidia::isaac_ros::visual_slam::VisualSlamNode',
                name='visual_slam_node',
                parameters=[{
                    'enable_slam_visualization': True,
                    'enable_landmarks_view': True,
                    'enable_observations_view': True,
                    'map_frame': 'map',
                    'odom_frame': 'odom',
                    'base_frame': 'base_link',
                    'input_voxel': 0.01,
                    'icp_threshold': 0.0001,
                    'icp_iterations': 100,
                    'submaps_num_range': 10,
                    'submaps_num_height': 1,
                    'submaps_size': 10.0,
                    'submaps_resolution': 0.05,
                    'map_save_period': 60,
                    'use_odometry_input': False,
                    'odom_image_sync': False,
                    'force_image_transport_hardware': False,
                    'rectified_images': True
                }],
                remappings=[
                    ('stereo_camera/left/camera_info', '/camera/left/camera_info'),
                    ('stereo_camera/right/camera_info', '/camera/right/camera_info'),
                    ('stereo_camera/left/image_rect', '/camera/left/image_rect'),
                    ('stereo_camera/right/image_rect', '/camera/right/image_rect'),
                    ('visual_slam/trajectory', 'trajectory'),
                    ('visual_slam/mapped_points', 'mapped_points'),
                    ('visual_slam/map', 'map')
                ]
            )
        ],
        output='screen'
    )

    return LaunchDescription([visual_slam_container])
```

### Step 6: ROS 2 Node Integration

Create a ROS 2 node `perception_integrator.py` that uses Isaac ROS outputs:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo
from geometry_msgs.msg import PoseStamped
from vision_msgs.msg import Detection2DArray
from isaac_ros_apriltag_interfaces.msg import AprilTagDetectionArray
from std_msgs.msg import Header
import numpy as np

class IsaacROSIntegrator(Node):
    def __init__(self):
        super().__init__('isaac_ros_integrator')

        # Subscribers for Isaac ROS outputs
        self.tag_subscription = self.create_subscription(
            AprilTagDetectionArray,
            '/apriltag/tag_detections',
            self.tag_callback,
            10
        )

        self.depth_subscription = self.create_subscription(
            Image,
            '/stereo_dnn/depth_output',
            self.depth_callback,
            10
        )

        # Publisher for processed results
        self.pose_publisher = self.create_publisher(
            PoseStamped,
            '/processed_pose',
            10
        )

        self.get_logger().info('Isaac ROS Integrator Node Started')

    def tag_callback(self, msg):
        if len(msg.detections) > 0:
            detection = msg.detections[0]  # Process first detection
            pose = detection.pose
            self.get_logger().info(f'Detected tag at: x={pose.pose.position.x}, y={pose.pose.position.y}, z={pose.pose.position.z}')

            # Publish the pose as a PoseStamped message
            pose_stamped = PoseStamped()
            pose_stamped.header = Header()
            pose_stamped.header.stamp = self.get_clock().now().to_msg()
            pose_stamped.header.frame_id = 'camera_link'
            pose_stamped.pose = pose.pose
            self.pose_publisher.publish(pose_stamped)

    def depth_callback(self, msg):
        # Process depth image data
        # Convert ROS Image message to numpy array
        height = msg.height
        width = msg.width
        data = np.array(msg.data, dtype=np.float32)

        # Reshape the data to image dimensions
        depth_image = data.reshape((height, width))

        # Find minimum depth value (closest object)
        min_depth = np.min(depth_image[np.nonzero(depth_image)]) if np.any(depth_image) else float('inf')
        self.get_logger().info(f'Minimum depth in view: {min_depth:.2f} meters')

def main(args=None):
    rclpy.init(args=args)

    integrator = IsaacROSIntegrator()

    try:
        rclpy.spin(integrator)
    except KeyboardInterrupt:
        pass
    finally:
        integrator.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 7: Test Isaac ROS Integration

Test your Isaac ROS setup:

```bash
# Terminal 1: Launch the Apriltag detection pipeline
ros2 launch my_perception_package apriltag_detection.launch.py

# Terminal 2: Launch the stereo DNN pipeline
ros2 launch my_perception_package stereo_dnn_pipeline.launch.py

# Terminal 3: Run the integrator node
ros2 run my_perception_package perception_integrator.py

# Terminal 4: Publish test images
# Use image_publisher or camera simulator to provide input images
```

## Success Criteria

- [ ] Successfully install Isaac ROS Gems
- [ ] Configure and run basic perception pipelines
- [ ] Integrate Isaac ROS outputs with custom ROS 2 nodes
- [ ] Verify real-time performance of perception systems

## Troubleshooting

- If Isaac ROS packages don't install, verify NVIDIA GPU and driver compatibility
- For performance issues, ensure TensorRT is properly configured
- If nodes don't communicate, check topic names and message types
- Use `ros2 component list` to verify composable nodes are loaded

## Additional Resources

- [Isaac ROS Documentation](https://nvidia-isaac-ros.github.io/repositories_and_packages/index.html)
- [Isaac ROS Samples](https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_common)
- [NVIDIA Developer Resources](https://developer.nvidia.com/isaac-ros-gems)