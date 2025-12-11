# Week 3 Lab: Nodes, Topics, Services, and Actions

## Overview

In this lab, you will create and implement ROS 2 communication patterns including nodes, topics, services, and actions.

## Learning Objectives

- Create ROS 2 nodes with publishers and subscribers
- Implement service-based request/reply communication
- Build action-based long-running tasks with feedback
- Understand Quality of Service (QoS) settings

## Prerequisites

- ROS 2 workspace with custom packages
- Understanding of ROS 2 concepts
- Python programming skills

## Lab Instructions

### Step 1: Create a Publisher Node

Create a node that publishes sensor data:
```python
# sensor_publisher.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan

class SensorPublisher(Node):
    def __init__(self):
        super().__init__('sensor_publisher')
        self.publisher = self.create_publisher(LaserScan, 'scan', 10)
        timer_period = 0.1  # seconds
        self.timer = self.create_timer(timer_period, self.publish_scan)

    def publish_scan(self):
        msg = LaserScan()
        # Fill in scan message data
        self.publisher.publish(msg)
```

### Step 2: Create a Subscriber Node

Create a node that subscribes to sensor data:
```python
# sensor_subscriber.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan

class SensorSubscriber(Node):
    def __init__(self):
        super().__init__('sensor_subscriber')
        self.subscription = self.create_subscription(
            LaserScan,
            'scan',
            self.scan_callback,
            10)

    def scan_callback(self, msg):
        self.get_logger().info(f'Received scan with {len(msg.ranges)} ranges')
```

### Step 3: Create a Service Server

Create a service that performs a calculation:
```python
# math_service.py
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class MathService(Node):
    def __init__(self):
        super().__init__('math_service')
        self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add_callback)

    def add_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Returning {request.a} + {request.b} = {response.sum}')
        return response
```

### Step 4: Create a Service Client

Create a client that calls the service:
```python
# math_client.py
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class MathClient(Node):
    def __init__(self):
        super().__init__('math_client')
        self.client = self.create_client(AddTwoInts, 'add_two_ints')
        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting again...')
        self.req = AddTwoInts.Request()

    def send_request(self, a, b):
        self.req.a = a
        self.req.b = b
        self.future = self.client.call_async(self.req)
        rclpy.spin_until_future_complete(self, self.future)
        return self.future.result()
```

### Step 5: Test Communication

Run your nodes and verify communication works correctly.

## Success Criteria

- [ ] Create publisher and subscriber nodes that communicate successfully
- [ ] Implement a service server and client that communicate correctly
- [ ] Test QoS settings with different reliability and durability options
- [ ] Understand the differences between communication patterns

## Troubleshooting

- If nodes don't communicate, check topic/service names match exactly
- For QoS errors, ensure publisher and subscriber QoS profiles are compatible
- Use `ros2 topic list` and `ros2 service list` to verify available endpoints

## Additional Resources

- [Publisher/Subscriber tutorial](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Publisher-And-Subscriber.html)
- [Service/Client tutorial](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Service-And-Client.html)
- [Actions tutorial](https://docs.ros.org/en/humble/Tutorials/Intermediate/Creating-an-Action.html)