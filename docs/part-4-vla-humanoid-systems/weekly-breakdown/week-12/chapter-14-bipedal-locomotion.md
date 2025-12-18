---
id: chapter-14-bipedal-locomotion
title: "Chapter 14: Bipedal Locomotion"
sidebar_position: 3
description: "Implementing stable bipedal locomotion for humanoid robots using ZMP and MPC control"
---

# Chapter 14: Bipedal Locomotion

## Learning Objectives

After completing this chapter, students will be able to:
1. Analyze the biomechanical principles underlying human bipedal locomotion and apply them to humanoid robot design
2. Implement Zero-Moment Point (ZMP) control algorithms for stable bipedal walking
3. Design Model Predictive Control (MPC) systems for dynamic balance and gait generation
4. Evaluate and optimize gait parameters for different terrains and walking speeds
5. Integrate sensory feedback systems for real-time balance adjustment and disturbance rejection

## Conceptual Explanation

Bipedal locomotion represents one of the most challenging problems in humanoid robotics, requiring the coordination of multiple subsystems to achieve stable, efficient, and human-like walking. Unlike wheeled or tracked robots, bipedal systems must manage dynamic balance during the single-support and double-support phases of walking, where the center of mass is constantly shifting over a small support polygon.

The fundamental challenge in bipedal locomotion lies in maintaining dynamic equilibrium while moving the swing leg forward. During walking, the robot's center of mass must be carefully controlled to remain within the support polygon defined by the stance foot (or feet during double support). This requires precise control of joint torques, timing coordination, and real-time adjustment to disturbances.

The Zero-Moment Point (ZMP) criterion provides a mathematical framework for analyzing and controlling bipedal stability. The ZMP is the point on the ground where the net moment of the inertial and gravitational forces acting on the robot is zero. For stable walking, the ZMP must remain within the convex hull of the support polygon (typically the foot area). This principle forms the foundation for most bipedal walking control algorithms.

Model Predictive Control (MPC) has emerged as a powerful approach for bipedal locomotion, allowing the system to optimize walking patterns over a prediction horizon while respecting dynamic constraints. MPC controllers can handle the complex dynamics of bipedal walking while incorporating real-time sensory feedback and disturbance rejection.

The design of bipedal locomotion systems must consider multiple factors including energy efficiency, stability margins, terrain adaptability, and disturbance rejection capabilities. These systems typically involve hierarchical control structures with high-level gait planning, mid-level pattern generation, and low-level joint control.

Recent advances in machine learning have enabled data-driven approaches to gait generation, where neural networks learn stable walking patterns from human demonstrations or through reinforcement learning. However, these approaches must be carefully integrated with traditional control methods to ensure safety and stability.

## Technical Content

### Zero-Moment Point (ZMP) Control

The ZMP control framework provides the mathematical foundation for stable bipedal walking:

```python
import numpy as np
from scipy import integrate
from typing import Tuple, Optional

class ZMPController:
    def __init__(self, robot_mass: float, gravity: float = 9.81, com_height: float = 0.8):
        self.mass = robot_mass
        self.gravity = gravity
        self.com_height = com_height  # Center of mass height above ground
        self.omega = np.sqrt(self.gravity / self.com_height)  # Natural frequency

        # Control parameters
        self.kp = 10.0  # Proportional gain
        self.kd = 2.0 * np.sqrt(self.kp)  # Derivative gain (critically damped)

        # State variables
        self.com_x = 0.0
        self.com_y = 0.0
        self.com_x_dot = 0.0
        self.com_y_dot = 0.0

        # Reference trajectory
        self.zmp_ref_x = 0.0
        self.zmp_ref_y = 0.0

    def compute_zmp_from_com(self, com_pos: np.ndarray, com_vel: np.ndarray, com_acc: np.ndarray) -> Tuple[float, float]:
        """
        Compute ZMP position from Center of Mass (CoM) state
        ZMP_x = com_x - (com_height * com_acc_x) / (gravity + com_acc_z)
        ZMP_y = com_y - (com_height * com_acc_y) / (gravity + com_acc_z)
        """
        # Assuming com_acc_z is approximately -gravity for walking on level ground
        denominator = self.gravity + com_acc[2] if abs(self.gravity + com_acc[2]) > 1e-6 else self.gravity

        zmp_x = com_pos[0] - (self.com_height * com_acc[0]) / denominator
        zmp_y = com_pos[1] - (self.com_height * com_acc[1]) / denominator

        return zmp_x, zmp_y

    def compute_com_trajectory_from_zmp(self, zmp_trajectory: np.ndarray, dt: float) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Compute CoM trajectory from desired ZMP trajectory using the inverted pendulum model
        com_ddot = omega^2 * (com - zmp)
        """
        n_steps = len(zmp_trajectory)
        com_trajectory = np.zeros((n_steps, 3))
        com_velocity = np.zeros((n_steps, 3))
        com_acceleration = np.zeros((n_steps, 3))

        # Initialize with current state
        com_trajectory[0] = [self.com_x, self.com_y, self.com_height]
        com_velocity[0] = [self.com_x_dot, self.com_y_dot, 0.0]

        for i in range(1, n_steps):
            # ZMP-based acceleration (inverted pendulum model)
            com_acceleration[i-1, 0] = self.omega**2 * (com_trajectory[i-1, 0] - zmp_trajectory[i-1, 0])
            com_acceleration[i-1, 1] = self.omega**2 * (com_trajectory[i-1, 1] - zmp_trajectory[i-1, 1])
            com_acceleration[i-1, 2] = 0.0  # No vertical acceleration in simplified model

            # Integrate to get velocity and position
            com_velocity[i] = com_velocity[i-1] + com_acceleration[i-1] * dt
            com_trajectory[i] = com_trajectory[i-1] + com_velocity[i] * dt

        return com_trajectory, com_velocity, com_acceleration

    def update_control(self, measured_zmp: Tuple[float, float], dt: float) -> Tuple[float, float]:
        """
        Update ZMP control with feedback correction
        """
        measured_x, measured_y = measured_zmp

        # Error in ZMP position
        error_x = self.zmp_ref_x - measured_x
        error_y = self.zmp_ref_y - measured_y

        # Feedback control to adjust CoM trajectory
        com_correction_x = self.kp * error_x + self.kd * (error_x - (measured_x - self.zmp_ref_x)) / dt
        com_correction_y = self.kp * error_y + self.kd * (error_y - (measured_y - self.zmp_ref_y)) / dt

        # Update reference CoM position
        self.com_x += com_correction_x * dt
        self.com_y += com_correction_y * dt

        # Return desired CoM position
        return self.com_x, self.com_y
```

### Model Predictive Control (MPC) for Walking

The MPC controller optimizes walking patterns over a prediction horizon:

```python
import cvxpy as cp
import numpy as np

class MPCWalkingController:
    def __init__(self, prediction_horizon: int = 20, dt: float = 0.1, com_height: float = 0.8):
        self.N = prediction_horizon  # Prediction horizon
        self.dt = dt  # Time step
        self.com_height = com_height
        self.omega = np.sqrt(9.81 / com_height)

        # MPC parameters
        self.Q = np.eye(2) * 10.0  # State cost matrix (ZMP tracking)
        self.R = np.eye(2) * 0.1   # Control cost matrix (CoM movement)
        self.P = np.eye(2) * 50.0  # Terminal cost matrix

        # System matrices for inverted pendulum model
        self.A = np.array([[1, 0, self.dt, 0],
                          [0, 1, 0, self.dt],
                          [self.omega**2 * self.dt, 0, 1, 0],
                          [0, self.omega**2 * self.dt, 0, 1]])

        self.B = np.array([[-self.omega**2 * self.dt**2, 0],
                          [0, -self.omega**2 * self.dt**2],
                          [-self.omega**2 * self.dt, 0],
                          [0, -self.omega**2 * self.dt]])

    def solve_mpc(self, current_state: np.ndarray, zmp_reference_trajectory: np.ndarray) -> np.ndarray:
        """
        Solve MPC optimization problem
        State: [com_x, com_y, com_x_dot, com_y_dot]
        Control: [zmp_ref_x, zmp_ref_y] (virtual reference ZMP)
        """
        # Decision variables: control inputs over horizon
        U = cp.Variable((self.N, 2))

        # State variables over horizon
        X = cp.Variable((self.N + 1, 4))

        # Cost function
        cost = 0

        # Stage costs
        for k in range(self.N):
            # ZMP tracking error cost
            predicted_zmp_x = X[k, 0] - (self.com_height / 9.81) * (self.omega**2 * (X[k, 0] - U[k, 0]))
            predicted_zmp_y = X[k, 1] - (self.com_height / 9.81) * (self.omega**2 * (X[k, 1] - U[k, 1]))

            zmp_error_x = predicted_zmp_x - zmp_reference_trajectory[k, 0]
            zmp_error_y = predicted_zmp_y - zmp_reference_trajectory[k, 1]

            cost += cp.quad_form(cp.hstack([zmp_error_x, zmp_error_y]), self.Q)

            # Control effort cost
            cost += cp.quad_form(U[k], self.R)

        # Terminal cost
        cost += cp.quad_form(X[self.N, :2], self.P)  # Penalize terminal CoM position

        # Dynamics constraints
        constraints = [X[0] == current_state]

        for k in range(self.N):
            # Linearized dynamics: x_{k+1} = A*x_k + B*u_k
            constraints.append(X[k+1] == self.A @ X[k] + self.B @ U[k, :])

        # ZMP support polygon constraints (foot positions)
        foot_width = 0.1  # Approximate foot width
        foot_length = 0.15  # Approximate foot length

        for k in range(self.N):
            # ZMP must be within support polygon (simplified as rectangle)
            constraints.append(U[k, 0] >= -foot_length/2)  # x_min
            constraints.append(U[k, 0] <= foot_length/2)   # x_max
            constraints.append(U[k, 1] >= -foot_width/2)   # y_min
            constraints.append(U[k, 1] <= foot_width/2)    # y_max

        # Solve optimization problem
        problem = cp.Problem(cp.Minimize(cost), constraints)
        problem.solve(solver=cp.ECOS)

        if problem.status not in ["optimal", "optimal_inaccurate"]:
            raise RuntimeError(f"MPC problem not solved optimally: {problem.status}")

        # Return the first control input
        return U.value[0] if U.value is not None else np.array([0.0, 0.0])

    def compute_footstep_plan(self, walking_speed: float, step_time: float = 0.8) -> np.ndarray:
        """
        Compute footstep plan based on walking parameters
        """
        step_length = walking_speed * step_time
        step_width = 0.2  # Distance between feet (lateral)

        # Generate footsteps for prediction horizon
        footsteps = []
        for i in range(self.N):
            # Alternate between left and right foot
            foot_offset = step_width/2 if i % 2 == 0 else -step_width/2
            x_pos = (i // 2) * step_length
            y_pos = foot_offset
            footsteps.append([x_pos, y_pos])

        return np.array(footsteps)
```

### Whole-Body Controller for Bipedal Locomotion

The whole-body controller coordinates all joints to achieve the desired CoM and ZMP behavior:

```python
import numpy as np
from scipy.spatial.transform import Rotation as R

class WholeBodyController:
    def __init__(self, robot_model):
        self.robot_model = robot_model  # Robot model with kinematics/dynamics
        self.joint_names = robot_model.joint_names
        self.mass = robot_model.mass

        # Control gains
        self.kp_pos = 100.0  # Position control gain
        self.kd_pos = 20.0   # Position derivative gain
        self.kp_ori = 100.0  # Orientation control gain
        self.kd_ori = 20.0   # Orientation derivative gain

        # Gravity compensation
        self.gravity = np.array([0, 0, -9.81])

    def compute_joint_torques(self, desired_com_state: dict, current_state: dict,
                            desired_foot_positions: dict, current_foot_positions: dict) -> np.ndarray:
        """
        Compute joint torques using whole-body control approach
        """
        # Compute task-space errors
        com_error = self._compute_com_error(desired_com_state, current_state)
        foot_errors = self._compute_foot_errors(desired_foot_positions, current_foot_positions)

        # Stack all task errors
        task_errors = np.concatenate([com_error, foot_errors])

        # Compute Jacobian matrices for each task
        com_jacobian = self._compute_com_jacobian(current_state)
        foot_jacobians = self._compute_foot_jacobians(current_state)

        # Stack Jacobians
        J = np.vstack([com_jacobian, foot_jacobians])

        # Compute desired task accelerations using PD control
        task_accelerations = -self.kp_pos * task_errors[:6] - self.kd_pos * task_errors[6:12]

        # Compute joint torques using inverse dynamics
        q = current_state['joint_positions']
        q_dot = current_state['joint_velocities']

        # Gravity compensation
        g = self.robot_model.gravity_compensation(q)

        # Inverse dynamics
        M = self.robot_model.mass_matrix(q)
        C = self.robot_model.coriolis_matrix(q, q_dot)
        tau = M @ np.linalg.pinv(J) @ task_accelerations + g

        return tau

    def _compute_com_error(self, desired_state: dict, current_state: dict) -> np.ndarray:
        """
        Compute error in Center of Mass position and orientation
        """
        # Position error (3D)
        pos_error = desired_state['com_position'] - current_state['com_position']

        # Velocity error (3D)
        vel_error = desired_state['com_velocity'] - current_state['com_velocity']

        # Orientation error (3D) - using rotation vector representation
        desired_rot = R.from_quat(desired_state['com_orientation'])
        current_rot = R.from_quat(current_state['com_orientation'])
        orientation_error = (desired_rot * current_rot.inv()).as_rotvec()

        # Angular velocity error (3D)
        angular_error = desired_state['com_angular_velocity'] - current_state['com_angular_velocity']

        return np.concatenate([pos_error, orientation_error, vel_error, angular_error])

    def _compute_foot_errors(self, desired_positions: dict, current_positions: dict) -> np.ndarray:
        """
        Compute errors for foot positions and orientations
        """
        foot_errors = []

        for foot_name in ['left_foot', 'right_foot']:
            if foot_name in desired_positions:
                # Position error
                pos_error = desired_positions[foot_name]['position'] - current_positions[foot_name]['position']

                # Orientation error
                desired_rot = R.from_quat(desired_positions[foot_name]['orientation'])
                current_rot = R.from_quat(current_positions[foot_name]['orientation'])
                orientation_error = (desired_rot * current_rot.inv()).as_rotvec()

                foot_errors.extend([*pos_error, *orientation_error])

        return np.array(foot_errors)

    def _compute_com_jacobian(self, current_state: dict) -> np.ndarray:
        """
        Compute Jacobian matrix for Center of Mass task
        """
        q = current_state['joint_positions']
        return self.robot_model.com_jacobian(q)

    def _compute_foot_jacobians(self, current_state: dict) -> np.ndarray:
        """
        Compute Jacobian matrices for foot tasks
        """
        q = current_state['joint_positions']
        J_left = self.robot_model.jacobian('left_foot', q)
        J_right = self.robot_model.jacobian('right_foot', q)

        # Combine foot Jacobians
        return np.vstack([J_left, J_right])
```

### Walking Pattern Generator

The walking pattern generator creates the reference trajectories for the controllers:

```python
import numpy as np
from scipy import signal

class WalkingPatternGenerator:
    def __init__(self, step_height: float = 0.05, step_length: float = 0.3,
                 step_time: float = 0.8, com_height: float = 0.8):
        self.step_height = step_height
        self.step_length = step_length
        self.step_time = step_time
        self.com_height = com_height
        self.foot_separation = 0.2  # Lateral distance between feet

        # Gait parameters
        self.dsp_ratio = 0.2  # Double support phase ratio
        self.ssp_ratio = 1.0 - 2 * self.dsp_ratio  # Single support phase ratio

        # Initialize support foot
        self.left_support = True

    def generate_step_trajectory(self, start_time: float, end_time: float, dt: float) -> dict:
        """
        Generate trajectory for a single step
        """
        time_steps = np.arange(start_time, end_time, dt)
        n_steps = len(time_steps)

        # Initialize trajectory arrays
        pos_trajectory = np.zeros((n_steps, 3))  # x, y, z position
        vel_trajectory = np.zeros((n_steps, 3))  # x, y, z velocity
        acc_trajectory = np.zeros((n_steps, 3))  # x, y, z acceleration

        # Determine if this is a swing foot (moving) or stance foot (stationary)
        support_foot = 'left' if self.left_support else 'right'
        swing_foot = 'right' if self.left_support else 'left'

        # Calculate phase-based trajectories
        for i, t in enumerate(time_steps):
            phase = (t - start_time) / (end_time - start_time)  # Normalized phase [0, 1]

            if swing_foot == 'left':
                # Left foot is swinging forward
                pos_trajectory[i, 0] = self._compute_swing_x(phase)  # Forward movement
                pos_trajectory[i, 1] = self._compute_swing_y(phase)  # Lateral movement
                pos_trajectory[i, 2] = self._compute_swing_z(phase)  # Vertical movement (clearance)
            else:
                # Right foot is swinging forward
                pos_trajectory[i, 0] = self._compute_swing_x(phase)
                pos_trajectory[i, 1] = -self._compute_swing_y(phase)  # Negative for right foot
                pos_trajectory[i, 2] = self._compute_swing_z(phase)

        # Compute velocities and accelerations using finite differences
        for i in range(1, n_steps):
            vel_trajectory[i] = (pos_trajectory[i] - pos_trajectory[i-1]) / dt

        for i in range(1, n_steps):
            acc_trajectory[i] = (vel_trajectory[i] - vel_trajectory[i-1]) / dt

        # Alternate support foot for next step
        self.left_support = not self.left_support

        return {
            'position': pos_trajectory,
            'velocity': vel_trajectory,
            'acceleration': acc_trajectory,
            'support_foot': support_foot,
            'swing_foot': swing_foot
        }

    def _compute_swing_x(self, phase: float) -> float:
        """
        Compute forward position of swing foot based on phase
        """
        # Use 5th order polynomial for smooth trajectory
        # Phase: 0 at start of step, 1 at end of step

        # DSP1 (Double Support Phase 1) - 0 to dsp_ratio
        if phase <= self.dsp_ratio:
            return 0.0  # Foot stays in place during DSP

        # SSP (Single Support Phase) - dsp_ratio to 1-dsp_ratio
        elif phase <= 1 - self.dsp_ratio:
            ssp_phase = (phase - self.dsp_ratio) / self.ssp_ratio  # Normalize to [0, 1]

            # 5th order polynomial: smooth start and end
            # q(t) = a0 + a1*t + a2*t^2 + a3*t^3 + a4*t^4 + a5*t^5
            # With boundary conditions: q(0)=0, q(1)=1, q'(0)=0, q'(1)=0, q''(0)=0, q''(1)=0
            t = ssp_phase
            x_pos = t**3 * (10 - 15*t + 6*t**2)  # 5th order polynomial

            return x_pos * self.step_length

        # DSP2 (Double Support Phase 2) - 1-dsp_ratio to 1
        else:
            return self.step_length  # Foot stays at destination during DSP

    def _compute_swing_y(self, phase: float) -> float:
        """
        Compute lateral position of swing foot based on phase
        """
        if phase <= self.dsp_ratio or phase >= 1 - self.dsp_ratio:
            # During DSP, foot stays at initial lateral position
            return 0.0 if phase <= self.dsp_ratio else self.foot_separation

        # During SSP, follow smooth trajectory from current to target lateral position
        ssp_phase = (phase - self.dsp_ratio) / self.ssp_ratio
        # Smooth transition from 0 to foot_separation
        return self.foot_separation * (1 - np.cos(np.pi * ssp_phase)) / 2

    def _compute_swing_z(self, phase: float) -> float:
        """
        Compute vertical position of swing foot based on phase
        """
        if phase <= self.dsp_ratio or phase >= 1 - self.dsp_ratio:
            # During DSP, foot stays on ground
            return 0.0

        # During SSP, lift foot for ground clearance
        ssp_phase = (phase - self.dsp_ratio) / self.ssp_ratio
        # Use sinusoidal profile for smooth lift and landing
        return self.step_height * np.sin(np.pi * ssp_phase)

    def generate_com_trajectory(self, step_count: int, dt: float) -> dict:
        """
        Generate Center of Mass trajectory synchronized with stepping
        """
        total_time = step_count * self.step_time
        time_steps = np.arange(0, total_time, dt)
        n_steps = len(time_steps)

        com_pos = np.zeros((n_steps, 3))  # x, y, z
        com_vel = np.zeros((n_steps, 3))
        com_acc = np.zeros((n_steps, 3))

        # Initialize CoM at starting position
        com_pos[0, 2] = self.com_height  # Maintain nominal height

        for i, t in enumerate(time_steps):
            if i == 0:
                continue

            # Calculate step phase and parameters
            step_number = int(t / self.step_time)
            phase_in_step = (t % self.step_time) / self.step_time

            # Forward progression (smoothed to avoid jerks)
            avg_speed = self.step_length / self.step_time
            com_pos[i, 0] = avg_speed * t  # Smooth forward progression

            # Lateral oscillation (body sway) - opposite to swing foot
            if step_number % 2 == 0:  # Even steps: right foot swings
                lateral_offset = -0.02 * np.cos(np.pi * (t / self.step_time))
            else:  # Odd steps: left foot swings
                lateral_offset = 0.02 * np.cos(np.pi * (t / self.step_time))

            com_pos[i, 1] = lateral_offset

            # Maintain height with small oscillations
            com_pos[i, 2] = self.com_height + 0.01 * np.sin(2 * np.pi * t / self.step_time)

        # Compute velocities and accelerations
        for i in range(1, n_steps):
            com_vel[i] = (com_pos[i] - com_pos[i-1]) / dt
            if i > 1:
                com_acc[i] = (com_vel[i] - com_vel[i-1]) / dt

        return {
            'position': com_pos,
            'velocity': com_vel,
            'acceleration': com_acc
        }
```

### Main Bipedal Locomotion Controller

The main controller integrates all components:

```python
import rospy
from sensor_msgs.msg import JointState
from geometry_msgs.msg import PointStamped
from std_msgs.msg import Float64MultiArray

class BipedalLocomotionController:
    def __init__(self):
        # Initialize components
        self.robot_mass = 50.0  # Example robot mass in kg
        self.com_height = 0.8   # Example CoM height in meters

        self.zmp_controller = ZMPController(self.robot_mass, com_height=self.com_height)
        self.mpc_controller = MPCWalkingController(com_height=self.com_height)
        self.whole_body_controller = WholeBodyController(robot_model=None)  # Placeholder
        self.pattern_generator = WalkingPatternGenerator(com_height=self.com_height)

        # ROS publishers/subscribers
        self.joint_command_pub = rospy.Publisher('/joint_group_position_controller/command',
                                               Float64MultiArray, queue_size=10)
        self.zmp_pub = rospy.Publisher('/zmp', PointStamped, queue_size=10)
        self.com_pub = rospy.Publisher('/com', PointStamped, queue_size=10)

        # Subscriber for joint states
        self.joint_state_sub = rospy.Subscriber('/joint_states', JointState, self.joint_state_callback)

        # Walking parameters
        self.walking_speed = 0.5  # m/s
        self.step_time = 0.8      # seconds per step
        self.is_walking = False
        self.current_time = 0.0

        # State variables
        self.current_joint_positions = None
        self.current_joint_velocities = None

    def joint_state_callback(self, msg: JointState):
        """Callback for joint state updates"""
        self.current_joint_positions = np.array(msg.position)
        self.current_joint_velocities = np.array(msg.velocity)

    def start_walking(self, speed: float = 0.5):
        """Start bipedal walking at specified speed"""
        self.walking_speed = speed
        self.is_walking = True
        print(f"Starting walking at speed: {speed} m/s")

    def stop_walking(self):
        """Stop bipedal walking"""
        self.is_walking = False
        print("Stopping walking")

    def update_walking(self, dt: float):
        """Main update function for walking control"""
        if not self.is_walking:
            return

        self.current_time += dt

        try:
            # Generate reference trajectories
            com_trajectory = self.pattern_generator.generate_com_trajectory(1, dt)
            step_trajectory = self.mpc_controller.compute_footstep_plan(self.walking_speed, self.step_time)

            # Get current state (simplified - in reality this comes from state estimation)
            current_com_state = self._estimate_com_state()
            current_zmp = self._measure_zmp()

            # Update ZMP controller
            desired_com = self.zmp_controller.update_control(current_zmp, dt)

            # Solve MPC problem for optimal ZMP reference
            current_state_vector = self._compose_state_vector(current_com_state, current_zmp)
            optimal_zmp = self.mpc_controller.solve_mpc(current_state_vector, step_trajectory[:20])

            # Compute joint torques using whole-body control
            joint_torques = self.whole_body_controller.compute_joint_torques(
                desired_com_state={'com_position': desired_com},
                current_state={'joint_positions': self.current_joint_positions or np.zeros(12),
                              'joint_velocities': self.current_joint_velocities or np.zeros(12)},
                desired_foot_positions={},
                current_foot_positions={}
            )

            # Publish commands and feedback
            self._publish_joint_commands(joint_torques)
            self._publish_zmp_feedback(current_zmp)
            self._publish_com_feedback(current_com_state['position'])

        except Exception as e:
            print(f"Error in walking update: {e}")
            self.stop_walking()

    def _estimate_com_state(self) -> dict:
        """Estimate Center of Mass state from sensor data"""
        # Simplified estimation - in reality this would use IMU, joint encoders, etc.
        return {
            'position': np.array([0.0, 0.0, self.com_height]),
            'velocity': np.array([self.walking_speed, 0.0, 0.0]),
            'acceleration': np.array([0.0, 0.0, 0.0])
        }

    def _measure_zmp(self) -> Tuple[float, float]:
        """Measure Zero-Moment Point from force sensors"""
        # Simplified measurement - in reality this would come from F/T sensors in feet
        # For now, return estimated ZMP based on CoM position
        com_state = self._estimate_com_state()
        zmp_x = com_state['position'][0]  # Simplified ZMP estimation
        zmp_y = com_state['position'][1]
        return (zmp_x, zmp_y)

    def _compose_state_vector(self, com_state: dict, zmp: Tuple[float, float]) -> np.ndarray:
        """Compose state vector for MPC controller"""
        return np.array([
            com_state['position'][0],  # com_x
            com_state['position'][1],  # com_y
            com_state['velocity'][0],  # com_x_dot
            com_state['velocity'][1]   # com_y_dot
        ])

    def _publish_joint_commands(self, torques: np.ndarray):
        """Publish joint torque commands"""
        cmd_msg = Float64MultiArray()
        cmd_msg.data = torques.tolist()
        self.joint_command_pub.publish(cmd_msg)

    def _publish_zmp_feedback(self, zmp: Tuple[float, float]):
        """Publish ZMP feedback"""
        zmp_msg = PointStamped()
        zmp_msg.header.stamp = rospy.Time.now()
        zmp_msg.header.frame_id = "world"
        zmp_msg.point.x = zmp[0]
        zmp_msg.point.y = zmp[1]
        zmp_msg.point.z = 0.0
        self.zmp_pub.publish(zmp_msg)

    def _publish_com_feedback(self, com_pos: np.ndarray):
        """Publish CoM feedback"""
        com_msg = PointStamped()
        com_msg.header.stamp = rospy.Time.now()
        com_msg.header.frame_id = "world"
        com_msg.point.x = com_pos[0]
        com_msg.point.y = com_pos[1]
        com_msg.point.z = com_pos[2]
        self.com_pub.publish(com_msg)
```

## Practical Examples

### Example 1: Forward Walking Pattern

Implementing a basic forward walking gait where the robot moves straight ahead. The pattern generator creates trajectories for the swing foot while maintaining balance with the stance foot. The ZMP controller ensures that the Zero-Moment Point remains within the support polygon defined by the stance foot throughout the gait cycle.

### Example 2: Turning Motion

Implementing turning motions by adjusting the footstep positions and CoM trajectories. During turns, the robot shifts its weight to the inside of the turn while the swing foot follows an arc trajectory. The MPC controller optimizes the ZMP reference to maintain balance during the turning motion.

### Example 3: Stair Climbing

Implementing stair climbing requires adapting the foot trajectories to match the step heights and depths. The pattern generator must account for the vertical displacement while maintaining dynamic balance. Additional safety margins are required due to the increased risk of falling on stairs.

## System-Level Architecture Perspective

Bipedal locomotion systems require a hierarchical control architecture that coordinates multiple control loops running at different frequencies. The high-level controller plans the overall walking pattern and trajectory, the mid-level controller executes Model Predictive Control to optimize balance, and the low-level controller manages individual joint torques.

The system must integrate sensory feedback from multiple sources including joint encoders, IMUs, force/torque sensors, and potentially vision systems. This sensory integration is critical for disturbance rejection and adaptive behavior.

Communication between control levels must be carefully designed to ensure that high-frequency low-level control is not disrupted by higher-level planning decisions. Typically, the high-level planner runs at 1-10 Hz, the MPC controller at 50-100 Hz, and the joint control at 1000+ Hz.

Safety systems must be integrated throughout the architecture with multiple layers of protection including position limits, velocity limits, torque limits, and emergency stop capabilities. The system should be able to transition to a safe pose if any level of the control hierarchy fails.

## Practical Reasoning and Design Thinking

Designing effective bipedal locomotion systems requires balancing multiple competing objectives: stability, efficiency, speed, and robustness. These objectives often conflict, requiring careful trade-off analysis and design decisions.

Stability is typically the primary concern, as unstable walking will result in falls that can damage the robot and potentially harm humans in the environment. This leads to conservative control strategies that may sacrifice some efficiency or speed for safety.

Energy efficiency is important for extending operational time, especially for untethered robots. This requires optimizing gait patterns to minimize unnecessary motion and maximize the use of passive dynamics where possible.

Terrain adaptability is crucial for real-world applications. The system must be able to handle uneven surfaces, obstacles, and varying ground conditions. This requires real-time adaptation and potentially different control strategies for different terrain types.

The design should also consider human-robot interaction, as people will need to predict the robot's motion patterns to interact safely. This suggests using gait patterns that are somewhat similar to human walking patterns.

## Failure Modes and Debugging Tips

### Common Failure Modes

1. **Balance Loss**: The robot may lose balance due to inaccurate ZMP estimation or control delays. Solution: Implement multiple balance recovery strategies and safety limits.

2. **Foot Collision**: Swing foot may collide with stance leg or ground. Solution: Implement proper foot trajectory planning with adequate clearance.

3. **Actuator Saturation**: Joint torques may exceed actuator limits during dynamic motions. Solution: Implement torque limiting and trajectory scaling.

4. **Sensor Noise**: Noisy sensor data can cause control instability. Solution: Implement appropriate filtering and sensor fusion.

5. **Model Inaccuracy**: Real robot dynamics may differ from control model. Solution: Implement adaptive control and system identification.

### Debugging Strategies

1. **Step-by-Step Testing**: Test each component (pattern generation, ZMP control, whole-body control) independently before integration.

2. **Simulation Validation**: Extensively test control algorithms in simulation before hardware implementation.

3. **Data Logging**: Log all state variables, control outputs, and sensor data for post-hoc analysis.

4. **Parameter Tuning**: Use systematic approaches to tune control parameters, starting with conservative values.

5. **Safety First**: Always implement emergency stops and protective limits during development and testing.

## Exercises

### Beginner Level
1. Implement a simple inverted pendulum model to understand the relationship between CoM and ZMP.
2. Create a basic foot trajectory generator for straight-line walking.
3. Build a ZMP estimator from simplified force measurements.

### Intermediate Level
1. Implement an MPC controller for the inverted pendulum model with constraints.
2. Design a gait pattern generator that can handle turning motions.
3. Create a balance recovery controller that activates when ZMP exceeds limits.

### Advanced Level
1. Develop a learning-based approach to optimize gait parameters based on energy efficiency.
2. Implement terrain-adaptive walking that adjusts parameters based on ground conditions.
3. Design a multi-robot coordination system for group walking behaviors.

## Multiple Choice Questions (MCQs)
**Question 1:** What does ZMP stand for in bipedal locomotion?
  - a) Zero Moment Point
  - b) Zero Motion Position
  - c) Zero Momentum Parameter
  - d) Zero Mass Point
  - **Answer: a) Zero Moment Point**
  - **Explanation:** Zero-Moment Point is the point on the ground where the net moment of the inertial and gravitational forces acting on the robot is zero.

**Question 2:** For stable bipedal walking, where must the ZMP remain?
  - a) At the center of the robot
  - b) Within the support polygon (typically the foot area)
  - c) At the ankle joint
  - d) At the center of mass
  - **Answer: b) Within the support polygon (typically the foot area)**
  - **Explanation:** For stable walking, the ZMP must remain within the convex hull of the support polygon to prevent tipping.

**Question 3:** What is the primary advantage of Model Predictive Control (MPC) for bipedal locomotion?
  - a) Lower computational cost
  - b) Ability to optimize over a prediction horizon with constraints
  - c) Simpler implementation
  - d) Reduced sensor requirements
  - **Answer: b) Ability to optimize over a prediction horizon with constraints**
  - **Explanation:** MPC optimizes walking patterns over a prediction horizon while respecting dynamic constraints and handling disturbances.

**Question 4:** What is the typical height used in the inverted pendulum model for bipedal walking?
  - a) Knee height
  - b) Hip height
  - c) Center of mass height
  - d) Shoulder height
  - **Answer: c) Center of mass height**
  - **Explanation:** The inverted pendulum model uses the center of mass height above the ground as the pendulum length parameter.

**Question 5:** What is the main purpose of the double support phase in human walking?
  - a) Increase walking speed
  - b) Provide stability during weight transfer
  - c) Reduce energy consumption
  - d) Improve turning ability
  - **Answer: b) Provide stability during weight transfer**
  - **Explanation:** The double support phase provides additional stability when transferring weight from one foot to the other.

**Question 6:** Which controller component handles the coordination of all robot joints?
  - a) ZMP controller
  - b) MPC controller
  - c) Whole-body controller
  - d) Pattern generator
  - **Answer: c) Whole-body controller**
  - **Explanation:** The whole-body controller coordinates all joints to achieve the desired CoM and ZMP behavior.

**Question 7:** What is the primary challenge in bipedal locomotion compared to wheeled robots?
  - a) Higher speed capability
  - b) Dynamic balance during single support phase
  - c) Better terrain adaptation
  - d) Lower energy consumption
  - **Answer: b) Dynamic balance during single support phase**
  - **Explanation:** Bipedal robots must maintain dynamic balance while only having one foot in contact with the ground during single support phase.

**Question 8:** How does the step timing affect bipedal stability?
  - a) No effect on stability
  - b) Longer steps always improve stability
  - c) Proper timing is crucial for maintaining balance
  - d) Only affects walking speed
  - **Answer: c) Proper timing is crucial for maintaining balance**
  - **Explanation:** Proper timing of steps is essential for maintaining dynamic balance and preventing falls.

**Question 9:** What is the role of the pattern generator in bipedal locomotion?
  - a) Controls joint torques directly
  - b) Generates reference trajectories for other controllers
  - c) Measures sensor data
  - d) Optimizes control parameters
  - **Answer: b) Generates reference trajectories for other controllers**
  - **Explanation:** The pattern generator creates the desired trajectories that other controllers aim to follow.

**Question 10:** Why is sensory feedback critical in bipedal locomotion?
  - a) Reduces computational requirements
  - b) Enables disturbance rejection and adaptation
  - c) Improves walking speed
  - d) Decreases energy consumption
  - **Answer: b) Enables disturbance rejection and adaptation**
  - **Explanation:** Sensory feedback allows the system to detect disturbances and adapt the control to maintain balance.

## Chapter Summary

Bipedal locomotion is one of the most challenging problems in humanoid robotics, requiring precise control of dynamic balance during walking. The Zero-Moment Point (ZMP) criterion provides the mathematical foundation for stable walking, requiring the ZMP to remain within the support polygon.

Key technical components include ZMP control, Model Predictive Control (MPC), whole-body controllers, and walking pattern generators. These components work together in a hierarchical architecture with different control frequencies and responsibilities.

The system must balance competing objectives including stability, efficiency, speed, and robustness. Practical implementations require extensive sensory feedback, safety systems, and adaptive capabilities for real-world deployment.

The chapter covered implementation examples for forward walking, turning, and stair climbing. System-level architecture involves multiple control layers coordinated at different frequencies. Multiple-choice questions reinforced key concepts including ZMP principles, control strategies, and safety considerations.

## Citations

1. Kajita, S., et al. (2006). "Biped walking pattern generation by using preview control of zero-moment point." *Proceedings 2003 IEEE/RSJ International Conference on Intelligent Robots and Systems*, 1620-1626.

2. Takenaka, T., et al. (2009). "Real time motion generation and control for biped robot—1st report: Walking gait pattern generation." *2009 IEEE/RSJ International Conference on Intelligent Robots and Systems*, 1084-1091.

3. Herdt, A., et al. (2010). "Online walking motion generation with automatic foot step placement." *Advanced Robotics*, 24(15), 2119-2137.

4. Wieber, P. B. (2006). "Pattern generators with sensory feedback for the control of quadruped locomotion." *2006 IEEE International Conference on Robotics and Automation*, 2433-2438.

5. Englsberger, J., et al. (2011). "Bipedal walking control based on Capture Point dynamics." *2011 IEEE/RSJ International Conference on Intelligent Robots and Systems*, 4420-4427.

6. Pratt, J., & Goswami, A. (2007). "On limit cycles and their relation to stability in the walking of anthropomorphic robots." *Proceedings 2007 IEEE International Conference on Robotics and Automation*, 1798-1803.

7. Sardain, P., & Bessonnet, G. (2004). "Forces acting on a biped robot. Center of pressure-zero moment point." *IEEE Transactions on Systems, Man, and Cybernetics, Part A: Systems and Humans*, 34(4), 630-634.

8. Hof, H. K., et al. (2005). "The condition for dynamic stability." *Journal of Biomechanics*, 38(1), 1-8.

9. Shih, C. L., et al. (1990). "Adaptive control of a biped walking robot." *IEEE Control Systems Magazine*, 10(7), 6-11.

10. Asano, F., et al. (2000). "A novel walking control for a biped robot based on mechanical energy conservation." *Proceedings 2000 ICRA. Millennium Conference. IEEE International Conference on Robotics and Automation*, 1996-2001.

## Recent Developings

Recent developments in bipedal locomotion have focused on machine learning approaches that can learn stable walking patterns from human demonstrations or through reinforcement learning. These data-driven methods can potentially discover more efficient or human-like walking patterns than traditional model-based approaches.

Whole-body control frameworks have become more sophisticated, allowing for better coordination of balance, manipulation, and locomotion tasks simultaneously. These frameworks can handle multiple tasks with different priorities and constraints.

Advanced sensory systems including LiDAR, stereo vision, and tactile sensors enable better terrain awareness and adaptive walking. Robots can now adjust their gait parameters in real-time based on terrain characteristics.

Optimization-based control methods, particularly Model Predictive Control (MPC), have become more computationally efficient, enabling real-time implementation on robot hardware. New algorithms can solve the optimization problems faster while maintaining stability guarantees.

Bio-inspired approaches have gained attention, with researchers studying human and animal locomotion to develop more natural and efficient walking patterns. These approaches often incorporate concepts from neuroscience and biomechanics.

Robust control methods have been developed to handle model uncertainties and external disturbances. These methods provide stability guarantees even when the robot model is imperfect or when external forces are applied.