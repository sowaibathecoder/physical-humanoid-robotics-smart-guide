# Physical AI & Humanoid Robotics – Smart Guide

A comprehensive, textbook-grade reference designed to teach how to design, simulate, and deploy humanoid robots with embodied intelligence using modern ROS 2, physics simulation, NVIDIA Isaac, and Vision-Language-Action systems.

## Overview

This project implements a four-part textbook on Physical AI and Humanoid Robotics following a book-first approach:

- **Part I: The Robotic Nervous System (ROS 2)** - Master ROS 2, the industry-standard middleware that connects everything in humanoid robots
- **Part II: The Digital Twin** - Physics-accurate simulation, sensor modeling, and human-robot interaction using Gazebo and Unity
- **Part III: The AI-Robot Brain** - Perception, navigation, manipulation, and sim-to-real transfer using NVIDIA Isaac Sim and Isaac ROS
- **Part IV: Vision-Language-Action Systems** - LLM-powered planning, speech, vision, and embodied action culminating in an autonomous humanoid capstone system

## Features

- Book-first approach with structured learning path
- Each chapter includes 9 required sections:
  - Conceptual Explanation (intuition-first)
  - Humanoid Robotics Context
  - System-Level Architecture Perspective
  - Practical Reasoning / Design Thinking
  - Common Failure Modes & Debugging Insights
  - Chapter Summary
  - MCQs (5–10, mixed conceptual/applied/scenario-based)
  - Practice Tasks (Beginner → Advanced)
  - Recent Developments / Update Timeline
- Docusaurus-based documentation with GitHub Pages deployment
- Supporting code examples in Python for ROS 2, simulation, and AI systems
- IEEE citation standards with peer-reviewed sources

## Getting Started

1. Install Node.js (v18 or higher)
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the textbook

## Building for Production

```bash
npm run build
```

The built site will be in the `build` directory and can be deployed to any static hosting service.

## Target Audience

- Advanced undergraduate and early graduate students in Computer Science, Robotics, AI, Electrical/Mechanical Engineering
- Software engineers transitioning from digital AI to Physical / Embodied AI
- Hackathon teams and independent developers aiming for production-grade humanoid robotics

## Technical Requirements

- Ubuntu 22.04 for testing code examples
- ROS 2 Humble Hawksbill
- Node.js and npm for documentation site

## Contributing

This project follows a spec-driven development approach using Spec-Kit Plus. All changes should maintain textbook-level depth and adhere to the constitutional principles.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- ROS 2 Development Team
- NVIDIA Isaac Platform
- OpenVLA and other open-source robotics frameworks
- Gazebo Simulation Environment
- Docusaurus Documentation Platform