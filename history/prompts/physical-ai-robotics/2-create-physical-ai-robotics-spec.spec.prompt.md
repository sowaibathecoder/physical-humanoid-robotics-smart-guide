---
id: 2
title: Create Physical AI Robotics Spec
stage: spec
date: 2025-12-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: physical-ai-robotics
branch: 001-physical-ai-robotics
user: user
command: /sp.specify
labels: [spec,education,robotics,ai]
links:
  spec: specs/001-physical-ai-robotics/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-physical-ai-robotics/spec.md
 - specs/001-physical-ai-robotics/checklists/requirements.md
tests:
 - none
---

## Prompt

```text
Mastering Physical AI & Humanoid Robotics – 13-Week Hands-On Capstone Course (Spec-Kit Plus Format)

**Project**: Mastering Physical AI & Humanoid Robotics – Intensive 13-Week Hands-On Capstone Quarter
**Delivery Format**: Living online book + full learning pathway built with Docusaurus + GitHub Pages using Spec-Kit Plus
**Primary Audience**:
- Final-year undergraduate / Master's students in CS, Robotics, AI, or EE
- Professionals transitioning into embodied AI / humanoid robotics
- Hackathon teams and indie developers wanting production-grade Physical AI skills in 2025–2026

**Core Focus**: From zero to a fully autonomous simulated (and optionally real) humanoid that accepts an English voice command → understands intent → plans → navigates → manipulates objects — all built by the student in 13 weeks.

**Overall Success Criteria** (complete course/book ready for launch)
- 4 modules exactly as defined below, 13 weeks of content fully written and tested
- Every week contains: learning objectives + theory (markdown) + 2–4 hands-on labs (fully working GitHub repo templates)
- All labs run on student hardware under $800 (Economy Jetson Kit) OR documented cloud alternative
- Capstone project: student's humanoid successfully completes end-to-end VLA task in Isaac Sim + (optional) deploys to real hardware
- ≥ 120 verifiable citations (70%+ peer-reviewed or official NVIDIA/ROS docs)
- Full local test matrix passes on Ubuntu 22.04 + RTX 4070 Ti + Jetson Orin Nano
- Course site scores ≥ 95 Lighthouse across all categories

**Course & Book Structure – Exactly 4 Modules (non-negotiable)**

### Module 1: The Robotic Nervous System (ROS 2) – Weeks 1–5
High-level scope: Master the industry-standard middleware that connects everything.
- Week 1–2: Foundations of Physical AI & ROS 2 concepts
- Week 3: Nodes, Topics, Services, Actions in Python (rclpy)
- Week 4: URDF/Xacro for humanoid description + RViz2 visualization
- Week 5: Launch files, parameters, and building your first reusable ROS 2 workspace
Capstone milestone: Publish/subscribe a full humanoid joint state in < 50 lines

### Module 2: The Digital Twin (Gazebo & Unity) – Weeks 6–7
High-level scope: Simulate physics-accurate humanoids before touching real hardware.
- Week 6: Gazebo Ignition + SDF + sensor plugins (LiDAR, depth camera, IMU)
- Week 7: Unity + ROS-TCP-Connector for high-fidelity visualization and HRI
Capstone milestone: Spawn a dynamically balancing humanoid in Gazebo that walks using teleop

### Module 3: The AI-Robot Brain (NVIDIA Isaac Platform) – Weeks 8–10
High-level scope: Modern perception, navigation, and manipulation powered by NVIDIA's 2025 stack.
- Week 8: Isaac Sim (Omniverse) – photorealistic scenes, synthetic data, domain randomization
- Week 9: Isaac ROS – hardware-accelerated GEMs (VSLAM, AprilTag, NITROS) on Jetson
- Week 10: Nav2 + SMAC planner for bipedal locomotion + RT-DETR / DINOv2 object detection
Capstone milestone: Humanoid autonomously navigates a cluttered apartment in Isaac Sim

### Module 4: Vision-Language-Action Models (VLA) – Weeks 11–13
High-level scope: Close the loop with 2025 open-source VLA models and voice commands.
- Week 11: OpenVLA, RT-2-X, Octo, and other open-source 2025 VLA models
- Week 12: Whisper + LLM → ROS 2 action sequence (natural language robot control)
- Week 13: Final Capstone – "Clean the room" challenge: voice → planning → navigation → grasp
Capstone final demo: Simulated (mandatory) + optional real Unitree G1 / Jetson kit deployment

**Constraints**
- Total student hardware budget ≤ $800 for physical deployment path (Jetson Orin Nano Super + RealSense + ReSpeaker)
- All labs must have a 100% local fallback (no paywalls, no mandatory cloud)
- Cloud path fully documented (AWS g5/g6 instances + cost calculator)
- Citations: IEEE numeric style with clickable DOI/GitHub links
- Code: All labs in public GitHub monorepo with Apache 2.0 or MIT license
- No proprietary NVIDIA NDA content; everything usable by students worldwide
- Update cadence: New chapter versions every 6 months or on major Isaac/ROS releases

**Not Building**
- Full classical control theory (PD, inverse kinematics from scratch)
- Custom actuator design or CAD
- Ethics/philosophy deep dive
- Vendor-specific marketing comparisons

**Timeline to First Public Release**
- High-level module specs (this document): Today
- Detailed weekly specs (13 specs): Next 10 days
- All labs coded and tested: 10 weeks
- Public launch on GitHub Pages + course website live: Within 12 weeks

This specification is now locked. Next step: Generate 13 individual weekly detailed specs + lab templates.
```

## Response snapshot

Created a comprehensive specification for the "Mastering Physical AI & Humanoid Robotics" 13-week capstone course, including user scenarios, functional requirements, and success criteria based on the provided feature description.

## Outcome

- ✅ Impact: Complete spec created for physical AI robotics course with 4 modules and 13 weeks of content
- 🧪 Tests: none
- 📁 Files: specs/001-physical-ai-robotics/spec.md, specs/001-physical-ai-robotics/checklists/requirements.md
- 🔁 Next prompts: /sp.plan to create implementation plan
- 🧠 Reflection: Successfully translated the course concept into a structured specification with measurable outcomes

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): not applicable
- Prompt variant (if applicable): not applicable
- Next experiment (smallest change to try): not applicable