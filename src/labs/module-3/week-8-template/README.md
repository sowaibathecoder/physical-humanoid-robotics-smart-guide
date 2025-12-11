# Week 8 Lab: Isaac Sim and Omniverse for Advanced Simulation

## Overview

In this lab, you will set up NVIDIA Isaac Sim with Omniverse and create photorealistic simulation environments for generating synthetic data for AI training.

## Learning Objectives

- Install and configure NVIDIA Isaac Sim
- Create photorealistic simulation environments
- Implement perception systems in Isaac Sim
- Generate synthetic data for AI training

## Prerequisites

- NVIDIA GPU with RTX capabilities
- Isaac Sim installed (requires NVIDIA Developer account)
- Omniverse installed
- CUDA-compatible system

## Lab Instructions

### Step 1: Install Isaac Sim

1. Download Isaac Sim from the [NVIDIA Developer website](https://developer.nvidia.com/isaac-sim)
2. Follow the installation instructions for your platform
3. Verify installation by launching Isaac Sim

### Step 2: Basic Isaac Sim Script

Create a Python script `basic_isaac_sim.py` to understand the basics:

```python
import omni
from omni.isaac.kit import SimulationApp

# Initialize Isaac Sim with configuration
config = {
    "headless": False,  # Set to True for headless execution
    "render": "RayTracedLightMap"  # Use RTX rendering
}
simulation_app = SimulationApp(config)

# Import required modules after app initialization
from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.nucleus import get_assets_root_path
from omni.isaac.core.utils.prims import create_primitive
from omni.isaac.core.utils.viewports import set_camera_view
import numpy as np

# Create world instance
world = World(stage_units_in_meters=1.0)

# Get assets root path
assets_root_path = get_assets_root_path()
if assets_root_path is None:
    print("Could not find Isaac Sim assets. Please check your installation.")

# Add a simple cube to the stage
cube = create_primitive(
    prim_path="/World/random_cube",
    primitive_props={"size": 0.5},
    physics_props={"mass": 0.5},
    visual_props={"color": np.array([0.5, 0.5, 0.5])}
)

# Set camera view for better visualization
set_camera_view(eye=np.array([2, 2, 2]), target=np.array([0, 0, 0]))

# Reset the world and run simulation
world.reset()
for i in range(500):
    world.step(render=True)
    if i % 100 == 0:
        print(f"Simulation step: {i}")

# Close the simulation app
simulation_app.close()
```

### Step 3: Create a Robot in Isaac Sim

Create a script `robot_simulation.py` to add a robot to the simulation:

```python
import omni
from omni.isaac.kit import SimulationApp

# Initialize simulation app
config = {"headless": False}
simulation_app = SimulationApp(config)

# Import Isaac Sim modules
from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.nucleus import get_assets_root_path
from omni.isaac.franka import Franka
from omni.isaac.core.utils.types import ArticulationAction
import numpy as np

# Create world
my_world = World(stage_units_in_meters=1.0)

# Get assets root path
assets_root_path = get_assets_root_path()

if assets_root_path is not None:
    # Add a simple room from the assets library
    add_reference_to_stage(
        usd_path=assets_root_path + "/Isaac/Environments/Simple_Room/simple_room.usd",
        prim_path="/World/simple_room"
    )

    # Add a Franka robot
    my_franka = my_world.scene.add(
        Franka(
            prim_path="/World/Franka",
            name="my_franka",
            position=np.array([0, 0, 0]),
            orientation=np.array([1, 0, 0, 0])
        )
    )

# Reset the world
my_world.reset()

# Run simulation with robot control
for i in range(1000):
    if my_world.is_playing():
        if i > 200:
            # Move the robot's joints to a target position
            my_franka.apply_articulation_actions(
                ArticulationAction(
                    joint_positions=np.array([-0.5, -1.0, 0.0, -2.0, 0.0, 1.5, 0.75]),
                    joint_indices=[0, 1, 2, 3, 4, 5, 6]
                )
            )

    my_world.step(render=True)

simulation_app.close()
```

### Step 4: Implement Perception System

Create a script `perception_system.py` to implement perception capabilities:

```python
import omni
from omni.isaac.kit import SimulationApp

# Initialize simulation app
config = {"headless": False}
simulation_app = SimulationApp(config)

from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.nucleus import get_assets_root_path
from omni.isaac.sensor import Camera
from omni.isaac.core.utils.prims import create_primitive
import numpy as np
import carb

# Create world
my_world = World(stage_units_in_meters=1.0)

# Get assets root path
assets_root_path = get_assets_root_path()

# Add objects to the scene
table = create_primitive(
    prim_path="/World/table",
    primitive_props={"size": 1.0},
    position=np.array([0, 0, 0]),
    orientation=np.array([0, 0, 0, 1]),
    visual_props={"color": np.array([0.8, 0.8, 0.8])}
)

# Add objects on the table
red_box = create_primitive(
    prim_path="/World/red_box",
    primitive_props={"size": 0.1},
    position=np.array([0.2, 0.2, 0.1]),
    visual_props={"color": np.array([1, 0, 0])}
)

blue_box = create_primitive(
    prim_path="/World/blue_box",
    primitive_props={"size": 0.1},
    position=np.array([-0.2, -0.2, 0.1]),
    visual_props={"color": np.array([0, 0, 1])}
)

# Create a camera sensor
camera = Camera(
    prim_path="/World/Camera",
    position=np.array([1.0, 1.0, 1.0]),
    orientation=np.array([0.5, -0.5, -0.5, 0.5])  # Rotate to look at the scene
)

# Add camera to the world
my_world.scene.add_sensor(name="camera", sensor=camera)

# Reset world
my_world.reset()

# Enable camera to start capturing data
camera.initialize()
camera.add_raw_sensor_data_to_frame()

for i in range(500):
    my_world.step(render=True)

    if i % 100 == 0:
        # Get RGB data from camera
        rgb_data = camera.get_rgb()
        if rgb_data is not None:
            print(f"RGB data shape: {rgb_data.shape}")

        # Get pose data
        pose = camera.get_world_pose()
        print(f"Camera pose: position={pose[0]}, orientation={pose[1]}")

simulation_app.close()
```

### Step 5: Generate Synthetic Data

Create a script `synthetic_data_generation.py` to generate training data:

```python
import omni
from omni.isaac.kit import SimulationApp

# Initialize simulation app
config = {"headless": False}
simulation_app = SimulationApp(config)

from omni.isaac.core import World
from omni.isaac.core.utils.prims import create_primitive
from omni.isaac.sensor import Camera
from omni.isaac.core.utils.viewports import set_camera_view
import numpy as np
import cv2
import os

# Create world
my_world = World(stage_units_in_meters=1.0)

# Create objects with random positions and colors
def create_random_object(index):
    position = np.array([
        np.random.uniform(-0.5, 0.5),
        np.random.uniform(-0.5, 0.5),
        np.random.uniform(0.1, 0.5)
    ])

    color = np.array([
        np.random.uniform(0.0, 1.0),
        np.random.uniform(0.0, 1.0),
        np.random.uniform(0.0, 1.0)
    ])

    prim_path = f"/World/object_{index}"
    create_primitive(
        prim_path=prim_path,
        primitive_props={"size": np.random.uniform(0.05, 0.2)},
        position=position,
        visual_props={"color": color}
    )

# Create multiple random objects
for i in range(5):
    create_random_object(i)

# Create camera
camera = Camera(
    prim_path="/World/Camera",
    position=np.array([1.0, 0.0, 1.0]),
    orientation=np.array([0.707, 0, -0.707, 0])  # Look down at the objects
)

my_world.scene.add_sensor(name="camera", sensor=camera)

# Reset world
my_world.reset()
camera.initialize()

# Create directory for saving data
data_dir = "synthetic_data"
os.makedirs(data_dir, exist_ok=True)

# Generate multiple frames with different object configurations
for frame_idx in range(10):
    # Move objects to new random positions
    for i in range(5):
        new_pos = np.array([
            np.random.uniform(-0.5, 0.5),
            np.random.uniform(-0.5, 0.5),
            np.random.uniform(0.1, 0.5)
        ])
        # Update object position (simplified - in real implementation you'd need to get the prim and set position)

    my_world.step(render=True)

    # Get and save RGB image
    rgb_data = camera.get_rgb()
    if rgb_data is not None:
        # Convert to OpenCV format and save
        rgb_image = cv2.cvtColor(rgb_data, cv2.COLOR_RGB2BGR)
        cv2.imwrite(f"{data_dir}/rgb_{frame_idx:04d}.png", rgb_image)

        # Get and save depth data if available
        depth_data = camera.get_depth()
        if depth_data is not None:
            cv2.imwrite(f"{data_dir}/depth_{frame_idx:04d}.png", (depth_data * 255).astype(np.uint8))

    print(f"Generated frame {frame_idx + 1}/10")

simulation_app.close()
```

### Step 6: Test Isaac Sim Integration

Run your Isaac Sim scripts to verify they work correctly:

```bash
# Make sure Isaac Sim is properly installed and sourced
cd /path/to/isaac-sim
source setup_conda_env.sh  # or the appropriate setup script

# Run the basic script
python basic_isaac_sim.py
```

## Success Criteria

- [ ] Successfully install and run Isaac Sim
- [ ] Create a basic simulation with objects
- [ ] Implement perception systems with cameras
- [ ] Generate synthetic data for AI training

## Troubleshooting

- If Isaac Sim doesn't start, verify GPU compatibility and drivers
- For rendering issues, check that RTX features are properly configured
- If scripts fail, ensure Isaac Sim Python modules are in the path
- For camera issues, verify camera positioning and orientation

## Additional Resources

- [Isaac Sim Documentation](https://docs.omniverse.nvidia.com/isaacsim/latest/overview.html)
- [Omniverse Kit API Reference](https://docs.omniverse.nvidia.com/py/isaacsim/source/extensions/omni.isaac.kit/docs/index.html)
- [Isaac Sim Samples](https://github.com/NVIDIA-Omniverse/Isaac-Samples)