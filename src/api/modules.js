// API module for handling module-related endpoints
// This is a placeholder implementation for the course API

class ModulesAPI {
  constructor() {
    this.modules = [
      {
        moduleId: "module-1-the-robotic-nervous-system",
        title: "The Robotic Nervous System (ROS 2)",
        weeks: 5,
        description: "Master the industry-standard middleware that connects everything.",
        learningObjectives: [
          "Understand ROS 2 architecture and concepts",
          "Create and manage ROS 2 nodes, topics, services, and actions",
          "Work with URDF/Xacro for humanoid description",
          "Build reusable ROS 2 workspaces"
        ],
        prerequisites: [],
        estimatedDuration: "5 weeks",
        weeks: [
          {
            weekId: "week-1-foundations-of-physical-ai",
            weekNumber: 1,
            title: "Foundations of Physical AI & ROS 2 concepts",
            estimatedDuration: "1 week"
          }
        ]
      }
    ];
  }

  getModule(moduleId) {
    return this.modules.find(module => module.moduleId === moduleId);
  }

  getAllModules() {
    return this.modules;
  }
}

module.exports = ModulesAPI;