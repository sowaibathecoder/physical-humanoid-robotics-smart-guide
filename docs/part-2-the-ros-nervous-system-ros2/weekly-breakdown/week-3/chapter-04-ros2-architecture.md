---
id: chapter-04-ros2-architecture
title: "Chapter 04: ROS2 Architecture"
sidebar_position: 1
description: "Understanding the fundamental architecture of ROS 2 and its key differences from ROS 1"
---

# Chapter 04: ROS2 Architecture

## Learning Objectives
After completing this chapter, students will be able to:
1. Explain the fundamental architecture of ROS 2 and its key differences from ROS 1
2. Identify and describe the core components of the ROS 2 ecosystem (Nodes, Topics, Services, Actions)
3. Understand the DDS (Data Distribution Service) middleware and its role in ROS 2 communication
4. Configure and deploy ROS 2 nodes with proper communication patterns
5. Implement robust communication patterns for humanoid robotics applications

## Conceptual Explanation
ROS 2 (Robot Operating System 2) represents a significant architectural evolution from ROS 1, addressing critical requirements for production robotics including real-time performance, security, and distributed computing. The primary architectural shift is the adoption of DDS (Data Distribution Service) as the underlying communication middleware, enabling more robust, scalable, and secure robot applications.

Unlike ROS 1's centralized master-based architecture, ROS 2 employs a decentralized approach where nodes discover each other directly through DDS. This enables more resilient systems that can operate in distributed environments, making it particularly suitable for humanoid robotics where multiple processing units may be distributed across the robot's body.

The ROS 2 architecture is built around several key concepts:
- **Nodes**: Processes that perform computation, organized into namespaces
- **Topics**: Named buses over which nodes exchange messages (publish/subscribe)
- **Services**: Synchronous request/response communication patterns
- **Actions**: Asynchronous goal-oriented communication with feedback
- **Parameters**: Configuration values that can be dynamically adjusted
- **Lifecycle**: State management for complex node initialization and shutdown

## Technical Content
### DDS Middleware Architecture
ROS 2 leverages DDS as its communication layer, providing several key capabilities:
- **Quality of Service (QoS) policies**: Configurable communication guarantees including reliability, durability, and liveliness
- **Discovery mechanisms**: Automatic node and topic discovery without central coordination
- **Real-time performance**: Deterministic message delivery with bounded latency
- **Security features**: Authentication, encryption, and access control

### Core Communication Patterns
```xml
<!-- Example DDS XML Configuration for Real-time QoS -->
<dds>
  <profiles>
    <publisher profile_name="realtime_publisher">
      <qos>
        <reliability>
          <kind>RELIABLE</kind>
        </reliability>
        <durability>
          <kind>TRANSIENT_LOCAL</kind>
        </durability>
        <history>
          <kind>KEEP_LAST</kind>
          <depth>10</depth>
        </history>
        <deadline>
          <sec>1</sec>
        </deadline>
        <lifespan>
          <sec>30</sec>
        </lifespan>
      </qos>
    </publisher>
  </profiles>
</dds>
```

### Node Architecture
```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from sensor_msgs.msg import JointState
from geometry_msgs.msg import Twist

class HumanoidControlNode(Node):
    def __init__(self):
        super().__init__('humanoid_control_node')

        # Publishers for different subsystems
        self.joint_pub = self.create_publisher(JointState, 'joint_commands', 10)
        self.cmd_vel_pub = self.create_publisher(Twist, 'cmd_vel', 10)

        # Subscribers for sensor data
        self.imu_sub = self.create_subscription(
            sensor_msgs.msg.Imu, 'imu/data', self.imu_callback, 10)
        self.joint_state_sub = self.create_subscription(
            JointState, 'joint_states', self.joint_state_callback, 10)

        # Timer for control loop
        self.control_timer = self.create_timer(0.01, self.control_loop)  # 100Hz

    def control_loop(self):
        # Implement control logic here
        pass

def main(args=None):
    rclpy.init(args=args)
    node = HumanoidControlNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Quality of Service Configuration
```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy

# High-frequency sensor data (IMU, encoders)
sensor_qos = QoSProfile(
    depth=1,
    reliability=ReliabilityPolicy.BEST_EFFORT,
    durability=DurabilityPolicy.VOLATILE,
    history=QoSHistoryPolicy.KEEP_LAST
)

# Critical control commands
control_qos = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.RELIABLE,
    durability=DurabilityPolicy.VOLATILE,
    history=QoSHistoryPolicy.KEEP_LAST
)

# Configuration parameters
config_qos = QoSProfile(
    depth=1,
    reliability=ReliabilityPolicy.RELIABLE,
    durability=DurabilityPolicy.TRANSIENT_LOCAL,
    history=QoSHistoryPolicy.KEEP_LAST
)
```

## Practical Examples
### Example 1: Basic Publisher-Subscriber Pattern
```python
# publisher_node.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SensorPublisher(Node):
    def __init__(self):
        super().__init__('sensor_publisher')
        self.publisher = self.create_publisher(String, 'sensor_data', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Sensor reading: {self.i}'
        self.publisher.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    sensor_publisher = SensorPublisher()
    rclpy.spin(sensor_publisher)
    sensor_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

```python
# subscriber_node.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SensorSubscriber(Node):
    def __init__(self):
        super().__init__('sensor_subscriber')
        self.subscription = self.create_subscription(
            String,
            'sensor_data',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    sensor_subscriber = SensorSubscriber()
    rclpy.spin(sensor_subscriber)
    sensor_subscriber.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Example 2: Service-Based Communication
```python
# service_server.py
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class MinimalService(Node):
    def __init__(self):
        super().__init__('minimal_service')
        self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add_two_ints_callback)

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Incoming request\na: {request.a}, b: {request.b}')
        return response

def main(args=None):
    rclpy.init(args=args)
    minimal_service = MinimalService()
    rclpy.spin(minimal_service)
    minimal_service.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## System-Level Architecture Perspective
### ROS 2 in Humanoid Robotics Context
In humanoid robotics, the ROS 2 architecture provides the foundation for distributed control systems. The decentralized nature of ROS 2 allows for:
- **Distributed Processing**: Different computational tasks can run on separate hardware units (e.g., perception on GPU, control on real-time CPU)
- **Fault Tolerance**: Individual node failures don't bring down the entire system
- **Scalability**: New sensors and actuators can be added without architectural changes
- **Real-time Performance**: QoS policies ensure critical control messages receive priority

### Communication Topology
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Perception    │    │    Planning     │    │     Control     │
│     Node        │◄──►│     Node        │◄──►│     Node        │
│  (Camera, LIDAR)│    │  (Path, Motion) │    │ (Joint, Walking)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Sensor Data   │    │   Waypoint      │    │   Commands      │
│    Topics       │    │    Topics       │    │    Topics       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Middleware Considerations
For humanoid robotics, the choice of DDS implementation affects:
- **Latency**: Fastest possible communication for real-time control
- **Bandwidth**: Efficient message serialization for sensor data
- **Security**: Authentication and encryption for safe operation
- **Determinism**: Predictable message delivery for safety-critical systems

## Practical Reasoning
### When to Use Different Communication Patterns
- **Topics (Publish/Subscribe)**: Sensor data, state updates, continuous data streams
- **Services**: Configuration changes, one-time computations, blocking operations
- **Actions**: Long-running tasks with feedback (navigation, manipulation)
- **Parameters**: System configuration, calibration values, operational settings

### Performance Considerations
1. **Message Size**: Large messages (e.g., point clouds) should use BEST_EFFORT QoS
2. **Frequency**: High-frequency control loops need reliable, low-latency QoS
3. **Synchronization**: Multiple sensor streams may need timestamp synchronization
4. **Resource Management**: Nodes should handle resource allocation/deallocation properly

### Security Implications
ROS 2's security features enable:
- **Authentication**: Only authorized nodes can join the network
- **Encryption**: Sensitive data can be encrypted in transit
- **Access Control**: Fine-grained permissions for different system components

## Failure Modes and Debugging
### Common Architecture Issues
1. **Discovery Failures**: Nodes can't find each other due to network configuration
   - Solution: Check RMW implementation, network settings, and firewall rules
2. **QoS Mismatch**: Publishers/subscribers with incompatible QoS settings
   - Solution: Ensure matching QoS policies between publishers and subscribers
3. **Memory Leaks**: Improper cleanup of publishers, subscribers, or timers
   - Solution: Always call destroy_node() and implement proper cleanup

### Debugging Tools
```bash
# List all active nodes
ros2 node list

# Show node graph
ros2 run rqt_graph rqt_graph

# Monitor topic traffic
ros2 topic echo /topic_name

# Check QoS settings
ros2 topic info /topic_name --verbose

# Monitor system resources
ros2 doctor
```

### Performance Monitoring
```python
# Implement custom monitoring
from rclpy.qos import QoSProfile
from std_msgs.msg import Float64

class PerformanceMonitor(Node):
    def __init__(self):
        super().__init__('perf_monitor')
        self.latency_pub = self.create_publisher(Float64, 'latency_stats', 1)

    def measure_latency(self, callback):
        start_time = self.get_clock().now()
        result = callback()
        end_time = self.get_clock().now()
        latency = (end_time - start_time).nanoseconds / 1e9
        self.latency_pub.publish(Float64(data=latency))
        return result
```

## Exercises
### Beginner Exercises
1. **Node Creation**: Create a simple ROS 2 node that publishes "Hello World" messages every second
2. **Topic Communication**: Set up a publisher-subscriber pair to communicate sensor data
3. **Parameter Server**: Create a node that uses parameters for configuration

### Intermediate Exercises
4. **QoS Configuration**: Implement a node with different QoS profiles for sensor vs control data
5. **Multi-node System**: Create a system with 3 nodes that communicate through topics
6. **Service Implementation**: Create a service that performs a mathematical calculation

### Advanced Exercises
7. **Real-time Performance**: Implement a control loop with guaranteed timing constraints
8. **Distributed System**: Set up ROS 2 communication between multiple machines
9. **Security Configuration**: Configure authentication and encryption for ROS 2 communication
10. **System Integration**: Integrate all communication patterns in a humanoid control system

## Multiple Choice Questions (MCQs)
**Question 1:** What does DDS stand for in the context of ROS 2?
  - a) Distributed Data System
  - b) Data Distribution Service
  - c) Dynamic Discovery System
  - d) Decentralized Data Service
  - **Answer: b) Data Distribution Service**
  - **Explanation:** ROS 2 uses DDS (Data Distribution Service) as its underlying communication middleware.

**Question 2:** Which of the following is NOT a core communication pattern in ROS 2?
  - a) Topics
  - b) Services
  - c) Actions
  - d) Databases
  - **Answer: d) Databases**
  - **Explanation:** ROS 2 core communication patterns are Topics (publish/subscribe), Services (request/response), and Actions (goal-oriented with feedback).

**Question 3:** What is the default QoS reliability policy for publishers in ROS 2?
  - a) BEST_EFFORT
  - b) RELIABLE
  - c) TRANSIENT_LOCAL
  - d) VOLATILE
  - **Answer: b) RELIABLE**
  - **Explanation:** The default reliability policy is RELIABLE, which ensures all messages are delivered.

**Question 4:** How does ROS 2 achieve node discovery without a central master?
  - a) Manual configuration files
  - b) DDS built-in discovery mechanisms
  - c) Database lookup
  - d) Web service registration
  - **Answer: b) DDS built-in discovery mechanisms**
  - **Explanation:** DDS provides automatic discovery mechanisms that allow nodes to find each other without central coordination.

**Question 5:** Which QoS policy controls how long messages are kept in history?
  - a) Reliability
  - b) Durability
  - c) History
  - d) Deadline
  - **Answer: c) History**
  - **Explanation:** The History QoS policy controls how many messages are kept for late-joining subscribers.

**Question 6:** What is the primary advantage of ROS 2 over ROS 1 for production systems?
  - a) Better visualization tools
  - b) Decentralized architecture with DDS
  - c) More message types
  - d) Simpler installation
  - **Answer: b) Decentralized architecture with DDS**
  - **Explanation:** The DDS-based decentralized architecture provides better real-time performance, security, and fault tolerance.

**Question 7:** Which command is used to list all active ROS 2 nodes?
  - a) ros2 list nodes
  - b) ros2 node show
  - c) ros2 node list
  - d) ros2 show nodes
  - **Answer: c) ros2 node list**
  - **Explanation:** The command 'ros2 node list' shows all currently active nodes.

**Question 8:** What is the purpose of Quality of Service (QoS) policies in ROS 2?
  - a) To improve code readability
  - b) To configure communication behavior and guarantees
  - c) To reduce memory usage
  - d) To increase processing speed
  - **Answer: b) To configure communication behavior and guarantees**
  - **Explanation:** QoS policies allow configuration of reliability, durability, history, and other communication characteristics.

**Question 9:** In ROS 2, what is the recommended approach for real-time critical control loops?
  - a) Use default QoS settings
  - b) Use BEST_EFFORT reliability
  - c) Use RELIABLE QoS with appropriate timing constraints
  - d) Avoid using ROS 2 for real-time systems
  - **Answer: c) Use RELIABLE QoS with appropriate timing constraints**
  - **Explanation:** For critical control, RELIABLE QoS ensures message delivery with predictable timing.

**Question 10:** What happens when a publisher and subscriber have incompatible QoS policies?
  - a) Messages are automatically converted
  - b) Communication fails silently
  - c) The system crashes
  - d) A warning is displayed and no messages are exchanged
  - **Answer: d) A warning is displayed and no messages are exchanged**
  - **Explanation:** ROS 2 will show warnings about incompatible QoS and communication will not occur.

## Chapter Summary
This chapter covered the fundamental architecture of ROS 2, highlighting its key differences from ROS 1 and its advantages for humanoid robotics applications. We explored the DDS-based communication middleware, core communication patterns (topics, services, actions), and Quality of Service policies that enable robust, real-time communication. The practical examples demonstrated implementation of different communication patterns, while the system-level perspective showed how ROS 2 architecture supports distributed humanoid robotics systems. Understanding these architectural concepts is crucial for building reliable, scalable robotic applications that can meet the demanding requirements of humanoid robots.

## Citations
1. Faconti, P., et al. (2019). "ROS 2 Design Overview." *Open Robotics*. https://design.ros2.org/
2. DDS Foundation. (2020). "DDS (Data Distribution Service) for Real-Time Systems." *OMG Standard*.
3. Quigley, M., et al. (2009). "ROS: an open-source Robot Operating System." *ICRA Workshop on Open Source Software*.
4. MXR Development Team. (2022). "Real-time Performance Analysis of ROS 2 in Humanoid Robotics." *IEEE Robotics and Automation Letters*.
5. ROS 2 Documentation. (2023). "Quality of Service Settings." *ROS 2 Official Documentation*. https://docs.ros.org/en/rolling/Concepts/About-Quality-of-Service-Settings.html
6. PAL Robotics. (2021). "ROS 2 Migration Guide for Humanoid Robots." *PAL Robotics Technical Report*.
7. Open Robotics. (2023). "ROS 2 Security Working Group Report." *Open Robotics*.
8. NVIDIA Robotics. (2022). "DDS Performance in Distributed Robotic Systems." *NVIDIA Technical Report*.

## Recent Developments
- **ROS 2 Iron Irwini** (2023): Introduced enhanced security features and improved real-time performance capabilities
- **Real-time Linux Integration**: Better support for PREEMPT_RT patches enabling deterministic real-time behavior
- **DDS Implementation Improvements**: New RMW (ROS Middleware) implementations offering better performance and security
- **ROS 2 Bridge Technologies**: Enhanced bridge capabilities between ROS 1 and ROS 2 for legacy system integration
- **Edge Computing Support**: Optimized DDS configurations for edge computing scenarios in humanoid robotics
- **Safety-Critical Extensions**: New packages and tools for safety-certifiable robotic systems using ROS 2