# Week 4 Lab: URDF and Xacro for Robot Description

## Overview

In this lab, you will create robot descriptions using URDF (Unified Robot Description Format) and Xacro (XML Macros) to define robot kinematics and dynamics.

## Learning Objectives

- Create robot models using URDF
- Use Xacro to simplify complex robot descriptions
- Define robot kinematics and dynamics properties
- Visualize robots in RViz

## Prerequisites

- ROS 2 with robot_state_publisher and joint_state_publisher
- RViz2 installed
- Basic understanding of robot kinematics

## Lab Instructions

### Step 1: Create a Simple URDF Robot

Create a basic wheeled robot URDF file `simple_robot.urdf`:

```xml
<?xml version="1.0"?>
<robot name="simple_robot">
  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <cylinder radius="0.2" length="0.1"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.2" length="0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Wheel links and joints -->
  <link name="wheel_left">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </visual>
  </link>

  <joint name="wheel_left_joint" type="continuous">
    <parent link="base_link"/>
    <child link="wheel_left"/>
    <origin xyz="0 0.2 -0.05" rpy="1.57075 0 0"/>
  </joint>

  <link name="wheel_right">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </visual>
  </link>

  <joint name="wheel_right_joint" type="continuous">
    <parent link="base_link"/>
    <child link="wheel_right"/>
    <origin xyz="0 -0.2 -0.05" rpy="1.57075 0 0"/>
  </joint>
</robot>
```

### Step 2: Convert to Xacro Format

Create a more complex robot using Xacro in `complex_robot.xacro`:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="complex_robot">
  <xacro:property name="M_PI" value="3.1415926535897931" />

  <!-- Macro for creating wheels -->
  <xacro:macro name="wheel" params="prefix parent x_reflect y_reflect">
    <joint name="${prefix}_wheel_joint" type="continuous">
      <origin xyz="${x_reflect*0.1} ${y_reflect*0.13} 0" rpy="0 0 0" />
      <parent link="${parent}"/>
      <child link="${prefix}_wheel"/>
      <axis xyz="0 1 0" />
    </joint>

    <link name="${prefix}_wheel">
      <visual>
        <origin xyz="0 0 0" rpy="${M_PI/2} 0 0" />
        <geometry>
          <cylinder radius="0.033" length="0.023"/>
        </geometry>
      </visual>
      <collision>
        <origin xyz="0 0 0" rpy="${M_PI/2} 0 0" />
        <geometry>
          <cylinder radius="0.033" length="0.023"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="0.1" />
        <inertia ixx="0.001" ixy="0.0" ixz="0.0"
                 iyy="0.001" iyz="0.0"
                 izz="0.001" />
      </inertial>
    </link>
  </xacro:macro>

  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.2 .3 .1"/>
      </geometry>
      <material name="white">
        <color rgba="1 1 1 1"/>
      </material>
    </visual>
  </link>

  <!-- Create wheels using macro -->
  <xacro:wheel prefix="front_left" parent="base_link" x_reflect="1" y_reflect="1" />
  <xacro:wheel prefix="front_right" parent="base_link" x_reflect="1" y_reflect="-1" />
  <xacro:wheel prefix="rear_left" parent="base_link" x_reflect="-1" y_reflect="1" />
  <xacro:wheel prefix="rear_right" parent="base_link" x_reflect="-1" y_reflect="-1" />
</robot>
```

### Step 3: Launch the Robot in RViz

Create a launch file `view_robot.launch.py`:

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from launch.substitutions import Command
from ament_index_python.packages import get_package_share_path

def generate_launch_description():
    urdf_path = get_package_share_path('my_robot_description') / 'urdf' / 'complex_robot.xacro'

    robot_state_publisher_node = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        parameters=[{
            'robot_description': Command(['xacro ', str(urdf_path)])
        }]
    )

    joint_state_publisher_node = Node(
        package='joint_state_publisher',
        executable='joint_state_publisher',
        name='joint_state_publisher'
    )

    rviz_node = Node(
        package='rviz2',
        executable='rviz2',
        name='rviz2',
        arguments=['-d', [str(get_package_share_path('my_robot_description') / 'rviz' / 'urdf.rviz')]]
    )

    return LaunchDescription([
        robot_state_publisher_node,
        joint_state_publisher_node,
        rviz_node
    ])
```

### Step 4: Visualize the Robot

Launch your robot model in RViz to verify it displays correctly.

## Success Criteria

- [ ] Create a valid URDF file for a simple robot
- [ ] Convert the URDF to Xacro format using macros
- [ ] Visualize the robot in RViz successfully
- [ ] Understand the structure of robot descriptions

## Troubleshooting

- If the robot doesn't appear in RViz, check that joint names match between URDF and state publisher
- For Xacro errors, verify macro syntax and parameter passing
- Use `xacro --inorder robot.xacro` to check for syntax errors

## Additional Resources

- [URDF Tutorials](https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/URDF-Main.html)
- [Xacro Documentation](https://wiki.ros.org/xacro)
- [Robot State Publisher](https://github.com/ros/robot_state_publisher)