---
sidebar_position: 3
---

# Week 10: Navigation2 and SMAC Planner

## Learning Objectives

By the end of this week, you will be able to:
- Configure Navigation2 for robot navigation
- Implement path planning with SMAC planner
- Integrate navigation with perception systems
- Optimize navigation for dynamic environments

## Introduction to Navigation2

Navigation2 is the ROS 2 navigation stack that provides:

- **Path Planning**: Global and local path planning algorithms
- **Localization**: AMCL and other localization methods
- **Recovery Behaviors**: Actions when navigation fails
- **Lifecycle Management**: Proper state management for navigation

## Navigation2 Architecture

Navigation2 consists of several key components:

- **Global Planner**: Creates long-term path to goal
- **Local Planner**: Executes path while avoiding obstacles
- **Controller**: Converts plan to velocity commands
- **Recovery**: Handles navigation failures

## SMAC Planner

The SMAC (Search with Motion Aggregation on Costmap) planner provides:

- **Any-angle planning**: Not restricted to grid-aligned paths
- **Motion primitives**: Pre-computed movement patterns
- **Costmap integration**: Considers obstacle and inflation costs
- **Optimization**: Finds optimal paths in continuous space

### SMAC Configuration

Basic SMAC planner configuration:

```yaml
global_costmap:
  global_frame: map
  robot_base_frame: base_link
  update_frequency: 1.0
  static_map: true

local_costmap:
  global_frame: odom
  robot_base_frame: base_link
  update_frequency: 5.0
  publish_frequency: 2.0
  static_map: false

bt_navigator:
  ros__parameters:
    use_sim_time: false
    global_frame: map
    robot_base_frame: base_link
    bt_loop_duration: 10
    default_server_timeout: 20

controller_server:
  ros__parameters:
    use_sim_time: false
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    min_y_velocity_threshold: 0.5
    min_theta_velocity_threshold: 0.001
    progress_checker_plugin: "progress_checker"
    goal_checker_plugin: "goal_checker"
    controller_plugins: ["FollowPath"]

FollowPath:
  plugin: "nav2_mppi_controller::MPPIController"
  time_steps: 50
  model_dt: 0.05
  batch_size: 1000
  vx_std: 0.2
  vy_std: 0.05
  wz_std: 0.3
  vx_max: 0.5
  vx_min: -0.5
  vy_max: 0.3
  wz_max: 0.0
  sim_period: 0.05
  speed_scaling: 0.2
  model_plugin: "omni"
```

## Integration with Perception

Navigation2 integrates with perception systems:

- **Costmaps**: Incorporate sensor data for obstacle avoidance
- **Localization**: Use perception for position estimation
- **Dynamic Obstacles**: Handle moving objects in environment

## Lab Exercise

Complete the lab exercise for this week to practice Navigation2:

- Navigate to the lab template: `src/labs/module-3/week-10-template/`
- Follow the instructions in the README.md file
- Configure and test navigation with SMAC planner

## Resources

- [Navigation2 Documentation](https://navigation.ros.org/)
- [SMAC Planner Documentation](https://github.com/ros-planning/navigation2/tree/main/nav2_smac_planner)
- [Navigation2 Tutorials](https://navigation.ros.org/tutorials/index.html)

## Assessment

Complete the quiz for this week to verify your understanding of Navigation2 and SMAC planner.