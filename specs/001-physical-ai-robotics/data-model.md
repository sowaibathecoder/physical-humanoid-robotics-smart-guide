# Data Model: Mastering Physical AI & Humanoid Robotics Course

## Key Entities

### Course Module
- **Description**: Educational content organized by week and learning objectives
- **Attributes**:
  - moduleId: Unique identifier for the module
  - title: Name of the module (e.g., "The Robotic Nervous System")
  - weeks: Number of weeks in the module
  - description: Overview of the module content
  - learningObjectives: Array of learning objectives for the module
  - prerequisites: Array of prerequisite modules/weeks
  - estimatedDuration: Total time to complete the module
- **Relationships**: Contains multiple Week entities

### Week
- **Description**: Weekly content containing theory, practical exercises, and assessments
- **Attributes**:
  - weekId: Unique identifier for the week
  - module: Reference to parent module
  - weekNumber: Sequential number within the module
  - title: Name of the week topic
  - learningObjectives: Array of learning objectives for the week
  - theoryContent: Markdown content for theoretical learning
  - labExercises: Array of lab exercise references
  - assessments: Array of assessment references
  - resources: Array of additional resource references
  - estimatedDuration: Time to complete the week
- **Relationships**: Belongs to one Module, contains multiple LabExercise and Assessment entities

### Lab Exercise
- **Description**: Hands-on practical activity with working GitHub repo templates
- **Attributes**:
  - labId: Unique identifier for the lab
  - week: Reference to parent week
  - title: Name of the lab exercise
  - description: Overview of what the lab teaches
  - objectives: Array of learning objectives for the lab
  - prerequisites: Array of prerequisite knowledge/skills
  - hardwareRequirements: List of required hardware components
  - softwareRequirements: List of required software dependencies
  - instructions: Step-by-step guide for completing the lab
  - templateRepo: GitHub repository template for the lab
  - difficultyLevel: Beginner/Intermediate/Advanced
  - estimatedDuration: Time to complete the lab
  - successCriteria: Conditions for lab completion
- **Relationships**: Belongs to one Week

### Assessment
- **Description**: Evaluation mechanism to verify student understanding
- **Attributes**:
  - assessmentId: Unique identifier for the assessment
  - week: Reference to parent week
  - title: Name of the assessment
  - type: Quiz/Code Challenge/Project
  - questions: Array of questions or tasks
  - passingScore: Minimum score required to pass
  - timeLimit: Time allowed to complete the assessment
  - feedback: Explanation for correct/incorrect answers
- **Relationships**: Belongs to one Week

### Resource
- **Description**: Additional materials to support learning
- **Attributes**:
  - resourceId: Unique identifier for the resource
  - week: Reference to parent week (optional, can be module-level)
  - title: Name of the resource
  - type: Video/Paper/Code/Article/Tool
  - url: Link to the resource
  - description: Brief summary of the resource
  - tags: Array of relevant tags for categorization
  - difficultyLevel: Beginner/Intermediate/Advanced
  - estimatedTime: Time to consume the resource
- **Relationships**: Optionally belongs to Week or Module

### Student Progress
- **Description**: Record of student completion status for each week's content
- **Attributes**:
  - progressId: Unique identifier for the progress record
  - studentId: Reference to the student
  - week: Reference to the week being tracked
  - labStatus: Not Started/In Progress/Completed for each lab
  - assessmentScore: Score achieved on the assessment
  - completionDate: Date when the week was completed
  - notes: Instructor or student notes about progress
  - lastAccessed: Timestamp of last interaction
- **Relationships**: Belongs to one Student, references one Week

### Hardware Configuration
- **Description**: Specification of required hardware components
- **Attributes**:
  - configId: Unique identifier for the configuration
  - name: Name of the configuration (e.g., "Economy Jetson Kit")
  - description: Overview of the hardware setup
  - components: Array of hardware components with quantities
  - totalCost: Estimated cost of the configuration
  - compatibility: List of supported software/OS
  - alternatives: Array of alternative component options
  - assemblyGuide: Link to assembly instructions
- **Relationships**: Referenced by LabExercise entities

### Citation
- **Description**: Reference to external sources used in the course
- **Attributes**:
  - citationId: Unique identifier for the citation
  - type: Paper/Article/Blog/Code Repository/Video/Documentation
  - title: Title of the source
  - authors: Array of authors (for papers/articles)
  - publication: Name of publication venue
  - publicationDate: Date of publication
  - url: Link to the source
  - doi: DOI identifier (for papers)
  - ieeeNumber: IEEE reference number
  - sourcePriority: 1-5 based on constitution priority order
  - verificationStatus: Verified/Unverified
- **Relationships**: Referenced by various content entities (Module, Week, LabExercise)

## State Transitions

### Lab Exercise State Transitions
- Not Created → Draft (when initial content is created)
- Draft → Review (when content is ready for review)
- Review → Approved (when content passes quality checks)
- Approved → Published (when content is made available to students)
- Published → Archived (when content is deprecated)

### Student Progress State Transitions
- Not Started → In Progress (when student starts the week)
- In Progress → Completed (when student completes all requirements)
- Completed → Verified (when instructor confirms completion)

## Validation Rules

### Module Validation
- Each module must have 1-5 learning objectives
- Module duration must be specified and reasonable
- Module must have at least one week of content

### Week Validation
- Each week must have 1-10 learning objectives
- Week must contain at least theory content or lab exercises
- Week duration must be consistent with content volume
- All referenced resources must exist

### Lab Exercise Validation
- Lab must have clearly defined success criteria
- Hardware requirements must be within specified budget
- Estimated duration must be realistic
- Template repository must be accessible

### Assessment Validation
- Passing score must be between 0-100%
- Questions must have clear correct answers
- Assessment type must match learning objectives

### Citation Validation
- At least 70% of citations must be priority 1-3 (per constitution)
- All citations must have valid URLs/DOIs
- Citation style must follow IEEE numeric format