// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    'table-of-content/index',
    {
      type: 'category',
      label: 'Part I: Foundations of Physical AI',
      items: [
        {
          type: 'category',
          label: 'Weekly Breakdown',
          items: [
            {
              type: 'category',
              label: 'Week 1',
              items: [
                'part-1-foundations-of-physical-ai/weekly-breakdown/week-1/chapter-01-what-is-physical-ai',
                'part-1-foundations-of-physical-ai/weekly-breakdown/week-1/chapter-02-humanoid-robotics-landscape'
              ]
            },
            {
              type: 'category',
              label: 'Week 2',
              items: [
                'part-1-foundations-of-physical-ai/weekly-breakdown/week-2/chapter-03-sensors-physical-perception'
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Part II: The Robotic Nervous System (ROS 2)',
      items: [
        {
          type: 'category',
          label: 'Weekly Breakdown',
          items: [
            {
              type: 'category',
              label: 'Week 3',
              items: [
                'part-2-the-ros-nervous-system-ros2/weekly-breakdown/week-3/chapter-04-ros2-architecture'
              ]
            },
            {
              type: 'category',
              label: 'Week 4',
              items: [
                'part-2-the-ros-nervous-system-ros2/weekly-breakdown/week-4/chapter-05-nodes-topics-services-actions'
              ]
            },
            {
              type: 'category',
              label: 'Week 5',
              items: [
                'part-2-the-ros-nervous-system-ros2/weekly-breakdown/week-5/chapter-06-python-agents-rclpy',
                'part-2-the-ros-nervous-system-ros2/weekly-breakdown/week-5/chapter-07-urdf-for-humanoids'
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Part III: Digital Twins & Simulation + AI Robot Brain',
      items: [
        {
          type: 'category',
          label: 'Weekly Breakdown',
          items: [
            {
              type: 'category',
              label: 'Week 6',
              items: [
                'part-3-digital-twins-&-simulation-ai-robot-brain/weekly-breakdown/week-6/chapter-08-gazebo-physics-sensors'
              ]
            },
            {
              type: 'category',
              label: 'Week 7',
              items: [
                'part-3-digital-twins-&-simulation-ai-robot-brain/weekly-breakdown/week-7/chapter-09-unity-human-robot-interaction'
              ]
            },
            {
              type: 'category',
              label: 'Week 8',
              items: [
                'part-3-digital-twins-&-simulation-ai-robot-brain/weekly-breakdown/week-8/chapter-10-isaac-sim-synthetic-data'
              ]
            },
            {
              type: 'category',
              label: 'Week 9',
              items: [
                'part-3-digital-twins-&-simulation-ai-robot-brain/weekly-breakdown/week-9/chapter-11-isaac-ros-vslam-nav2'
              ]
            },
            {
              type: 'category',
              label: 'Week 10',
              items: [
                'part-3-digital-twins-&-simulation-ai-robot-brain/weekly-breakdown/week-10/part3-review'
              ]
            },
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Part IV: Vision–Language–Action & Humanoid Systems',
      items: [
        {
          type: 'category',
          label: 'Weekly Breakdown',
          items: [
            {
              type: 'category',
              label: 'Week 11',
              items: [
                'part-4-vla-humanoid-systems/weekly-breakdown/week-11/chapter-12-voice-to-action-pipelines',
                'part-4-vla-humanoid-systems/weekly-breakdown/week-11/chapter-13-llm-planning-for-robotics'
              ]
            },
            {
              type: 'category',
              label: 'Week 12',
              items: [
                'part-4-vla-humanoid-systems/weekly-breakdown/week-12/chapter-14-bipedal-locomotion',
                'part-4-vla-humanoid-systems/weekly-breakdown/week-12/chapter-15-manipulation-grasping'
              ]
            },
            {
              type: 'category',
              label: 'Week 13',
              items: [
                'part-4-vla-humanoid-systems/weekly-breakdown/week-13/chapter-16-conversational-humanoids'
              ]
            }
          ]
        }
      ]
    },
  ],
};

module.exports = sidebars;