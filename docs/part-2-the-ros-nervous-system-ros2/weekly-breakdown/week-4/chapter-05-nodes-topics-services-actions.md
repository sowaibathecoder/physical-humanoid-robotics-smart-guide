---
id: chapter-05-nodes-topics-services-actions
title: "Chapter 05: Nodes, Topics, Services, Actions"
sidebar_position: 2
description: "Understanding ROS 2 communication patterns including topics, services, and actions for robotic systems"
---

# Chapter 05: Nodes, Topics, Services, Actions

## Learning Objectives
After completing this chapter, students will be able to:
1. Implement ROS 2 nodes with proper lifecycle management and resource handling
2. Design efficient topic-based communication patterns for real-time robotic systems
3. Create and use services for synchronous request/response interactions
4. Implement actions for long-running tasks with feedback and goal management
5. Apply appropriate communication patterns for different humanoid robotics scenarios

## Conceptual Explanation
The four fundamental communication patterns in ROS 2 form the backbone of robotic application development. Each pattern serves specific use cases and provides different guarantees about message delivery, timing, and interaction patterns.

**Nodes** are the fundamental building blocks of ROS 2 applications - they are processes that perform computation and communicate with other nodes. Each node can contain publishers, subscribers, service clients/servers, action clients/servers, and other ROS entities.

**Topics** implement a publish-subscribe communication model where publishers send messages to named topics and subscribers receive messages from those topics. This is ideal for continuous data streams like sensor readings or state updates.

**Services** provide synchronous request-response communication where a client sends a request and waits for a response. This is suitable for operations that have a clear beginning and end.

**Actions** are designed for long-running tasks that may take seconds, minutes, or even hours to complete. They provide feedback during execution and allow for goal cancellation.

For humanoid robotics, these patterns work together to create responsive, reliable systems. For example, joint position sensors publish to topics, inverse kinematics solvers offer services, and walking pattern generators implement actions.

## Technical Content
### Node Implementation Patterns
```python
import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy
from rclpy.lifecycle import LifecycleNode, TransitionCallbackReturn
from rclpy.executors import MultiThreadedExecutor
import threading

class HumanoidSensorNode(Node):
    def __init__(self):
        super().__init__('humanoid_sensor_node')

        # Define QoS profiles for different data types
        sensor_qos = QoSProfile(
            depth=5,
            reliability=ReliabilityPolicy.BEST_EFFORT,
            history=HistoryPolicy.KEEP_LAST
        )

        # Publishers for different sensor types
        self.imu_pub = self.create_publisher(sensor_msgs.msg.Imu, 'imu/data_raw', sensor_qos)
        self.joint_pub = self.create_publisher(sensor_msgs.msg.JointState, 'joint_states', 10)
        self.odom_pub = self.create_publisher(nav_msgs.msg.Odometry, 'odom', 10)

        # Timer for sensor reading loop
        self.sensor_timer = self.create_timer(0.01, self.sensor_callback)  # 100Hz

        # Parameters with callbacks
        self.declare_parameter('sensor_rate', 100)
        self.add_on_set_parameters_callback(self.parameter_callback)

        self.get_logger().info('Humanoid Sensor Node initialized')

    def sensor_callback(self):
        # Read sensor data and publish
        joint_msg = sensor_msgs.msg.JointState()
        # ... populate joint_msg with actual sensor data
        self.joint_pub.publish(joint_msg)

    def parameter_callback(self, params):
        for param in params:
            if param.name == 'sensor_rate':
                new_rate = param.value
                self.sensor_timer.timer_period_ns = int(1e9 / new_rate)
        return SetParametersResult(successful=True)

class LifecycleHumanoidNode(LifecycleNode):
    def __init__(self):
        super().__init__('lifecycle_humanoid_node')

    def on_configure(self, state):
        self.get_logger().info('Configuring')
        # Initialize resources but don't activate
        return TransitionCallbackReturn.SUCCESS

    def on_activate(self, state):
        self.get_logger().info('Activating')
        # Activate publishers/subscribers
        return TransitionCallbackReturn.SUCCESS

    def on_deactivate(self, state):
        self.get_logger().info('Deactivating')
        # Deactivate but keep resources
        return TransitionCallbackReturn.SUCCESS

    def on_cleanup(self, state):
        self.get_logger().info('Cleaning up')
        # Clean up resources
        return TransitionCallbackReturn.SUCCESS
```

### Topic Communication with QoS
```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy, HistoryPolicy, LivelinessPolicy

# Critical control commands
control_qos = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.RELIABLE,
    durability=DurabilityPolicy.VOLATILE,
    history=HistoryPolicy.KEEP_LAST,
    deadline=rclpy.duration.Duration(seconds=0.1),  # Must be delivered within 100ms
    lifespan=rclpy.duration.Duration(seconds=1.0)   # Keep for 1 second
)

# High-frequency sensor data
sensor_qos = QoSProfile(
    depth=1,
    reliability=ReliabilityPolicy.BEST_EFFORT,
    durability=DurabilityPolicy.VOLATILE,
    history=HistoryPolicy.KEEP_LAST
)

class JointControlNode(Node):
    def __init__(self):
        super().__init__('joint_control_node')

        # Publishers with different QoS for different data types
        self.joint_cmd_pub = self.create_publisher(
            trajectory_msgs.msg.JointTrajectory,
            'joint_trajectory',
            control_qos
        )

        self.joint_state_pub = self.create_publisher(
            sensor_msgs.msg.JointState,
            'joint_states',
            sensor_qos
        )

        # Subscribers
        self.joint_cmd_sub = self.create_subscription(
            trajectory_msgs.msg.JointTrajectory,
            'joint_trajectory',
            self.joint_cmd_callback,
            control_qos
        )

        # Synchronized subscription for multiple topics
        from rclpy.time import Time
        from message_filters import ApproximateTimeSynchronizer, Subscriber

        # Timer for control loop
        self.control_timer = self.create_timer(0.005, self.control_loop)  # 200Hz

    def joint_cmd_callback(self, msg):
        # Process joint trajectory command
        self.get_logger().debug(f'Received trajectory with {len(msg.points)} points')

    def control_loop(self):
        # Implement control algorithm
        pass
```

### Service Implementation
```python
from example_interfaces.srv import SetBool, Trigger
from std_srvs.srv import Empty
import threading
from rclpy.qos import qos_profile_services_default

class RobotControlService(Node):
    def __init__(self):
        super().__init__('robot_control_service')

        # Different types of services
        self.enable_service = self.create_service(
            SetBool,
            'enable_robot',
            self.enable_robot_callback,
            qos_profile=qos_profile_services_default
        )

        self.calibrate_service = self.create_service(
            Trigger,
            'calibrate_sensors',
            self.calibrate_callback
        )

        self.emergency_stop_service = self.create_service(
            Empty,
            'emergency_stop',
            self.emergency_stop_callback
        )

    def enable_robot_callback(self, request, response):
        """Enable/disable robot motion"""
        try:
            if request.data:
                self.get_logger().info('Enabling robot')
                # Enable robot systems
                response.success = True
                response.message = 'Robot enabled successfully'
            else:
                self.get_logger().info('Disabling robot')
                # Disable robot systems safely
                response.success = True
                response.message = 'Robot disabled successfully'
        except Exception as e:
            response.success = False
            response.message = f'Error: {str(e)}'

        return response

    def calibrate_callback(self, request, response):
        """Calibrate sensors"""
        self.get_logger().info('Starting sensor calibration...')

        # Simulate calibration process
        # In real implementation, this might take seconds
        import time
        time.sleep(2)

        response.success = True
        response.message = 'Calibration completed successfully'
        self.get_logger().info('Calibration completed')

        return response

    def emergency_stop_callback(self, request, response):
        """Emergency stop - must be fast"""
        self.get_logger().warn('EMERGENCY STOP TRIGGERED!')
        # Immediate stop of all motion
        # This should be the highest priority
        return response
```

### Action Implementation
```python
from rclpy.action import ActionServer, ActionClient
from rclpy.action.server import CancelResponse, GoalResponse
from geometry_msgs.msg import PoseStamped
from nav_msgs.action import NavigateToPose
from control_msgs.action import FollowJointTrajectory
import threading
import time

class NavigationActionServer(Node):
    def __init__(self):
        super().__init__('navigation_action_server')

        # Create action server
        self._action_server = ActionServer(
            self,
            NavigateToPose,
            'navigate_to_pose',
            execute_callback=self.execute_callback,
            goal_callback=self.goal_callback,
            cancel_callback=self.cancel_callback
        )

        # Current navigation state
        self.current_goal = None
        self.is_navigating = False

    def goal_callback(self, goal_request):
        """Accept or reject navigation goal"""
        self.get_logger().info(f'Received navigation goal: {goal_request.pose}')

        # Check if goal is valid
        if self.is_valid_goal(goal_request.pose):
            return GoalResponse.ACCEPT
        else:
            return GoalResponse.REJECT

    def cancel_callback(self, goal_handle):
        """Accept or reject cancel request"""
        self.get_logger().info('Received cancel request')
        return CancelResponse.ACCEPT

    def is_valid_goal(self, pose):
        """Check if navigation goal is valid"""
        # Implement validation logic
        return True

    def execute_callback(self, goal_handle):
        """Execute navigation goal"""
        self.get_logger().info('Executing navigation goal...')

        feedback_msg = NavigateToPose.Feedback()
        result = NavigateToPose.Result()

        target_pose = goal_handle.request.pose
        current_pose = self.get_current_pose()

        # Navigation loop
        while not self.is_at_goal(current_pose, target_pose) and not goal_handle.is_cancel_requested:
            # Calculate feedback
            distance_remaining = self.calculate_distance(current_pose, target_pose)
            feedback_msg.distance_remaining = distance_remaining

            # Publish feedback
            goal_handle.publish_feedback(feedback_msg)

            # Move robot towards goal
            self.move_towards_pose(target_pose)

            # Update current pose
            current_pose = self.get_current_pose()

            # Sleep to allow other callbacks to run
            time.sleep(0.1)

        if goal_handle.is_cancel_requested:
            goal_handle.canceled()
            result.result = False
            self.get_logger().info('Navigation goal canceled')
        else:
            goal_handle.succeed()
            result.result = True
            self.get_logger().info('Navigation goal succeeded')

        return result

    def get_current_pose(self):
        """Get current robot pose"""
        # Implementation would get current pose from localization system
        pass

    def is_at_goal(self, current_pose, target_pose):
        """Check if robot is at goal"""
        # Implementation would check if close enough to goal
        pass

    def calculate_distance(self, pose1, pose2):
        """Calculate distance between two poses"""
        # Implementation would calculate distance
        pass

    def move_towards_pose(self, target_pose):
        """Move robot towards target pose"""
        # Implementation would send commands to move robot
        pass
```

## Practical Examples
### Example 1: Complete Node with All Communication Patterns
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from rclpy.action import ActionClient
from rclpy.qos import QoSProfile, ReliabilityPolicy

from std_msgs.msg import Float32
from sensor_msgs.msg import JointState
from geometry_msgs.msg import Twist
from example_interfaces.srv import SetBool
from control_msgs.action import FollowJointTrajectory
from trajectory_msgs.msg import JointTrajectory

class HumanoidControllerNode(Node):
    def __init__(self):
        super().__init__('humanoid_controller')

        # Publishers
        self.cmd_vel_pub = self.create_publisher(Twist, 'cmd_vel', 10)
        self.joint_cmd_pub = self.create_publisher(JointTrajectory, 'joint_trajectory', 10)

        # Subscribers
        self.joint_state_sub = self.create_subscription(
            JointState, 'joint_states', self.joint_state_callback, 10)

        # Service server
        self.enable_service = self.create_service(
            SetBool, 'enable_controller', self.enable_callback)

        # Action client
        self.trajectory_client = ActionClient(
            self, FollowJointTrajectory, 'follow_joint_trajectory')

        # Parameters
        self.declare_parameter('control_frequency', 200)
        self.control_freq = self.get_parameter('control_frequency').value

        # Control timer
        self.control_timer = self.create_timer(
            1.0/self.control_freq, self.control_loop)

        self.enabled = False
        self.get_logger().info('Humanoid Controller initialized')

    def joint_state_callback(self, msg):
        """Handle joint state updates"""
        self.get_logger().debug(f'Received joint states: {len(msg.name)} joints')

    def enable_callback(self, request, response):
        """Handle enable/disable service requests"""
        self.enabled = request.data
        response.success = True
        response.message = f'Controller {"enabled" if self.enabled else "disabled"}'
        self.get_logger().info(response.message)
        return response

    def control_loop(self):
        """Main control loop"""
        if not self.enabled:
            return

        # Implement control logic here
        # This would typically involve reading current state,
        # computing control outputs, and publishing commands
        pass

def main(args=None):
    rclpy.init(args=args)
    node = HumanoidControllerNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Interrupted, shutting down...')
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Example 2: Action Client Implementation
```python
#!/usr/bin/env python3
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node

from control_msgs.action import FollowJointTrajectory
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint

class TrajectoryClient(Node):
    def __init__(self):
        super().__init__('trajectory_client')
        self._action_client = ActionClient(
            self, FollowJointTrajectory, 'follow_joint_trajectory')

    def send_goal(self, joint_names, positions, velocities=None, time_from_start=5.0):
        """Send trajectory goal to action server"""
        goal_msg = FollowJointTrajectory.Goal()

        # Create trajectory message
        trajectory = JointTrajectory()
        trajectory.joint_names = joint_names

        point = JointTrajectoryPoint()
        point.positions = positions
        if velocities:
            point.velocities = velocities
        point.time_from_start.sec = int(time_from_start)
        point.time_from_start.nanosec = int((time_from_start - int(time_from_start)) * 1e9)

        trajectory.points.append(point)
        goal_msg.trajectory = trajectory

        # Wait for action server
        self._action_client.wait_for_server()

        # Send goal
        self._send_goal_future = self._action_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback)

        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        """Handle goal response"""
        goal_handle = future.result()
        if not goal_handle.accepted:
            self.get_logger().info('Goal rejected')
            return

        self.get_logger().info('Goal accepted')
        self._get_result_future = goal_handle.get_result_async()
        self._get_result_future.add_done_callback(self.get_result_callback)

    def feedback_callback(self, feedback_msg):
        """Handle feedback from action server"""
        feedback = feedback_msg.feedback
        self.get_logger().debug(f'Received feedback: {feedback}')

    def get_result_callback(self, future):
        """Handle action result"""
        result = future.result().result
        self.get_logger().info(f'Result: {result}')
        rclpy.shutdown()

def main(args=None):
    rclpy.init(args=args)
    action_client = TrajectoryClient()

    # Send a sample trajectory
    joint_names = ['joint1', 'joint2', 'joint3']
    positions = [1.0, 0.5, -0.5]

    action_client.send_goal(joint_names, positions)

    rclpy.spin(action_client)

if __name__ == '__main__':
    main()
```

## System-Level Architecture Perspective
### Communication Pattern Selection for Humanoid Robotics
In humanoid robotics, selecting the appropriate communication pattern is crucial for system performance and reliability:

**Topics** are used for:
- Sensor data streams (IMU, joint encoders, camera feeds)
- State information (joint positions, velocities, efforts)
- Control commands (joint trajectories, velocity commands)
- System status updates

**Services** are appropriate for:
- Calibration procedures
- System enable/disable operations
- Configuration changes
- One-time computations (inverse kinematics solutions)

**Actions** are essential for:
- Walking pattern generation
- Manipulation tasks
- Navigation goals
- Complex behaviors that take time to complete

### Integration Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Perception    │    │    Planning     │    │     Control     │
│     Layer       │◄──►│     Layer       │◄──►│     Layer       │
│(Sensors, Vision)│    │(IK, Path, Gait) │    │(Joint, Balance) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Topic Bus     │    │   Service Bus   │    │   Action Bus    │
│ (Real-time data)│    │(Sync commands)  │    │(Async tasks)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Performance Considerations
- **Latency**: Topics provide lowest latency for real-time control
- **Throughput**: Services block execution but ensure completion
- **Reliability**: Actions provide the most robust communication with feedback
- **Resource Usage**: Topics use more bandwidth but enable parallel processing

## Practical Reasoning
### When to Use Each Pattern
- **Topics**: Continuous data streams, state broadcasting, real-time control
- **Services**: Request-response operations, configuration changes, blocking computations
- **Actions**: Long-running tasks, operations that can be cancelled, tasks with feedback

### Best Practices
1. **Use Topics for Real-time**: Control loops, sensor fusion, state estimation
2. **Use Services for Configuration**: Calibration, enabling/disabling, parameter updates
3. **Use Actions for Complex Tasks**: Walking, manipulation, navigation
4. **Consider QoS**: Match QoS policies to application requirements
5. **Handle Errors**: Implement proper error handling for all communication patterns

### Humanoid-Specific Considerations
- **Safety**: Critical control commands should use RELIABLE QoS
- **Timing**: Control loops require deterministic timing
- **Synchronization**: Multiple sensor streams may need timestamp synchronization
- **Fault Tolerance**: System should degrade gracefully when components fail

## Failure Modes and Debugging
### Common Topic Issues
1. **No Communication**: Check topic names, QoS compatibility, network configuration
2. **High Latency**: Monitor network bandwidth and CPU usage
3. **Message Loss**: Adjust QoS settings or reduce message frequency

### Service-Specific Issues
1. **Timeouts**: Server too slow or not responding
2. **Blocking**: Service calls blocking main thread
3. **Resource Exhaustion**: Too many concurrent service calls

### Action-Specific Issues
1. **Goal Rejection**: Invalid goals or server not ready
2. **Cancellation**: Goals being cancelled unexpectedly
3. **Feedback Loss**: Feedback messages not arriving

### Debugging Commands
```bash
# Monitor topics
ros2 topic list
ros2 topic info /topic_name
ros2 topic echo /topic_name
ros2 topic hz /topic_name  # Check frequency

# Monitor services
ros2 service list
ros2 service info /service_name
ros2 service call /service_name srv_type "{field: value}"

# Monitor actions
ros2 action list
ros2 action info /action_name
ros2 action send_goal /action_name action_type "{goal_fields}"

# System monitoring
ros2 run rqt_graph rqt_graph
ros2 run rqt_topic rqt_topic
ros2 run rqt_service rqt_service
```

## Exercises
### Beginner Exercises
1. **Node Creation**: Create a simple node that publishes a counter value to a topic
2. **Service Server**: Implement a service that adds two numbers
3. **Basic Action**: Create an action that counts to a specified number

### Intermediate Exercises
4. **Multi-Node System**: Create a publisher and subscriber that communicate
5. **Service Client**: Write a client that calls the number-adding service
6. **Action Client/Server**: Implement a complete action with feedback

### Advanced Exercises
7. **Real-time Node**: Create a node with proper QoS settings for real-time control
8. **Error Handling**: Implement robust error handling for all communication patterns
9. **Performance Monitoring**: Add latency and throughput monitoring to nodes
10. **Integration**: Combine all patterns in a humanoid robot simulation system

## Multiple Choice Questions (MCQs)
**Question 1:** What is the primary purpose of ROS 2 nodes?
  - a) To store data permanently
  - b) To be the fundamental computational units that communicate with each other
  - c) To manage network connections
  - d) To provide visualization tools
  - **Answer: b) To be the fundamental computational units that communicate with each other**
  - **Explanation:** Nodes are the basic computational units in ROS 2 that perform specific tasks and communicate with other nodes.

**Question 2:** Which communication pattern is best for continuous sensor data streams?
  - a) Services
  - b) Actions
  - c) Topics
  - d) Parameters
  - **Answer: c) Topics**
  - **Explanation:** Topics implement publish-subscribe pattern ideal for continuous data streams like sensor readings.

**Question 3:** What distinguishes ROS 2 services from topics?
  - a) Services are faster than topics
  - b) Services provide synchronous request-response communication
  - c) Services use less memory
  - d) Services can only be used for configuration
  - **Answer: b) Services provide synchronous request-response communication**
  - **Explanation:** Services provide synchronous communication where a client sends a request and waits for a response.

**Question 4:** When should you use ROS 2 actions instead of services?
  - a) For all communication
  - b) For long-running tasks that may need feedback or cancellation
  - c) For high-frequency data
  - d) For simple computations
  - **Answer: b) For long-running tasks that may need feedback or cancellation**
  - **Explanation:** Actions are designed for long-running operations that benefit from feedback and cancellation capabilities.

**Question 5:** What happens when a ROS 2 service call times out?
  - a) The system crashes
  - b) The service automatically restarts
  - c) The client receives an exception or error
  - d) The message is queued indefinitely
  - **Answer: c) The client receives an exception or error**
  - **Explanation:** When a service call times out, the client typically receives an exception or error indication.

**Question 6:** Which QoS policy is most important for critical control commands?
  - a) History
  - b) Reliability
  - c) Deadline
  - d) Lifespan
  - **Answer: b) Reliability**
  - **Explanation:** RELIABLE reliability policy ensures all control commands are delivered, which is critical for safety.

**Question 7:** What is the main advantage of actions over services for long operations?
  - a) Actions are faster
  - b) Actions provide feedback during execution and can be cancelled
  - c) Actions use less memory
  - d) Actions are easier to implement
  - **Answer: b) Actions provide feedback during execution and can be cancelled**
  - **Explanation:** Actions provide feedback during execution and support goal cancellation, making them suitable for long operations.

**Question 8:** How do ROS 2 nodes discover each other without a central master?
  - a) Through manual configuration
  - b) Using DDS discovery mechanisms
  - c) Through a database
  - d) Via web services
  - **Answer: b) Using DDS discovery mechanisms**
  - **Explanation:** Nodes use DDS (Data Distribution Service) built-in discovery mechanisms to find each other.

**Question 9:** What is the default behavior of ROS 2 publishers regarding message delivery?
  - a) Messages are stored until delivered
  - b) Messages are delivered reliably by default
  - c) Messages may be lost if subscribers are not ready
  - d) Messages are encrypted by default
  - **Answer: b) Messages are delivered reliably by default**
  - **Explanation:** By default, ROS 2 uses RELIABLE QoS policy ensuring message delivery.

**Question 10:** Which command shows all active ROS 2 action servers?
  - a) ros2 action list
  - b) ros2 action show
  - c) ros2 action servers
  - d) ros2 list actions
  - **Answer: a) ros2 action list**
  - **Explanation:** The command 'ros2 action list' shows all active action servers and clients.

## Chapter Summary
This chapter explored the four fundamental communication patterns in ROS 2: nodes, topics, services, and actions. We examined their technical implementation, practical applications in humanoid robotics, and system-level integration. Nodes serve as the basic computational units, topics enable efficient data streaming, services provide synchronous request-response communication, and actions support long-running operations with feedback. Understanding when and how to use each pattern is essential for building robust, efficient robotic systems that meet the real-time and safety requirements of humanoid robotics applications.

## Citations
1. Open Robotics. (2023). "ROS 2 Communication Patterns." *ROS 2 Documentation*. https://docs.ros.org/en/rolling/Concepts/About-Topics-Services-Actions.html
2. Faconti, P., et al. (2021). "ROS 2 Quality of Service Implementation." *IEEE Robotics and Automation Magazine*.
3. PAL Robotics. (2022). "Best Practices for ROS 2 Communication in Humanoid Robots." *PAL Technical Report*.
4. ROS 2 Working Group. (2023). "Real-time Performance Analysis of ROS 2 Communication Patterns." *Open Robotics*.
5. NVIDIA Robotics. (2022). "DDS Performance in Robotic Communication Systems." *NVIDIA Technical Report*.
6. Kuffner, J. (2020). "Middleware Requirements for Robotic Systems." *International Journal of Robotics Research*.
7. ROS 2 Security Working Group. (2023). "Secure Communication Patterns in ROS 2." *Open Robotics*.
8. Boston Dynamics. (2021). "Communication Architecture for Dynamic Robots." *Technical Report*.

## Recent Developments
- **ROS 2 Iron Irwini** (2023): Enhanced action server capabilities with improved feedback mechanisms
- **Real-time QoS Improvements**: New QoS policies specifically designed for hard real-time requirements
- **Action Streaming**: Experimental support for streaming data within actions for continuous feedback
- **Service Discovery Enhancements**: Improved discovery mechanisms for better network resilience
- **Memory Management**: Optimized memory allocation for high-frequency topic communication
- **Cross-platform Compatibility**: Better support for embedded systems and resource-constrained devices
- **Security Enhancements**: Improved encryption and authentication for all communication patterns