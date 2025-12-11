---
description: "Task list for Mastering Physical AI & Humanoid Robotics course"
---

# Tasks: Mastering Physical AI & Humanoid Robotics Course

**Input**: Design documents from `/specs/001-physical-ai-robotics/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Docusaurus-based documentation site**: `docs/`, `src/`, `static/` at repository root
- **Lab templates**: `src/labs/` organized by module and week
- **API contracts**: `specs/001-physical-ai-robotics/contracts/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan in repository root
- [X] T002 Initialize Docusaurus project with Node.js dependencies in package.json
- [X] T003 [P] Configure linting and formatting tools for Markdown and JavaScript
- [X] T004 Create basic Docusaurus configuration in docusaurus.config.js
- [X] T005 Create sidebar navigation structure in sidebars.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create docs/ directory structure for all 4 modules and 13 weeks
- [X] T007 [P] Create src/labs/ directory structure for all 4 modules and 13 weeks
- [X] T008 Create static assets directory structure in static/img/ and static/assets/
- [X] T009 [P] Set up source code customization structure in src/components/, src/css/, and src/pages/
- [X] T010 Create README.md with project overview and setup instructions
- [ ] T011 [P] Set up basic CI/CD configuration for GitHub Pages deployment
- [ ] T012 Configure Lighthouse CI for accessibility/performance testing

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Complete 13-Week Capstone Course (Priority: P1) 🎯 MVP

**Goal**: Create the core structure of the 13-week capstone course with basic content organization and navigation

**Independent Test**: Can be fully tested by verifying the course structure exists with all 4 modules and 13 weeks of content

### Implementation for User Story 1

- [X] T013 [P] [US1] Create Module 1 content structure in docs/module-1-the-robotic-nervous-system/
- [X] T014 [P] [US1] Create Module 2 content structure in docs/module-2-the-digital-twin/
- [X] T015 [P] [US1] Create Module 3 content structure in docs/module-3-the-ai-robot-brain/
- [X] T016 [P] [US1] Create Module 4 content structure in docs/module-4-vision-language-action-models/
- [X] T017 [P] [US1] Create basic week content files for Module 1 (week-1 to week-5)
- [X] T018 [P] [US1] Create basic week content files for Module 2 (week-6 to week-7)
- [X] T019 [P] [US1] Create basic week content files for Module 3 (week-8 to week-10)
- [X] T020 [P] [US1] Create basic week content files for Module 4 (week-11 to week-13)
- [X] T021 [US1] Update sidebars.js to include all modules and weeks in navigation
- [X] T022 [US1] Create course overview page with learning objectives from spec.md
- [X] T023 [US1] Add basic content to each week file with placeholder structure
- [X] T024 [US1] Implement basic Docusaurus site with course structure

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Access Module-Specific Content (Priority: P2)

**Goal**: Create detailed content for Module 1 with learning objectives, theory, and hands-on labs

**Independent Test**: Can be tested by verifying students can access and complete content for Module 1 with its 5 weeks of content independently

### Implementation for User Story 2

- [X] T025 [P] [US2] Create detailed learning objectives for Module 1 in docs/module-1-the-robotic-nervous-system/
- [X] T026 [P] [US2] Write theory content for Week 1 in docs/module-1-the-robotic-nervous-system/week-1-foundations-of-physical-ai.md
- [X] T027 [P] [US2] Write theory content for Week 2 in docs/module-1-the-robotic-nervous-system/week-2-ros2-concepts.md
- [X] T028 [P] [US2] Write theory content for Week 3 in docs/module-1-the-robotic-nervous-system/week-3-nodes-topics-services.md
- [X] T029 [P] [US2] Write theory content for Week 4 in docs/module-1-the-robotic-nervous-system/week-4-urdf-xacro.md
- [X] T030 [P] [US2] Write theory content for Week 5 in docs/module-1-the-robotic-nervous-system/week-5-launch-files-parameters.md
- [X] T031 [P] [US2] Create lab template structure for Module 1 in src/labs/module-1/
- [X] T032 [US2] Create Week 1 lab template in src/labs/module-1/week-1-template/
- [X] T033 [US2] Create Week 2 lab template in src/labs/module-1/week-2-template/
- [X] T034 [US2] Create Week 3 lab template in src/labs/module-1/week-3-template/
- [X] T035 [US2] Create Week 4 lab template in src/labs/module-1/week-4-template/
- [X] T036 [US2] Create Week 5 lab template in src/labs/module-1/week-5-template/
- [X] T037 [US2] Add lab instructions and success criteria to each Week 1-5 template
- [X] T038 [US2] Implement GitHub repo templates for all Module 1 labs
- [X] T039 [US2] Add citations to Module 1 content following IEEE style

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Deploy to Real Hardware (Priority: P3)

**Goal**: Create documentation and lab templates for deploying projects to real hardware (Unitree G1)

**Independent Test**: Can be tested by verifying students can take their simulation-based project and successfully deploy it to real hardware following the course documentation

### Implementation for User Story 3

- [X] T040 [P] [US3] Create hardware configuration documentation in docs/hardware-requirements.md
- [X] T041 [P] [US3] Document Jetson Orin Nano Super setup in docs/hardware-setup/jetson-setup.md
- [X] T042 [P] [US3] Document Unitree G1 deployment process in docs/hardware-setup/unitree-deployment.md
- [X] T043 [P] [US3] Create hardware compatibility guide in docs/hardware-setup/compatibility.md
- [X] T044 [US3] Create deployment lab template in src/labs/module-4/week-13-template/
- [X] T045 [US3] Add real hardware deployment instructions to Week 13 content
- [X] T046 [US3] Create hardware troubleshooting guide in docs/hardware-setup/troubleshooting.md
- [X] T047 [US3] Add alternative hardware options documentation in docs/hardware-setup/alternatives.md
- [X] T048 [US3] Create cloud deployment documentation as alternative to hardware in docs/cloud-deployment.md

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Module 2 Content - The Digital Twin (Priority: P2)

**Goal**: Create detailed content for Module 2 with learning objectives, theory, and hands-on labs

**Independent Test**: Can be tested by verifying students can access and complete content for Module 2 with its 2 weeks of content independently

### Implementation for Module 2

- [X] T049 [P] [US2] Create detailed learning objectives for Module 2 in docs/module-2-the-digital-twin/
- [X] T050 [P] [US2] Write theory content for Week 6 in docs/module-2-the-digital-twin/week-6-gazebo-ignition.md
- [X] T051 [P] [US2] Write theory content for Week 7 in docs/module-2-the-digital-twin/week-7-unity-ros-tcp-connector.md
- [X] T052 [P] [US2] Create lab template structure for Module 2 in src/labs/module-2/
- [X] T053 [US2] Create Week 6 lab template in src/labs/module-2/week-6-template/
- [X] T054 [US2] Create Week 7 lab template in src/labs/module-2/week-7-template/
- [X] T055 [US2] Add lab instructions and success criteria to each Week 6-7 template
- [X] T056 [US2] Add citations to Module 2 content following IEEE style

---

## Phase 7: Module 3 Content - The AI-Robot Brain (Priority: P2)

**Goal**: Create detailed content for Module 3 with learning objectives, theory, and hands-on labs

**Independent Test**: Can be tested by verifying students can access and complete content for Module 3 with its 3 weeks of content independently

### Implementation for Module 3

- [X] T057 [P] [US2] Create detailed learning objectives for Module 3 in docs/module-3-the-ai-robot-brain/
- [X] T058 [P] [US2] Write theory content for Week 8 in docs/module-3-the-ai-robot-brain/week-8-isaac-sim-omniverse.md
- [X] T059 [P] [US2] Write theory content for Week 9 in docs/module-3-the-ai-robot-brain/week-9-isaac-ros-gems.md
- [X] T060 [P] [US2] Write theory content for Week 10 in docs/module-3-the-ai-robot-brain/week-10-nav2-smac-planner.md
- [X] T061 [P] [US2] Create lab template structure for Module 3 in src/labs/module-3/
- [X] T062 [US2] Create Week 8 lab template in src/labs/module-3/week-8-template/
- [X] T063 [US2] Create Week 9 lab template in src/labs/module-3/week-9-template/
- [X] T064 [US2] Create Week 10 lab template in src/labs/module-3/week-10-template/
- [X] T065 [US2] Add lab instructions and success criteria to each Week 8-10 template
- [X] T066 [US2] Add citations to Module 3 content following IEEE style

---

## Phase 8: Module 4 Content - Vision-Language-Action Models (Priority: P2)

**Goal**: Create detailed content for Module 4 with learning objectives, theory, and hands-on labs

**Independent Test**: Can be tested by verifying students can access and complete content for Module 4 with its 3 weeks of content independently

### Implementation for Module 4

- [X] T067 [P] [US2] Create detailed learning objectives for Module 4 in docs/module-4-vision-language-action-models/
- [X] T068 [P] [US2] Write theory content for Week 11 in docs/module-4-vision-language-action-models/week-11-openvla-rt2x-octo.md
- [X] T069 [P] [US2] Write theory content for Week 12 in docs/module-4-vision-language-action-models/week-12-whisper-llm-ros2.md
- [X] T070 [P] [US2] Write theory content for Week 13 in docs/module-4-vision-language-action-models/week-13-final-capstone.md
- [X] T071 [P] [US2] Create lab template structure for Module 4 in src/labs/module-4/
- [X] T072 [US2] Create Week 11 lab template in src/labs/module-4/week-11-template/
- [X] T073 [US2] Create Week 12 lab template in src/labs/module-4/week-12-template/
- [X] T074 [US2] Create Week 13 lab template in src/labs/module-4/week-13-template/
- [X] T075 [US2] Add lab instructions and success criteria to each Week 11-13 template
- [X] T076 [US2] Add citations to Module 4 content following IEEE style

---

## Phase 9: API Implementation (Priority: P3)

**Goal**: Implement course management and student interaction APIs

**Independent Test**: Can be tested by verifying API endpoints work correctly for content delivery and progress tracking

### Implementation for API

- [X] T077 [P] [US3] Create Course Content API endpoints based on contracts/course-api.yaml
- [X] T078 [P] [US3] Implement Get Module Information endpoint in src/api/modules.js
- [X] T079 [P] [US3] Implement Get Week Content endpoint in src/api/weeks.js
- [X] T080 [US3] Implement Student Progress API endpoints in src/api/students.js
- [X] T081 [US3] Implement Lab Execution API endpoints in src/api/labs.js
- [X] T082 [US3] Implement Content Management API endpoints in src/api/citations.js
- [X] T083 [US3] Add API documentation in docs/api-reference.md

---

## Phase 10: Quality Assurance & Testing (Priority: P3)

**Goal**: Ensure all course content meets quality standards and all labs run successfully

**Independent Test**: Can be tested by running all labs on specified hardware and verifying course quality metrics

### Implementation for Quality Assurance

- [X] T084 [P] [US3] Create test matrix for Ubuntu 22.04 + RTX 4070 Ti + Jetson Orin Nano
- [X] T085 [P] [US3] Run all Module 1 labs on target hardware configuration
- [X] T086 [P] [US3] Run all Module 2 labs on target hardware configuration
- [X] T087 [P] [US3] Run all Module 3 labs on target hardware configuration
- [X] T088 [P] [US3] Run all Module 4 labs on target hardware configuration
- [X] T089 [US3] Verify course site achieves Lighthouse scores ≥ 95 across all categories
- [X] T090 [US3] Validate all 120+ citations with 70%+ peer-reviewed sources
- [X] T091 [US3] Test cloud path documentation with cost calculator
- [X] T092 [US3] Verify 100% local fallback for all labs with no paywalls

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T093 [P] Add comprehensive course documentation in docs/
- [X] T094 [P] Create student quickstart guide based on quickstart.md
- [X] T095 Add custom styling and branding to Docusaurus site
- [X] T096 [P] Create additional resources and references in docs/resources/
- [X] T097 Add accessibility features and WCAG compliance
- [X] T098 [P] Optimize site performance and loading times
- [X] T099 Add search functionality and improved navigation
- [X] T100 [P] Create assessment and quiz templates for all weeks
- [X] T101 Add progress tracking and student dashboard features
- [X] T102 [P] Create community contribution guidelines in CONTRIBUTING.md
- [X] T103 Add Mermaid diagrams to course content as per research.md
- [X] T104 [P] Implement quarterly update mechanism for content
- [X] T105 Add MIT license to all code examples and lab templates
- [X] T106 [P] Create deployment scripts for GitHub Pages
- [X] T107 Run final validation of quickstart.md instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members
- Module-specific content can be developed in parallel (Module 2, 3, 4 after Phase 3)

---

## Parallel Example: User Story 2

```bash
# Launch all Module 1 content creation together:
Task: "Create detailed learning objectives for Module 1 in docs/module-1-the-robotic-nervous-system/"
Task: "Write theory content for Week 1 in docs/module-1-the-robotic-nervous-system/week-1-foundations-of-physical-ai.md"
Task: "Write theory content for Week 2 in docs/module-1-the-robotic-nervous-system/week-2-ros2-concepts.md"
Task: "Create lab template structure for Module 1 in src/labs/module-1/"

# Launch all Week 1-5 content creation together:
Task: "Write theory content for Week 3 in docs/module-1-the-robotic-nervous-system/week-3-nodes-topics-services.md"
Task: "Write theory content for Week 4 in docs/module-1-the-robotic-nervous-system/week-4-urdf-xacro.md"
Task: "Write theory content for Week 5 in docs/module-1-the-robotic-nervous-system/week-5-launch-files-parameters.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence