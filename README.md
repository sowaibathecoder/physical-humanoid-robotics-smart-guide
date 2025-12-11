# Physical AI & Humanoid Robotics Course

Welcome to the "Mastering Physical AI & Humanoid Robotics" course - a comprehensive 13-week hands-on capstone course designed to teach students how to build fully autonomous humanoid robots that accept voice commands, understand intent, plan, navigate, and manipulate objects.

## Course Overview

This course is structured into 4 modules across 13 weeks:

- **Module 1: The Robotic Nervous System (5 weeks)** - Master ROS 2, the industry-standard middleware
- **Module 2: The Digital Twin (2 weeks)** - Simulation environments with Gazebo and Unity
- **Module 3: The AI-Robot Brain (3 weeks)** - Isaac Sim, Isaac ROS GEMs, and navigation
- **Module 4: Vision-Language-Action Models (3 weeks)** - OpenVLA, RT-2X, Octo, and final capstone

## Prerequisites

- Hardware budget: Under $800 (Economy Jetson Kit)
- Software: Ubuntu 22.04 LTS, RTX 4070 Ti, Jetson Orin Nano
- Cloud alternative: AWS g5/g6 instances documented

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/physical-humanoid-robotics-smart-guide.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the course.

## Course Structure

- `docs/` - Course content organized by modules and weeks
- `src/labs/` - Weekly lab templates organized by module
- `static/` - Static assets (images, diagrams, videos)
- `src/` - Docusaurus customization

## Development

This website is built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator.

To build the website and push to GitHub Pages:
```bash
npm run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## Acknowledgments

- NVIDIA Isaac Platform
- ROS 2 Humble Hawksbill
- OpenVLA and other open-source robotics frameworks