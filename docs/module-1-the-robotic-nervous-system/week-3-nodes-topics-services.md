---
sidebar_position: 3
---

# Week 3: Nodes, Topics, Services, and Actions

## Learning Objectives

By the end of this week, you will be able to:
- Create and manage ROS 2 nodes
- Implement publisher/subscriber communication patterns
- Build service-based request/reply interactions
- Design action-based long-running tasks with feedback

## ROS 2 Nodes

A node is an executable that uses ROS 2 to communicate with other nodes. Nodes are the fundamental building blocks of a ROS 2 system:

```python
import rclpy
from rclpy.node import Node

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello World: %d' % self.i
        self.publisher_.publish(msg)
        self.get_logger().info('Publishing: "%s"' % msg.data)
        self.i += 1
```

## Topics and Publishers/Subscribers

Topics enable asynchronous, many-to-many communication:

- **Publishers**: Send messages to a topic
- **Subscribers**: Receive messages from a topic
- **Message Types**: Defined in `.msg` files

## Services

Services provide synchronous request/reply communication:

- **Service Server**: Provides functionality
- **Service Client**: Requests functionality
- **Service Types**: Defined in `.srv` files

## Actions

Actions are for long-running tasks that require feedback:

- **Goal**: Request for action execution
- **Feedback**: Interim status updates
- **Result**: Final outcome of the action
- **Action Types**: Defined in `.action` files

## Lab Exercise

Complete the lab exercise for this week to practice nodes, topics, services, and actions:

- Navigate to the lab template: `src/labs/module-1/week-3-template/`
- Follow the instructions in the README.md file
- Implement a complete communication pattern using all four concepts

## Resources

- [Nodes and executables](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Node-Introduction.html)
- [Topics tutorial](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Publisher-And-Subscriber.html)
- [Services tutorial](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Service-And-Client.html)
- [Actions tutorial](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Single-Threaded-Executor.html)

## Assessment

Complete the quiz for this week to verify your understanding of ROS 2 communication patterns.