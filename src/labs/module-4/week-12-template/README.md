# Week 12 Lab: Whisper, LLMs, and ROS 2 Integration

## Overview

In this lab, you will integrate speech recognition with Whisper into ROS 2, connect Large Language Models (LLMs) with ROS 2 systems, and create natural language interfaces for robots.

## Learning Objectives

- Integrate speech recognition with Whisper into ROS 2
- Connect Large Language Models (LLMs) with ROS 2 systems
- Create natural language interfaces for robots
- Implement multimodal robot control systems

## Prerequisites

- ROS 2 Humble installed
- Python 3.10+ with PyTorch
- Audio recording capabilities
- OpenAI API key (for OpenAI models) or local LLM setup

## Lab Instructions

### Step 1: Install Speech and LLM Dependencies

Install the required packages for speech recognition and LLMs:

```bash
# Install Whisper for speech recognition
pip3 install openai-whisper

# Install PyAudio for audio recording
pip3 install pyaudio

# Install transformers for LLM integration
pip3 install transformers torch accelerate

# Install additional dependencies
pip3 install datasets sentencepiece

# For OpenAI API (optional)
pip3 install openai
```

### Step 2: Basic Whisper Integration

Create a Whisper node `whisper_node.py` for speech recognition:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from sensor_msgs.msg import AudioData
import whisper
import pyaudio
import numpy as np
import threading
import queue
import time

class WhisperNode(Node):
    def __init__(self):
        super().__init__('whisper_node')

        # Publishers
        self.text_publisher = self.create_publisher(String, '/recognized_text', 10)

        # Audio parameters
        self.rate = 16000  # Sample rate
        self.chunk = 8192  # Buffer size
        self.audio_format = pyaudio.paFloat32
        self.channels = 1

        # Initialize Whisper model
        self.get_logger().info('Loading Whisper model...')
        self.model = whisper.load_model("base")  # Use "small" or "medium" for better accuracy
        self.get_logger().info('Whisper model loaded successfully')

        # Audio stream setup
        self.audio = pyaudio.PyAudio()
        self.stream = self.audio.open(
            format=self.audio_format,
            channels=self.channels,
            rate=self.rate,
            input=True,
            frames_per_buffer=self.chunk
        )

        # Audio buffer queue
        self.audio_queue = queue.Queue()

        # Start audio processing thread
        self.audio_thread = threading.Thread(target=self.process_audio, daemon=True)
        self.audio_thread.start()

        # Timer for continuous recognition
        self.timer = self.create_timer(2.0, self.recognize_from_buffer)

        self.get_logger().info('Whisper Node Started')

    def process_audio(self):
        """Continuously read audio data from the stream"""
        while rclpy.ok():
            try:
                # Read audio data from stream
                audio_data = self.stream.read(self.chunk, exception_on_overflow=False)
                audio_np = np.frombuffer(audio_data, dtype=np.float32)

                # Add to queue for processing
                self.audio_queue.put(audio_np)
            except Exception as e:
                self.get_logger().error(f'Error in audio processing: {e}')
                time.sleep(0.1)

    def recognize_from_buffer(self):
        """Process accumulated audio data with Whisper"""
        if self.audio_queue.empty():
            return

        # Collect audio data from queue
        audio_segments = []
        while not self.audio_queue.empty():
            segment = self.audio_queue.get()
            audio_segments.append(segment)

        if len(audio_segments) == 0:
            return

        # Concatenate all audio segments
        full_audio = np.concatenate(audio_segments)

        try:
            # Process with Whisper
            # Trim or pad audio to appropriate length if needed
            if len(full_audio) < 16000:  # Minimum 1 second of audio
                # Pad with zeros if too short
                padded_audio = np.pad(full_audio, (0, 16000 - len(full_audio)), mode='constant')
            else:
                padded_audio = full_audio

            # Perform recognition
            result = self.model.transcribe(padded_audio, fp16=False)  # Set fp16=False for CPU

            if result and 'text' in result and result['text'].strip():
                recognized_text = result['text'].strip()
                self.get_logger().info(f'Recognized: {recognized_text}')

                # Publish recognized text
                msg = String()
                msg.data = recognized_text
                self.text_publisher.publish(msg)

        except Exception as e:
            self.get_logger().error(f'Error in Whisper recognition: {e}')

    def destroy_node(self):
        """Clean up resources"""
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
        if self.audio:
            self.audio.terminate()
        super().destroy_node()

def main(args=None):
    rclpy.init(args=args)

    whisper_node = WhisperNode()

    try:
        rclpy.spin(whisper_node)
    except KeyboardInterrupt:
        pass
    finally:
        whisper_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 3: LLM Integration Node

Create an LLM integration node `llm_node.py`:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import json

class LLMNode(Node):
    def __init__(self):
        super().__init__('llm_node')

        # Subscribers
        self.text_subscription = self.create_subscription(
            String,
            '/recognized_text',
            self.text_callback,
            10
        )

        # Publishers
        self.robot_command_publisher = self.create_publisher(
            String,
            '/robot_command',
            10
        )

        self.cmd_vel_publisher = self.create_publisher(
            Twist,
            '/cmd_vel',
            10
        )

        # Initialize LLM (using a smaller model for this example)
        self.get_logger().info('Loading LLM model...')

        try:
            # Using a smaller model that's more suitable for this task
            # In practice, you might use models like "microsoft/DialoGPT-medium" or similar
            model_name = "microsoft/DialoGPT-medium"  # Example model
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForCausalLM.from_pretrained(model_name)

            # Add padding token if it doesn't exist
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token

            self.get_logger().info('LLM model loaded successfully')
        except Exception as e:
            self.get_logger().error(f'Failed to load LLM model: {e}')
            # Use a mock model for demonstration
            self.model = None
            self.tokenizer = None

        # Conversation history for context
        self.conversation_history = []

        self.get_logger().info('LLM Node Started')

    def text_callback(self, msg):
        """Process recognized text with LLM"""
        user_input = msg.data
        self.get_logger().info(f'Received text: {user_input}')

        # Process with LLM
        response = self.process_with_llm(user_input)

        if response:
            self.get_logger().info(f'LLM response: {response}')

            # Parse the response for robot commands
            robot_cmd = self.parse_robot_command(response)
            if robot_cmd:
                cmd_msg = String()
                cmd_msg.data = robot_cmd
                self.robot_command_publisher.publish(cmd_msg)

    def process_with_llm(self, user_input):
        """Process user input with LLM"""
        try:
            if self.model is None:
                # Mock response for demonstration
                return self.mock_llm_response(user_input)

            # Add user input to conversation history
            self.conversation_history.append(user_input)

            # Create prompt for the model
            # In a real implementation, you would format this properly for your specific model
            prompt = " ".join(self.conversation_history[-5:])  # Use last 5 exchanges

            # Tokenize the input
            inputs = self.tokenizer.encode(prompt + self.tokenizer.eos_token, return_tensors='pt')

            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_length=len(inputs[0]) + 50,
                    num_return_sequences=1,
                    pad_token_id=self.tokenizer.eos_token_id,
                    no_repeat_ngram_size=2,
                    do_sample=True,
                    temperature=0.7
                )

            # Decode the response
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

            # Extract just the new part (after the input)
            if prompt in response:
                response = response[len(prompt):].strip()

            # Add to conversation history
            self.conversation_history.append(response)

            # Keep conversation history to a reasonable size
            if len(self.conversation_history) > 10:
                self.conversation_history = self.conversation_history[-10:]

            return response

        except Exception as e:
            self.get_logger().error(f'Error in LLM processing: {e}')
            return f"I encountered an error: {e}"

    def mock_llm_response(self, user_input):
        """Mock LLM response for demonstration"""
        # Simple rule-based response for demonstration
        user_lower = user_input.lower()

        if "move" in user_lower or "go" in user_lower or "forward" in user_lower:
            return "The robot should move forward. Command: move_forward"
        elif "turn" in user_lower or "left" in user_lower or "right" in user_lower:
            return "The robot should turn. Command: turn_direction"
        elif "stop" in user_lower:
            return "The robot should stop. Command: stop"
        elif "pick" in user_lower or "grasp" in user_lower:
            return "The robot should pick up an object. Command: pick_object"
        else:
            return f"I understand you said: '{user_input}'. I can help with robot commands."

    def parse_robot_command(self, llm_response):
        """Parse LLM response to extract robot commands"""
        try:
            # Simple parsing - in practice, this would be more sophisticated
            response_lower = llm_response.lower()

            if "move_forward" in response_lower or "forward" in response_lower:
                cmd_vel = Twist()
                cmd_vel.linear.x = 0.2
                cmd_vel.angular.z = 0.0
                self.cmd_vel_publisher.publish(cmd_vel)
                return "move_forward"
            elif "turn_left" in response_lower:
                cmd_vel = Twist()
                cmd_vel.linear.x = 0.0
                cmd_vel.angular.z = 0.3
                self.cmd_vel_publisher.publish(cmd_vel)
                return "turn_left"
            elif "turn_right" in response_lower:
                cmd_vel = Twist()
                cmd_vel.linear.x = 0.0
                cmd_vel.angular.z = -0.3
                self.cmd_vel_publisher.publish(cmd_vel)
                return "turn_right"
            elif "stop" in response_lower:
                cmd_vel = Twist()
                cmd_vel.linear.x = 0.0
                cmd_vel.angular.z = 0.0
                self.cmd_vel_publisher.publish(cmd_vel)
                return "stop"
            else:
                return "no_command"

        except Exception as e:
            self.get_logger().error(f'Error parsing robot command: {e}')
            return "error"

def main(args=None):
    rclpy.init(args=args)

    llm_node = LLMNode()

    try:
        rclpy.spin(llm_node)
    except KeyboardInterrupt:
        pass
    finally:
        llm_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 4: Voice Command Processor

Create a voice command processor `voice_command_processor.py`:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist
import json
import re

class VoiceCommandProcessor(Node):
    def __init__(self):
        super().__init__('voice_command_processor')

        # Subscribers
        self.text_subscription = self.create_subscription(
            String,
            '/recognized_text',
            self.text_callback,
            10
        )

        # Publishers
        self.cmd_vel_publisher = self.create_publisher(
            Twist,
            '/cmd_vel',
            10
        )

        self.action_publisher = self.create_publisher(
            String,
            '/robot_action',
            10
        )

        self.get_logger().info('Voice Command Processor Started')

    def text_callback(self, msg):
        """Process recognized text and convert to robot commands"""
        text = msg.data.lower().strip()
        self.get_logger().info(f'Processing voice command: {text}')

        # Parse the command
        command = self.parse_command(text)

        if command:
            self.execute_command(command, text)

    def parse_command(self, text):
        """Parse natural language command to robot action"""
        # Navigation commands
        if any(word in text for word in ["go", "move", "forward", "ahead"]):
            if "forward" in text or "ahead" in text:
                return {"type": "navigation", "action": "forward", "value": 0.2}
            elif "backward" in text or "back" in text:
                return {"type": "navigation", "action": "backward", "value": -0.2}
            elif "left" in text:
                return {"type": "navigation", "action": "turn_left", "value": 0.3}
            elif "right" in text:
                return {"type": "navigation", "action": "turn_right", "value": -0.3}

        # Speed commands
        if "slow" in text:
            return {"type": "speed", "action": "slow", "value": 0.1}
        elif "fast" in text or "quick" in text:
            return {"type": "speed", "action": "fast", "value": 0.5}

        # Stop command
        if any(word in text for word in ["stop", "halt", "pause"]):
            return {"type": "stop", "action": "stop", "value": 0.0}

        # Manipulation commands
        if any(word in text for word in ["pick", "grasp", "take", "grab"]):
            obj = self.extract_object(text)
            return {"type": "manipulation", "action": "pick", "object": obj}

        if any(word in text for word in ["place", "drop", "release", "put"]):
            location = self.extract_location(text)
            return {"type": "manipulation", "action": "place", "location": location}

        # Complex commands
        if "to the" in text:
            # "Go to the kitchen", "Take the cup to the table"
            destination = self.extract_location(text)
            if destination:
                return {"type": "navigation", "action": "goto", "destination": destination}

        return None

    def extract_object(self, text):
        """Extract object from command"""
        # Simple object extraction - in practice, this would be more sophisticated
        objects = ["cup", "bottle", "box", "ball", "book", "phone", "toy"]
        for obj in objects:
            if obj in text:
                return obj
        return "object"

    def extract_location(self, text):
        """Extract location from command"""
        # Simple location extraction
        locations = ["kitchen", "living room", "bedroom", "table", "shelf", "cabinet", "door"]
        for loc in locations:
            if loc in text:
                return loc
        return "location"

    def execute_command(self, command, original_text):
        """Execute the parsed command"""
        cmd_type = command["type"]
        action = command["action"]

        if cmd_type == "navigation":
            if action == "forward":
                self.move_robot(linear_x=command["value"], angular_z=0.0)
            elif action == "backward":
                self.move_robot(linear_x=command["value"], angular_z=0.0)
            elif action == "turn_left":
                self.move_robot(linear_x=0.0, angular_z=command["value"])
            elif action == "turn_right":
                self.move_robot(linear_x=0.0, angular_z=command["value"])
            elif action == "goto":
                self.get_logger().info(f'Navigating to {command["destination"]}')
                # In a real implementation, this would send a navigation goal

        elif cmd_type == "stop":
            self.move_robot(linear_x=0.0, angular_z=0.0)

        elif cmd_type == "manipulation":
            action_msg = String()
            action_msg.data = f'{action}_{command.get("object", "object")}_{command.get("location", "location")}'
            self.action_publisher.publish(action_msg)

        elif cmd_type == "speed":
            # In a real implementation, this would adjust robot speed parameters
            self.get_logger().info(f'Setting speed to {action}')

        self.get_logger().info(f'Executed command: {command}')

    def move_robot(self, linear_x=0.0, angular_z=0.0):
        """Send movement command to robot"""
        cmd_vel = Twist()
        cmd_vel.linear.x = linear_x
        cmd_vel.angular.z = angular_z
        self.cmd_vel_publisher.publish(cmd_vel)
        self.get_logger().info(f'Moving robot: linear.x={linear_x}, angular.z={angular_z}')

def main(args=None):
    rclpy.init(args=args)

    processor = VoiceCommandProcessor()

    try:
        rclpy.spin(processor)
    except KeyboardInterrupt:
        pass
    finally:
        processor.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 5: Integration Launch File

Create a launch file `speech_llm_integration.launch.py`:

```python
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration

def generate_launch_description():
    # Launch arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='false')

    return LaunchDescription([
        # Whisper node for speech recognition
        Node(
            package='my_speech_package',
            executable='whisper_node.py',
            name='whisper_node',
            parameters=[{'use_sim_time': use_sim_time}],
            output='screen'
        ),

        # LLM node for language understanding
        Node(
            package='my_speech_package',
            executable='llm_node.py',
            name='llm_node',
            parameters=[{'use_sim_time': use_sim_time}],
            output='screen'
        ),

        # Voice command processor
        Node(
            package='my_speech_package',
            executable='voice_command_processor.py',
            name='voice_command_processor',
            parameters=[{'use_sim_time': use_sim_time}],
            output='screen'
        )
    ])
```

### Step 6: Test Speech and LLM Integration

Test your speech and LLM integration:

```bash
# Terminal 1: Launch the speech and LLM nodes
ros2 launch my_speech_package speech_llm_integration.launch.py

# Terminal 2: Simulate recognized speech (for testing without microphone)
ros2 topic pub /recognized_text std_msgs/String "data: 'move forward to the kitchen'"

# Terminal 3: Check robot commands
ros2 topic echo /robot_command

# Terminal 4: Check robot movement
ros2 topic echo /cmd_vel
```

### Step 7: Create Evaluation Script

Create an evaluation script `speech_evaluation.py` to test the system:

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist
import time

class SpeechEvaluationNode(Node):
    def __init__(self):
        super().__init__('speech_evaluation_node')

        # Publishers
        self.text_publisher = self.create_publisher(String, '/recognized_text', 10)

        # Subscribers
        self.cmd_vel_subscriber = self.create_subscription(
            Twist,
            '/cmd_vel',
            self.cmd_vel_callback,
            10
        )

        self.robot_command_subscriber = self.create_subscription(
            String,
            '/robot_command',
            self.robot_command_callback,
            10
        )

        self.last_cmd_vel = None
        self.last_robot_command = None

        self.get_logger().info('Speech Evaluation Node Started')

    def cmd_vel_callback(self, msg):
        """Store the last received cmd_vel message"""
        self.last_cmd_vel = msg

    def robot_command_callback(self, msg):
        """Store the last received robot command"""
        self.last_robot_command = msg.data

    def run_evaluation(self):
        """Run evaluation tests"""
        test_commands = [
            ("move forward", "navigation"),
            ("turn left", "navigation"),
            ("stop", "stop"),
            ("pick up the red cup", "manipulation")
        ]

        for command, expected_type in test_commands:
            self.get_logger().info(f'--- Testing command: "{command}" ---')

            # Reset last values
            self.last_cmd_vel = None
            self.last_robot_command = None

            # Publish test command
            text_msg = String()
            text_msg.data = command
            self.text_publisher.publish(text_msg)

            # Wait for response (with timeout)
            start_time = time.time()
            timeout = 5.0  # 5 seconds timeout

            while time.time() - start_time < timeout:
                if self.last_cmd_vel is not None or self.last_robot_command is not None:
                    break
                time.sleep(0.1)

            # Log results
            if self.last_cmd_vel is not None:
                self.get_logger().info(f'Command resulted in cmd_vel: linear.x={self.last_cmd_vel.linear.x}, angular.z={self.last_cmd_vel.angular.z}')
            else:
                self.get_logger().info('No cmd_vel received')

            if self.last_robot_command is not None:
                self.get_logger().info(f'Robot command: {self.last_robot_command}')
            else:
                self.get_logger().info('No robot command received')

            self.get_logger().info('----------------------------------------')

def main(args=None):
    rclpy.init(args=args)

    evaluation_node = SpeechEvaluationNode()

    # Run evaluation after a short delay
    evaluation_node.create_timer(2.0, evaluation_node.run_evaluation)

    try:
        rclpy.spin(evaluation_node)
    except KeyboardInterrupt:
        pass
    finally:
        evaluation_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Success Criteria

- [ ] Successfully integrate Whisper for speech recognition
- [ ] Connect LLMs with ROS 2 systems
- [ ] Create natural language interfaces for robot control
- [ ] Process voice commands and execute robot actions

## Troubleshooting

- If Whisper doesn't work, check audio device permissions and PyAudio installation
- For LLM memory issues, use smaller models or optimize GPU usage
- If audio processing is slow, reduce model size or optimize buffer handling
- For ROS communication issues, verify topic names and message types

## Additional Resources

- [OpenAI Whisper Documentation](https://github.com/openai/whisper)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/index)
- [PyAudio Documentation](https://pyaudio.readthedocs.io/)
- [ROS 2 Audio Processing Tutorials](https://github.com/ros-speech-recognition)