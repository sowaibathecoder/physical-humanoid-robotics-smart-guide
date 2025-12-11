// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Module 1: The Robotic Nervous System',
      items: [
        'module-1-the-robotic-nervous-system/week-1-foundations-of-physical-ai',
        'module-1-the-robotic-nervous-system/week-2-ros2-concepts',
        'module-1-the-robotic-nervous-system/week-3-nodes-topics-services',
        'module-1-the-robotic-nervous-system/week-4-urdf-xacro',
        'module-1-the-robotic-nervous-system/week-5-launch-files-parameters',
      ],
    },
    {
      type: 'category',
      label: 'Module 2: The Digital Twin',
      items: [
        'module-2-the-digital-twin/week-6-gazebo-ignition',
        'module-2-the-digital-twin/week-7-unity-ros-tcp-connector',
      ],
    },
    {
      type: 'category',
      label: 'Module 3: The AI-Robot Brain',
      items: [
        'module-3-the-ai-robot-brain/week-8-isaac-sim-omniverse',
        'module-3-the-ai-robot-brain/week-9-isaac-ros-gems',
        'module-3-the-ai-robot-brain/week-10-nav2-smac-planner',
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Vision-Language-Action Models',
      items: [
        'module-4-vision-language-action-models/week-11-openvla-rt2x-octo',
        'module-4-vision-language-action-models/week-12-whisper-llm-ros2',
        'module-4-vision-language-action-models/week-13-final-capstone',
      ],
    },
  ],
};

module.exports = sidebars;