# Week 13 Lab: Final Capstone Project

## Overview

In this final capstone project, you will integrate all course components into a complete humanoid robot system that demonstrates end-to-end Vision-Language-Action (VLA) task execution.

## Learning Objectives

- Integrate all course components into a complete humanoid robot system
- Demonstrate end-to-end VLA task execution
- Deploy the system to simulation or real hardware
- Evaluate system performance and identify improvement areas

## Prerequisites

- All previous modules completed
- ROS 2 Humble with all required packages
- Access to simulation environment (Gazebo/Isaac Sim) or real hardware
- All VLA models and speech recognition systems configured

## Lab Instructions

### Step 1: System Architecture Design

Design your complete system architecture that integrates all components:

```
[User Voice Command]
        ↓
[Whisper Speech Recognition]
        ↓
[LLM Language Understanding]
        ↓
[Task Planner]
        ↓
[Navigation System (Navigation2 + SMAC)]
        ↓
[Perception System (Isaac ROS)]
        ↓
[VLA Model (OpenVLA/RT-2X/Octo)]
        ↓
[Robot Control]
        ↓
[Execution Feedback]
```

### Step 2: Create Capstone Launch File

Create a comprehensive launch file `capstone_project.launch.py`:

```python
from launch import LaunchDescription
from launch_ros.actions import Node, SetParameter
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # Launch arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='true')
    world = LaunchConfiguration('world', default='small_room.sdf')

    # Set parameters globally
    ld = LaunchDescription([
        SetParameter(name='use_sim_time', value=use_sim_time)
    ])

    # Include Gazebo simulation (if using simulation)
    gazebo_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('gazebo_ros'),
                'launch',
                'gazebo.launch.py'
            ])
        ]),
        launch_arguments={
            'world': world,
            'verbose': 'false'
        }.items()
    )
    ld.add_action(gazebo_launch)

    # Whisper speech recognition node
    whisper_node = Node(
        package='my_capstone_package',
        executable='whisper_node.py',
        name='whisper_node',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    ld.add_action(whisper_node)

    # LLM integration node
    llm_node = Node(
        package='my_capstone_package',
        executable='llm_node.py',
        name='llm_node',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    ld.add_action(llm_node)

    # Voice command processor
    voice_processor = Node(
        package='my_capstone_package',
        executable='voice_command_processor.py',
        name='voice_command_processor',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    ld.add_action(voice_processor)

    # Navigation system (Navigation2)
    nav2_bringup_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('nav2_bringup'),
                'launch',
                'navigation_launch.py'
            ])
        ]),
        launch_arguments={
            'use_sim_time': use_sim_time
        }.items()
    )
    ld.add_action(nav2_bringup_launch)

    # Perception system (Isaac ROS - simplified)
    perception_node = Node(
        package='my_capstone_package',
        executable='perception_node.py',
        name='perception_node',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    ld.add_action(perception_node)

    # VLA integration node
    vla_node = Node(
        package='my_capstone_package',
        executable='vla_integration_node.py',
        name='vla_node',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    ld.add_action(vla_node)

    # Robot controller (simplified)
    robot_controller = Node(
        package='my_capstone_package',
        executable='robot_controller.py',
        name='robot_controller',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    ld.add_action(robot_controller)

    # Capstone evaluation node
    evaluation_node = Node(
        package='my_capstone_package',
        executable='capstone_evaluation.py',
        name='capstone_evaluation',
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )
    ld.add_action(evaluation_node)

    return ld
```

### Step 3: Create Capstone Integration Node

Create the main integration node `capstone_integration.py`:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist, Pose
from sensor_msgs.msg import Image, LaserScan
from nav_msgs.msg import Odometry
from action_msgs.msg import GoalStatus
from rclpy.action import ActionClient
from nav2_msgs.action import NavigateToPose
import json
import time
from enum import Enum

class CapstoneState(Enum):
    IDLE = 1
    LISTENING = 2
    PROCESSING = 3
    NAVIGATING = 4
    PERCEIVING = 5
    ACTING = 6
    COMPLETING = 7

class CapstoneIntegrationNode(Node):
    def __init__(self):
        super().__init__('capstone_integration')

        # State management
        self.state = CapstoneState.IDLE
        self.current_task = None
        self.task_queue = []

        # Subscribers
        self.voice_cmd_sub = self.create_subscription(
            String,
            '/capstone/voice_command',
            self.voice_command_callback,
            10
        )

        self.vision_data_sub = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.vision_callback,
            10
        )

        self.laser_scan_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.laser_scan_callback,
            10
        )

        self.odom_sub = self.create_subscription(
            Odometry,
            '/odom',
            self.odom_callback,
            10
        )

        # Publishers
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.status_pub = self.create_publisher(String, '/capstone/status', 10)
        self.navigation_goal_pub = self.create_publisher(Pose, '/move_base_simple/goal', 10)

        # Action clients
        self.nav_to_pose_client = ActionClient(
            self,
            NavigateToPose,
            'navigate_to_pose'
        )

        # Robot state
        self.robot_pose = None
        self.robot_orientation = None

        # Timers
        self.state_machine_timer = self.create_timer(0.1, self.state_machine)

        self.get_logger().info('Capstone Integration Node Started')

    def voice_command_callback(self, msg):
        """Process voice commands"""
        command = msg.data.lower().strip()
        self.get_logger().info(f'Received voice command: {command}')

        # Add command to task queue
        self.task_queue.append({
            'type': 'voice_command',
            'command': command,
            'timestamp': self.get_clock().now().nanoseconds
        })

        # Update state to processing
        self.state = CapstoneState.PROCESSING

    def vision_callback(self, msg):
        """Process vision data"""
        # Store vision data for processing
        self.last_vision_data = msg

    def laser_scan_callback(self, msg):
        """Process laser scan data"""
        # Store laser scan for obstacle detection
        self.last_laser_scan = msg

    def odom_callback(self, msg):
        """Update robot pose"""
        self.robot_pose = msg.pose.pose.position
        self.robot_orientation = msg.pose.pose.orientation

    def state_machine(self):
        """Main state machine for capstone project"""
        if self.state == CapstoneState.IDLE:
            # Wait for commands
            pass

        elif self.state == CapstoneState.PROCESSING:
            # Process commands from queue
            if self.task_queue:
                task = self.task_queue.pop(0)
                self.process_task(task)

        elif self.state == CapstoneState.NAVIGATING:
            # Handle navigation
            self.handle_navigation()

        elif self.state == CapstoneState.PERCEIVING:
            # Handle perception
            self.handle_perception()

        elif self.state == CapstoneState.ACTING:
            # Handle action execution
            self.handle_action()

        elif self.state == CapstoneState.COMPLETING:
            # Complete task
            self.complete_task()

    def process_task(self, task):
        """Process a single task"""
        command = task['command']

        # Parse command and determine next state
        if any(word in command for word in ["go to", "navigate to", "move to"]):
            self.state = CapstoneState.NAVIGATING
            self.navigate_to_location(command)
        elif any(word in command for word in ["pick", "grasp", "take"]):
            self.state = CapstoneState.PERCEIVING
            self.perceive_object(command)
        elif any(word in command for word in ["stop", "halt"]):
            self.stop_robot()
            self.state = CapstoneState.IDLE
        else:
            # Default: try to understand and execute
            self.execute_general_command(command)

    def navigate_to_location(self, command):
        """Handle navigation commands"""
        # Extract destination from command
        destination = self.extract_location(command)

        if destination:
            self.get_logger().info(f'Navigating to {destination}')

            # In a real implementation, this would:
            # 1. Look up destination coordinates
            # 2. Send navigation goal
            # 3. Monitor progress

            # For demo, just send a simple navigation goal
            goal_pose = Pose()
            goal_pose.position.x = 1.0  # Example coordinates
            goal_pose.position.y = 1.0
            goal_pose.orientation.z = 0.0
            goal_pose.orientation.w = 1.0

            # Send navigation goal
            if self.nav_to_pose_client.wait_for_server(timeout_sec=1.0):
                goal_msg = NavigateToPose.Goal()
                goal_msg.pose.header.frame_id = 'map'
                goal_msg.pose.header.stamp = self.get_clock().now().to_msg()
                goal_msg.pose.pose = goal_pose

                self.nav_to_pose_client.send_goal_async(goal_msg)
                self.get_logger().info('Navigation goal sent')
            else:
                self.get_logger().error('Navigation action server not available')

    def perceive_object(self, command):
        """Handle object perception commands"""
        # Extract object from command
        obj = self.extract_object(command)

        if obj:
            self.get_logger().info(f'Perceiving object: {obj}')
            # In real implementation, use Isaac ROS or other perception systems
            # to detect and locate the object

    def handle_navigation(self):
        """Handle navigation state"""
        # Check navigation status
        # In real implementation, monitor navigation progress
        pass

    def handle_perception(self):
        """Handle perception state"""
        # Process vision and sensor data
        # In real implementation, run perception algorithms
        pass

    def handle_action(self):
        """Handle action execution state"""
        # Execute robot actions
        # In real implementation, send commands to manipulator or other actuators
        pass

    def complete_task(self):
        """Complete current task"""
        self.get_logger().info('Task completed successfully')
        self.state = CapstoneState.IDLE

        # Publish completion status
        status_msg = String()
        status_msg.data = 'task_completed'
        self.status_pub.publish(status_msg)

    def extract_location(self, command):
        """Extract location from command"""
        locations = ["kitchen", "living room", "bedroom", "table", "shelf", "cabinet"]
        for loc in locations:
            if loc in command:
                return loc
        return None

    def extract_object(self, command):
        """Extract object from command"""
        objects = ["cup", "bottle", "box", "ball", "book"]
        for obj in objects:
            if obj in command:
                return obj
        return None

    def execute_general_command(self, command):
        """Execute a general command"""
        # Simple command execution
        if "forward" in command:
            self.move_robot(0.2, 0.0)  # Move forward
        elif "left" in command:
            self.move_robot(0.0, 0.3)  # Turn left
        elif "right" in command:
            self.move_robot(0.0, -0.3)  # Turn right
        elif "stop" in command:
            self.stop_robot()

        self.state = CapstoneState.IDLE

    def move_robot(self, linear_x, angular_z):
        """Move robot with specified velocities"""
        cmd_vel = Twist()
        cmd_vel.linear.x = linear_x
        cmd_vel.angular.z = angular_z
        self.cmd_vel_pub.publish(cmd_vel)

    def stop_robot(self):
        """Stop robot movement"""
        cmd_vel = Twist()
        cmd_vel.linear.x = 0.0
        cmd_vel.angular.z = 0.0
        self.cmd_vel_pub.publish(cmd_vel)

def main(args=None):
    rclpy.init(args=args)

    capstone_node = CapstoneIntegrationNode()

    try:
        rclpy.spin(capstone_node)
    except KeyboardInterrupt:
        pass
    finally:
        capstone_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 4: Create Capstone Evaluation Node

Create an evaluation node `capstone_evaluation.py`:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import PoseStamped
import time
import json

class CapstoneEvaluationNode(Node):
    def __init__(self):
        super().__init__('capstone_evaluation')

        # Subscribers
        self.status_sub = self.create_subscription(
            String,
            '/capstone/status',
            self.status_callback,
            10
        )

        self.task_sub = self.create_subscription(
            String,
            '/capstone/task',
            self.task_callback,
            10
        )

        # Publishers
        self.evaluation_pub = self.create_publisher(
            String,
            '/capstone/evaluation',
            10
        )

        # Evaluation metrics
        self.metrics = {
            'tasks_completed': 0,
            'success_rate': 0.0,
            'average_time': 0.0,
            'total_time': 0.0,
            'failures': 0,
            'recovery_attempts': 0
        }

        self.task_start_time = None
        self.task_history = []

        # Timer for periodic evaluation
        self.evaluation_timer = self.create_timer(5.0, self.periodic_evaluation)

        self.get_logger().info('Capstone Evaluation Node Started')

    def status_callback(self, msg):
        """Process status updates"""
        status = msg.data

        if status == 'task_started':
            self.task_start_time = time.time()
            self.get_logger().info('Task started')

        elif status == 'task_completed':
            if self.task_start_time:
                task_time = time.time() - self.task_start_time
                self.metrics['tasks_completed'] += 1
                self.metrics['total_time'] += task_time

                # Calculate average time
                self.metrics['average_time'] = self.metrics['total_time'] / self.metrics['tasks_completed']

                # Log task completion
                task_record = {
                    'task_id': self.metrics['tasks_completed'],
                    'time': task_time,
                    'completed': True
                }
                self.task_history.append(task_record)

                self.get_logger().info(f'Task completed in {task_time:.2f}s')
                self.task_start_time = None

        elif status == 'task_failed':
            self.metrics['failures'] += 1
            self.get_logger().info('Task failed')

    def task_callback(self, msg):
        """Process task updates"""
        try:
            task_data = json.loads(msg.data)
            self.get_logger().info(f'Task update: {task_data}')
        except json.JSONDecodeError:
            self.get_logger().info(f'Task update: {msg.data}')

    def periodic_evaluation(self):
        """Perform periodic evaluation"""
        if self.metrics['tasks_completed'] > 0:
            self.metrics['success_rate'] = (self.metrics['tasks_completed'] - self.metrics['failures']) / self.metrics['tasks_completed']

        # Create evaluation report
        evaluation_report = {
            'timestamp': time.time(),
            'metrics': self.metrics.copy(),
            'task_history': self.task_history[-5:]  # Last 5 tasks
        }

        # Publish evaluation
        eval_msg = String()
        eval_msg.data = json.dumps(evaluation_report, indent=2)
        self.evaluation_pub.publish(eval_msg)

        # Log summary
        self.get_logger().info(f'Evaluation Summary - Tasks: {self.metrics["tasks_completed"]}, Success Rate: {self.metrics["success_rate"]*100:.1f}%, Avg Time: {self.metrics["average_time"]:.2f}s')

    def get_performance_metrics(self):
        """Get current performance metrics"""
        return self.metrics

def main(args=None):
    rclpy.init(args=args)

    evaluation_node = CapstoneEvaluationNode()

    try:
        rclpy.spin(evaluation_node)
    except KeyboardInterrupt:
        pass
    finally:
        # Print final evaluation
        final_metrics = evaluation_node.get_performance_metrics()
        evaluation_node.get_logger().info('=== FINAL EVALUATION ===')
        for key, value in final_metrics.items():
            evaluation_node.get_logger().info(f'{key}: {value}')

        evaluation_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 5: Create Capstone Demo Script

Create a demonstration script `capstone_demo.py`:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import time

class CapstoneDemoNode(Node):
    def __init__(self):
        super().__init__('capstone_demo')

        self.voice_cmd_publisher = self.create_publisher(
            String,
            '/capstone/voice_command',
            10
        )

        self.demo_commands = [
            "move forward to the table",
            "turn left",
            "go to the kitchen",
            "pick up the red cup",
            "place the cup on the shelf"
        ]

        self.demo_timer = self.create_timer(10.0, self.run_demo_step)
        self.current_step = 0

        self.get_logger().info('Capstone Demo Node Started')

    def run_demo_step(self):
        """Run one step of the demo"""
        if self.current_step < len(self.demo_commands):
            command = self.demo_commands[self.current_step]
            self.get_logger().info(f'Sending demo command: {command}')

            cmd_msg = String()
            cmd_msg.data = command
            self.voice_cmd_publisher.publish(cmd_msg)

            self.current_step += 1
        else:
            self.get_logger().info('Demo completed')
            self.demo_timer.cancel()

def main(args=None):
    rclpy.init(args=args)

    demo_node = CapstoneDemoNode()

    try:
        rclpy.spin(demo_node)
    except KeyboardInterrupt:
        pass
    finally:
        demo_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 6: Test the Complete System

Test your integrated capstone system:

```bash
# Terminal 1: Launch the complete capstone system
ros2 launch my_capstone_package capstone_project.launch.py

# Terminal 2: Run the demo
ros2 run my_capstone_package capstone_demo.py

# Terminal 3: Monitor evaluation
ros2 topic echo /capstone/evaluation

# Terminal 4: Send manual commands
ros2 topic pub /capstone/voice_command std_msgs/String "data: 'move forward'"

# Terminal 5: Monitor robot status
ros2 topic echo /capstone/status
```

### Step 7: Create Final Report Template

Create a template for your final project report `final_report_template.md`:

```markdown
# Capstone Project Final Report: Physical AI & Humanoid Robotics

## Project Overview
- **Project Title**: [Your project title]
- **Team Members**: [Names]
- **Date**: [Date]
- **Duration**: 13 weeks

## System Architecture
[Include a diagram of your system architecture showing all integrated components]

## Implementation Details
### Speech Recognition
- Whisper model configuration
- Audio processing pipeline
- Performance metrics

### Language Understanding
- LLM integration approach
- Command parsing methodology
- Natural language processing techniques

### Navigation System
- Navigation2 configuration
- SMAC planner settings
- Path planning performance

### Perception System
- Isaac ROS Gems used
- Sensor fusion approach
- Object detection accuracy

### VLA Integration
- VLA model selection and configuration
- Vision-language-action pipeline
- Task execution performance

### Robot Control
- Control architecture
- Safety mechanisms
- Performance optimization

## Results and Evaluation
### Quantitative Results
- Task completion rate: [X]%
- Average task completion time: [X] seconds
- Navigation success rate: [X]%
- Speech recognition accuracy: [X]%

### Qualitative Results
- System robustness
- User experience
- Error recovery capabilities

## Challenges and Solutions
[Document key challenges faced and how they were addressed]

## Future Improvements
[Suggestions for system improvements]

## Conclusion
[Summary of project achievements and learning outcomes]
```

## Success Criteria

- [ ] Integrate all course components into a working system
- [ ] Demonstrate end-to-end VLA task execution
- [ ] Evaluate system performance quantitatively
- [ ] Document system architecture and implementation
- [ ] Show improvement over individual components

## Troubleshooting

- If components don't integrate, check message types and topic names
- For performance issues, optimize individual components first
- If real-time performance is poor, consider component parallelization
- For complex task failures, implement better error recovery

## Additional Resources

- [Course Integration Guide](../../../docs/integration-guide.md)
- [Performance Evaluation Tools](../../../docs/evaluation-tools.md)
- [Deployment Documentation](../../../docs/deployment.md)
```

## Success Criteria

- [ ] Integrate all course components into a complete humanoid robot system
- [ ] Demonstrate end-to-end VLA task execution
- [ ] Deploy the system to simulation or real hardware
- [ ] Evaluate system performance and identify improvement areas

## Troubleshooting

- If the system is too complex, start with a simplified version
- For integration issues, test components individually first
- If performance is poor, optimize critical path components
- For deployment issues, ensure all dependencies are properly configured

## Additional Resources

- [Complete Course Integration Guide](../../../docs/integration-guide.md)
- [Performance Evaluation Tools](../../../docs/evaluation-tools.md)
- [Deployment Documentation](../../../docs/deployment.md)