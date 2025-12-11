# Quickstart Guide: Mastering Physical AI & Humanoid Robotics Course

## Overview
This guide provides the essential steps to get started with developing and running the "Mastering Physical AI & Humanoid Robotics" course content. The course is built as a Docusaurus-based documentation site with integrated ROS 2 lab templates.

## Prerequisites

### System Requirements
- **Operating System**: Ubuntu 22.04 LTS (recommended) or Windows 10/11 with WSL2
- **Processor**: Multi-core processor (Intel i5/Ryzen 5 or better)
- **Memory**: 16GB RAM minimum, 32GB recommended
- **Storage**: 50GB free space minimum
- **GPU**: NVIDIA GPU with CUDA support (RTX 4070 Ti or equivalent recommended)

### Software Requirements
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher (usually bundled with Node.js)
- **Python**: Version 3.10 or higher
- **ROS 2**: Humble Hawksbill distribution
- **Git**: Version 2.25 or higher
- **Docker**: Latest stable version (optional but recommended)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/[your-org]/physical-humanoid-robotics-smart-guide.git
cd physical-humanoid-robotics-smart-guide
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Set up ROS 2 Environment
```bash
# Source ROS 2 Humble
source /opt/ros/humble/setup.bash

# Create a colcon workspace for the course labs
mkdir -p src/labs_ws/src
cd src/labs_ws

# Build the workspace (initially empty, will be populated with lab code)
colcon build
source install/setup.bash
```

### 4. Install Python Dependencies for Labs
```bash
# Navigate to the labs directory
cd src/labs/

# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install common dependencies
pip install -r requirements.txt  # If exists, otherwise install individually:
pip install rclpy numpy matplotlib pyyaml
```

### 5. Install NVIDIA Isaac Sim (Optional but Recommended)
1. Download Isaac Sim from NVIDIA Developer website
2. Follow installation instructions for your platform
3. Verify installation:
```bash
# Check Isaac Sim version
isaac-sim --version
```

## Running the Course Locally

### 1. Start the Docusaurus Development Server
```bash
npm start
```
This will start the development server and open the course in your browser at `http://localhost:3000`.

### 2. Running Individual Labs
Each lab is organized in the `src/labs/` directory by module and week:

```bash
# Example: Running Week 1 Lab
cd src/labs/module-1/week-1-template
python3 lab_script.py
```

### 3. Building the Full Site
```bash
npm run build
```
This creates a static build of the course in the `build/` directory.

## Course Structure

### Content Organization
```
docs/
├── module-1-the-robotic-nervous-system/
│   ├── week-1-foundations-of-physical-ai.md
│   ├── week-2-ros2-concepts.md
│   └── ...
├── module-2-the-digital-twin/
│   ├── week-6-gazebo-ignition.md
│   └── ...
└── ...
```

### Lab Template Structure
```
src/labs/
├── module-1/
│   ├── week-1-template/
│   │   ├── README.md
│   │   ├── lab_script.py
│   │   ├── config/
│   │   └── tests/
│   └── ...
└── ...
```

## Development Workflow

### 1. Adding New Content
1. Create a new markdown file in the appropriate module/week directory in `docs/`
2. Follow the established content template
3. Add citations in IEEE numeric style
4. Update `sidebars.js` to include the new page in navigation

### 2. Creating New Lab Templates
1. Create a new directory under `src/labs/module-X/` named `week-X-template`
2. Include a README.md with instructions
3. Add the main lab script (typically Python for ROS 2)
4. Include any necessary configuration files
5. Add tests to verify the lab works correctly

### 3. Testing Changes
```bash
# Test Docusaurus build
npm run build

# Run site locally
npm start

# Run lab-specific tests
cd src/labs/module-X/week-X-template
python3 -m pytest tests/
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start local development server |
| `npm run build` | Build static site |
| `npm run serve` | Serve built site locally |
| `npm run docusaurus clear` | Clear Docusaurus cache |
| `npm run docusaurus swizzle` | Customize Docusaurus components |

## Troubleshooting

### Common Issues and Solutions

1. **Docusaurus fails to start**
   - Clear cache: `npm run docusaurus clear`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

2. **ROS 2 packages not found**
   - Ensure ROS 2 environment is sourced: `source /opt/ros/humble/setup.bash`
   - Check workspace is built: `cd src/labs_ws && colcon build`

3. **Lab dependencies missing**
   - Activate Python environment: `source venv/bin/activate`
   - Install missing packages: `pip install [package-name]`

## Next Steps

1. Review the [full course content](../docs/module-1-the-robotic-nervous-system/week-1-foundations-of-physical-ai.md) in the docs directory
2. Explore the [lab templates](../src/labs/) to understand the hands-on exercises
3. Check the [project plan](plan.md) for detailed implementation roadmap
4. Review the [data model](data-model.md) for content structure details