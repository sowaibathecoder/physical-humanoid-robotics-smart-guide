# Week 10 Lab: Navigation2 and SMAC Planner

## Overview

In this lab, you will configure Navigation2 for robot navigation and implement path planning with the SMAC (Search with Motion Aggregation on Costmap) planner.

## Learning Objectives

- Configure Navigation2 for robot navigation
- Implement path planning with SMAC planner
- Integrate navigation with perception systems
- Optimize navigation for dynamic environments

## Prerequisites

- ROS 2 Humble installed
- Navigation2 packages installed
- Robot model with proper URDF
- Costmap and localization systems

## Lab Instructions

### Step 1: Install Navigation2

Install Navigation2 packages:

```bash
sudo apt update
sudo apt install ros-humble-navigation2 ros-humble-nav2-bringup ros-humble-nav2-gazebo-spawner ros-humble-nav2-common ros-humble-nav2-dwb-controller ros-humble-nav2-gradient-path ros-humble-nav2-rviz-plugins ros-humble-nav2-behaviors ros-humble-nav2-lifecycle-manager ros-humble-nav2-planners ros-humble-nav2-simulator ros-humble-nav2-zed-ros-interfaces
```

### Step 2: Create Navigation Configuration

Create a navigation configuration file `nav2_params.yaml`:

```yaml
amcl:
  ros__parameters:
    use_sim_time: True
    alpha1: 0.2
    alpha2: 0.2
    alpha3: 0.2
    alpha4: 0.2
    alpha5: 0.2
    base_frame_id: "base_footprint"
    beam_skip_distance: 0.5
    beam_skip_error_threshold: 0.9
    beam_skip_threshold: 0.3
    do_beamskip: false
    global_frame_id: "map"
    lambda_short: 0.1
    laser_likelihood_max_dist: 2.0
    laser_max_range: 100.0
    laser_min_range: -1.0
    laser_model_type: "likelihood_field"
    max_beams: 60
    max_particles: 2000
    min_particles: 500
    odom_frame_id: "odom"
    pf_err: 0.05
    pf_z: 0.99
    recovery_alpha_fast: 0.0
    recovery_alpha_slow: 0.0
    resample_interval: 1
    robot_model_type: "nav2_amcl::DifferentialMotionModel"
    save_pose_rate: 0.5
    sigma_hit: 0.2
    tf_broadcast: true
    transform_tolerance: 1.0
    update_min_a: 0.2
    update_min_d: 0.25
    z_hit: 0.5
    z_max: 0.05
    z_rand: 0.5
    z_short: 0.05
    scan_topic: scan

amcl_map_client:
  ros__parameters:
    use_sim_time: True

amcl_rclcpp_node:
  ros__parameters:
    use_sim_time: True

bt_navigator:
  ros__parameters:
    use_sim_time: True
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odom
    bt_loop_duration: 10
    default_server_timeout: 20
    enable_groot_monitoring: True
    groot_zmq_publisher_port: 1666
    groot_zmq_server_port: 1667
    interruptable_controllers: True
    controller_frequency: 10.0
    progress_checker_plugin: "progress_checker"
    goal_checker_plugin: "goal_checker"
    controller_plugins: ["FollowPath"]

    # Progress checker parameters
    progress_checker:
      plugin: "nav2_controller::SimpleProgressChecker"
      required_movement_radius: 0.5
      movement_time_allowance: 10.0

    # Goal checker parameters
    goal_checker:
      plugin: "nav2_controller::SimpleGoalChecker"
      xy_goal_tolerance: 0.25
      yaw_goal_tolerance: 0.25
      stateful: True

    # Behavior tree configuration
    bt_navigator_nodes:
      - name: "navigate_to_pose_w_replanning_and_recovery"
        type: "nav2_behavior_tree_nodes::PipelineSequence"
        config:
          nodes:
            - name: "goal_checker"
              type: "nav2_behavior_tree_nodes::GoalChecker"
            - name: "compute_path_to_pose"
              type: "nav2_behavior_tree_nodes::ComputePathToPose"
            - name: "follow_path"
              type: "nav2_behavior_tree_nodes::FollowPath"
            - name: "spin"
              type: "nav2_behavior_tree_nodes::Spin"
            - name: "backup"
              type: "nav2_behavior_tree_nodes::Backup"
            - name: "wait"
              type: "nav2_behavior_tree_nodes::Wait"
            - name: "clear_costmap"
              type: "nav2_behavior_tree_nodes::ClearCostmapService"
            - name: "unstuck_recovery"
              type: "nav2_behavior_tree_nodes::RateController"
              config:
                node_name: "unstuck_recovery_node"
                cycles: 1
                node:
                  type: "nav2_behavior_tree_nodes::RecoveryNode"
                  config:
                    node_name: "unstuck_recovery"
                    recovery_plugins: ["spin", "backup"]
                    server_name: "NavigateWithReplanning"
      - name: "follow_path"
        type: "nav2_behavior_tree_nodes::RecoveryNode"
        config:
          node_name: "FollowPath"
          recovery_plugins: ["spin", "backup"]
          server_name: "FollowPath"

controller_server:
  ros__parameters:
    use_sim_time: True
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    min_y_velocity_threshold: 0.5
    min_theta_velocity_threshold: 0.001
    progress_checker_plugin: "progress_checker"
    goal_checker_plugin: "goal_checker"
    controller_plugins: ["FollowPath"]

    # DWB Controller
    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      debug_trajectory_details: True
      min_vel_x: 0.0
      min_vel_y: 0.0
      max_vel_x: 0.5
      max_vel_y: 0.0
      max_vel_theta: 1.0
      min_speed_xy: 0.0
      max_speed_xy: 0.5
      min_speed_theta: 0.0
      acc_lim_x: 2.5
      acc_lim_y: 0.0
      acc_lim_theta: 3.2
      decel_lim_x: -2.5
      decel_lim_y: 0.0
      decel_lim_theta: -3.2
      vx_samples: 20
      vy_samples: 5
      vtheta_samples: 20
      sim_time: 1.7
      linear_granularity: 0.05
      angular_granularity: 0.025
      transform_tolerance: 0.2
      xy_goal_tolerance: 0.25
      yaw_goal_tolerance: 0.25
      stateful: True
      restore_defaults: False
      scaling_speed: 0.25
      scaling_factor: 0.2
      oscillation_reset_dist: 0.05
      oscillation_magic_theta: 0.1745
      oscillation_filter_duration: 1.0
      goal_check_tolerance: 0.25
      goal_check_transform_tolerance: 0.25
      use_differential_constraints: False
      allowbackwards: False
      publish_cost_grid_pc: False

    progress_checker:
      plugin: "nav2_controller::SimpleProgressChecker"
      required_movement_radius: 0.5
      movement_time_allowance: 10.0

    goal_checker:
      plugin: "nav2_controller::SimpleGoalChecker"
      xy_goal_tolerance: 0.25
      yaw_goal_tolerance: 0.25
      stateful: True

local_costmap:
  local_costmap:
    ros__parameters:
      update_frequency: 5.0
      publish_frequency: 2.0
      global_frame: odom
      robot_base_frame: base_link
      use_sim_time: True
      rolling_window: true
      width: 3
      height: 3
      resolution: 0.05
      robot_radius: 0.22
      plugins: ["voxel_layer", "inflation_layer"]
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55
      voxel_layer:
        plugin: "nav2_costmap_2d::VoxelLayer"
        enabled: True
        publish_voxel_map: True
        origin_z: 0.0
        z_resolution: 0.05
        z_voxels: 16
        max_obstacle_height: 2.0
        mark_threshold: 0
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: True
          marking: True
          data_type: "LaserScan"
          raytrace_max_range: 3.0
          raytrace_min_range: 0.0
          obstacle_max_range: 2.5
          obstacle_min_range: 0.0
      always_send_full_costmap: True
  local_costmap_client:
    ros__parameters:
      use_sim_time: True
  local_costmap_rclcpp_node:
    ros__parameters:
      use_sim_time: True

global_costmap:
  global_costmap:
    ros__parameters:
      update_frequency: 1.0
      publish_frequency: 1.0
      global_frame: map
      robot_base_frame: base_link
      use_sim_time: True
      robot_radius: 0.22
      resolution: 0.05
      track_unknown_space: true
      plugins: ["static_layer", "obstacle_layer", "inflation_layer"]
      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
        enabled: True
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: True
          marking: True
          data_type: "LaserScan"
          raytrace_max_range: 3.0
          raytrace_min_range: 0.0
          obstacle_max_range: 2.5
          obstacle_min_range: 0.0
      static_layer:
        plugin: "nav2_costmap_2d::StaticLayer"
        map_subscribe_transient_local: True
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55
      always_send_full_costmap: True
  global_costmap_client:
    ros__parameters:
      use_sim_time: True
  global_costmap_rclcpp_node:
    ros__parameters:
      use_sim_time: True

smac_planner:
  ros__parameters:
    use_sim_time: True
    tolerance: 0.5
    downsample_costmap: false
    downsampling_factor: 1
    allow_unknown: false
    max_iterations: 1000000
    max_on_approach_iterations: 1000
    max_planning_time: 5.0
    motion_model_for_search: "MOBILE_ROBOT_4DOF"
    cost_travel_multiplier: 2.0
    cache_obstacle_heuristic: true
    objective_function: "SMOOTHER_XY"
    smoother:
      max_iterations: 1000
      convergence_tol: 1e-6
      use_cost_travel_time: false
      time_penalty: 1.0
      smoothness penalty: 1.0
      curvature penalty: 1.0
      smoothness_derivative_order: 2
      use_first_order_derivative: false
    graph_search: "SMAC_LATTICE"

waypoint_follower:
  ros__parameters:
    use_sim_time: True
    loop_rate: 20
    stop_on_failure: false
    waypoint_task_executor_plugin: "wait_at_waypoint"
    wait_at_waypoint:
      plugin: "nav2_waypoint_follower::WaitAtWaypoint"
      enabled: True
      waypoint_pause_duration: 200
```

### Step 3: Create SMAC-Specific Configuration

Create a specific configuration for SMAC planner `smac_config.yaml`:

```yaml
planner_server:
  ros__parameters:
    use_sim_time: True
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_smac_planner::SMACPlanner"
      tolerance: 0.125                    # tolerance for planning if unable to reach exact position, in meters
      downsample_costmap: false           # whether or not to downsample the map
      downsampling_factor: 1              # multiplier for the resolution of the costmap (e.g. 2 = 4x more sparse costmap)
      allow_unknown: false                # allow traveling in unknown space
      max_iterations: 1000000             # maximum total iterations to search for before failing (in case unreachable), set to -1 to disable
      max_on_approach_iterations: 1000    # maximum number of iterations after finding solution to continue to optimize on approach, set to -1 to disable
      max_planning_time: 5.0              # max time in seconds for planner to plan, smooth, and generate path
      motion_model_for_search: "DUBIN"    # Supports DUBIN, REEDS_SHEPP, and DUBIN_3D
      cost_travel_multiplier: 2.0         # How much to inflate the cost for moving through the space, for example cost of traversing a diagonal vs horizontal/vertical
      cache_obstacle_heuristic: true      # whether to cache the obstacle value heuristic (at the cost of memory footprint)
      objective_function: "SLOPE"         # The objective function to optimize with. SLOPE, SMOOTHER_XY, SMOOTHER_XY_THETA, SMOOTHER_XY_THETA_CURVATURE
      smoother:
        max_iterations: 1000              # maximum number of iterations for smoothing to attempt
        convergence_tol: 1e-6             # convergence tolerance for smoothing to determine if further iteration is needed
        use_cost_travel_time: false       # whether to use the cost of travel time in the smoothing objective function
        time_penalty: 1.0                 # time penalty to apply for trajectory duration in the objective function
        smoothness_penalty: 1.0           # smoothness penalty to apply in the objective function
        curvature_penalty: 1.0            # curvature penalty to apply in the objective function
        smoothness_derivative_order: 2    # smoothness derivative order for objective function
        use_first_order_derivative: false # whether to use first order or second order derivative for smoothing
      graph_search: "SMAC_LATTICE"        # The graph search algorithm to use. SMAC_LATTICE, SMAC_A_STAR
```

### Step 4: Create Navigation Launch File

Create a launch file `navigation.launch.py`:

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, RegisterEventHandler
from launch.conditions import IfCondition
from launch.event_handlers import OnProcessExit
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # Launch arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='true')
    params_file = LaunchConfiguration('params_file', default=PathJoinSubstitution([
        FindPackageShare('my_robot_navigation'),
        'config',
        'nav2_params.yaml'
    ]))
    autostart = LaunchConfiguration('autostart', default='true')
    use_composition = LaunchConfiguration('use_composition', default='True')
    container_name = LaunchConfiguration('container_name', default='nav2_container')

    # Lifecycle manager
    lifecycle_manager = Node(
        package='nav2_lifecycle_manager',
        executable='lifecycle_manager',
        name='lifecycle_manager',
        output='screen',
        parameters=[{'use_sim_time': use_sim_time},
                    {'autostart': autostart},
                    {'node_names': ['map_server',
                                   'planner_server',
                                   'controller_server',
                                   'recoveries_server',
                                   'bt_navigator',
                                   'waypoint_follower']}]
    )

    # Planner server (using SMAC)
    planner_server = Node(
        package='nav2_planner',
        executable='planner_server',
        name='planner_server',
        output='screen',
        parameters=[params_file, {'use_sim_time': use_sim_time}],
        condition=IfCondition(use_composition),
    )

    # Controller server
    controller_server = Node(
        package='nav2_controller',
        executable='controller_server',
        name='controller_server',
        output='screen',
        parameters=[params_file, {'use_sim_time': use_sim_time}],
        condition=IfCondition(use_composition),
    )

    # Local costmap
    local_costmap = Node(
        package='nav2_costmap_2d',
        executable='costmap_2d_node',
        name='local_costmap',
        output='screen',
        parameters=[params_file, {'use_sim_time': use_sim_time}],
        condition=IfCondition(use_composition),
    )

    # Global costmap
    global_costmap = Node(
        package='nav2_costmap_2d',
        executable='costmap_2d_node',
        name='global_costmap',
        output='screen',
        parameters=[params_file, {'use_sim_time': use_sim_time}],
        condition=IfCondition(use_composition),
    )

    # Behavior tree navigator
    bt_navigator = Node(
        package='nav2_bt_navigator',
        executable='bt_navigator',
        name='bt_navigator',
        output='screen',
        parameters=[params_file, {'use_sim_time': use_sim_time}],
        condition=IfCondition(use_composition),
    )

    # Waypoint follower
    waypoint_follower = Node(
        package='nav2_waypoint_follower',
        executable='waypoint_follower',
        name='waypoint_follower',
        output='screen',
        parameters=[params_file, {'use_sim_time': use_sim_time}],
        condition=IfCondition(use_composition),
    )

    return LaunchDescription([
        lifecycle_manager,
        planner_server,
        controller_server,
        local_costmap,
        global_costmap,
        bt_navigator,
        waypoint_follower
    ])
```

### Step 5: Create Navigation Test Node

Create a test node `navigation_test.py` to send navigation goals:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped
from nav2_msgs.action import NavigateToPose

class NavigationTest(Node):
    def __init__(self):
        super().__init__('navigation_test')

        # Create action client for navigation
        self.nav_to_pose_client = ActionClient(
            self,
            NavigateToPose,
            'navigate_to_pose'
        )

        # Wait for action server to be available
        self.nav_to_pose_client.wait_for_server()

        self.get_logger().info('Navigation Test Node Ready')

    def send_goal(self, x, y, theta=0.0):
        """Send a navigation goal to the action server"""
        goal_msg = NavigateToPose.Goal()

        # Set the goal pose
        goal_msg.pose.header.frame_id = 'map'
        goal_msg.pose.header.stamp = self.get_clock().now().to_msg()
        goal_msg.pose.pose.position.x = x
        goal_msg.pose.pose.position.y = y
        goal_msg.pose.pose.position.z = 0.0

        # Convert theta (yaw) to quaternion
        import math
        from tf_transformations import quaternion_from_euler
        quat = quaternion_from_euler(0, 0, theta)
        goal_msg.pose.pose.orientation.x = quat[0]
        goal_msg.pose.pose.orientation.y = quat[1]
        goal_msg.pose.pose.orientation.z = quat[2]
        goal_msg.pose.pose.orientation.w = quat[3]

        # Send the goal
        self.get_logger().info(f'Sending navigation goal to x={x}, y={y}, theta={theta}')
        send_goal_future = self.nav_to_pose_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback
        )

        # Set result callback
        send_goal_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        """Handle the goal response"""
        goal_handle = future.result()
        if not goal_handle.accepted:
            self.get_logger().info('Goal rejected')
            return

        self.get_logger().info('Goal accepted')
        get_result_future = goal_handle.get_result_async()
        get_result_future.add_done_callback(self.get_result_callback)

    def get_result_callback(self, future):
        """Handle the result of the navigation"""
        result = future.result().result
        self.get_logger().info(f'Navigation result: {result}')

    def feedback_callback(self, feedback_msg):
        """Handle feedback during navigation"""
        feedback = feedback_msg.feedback
        # Log feedback (position, remaining distance, etc.)
        self.get_logger().info(f'Navigation feedback: {feedback.current_pose}')


def main(args=None):
    rclpy.init(args=args)

    nav_test = NavigationTest()

    # Send a test goal (example coordinates)
    nav_test.send_goal(1.0, 1.0, 0.0)  # Go to x=1.0, y=1.0, theta=0

    try:
        rclpy.spin(nav_test)
    except KeyboardInterrupt:
        pass
    finally:
        nav_test.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 6: Create Map Server Configuration

Create a map server launch file `map_server.launch.py`:

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from launch.substitutions import PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # Launch arguments
    map_yaml_file = LaunchConfiguration('map', default=PathJoinSubstitution([
        FindPackageShare('my_robot_navigation'),
        'maps',
        'my_map.yaml'
    ]))

    # Map server node
    map_server = Node(
        package='nav2_map_server',
        executable='map_server',
        name='map_server',
        parameters=[{'yaml_filename': map_yaml_file},
                    {'topic_name': 'map'},
                    {'frame_id': 'map'},
                    {'output': 'screen'},
                    {'use_sim_time': True}]
    )

    # Lifecycle manager for map server
    lifecycle_manager = Node(
        package='nav2_lifecycle_manager',
        executable='lifecycle_manager',
        name='lifecycle_manager_map',
        parameters=[{'use_sim_time': True},
                    {'node_names': ['map_server']}]
    )

    return LaunchDescription([
        DeclareLaunchArgument(
            'map',
            default_value=map_yaml_file,
            description='Full path to map file to load'),
        map_server,
        lifecycle_manager
    ])
```

### Step 7: Test Navigation System

Test your Navigation2 setup with SMAC planner:

```bash
# Terminal 1: Launch the navigation system
ros2 launch my_robot_navigation navigation.launch.py

# Terminal 2: Send navigation goals
ros2 run my_robot_navigation navigation_test.py

# Terminal 3: Visualize in RViz
ros2 run rviz2 rviz2 -d /path/to/navigation_config.rviz
```

## Success Criteria

- [ ] Successfully configure Navigation2 with SMAC planner
- [ ] Send and execute navigation goals
- [ ] Verify path planning and execution
- [ ] Integrate navigation with costmap and localization

## Troubleshooting

- If navigation fails, check that costmaps are properly configured
- For SMAC-specific issues, verify motion model and search algorithm settings
- If goals are rejected, ensure proper frame IDs and coordinate transforms
- Use `ros2 lifecycle list` to check lifecycle node states

## Additional Resources

- [Navigation2 Documentation](https://navigation.ros.org/)
- [SMAC Planner Documentation](https://github.com/ros-planning/navigation2/tree/main/nav2_smac_planner)
- [Navigation2 Tutorials](https://navigation.ros.org/tutorials/index.html)