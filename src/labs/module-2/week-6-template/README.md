# Week 6 Lab: Gazebo Ignition for Simulation

## Overview

In this lab, you will set up Gazebo Ignition for robot simulation, create custom simulation worlds, and integrate robots with physics simulation.

## Learning Objectives

- Install and configure Gazebo Ignition
- Create custom simulation worlds
- Integrate robots with physics simulation
- Control robots through ROS 2 in simulation

## Prerequisites

- ROS 2 Humble installed
- Gazebo Ignition installed
- Basic understanding of URDF/Xacro

## Lab Instructions

### Step 1: Install Gazebo Ignition

Install Gazebo Harmonic (or the latest version compatible with ROS 2 Humble):

```bash
# Add Gazebo APT repository
sudo apt update && sudo apt install wget
sudo wget https://packages.osrfoundation.org/gazebo.gpg -O /usr/share/keyrings/pkgs-osrf-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/pkgs-osrf-archive-keyring.gpg] http://packages.osrfoundation.org/gazebo/ubuntu-stable $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/gazebo-stable.list > /dev/null

# Update and install Gazebo
sudo apt update
sudo apt install gz-harmonic
```

### Step 2: Create a Custom World File

Create a custom world file `my_custom_world.sdf`:

```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="my_world">
    <!-- Include a ground plane -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Include sun light -->
    <include>
      <uri>model://sun</uri>
    </include>

    <!-- Add a simple box obstacle -->
    <model name="box">
      <pose>2 2 0.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box>
              <size>1 1 1</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>1 1 1</size>
            </box>
          </geometry>
          <material>
            <ambient>1 0 0 1</ambient>
            <diffuse>1 0 0 1</diffuse>
          </material>
        </visual>
        <inertial>
          <mass>1.0</mass>
          <inertia>
            <ixx>0.166667</ixx>
            <ixy>0</ixy>
            <ixz>0</ixz>
            <iyy>0.166667</iyy>
            <iyz>0</iyz>
            <izz>0.166667</izz>
          </inertia>
        </inertial>
      </link>
    </model>

    <!-- Add a robot (will be spawned via ROS 2) -->
    <!-- Robot will be loaded via ros_gz_sim -->
  </world>
</sdf>
```

### Step 3: Create a Robot Model for Gazebo

Create a URDF file with Gazebo-specific plugins `my_robot.gazebo.xacro`:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="my_robot">
  <!-- Include the base robot -->
  <xacro:include filename="$(find my_robot_description)/urdf/my_robot.urdf.xacro" />

  <!-- Gazebo plugins -->
  <gazebo>
    <plugin filename="libgazebo_ros2_control.so" name="gazebo_ros2_control">
      <parameters>$(find my_robot_bringup)/config/my_robot_controllers.yaml</parameters>
    </plugin>
  </gazebo>

  <!-- Material definitions for Gazebo -->
  <gazebo reference="base_link">
    <material>Gazebo/Blue</material>
  </gazebo>

  <!-- Wheel plugins for differential drive -->
  <gazebo>
    <plugin name="differential_drive" filename="libgazebo_ros_diff_drive.so">
      <ros>
        <namespace>my_robot</namespace>
        <remapping>cmd_vel:=cmd_vel</remapping>
        <remapping>odom:=odom</remapping>
      </ros>
      <update_rate>30</update_rate>
      <left_joint>left_wheel_joint</left_joint>
      <right_joint>right_wheel_joint</right_joint>
      <wheel_separation>0.3</wheel_separation>
      <wheel_diameter>0.1</wheel_diameter>
      <max_wheel_torque>20</max_wheel_torque>
      <max_wheel_acceleration>1.0</max_wheel_acceleration>
      <command_topic>cmd_vel</command_topic>
      <odometry_topic>odom</odometry_topic>
      <odometry_frame>odom</odometry_frame>
      <robot_base_frame>base_link</robot_base_frame>
      <publish_odom>true</publish_odom>
      <publish_odom_tf>true</publish_odom_tf>
      <publish_wheel_tf>true</publish_wheel_tf>
    </plugin>
  </gazebo>
</robot>
```

### Step 4: Create a Launch File for Gazebo Simulation

Create a launch file `gazebo_simulation.launch.py`:

```python
import os
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, ExecuteProcess, IncludeLaunchDescription
from launch.conditions import IfCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # Launch arguments
    world = LaunchConfiguration('world')
    headless = LaunchConfiguration('headless')
    show_gui = LaunchConfiguration('show_gui')

    # Declare launch arguments
    declare_world_cmd = DeclareLaunchArgument(
        'world',
        default_value=PathJoinSubstitution([
            FindPackageShare('my_robot_gazebo'),
            'worlds',
            'my_custom_world.sdf'
        ]),
        description='SDF world file')

    declare_headless_cmd = DeclareLaunchArgument(
        'headless',
        default_value='False',
        description='Whether to execute gzclient')

    declare_show_gui_cmd = DeclareLaunchArgument(
        'show_gui',
        default_value='True',
        description='Whether to launch GUI')

    # Launch Gazebo server
    gzserver_cmd = ExecuteProcess(
        cmd=['gz', 'sim', '-r', world],
        output='screen')

    # Launch Gazebo client if show_gui is True
    gzclient_cmd = ExecuteProcess(
        condition=IfCondition(show_gui),
        cmd=['gz', 'sim', '-g'],
        output='screen')

    # Launch robot state publisher
    robot_state_publisher_cmd = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        parameters=[{'use_sim_time': True}]
    )

    # Spawn robot in Gazebo
    spawn_robot_cmd = Node(
        package='ros_gz_sim',
        executable='create',
        arguments=[
            '-name', 'my_robot',
            '-topic', 'robot_description',
            '-x', '0', '-y', '0', '-z', '0.2'
        ],
        output='screen'
    )

    # Create launch description
    ld = LaunchDescription()

    # Add launch arguments
    ld.add_action(declare_world_cmd)
    ld.add_action(declare_headless_cmd)
    ld.add_action(declare_show_gui_cmd)

    # Add actions
    ld.add_action(gzserver_cmd)
    ld.add_action(gzclient_cmd)
    ld.add_action(robot_state_publisher_cmd)
    ld.add_action(spawn_robot_cmd)

    return ld
```

### Step 5: Test the Simulation

Launch your Gazebo simulation and verify the robot appears in the custom world:

```bash
# Launch the simulation
ros2 launch my_robot_gazebo gazebo_simulation.launch.py

# In another terminal, send commands to the robot
ros2 topic pub /my_robot/cmd_vel geometry_msgs/msg/Twist '{linear: {x: 0.5}, angular: {z: 0.2}}'
```

## Success Criteria

- [ ] Successfully install and run Gazebo Ignition
- [ ] Create and load a custom world file
- [ ] Integrate a robot model with Gazebo physics
- [ ] Control the robot through ROS 2 topics in simulation

## Troubleshooting

- If Gazebo doesn't start, check that it's properly installed and in your PATH
- If the robot doesn't appear, verify the URDF has proper Gazebo plugins
- For physics issues, check that inertial properties are properly defined
- Use `gz topic -l` to list available topics in Gazebo

## Additional Resources

- [Gazebo ROS Documentation](https://gazebosim.org/docs/harmonic/ros_interfaces/)
- [ROS 2 Gazebo Integration](https://github.com/ros-simulation/gazebo_ros_pkgs)
- [SDF Specification](https://gazebosim.org/libs/sdf)