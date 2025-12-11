---
sidebar_position: 4
---

# Week 4: URDF and Xacro for Robot Description

## Learning Objectives

By the end of this week, you will be able to:
- Create robot descriptions using Unified Robot Description Format (URDF)
- Use Xacro to simplify complex robot descriptions
- Define robot kinematics and dynamics
- Visualize robots in RViz

## Unified Robot Description Format (URDF)

URDF is an XML format for representing a robot model. It defines:

- **Links**: Rigid parts of the robot
- **Joints**: Connections between links
- **Visual**: How the robot appears in simulation
- **Collision**: Collision properties for physics simulation
- **Inertial**: Mass, center of mass, and inertia properties

### Basic URDF Structure

```xml
<?xml version="1.0"?>
<robot name="my_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <cylinder length="0.6" radius="0.2"/>
      </geometry>
    </visual>
  </link>

  <joint name="base_to_laser" type="fixed">
    <parent link="base_link"/>
    <child link="laser_link"/>
    <origin xyz="0.1 0.0 0.2"/>
  </joint>

  <link name="laser_link">
    <visual>
      <geometry>
        <box size="0.05 0.05 0.05"/>
      </geometry>
    </visual>
  </link>
</robot>
```

## Xacro: XML Macros

Xacro extends URDF with macros, properties, and mathematical expressions:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="my_robot">
  <xacro:property name="M_PI" value="3.1415926535897931" />

  <xacro:macro name="wheel" params="prefix">
    <link name="${prefix}_wheel">
      <visual>
        <geometry>
          <cylinder radius="0.1" length="0.05"/>
        </geometry>
      </visual>
    </link>
  </xacro:macro>

  <xacro:wheel prefix="front_left"/>
  <xacro:wheel prefix="front_right"/>
  <xacro:wheel prefix="rear_left"/>
  <xacro:wheel prefix="rear_right"/>
</robot>
```

## Robot Kinematics

URDF describes the kinematic structure of a robot:

- **Forward Kinematics**: Calculate end-effector position from joint angles
- **Inverse Kinematics**: Calculate joint angles for desired end-effector position
- **Kinematic Chains**: Series of connected links and joints

## Lab Exercise

Complete the lab exercise for this week to practice URDF and Xacro:

- Navigate to the lab template: `src/labs/module-1/week-4-template/`
- Follow the instructions in the README.md file
- Create a complete robot description using URDF and Xacro

## Resources

- [URDF Tutorials](https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/URDF-Main.html)
- [Xacro Documentation](https://wiki.ros.org/xacro)
- [Robot Modeling Guide](https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/Creating-Your-First-URDF-File.html)

## Assessment

Complete the quiz for this week to verify your understanding of robot description formats.