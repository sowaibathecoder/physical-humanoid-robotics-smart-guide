# Week 11 Lab: OpenVLA, RT-2X, and Octo for Vision-Language-Action

## Overview

In this lab, you will implement Vision-Language-Action (VLA) models including OpenVLA, RT-2X, and Octo for robot control and manipulation tasks.

## Learning Objectives

- Understand Vision-Language-Action (VLA) models for robotics
- Implement OpenVLA for robot control
- Integrate RT-2X models with ROS 2 systems
- Compare different VLA approaches and their tradeoffs

## Prerequisites

- ROS 2 Humble installed
- Python 3.10+ with PyTorch
- GPU with CUDA support
- Basic understanding of deep learning concepts

## Lab Instructions

### Step 1: Install VLA Dependencies

Install the required packages for VLA models:

```bash
# Install PyTorch with CUDA support
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install Hugging Face transformers
pip3 install transformers

# Install OpenVLA dependencies (if available)
pip3 install openvla

# Install other VLA-related packages
pip3 install numpy opencv-python pillow
pip3 install datasets accelerate
```

### Step 2: Basic OpenVLA Implementation

Create a basic OpenVLA node `openvla_node.py`:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from std_msgs.msg import String
from geometry_msgs.msg import Pose
from cv_bridge import CvBridge
import cv2
import numpy as np
import torch
from PIL import Image as PILImage

class OpenVLANode(Node):
    def __init__(self):
        super().__init__('openvla_node')

        # Initialize CV bridge
        self.bridge = CvBridge()

        # Subscribers
        self.image_subscription = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.image_callback,
            10
        )

        self.command_subscription = self.create_subscription(
            String,
            '/vla_command',
            self.command_callback,
            10
        )

        # Publishers
        self.action_publisher = self.create_publisher(
            Pose,
            '/vla_action',
            10
        )

        # Initialize OpenVLA model (placeholder - actual implementation may vary)
        self.model = None
        self.load_model()

        self.get_logger().info('OpenVLA Node Started')

    def load_model(self):
        """Load the OpenVLA model"""
        try:
            # Placeholder for actual OpenVLA model loading
            # This would typically involve loading from HuggingFace or a custom implementation
            self.get_logger().info('Loading OpenVLA model...')

            # Note: Actual OpenVLA implementation would go here
            # For now, we'll create a mock model for demonstration
            self.model = "Mock OpenVLA Model"
            self.get_logger().info('OpenVLA model loaded successfully')
        except Exception as e:
            self.get_logger().error(f'Failed to load OpenVLA model: {e}')

    def image_callback(self, msg):
        """Process incoming camera images"""
        try:
            # Convert ROS Image to OpenCV image
            cv_image = self.bridge.imgmsg_to_cv2(msg, "rgb8")

            # Process image with OpenVLA model
            # In a real implementation, this would run inference
            action = self.process_image_with_vla(cv_image, "move forward")

            # Publish the action
            if action is not None:
                self.publish_action(action)

        except Exception as e:
            self.get_logger().error(f'Error processing image: {e}')

    def command_callback(self, msg):
        """Process incoming language commands"""
        command = msg.data
        self.get_logger().info(f'Received command: {command}')

        # Process command with VLA model
        # This would typically be called when we have both image and command
        pass

    def process_image_with_vla(self, image, command):
        """Process image and command with VLA model"""
        try:
            # Convert OpenCV image to PIL
            pil_image = PILImage.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

            # In a real implementation, this would run the VLA model
            # For now, return a mock action based on the command
            if "forward" in command.lower():
                action = Pose()
                action.position.x = 0.1  # Move forward 0.1m
                action.orientation.z = 0.0  # No rotation
                return action
            elif "left" in command.lower():
                action = Pose()
                action.position.x = 0.0
                action.orientation.z = 0.2  # Turn left
                return action
            elif "right" in command.lower():
                action = Pose()
                action.position.x = 0.0
                action.orientation.z = -0.2  # Turn right
                return action
            else:
                return None

        except Exception as e:
            self.get_logger().error(f'Error in VLA processing: {e}')
            return None

    def publish_action(self, action):
        """Publish the computed action"""
        self.action_publisher.publish(action)
        self.get_logger().info(f'Published action: pos=({action.position.x}, {action.position.y}, {action.position.z}), orient=({action.orientation.x}, {action.orientation.y}, {action.orientation.z}, {action.orientation.w})')

def main(args=None):
    rclpy.init(args=args)

    openvla_node = OpenVLANode()

    try:
        rclpy.spin(openvla_node)
    except KeyboardInterrupt:
        pass
    finally:
        openvla_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 3: RT-2X Model Integration

Create an RT-2X integration node `rt2x_node.py`:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from std_msgs.msg import String
from geometry_msgs.msg import Twist
from cv_bridge import CvBridge
import cv2
import numpy as np
import torch
from transformers import AutoModel, AutoProcessor

class RT2XNode(Node):
    def __init__(self):
        super().__init__('rt2x_node')

        # Initialize CV bridge
        self.bridge = CvBridge()

        # Subscribers
        self.image_subscription = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.image_callback,
            10
        )

        self.command_subscription = self.create_subscription(
            String,
            '/rt2x_command',
            self.command_callback,
            10
        )

        # Publishers
        self.cmd_vel_publisher = self.create_publisher(
            Twist,
            '/cmd_vel',
            10
        )

        # Initialize RT-2X model (placeholder)
        self.model = None
        self.processor = None
        self.load_model()

        self.current_command = ""
        self.get_logger().info('RT-2X Node Started')

    def load_model(self):
        """Load the RT-2X model"""
        try:
            self.get_logger().info('Loading RT-2X model...')

            # Placeholder for actual RT-2X model loading
            # This would typically involve loading from HuggingFace
            # For demonstration, we'll use a mock implementation
            self.model = "Mock RT-2X Model"
            self.processor = "Mock Processor"

            self.get_logger().info('RT-2X model loaded successfully')
        except Exception as e:
            self.get_logger().error(f'Failed to load RT-2X model: {e}')

    def image_callback(self, msg):
        """Process incoming camera images with RT-2X"""
        try:
            # Convert ROS Image to OpenCV image
            cv_image = self.bridge.imgmsg_to_cv2(msg, "rgb8")

            # Process with RT-2X if we have a command
            if self.current_command:
                cmd_vel = self.process_with_rt2x(cv_image, self.current_command)
                if cmd_vel:
                    self.cmd_vel_publisher.publish(cmd_vel)
                    self.get_logger().info(f'Published cmd_vel: linear.x={cmd_vel.linear.x}, angular.z={cmd_vel.angular.z}')

        except Exception as e:
            self.get_logger().error(f'Error processing RT-2X: {e}')

    def command_callback(self, msg):
        """Receive language command for RT-2X"""
        self.current_command = msg.data
        self.get_logger().info(f'Received RT-2X command: {self.current_command}')

    def process_with_rt2x(self, image, command):
        """Process image and command with RT-2X model"""
        try:
            # In a real implementation, this would run the RT-2X model
            # For now, create a mock response based on command
            cmd_vel = Twist()

            if "forward" in command.lower() or "go" in command.lower():
                cmd_vel.linear.x = 0.2  # Move forward
                cmd_vel.angular.z = 0.0
            elif "backward" in command.lower():
                cmd_vel.linear.x = -0.2  # Move backward
                cmd_vel.angular.z = 0.0
            elif "left" in command.lower():
                cmd_vel.linear.x = 0.0
                cmd_vel.angular.z = 0.3  # Turn left
            elif "right" in command.lower():
                cmd_vel.linear.x = 0.0
                cmd_vel.angular.z = -0.3  # Turn right
            elif "stop" in command.lower():
                cmd_vel.linear.x = 0.0
                cmd_vel.angular.z = 0.0
            else:
                # Default: no movement
                cmd_vel.linear.x = 0.0
                cmd_vel.angular.z = 0.0

            return cmd_vel

        except Exception as e:
            self.get_logger().error(f'Error in RT-2X processing: {e}')
            return None

def main(args=None):
    rclpy.init(args=args)

    rt2x_node = RT2XNode()

    try:
        rclpy.spin(rt2x_node)
    except KeyboardInterrupt:
        pass
    finally:
        rt2x_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 4: Octo Framework Integration

Create an Octo integration node `octo_node.py`:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, JointState
from std_msgs.msg import String
from geometry_msgs.msg import Point
from cv_bridge import CvBridge
import cv2
import numpy as np
import torch

class OctoNode(Node):
    def __init__(self):
        super().__init__('octo_node')

        # Initialize CV bridge
        self.bridge = CvBridge()

        # Subscribers
        self.image_subscription = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.image_callback,
            10
        )

        self.command_subscription = self.create_subscription(
            String,
            '/octo_command',
            self.command_callback,
            10
        )

        # Publishers
        self.manipulation_publisher = self.create_publisher(
            Point,
            '/octo_manipulation',
            10
        )

        # Initialize Octo model (placeholder)
        self.model = None
        self.load_model()

        self.current_command = ""
        self.get_logger().info('Octo Node Started')

    def load_model(self):
        """Load the Octo model"""
        try:
            self.get_logger().info('Loading Octo model...')

            # Placeholder for actual Octo model loading
            # This would typically involve loading from the Octo framework
            self.model = "Mock Octo Model"

            self.get_logger().info('Octo model loaded successfully')
        except Exception as e:
            self.get_logger().error(f'Failed to load Octo model: {e}')

    def image_callback(self, msg):
        """Process incoming camera images with Octo"""
        try:
            # Convert ROS Image to OpenCV image
            cv_image = self.bridge.imgmsg_to_cv2(msg, "rgb8")

            # Process with Octo if we have a command
            if self.current_command:
                manipulation_action = self.process_with_octo(cv_image, self.current_command)
                if manipulation_action:
                    self.manipulation_publisher.publish(manipulation_action)
                    self.get_logger().info(f'Published manipulation: x={manipulation_action.x}, y={manipulation_action.y}, z={manipulation_action.z}')

        except Exception as e:
            self.get_logger().error(f'Error processing Octo: {e}')

    def command_callback(self, msg):
        """Receive language command for Octo"""
        self.current_command = msg.data
        self.get_logger().info(f'Received Octo command: {self.current_command}')

    def process_with_octo(self, image, command):
        """Process image and command with Octo model"""
        try:
            # In a real implementation, this would run the Octo model
            # For now, create a mock manipulation action based on command
            manipulation = Point()

            if "pick" in command.lower() or "grasp" in command.lower():
                # Mock pick action - move to object location
                manipulation.x = 0.5   # x position
                manipulation.y = 0.3   # y position
                manipulation.z = 0.2   # z position (height)
            elif "place" in command.lower() or "drop" in command.lower():
                # Mock place action
                manipulation.x = 0.4   # x position
                manipulation.y = 0.0   # y position
                manipulation.z = 0.1   # z position (lower)
            elif "move" in command.lower():
                # Mock move action
                manipulation.x = 0.6   # x position
                manipulation.y = 0.5   # y position
                manipulation.z = 0.3   # z position
            else:
                # Default: no manipulation
                manipulation.x = 0.0
                manipulation.y = 0.0
                manipulation.z = 0.0

            return manipulation

        except Exception as e:
            self.get_logger().error(f'Error in Octo processing: {e}')
            return None

def main(args=None):
    rclpy.init(args=args)

    octo_node = OctoNode()

    try:
        rclpy.spin(octo_node)
    except KeyboardInterrupt:
        pass
    finally:
        octo_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 5: VLA Integration Launch File

Create a launch file `vla_integration.launch.py`:

```python
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration

def generate_launch_description():
    # Launch arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='false')

    return LaunchDescription([
        # OpenVLA node
        Node(
            package='my_vla_package',
            executable='openvla_node.py',
            name='openvla_node',
            parameters=[{'use_sim_time': use_sim_time}],
            output='screen'
        ),

        # RT-2X node
        Node(
            package='my_vla_package',
            executable='rt2x_node.py',
            name='rt2x_node',
            parameters=[{'use_sim_time': use_sim_time}],
            output='screen'
        ),

        # Octo node
        Node(
            package='my_vla_package',
            executable='octo_node.py',
            name='octo_node',
            parameters=[{'use_sim_time': use_sim_time}],
            output='screen'
        )
    ])
```

### Step 6: Test VLA Models

Test your VLA implementations:

```bash
# Terminal 1: Launch the VLA nodes
ros2 launch my_vla_package vla_integration.launch.py

# Terminal 2: Send test commands to OpenVLA
ros2 topic pub /vla_command std_msgs/String "data: 'move forward to the red object'"

# Terminal 3: Send test commands to RT-2X
ros2 topic pub /rt2x_command std_msgs/String "data: 'go to the kitchen'"

# Terminal 4: Send test commands to Octo
ros2 topic pub /octo_command std_msgs/String "data: 'pick up the cup'"
```

### Step 7: Create VLA Evaluation Script

Create an evaluation script `vla_evaluation.py` to compare different VLA approaches:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from std_msgs.msg import String
from geometry_msgs.msg import Pose, Twist
from cv_bridge import CvBridge
import time

class VLAComparisonNode(Node):
    def __init__(self):
        super().__init__('vla_comparison_node')

        self.bridge = CvBridge()

        # Publishers for different VLA models
        self.openvla_cmd_publisher = self.create_publisher(String, '/vla_command', 10)
        self.rt2x_cmd_publisher = self.create_publisher(String, '/rt2x_command', 10)
        self.octo_cmd_publisher = self.create_publisher(String, '/octo_command', 10)

        # Subscribers to evaluate outputs
        self.openvla_result_sub = self.create_subscription(Pose, '/vla_action', self.openvla_result_callback, 10)
        self.rt2x_result_sub = self.create_subscription(Twist, '/cmd_vel', self.rt2x_result_callback, 10)
        self.octo_result_sub = self.create_subscription(Point, '/octo_manipulation', self.octo_result_callback, 10)

        self.results = {
            'openvla': None,
            'rt2x': None,
            'octo': None
        }

        self.get_logger().info('VLA Comparison Node Started')

    def run_comparison(self):
        """Run comparison test between different VLA models"""
        test_commands = [
            ("move forward", "navigation"),
            ("turn left", "navigation"),
            ("pick up object", "manipulation"),
            ("go to kitchen", "navigation")
        ]

        for command, task_type in test_commands:
            self.get_logger().info(f'Testing command: "{command}" for {task_type} task')

            # Reset results
            self.results = {k: None for k in self.results}

            # Send command to all VLA models
            cmd_msg = String()
            cmd_msg.data = command

            self.openvla_cmd_publisher.publish(cmd_msg)
            self.rt2x_cmd_publisher.publish(cmd_msg)
            self.octo_cmd_publisher.publish(cmd_msg)

            # Wait for responses (with timeout)
            start_time = time.time()
            timeout = 10.0  # 10 seconds timeout

            while time.time() - start_time < timeout:
                if all(result is not None for result in self.results.values()):
                    break
                time.sleep(0.1)

            # Log comparison results
            self.log_comparison_results(command, task_type)

    def openvla_result_callback(self, msg):
        self.results['openvla'] = msg
        self.get_logger().info('Received OpenVLA result')

    def rt2x_result_callback(self, msg):
        self.results['rt2x'] = msg
        self.get_logger().info('Received RT-2X result')

    def octo_result_callback(self, msg):
        self.results['octo'] = msg
        self.get_logger().info('Received Octo result')

    def log_comparison_results(self, command, task_type):
        """Log the comparison results"""
        self.get_logger().info(f'--- Comparison Results for: "{command}" ---')
        for model, result in self.results.items():
            if result is not None:
                self.get_logger().info(f'{model}: {result}')
            else:
                self.get_logger().info(f'{model}: No response received')
        self.get_logger().info('----------------------------------------')

def main(args=None):
    rclpy.init(args=args)

    comparison_node = VLAComparisonNode()

    # Run comparison after a short delay
    comparison_node.create_timer(2.0, comparison_node.run_comparison)

    try:
        rclpy.spin(comparison_node)
    except KeyboardInterrupt:
        pass
    finally:
        comparison_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Success Criteria

- [ ] Successfully implement basic VLA model interfaces
- [ ] Integrate VLA models with ROS 2 systems
- [ ] Process vision and language inputs for robot control
- [ ] Compare different VLA approaches and document tradeoffs

## Troubleshooting

- If VLA models don't load, check PyTorch and CUDA compatibility
- For memory issues, ensure GPU has sufficient VRAM for VLA models
- If ROS communication fails, verify message types and topic names
- For performance issues, consider model optimization or smaller variants

## Additional Resources

- [OpenVLA Research Paper](https://arxiv.org/abs/2403.09631)
- [RT-2X Documentation](https://robotics-transformer-x.github.io/)
- [Octo Framework](https://octo-models.github.io/)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/index)