---
id: chapter-15-manipulation-grasping
title: "Chapter 15: Manipulation & Grasping"
sidebar_position: 4
description: "Implementing manipulation and grasping systems for humanoid robots with force control"
---

# Chapter 15: Manipulation & Grasping

## Learning Objectives

After completing this chapter, students will be able to:
1. Analyze the kinematic and dynamic properties of humanoid robot manipulator systems for effective manipulation
2. Implement grasp planning algorithms that consider object geometry, stability, and robot capabilities
3. Design force control strategies for safe and robust object manipulation
4. Integrate visual and tactile feedback for adaptive grasping and manipulation
5. Evaluate and optimize manipulation performance metrics including success rate, precision, and safety

## Conceptual Explanation

Manipulation and grasping represent fundamental capabilities for humanoid robots, enabling them to interact with objects in their environment and perform complex tasks. Unlike simple pick-and-place operations, humanoid manipulation must account for the full-body nature of these robots, where manipulation tasks affect overall balance and stability.

The grasping problem involves determining stable contact points between robot fingers and object surfaces, considering factors like friction, object weight, and intended manipulation forces. A successful grasp must provide sufficient stability to prevent object slippage while allowing for the planned manipulation tasks.

Humanoid robot arms typically have 7+ degrees of freedom, providing redundant kinematic capabilities that enable complex manipulation while maintaining balance. The redundancy allows the system to optimize for multiple objectives simultaneously, such as reaching a target while maintaining head orientation or keeping the center of mass within the support polygon.

Force control is crucial for safe manipulation, as excessive forces can damage objects or the robot itself. Impedance control and admittance control strategies allow robots to behave like compliant systems when interacting with the environment, adapting to uncertainties in object properties and positions.

Visual feedback provides critical information for object recognition, pose estimation, and grasp planning. Modern approaches integrate deep learning with classical computer vision to achieve robust object detection and pose estimation in unstructured environments.

Tactile sensing enhances manipulation by providing direct feedback about contact forces, slip detection, and object properties. This sensory information enables fine manipulation tasks and adaptive grasping strategies that respond to real-time conditions.

The integration of manipulation with locomotion and balance control is essential for humanoid robots, as manipulation tasks can significantly affect the robot's center of mass and stability. Coordinated control strategies must consider the coupled dynamics of manipulation and balance.

## Technical Content

### Kinematic Control for Manipulation

The kinematic control system handles the relationship between joint angles and end-effector positions:

```python
import numpy as np
from scipy.spatial.transform import Rotation as R
from typing import Tuple, Optional

class ManipulatorKinematics:
    def __init__(self, dh_parameters: list, joint_limits: list):
        """
        Initialize manipulator kinematics using Denavit-Hartenberg parameters
        dh_parameters: list of [a, alpha, d, theta_offset] for each joint
        joint_limits: list of [min, max] for each joint
        """
        self.dh_params = dh_parameters
        self.joint_limits = joint_limits
        self.n_joints = len(dh_parameters)

    def dh_transform(self, a: float, alpha: float, d: float, theta: float) -> np.ndarray:
        """Compute Denavit-Hartenberg transformation matrix"""
        ct, st = np.cos(theta), np.sin(theta)
        ca, sa = np.cos(alpha), np.sin(alpha)

        return np.array([
            [ct, -st * ca, st * sa, a * ct],
            [st, ct * ca, -ct * sa, a * st],
            [0, sa, ca, d],
            [0, 0, 0, 1]
        ])

    def forward_kinematics(self, joint_angles: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Compute forward kinematics to get end-effector pose"""
        if len(joint_angles) != self.n_joints:
            raise ValueError(f"Expected {self.n_joints} joint angles, got {len(joint_angles)}")

        T = np.eye(4)  # Identity transformation

        for i in range(self.n_joints):
            a, alpha, d, theta_offset = self.dh_params[i]
            T_i = self.dh_transform(a, alpha, d, joint_angles[i] + theta_offset)
            T = T @ T_i

        # Extract position and orientation
        position = T[:3, 3]
        orientation = T[:3, :3]

        return position, orientation

    def jacobian(self, joint_angles: np.ndarray) -> np.ndarray:
        """Compute geometric Jacobian matrix"""
        n = len(joint_angles)
        J = np.zeros((6, n))  # 6DOF (3 pos + 3 rot) x n joints

        # Get all transformation matrices
        T_cum = np.eye(4)
        T_list = [T_cum.copy()]

        for i in range(n):
            a, alpha, d, theta_offset = self.dh_params[i]
            T_i = self.dh_transform(a, alpha, d, joint_angles[i] + theta_offset)
            T_cum = T_cum @ T_i
            T_list.append(T_cum.copy())

        # End-effector position
        p_end = T_list[-1][:3, 3]

        # Compute Jacobian columns
        for i in range(n):
            # Z-axis of joint i in base frame
            z_i = T_list[i][:3, 2]
            # Position of joint i in base frame
            p_i = T_list[i][:3, 3]

            # Linear velocity component
            J[:3, i] = np.cross(z_i, (p_end - p_i))
            # Angular velocity component
            J[3:, i] = z_i

        return J

    def inverse_kinematics(self, target_pose: np.ndarray,
                          initial_guess: np.ndarray,
                          max_iterations: int = 100,
                          tolerance: float = 1e-4) -> Optional[np.ndarray]:
        """Solve inverse kinematics using Jacobian transpose method"""
        current_angles = initial_guess.copy()

        for iteration in range(max_iterations):
            # Compute current end-effector pose
            current_pos, current_ori = self.forward_kinematics(current_angles)

            # Compute error
            pos_error = target_pose[:3, 3] - current_pos
            rot_error = R.from_matrix(np.dot(target_pose[:3, :3], current_ori.T)).as_rotvec()
            error = np.concatenate([pos_error, rot_error])

            # Check convergence
            if np.linalg.norm(error) < tolerance:
                return current_angles

            # Compute Jacobian
            J = self.jacobian(current_angles)

            # Update joint angles using Jacobian transpose
            delta_theta = 0.1 * np.linalg.pinv(J) @ error  # Learning rate of 0.1
            current_angles += delta_theta

            # Apply joint limits
            for i in range(len(current_angles)):
                current_angles[i] = np.clip(current_angles[i],
                                          self.joint_limits[i][0],
                                          self.joint_limits[i][1])

        return None  # Failed to converge
```

### Grasp Planning and Analysis

The grasp planning system determines stable contact points and grasp configurations:

```python
import numpy as np
from scipy.spatial.distance import cdist
from typing import List, Tuple, Dict

class GraspPlanner:
    def __init__(self, finger_span: float = 0.1, max_force: float = 50.0):
        self.finger_span = finger_span  # Maximum distance between fingers
        self.max_force = max_force      # Maximum force per finger
        self.friction_coeff = 0.8       # Typical friction coefficient

    def plan_grasp(self, object_mesh: Dict[str, np.ndarray],
                   approach_direction: np.ndarray = None) -> List[Dict]:
        """
        Plan multiple grasp configurations for an object
        object_mesh: Dictionary with 'vertices' and 'normals' arrays
        """
        vertices = object_mesh['vertices']
        normals = object_mesh['normals']

        # Generate potential grasp points
        grasp_candidates = self._generate_grasp_candidates(vertices, normals)

        # Evaluate and rank grasp candidates
        valid_grasps = []
        for candidate in grasp_candidates:
            if self._evaluate_grasp_stability(candidate, object_mesh):
                valid_grasps.append(candidate)

        # Sort by stability score
        valid_grasps.sort(key=lambda x: x['stability_score'], reverse=True)

        return valid_grasps

    def _generate_grasp_candidates(self, vertices: np.ndarray,
                                 normals: np.ndarray) -> List[Dict]:
        """Generate potential grasp configurations"""
        candidates = []

        # For each vertex, consider it as a potential contact point
        for i in range(len(vertices)):
            vertex = vertices[i]
            normal = normals[i]

            # Generate approach directions perpendicular to surface normal
            approach_dirs = self._generate_approach_directions(normal)

            for approach_dir in approach_dirs:
                # Find opposing contact point
                opposing_point = self._find_opposing_point(vertex, approach_dir, vertices)

                if opposing_point is not None:
                    grasp_config = {
                        'contact_points': [vertex, opposing_point],
                        'approach_direction': approach_dir,
                        'surface_normal': normal,
                        'center': (vertex + opposing_point) / 2,
                        'width': np.linalg.norm(vertex - opposing_point)
                    }

                    if self._is_valid_grasp_width(grasp_config['width']):
                        candidates.append(grasp_config)

        return candidates

    def _generate_approach_directions(self, normal: np.ndarray) -> List[np.ndarray]:
        """Generate approach directions perpendicular to surface normal"""
        # Create two perpendicular vectors to the normal
        if abs(normal[2]) < 0.9:
            v1 = np.cross(normal, [0, 0, 1])
        else:
            v1 = np.cross(normal, [1, 0, 0])

        v1 = v1 / np.linalg.norm(v1)
        v2 = np.cross(normal, v1)
        v2 = v2 / np.linalg.norm(v2)

        # Generate multiple approach directions in the plane perpendicular to normal
        directions = []
        for angle in np.linspace(0, 2*np.pi, 8):  # 8 directions
            direction = np.cos(angle) * v1 + np.sin(angle) * v2
            directions.append(direction)

        return directions

    def _find_opposing_point(self, start_point: np.ndarray,
                           approach_dir: np.ndarray,
                           vertices: np.ndarray) -> Optional[np.ndarray]:
        """Find the opposing contact point for a grasp"""
        # Project all vertices along the approach direction
        projections = np.dot(vertices - start_point, approach_dir)

        # Find vertices on the opposite side
        opposite_vertices = vertices[projections < 0]

        if len(opposite_vertices) == 0:
            return None

        # Find the vertex closest to the line defined by start_point and approach_dir
        # (but on the opposite side)
        distances = np.linalg.norm(
            opposite_vertices - start_point -
            np.outer(np.dot(opposite_vertices - start_point, approach_dir), approach_dir),
            axis=1
        )

        closest_idx = np.argmin(distances)
        opposing_point = opposite_vertices[closest_idx]

        return opposing_point

    def _is_valid_grasp_width(self, width: float) -> bool:
        """Check if grasp width is within robot capabilities"""
        return 0.01 <= width <= self.finger_span  # Between 1cm and max span

    def _evaluate_grasp_stability(self, grasp_config: Dict,
                                object_mesh: Dict) -> bool:
        """Evaluate grasp stability using force closure criteria"""
        contact_points = grasp_config['contact_points']
        approach_dir = grasp_config['approach_direction']

        # Calculate grasp stability metric
        # Simple force closure approximation
        normal1 = object_mesh['normals'][self._find_closest_vertex(contact_points[0], object_mesh['vertices'])]
        normal2 = object_mesh['normals'][self._find_closest_vertex(contact_points[1], object_mesh['vertices'])]

        # Check if normals point inward (for pinch grasp)
        center_to_normal1 = grasp_config['center'] - contact_points[0]
        center_to_normal2 = grasp_config['center'] - contact_points[1]

        if np.dot(center_to_normal1, normal1) < 0 and np.dot(center_to_normal2, normal2) < 0:
            # Normals point inward, good for pinch grasp
            grasp_config['stability_score'] = self._calculate_stability_score(normal1, normal2, approach_dir)
            return True

        return False

    def _find_closest_vertex(self, point: np.ndarray, vertices: np.ndarray) -> int:
        """Find index of closest vertex to a point"""
        distances = np.linalg.norm(vertices - point, axis=1)
        return np.argmin(distances)

    def _calculate_stability_score(self, normal1: np.ndarray,
                                 normal2: np.ndarray,
                                 approach_dir: np.ndarray) -> float:
        """Calculate grasp stability score based on normals and approach direction"""
        # Simple stability score based on angle between normals and approach direction
        angle1 = np.arccos(np.clip(np.abs(np.dot(normal1, approach_dir)), 0, 1))
        angle2 = np.arccos(np.clip(np.abs(np.dot(normal2, approach_dir)), 0, 1))

        # Score based on how perpendicular the normals are to approach direction
        # Perpendicular is ideal for stable grasping
        score1 = np.sin(angle1)
        score2 = np.sin(angle2)

        return (score1 + score2) / 2
```

### Force Control and Impedance Control

The force control system manages interaction forces during manipulation:

```python
import numpy as np
from scipy import signal
from typing import Tuple

class ForceController:
    def __init__(self, kp: float = 100.0, ki: float = 10.0, kd: float = 10.0,
                 max_force: float = 50.0, max_torque: float = 10.0):
        self.kp = kp  # Proportional gain
        self.ki = ki  # Integral gain
        self.kd = kd  # Derivative gain
        self.max_force = max_force
        self.max_torque = max_torque

        # Force error integration
        self.force_error_integral = np.zeros(6)  # 3 forces + 3 torques
        self.prev_force_error = np.zeros(6)
        self.prev_time = None

    def compute_force_control(self, desired_force: np.ndarray,
                            measured_force: np.ndarray,
                            dt: float) -> np.ndarray:
        """
        Compute force control output using PID control
        desired_force: [fx, fy, fz, tx, ty, tz]
        measured_force: [fx, fy, fz, tx, ty, tz]
        """
        # Calculate force error
        force_error = desired_force - measured_force

        # Integrate error
        self.force_error_integral += force_error * dt

        # Calculate derivative
        if self.prev_time is not None:
            force_error_derivative = (force_error - self.prev_force_error) / dt
        else:
            force_error_derivative = np.zeros(6)

        # PID control
        force_control_output = (self.kp * force_error +
                               self.ki * self.force_error_integral +
                               self.kd * force_error_derivative)

        # Limit control output
        force_control_output = np.clip(force_control_output,
                                     -self.max_force, self.max_force)

        # Store for next iteration
        self.prev_force_error = force_error.copy()
        self.prev_time = dt

        return force_control_output

class ImpedanceController:
    def __init__(self, mass: float = 1.0, damping: float = 2.0, stiffness: float = 100.0):
        self.mass = mass
        self.damping = damping  # Critical damping ratio
        self.stiffness = stiffness

        # State variables
        self.position_error = np.zeros(3)
        self.velocity_error = np.zeros(3)
        self.acceleration_error = np.zeros(3)

    def compute_impedance_control(self, desired_pose: np.ndarray,
                                current_pose: np.ndarray,
                                desired_velocity: np.ndarray = None,
                                current_velocity: np.ndarray = None,
                                dt: float = 0.001) -> Tuple[np.ndarray, np.ndarray]:
        """
        Compute impedance control output
        Returns: (desired_force, compliance_adjustment)
        """
        # Position error
        pos_error = desired_pose[:3] - current_pose[:3]
        self.position_error = pos_error

        # Velocity error
        if current_velocity is not None and desired_velocity is not None:
            vel_error = desired_velocity - current_velocity
            self.velocity_error = vel_error
        else:
            # Estimate velocity from position change
            vel_error = (pos_error - self.position_error) / dt if dt > 0 else np.zeros(3)
            self.velocity_error = vel_error

        # Impedance control law: F = M*(xdd_d - xdd) + D*(xd_d - xd) + K*(x_d - x)
        desired_force = (self.mass * self.acceleration_error +
                        self.damping * self.velocity_error +
                        self.stiffness * self.position_error)

        # Limit forces
        desired_force = np.clip(desired_force, -50.0, 50.0)

        # Calculate compliance (adjustment to stiffness based on task requirements)
        compliance = 1.0 / self.stiffness if self.stiffness > 0 else 0.0

        return desired_force, compliance

class TactileFeedbackProcessor:
    def __init__(self):
        self.slip_threshold = 0.1
        self.pressure_threshold = 40.0  # kPa
        self.max_contact_points = 10

    def process_tactile_data(self, tactile_sensors: List[Dict]) -> Dict:
        """
        Process tactile sensor data to detect slip, pressure, and contact points
        tactile_sensors: List of sensor data with 'position', 'force', 'slip' fields
        """
        results = {
            'contact_points': [],
            'slip_detected': False,
            'average_pressure': 0.0,
            'contact_area': 0.0,
            'object_properties': {}
        }

        forces = []
        slip_signals = []

        for sensor in tactile_sensors:
            if sensor['force'] > 0.1:  # Minimum force threshold
                results['contact_points'].append(sensor['position'])
                forces.append(sensor['force'])

                if sensor['slip'] > self.slip_threshold:
                    results['slip_detected'] = True

                slip_signals.append(sensor['slip'])

        if forces:
            results['average_pressure'] = np.mean(forces)
            results['contact_area'] = len(forces) * 0.001  # Estimate contact area

            # Estimate object properties
            results['object_properties']['friction'] = np.mean(slip_signals) if slip_signals else 0.0
            results['object_properties']['stiffness'] = results['average_pressure'] / len(forces) if forces else 0.0

        return results
```

### Manipulation Task Planner

The task planner coordinates complex manipulation sequences:

```python
import numpy as np
from enum import Enum
from typing import List, Dict, Optional

class ManipulationAction(Enum):
    APPROACH = "approach"
    GRASP = "grasp"
    LIFT = "lift"
    MOVE = "move"
    PLACE = "place"
    RELEASE = "release"
    RETRACT = "retract"

class ManipulationTask:
    def __init__(self, action: ManipulationAction, parameters: Dict):
        self.action = action
        self.parameters = parameters
        self.completed = False
        self.executed = False

class ManipulationTaskPlanner:
    def __init__(self):
        self.current_task_index = 0
        self.tasks = []
        self.object_database = {}  # Store known object properties

    def plan_pick_and_place(self, object_pose: np.ndarray,
                          target_pose: np.ndarray,
                          object_properties: Dict = None) -> List[ManipulationTask]:
        """
        Plan a complete pick-and-place task
        """
        tasks = []

        # 1. Approach object
        approach_pose = self._compute_approach_pose(object_pose)
        tasks.append(ManipulationTask(ManipulationAction.APPROACH,
                                   {'pose': approach_pose, 'speed': 0.1}))

        # 2. Grasp object
        grasp_config = self._plan_grasp(object_pose, object_properties)
        tasks.append(ManipulationTask(ManipulationAction.GRASP,
                                   {'grasp_config': grasp_config, 'force': 20.0}))

        # 3. Lift object
        lift_pose = object_pose.copy()
        lift_pose[2, 3] += 0.1  # Lift 10cm
        tasks.append(ManipulationTask(ManipulationAction.LIFT,
                                   {'pose': lift_pose, 'speed': 0.05}))

        # 4. Move to target
        pre_place_pose = target_pose.copy()
        pre_place_pose[2, 3] += 0.1  # Pre-place position
        tasks.append(ManipulationTask(ManipulationAction.MOVE,
                                   {'pose': pre_place_pose, 'speed': 0.1}))

        # 5. Place object
        tasks.append(ManipulationTask(ManipulationAction.PLACE,
                                   {'pose': target_pose, 'force': 5.0}))

        # 6. Release object
        tasks.append(ManipulationTask(ManipulationAction.RELEASE,
                                   {'force': 0.0}))

        # 7. Retract
        retract_pose = pre_place_pose.copy()
        retract_pose[2, 3] += 0.1  # Move up after release
        tasks.append(ManipulationTask(ManipulationAction.RETRACT,
                                   {'pose': retract_pose, 'speed': 0.1}))

        self.tasks = tasks
        self.current_task_index = 0

        return tasks

    def _compute_approach_pose(self, object_pose: np.ndarray) -> np.ndarray:
        """Compute approach pose 10cm above object"""
        approach_pose = object_pose.copy()
        approach_pose[2, 3] += 0.1  # 10cm above object
        return approach_pose

    def _plan_grasp(self, object_pose: np.ndarray,
                   object_properties: Dict = None) -> Dict:
        """Plan grasp configuration based on object properties"""
        if object_properties:
            # Use object properties to plan optimal grasp
            shape = object_properties.get('shape', 'unknown')
            size = object_properties.get('size', [0.1, 0.1, 0.1])

            if shape == 'cylinder':
                # Plan cylindrical grasp
                grasp_config = {
                    'type': 'cylindrical',
                    'contact_points': self._plan_cylindrical_grasp(object_pose, size),
                    'approach_direction': [0, 0, -1]  # Approach from above
                }
            elif shape == 'box':
                # Plan corner grasp for box
                grasp_config = {
                    'type': 'corner',
                    'contact_points': self._plan_box_grasp(object_pose, size),
                    'approach_direction': [0, 1, 0]  # Side approach for stability
                }
            else:
                grasp_config = {
                    'type': 'pinch',
                    'contact_points': self._plan_pinch_grasp(object_pose),
                    'approach_direction': [0, 0, -1]
                }
        else:
            # Default grasp plan
            grasp_config = {
                'type': 'pinch',
                'contact_points': self._plan_pinch_grasp(object_pose),
                'approach_direction': [0, 0, -1]
            }

        return grasp_config

    def _plan_cylindrical_grasp(self, object_pose: np.ndarray,
                              size: List[float]) -> List[np.ndarray]:
        """Plan grasp points for cylindrical objects"""
        # For a cylinder, grasp at opposite sides
        radius = max(size) / 2
        grasp_points = []

        # Two points on opposite sides of the cylinder
        for i in range(2):
            angle = i * np.pi
            x_offset = radius * np.cos(angle)
            y_offset = radius * np.sin(angle)

            point = object_pose[:3, 3] + np.array([x_offset, y_offset, 0])
            grasp_points.append(point)

        return grasp_points

    def _plan_box_grasp(self, object_pose: np.ndarray,
                       size: List[float]) -> List[np.ndarray]:
        """Plan grasp points for box-shaped objects"""
        # Grasp at corners or edges for stability
        grasp_points = []

        # Two points at opposite corners
        for i in range(2):
            x_sign = 1 if i == 0 else -1
            point = object_pose[:3, 3] + np.array([x_sign * size[0]/2, 0, size[2]/2])
            grasp_points.append(point)

        return grasp_points

    def _plan_pinch_grasp(self, object_pose: np.ndarray) -> List[np.ndarray]:
        """Plan simple pinch grasp at object center"""
        center = object_pose[:3, 3]
        # Two points slightly apart at the object center
        grasp_points = [
            center + np.array([-0.02, 0, 0]),  # Left finger
            center + np.array([0.02, 0, 0])    # Right finger
        ]
        return grasp_points

    def execute_next_task(self, robot_controller) -> bool:
        """Execute the next task in the sequence"""
        if self.current_task_index >= len(self.tasks):
            return False  # No more tasks

        current_task = self.tasks[self.current_task_index]

        success = False
        if current_task.action == ManipulationAction.APPROACH:
            success = self._execute_approach(robot_controller, current_task.parameters)
        elif current_task.action == ManipulationAction.GRASP:
            success = self._execute_grasp(robot_controller, current_task.parameters)
        elif current_task.action == ManipulationAction.LIFT:
            success = self._execute_lift(robot_controller, current_task.parameters)
        elif current_task.action == ManipulationAction.MOVE:
            success = self._execute_move(robot_controller, current_task.parameters)
        elif current_task.action == ManipulationAction.PLACE:
            success = self._execute_place(robot_controller, current_task.parameters)
        elif current_task.action == ManipulationAction.RELEASE:
            success = self._execute_release(robot_controller, current_task.parameters)
        elif current_task.action == ManipulationAction.RETRACT:
            success = self._execute_retract(robot_controller, current_task.parameters)

        if success:
            current_task.completed = True
            self.current_task_index += 1

        return success

    def _execute_approach(self, robot_controller, params: Dict) -> bool:
        """Execute approach task"""
        # Move to approach position with specified speed
        return robot_controller.move_to_pose(params['pose'], params['speed'])

    def _execute_grasp(self, robot_controller, params: Dict) -> bool:
        """Execute grasp task"""
        # Close gripper with specified force
        grasp_config = params['grasp_config']
        force = params['force']

        # Adjust gripper position based on grasp configuration
        robot_controller.adjust_gripper(grasp_config['contact_points'])

        # Apply grasp force
        return robot_controller.close_gripper(force)

    def _execute_lift(self, robot_controller, params: Dict) -> bool:
        """Execute lift task"""
        return robot_controller.move_to_pose(params['pose'], params['speed'])

    def _execute_move(self, robot_controller, params: Dict) -> bool:
        """Execute move task"""
        return robot_controller.move_to_pose(params['pose'], params['speed'])

    def _execute_place(self, robot_controller, params: Dict) -> bool:
        """Execute place task"""
        return robot_controller.move_to_pose(params['pose'], 0.01)  # Slow for precision

    def _execute_release(self, robot_controller, params: Dict) -> bool:
        """Execute release task"""
        return robot_controller.open_gripper()

    def _execute_retract(self, robot_controller, params: Dict) -> bool:
        """Execute retract task"""
        return robot_controller.move_to_pose(params['pose'], params['speed'])
```

### Main Manipulation Controller

The main controller integrates all manipulation components:

```python
import rospy
from sensor_msgs.msg import JointState, PointCloud2
from geometry_msgs.msg import PoseStamped, WrenchStamped
from std_msgs.msg import Float64MultiArray

class ManipulationController:
    def __init__(self):
        # Initialize components
        self.kinematics = ManipulatorKinematics(
            dh_parameters=[  # Example DH parameters for a 7-DOF arm
                [0, np.pi/2, 0.1, 0],
                [0, -np.pi/2, 0, np.pi/2],
                [0, np.pi/2, 0, 0],
                [0, -np.pi/2, 0.5, 0],
                [0, np.pi/2, 0, 0],
                [0, -np.pi/2, 0, 0],
                [0, 0, 0.1, 0]
            ],
            joint_limits=[(-np.pi, np.pi) for _ in range(7)]
        )

        self.grasp_planner = GraspPlanner()
        self.force_controller = ForceController()
        self.impedance_controller = ImpedanceController()
        self.task_planner = ManipulationTaskPlanner()

        # ROS publishers/subscribers
        self.joint_command_pub = rospy.Publisher('/joint_group_position_controller/command',
                                               Float64MultiArray, queue_size=10)
        self.pose_pub = rospy.Publisher('/end_effector_pose', PoseStamped, queue_size=10)
        self.wrench_pub = rospy.Publisher('/end_effector_wrench', WrenchStamped, queue_size=10)

        # Subscribers
        self.joint_state_sub = rospy.Subscriber('/joint_states', JointState, self.joint_state_callback)
        self.wrench_sub = rospy.Subscriber('/wrench', WrenchStamped, self.wrench_callback)

        # State variables
        self.current_joint_positions = None
        self.current_joint_velocities = None
        self.current_wrench = None
        self.is_executing = False
        self.current_task_sequence = []

    def joint_state_callback(self, msg: JointState):
        """Callback for joint state updates"""
        self.current_joint_positions = np.array(msg.position)
        self.current_joint_velocities = np.array(msg.velocity)

    def wrench_callback(self, msg: WrenchStamped):
        """Callback for force/torque sensor data"""
        self.current_wrench = np.array([msg.wrench.force.x, msg.wrench.force.y, msg.wrench.force.z,
                                       msg.wrench.torque.x, msg.wrench.torque.y, msg.wrench.torque.z])

    def plan_manipulation_task(self, object_pose: np.ndarray,
                             target_pose: np.ndarray,
                             object_properties: Dict = None) -> bool:
        """Plan and initiate a manipulation task"""
        try:
            # Plan the task sequence
            self.current_task_sequence = self.task_planner.plan_pick_and_place(
                object_pose, target_pose, object_properties
            )

            print(f"Planned manipulation task with {len(self.current_task_sequence)} steps")
            return True

        except Exception as e:
            print(f"Error planning manipulation task: {e}")
            return False

    def execute_manipulation(self) -> bool:
        """Execute the current manipulation task sequence"""
        if not self.current_task_sequence or self.task_planner.current_task_index >= len(self.current_task_sequence):
            print("No task sequence to execute or all tasks completed")
            return False

        try:
            success = self.task_planner.execute_next_task(self)
            return success

        except Exception as e:
            print(f"Error executing manipulation task: {e}")
            return False

    def move_to_pose(self, target_pose: np.ndarray, speed: float = 0.1) -> bool:
        """Move end-effector to target pose"""
        if self.current_joint_positions is None:
            print("No joint state available")
            return False

        try:
            # Solve inverse kinematics
            joint_angles = self.kinematics.inverse_kinematics(
                target_pose, self.current_joint_positions
            )

            if joint_angles is None:
                print("Failed to solve inverse kinematics")
                return False

            # Publish joint commands
            cmd_msg = Float64MultiArray()
            cmd_msg.data = joint_angles.tolist()
            self.joint_command_pub.publish(cmd_msg)

            # Publish pose feedback
            pose_msg = PoseStamped()
            pose_msg.header.stamp = rospy.Time.now()
            pose_msg.header.frame_id = "base_link"
            pose_msg.pose.position.x = target_pose[0, 3]
            pose_msg.pose.position.y = target_pose[1, 3]
            pose_msg.pose.position.z = target_pose[2, 3]
            # Convert rotation matrix to quaternion
            quat = R.from_matrix(target_pose[:3, :3]).as_quat()
            pose_msg.pose.orientation.x = quat[0]
            pose_msg.pose.orientation.y = quat[1]
            pose_msg.pose.orientation.z = quat[2]
            pose_msg.pose.orientation.w = quat[3]

            self.pose_pub.publish(pose_msg)

            return True

        except Exception as e:
            print(f"Error moving to pose: {e}")
            return False

    def adjust_gripper(self, contact_points: List[np.ndarray]):
        """Adjust gripper to grasp configuration"""
        # Calculate required gripper width
        if len(contact_points) >= 2:
            width = np.linalg.norm(contact_points[0] - contact_points[1])
            # Convert to joint angle commands (simplified)
            gripper_angle = np.clip(width / 2, 0.0, 0.5)  # Map to joint limits

            # In a real system, this would send commands to gripper joints
            print(f"Adjusting gripper to width: {width:.3f}m")

    def close_gripper(self, force: float) -> bool:
        """Close gripper with specified force"""
        print(f"Closing gripper with force: {force}N")
        # In a real system, this would control gripper actuator with force feedback
        return True

    def open_gripper(self) -> bool:
        """Open gripper completely"""
        print("Opening gripper")
        # In a real system, this would open gripper to maximum width
        return True

    def update_manipulation(self, dt: float):
        """Main update function for manipulation control"""
        if self.is_executing:
            # Continue executing current task
            success = self.execute_manipulation()
            if not success:
                print("Manipulation task failed, stopping execution")
                self.is_executing = False
                return

            # Apply force control if wrench data is available
            if self.current_wrench is not None:
                # Example: Apply impedance control based on sensed forces
                desired_force = np.zeros(6)  # No desired external force
                force_output = self.force_controller.compute_force_control(
                    desired_force, self.current_wrench, dt
                )

                # Publish force feedback
                wrench_msg = WrenchStamped()
                wrench_msg.header.stamp = rospy.Time.now()
                wrench_msg.header.frame_id = "end_effector"
                wrench_msg.wrench.force.x = self.current_wrench[0]
                wrench_msg.wrench.force.y = self.current_wrench[1]
                wrench_msg.wrench.force.z = self.current_wrench[2]
                wrench_msg.wrench.torque.x = self.current_wrench[3]
                wrench_msg.wrench.torque.y = self.current_wrench[4]
                wrench_msg.wrench.torque.z = self.current_wrench[5]

                self.wrench_pub.publish(wrench_msg)
```

## Practical Examples

### Example 1: Cup Grasping and Pouring

Implementing a task where the robot grasps a cup, lifts it, moves to a target location, and pours liquid. The system must plan a stable grasp on the cup handle, maintain appropriate forces during lifting, and execute a controlled pouring motion with precise end-effector orientation.

### Example 2: Book Stacking

Implementing a task where the robot picks up books and stacks them in a specific order. This requires precise grasp planning for the thin book shape, careful force control to avoid damaging the books, and accurate placement control for stable stacking.

### Example 3: Tool Usage

Implementing a task where the robot uses a tool (like a screwdriver) to perform an action. This requires tool grasp planning, coordinated manipulation of the tool, and appropriate force control for the tool operation.

## System-Level Architecture Perspective

Manipulation systems for humanoid robots require tight integration between multiple subsystems including perception, planning, control, and balance. The perception system provides object detection and pose estimation, the planning system generates grasp configurations and manipulation sequences, the control system executes the motions, and the balance system ensures stability during manipulation.

The system architecture typically follows a hierarchical approach with high-level task planning, mid-level motion planning, and low-level control. Each level operates at different frequencies and with different objectives, requiring careful coordination and communication.

Safety systems must be integrated throughout the architecture with multiple layers of protection including force limits, velocity limits, collision detection, and emergency stops. The system should be able to detect and recover from manipulation failures safely.

Communication between subsystems must be robust and efficient, handling both high-frequency control data and lower-frequency planning information. Real-time constraints are critical for stable manipulation and balance control.

## Practical Reasoning and Design Thinking

Designing effective manipulation systems requires balancing precision with robustness. High precision is needed for delicate tasks, but robustness is required for handling uncertainties in object properties and positions.

Force control is essential for safe manipulation, as excessive forces can damage objects or the robot itself. The system must be able to adapt to varying object properties and environmental conditions.

The design should consider the coupled dynamics between manipulation and balance, as manipulation tasks can significantly affect the robot's center of mass and stability. Coordinated control strategies must account for these interactions.

Redundancy in the manipulator system should be exploited to achieve multiple objectives simultaneously, such as reaching a target while maintaining head orientation or keeping the center of mass within the support polygon.

## Failure Modes and Debugging Tips

### Common Failure Modes

1. **Grasp Failure**: The robot may fail to grasp objects due to poor grasp planning or insufficient force. Solution: Implement grasp stability evaluation and adaptive force control.

2. **Object Slippage**: Objects may slip from the grasp during manipulation. Solution: Use tactile feedback and adaptive grasp force adjustment.

3. **Collision Issues**: Robot may collide with objects or environment during manipulation. Solution: Implement collision detection and avoidance in motion planning.

4. **Force Control Issues**: Excessive forces may damage objects or cause instability. Solution: Implement force limiting and impedance control.

5. **Balance Problems**: Manipulation tasks may cause the robot to lose balance. Solution: Coordinate manipulation with balance control.

### Debugging Strategies

1. **Simulation Testing**: Extensively test manipulation algorithms in simulation before hardware implementation.

2. **Graduated Complexity**: Start with simple objects and tasks, gradually increasing complexity.

3. **Data Logging**: Log all sensor data, control outputs, and task outcomes for analysis.

4. **Parameter Tuning**: Systematically tune control parameters starting with conservative values.

5. **Safety Protocols**: Always implement emergency stops and protective limits during testing.

## Exercises

### Beginner Level
1. Implement a simple forward kinematics calculator for a 3-DOF planar manipulator.
2. Create a basic grasp planner that finds two-point grasps on simple geometric shapes.
3. Build a force feedback system that stops motion when force exceeds a threshold.

### Intermediate Level
1. Implement inverse kinematics with multiple solution selection based on joint limits.
2. Design a grasp stability evaluation algorithm using the force closure criterion.
3. Create a manipulation sequence planner for a simple pick-and-place task.

### Advanced Level
1. Develop a learning-based grasp planner that improves performance based on success/failure outcomes.
2. Implement coordinated manipulation and balance control for a humanoid robot.
3. Design an adaptive manipulation system that adjusts parameters based on object properties.

## Multiple Choice Questions (MCQs)
**Question 1:** What does the Jacobian matrix represent in manipulator kinematics?
  - a) Joint positions
  - b) Relationship between joint velocities and end-effector velocities
  - c) Object properties
  - d) Force measurements
  - **Answer: b) Relationship between joint velocities and end-effector velocities**
  - **Explanation:** The Jacobian matrix maps joint space velocities to Cartesian space velocities of the end-effector.

**Question 2:** What is force closure in grasp planning?
  - a) Maximum force a gripper can apply
  - b) Ability to maintain grasp under any external wrench
  - c) Force required to break a grasp
  - d) Speed of gripper closing
  - **Answer: b) Ability to maintain grasp under any external wrench**
  - **Explanation:** Force closure means the grasp can resist any external force or moment applied to the object.

**Question 3:** What is impedance control used for in manipulation?
  - a) Increasing computational speed
  - b) Controlling robot compliance during interaction
  - c) Reducing sensor requirements
  - d) Improving grasping success rate
  - **Answer: b) Controlling robot compliance during interaction**
  - **Explanation:** Impedance control makes the robot behave like a spring-damper system, controlling compliance during environment interaction.

**Question 4:** What is the primary advantage of using tactile sensors in manipulation?
  - a) Reducing computational requirements
  - b) Providing direct contact and slip feedback
  - c) Improving vision processing
  - d) Decreasing actuator requirements
  - **Answer: b) Providing direct contact and slip feedback**
  - **Explanation:** Tactile sensors provide immediate feedback about contact forces, slip detection, and object properties.

**Question 5:** What does "redundancy" mean in the context of manipulator arms?
  - a) Extra actuators for reliability
  - b) More degrees of freedom than required task space
  - c) Multiple sensors for the same measurement
  - d) Backup control systems
  - **Answer: b) More degrees of freedom than required task space**
  - **Explanation:** Redundancy means having more joints than necessary, allowing optimization of secondary objectives.

**Question 6:** Why is force control important in robotic manipulation?
  - a) Reduces computational requirements
  - b) Prevents damage and enables safe interaction
  - c) Improves vision processing
  - d) Decreases sensor requirements
  - **Answer: b) Prevents damage and enables safe interaction**
  - **Explanation:** Force control prevents excessive forces that could damage objects or the robot during interaction.

**Question 7:** What is the main challenge in humanoid manipulation compared to fixed-base robots?
  - a) Higher cost
  - b) Balance and stability considerations
  - c) Lower precision
  - d) Reduced workspace
  - **Answer: b) Balance and stability considerations**
  - **Explanation:** Humanoid robots must consider the effect of manipulation on overall balance and stability.

**Question 8:** What is the typical approach for handling object pose uncertainty in manipulation?
  - a) Ignore the uncertainty
  - b) Use feedback control and adaptive strategies
  - c) Increase computational power
  - d) Reduce task complexity
  - **Answer: b) Use feedback control and adaptive strategies**
  - **Explanation:** Feedback control and adaptive strategies help handle uncertainties in object pose and properties.

**Question 9:** What is the role of the grasp planner in manipulation systems?
  - a) Controls joint actuators directly
  - b) Determines stable contact points and grasp configurations
  - c) Processes visual data
  - d) Maintains robot balance
  - **Answer: b) Determines stable contact points and grasp configurations**
  - **Explanation:** The grasp planner determines where and how to grasp objects stably.

**Question 10:** Why is coordinated control important for humanoid manipulation?
  - a) Reduces hardware requirements
  - b) Balance and manipulation affect each other
  - c) Improves computational efficiency
  - d) Decreases sensor needs
  - **Answer: b) Balance and manipulation affect each other**
  - **Explanation:** Manipulation affects the robot's center of mass and balance, requiring coordinated control strategies.

## Chapter Summary

Manipulation and grasping are fundamental capabilities for humanoid robots, enabling interaction with objects in the environment. The system must consider kinematics, dynamics, force control, and the coupling between manipulation and balance.

Key technical components include kinematic control, grasp planning, force control, and task planning. These components work together to achieve stable and safe manipulation while maintaining robot balance.

The system must balance precision with robustness, incorporating feedback control and adaptive strategies to handle uncertainties. Force control and tactile feedback are essential for safe and effective manipulation.

The chapter covered implementation examples for various manipulation tasks and system-level integration considerations. Practical design thinking focuses on safety, robustness, and coordinated control. Multiple-choice questions reinforced key concepts including kinematic principles, force control, and grasp planning.

## Citations

1. Mason, M. T., & Salisbury, J. K. (1985). "Robot hands and the mechanics of manipulation." MIT Press.

2. Okamura, A. M., et al. (2000). "A classification and evaluation of telemanipulation systems." *Proceedings 2000 ICRA. Millennium Conference. IEEE International Conference on Robotics and Automation*, 1175-1180.

3. Liu, H., et al. (2004). "Grasp analysis and synthesis." *International Journal of Robotic Research*, 23(4-5), 413-430.

4. Feix, T., et al. (2016). "The GRASP taxonomy of human grasp types." *IEEE Transactions on Human-Machine Systems*, 46(1), 26-35.

5. ten Pas, A. A., & Platt Jr, R. (2017). "Grasp pose detection in point clouds." *International Journal of Robotics Research*, 36(13-14), 1455-1473.

6. Mahler, J., et al. (2017). "Dex-Net 2.0: Deep learning to plan robust grasps with synthetic point clouds and analytic grasp metrics." *Robotics: Science and Systems XIII*.

7. Hogan, N. (1985). "Impedance control: An approach to manipulation: Part I-III." *Journal of Dynamic Systems, Measurement, and Control*, 107(1), 1-24.

8. Khatib, O. (1987). "A unified approach for motion and force control of robot manipulators: The operational space formulation." *IEEE Journal on Robotics and Automation*, 3(1), 43-53.

9. Pratt, J. E., & Williamson, M. M. (1995). "Series elastic actuators." *Proceedings 1995 IEEE/RSJ International Conference on Intelligent Robots and Systems*, 399-406.

10. Park, H. I., et al. (2013). "An integrated framework for object discovery, semantic mapping and grasp planning." *2013 IEEE International Conference on Robotics and Automation*, 2517-2524.

## Recent Developments

Recent developments in manipulation and grasping have focused on deep learning approaches that can learn grasping strategies from large datasets of successful and failed grasps. These data-driven methods can handle complex object shapes and uncertain environments more robustly than traditional analytical approaches.

Reinforcement learning has shown promise for learning manipulation skills through trial and error, allowing robots to discover effective strategies for complex tasks like tool use and multi-step manipulations.

Advanced tactile sensing technologies now provide rich feedback about contact forces, slip, and object properties, enabling more dexterous manipulation. These sensors are becoming more affordable and easier to integrate into robotic systems.

Simulation-to-real transfer techniques have improved, allowing manipulation policies learned in simulation to work effectively on real robots. This reduces the need for extensive real-world training.

Whole-body manipulation frameworks now better integrate manipulation with locomotion and balance, enabling more complex tasks that require coordinated movement of the entire humanoid robot.

Collaborative manipulation research has advanced, enabling robots to work alongside humans in shared manipulation tasks with appropriate safety and communication protocols.