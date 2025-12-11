---
sidebar_position: 2
---

# Week 12: Whisper, LLMs, and ROS 2 Integration

## Learning Objectives

By the end of this week, you will be able to:
- Integrate speech recognition with Whisper into ROS 2
- Connect Large Language Models (LLMs) with ROS 2 systems
- Create natural language interfaces for robots
- Implement multimodal robot control systems

## Introduction to Speech Recognition in Robotics

Speech recognition enables natural human-robot interaction:

- **Voice Commands**: Natural language robot control
- **Dialogue Systems**: Conversational interfaces
- **Accessibility**: Alternative interaction modality
- **Hands-Free Operation**: Control without physical input

## OpenAI Whisper for Speech Recognition

Whisper provides robust speech-to-text capabilities:

- **Multilingual**: Supports multiple languages
- **Robust**: Works in various acoustic conditions
- **Open Source**: Available for research and development
- **Real-time**: Capable of streaming recognition

### Whisper Integration Example

Basic Whisper integration with ROS 2:

```python
import rclpy
from rclpy.node import Node
import whisper
import pyaudio
import numpy as np
from std_msgs.msg import String

class WhisperNode(Node):
    def __init__(self):
        super().__init__('whisper_node')

        # Load Whisper model
        self.model = whisper.load_model("base")

        # Audio stream setup
        self.audio = pyaudio.PyAudio()
        self.stream = self.audio.open(
            format=pyaudio.paFloat32,
            channels=1,
            rate=16000,
            input=True,
            frames_per_buffer=8000
        )

        # Publisher for recognized text
        self.text_publisher = self.create_publisher(String, 'recognized_text', 10)

        # Timer for continuous recognition
        self.timer = self.create_timer(5.0, self.recognize_speech)

    def recognize_speech(self):
        # Read audio data
        audio_data = self.stream.read(16000)  # 1 second of audio
        audio_np = np.frombuffer(audio_data, dtype=np.float32)

        # Convert to Whisper format
        audio_tensor = whisper.pad_or_trim(audio_np)
        mel = whisper.log_mel_spectrogram(audio_tensor).to(self.model.device)

        # Perform recognition
        options = whisper.DecodingOptions()
        result = whisper.decode(self.model, mel, options)

        # Publish recognized text
        msg = String()
        msg.data = result.text
        self.text_publisher.publish(msg)
        self.get_logger().info(f'Recognized: {result.text}')
```

## Large Language Models for Robot Control

LLMs can interpret natural language and generate robot actions:

- **Command Interpretation**: Understanding user intent
- **Task Planning**: Breaking down complex commands
- **Context Awareness**: Using environmental information
- **Response Generation**: Natural language feedback

## Integration Patterns

Common patterns for LLM integration:

- **Prompt Engineering**: Crafting effective prompts for robot control
- **Chain of Thought**: Breaking complex tasks into steps
- **Tool Use**: LLMs calling ROS 2 services and actions
- **Memory**: Maintaining conversation context

## Lab Exercise

Complete the lab exercise for this week to practice speech and LLM integration:

- Navigate to the lab template: `src/labs/module-4/week-12-template/`
- Follow the instructions in the README.md file
- Implement a voice-controlled robot system

## Resources

- [OpenAI Whisper Documentation](https://github.com/openai/whisper)
- [ROS 2 Speech Recognition Tutorials](https://github.com/ros-speech-recognition)
- [LLM Integration Patterns](https://huggingface.co/docs/transformers/tasks/summarization)

## Assessment

Complete the quiz for this week to verify your understanding of speech and LLM integration.