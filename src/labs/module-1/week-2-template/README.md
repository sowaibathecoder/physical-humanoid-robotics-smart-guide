# Week 2 Lab: ROS 2 Workspaces and Packages

## Overview

In this lab, you will create and manage ROS 2 workspaces and packages, learning about the colcon build system and package structure.

## Learning Objectives

- Create and build ROS 2 workspaces using colcon
- Create custom ROS 2 packages
- Understand package dependencies and structure
- Use ROS 2 tools for workspace management

## Prerequisites

- ROS 2 Humble installed
- Basic understanding of ROS 2 concepts
- Command line proficiency

## Lab Instructions

### Step 1: Create a New Workspace

```bash
mkdir -p ~/ros2_workspaces/my_workspace/src
cd ~/ros2_workspaces/my_workspace
```

### Step 2: Create a Package

```bash
cd src
ros2 pkg create --build-type ament_python my_robot_package --dependencies rclpy std_msgs geometry_msgs
```

### Step 3: Explore Package Structure

Examine the created package structure:
- `package.xml`: Package metadata
- `setup.py`: Python package configuration
- `setup.cfg`: Installation configuration
- `my_robot_package/`: Python module directory

### Step 4: Build the Workspace

```bash
cd ~/ros2_workspaces/my_workspace
colcon build --packages-select my_robot_package
source install/setup.bash
```

### Step 5: Create Multiple Packages

Create additional packages that depend on each other:
- `my_robot_description`: Robot URDF files
- `my_robot_control`: Control algorithms
- `my_robot_navigation`: Navigation configurations

### Step 6: Use Workspace Tools

```bash
# List all packages in workspace
colcon list

# Build all packages
colcon build

# Source the workspace
source install/setup.bash

# Check package dependencies
ros2 pkg executables my_robot_package
```

## Success Criteria

- [ ] Successfully create a new ROS 2 workspace
- [ ] Create multiple packages with proper dependencies
- [ ] Build all packages without errors
- [ ] Source the workspace and verify packages are available

## Troubleshooting

- If packages don't build, check dependencies in `package.xml`
- If workspace doesn't source properly, verify the setup.bash path
- For build errors, examine the build logs in the `build/` directory

## Additional Resources

- [Creating a workspace](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Creating-A-Workspace/Creating-A-Workspace.html)
- [Creating a package](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Creating-Your-First-ROS2-Package.html)
- [Colcon documentation](https://colcon.readthedocs.io/en/released/)