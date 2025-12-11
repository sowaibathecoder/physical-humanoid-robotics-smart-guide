---
sidebar_position: 2
---

# Week 2: ROS 2 Concepts and Architecture

## Learning Objectives

By the end of this week, you will be able to:
- Understand the differences between ROS 1 and ROS 2
- Explain the DDS-based communication architecture
- Work with ROS 2 workspaces and packages
- Create and build simple ROS 2 packages

## ROS 1 vs ROS 2

ROS 2 was developed to address limitations of ROS 1, particularly in areas of:

- **Real-time support**: Better real-time capabilities
- **Multi-robot systems**: Improved support for multiple robots
- **Production deployment**: Better for commercial applications
- **Quality of Service (QoS)**: Configurable communication behavior
- **Security**: Built-in security features

## DDS Communication Layer

The Data Distribution Service (DDS) provides the underlying communication layer for ROS 2:

- **RMW (ROS Middleware)**: Abstraction layer between ROS 2 and DDS implementations
- **QoS Profiles**: Configure reliability, durability, liveliness, and other communication parameters
- **Domain IDs**: Isolate different ROS 2 networks

## ROS 2 Workspaces

ROS 2 uses colcon for building packages:

```bash
# Create a workspace
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws

# Build the workspace
colcon build

# Source the workspace
source install/setup.bash
```

## Lab Exercise

Complete the lab exercise for this week to practice ROS 2 workspace management:

- Navigate to the lab template: `src/labs/module-1/week-2-template/`
- Follow the instructions in the README.md file
- Create and build your own ROS 2 workspace with custom packages

## Resources

- [ROS 2 Workspaces Tutorial](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Creating-Your-First-ROS2-Package.html)
- [DDS Concepts](https://docs.ros.org/en/humble/Concepts/About-Domain-Isolation.html)
- [QoS Configuration Guide](https://docs.ros.org/en/humble/Concepts/About-Quality-of-Service-Settings.html)

## Assessment

Complete the quiz for this week to verify your understanding of ROS 2 concepts and architecture.