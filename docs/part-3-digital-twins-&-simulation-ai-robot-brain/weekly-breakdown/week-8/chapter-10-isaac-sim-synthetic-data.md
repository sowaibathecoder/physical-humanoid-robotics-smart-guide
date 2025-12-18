---
id: chapter-10-isaac-sim-synthetic-data
title: "Chapter 10: Isaac Sim & Synthetic Data"
sidebar_position: 3
description: "Using NVIDIA Isaac Sim for synthetic data generation and perception training"
---

# Chapter 10: Isaac Sim & Synthetic Data

## Learning Objectives
After completing this chapter, students will be able to:
1. Set up and configure NVIDIA Isaac Sim for humanoid robotics simulation
2. Generate high-quality synthetic sensor data for computer vision and perception tasks
3. Create diverse training datasets using domain randomization techniques
4. Implement synthetic-to-real transfer learning for humanoid robot perception systems
5. Validate synthetic data quality and assess transferability to real-world applications

## Conceptual Explanation
NVIDIA Isaac Sim represents a paradigm shift in robotics simulation, leveraging the powerful Omniverse platform and RTX real-time ray tracing technology to create photorealistic simulation environments. Unlike traditional physics simulators focused primarily on kinematic and dynamic accuracy, Isaac Sim emphasizes visual realism, making it particularly valuable for developing perception systems that must operate in real-world environments.

Isaac Sim's key advantages for humanoid robotics include:
- **Photorealistic Rendering**: RTX-accelerated rendering that closely matches real-world visual conditions
- **Synthetic Data Generation**: High-quality labeled data for training computer vision models
- **Domain Randomization**: Techniques to improve model robustness and transferability
- **Multi-sensor Simulation**: Accurate simulation of cameras, LIDAR, IMU, and other sensors
- **Realistic Physics**: Accurate physics simulation combined with visual realism

The synthetic data generation capabilities of Isaac Sim are particularly valuable for humanoid robots, which must perceive and interact with complex, unstructured environments. The platform enables the creation of diverse, labeled datasets that would be expensive or impossible to collect in the real world, including:
- Various lighting conditions and times of day
- Different weather conditions and atmospheric effects
- Diverse object appearances and textures
- Complex human-robot interaction scenarios
- Rare or dangerous situations for safety training

For perception system development, Isaac Sim bridges the "reality gap" between synthetic and real data through domain randomization and advanced rendering techniques, enabling models trained on synthetic data to perform effectively on real robots.

## Technical Content
### Isaac Sim Environment Setup
```python
# isaac_sim_setup.py - Setting up Isaac Sim environment for humanoid robotics
import omni
from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.nucleus import get_assets_root_path
from omni.isaac.core.utils.prims import create_prim
from omni.isaac.core.utils.semantics import add_semantics
from omni.isaac.sensor import Camera
import carb
import numpy as np

class IsaacSimHumanoidEnvironment:
    def __init__(self):
        # Initialize Isaac Sim world
        self.world = World(stage_units_in_meters=1.0)
        self.scene_path = "/World"

        # Robot and environment properties
        self.robot_path = "/World/Robot"
        self.humanoid_robot = None

        # Sensor configurations
        self.cameras = {}
        self.lidar_sensors = {}

        # Synthetic data generation parameters
        self.domain_randomization = True
        self.randomization_params = {
            'lighting': True,
            'textures': True,
            'object_appearances': True,
            'camera_noise': True
        }

        self.setup_environment()

    def setup_environment(self):
        """Setup the Isaac Sim environment with humanoid robot and sensors"""
        # Create ground plane
        self.create_ground_plane()

        # Add lighting
        self.setup_lighting()

        # Add humanoid robot (using URDF import or USD)
        self.load_humanoid_robot()

        # Setup sensors
        self.setup_sensors()

        # Configure physics properties
        self.configure_physics()

    def create_ground_plane(self):
        """Create ground plane with configurable properties"""
        # Create ground plane primitive
        create_prim(
            prim_path="/World/ground_plane",
            prim_type="Plane",
            position=np.array([0, 0, 0]),
            orientation=np.array([0, 0, 0, 1]),
            scale=np.array([10, 10, 1])
        )

        # Add material properties
        self.add_material_to_prim("/World/ground_plane", "ground_material")

    def setup_lighting(self):
        """Setup realistic lighting environment"""
        # Add dome light for environment lighting
        dome_light = create_prim(
            prim_path="/World/DomeLight",
            prim_type="DomeLight",
            position=np.array([0, 0, 0])
        )

        # Configure dome light properties
        from pxr import UsdLux
        dome_light.GetAttribute("inputs:color").Set((0.2, 0.2, 0.2))
        dome_light.GetAttribute("inputs:intensity").Set(3000)

        # Add directional light for primary illumination
        directional_light = create_prim(
            prim_path="/World/DirectionalLight",
            prim_type="DistantLight",
            position=np.array([5, 5, 10]),
            orientation=np.array([0, 0, -0.707, 0.707])  # Pointing down
        )

        directional_light.GetAttribute("inputs:intensity").Set(1500)

    def load_humanoid_robot(self):
        """Load humanoid robot model into the scene"""
        # Option 1: Load from USD file
        # add_reference_to_stage(
        #     usd_path="path/to/humanoid_robot.usd",
        #     prim_path=self.robot_path
        # )

        # Option 2: Import URDF (requires urdf_import extension)
        from omni.isaac.core.utils import nucleus
        assets_root_path = get_assets_root_path()

        if assets_root_path is None:
            carb.log_error("Could not find Isaac Sim assets root path")
            return

        # Load a sample robot or use custom humanoid model
        robot_usd_path = assets_root_path + "/Isaac/Robots/Franka/franka_instanceable.usd"
        add_reference_to_stage(
            usd_path=robot_usd_path,
            prim_path=self.robot_path
        )

    def setup_sensors(self):
        """Setup cameras and other sensors on the humanoid robot"""
        # Head camera (RGB)
        head_camera = Camera(
            prim_path="/World/Robot/head_camera",
            frequency=30,
            resolution=(640, 480)
        )

        # Add semantic segmentation capability
        head_camera.add_segmentation_annotator("semantic")

        # Add depth information
        head_camera.add_distance_to_image_annotator("depth")

        # Add instance segmentation
        head_camera.add_instance_segmentation_annotator("instance")

        self.cameras['head_camera'] = head_camera

        # Chest-mounted camera
        chest_camera = Camera(
            prim_path="/World/Robot/chest_camera",
            frequency=30,
            resolution=(1280, 720)
        )

        chest_camera.add_segmentation_annotator("semantic")
        chest_camera.add_distance_to_image_annotator("depth")

        self.cameras['chest_camera'] = chest_camera

    def configure_physics(self):
        """Configure physics properties for realistic simulation"""
        # Set gravity
        self.world.scene.enable_gravity = True
        self.world.scene.gravity = np.array([0, 0, -9.81])

        # Configure default physics material properties
        from omni.isaac.core.materials import PhysicsMaterial
        ground_material = PhysicsMaterial(
            prim_path="/World/ground_material",
            static_friction=0.5,
            dynamic_friction=0.5,
            restitution=0.1
        )

    def add_material_to_prim(self, prim_path, material_name):
        """Add material properties to a primitive"""
        from pxr import UsdShade, Sdf

        # Create material
        material_path = f"/World/Looks/{material_name}"
        material = create_prim(
            prim_path=material_path,
            prim_type="Material"
        )

        # Create shader
        shader_path = f"{material_path}/Shader"
        shader = UsdShade.Shader.Define(self.world.stage, shader_path)
        shader.CreateIdAttr("UsdPreviewSurface")

        # Set material properties
        shader.CreateInput("diffuseColor", Sdf.ValueTypeNames.Color3f).Set((0.7, 0.7, 0.7))
        shader.CreateInput("metallic", Sdf.ValueTypeNames.Float).Set(0.0)
        shader.CreateInput("roughness", Sdf.ValueTypeNames.Float).Set(0.5)

        # Bind material to prim
        material.GetPrim().GetRelationship("outputs:surface").AddTarget(shader.GetPath())

        from pxr import UsdShade
        UsdShade.MaterialBindingAPI(self.world.stage.GetPrimAtPath(prim_path)).Bind(material)

    def enable_domain_randomization(self):
        """Enable domain randomization for synthetic data generation"""
        if self.domain_randomization:
            # Randomize lighting conditions
            if self.randomization_params['lighting']:
                self.randomize_lighting()

            # Randomize textures and materials
            if self.randomization_params['textures']:
                self.randomize_textures()

            # Randomize object appearances
            if self.randomization_params['object_appearances']:
                self.randomize_objects()

    def randomize_lighting(self):
        """Randomize lighting conditions"""
        dome_light = self.world.stage.GetPrimAtPath("/World/DomeLight")
        if dome_light:
            # Randomize dome light intensity and color
            intensity = np.random.uniform(1000, 5000)
            dome_light.GetAttribute("inputs:intensity").Set(intensity)

            color = (
                np.random.uniform(0.1, 1.0),
                np.random.uniform(0.1, 1.0),
                np.random.uniform(0.1, 1.0)
            )
            dome_light.GetAttribute("inputs:color").Set(color)

    def randomize_textures(self):
        """Randomize surface textures and materials"""
        # This would involve changing material properties randomly
        # For each surface in the scene, randomize texture properties
        pass

    def get_sensor_data(self):
        """Get data from all configured sensors"""
        sensor_data = {}

        # Get camera data
        for cam_name, camera in self.cameras.items():
            # Get RGB image
            rgb_data = camera.get_rgb()
            sensor_data[f'{cam_name}_rgb'] = rgb_data

            # Get depth data
            depth_data = camera.get_depth()
            sensor_data[f'{cam_name}_depth'] = depth_data

            # Get segmentation data
            seg_data = camera.get_semantic_segmentation()
            sensor_data[f'{cam_name}_segmentation'] = seg_data

        return sensor_data

    def run_simulation(self, steps=1000):
        """Run the simulation for specified steps"""
        for i in range(steps):
            self.world.step(render=True)

            # Enable domain randomization periodically
            if self.domain_randomization and i % 100 == 0:
                self.enable_domain_randomization()

            # Collect sensor data periodically
            if i % 10 == 0:
                sensor_data = self.get_sensor_data()
                self.save_sensor_data(sensor_data, i)

    def save_sensor_data(self, data, step):
        """Save sensor data for synthetic dataset"""
        import os
        import cv2

        # Create directory for synthetic data
        data_dir = f"synthetic_data/step_{step:06d}"
        os.makedirs(data_dir, exist_ok=True)

        # Save RGB images
        for key, value in data.items():
            if 'rgb' in key:
                # Convert from Isaac Sim format to OpenCV format
                img = value
                cv2.imwrite(f"{data_dir}/{key}.png", img)

        # Save depth maps
        for key, value in data.items():
            if 'depth' in key:
                depth_map = value
                np.save(f"{data_dir}/{key}.npy", depth_map)

        # Save segmentation maps
        for key, value in data.items():
            if 'segmentation' in key:
                seg_map = value
                np.save(f"{data_dir}/{key}.npy", seg_map)

# Usage example
def main():
    # Initialize Isaac Sim environment
    env = IsaacSimHumanoidEnvironment()

    # Run simulation to generate synthetic data
    env.run_simulation(steps=10000)

    # Cleanup
    env.world.clear()

if __name__ == "__main__":
    main()
```

### Synthetic Data Generation Pipeline
```python
# synthetic_data_pipeline.py - Complete pipeline for synthetic data generation
import numpy as np
import cv2
import random
import json
import os
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
import torch
import torchvision.transforms as transforms

@dataclass
class SyntheticDataConfig:
    """Configuration for synthetic data generation"""
    dataset_name: str = "humanoid_perception_dataset"
    output_dir: str = "synthetic_datasets"
    num_samples: int = 10000
    image_size: Tuple[int, int] = (640, 480)
    domain_randomization: bool = True
    lighting_conditions: List[str] = None
    weather_conditions: List[str] = None

    def __post_init__(self):
        if self.lighting_conditions is None:
            self.lighting_conditions = ["day", "dusk", "night", "overcast"]
        if self.weather_conditions is None:
            self.weather_conditions = ["clear", "foggy", "rainy", "snowy"]

class SyntheticDataGenerator:
    def __init__(self, config: SyntheticDataConfig):
        self.config = config
        self.dataset_dir = os.path.join(config.output_dir, config.dataset_name)
        os.makedirs(self.dataset_dir, exist_ok=True)

        # Initialize domain randomization parameters
        self.randomization_params = {
            'lighting': {
                'intensity_range': (500, 5000),
                'color_temperature_range': (3000, 8000),  # Kelvin
                'direction_range': (0, 360)  # degrees
            },
            'textures': {
                'roughness_range': (0.1, 0.9),
                'metallic_range': (0.0, 0.5),
                'albedo_variance': 0.2
            },
            'camera': {
                'noise_level_range': (0.001, 0.01),
                'motion_blur_range': (0.0, 0.1),
                'chromatic_aberration_range': (0.0, 0.01)
            }
        }

        # Object categories for segmentation
        self.object_categories = {
            0: "background",
            1: "humanoid_robot",
            2: "human",
            3: "furniture",
            4: "obstacle",
            5: "navigation_target",
            6: "interactive_object"
        }

        self.setup_dataset_structure()

    def setup_dataset_structure(self):
        """Setup directory structure for synthetic dataset"""
        # Create main dataset directories
        os.makedirs(os.path.join(self.dataset_dir, "images"), exist_ok=True)
        os.makedirs(os.path.join(self.dataset_dir, "labels"), exist_ok=True)
        os.makedirs(os.path.join(self.dataset_dir, "depth"), exist_ok=True)
        os.makedirs(os.path.join(self.dataset_dir, "metadata"), exist_ok=True)

        # Create train/val/test splits
        for split in ["train", "val", "test"]:
            split_dir = os.path.join(self.dataset_dir, split)
            os.makedirs(os.path.join(split_dir, "images"), exist_ok=True)
            os.makedirs(os.path.join(split_dir, "labels"), exist_ok=True)
            os.makedirs(os.path.join(split_dir, "depth"), exist_ok=True)

    def randomize_environment(self):
        """Apply domain randomization to environment"""
        if not self.config.domain_randomization:
            return {}

        randomization_settings = {}

        # Randomize lighting
        randomization_settings['lighting'] = {
            'intensity': np.random.uniform(
                self.randomization_params['lighting']['intensity_range'][0],
                self.randomization_params['lighting']['intensity_range'][1]
            ),
            'color_temperature': np.random.uniform(
                self.randomization_params['lighting']['color_temperature_range'][0],
                self.randomization_params['lighting']['color_temperature_range'][1]
            ),
            'direction': np.random.uniform(
                self.randomization_params['lighting']['direction_range'][0],
                self.randomization_params['lighting']['direction_range'][1]
            )
        }

        # Randomize textures
        randomization_settings['textures'] = {
            'roughness': np.random.uniform(
                self.randomization_params['textures']['roughness_range'][0],
                self.randomization_params['textures']['roughness_range'][1]
            ),
            'metallic': np.random.uniform(
                self.randomization_params['textures']['metallic_range'][0],
                self.randomization_params['textures']['metallic_range'][1]
            ),
            'albedo_variance': np.random.uniform(0, self.randomization_params['textures']['albedo_variance'])
        }

        # Randomize camera effects
        randomization_settings['camera'] = {
            'noise_level': np.random.uniform(
                self.randomization_params['camera']['noise_level_range'][0],
                self.randomization_params['camera']['noise_level_range'][1]
            ),
            'motion_blur': np.random.uniform(
                self.randomization_params['camera']['motion_blur_range'][0],
                self.randomization_params['camera']['motion_blur_range'][1]
            ),
            'chromatic_aberration': np.random.uniform(
                self.randomization_params['camera']['chromatic_aberration_range'][0],
                self.randomization_params['camera']['chromatic_aberration_range'][1]
            )
        }

        return randomization_settings

    def generate_synthetic_image(self, sample_id: int) -> Dict:
        """Generate a synthetic image with annotations"""
        # Apply randomization
        randomization = self.randomize_environment()

        # Generate base image (this would come from Isaac Sim in practice)
        height, width = self.config.image_size
        image = np.random.rand(height, width, 3).astype(np.float32)

        # Add lighting effects based on randomization
        lighting_factor = randomization['lighting']['intensity'] / 5000.0
        image = image * lighting_factor

        # Add noise based on camera randomization
        noise_level = randomization['camera']['noise_level']
        noise = np.random.normal(0, noise_level, image.shape).astype(np.float32)
        image = np.clip(image + noise, 0, 1)

        # Generate segmentation mask
        segmentation = self.generate_segmentation_mask(height, width)

        # Generate depth map
        depth = self.generate_depth_map(height, width)

        # Create metadata
        metadata = {
            'sample_id': sample_id,
            'timestamp': sample_id,  # Simulated timestamp
            'randomization_settings': randomization,
            'lighting_condition': random.choice(self.config.lighting_conditions),
            'weather_condition': random.choice(self.config.weather_conditions),
            'objects_present': self.get_present_objects(segmentation)
        }

        return {
            'image': image,
            'segmentation': segmentation,
            'depth': depth,
            'metadata': metadata
        }

    def generate_segmentation_mask(self, height: int, width: int) -> np.ndarray:
        """Generate synthetic segmentation mask"""
        # Create empty segmentation mask
        segmentation = np.zeros((height, width), dtype=np.uint8)

        # Add random objects with different categories
        num_objects = np.random.randint(1, 6)  # 1-5 objects

        for _ in range(num_objects):
            # Random object category (excluding background)
            category = np.random.choice(list(range(1, len(self.object_categories))))

            # Random position and size
            center_x = np.random.randint(50, width - 50)
            center_y = np.random.randint(50, height - 50)
            radius = np.random.randint(20, 100)

            # Create circular object
            y, x = np.ogrid[:height, :width]
            mask = (x - center_x)**2 + (y - center_y)**2 <= radius**2
            segmentation[mask] = category

        return segmentation

    def generate_depth_map(self, height: int, width: int) -> np.ndarray:
        """Generate synthetic depth map"""
        # Create depth map with random depth values
        depth = np.random.rand(height, width).astype(np.float32)

        # Add some structure (e.g., ground plane, objects at different depths)
        # Ground plane
        ground_depth = 5.0  # meters
        depth = np.full((height, width), ground_depth, dtype=np.float32)

        # Add objects at various depths
        num_objects = np.random.randint(1, 5)
        for _ in range(num_objects):
            center_x = np.random.randint(50, width - 50)
            center_y = np.random.randint(50, height - 50)
            radius = np.random.randint(20, 100)
            object_depth = np.random.uniform(0.5, 4.0)  # Objects closer than ground

            y, x = np.ogrid[:height, :width]
            mask = (x - center_x)**2 + (y - center_y)**2 <= radius**2
            depth[mask] = object_depth

        return depth

    def get_present_objects(self, segmentation: np.ndarray) -> List[int]:
        """Get list of object categories present in segmentation"""
        unique_categories = np.unique(segmentation)
        return [int(cat) for cat in unique_categories if cat != 0]  # Exclude background

    def apply_camera_effects(self, image: np.ndarray, randomization: Dict) -> np.ndarray:
        """Apply camera-specific effects to image"""
        # Apply motion blur
        blur_kernel_size = int(randomization['camera']['motion_blur'] * 20)
        if blur_kernel_size > 0:
            kernel = np.zeros((blur_kernel_size, blur_kernel_size))
            kernel[int(blur_kernel_size/2), :] = np.ones(blur_kernel_size) / blur_kernel_size
            image = cv2.filter2D(image, -1, kernel)

        # Apply chromatic aberration (simplified)
        aberration = randomization['camera']['chromatic_aberration']
        if aberration > 0:
            # Shift color channels slightly
            h, w, c = image.shape
            shift = int(aberration * min(h, w))

            # Shift red channel
            image[:, :, 0] = np.roll(image[:, :, 0], shift, axis=1)
            # Shift blue channel
            image[:, :, 2] = np.roll(image[:, :, 2], -shift, axis=1)

        return image

    def save_sample(self, sample_data: Dict, sample_id: int, split: str = "train"):
        """Save a synthetic data sample"""
        sample_dir = os.path.join(self.dataset_dir, split)

        # Save image
        img_path = os.path.join(sample_dir, "images", f"{sample_id:06d}.png")
        img = (sample_data['image'] * 255).astype(np.uint8)
        cv2.imwrite(img_path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR))

        # Save segmentation
        seg_path = os.path.join(sample_dir, "labels", f"{sample_id:06d}.png")
        cv2.imwrite(seg_path, sample_data['segmentation'])

        # Save depth
        depth_path = os.path.join(sample_dir, "depth", f"{sample_id:06d}.npy")
        np.save(depth_path, sample_data['depth'])

        # Save metadata
        meta_path = os.path.join(sample_dir, "metadata", f"{sample_id:06d}.json")
        with open(meta_path, 'w') as f:
            json.dump(sample_data['metadata'], f, indent=2)

    def generate_dataset(self):
        """Generate the complete synthetic dataset"""
        print(f"Generating synthetic dataset: {self.config.dataset_name}")
        print(f"Number of samples: {self.config.num_samples}")

        # Determine split sizes
        train_size = int(0.7 * self.config.num_samples)
        val_size = int(0.2 * self.config.num_samples)
        test_size = self.config.num_samples - train_size - val_size

        splits = {
            "train": train_size,
            "val": val_size,
            "test": test_size
        }

        sample_counter = 0

        for split, size in splits.items():
            print(f"Generating {split} split ({size} samples)...")

            for i in range(size):
                # Generate sample
                sample = self.generate_synthetic_image(sample_counter)

                # Apply camera effects
                sample['image'] = self.apply_camera_effects(
                    sample['image'],
                    sample['metadata']['randomization_settings']
                )

                # Save sample
                self.save_sample(sample, sample_counter, split)

                sample_counter += 1

                # Progress update
                if (i + 1) % 100 == 0:
                    print(f"  {split}: {i + 1}/{size} samples generated")

        # Save dataset configuration
        config_path = os.path.join(self.dataset_dir, "config.json")
        with open(config_path, 'w') as f:
            json.dump(self.config.__dict__, f, indent=2)

        # Save object categories
        categories_path = os.path.join(self.dataset_dir, "categories.json")
        with open(categories_path, 'w') as f:
            json.dump(self.object_categories, f, indent=2)

        print(f"Dataset generation complete! Saved to: {self.dataset_dir}")

    def get_dataset_stats(self) -> Dict:
        """Get statistics about the generated dataset"""
        stats = {
            'total_samples': 0,
            'split_distribution': {},
            'object_frequency': {name: 0 for name in self.object_categories.values()},
            'average_depth': 0,
            'randomization_enabled': self.config.domain_randomization
        }

        for split in ["train", "val", "test"]:
            split_path = os.path.join(self.dataset_dir, split, "images")
            if os.path.exists(split_path):
                samples = len([f for f in os.listdir(split_path) if f.endswith('.png')])
                stats['split_distribution'][split] = samples
                stats['total_samples'] += samples

        # Calculate average depth and object frequencies
        # This would require loading metadata from a subset of samples
        # For brevity, returning placeholder values
        stats['average_depth'] = 2.5  # Placeholder

        return stats

# Usage example
def main():
    # Configure synthetic data generation
    config = SyntheticDataConfig(
        dataset_name="humanoid_perception_synthetic",
        num_samples=5000,
        image_size=(640, 480),
        domain_randomization=True
    )

    # Initialize generator
    generator = SyntheticDataGenerator(config)

    # Generate dataset
    generator.generate_dataset()

    # Print statistics
    stats = generator.get_dataset_stats()
    print("Dataset Statistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")

if __name__ == "__main__":
    main()
```

### Isaac Sim Domain Randomization
```python
# domain_randomization.py - Advanced domain randomization techniques for Isaac Sim
import numpy as np
import random
from pxr import Usd, UsdGeom, UsdShade, Gf, Sdf
import omni
from omni.isaac.core.utils.prims import get_prim_at_path
from omni.isaac.core.materials import OmniPBR

class IsaacSimDomainRandomizer:
    def __init__(self, world):
        self.world = world
        self.stage = world.stage
        self.randomization_config = {
            'lighting': {
                'enabled': True,
                'intensity_range': (1000, 8000),
                'color_temperature_range': (3000, 8000),
                'position_variance': 2.0
            },
            'materials': {
                'enabled': True,
                'roughness_range': (0.1, 0.9),
                'metallic_range': (0.0, 0.5),
                'specular_range': (0.0, 1.0),
                'albedo_variance': 0.3
            },
            'objects': {
                'enabled': True,
                'position_variance': 0.5,
                'rotation_variance': 15.0,  # degrees
                'scale_variance': 0.1
            },
            'camera': {
                'enabled': True,
                'noise_level_range': (0.001, 0.02),
                'distortion_range': (0.0, 0.1)
            }
        }

    def randomize_lighting(self):
        """Randomize all lighting in the scene"""
        # Find all light prims in the stage
        light_prims = []
        for prim in self.stage.TraverseAll():
            if prim.GetTypeName() in ["DistantLight", "DomeLight", "SphereLight", "DiskLight"]:
                light_prims.append(prim)

        for light_prim in light_prims:
            if not self.randomization_config['lighting']['enabled']:
                continue

            # Randomize intensity
            intensity = np.random.uniform(
                self.randomization_config['lighting']['intensity_range'][0],
                self.randomization_config['lighting']['intensity_range'][1]
            )
            light_prim.GetAttribute("inputs:intensity").Set(intensity)

            # Randomize color (approximate color temperature)
            color_temp = np.random.uniform(
                self.randomization_config['lighting']['color_temperature_range'][0],
                self.randomization_config['lighting']['color_temperature_range'][1]
            )
            color = self.color_temperature_to_rgb(color_temp)
            light_prim.GetAttribute("inputs:color").Set(Gf.Vec3f(*color))

            # Randomize position (for point lights)
            if light_prim.GetTypeName() in ["SphereLight", "DiskLight"]:
                current_pos = light_prim.GetAttribute("xformOp:translate").Get()
                if current_pos:
                    variance = self.randomization_config['lighting']['position_variance']
                    new_pos = [
                        current_pos[0] + np.random.uniform(-variance, variance),
                        current_pos[1] + np.random.uniform(-variance, variance),
                        current_pos[2] + np.random.uniform(-variance, variance)
                    ]
                    light_prim.GetAttribute("xformOp:translate").Set(Gf.Vec3f(*new_pos))

    def color_temperature_to_rgb(self, color_temp):
        """
        Convert color temperature in Kelvin to RGB values
        Uses approximation algorithm
        """
        temp = color_temp / 100.0

        # Red
        if temp <= 66:
            red = 255
        else:
            red = temp - 60
            red = 329.698727446 * (red ** -0.1332047592)
            red = max(0, min(255, red))

        # Green
        if temp <= 66:
            green = temp
            green = 99.4708025861 * np.log(green) - 161.1195681661
        else:
            green = temp - 60
            green = 288.1221695283 * (green ** -0.0755148492)
        green = max(0, min(255, green))

        # Blue
        if temp >= 66:
            blue = 255
        elif temp <= 19:
            blue = 0
        else:
            blue = temp - 10
            blue = 138.5177312231 * np.log(blue) - 305.0447927307
            blue = max(0, min(255, blue))

        return (red/255.0, green/255.0, blue/255.0)

    def randomize_materials(self):
        """Randomize materials in the scene"""
        # Find all material prims
        material_prims = []
        for prim in self.stage.TraverseAll():
            if prim.GetTypeName() == "Material":
                material_prims.append(prim)

        for material_prim in material_prims:
            if not self.randomization_config['materials']['enabled']:
                continue

            # Get the shader inside the material
            shader_path = material_prim.GetPath().AppendChild("OmniPBR")
            shader = self.stage.GetPrimAtPath(shader_path)

            if not shader or not shader.IsValid():
                continue

            # Randomize material properties
            roughness = np.random.uniform(
                self.randomization_config['materials']['roughness_range'][0],
                self.randomization_config['materials']['roughness_range'][1]
            )
            shader.GetAttribute("inputs:roughness").Set(roughness)

            metallic = np.random.uniform(
                self.randomization_config['materials']['metallic_range'][0],
                self.randomization_config['materials']['metallic_range'][1]
            )
            shader.GetAttribute("inputs:metallic").Set(metallic)

            specular = np.random.uniform(
                self.randomization_config['materials']['specular_range'][0],
                self.randomization_config['materials']['specular_range'][1]
            )
            shader.GetAttribute("inputs:specularLevel").Set(specular)

            # Randomize albedo with some variance
            current_albedo = shader.GetAttribute("inputs:diffuse_tint").Get()
            if current_albedo:
                albedo_variance = self.randomization_config['materials']['albedo_variance']
                new_albedo = [
                    max(0, min(1, current_albedo[0] + np.random.uniform(-albedo_variance, albedo_variance))),
                    max(0, min(1, current_albedo[1] + np.random.uniform(-albedo_variance, albedo_variance))),
                    max(0, min(1, current_albedo[2] + np.random.uniform(-albedo_variance, albedo_variance))),
                    current_albedo[3]  # Keep alpha unchanged
                ]
                shader.GetAttribute("inputs:diffuse_tint").Set(Gf.Vec4f(*new_albedo))

    def randomize_objects(self):
        """Randomize object positions, rotations, and scales"""
        # Find all geometry prims (excluding lights and cameras)
        geometry_prims = []
        for prim in self.stage.TraverseAll():
            type_name = prim.GetTypeName()
            if type_name in ["Xform", "Mesh", "Cylinder", "Sphere", "Cube", "Capsule", "Cone"]:
                if not any(x in prim.GetPath().pathString for x in ["/World/Robot", "/World/Camera", "/World/Light"]):
                    geometry_prims.append(prim)

        for geom_prim in geometry_prims:
            if not self.randomization_config['objects']['enabled']:
                continue

            # Randomize position
            current_pos = geom_prim.GetAttribute("xformOp:translate").Get()
            if current_pos:
                variance = self.randomization_config['objects']['position_variance']
                new_pos = [
                    current_pos[0] + np.random.uniform(-variance, variance),
                    current_pos[1] + np.random.uniform(-variance, variance),
                    current_pos[2] + np.random.uniform(-variance, variance)
                ]
                geom_prim.GetAttribute("xformOp:translate").Set(Gf.Vec3f(*new_pos))

            # Randomize rotation
            current_rot = geom_prim.GetAttribute("xformOp:rotateXYZ").Get()
            if current_rot:
                variance = self.randomization_config['objects']['rotation_variance']
                new_rot = [
                    current_rot[0] + np.random.uniform(-variance, variance),
                    current_rot[1] + np.random.uniform(-variance, variance),
                    current_rot[2] + np.random.uniform(-variance, variance)
                ]
                geom_prim.GetAttribute("xformOp:rotateXYZ").Set(Gf.Vec3f(*new_rot))

            # Randomize scale
            current_scale = geom_prim.GetAttribute("xformOp:scale").Get()
            if current_scale:
                variance = self.randomization_config['objects']['scale_variance']
                new_scale = [
                    max(0.1, current_scale[0] * (1 + np.random.uniform(-variance, variance))),
                    max(0.1, current_scale[1] * (1 + np.random.uniform(-variance, variance))),
                    max(0.1, current_scale[2] * (1 + np.random.uniform(-variance, variance)))
                ]
                geom_prim.GetAttribute("xformOp:scale").Set(Gf.Vec3f(*new_scale))

    def randomize_camera(self, camera_path: str):
        """Randomize camera properties"""
        if not self.randomization_config['camera']['enabled']:
            return

        # This would involve setting camera-specific noise and distortion parameters
        # In Isaac Sim, camera noise is typically handled through post-processing
        # or by modifying the sensor settings directly

        # For now, we'll just add a comment about where this would be implemented
        # Camera noise and distortion settings would be applied here
        pass

    def apply_randomization(self):
        """Apply all randomization techniques"""
        self.randomize_lighting()
        self.randomize_materials()
        self.randomize_objects()

        # Apply randomization to all cameras in the scene
        camera_paths = ["/World/Robot/head_camera", "/World/Robot/chest_camera"]  # Example paths
        for cam_path in camera_paths:
            self.randomize_camera(cam_path)

    def set_randomization_config(self, config: dict):
        """Update randomization configuration"""
        self.randomization_config.update(config)

    def reset_randomization(self):
        """Reset to original scene configuration"""
        # This would restore original values stored before randomization
        # For now, we'll just apply randomization again to get a new random state
        self.apply_randomization()
```

### Isaac Sim Perception Training Integration
```python
# perception_training_integration.py - Integration with ML training pipelines
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
import numpy as np
import cv2
import json
import os
from PIL import Image

class IsaacSimDataset(Dataset):
    """Dataset class for Isaac Sim synthetic data"""
    def __init__(self, data_dir, split="train", transform=None, task="segmentation"):
        self.data_dir = data_dir
        self.split = split
        self.transform = transform
        self.task = task  # 'segmentation', 'depth', 'detection', 'classification'

        # Load image paths
        split_dir = os.path.join(data_dir, split)
        self.image_paths = []

        images_dir = os.path.join(split_dir, "images")
        for img_file in sorted(os.listdir(images_dir)):
            if img_file.endswith(('.png', '.jpg', '.jpeg')):
                self.image_paths.append(os.path.join(images_dir, img_file))

        # Load object categories if available
        categories_path = os.path.join(data_dir, "categories.json")
        self.categories = {}
        if os.path.exists(categories_path):
            with open(categories_path, 'r') as f:
                self.categories = json.load(f)

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        # Load image
        img_path = self.image_paths[idx]
        image = cv2.imread(img_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Load corresponding label based on task
        base_name = os.path.splitext(os.path.basename(img_path))[0]
        split_dir = os.path.join(self.data_dir, self.split)

        if self.task == "segmentation":
            label_path = os.path.join(split_dir, "labels", f"{base_name}.png")
            label = cv2.imread(label_path, cv2.IMREAD_UNCHANGED)
            if len(label.shape) == 3:
                label = label[:, :, 0]  # Take first channel if multi-channel
        elif self.task == "depth":
            label_path = os.path.join(split_dir, "depth", f"{base_name}.npy")
            label = np.load(label_path)
        else:
            # Default: return zeros for other tasks
            label = np.zeros_like(image[:, :, 0])

        # Apply transforms
        if self.transform:
            # Convert to PIL for torchvision transforms
            image = Image.fromarray(image)
            label = Image.fromarray(label.astype(np.uint8)) if self.task == "segmentation" else label

            image = self.transform(image)

            if self.task == "segmentation":
                label = torch.from_numpy(np.array(label)).long()

        sample = {
            'image': image,
            'label': label,
            'image_path': img_path
        }

        return sample

class PerceptionModel(nn.Module):
    """Base perception model for humanoid robot tasks"""
    def __init__(self, model_type="segmentation", num_classes=7):
        super(PerceptionModel, self).__init__()
        self.model_type = model_type
        self.num_classes = num_classes

        # Example: Simple segmentation model using encoder-decoder architecture
        if model_type == "segmentation":
            self.encoder = nn.Sequential(
                nn.Conv2d(3, 64, 3, padding=1),
                nn.ReLU(),
                nn.Conv2d(64, 128, 3, padding=1),
                nn.ReLU(),
                nn.MaxPool2d(2),
                nn.Conv2d(128, 256, 3, padding=1),
                nn.ReLU(),
                nn.MaxPool2d(2)
            )

            self.decoder = nn.Sequential(
                nn.Conv2d(256, 128, 3, padding=1),
                nn.ReLU(),
                nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True),
                nn.Conv2d(128, 64, 3, padding=1),
                nn.ReLU(),
                nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True),
                nn.Conv2d(64, self.num_classes, 1)
            )

    def forward(self, x):
        if self.model_type == "segmentation":
            encoded = self.encoder(x)
            output = self.decoder(encoded)
            return output
        else:
            # Add other model types as needed
            raise NotImplementedError(f"Model type {self.model_type} not implemented")

class SyntheticToRealTrainer:
    """Trainer for synthetic-to-real transfer learning"""
    def __init__(self, model, synthetic_dataset, real_dataset=None):
        self.model = model
        self.synthetic_dataset = synthetic_dataset
        self.real_dataset = real_dataset
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Move model to device
        self.model.to(self.device)

        # Initialize optimizer
        self.optimizer = optim.Adam(model.parameters(), lr=0.001)
        self.criterion = nn.CrossEntropyLoss() if model.model_type == "segmentation" else nn.MSELoss()

        # Domain adaptation components
        self.domain_discriminator = self._create_domain_discriminator()
        self.domain_criterion = nn.BCEWithLogitsLoss()

    def _create_domain_discriminator(self):
        """Create domain discriminator for domain adaptation"""
        return nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Linear(self.model.encoder[-2].out_channels, 128),
            nn.ReLU(),
            nn.Linear(128, 1)
        ).to(self.device)

    def train_synthetic_only(self, num_epochs=10, batch_size=8):
        """Train model on synthetic data only"""
        dataloader = DataLoader(
            self.synthetic_dataset,
            batch_size=batch_size,
            shuffle=True,
            num_workers=4
        )

        self.model.train()

        for epoch in range(num_epochs):
            epoch_loss = 0.0
            for batch_idx, batch in enumerate(dataloader):
                images = batch['image'].to(self.device)
                labels = batch['label'].to(self.device)

                self.optimizer.zero_grad()

                outputs = self.model(images)
                loss = self.criterion(outputs, labels)

                loss.backward()
                self.optimizer.step()

                epoch_loss += loss.item()

                if batch_idx % 50 == 0:
                    print(f'Epoch {epoch}, Batch {batch_idx}, Loss: {loss.item():.4f}')

            avg_loss = epoch_loss / len(dataloader)
            print(f'Epoch {epoch} completed, Average Loss: {avg_loss:.4f}')

    def train_with_domain_adaptation(self, num_epochs=10, batch_size=8):
        """Train with domain adaptation using adversarial training"""
        if self.real_dataset is None:
            print("Real dataset not provided, falling back to synthetic-only training")
            self.train_synthetic_only(num_epochs, batch_size)
            return

        syn_loader = DataLoader(self.synthetic_dataset, batch_size=batch_size//2, shuffle=True)
        real_loader = DataLoader(self.real_dataset, batch_size=batch_size//2, shuffle=True)

        # Combine both optimizers
        combined_optimizer = optim.Adam(
            list(self.model.parameters()) + list(self.domain_discriminator.parameters()),
            lr=0.001
        )

        self.model.train()
        self.domain_discriminator.train()

        for epoch in range(num_epochs):
            syn_iter = iter(syn_loader)
            real_iter = iter(real_loader)
            num_batches = min(len(syn_loader), len(real_loader))

            for batch_idx in range(num_batches):
                try:
                    # Get synthetic batch
                    syn_batch = next(syn_iter)
                    syn_images = syn_batch['image'].to(self.device)

                    # Get real batch
                    real_batch = next(real_iter)
                    real_images = real_batch['image'].to(self.device)

                    # Combine batches
                    all_images = torch.cat([syn_images, real_images], dim=0)
                    domain_labels = torch.cat([
                        torch.zeros(syn_images.size(0)),  # Synthetic = 0
                        torch.ones(real_images.size(0))   # Real = 1
                    ]).to(self.device)

                    combined_optimizer.zero_grad()

                    # Forward pass through model
                    features = self.model.encoder(all_images)  # Get intermediate features
                    outputs = self.model.decoder(features)

                    # Separate outputs for task loss (synthetic only)
                    syn_outputs = outputs[:syn_images.size(0)]
                    syn_labels = syn_batch['label'].to(self.device)
                    task_loss = self.criterion(syn_outputs, syn_labels)

                    # Domain discrimination loss
                    domain_preds = self.domain_discriminator(features.detach())
                    domain_loss = self.domain_criterion(domain_preds.squeeze(), domain_labels)

                    # Total loss: minimize task loss, maximize domain loss (confuse discriminator)
                    total_loss = task_loss - domain_loss  # Note the minus sign

                    total_loss.backward()
                    combined_optimizer.step()

                    if batch_idx % 50 == 0:
                        print(f'Epoch {epoch}, Batch {batch_idx}, Task Loss: {task_loss.item():.4f}, Domain Loss: {domain_loss.item():.4f}')

                except StopIteration:
                    break

            print(f'Epoch {epoch} completed')

    def validate(self, val_dataset, batch_size=8):
        """Validate the trained model"""
        dataloader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

        self.model.eval()
        total_loss = 0.0
        correct = 0
        total = 0

        with torch.no_grad():
            for batch in dataloader:
                images = batch['image'].to(self.device)
                labels = batch['label'].to(self.device)

                outputs = self.model(images)
                loss = self.criterion(outputs, labels)
                total_loss += loss.item()

                if self.model.model_type == "segmentation":
                    preds = torch.argmax(outputs, dim=1)
                    correct += (preds == labels).sum().item()
                    total += labels.numel()

        avg_loss = total_loss / len(dataloader)
        accuracy = correct / total if total > 0 else 0

        print(f'Validation - Average Loss: {avg_loss:.4f}, Accuracy: {accuracy:.4f}')
        return avg_loss, accuracy

    def save_model(self, path):
        """Save the trained model"""
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'model_type': self.model.model_type
        }, path)

    def load_model(self, path):
        """Load a trained model"""
        checkpoint = torch.load(path)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])

# Example usage
def main():
    # Define transforms
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # Load synthetic dataset
    syn_dataset = IsaacSimDataset(
        data_dir="synthetic_datasets/humanoid_perception_synthetic",
        split="train",
        transform=transform,
        task="segmentation"
    )

    # Initialize model
    model = PerceptionModel(model_type="segmentation", num_classes=7)

    # Initialize trainer
    trainer = SyntheticToRealTrainer(model, syn_dataset)

    # Train the model
    trainer.train_synthetic_only(num_epochs=5, batch_size=8)

    # Validate on a validation set
    val_dataset = IsaacSimDataset(
        data_dir="synthetic_datasets/humanoid_perception_synthetic",
        split="val",
        transform=transform,
        task="segmentation"
    )

    trainer.validate(val_dataset)

if __name__ == "__main__":
    main()
```

## Practical Examples
### Example 1: Isaac Sim Scene Configuration for Humanoid Perception
```python
# isaac_sim_perception_scene.py - Complete scene setup for humanoid perception training
import omni
from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.nucleus import get_assets_root_path
from omni.isaac.core.utils.prims import create_prim, get_prim_at_path
from omni.isaac.core.utils.semantics import add_semantics
from omni.isaac.sensor import Camera
from omni.isaac.core.materials import OmniPBR
import carb
import numpy as np
import random

class HumanoidPerceptionScene:
    def __init__(self):
        # Initialize Isaac Sim world
        self.world = World(stage_units_in_meters=1.0)
        self.scene_path = "/World"

        # Scene configuration
        self.num_dynamic_objects = 10
        self.room_dimensions = [10.0, 8.0, 3.0]  # x, y, z in meters

        # Robot and sensor setup
        self.robot_path = "/World/HumanoidRobot"
        self.sensors = {}

        # Domain randomization parameters
        self.domain_randomization_config = {
            'lighting': True,
            'textures': True,
            'object_placement': True,
            'camera_noise': True
        }

        self.setup_scene()

    def setup_scene(self):
        """Setup complete perception training scene"""
        print("Setting up humanoid perception training scene...")

        # Create environment
        self.create_environment()

        # Add humanoid robot
        self.add_humanoid_robot()

        # Add objects for perception training
        self.add_perception_training_objects()

        # Setup sensors
        self.setup_perception_sensors()

        # Configure physics
        self.configure_physics()

        print("Scene setup complete!")

    def create_environment(self):
        """Create indoor environment for humanoid perception"""
        # Create room boundaries
        self.create_room()

        # Add floor with texture
        self.create_floor()

        # Add ceiling and walls
        self.create_ceiling_and_walls()

        # Add lighting
        self.setup_lighting()

    def create_room(self):
        """Create room boundaries"""
        # Floor
        create_prim(
            prim_path="/World/floor",
            prim_type="Plane",
            position=np.array([0, 0, 0]),
            scale=np.array([self.room_dimensions[0], self.room_dimensions[1], 1])
        )

        # Walls
        wall_height = self.room_dimensions[2]

        # Wall along x-axis (front and back)
        create_prim(
            prim_path="/World/wall_front",
            prim_type="Cuboid",
            position=np.array([0, self.room_dimensions[1]/2, wall_height/2]),
            scale=np.array([self.room_dimensions[0], 0.1, wall_height])
        )

        create_prim(
            prim_path="/World/wall_back",
            prim_type="Cuboid",
            position=np.array([0, -self.room_dimensions[1]/2, wall_height/2]),
            scale=np.array([self.room_dimensions[0], 0.1, wall_height])
        )

        # Wall along y-axis (left and right)
        create_prim(
            prim_type="Cuboid",
            prim_path="/World/wall_left",
            position=np.array([self.room_dimensions[0]/2, 0, wall_height/2]),
            scale=np.array([0.1, self.room_dimensions[1], wall_height])
        )

        create_prim(
            prim_type="Cuboid",
            prim_path="/World/wall_right",
            position=np.array([-self.room_dimensions[0]/2, 0, wall_height/2]),
            scale=np.array([0.1, self.room_dimensions[1], wall_height])
        )

    def create_floor(self):
        """Create textured floor"""
        # Create floor material
        floor_material = OmniPBR(
            prim_path="/World/Looks/floor_material",
            color=(0.8, 0.8, 0.8),
            roughness=0.7,
            metallic=0.0
        )

        # Apply material to floor
        floor_prim = get_prim_at_path("/World/floor")
        if floor_prim:
            # Add material to primitive
            pass  # Material application would go here

    def create_ceiling_and_walls(self):
        """Create ceiling and wall materials"""
        # Ceiling
        create_prim(
            prim_path="/World/ceiling",
            prim_type="Plane",
            position=np.array([0, 0, self.room_dimensions[2]]),
            scale=np.array([self.room_dimensions[0], self.room_dimensions[1], 1]),
            orientation=np.array([1, 0, 0, 0])  # Rotate 180 degrees around x-axis
        )

    def setup_lighting(self):
        """Setup realistic indoor lighting"""
        # Main overhead lighting
        main_light = create_prim(
            prim_path="/World/main_light",
            prim_type="DiskLight",
            position=np.array([0, 0, 2.5]),
        )

        main_light.GetAttribute("inputs:intensity").Set(1500)
        main_light.GetAttribute("inputs:color").Set((0.98, 0.92, 0.84))  # Warm white

        # Additional ambient lighting
        ambient_light = create_prim(
            prim_path="/World/ambient_light",
            prim_type="DomeLight"
        )

        ambient_light.GetAttribute("inputs:intensity").Set(200)
        ambient_light.GetAttribute("inputs:color").Set((0.2, 0.2, 0.3))  # Cool ambient

    def add_humanoid_robot(self):
        """Add humanoid robot to the scene"""
        # For this example, we'll use a simple representation
        # In practice, you would load a detailed humanoid model
        robot_prim = create_prim(
            prim_path=self.robot_path,
            prim_type="Cylinder",
            position=np.array([0, 0, 0.75]),  # Half the height to center it
            scale=np.array([0.3, 0.3, 1.5])   # 1.5m tall cylinder as placeholder
        )

        # Add semantic label for the robot
        add_semantics(robot_prim, "robot")

    def add_perception_training_objects(self):
        """Add various objects for perception training"""
        object_types = [
            ("chair", "/World/chair"),
            ("table", "/World/table"),
            ("box", "/World/box"),
            ("plant", "/World/plant"),
            ("person", "/World/person")
        ]

        for i in range(self.num_dynamic_objects):
            obj_type, base_path = random.choice(object_types)
            obj_path = f"{base_path}_{i}"

            # Random position within room bounds
            x_pos = np.random.uniform(-self.room_dimensions[0]*0.4, self.room_dimensions[0]*0.4)
            y_pos = np.random.uniform(-self.room_dimensions[1]*0.4, self.room_dimensions[1]*0.4)
            z_pos = 0.2  # Place on floor

            # Create object based on type
            if obj_type == "chair":
                create_prim(
                    prim_path=obj_path,
                    prim_type="Cuboid",
                    position=np.array([x_pos, y_pos, z_pos + 0.4]),  # 0.8m tall
                    scale=np.array([0.4, 0.4, 0.8])
                )
            elif obj_type == "table":
                create_prim(
                    prim_path=obj_path,
                    prim_type="Cuboid",
                    position=np.array([x_pos, y_pos, z_pos + 0.35]),  # 0.7m tall
                    scale=np.array([0.8, 0.6, 0.7])
                )
            elif obj_type == "box":
                create_prim(
                    prim_path=obj_path,
                    prim_type="Cuboid",
                    position=np.array([x_pos, y_pos, z_pos + 0.15]),  # 0.3m tall
                    scale=np.array([0.3, 0.3, 0.3])
                )
            elif obj_type == "plant":
                create_prim(
                    prim_path=obj_path,
                    prim_type="Cylinder",
                    position=np.array([x_pos, y_pos, z_pos + 0.3]),  # 0.6m tall
                    scale=np.array([0.15, 0.15, 0.6])
                )
            elif obj_type == "person":
                # Simplified person as cylinder
                create_prim(
                    prim_path=obj_path,
                    prim_type="Cylinder",
                    position=np.array([x_pos, y_pos, z_pos + 0.9]),  # 1.8m tall
                    scale=np.array([0.2, 0.2, 1.8])
                )

            # Add semantic label
            add_semantics(get_prim_at_path(obj_path), obj_type)

    def setup_perception_sensors(self):
        """Setup cameras and sensors for perception"""
        # Head-mounted RGB camera
        head_camera = Camera(
            prim_path=f"{self.robot_path}/head_camera",
            position=np.array([0, 0, 1.4]),  # Eye level
            frequency=30,
            resolution=(640, 480)
        )

        # Add various annotators for synthetic data
        head_camera.add_segmentation_annotator("semantic")
        head_camera.add_distance_to_image_annotator("depth")
        head_camera.add_bounding_box_2d_annotator("bbox")
        head_camera.add_surface_normals_annotator("normals")

        self.sensors['head_camera'] = head_camera

        # Chest-mounted wide-angle camera
        chest_camera = Camera(
            prim_path=f"{self.robot_path}/chest_camera",
            position=np.array([0, 0, 0.9]),  # Chest level
            frequency=30,
            resolution=(1280, 720)
        )

        chest_camera.add_segmentation_annotator("semantic")
        chest_camera.add_distance_to_image_annotator("depth")

        self.sensors['chest_camera'] = chest_camera

        # Additional sensors could include LIDAR, IMU, etc.

    def configure_physics(self):
        """Configure physics properties"""
        # Enable gravity
        self.world.scene.enable_gravity = True
        self.world.scene.gravity = np.array([0, 0, -9.81])

        # Set default material properties
        default_material = OmniPBR(
            prim_path="/World/Looks/default_material",
            color=(0.7, 0.7, 0.7),
            roughness=0.5,
            metallic=0.0
        )

    def enable_domain_randomization(self):
        """Enable domain randomization for synthetic data generation"""
        # This would connect to the domain randomization system
        # In a real implementation, this would randomize lighting, textures, object positions, etc.
        print("Domain randomization enabled for perception training")

    def run_perception_training_scenario(self, num_episodes=100):
        """Run perception training scenario"""
        print(f"Running perception training for {num_episodes} episodes...")

        for episode in range(num_episodes):
            print(f"Episode {episode + 1}/{num_episodes}")

            # Reset scene for new episode
            self.reset_scene()

            # Enable domain randomization for variation
            if self.domain_randomization_config['object_placement']:
                self.randomize_object_positions()

            if self.domain_randomization_config['lighting']:
                self.randomize_lighting()

            # Collect sensor data
            sensor_data = self.collect_sensor_data()

            # Process and save data for training
            self.save_training_data(sensor_data, episode)

            # Step simulation
            self.world.step(render=True)

        print("Perception training scenario completed!")

    def reset_scene(self):
        """Reset scene to initial state"""
        # Reset object positions to initial configuration
        # This would restore original positions before randomization
        pass

    def randomize_object_positions(self):
        """Randomize positions of objects in the scene"""
        # Move objects to new random positions
        for i in range(self.num_dynamic_objects):
            for obj_type in ["chair", "table", "box", "plant", "person"]:
                obj_path = f"/World/{obj_type}_{i}"
                obj_prim = get_prim_at_path(obj_path)

                if obj_prim:
                    # Random new position
                    x_pos = np.random.uniform(-self.room_dimensions[0]*0.4, self.room_dimensions[0]*0.4)
                    y_pos = np.random.uniform(-self.room_dimensions[1]*0.4, self.room_dimensions[1]*0.4)

                    # Update position
                    obj_prim.GetAttribute("xformOp:translate").Set(
                        np.array([x_pos, y_pos, 0.2])  # Keep z at floor level
                    )

    def randomize_lighting(self):
        """Randomize lighting conditions"""
        main_light = get_prim_at_path("/World/main_light")
        if main_light:
            # Randomize intensity
            intensity = np.random.uniform(1000, 2500)
            main_light.GetAttribute("inputs:intensity").Set(intensity)

            # Randomize color temperature
            color_temp = np.random.uniform(3000, 6500)  # Kelvin
            color = self.color_temperature_to_rgb(color_temp)
            main_light.GetAttribute("inputs:color").Set(color)

    def color_temperature_to_rgb(self, color_temp):
        """Convert color temperature to RGB"""
        temp = color_temp / 100.0

        # Red
        if temp <= 66:
            red = 255
        else:
            red = temp - 60
            red = 329.698727446 * (red ** -0.1332047592)
            red = max(0, min(255, red))

        # Green
        if temp <= 66:
            green = temp
            green = 99.4708025861 * np.log(green) - 161.1195681661
        else:
            green = temp - 60
            green = 288.1221695283 * (green ** -0.0755148492)
        green = max(0, min(255, green))

        # Blue
        if temp >= 66:
            blue = 255
        elif temp <= 19:
            blue = 0
        else:
            blue = temp - 10
            blue = 138.5177312231 * np.log(blue) - 305.0447927307
            blue = max(0, min(255, blue))

        return (red/255.0, green/255.0, blue/255.0)

    def collect_sensor_data(self):
        """Collect data from all sensors"""
        sensor_data = {}

        for sensor_name, sensor in self.sensors.items():
            # Get RGB image
            rgb_data = sensor.get_rgb()
            sensor_data[f'{sensor_name}_rgb'] = rgb_data

            # Get depth data
            depth_data = sensor.get_depth()
            sensor_data[f'{sensor_name}_depth'] = depth_data

            # Get segmentation data
            seg_data = sensor.get_semantic_segmentation()
            sensor_data[f'{sensor_name}_segmentation'] = seg_data

            # Get bounding box data
            bbox_data = sensor.get_bounding_box_2d()
            sensor_data[f'{sensor_name}_bbox'] = bbox_data

        return sensor_data

    def save_training_data(self, data, episode):
        """Save collected data for training"""
        import os
        import cv2
        import json

        # Create episode directory
        episode_dir = f"perception_training_data/episode_{episode:04d}"
        os.makedirs(episode_dir, exist_ok=True)

        # Save sensor data
        for key, value in data.items():
            if 'rgb' in key:
                img = value
                cv2.imwrite(f"{episode_dir}/{key}.png", cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
            elif 'segmentation' in key:
                np.save(f"{episode_dir}/{key}.npy", value)
            elif 'depth' in key:
                np.save(f"{episode_dir}/{key}.npy", value)

        # Save episode metadata
        metadata = {
            'episode': episode,
            'timestamp': episode,
            'object_positions': self.get_object_positions(),
            'lighting_conditions': self.get_lighting_conditions()
        }

        with open(f"{episode_dir}/metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)

    def get_object_positions(self):
        """Get current positions of all objects"""
        positions = {}
        for i in range(self.num_dynamic_objects):
            for obj_type in ["chair", "table", "box", "plant", "person"]:
                obj_path = f"/World/{obj_type}_{i}"
                obj_prim = get_prim_at_path(obj_path)

                if obj_prim:
                    pos_attr = obj_prim.GetAttribute("xformOp:translate").Get()
                    if pos_attr:
                        positions[f"{obj_type}_{i}"] = pos_attr.tolist()

        return positions

    def get_lighting_conditions(self):
        """Get current lighting conditions"""
        main_light = get_prim_at_path("/World/main_light")
        if main_light:
            intensity = main_light.GetAttribute("inputs:intensity").Get()
            color = main_light.GetAttribute("inputs:color").Get()
            return {
                'intensity': intensity,
                'color': [color[0], color[1], color[2]]
            }
        return {}

# Usage example
def main():
    # Create perception training scene
    scene = HumanoidPerceptionScene()

    # Enable domain randomization
    scene.enable_domain_randomization()

    # Run perception training scenario
    scene.run_perception_training_scenario(num_episodes=10)

    # Cleanup
    scene.world.clear()

if __name__ == "__main__":
    main()
```

### Example 2: Synthetic Data Quality Assessment Tool
```python
# synthetic_data_quality_assessment.py - Tool for assessing synthetic data quality
import numpy as np
import cv2
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import torch
import torch.nn as nn
import torch.nn.functional as F

class SyntheticDataQualityAssessor:
    def __init__(self):
        self.quality_metrics = {}
        self.statistical_tests = {}
        self.visualizations = {}

    def assess_image_quality(self, synthetic_images, real_images=None):
        """Assess quality of synthetic images"""
        metrics = {}

        # Calculate BRISQUE (Blind/Referenceless Image Spatial Quality Evaluator) scores
        # This is a simplified version - full BRISQUE requires trained models
        synthetic_scores = [self.calculate_image_quality_score(img) for img in synthetic_images]
        metrics['avg_synthetic_quality'] = np.mean(synthetic_scores)
        metrics['synthetic_quality_std'] = np.std(synthetic_scores)

        if real_images is not None:
            real_scores = [self.calculate_image_quality_score(img) for img in real_images]
            metrics['avg_real_quality'] = np.mean(real_scores)

            # Compare distributions
            ks_statistic, p_value = stats.ks_2samp(synthetic_scores, real_scores)
            metrics['distribution_similarity'] = {
                'ks_statistic': ks_statistic,
                'p_value': p_value,
                'similar_distributions': p_value > 0.05  # p > 0.05 means similar
            }

        return metrics

    def calculate_image_quality_score(self, image):
        """Calculate a simple image quality score based on sharpness and contrast"""
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image

        # Calculate Laplacian variance (measure of focus/sharpness)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        # Calculate contrast (standard deviation of pixel intensities)
        contrast = np.std(gray)

        # Combine metrics (higher is better)
        quality_score = laplacian_var * 0.7 + contrast * 0.3

        return quality_score

    def assess_depth_quality(self, synthetic_depth, real_depth=None):
        """Assess quality of synthetic depth maps"""
        metrics = {}

        # Calculate depth accuracy metrics
        if real_depth is not None:
            # Absolute error
            abs_error = np.abs(synthetic_depth - real_depth)
            metrics['mean_absolute_error'] = np.mean(abs_error)
            metrics['root_mean_squared_error'] = np.sqrt(np.mean(np.square(abs_error)))

            # Percentage of pixels within threshold
            for threshold in [0.1, 0.2, 0.5]:  # meters
                within_threshold = np.mean(abs_error < threshold)
                metrics[f'within_{threshold}m'] = within_threshold

        # Check for realistic depth ranges
        metrics['min_depth'] = np.min(synthetic_depth)
        metrics['max_depth'] = np.max(synthetic_depth)
        metrics['depth_range'] = metrics['max_depth'] - metrics['min_depth']

        # Check for invalid values
        metrics['invalid_pixels'] = np.sum(np.isnan(synthetic_depth) | np.isinf(synthetic_depth))
        metrics['valid_ratio'] = 1 - (metrics['invalid_pixels'] / synthetic_depth.size)

        return metrics

    def assess_segmentation_quality(self, synthetic_seg, real_seg=None):
        """Assess quality of synthetic segmentation masks"""
        metrics = {}

        # Calculate segmentation accuracy metrics
        if real_seg is not None:
            # Pixel accuracy
            pixel_accuracy = np.mean(synthetic_seg == real_seg)
            metrics['pixel_accuracy'] = pixel_accuracy

            # Intersection over Union (IoU) for each class
            iou_scores = []
            unique_classes = np.unique(np.concatenate([real_seg.flatten(), synthetic_seg.flatten()]))

            for class_id in unique_classes:
                real_mask = (real_seg == class_id)
                syn_mask = (synthetic_seg == class_id)

                intersection = np.sum(real_mask & syn_mask)
                union = np.sum(real_mask | syn_mask)

                if union > 0:
                    iou = intersection / union
                    iou_scores.append(iou)

            metrics['mean_iou'] = np.mean(iou_scores) if iou_scores else 0
            metrics['iou_per_class'] = dict(zip(unique_classes, iou_scores))

        # Check for realistic class distributions
        class_counts = np.bincount(synthetic_seg.flatten())
        total_pixels = synthetic_seg.size
        class_ratios = class_counts / total_pixels

        metrics['class_distribution'] = class_ratios.tolist()
        metrics['num_classes'] = len(class_counts)

        return metrics

    def assess_domain_gap(self, synthetic_features, real_features):
        """Assess the domain gap between synthetic and real data"""
        # Use a classifier to distinguish between synthetic and real features
        # If classifier can easily distinguish them, domain gap is large

        # Prepare labels (0 for synthetic, 1 for real)
        syn_labels = np.zeros(len(synthetic_features))
        real_labels = np.ones(len(real_features))

        all_features = np.vstack([synthetic_features, real_features])
        all_labels = np.concatenate([syn_labels, real_labels])

        # Split into train/test
        X_train, X_test, y_train, y_test = train_test_split(
            all_features, all_labels, test_size=0.3, random_state=42
        )

        # Train classifier
        classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        classifier.fit(X_train, y_train)

        # Evaluate
        y_pred = classifier.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)

        # Domain gap is high if classifier accuracy is high (> 0.5 means better than random)
        domain_gap_metrics = {
            'classifier_accuracy': accuracy,
            'domain_gap_score': abs(accuracy - 0.5) * 2,  # Normalize to [0, 1]
            'domain_gap_interpretation': 'High' if accuracy > 0.7 else 'Medium' if accuracy > 0.6 else 'Low'
        }

        return domain_gap_metrics

    def generate_quality_report(self, synthetic_data, real_data=None):
        """Generate comprehensive quality assessment report"""
        report = {
            'summary': {},
            'detailed_metrics': {},
            'recommendations': []
        }

        # Assess image quality
        if 'images' in synthetic_data:
            syn_images = synthetic_data['images']
            real_images = real_data['images'] if real_data and 'images' in real_data else None
            image_metrics = self.assess_image_quality(syn_images, real_images)
            report['detailed_metrics']['image_quality'] = image_metrics

        # Assess depth quality
        if 'depth' in synthetic_data:
            syn_depth = synthetic_data['depth']
            real_depth = real_data['depth'] if real_data and 'depth' in real_data else None
            depth_metrics = self.assess_depth_quality(syn_depth, real_depth)
            report['detailed_metrics']['depth_quality'] = depth_metrics

        # Assess segmentation quality
        if 'segmentation' in synthetic_data:
            syn_seg = synthetic_data['segmentation']
            real_seg = real_data['segmentation'] if real_data and 'segmentation' in real_data else None
            seg_metrics = self.assess_segmentation_quality(syn_seg, real_seg)
            report['detailed_metrics']['segmentation_quality'] = seg_metrics

        # Generate summary
        report['summary'] = self.generate_summary(report['detailed_metrics'])

        # Generate recommendations
        report['recommendations'] = self.generate_recommendations(report['detailed_metrics'])

        return report

    def generate_summary(self, metrics):
        """Generate summary of quality metrics"""
        summary = {}

        if 'image_quality' in metrics:
            iq = metrics['image_quality']
            summary['image_quality_score'] = iq.get('avg_synthetic_quality', 0)
            if 'distribution_similarity' in iq:
                summary['distribution_similarity'] = iq['distribution_similarity']['similar_distributions']

        if 'depth_quality' in metrics:
            dq = metrics['depth_quality']
            summary['depth_accuracy'] = 1 / (1 + dq.get('mean_absolute_error', 1))  # Convert error to quality

        if 'segmentation_quality' in metrics:
            sq = metrics['segmentation_quality']
            summary['segmentation_accuracy'] = sq.get('pixel_accuracy', 0)
            summary['mean_iou'] = sq.get('mean_iou', 0)

        return summary

    def generate_recommendations(self, metrics):
        """Generate recommendations based on quality metrics"""
        recommendations = []

        # Image quality recommendations
        if 'image_quality' in metrics:
            iq = metrics['image_quality']
            if iq.get('avg_synthetic_quality', 0) < 100:  # Threshold is arbitrary
                recommendations.append("Consider improving image sharpness and contrast in synthetic data generation")

            if not iq.get('distribution_similarity', {}).get('similar_distributions', True):
                recommendations.append("Synthetic and real image distributions differ significantly; consider domain adaptation techniques")

        # Depth quality recommendations
        if 'depth_quality' in metrics:
            dq = metrics['depth_quality']
            if dq.get('mean_absolute_error', float('inf')) > 0.3:  # 30cm threshold
                recommendations.append("Depth accuracy needs improvement; consider refining depth sensor simulation")

            if dq.get('valid_ratio', 1) < 0.95:  # Less than 95% valid pixels
                recommendations.append("Address invalid depth values in synthetic data")

        # Segmentation quality recommendations
        if 'segmentation_quality' in metrics:
            sq = metrics['segmentation_quality']
            if sq.get('mean_iou', 0) < 0.5:  # 50% IoU threshold
                recommendations.append("Segmentation quality is low; consider improving annotation accuracy or model training")

        return recommendations

    def visualize_quality_metrics(self, metrics, save_path=None):
        """Create visualizations of quality metrics"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))

        # Plot 1: Image quality comparison
        if 'image_quality' in metrics:
            iq = metrics['image_quality']
            ax = axes[0, 0]
            if 'avg_real_quality' in iq:
                ax.bar(['Synthetic', 'Real'], [iq['avg_synthetic_quality'], iq['avg_real_quality']])
                ax.set_title('Image Quality Comparison')
                ax.set_ylabel('Quality Score')
            else:
                ax.text(0.5, 0.5, 'Real data not provided for comparison',
                       horizontalalignment='center', verticalalignment='center', transform=ax.transAxes)
                ax.set_title('Synthetic Image Quality')

        # Plot 2: Depth accuracy
        if 'depth_quality' in metrics:
            dq = metrics['depth_quality']
            ax = axes[0, 1]
            thresholds = [0.1, 0.2, 0.5]
            within_thresholds = [dq.get(f'within_{t}m', 0) for t in thresholds]
            ax.bar([f'< {t}m' for t in thresholds], within_thresholds)
            ax.set_title('Depth Accuracy')
            ax.set_ylabel('Percentage of Pixels')
            ax.set_ylim([0, 1])

        # Plot 3: Segmentation IoU
        if 'segmentation_quality' in metrics:
            sq = metrics['segmentation_quality']
            ax = axes[1, 0]
            if 'iou_per_class' in sq:
                classes = list(sq['iou_per_class'].keys())
                ious = list(sq['iou_per_class'].values())
                ax.bar([f'Class {c}' for c in classes], ious)
                ax.set_title('IoU per Class')
                ax.set_ylabel('IoU')
                ax.set_ylim([0, 1])
                plt.setp(ax.get_xticklabels(), rotation=45)

        # Plot 4: Class distribution
        if 'segmentation_quality' in metrics and 'class_distribution' in metrics['segmentation_quality']:
            sq = metrics['segmentation_quality']
            ax = axes[1, 1]
            class_ratios = sq['class_distribution']
            ax.pie(class_ratios, labels=[f'Class {i}' for i in range(len(class_ratios))], autopct='%1.1f%%')
            ax.set_title('Class Distribution')

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path)

        plt.show()

# Usage example
def main():
    # Initialize quality assessor
    assessor = SyntheticDataQualityAssessor()

    # Example synthetic data (in practice, this would come from Isaac Sim)
    synthetic_images = [np.random.rand(480, 640, 3) * 255 for _ in range(10)]
    synthetic_depth = [np.random.rand(480, 640) * 10 for _ in range(10)]  # Depth in meters
    synthetic_seg = [np.random.randint(0, 7, (480, 640)) for _ in range(10)]  # 7 classes

    # Example real data for comparison (in practice, this would be collected from real robot)
    real_images = [np.random.rand(480, 640, 3) * 255 for _ in range(10)]
    real_depth = [np.random.rand(480, 640) * 10 for _ in range(10)]
    real_seg = [np.random.randint(0, 7, (480, 640)) for _ in range(10)]

    # Create data dictionaries
    synthetic_data = {
        'images': synthetic_images,
        'depth': synthetic_depth,
        'segmentation': synthetic_seg
    }

    real_data = {
        'images': real_images,
        'depth': real_depth,
        'segmentation': real_seg
    }

    # Generate quality report
    report = assessor.generate_quality_report(synthetic_data, real_data)

    print("Quality Assessment Report:")
    print("==========================")
    print("Summary:", report['summary'])
    print("\nDetailed Metrics:", report['detailed_metrics'])
    print("\nRecommendations:", report['recommendations'])

    # Visualize metrics
    assessor.visualize_quality_metrics(report['detailed_metrics'])

if __name__ == "__main__":
    main()
```

### Example 3: Isaac Sim Synthetic Data Pipeline for Humanoid Perception
```python
# isaac_sim_synthetic_pipeline.py - Complete pipeline for Isaac Sim synthetic data generation
import omni
from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.nucleus import get_assets_root_path
from omni.isaac.core.utils.prims import create_prim
from omni.isaac.core.utils.semantics import add_semantics
from omni.isaac.sensor import Camera
from omni.isaac.core.materials import OmniPBR
import carb
import numpy as np
import cv2
import json
import os
import time
from datetime import datetime
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
import threading
import queue

@dataclass
class IsaacSimConfig:
    """Configuration for Isaac Sim synthetic data pipeline"""
    # Scene configuration
    room_size: Tuple[float, float, float] = (10.0, 8.0, 3.0)
    num_objects: int = 20

    # Sensor configuration
    camera_resolution: Tuple[int, int] = (640, 480)
    camera_frequency: int = 30

    # Data generation
    num_episodes: int = 1000
    frames_per_episode: int = 100
    save_frequency: int = 10  # Save every N frames

    # Domain randomization
    enable_domain_randomization: bool = True
    domain_randomization_frequency: int = 20  # Randomize every N frames

    # Output configuration
    output_directory: str = "isaac_sim_synthetic_data"
    dataset_name: str = "humanoid_perception_dataset"

class IsaacSimSyntheticPipeline:
    def __init__(self, config: IsaacSimConfig):
        self.config = config
        self.world = World(stage_units_in_meters=1.0)

        # Data collection components
        self.data_queue = queue.Queue(maxsize=100)  # Buffer for collected data
        self.data_saver_thread = None
        self.is_collecting = False

        # Scene components
        self.scene_objects = []
        self.cameras = {}

        # Statistics
        self.stats = {
            'frames_collected': 0,
            'episodes_completed': 0,
            'collection_time': 0,
            'data_saved': 0
        }

        # Setup output directory
        self.setup_output_directory()

        # Setup scene
        self.setup_scene()

    def setup_output_directory(self):
        """Setup output directory structure"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.output_dir = os.path.join(
            self.config.output_directory,
            f"{self.config.dataset_name}_{timestamp}"
        )

        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(os.path.join(self.output_dir, "images"), exist_ok=True)
        os.makedirs(os.path.join(self.output_dir, "depth"), exist_ok=True)
        os.makedirs(os.path.join(self.output_dir, "segmentation"), exist_ok=True)
        os.makedirs(os.path.join(self.output_dir, "metadata"), exist_ok=True)

        # Save configuration
        config_path = os.path.join(self.output_dir, "config.json")
        with open(config_path, 'w') as f:
            json.dump(self.config.__dict__, f, indent=2)

    def setup_scene(self):
        """Setup the Isaac Sim scene for data collection"""
        print("Setting up Isaac Sim scene...")

        # Create environment
        self.create_environment()

        # Add humanoid robot placeholder
        self.add_robot_placeholder()

        # Add objects for perception training
        self.add_perception_objects()

        # Setup sensors
        self.setup_sensors()

        # Configure physics
        self.configure_physics()

        print("Scene setup complete!")

    def create_environment(self):
        """Create indoor environment"""
        # Create floor
        create_prim(
            prim_path="/World/floor",
            prim_type="Plane",
            position=np.array([0, 0, 0]),
            scale=np.array([self.config.room_size[0], self.config.room_size[1], 1])
        )

        # Create walls
        wall_height = self.config.room_size[2]

        # Front wall
        create_prim(
            prim_path="/World/wall_front",
            prim_type="Cuboid",
            position=np.array([0, self.config.room_size[1]/2, wall_height/2]),
            scale=np.array([self.config.room_size[0], 0.1, wall_height])
        )

        # Back wall
        create_prim(
            prim_path="/World/wall_back",
            prim_type="Cuboid",
            position=np.array([0, -self.config.room_size[1]/2, wall_height/2]),
            scale=np.array([self.config.room_size[0], 0.1, wall_height])
        )

        # Left wall
        create_prim(
            prim_type="Cuboid",
            prim_path="/World/wall_left",
            position=np.array([self.config.room_size[0]/2, 0, wall_height/2]),
            scale=np.array([0.1, self.config.room_size[1], wall_height])
        )

        # Right wall
        create_prim(
            prim_type="Cuboid",
            prim_path="/World/wall_right",
            position=np.array([-self.config.room_size[0]/2, 0, wall_height/2]),
            scale=np.array([0.1, self.config.room_size[1], wall_height])
        )

        # Add lighting
        main_light = create_prim(
            prim_path="/World/main_light",
            prim_type="DiskLight",
            position=np.array([0, 0, 2.5]),
        )
        main_light.GetAttribute("inputs:intensity").Set(1500)

    def add_robot_placeholder(self):
        """Add humanoid robot placeholder"""
        robot_prim = create_prim(
            prim_path="/World/HumanoidRobot",
            prim_type="Cylinder",
            position=np.array([0, 0, 0.75]),
            scale=np.array([0.3, 0.3, 1.5])
        )

    def add_perception_objects(self):
        """Add objects for perception training"""
        object_types = ["chair", "table", "box", "plant", "person", "obstacle"]

        for i in range(self.config.num_objects):
            obj_type = np.random.choice(object_types)
            obj_path = f"/World/object_{i}"

            # Random position
            x_pos = np.random.uniform(-self.config.room_size[0]*0.4, self.config.room_size[0]*0.4)
            y_pos = np.random.uniform(-self.config.room_size[1]*0.4, self.config.room_size[1]*0.4)
            z_pos = 0.2  # On floor

            # Create object based on type
            if obj_type == "chair":
                create_prim(
                    prim_path=obj_path,
                    prim_type="Cuboid",
                    position=np.array([x_pos, y_pos, z_pos + 0.4]),
                    scale=np.array([0.4, 0.4, 0.8])
                )
            elif obj_type == "table":
                create_prim(
                    prim_path=obj_path,
                    prim_type="Cuboid",
                    position=np.array([x_pos, y_pos, z_pos + 0.35]),
                    scale=np.array([0.8, 0.6, 0.7])
                )
            elif obj_type == "box":
                create_prim(
                    prim_path=obj_path,
                    prim_type="Cuboid",
                    position=np.array([x_pos, y_pos, z_pos + 0.15]),
                    scale=np.array([0.3, 0.3, 0.3])
                )
            elif obj_type == "plant":
                create_prim(
                    prim_path=obj_path,
                    prim_type="Cylinder",
                    position=np.array([x_pos, y_pos, z_pos + 0.3]),
                    scale=np.array([0.15, 0.15, 0.6])
                )
            elif obj_type == "person":
                create_prim(
                    prim_path=obj_path,
                    prim_type="Cylinder",
                    position=np.array([x_pos, y_pos, z_pos + 0.9]),
                    scale=np.array([0.2, 0.2, 1.8])
                )
            else:  # obstacle
                create_prim(
                    prim_path=obj_path,
                    prim_type="Cuboid",
                    position=np.array([x_pos, y_pos, z_pos + 0.25]),
                    scale=np.array([0.2, 0.2, 0.5])
                )

            # Add semantic label
            add_semantics(obj_path, obj_type)
            self.scene_objects.append(obj_path)

    def setup_sensors(self):
        """Setup cameras and sensors"""
        # Head camera
        head_camera = Camera(
            prim_path="/World/HumanoidRobot/head_camera",
            position=np.array([0, 0, 1.4]),
            frequency=self.config.camera_frequency,
            resolution=self.config.camera_resolution
        )

        head_camera.add_segmentation_annotator("semantic")
        head_camera.add_distance_to_image_annotator("depth")

        self.cameras['head'] = head_camera

    def configure_physics(self):
        """Configure physics properties"""
        self.world.scene.enable_gravity = True
        self.world.scene.gravity = np.array([0, 0, -9.81])

    def start_data_collection(self):
        """Start the synthetic data collection process"""
        print("Starting synthetic data collection...")

        # Start data saver thread
        self.is_collecting = True
        self.data_saver_thread = threading.Thread(target=self.data_saver_worker)
        self.data_saver_thread.start()

        start_time = time.time()

        try:
            for episode in range(self.config.num_episodes):
                print(f"Starting episode {episode + 1}/{self.config.num_episodes}")

                # Reset scene for new episode
                self.reset_scene_for_episode(episode)

                for frame in range(self.config.frames_per_episode):
                    # Step simulation
                    self.world.step(render=True)

                    # Collect data
                    if frame % self.config.save_frequency == 0:
                        sensor_data = self.collect_sensor_data()
                        metadata = self.collect_metadata(episode, frame)

                        # Add to queue for saving
                        data_item = {
                            'sensor_data': sensor_data,
                            'metadata': metadata,
                            'episode': episode,
                            'frame': frame
                        }

                        try:
                            self.data_queue.put(data_item, timeout=1.0)
                        except queue.Full:
                            print("Warning: Data queue is full, dropping frame")

                    # Apply domain randomization
                    if (self.config.enable_domain_randomization and
                        frame % self.config.domain_randomization_frequency == 0):
                        self.apply_domain_randomization()

                self.stats['episodes_completed'] += 1
                print(f"Completed episode {episode + 1}")

        except KeyboardInterrupt:
            print("Data collection interrupted by user")

        finally:
            # Stop collection
            self.is_collecting = False

            # Wait for saver thread to finish
            if self.data_saver_thread:
                self.data_saver_thread.join()

            self.stats['collection_time'] = time.time() - start_time
            self.print_statistics()

    def reset_scene_for_episode(self, episode_num):
        """Reset scene configuration for new episode"""
        # Move objects to new random positions
        for obj_path in self.scene_objects:
            x_pos = np.random.uniform(-self.config.room_size[0]*0.4, self.config.room_size[0]*0.4)
            y_pos = np.random.uniform(-self.config.room_size[1]*0.4, self.config.room_size[1]*0.4)

            obj_prim = self.world.stage.GetPrimAtPath(obj_path)
            if obj_prim:
                obj_prim.GetAttribute("xformOp:translate").Set(
                    np.array([x_pos, y_pos, 0.2])
                )

    def collect_sensor_data(self):
        """Collect data from all sensors"""
        sensor_data = {}

        for cam_name, camera in self.cameras.items():
            # Get RGB image
            rgb_data = camera.get_rgb()
            sensor_data[f'{cam_name}_rgb'] = rgb_data

            # Get depth data
            depth_data = camera.get_depth()
            sensor_data[f'{cam_name}_depth'] = depth_data

            # Get segmentation data
            seg_data = camera.get_semantic_segmentation()
            sensor_data[f'{cam_name}_segmentation'] = seg_data

        return sensor_data

    def collect_metadata(self, episode, frame):
        """Collect metadata for current frame"""
        return {
            'episode': episode,
            'frame': frame,
            'timestamp': time.time(),
            'object_positions': self.get_object_positions(),
            'lighting_conditions': self.get_lighting_conditions(),
            'domain_randomization_applied': self.config.enable_domain_randomization
        }

    def get_object_positions(self):
        """Get current positions of all objects"""
        positions = {}
        for obj_path in self.scene_objects:
            obj_prim = self.world.stage.GetPrimAtPath(obj_path)
            if obj_prim:
                pos_attr = obj_prim.GetAttribute("xformOp:translate").Get()
                if pos_attr:
                    positions[obj_path] = pos_attr.tolist()
        return positions

    def get_lighting_conditions(self):
        """Get current lighting conditions"""
        light_prim = self.world.stage.GetPrimAtPath("/World/main_light")
        if light_prim:
            intensity = light_prim.GetAttribute("inputs:intensity").Get()
            color = light_prim.GetAttribute("inputs:color").Get()
            return {
                'intensity': intensity,
                'color': [color[0], color[1], color[2]]
            }
        return {}

    def apply_domain_randomization(self):
        """Apply domain randomization"""
        # Randomize lighting
        light_prim = self.world.stage.GetPrimAtPath("/World/main_light")
        if light_prim:
            intensity = np.random.uniform(1000, 2500)
            light_prim.GetAttribute("inputs:intensity").Set(intensity)

    def data_saver_worker(self):
        """Worker thread for saving data to disk"""
        while self.is_collecting or not self.data_queue.empty():
            try:
                data_item = self.data_queue.get(timeout=1.0)

                # Save sensor data
                self.save_sensor_data(data_item)

                # Update statistics
                self.stats['frames_collected'] += 1
                self.stats['data_saved'] += 1

            except queue.Empty:
                continue  # Check if still collecting

        print("Data saver worker finished")

    def save_sensor_data(self, data_item):
        """Save sensor data to disk"""
        episode = data_item['episode']
        frame = data_item['frame']

        # Create episode directory
        episode_dir = os.path.join(self.output_dir, f"episode_{episode:04d}")
        os.makedirs(episode_dir, exist_ok=True)

        # Save sensor data
        for key, value in data_item['sensor_data'].items():
            if 'rgb' in key:
                img = value
                cv2.imwrite(
                    os.path.join(episode_dir, f"{key}_frame_{frame:06d}.png"),
                    cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                )
            elif 'depth' in key:
                np.save(
                    os.path.join(episode_dir, f"{key}_frame_{frame:06d}.npy"),
                    value
                )
            elif 'segmentation' in key:
                cv2.imwrite(
                    os.path.join(episode_dir, f"{key}_frame_{frame:06d}.png"),
                    value
                )

        # Save metadata
        meta_path = os.path.join(episode_dir, f"metadata_frame_{frame:06d}.json")
        with open(meta_path, 'w') as f:
            json.dump(data_item['metadata'], f, indent=2)

    def print_statistics(self):
        """Print collection statistics"""
        print("\nSynthetic Data Collection Statistics:")
        print(f"  Episodes completed: {self.stats['episodes_completed']}")
        print(f"  Frames collected: {self.stats['frames_collected']}")
        print(f"  Total collection time: {self.stats['collection_time']:.2f} seconds")
        print(f"  Average FPS: {self.stats['frames_collected'] / self.stats['collection_time']:.2f}")
        print(f"  Data saved: {self.stats['data_saved']} items")
        print(f"  Output directory: {self.output_dir}")

    def cleanup(self):
        """Clean up resources"""
        self.is_collecting = False
        if self.data_saver_thread:
            self.data_saver_thread.join()
        self.world.clear()

# Usage example
def main():
    # Configure the pipeline
    config = IsaacSimConfig(
        room_size=(12.0, 10.0, 4.0),
        num_objects=30,
        num_episodes=10,  # Reduced for example
        frames_per_episode=50,  # Reduced for example
        save_frequency=5,  # Save every 5 frames
        enable_domain_randomization=True
    )

    # Initialize pipeline
    pipeline = IsaacSimSyntheticPipeline(config)

    try:
        # Start data collection
        pipeline.start_data_collection()
    finally:
        # Cleanup
        pipeline.cleanup()

if __name__ == "__main__":
    main()
```

## System-Level Architecture Perspective
### Isaac Sim in the Humanoid Robotics Perception Pipeline
Isaac Sim serves as a critical component in the humanoid robotics perception development pipeline, bridging the gap between simulation and real-world deployment:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Real World    │    │  Isaac Sim      │    │  Synthetic      │    │  ML Training    │
│   Data (Hard)   │◄──▶│  (Synthetic    │───▶│  Data Pipeline  │───▶│  Pipeline      │
│                 │    │  Generation)    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         ▼                       ▼                            
┌─────────────────┐    ┌─────────────────┐    
│   Perception    │    │   Photorealistic│
│   Models        │    │   Simulation    │
│   (Trained)     │    │   & Domain      │
└─────────────────┘    │   Randomization │
                       └─────────────────┘
```

### Integration Architecture
The Isaac Sim synthetic data generation architecture involves several key components:

- **Scene Generation**: Creating diverse, configurable environments for data collection
- **Sensor Simulation**: Accurate simulation of RGB, depth, and semantic sensors
- **Domain Randomization**: Systematic variation of scene properties to improve generalization
- **Data Annotation**: Automatic generation of ground truth labels
- **Quality Assessment**: Validation of synthetic data quality and transferability

### Synthetic-to-Real Transfer Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Isaac Sim     │    │  Domain         │    │  Real Robot     │
│  (Synthetic     │───▶│  Adaptation    │───▶  (Validation &   │
│  Data)          │    │  Techniques     │    │  Deployment)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       
         ▼                                       
┌─────────────────┐    
│   Large Dataset │
│   Generation    │
│   (Efficient)   │
└─────────────────┘
```

## Practical Reasoning
### When to Use Isaac Sim for Synthetic Data
Isaac Sim is particularly valuable for humanoid robotics when:

1. **Perception System Training**: Generating large, diverse datasets for computer vision models
2. **Safety-Critical Scenarios**: Creating training data for rare or dangerous situations
3. **Sensor Fusion Development**: Testing perception algorithms with multiple sensor types
4. **Human-Robot Interaction**: Creating diverse social scenarios for HRI perception
5. **Domain Adaptation**: Bridging the gap between synthetic and real-world data

### Isaac Sim vs Other Simulation Platforms
**Isaac Sim Advantages:**
- Photorealistic rendering with RTX acceleration
- Comprehensive sensor simulation
- Advanced domain randomization capabilities
- Integration with NVIDIA's AI/ML ecosystem
- Realistic physics simulation

**Isaac Sim Considerations:**
- Hardware requirements (RTX GPU recommended)
- Licensing costs for commercial use
- Learning curve for USD scene composition
- Computational overhead for complex scenes

### Best Practices for Isaac Sim Synthetic Data
1. **Realistic Scene Composition**: Create environments that match target deployment scenarios
2. **Comprehensive Annotation**: Generate multiple types of ground truth (segmentation, depth, etc.)
3. **Systematic Variation**: Use domain randomization to improve model robustness
4. **Quality Assessment**: Regularly validate synthetic data quality against real data
5. **Efficient Pipelines**: Optimize data generation for maximum throughput

## Failure Modes and Debugging
### Common Isaac Sim Issues
1. **Performance Bottlenecks**:
   - Cause: Complex scenes or high-resolution rendering
   - Solution: Optimize scene complexity and use appropriate hardware

2. **Rendering Artifacts**:
   - Cause: Lighting or material configuration issues
   - Solution: Validate material properties and lighting setup

3. **Domain Gap Issues**:
   - Cause: Insufficient domain randomization
   - Solution: Implement comprehensive domain randomization strategies

4. **Data Quality Problems**:
   - Cause: Incorrect sensor configuration
   - Solution: Validate sensor parameters against real hardware

### Synthetic Data Validation
1. **Statistical Comparison**: Compare synthetic and real data distributions
2. **Model Performance**: Test trained models on real-world validation sets
3. **Transfer Assessment**: Evaluate domain gap using classification approaches
4. **Qualitative Analysis**: Visual inspection of synthetic vs real data

### Debugging Tools and Techniques
```python
# Isaac Sim Debugging Helper
import omni
from pxr import Usd, UsdGeom, Gf
import carb

class IsaacSimDebugger:
    def __init__(self, world):
        self.world = world
        self.stage = world.stage

    def check_scene_integrity(self):
        """Check for common scene issues"""
        issues = []

        # Check for overlapping objects
        issues.extend(self.check_object_overlap())

        # Check for invalid materials
        issues.extend(self.check_material_issues())

        # Check for sensor configuration
        issues.extend(self.check_sensor_configuration())

        return issues

    def check_object_overlap(self):
        """Check for overlapping objects in the scene"""
        overlaps = []

        # This would involve checking bounding boxes of objects
        # For brevity, we'll just return an empty list
        return overlaps

    def check_material_issues(self):
        """Check for material configuration issues"""
        issues = []

        for prim in self.stage.TraverseAll():
            if prim.GetTypeName() == "Material":
                # Check material properties
                pass

        return issues

    def check_sensor_configuration(self):
        """Check sensor configuration for common issues"""
        issues = []

        # Check if sensors are properly configured
        # This would involve checking sensor prim properties
        return issues

    def validate_synthetic_data(self, synthetic_data, real_data_stats):
        """Validate synthetic data against real data statistics"""
        validation_results = {}

        # Compare key statistics
        for key in real_data_stats:
            if key in synthetic_data:
                syn_stat = synthetic_data[key]
                real_stat = real_data_stats[key]

                # Calculate difference
                if isinstance(syn_stat, (int, float)) and isinstance(real_stat, (int, float)):
                    diff = abs(syn_stat - real_stat)
                    validation_results[key] = {
                        'synthetic': syn_stat,
                        'real': real_stat,
                        'difference': diff,
                        'acceptable': diff < 0.1  # Threshold is arbitrary
                    }

        return validation_results
```

## Exercises
### Beginner Exercises
1. **Isaac Sim Setup**: Install and configure Isaac Sim on your development machine
2. **Simple Scene Creation**: Create a basic scene with a robot and simple objects
3. **Sensor Configuration**: Add and configure a camera sensor in Isaac Sim

### Intermediate Exercises
4. **Domain Randomization**: Implement basic domain randomization techniques in Isaac Sim
5. **Synthetic Dataset Generation**: Generate a small synthetic dataset for object detection
6. **Quality Assessment**: Develop metrics to assess synthetic data quality

### Advanced Exercises
7. **Complete Perception Pipeline**: Build an end-to-end synthetic data generation pipeline
8. **Domain Adaptation**: Implement domain adaptation techniques for synthetic-to-real transfer
9. **Multi-sensor Fusion**: Generate synthetic data for multi-sensor perception systems
10. **Scalable Data Generation**: Optimize the pipeline for large-scale synthetic dataset generation

## Multiple Choice Questions (MCQs)
**Question 1:** What is the primary advantage of Isaac Sim over traditional robotics simulators?
  - a) Better physics simulation
  - b) Photorealistic rendering with RTX acceleration
  - c) Lower computational requirements
  - d) Simpler interface
  - **Answer: b) Photorealistic rendering with RTX acceleration**
  - **Explanation:** Isaac Sim's key advantage is its photorealistic rendering capabilities using RTX technology.

**Question 2:** What does domain randomization in Isaac Sim help achieve?
  - a) Faster simulation
  - b) Improved synthetic-to-real transfer learning
  - c) Reduced computational requirements
  - d) Better physics accuracy
  - **Answer: b) Improved synthetic-to-real transfer learning**
  - **Explanation:** Domain randomization helps models trained on synthetic data perform better on real data.

**Question 3:** Which file format is primarily used by Isaac Sim for scene description?
  - a) URDF
  - b) SDF
  - c) USD (Universal Scene Description)
  - d) OBJ
  - **Answer: c) USD (Universal Scene Description)**
  - **Explanation:** Isaac Sim uses NVIDIA's Universal Scene Description (USD) format.

**Question 4:** What is synthetic-to-real transfer in robotics?
  - a) Moving robots from simulation to reality
  - b) Training models on synthetic data that work on real robots
  - c) Converting real data to synthetic data
  - d) Real-time simulation
  - **Answer: b) Training models on synthetic data that work on real robots**
  - **Explanation:** Synthetic-to-real transfer refers to the ability to train on synthetic data and deploy on real robots.

**Question 5:** Which Isaac Sim feature is most important for generating training data?
  - a) Physics simulation
  - b) Sensor simulation and annotation tools
  - c) Collision detection
  - d) Joint constraints
  - **Answer: b) Sensor simulation and annotation tools**
  - **Explanation:** Sensor simulation with automatic annotation is crucial for generating labeled training data.

**Question 6:** What is the typical purpose of domain randomization?
  - a) To make simulation faster
  - b) To improve model generalization to real-world conditions
  - c) To reduce memory usage
  - d) To simplify scene complexity
  - **Answer: b) To improve model generalization to real-world conditions**
  - **Explanation:** Domain randomization varies scene properties to improve model robustness.

**Question 7:** Which GPU technology does Isaac Sim leverage for photorealistic rendering?
  - a) CUDA cores only
  - b) RTX ray tracing and AI denoising
  - c) Tensor cores only
  - d) Shader cores only
  - **Answer: b) RTX ray tracing and AI denoising**
  - **Explanation:** Isaac Sim uses RTX technology for realistic rendering.

**Question 8:** What is a common challenge in synthetic data generation?
  - a) Too much realism
  - b) The reality gap between synthetic and real data
  - c) Too much computational power
  - d) Excessive data quality
  - **Answer: b) The reality gap between synthetic and real data**
  - **Explanation:** The reality gap is the main challenge in synthetic data generation.

**Question 9:** Which Isaac Sim component is essential for automatic data annotation?
  - a) Physics engine
  - b) Sensor annotators
  - c) Collision system
  - d) Joint controllers
  - **Answer: b) Sensor annotators**
  - **Explanation:** Sensor annotators provide automatic ground truth labels for training data.

**Question 10:** Why is synthetic data generation valuable for humanoid robotics?
  - a) Only for gaming applications
  - b) To generate large, diverse, labeled datasets efficiently
  - c) To replace real robots completely
  - d) To reduce hardware requirements
  - **Answer: b) To generate large, diverse, labeled datasets efficiently**
  - **Explanation:** Synthetic data enables efficient generation of diverse, labeled training datasets.

## Chapter Summary
This chapter covered NVIDIA Isaac Sim for synthetic data generation in humanoid robotics, focusing on photorealistic simulation, domain randomization techniques, and synthetic-to-real transfer learning. The technical content included Isaac Sim environment setup, synthetic data generation pipelines, domain randomization methods, and quality assessment tools. Practical examples demonstrated complete perception training pipelines and data quality validation. Isaac Sim's photorealistic rendering and comprehensive sensor simulation capabilities make it invaluable for generating large, diverse training datasets that enable humanoid robots to perceive and interact with real-world environments effectively.

## Citations
1. NVIDIA. (2023). "NVIDIA Isaac Sim Documentation." *NVIDIA Developer*. https://docs.omniverse.nvidia.com/isaacsim
2. Tobin, J., et al. (2017). "Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World." *IROS Conference*.
3. James, S., et al. (2019). "Sim-to-Real via Sim-to-Sim: Data-efficient robotic grasping via randomized-to-canonical adaptation networks." *CVPR Conference*.
4. NVIDIA. (2022). "Synthetic Data Generation for Robotics Applications." *NVIDIA Technical Report*.
5. OpenAI. (2019). "Solving Rubik's Cube with a Robot Hand." *OpenAI Research*.
6. ROSIN Project. (2021). "Simulation Tools for Robotics Development." *ROSIN Technical Report*.
7. Kolve, E., et al. (2017). "AI2-THOR: An Interactive 3D Environment for Visual AI." *arXiv preprint*.
8. Isaac ROS Team. (2022). "Isaac ROS Perception Pipeline Integration." *NVIDIA Technical Report*.

## Recent Developments
- **Isaac Sim 2023.1+**: Enhanced synthetic data generation tools with improved domain randomization
- **RTX 40 Series Integration**: Better performance for photorealistic rendering and sensor simulation
- **Synthetic Data Quality Metrics**: New tools for assessing synthetic data transferability
- **Cloud-Based Simulation**: Scalable synthetic data generation using NVIDIA DGX Cloud
- **Automated Annotation**: Improved automatic labeling tools for various perception tasks
- **Multi-Modal Sensors**: Enhanced simulation of LiDAR, thermal, and other sensor types
- **Human-Centric Environments**: Better simulation of human environments for HRI applications
- **Edge Deployment**: Optimized synthetic data for edge AI deployment on humanoid robots