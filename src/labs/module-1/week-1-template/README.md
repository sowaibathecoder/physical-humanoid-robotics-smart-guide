# Week 1 Lab: ROS 2 Installation and Basic Commands

## Overview

In this lab, you will install ROS 2 Humble Hawksbill and run basic commands to familiarize yourself with the ROS 2 environment.

## Learning Objectives

- Install ROS 2 Humble Hawksbill on your system
- Run basic ROS 2 commands
- Create a simple publisher/subscriber example

## Prerequisites

- Ubuntu 22.04 LTS (or Windows with WSL2)
- Internet connection
- Basic command line knowledge

## Lab Instructions

### Step 1: Install ROS 2 Humble

Follow the official installation guide for your platform:
- [Ubuntu Installation](https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debians.html)
- [Windows Installation with WSL2](https://docs.ros.org/en/humble/Installation/Windows-Install-Binary.html)

### Step 2: Source ROS 2 Environment

```bash
source /opt/ros/humble/setup.bash
```

### Step 3: Create a Workspace

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws
colcon build
source install/setup.bash
```

### Step 4: Run Basic Commands

```bash
# Check ROS 2 version
ros2 --version

# List available commands
ros2 --help

# Check if ROS 2 is properly configured
printenv | grep ROS
```

### Step 5: Create a Simple Publisher/Subscriber

1. Create a new package:
```bash
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python my_publisher_subscriber
```

2. Edit the publisher script in `my_publisher_subscriber/my_publisher_subscriber/publisher_member_function.py`

3. Edit the subscriber script in `my_publisher_subscriber/my_publisher_subscriber/subscriber_member_function.py`

4. Build and run your publisher and subscriber

## Success Criteria

- [ ] Successfully install ROS 2 Humble
- [ ] Run basic ROS 2 commands without errors
- [ ] Create and build a simple ROS 2 workspace
- [ ] Create a publisher/subscriber pair that communicates successfully

## Troubleshooting

- If you encounter permission errors, make sure you've properly set up your environment
- If packages don't build, check that all dependencies are installed
- For network issues, ensure ROS 2 environment variables are set correctly

## Additional Resources

- [ROS 2 Tutorials](https://docs.ros.org/en/humble/Tutorials.html)
- [ROS 2 Beginner: CLI Tools](https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools.html)