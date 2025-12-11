---
sidebar_position: 5
---

# Week 5: Launch Files and Parameters

## Learning Objectives

By the end of this week, you will be able to:
- Create and use launch files to start multiple nodes
- Configure parameters for nodes and the system
- Use parameter files and command-line arguments
- Implement conditional launch logic

## Launch Files

Launch files allow you to start multiple nodes with a single command. ROS 2 uses Python-based launch files:

```python
from launch import LaunchDescription
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_path
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='turtlesim',
            executable='turtlesim_node',
            name='sim'
        ),
        Node(
            package='turtlesim',
            executable='turtle_teleop_key',
            name='teleop'
        )
    ])
```

## Parameters

Parameters provide configuration values to nodes:

```python
import rclpy
from rclpy.node import Node

class ParamNode(Node):
    def __init__(self):
        super().__init__('param_node')

        # Declare parameters with default values
        self.declare_parameter('param_name', 'default_value')

        # Get parameter value
        param_value = self.get_parameter('param_name').value
```

## Parameter Files

YAML files can store parameter configurations:

```yaml
/**:
  ros__parameters:
    param1: value1
    param2: value2

node_name:
  ros__parameters:
    specific_param: specific_value
```

## Advanced Launch Features

Launch files support advanced features:

- **Conditional execution**: Execute nodes based on conditions
- **Arguments**: Pass parameters to launch files
- **Substitutions**: Dynamic values in launch files
- **Events**: React to system events

## Lab Exercise

Complete the lab exercise for this week to practice launch files and parameters:

- Navigate to the lab template: `src/labs/module-1/week-5-template/`
- Follow the instructions in the README.md file
- Create launch files for a complete robot system

## Resources

- [Launch System Documentation](https://docs.ros.org/en/humble/Tutorials/Intermediate/Launch/Launch-Main.html)
- [Parameters Guide](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Using-Parameters-In-A-Class-Python.html)
- [Launch Arguments Tutorial](https://docs.ros.org/en/humble/Tutorials/Intermediate/Launch/Creating-Launch-Files.html)

## Assessment

Complete the quiz for this week to verify your understanding of launch systems and parameters.