---
sidebar_position: 2
---

# Week 7: Unity ROS TCP Connector

## Learning Objectives

By the end of this week, you will be able to:
- Set up Unity with ROS TCP Connector
- Create photorealistic simulation environments
- Integrate Unity with ROS 2 systems
- Implement sensor simulation in Unity

## Introduction to Unity ROS Integration

Unity provides high-fidelity visualization and simulation capabilities that complement ROS 2. The ROS TCP Connector enables communication between Unity and ROS 2 systems through TCP/IP networking.

## Unity ROS TCP Connector Architecture

The connector provides:

- **TCP Communication**: Bidirectional communication between Unity and ROS
- **Message Serialization**: Automatic conversion between ROS messages and Unity objects
- **Service Calls**: Synchronous service calls from Unity
- **Action Clients**: Asynchronous action execution

## Basic Setup

Setting up Unity with ROS TCP Connector:

1. Install Unity (2021.3 LTS or later recommended)
2. Import the ROS TCP Connector package
3. Configure network settings for communication
4. Create publishers, subscribers, services, and actions

## Unity Scene Creation

Creating a simulation environment in Unity:

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using ROS2;

public class RobotController : MonoBehaviour
{
    ROS2UnityComponent ros2Unity;
    ROS2Socket ros2Socket;
    Publisher<std_msgs.msg.String> pub;

    void Start()
    {
        ros2Unity = GetComponent<ROS2UnityComponent>();
        ros2Unity.Init();
        ros2Socket = ros2Unity.ROS2Assemblies.GetComponent<ROS2Socket>();

        pub = ros2Socket.advertise<std_msgs.msg.String>("/unity_topic");
    }

    void Update()
    {
        if (ros2Socket.Ok())
        {
            var msg = new std_msgs.msg.String();
            msg.data = "Hello from Unity!";
            pub.Publish(msg);
        }
    }
}
```

## Sensor Simulation in Unity

Unity can simulate various sensors:

- **Cameras**: RGB, depth, semantic segmentation
- **LIDAR**: 2D and 3D point cloud generation
- **IMU**: Accelerometer and gyroscope data
- **GPS**: Position and orientation in world coordinates

## Lab Exercise

Complete the lab exercise for this week to practice Unity ROS integration:

- Navigate to the lab template: `src/labs/module-2/week-7-template/`
- Follow the instructions in the README.md file
- Create a Unity simulation with ROS integration

## Resources

- [Unity ROS TCP Connector Documentation](https://github.com/Unity-Technologies/ROS-TCP-Connector)
- [Unity Robotics Hub](https://github.com/Unity-Technologies/Unity-Robotics-Hub)
- [Unity Asset Store - Robotics Packages](https://assetstore.unity.com/)

## Assessment

Complete the quiz for this week to verify your understanding of Unity ROS integration.