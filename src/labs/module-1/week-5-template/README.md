# Week 5 Lab: Launch Files and Parameters

## Overview

In this lab, you will create and use launch files to start multiple nodes and configure parameters for your ROS 2 system.

## Learning Objectives

- Create launch files to start multiple nodes
- Configure parameters for nodes and the system
- Use parameter files and command-line arguments
- Implement conditional launch logic

## Prerequisites

- ROS 2 workspace with multiple nodes
- Understanding of ROS 2 parameters
- Python programming skills

## Lab Instructions

### Step 1: Create a Basic Launch File

Create a simple launch file `basic_launch.py`:

```python
from launch import LaunchDescription
from launch_ros.actions import Node

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

### Step 2: Add Parameters to Launch File

Create a launch file with parameters `parameter_launch.py`:

```python
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration

def generate_launch_description():
    # Declare launch arguments
    background_r = LaunchConfiguration('background_r', default='0')
    background_g = LaunchConfiguration('background_g', default='84')
    background_b = LaunchConfiguration('background_b', default='122')

    return LaunchDescription([
        # Declare launch arguments
        DeclareLaunchArgument(
            'background_r',
            default_value='0',
            description='Background red value (0-255)'),
        DeclareLaunchArgument(
            'background_g',
            default_value='84',
            description='Background green value (0-255)'),
        DeclareLaunchArgument(
            'background_b',
            default_value='122',
            description='Background blue value (0-255)'),

        # Launch node with parameters
        Node(
            package='turtlesim',
            executable='turtlesim_node',
            name='sim',
            parameters=[
                {'background_r': background_r},
                {'background_g': background_g},
                {'background_b': background_b}
            ]
        )
    ])
```

### Step 3: Create Parameter Files

Create a YAML parameter file `robot_params.yaml`:

```yaml
/**:
  ros__parameters:
    use_sim_time: false
    update_frequency: 5.0
    publish_frequency: 5.0

my_robot_controller:
  ros__parameters:
    controller_frequency: 50.0
    velocity_x: 0.5
    velocity_y: 0.0
    angular_z: 0.2

my_robot_localization:
  ros__parameters:
    sensor_timeout: 0.1
    two_d_mode: true
    transform_tolerance: 0.2
    map_frame: "map"
    odom_frame: "odom"
    base_frame: "base_link"
    world_frame: "odom"
```

### Step 4: Use Parameter Files in Launch

Create a launch file that uses parameter files `param_file_launch.py`:

```python
from launch import LaunchDescription
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_path

def generate_launch_description():
    params_path = get_package_share_path('my_robot_bringup') / 'config' / 'robot_params.yaml'

    return LaunchDescription([
        Node(
            package='my_robot_controller',
            executable='controller_node',
            name='my_robot_controller',
            parameters=[str(params_path)]
        ),
        Node(
            package='my_robot_localization',
            executable='localization_node',
            name='my_robot_localization',
            parameters=[str(params_path)]
        )
    ])
```

### Step 5: Add Conditional Launch Logic

Create a launch file with conditional logic `conditional_launch.py`:

```python
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, SetEnvironmentVariable
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration, PythonExpression
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_path

def generate_launch_description():
    # Declare launch arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='false')
    launch_rviz = LaunchConfiguration('launch_rviz', default='true')

    return LaunchDescription([
        # Declare launch arguments
        DeclareLaunchArgument(
            'use_sim_time',
            default_value='false',
            description='Use simulation (Gazebo) clock if true'),
        DeclareLaunchArgument(
            'launch_rviz',
            default_value='true',
            description='Launch RViz if true'),

        # Launch robot state publisher
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            parameters=[{'use_sim_time': use_sim_time}]
        ),

        # Conditionally launch RViz
        Node(
            condition=PythonExpression(['"', launch_rviz, '"', ' == "true"']),
            package='rviz2',
            executable='rviz2',
            name='rviz2'
        )
    ])
```

### Step 6: Test Launch Files

Run your launch files and verify they work as expected:
```bash
# With default parameters
ros2 launch my_robot_bringup basic_launch.py

# With custom parameters
ros2 launch my_robot_bringup parameter_launch.py background_r:=255 background_g:=255 background_b:=255

# Using parameter file
ros2 launch my_robot_bringup param_file_launch.py
```

## Success Criteria

- [ ] Create launch files that start multiple nodes
- [ ] Configure parameters through launch files and parameter files
- [ ] Use launch arguments to customize behavior
- [ ] Implement conditional launch logic

## Troubleshooting

- If launch files don't run, check package names and executable names match
- For parameter issues, verify parameter names match in nodes and launch files
- Use `ros2 launch --show-args` to see available launch arguments

## Additional Resources

- [Launch System Documentation](https://docs.ros.org/en/humble/Tutorials/Intermediate/Launch/Creating-Launch-Files.html)
- [Parameters Guide](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Using-Parameters-In-A-Class-Python.html)
- [Launch Arguments Tutorial](https://docs.ros.org/en/humble/Tutorials/Intermediate/Launch/Using-Launch-Arguments.html)