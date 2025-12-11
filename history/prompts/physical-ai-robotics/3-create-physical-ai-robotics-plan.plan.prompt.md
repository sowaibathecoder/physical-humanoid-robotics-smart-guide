---
id: 3
title: Create Physical AI Robotics Plan
stage: plan
date: 2025-12-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: physical-ai-robotics
branch: 001-physical-ai-robotics
user: user
command: /sp.plan
labels: [plan,education,robotics,ai,docusaurus]
links:
  spec: specs/001-physical-ai-robotics/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-physical-ai-robotics/plan.md
 - specs/001-physical-ai-robotics/research.md
 - specs/001-physical-ai-robotics/data-model.md
 - specs/001-physical-ai-robotics/quickstart.md
 - specs/001-physical-ai-robotics/contracts/course-api.yaml
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

```text
/sp.plan Mastering Physical AI & Humanoid Robotics – 13-Week Capstone Course Implementation Plan (Spec-Kit Plus Format)

**Project Reference**: Build on the locked /sp.specify for the 13-week hands-on capstone course as a living Docusaurus book on GitHub Pages.

**Overall Plan Goal**: Outline the full technical roadmap to deliver the complete course/book, including architecture, phased execution, research integration, key decisions, and validation – ready for Claude Code to generate the actual content.

**Create**:
- **Architecture Sketch**: High-level system diagram (in markdown PlantUML or ASCII art) showing: Docusaurus site structure (/docs for modules/weeks, /static for assets, GitHub Actions for CI/CD deployment); GitHub monorepo layout (root: Docusaurus config; src/labs: weekly code templates; docs/modules: markdown chapters); Integration points (ROS 2 workspaces, Isaac Sim scenes, Jetson deployment scripts); Data flow (student hardware/cloud → sim → real deploy).
- **Section Structure**: Detailed outline expanding the 4 modules into 13 weeks, with sub-sections per week: Learning Objectives (3–5 bullets); Theory Overview (markdown summary, 800–1200 words); Hands-On Labs (2–4 per week, with GitHub template links); Assessments (quizzes/code challenges); Resources (curated links/citations).
- **Research Approach**: Research-concurrent (integrate real-time searches during writing): For each week, query latest 2025–2026 sources via web/X searches (e.g., arXiv, NVIDIA blogs, ROS Discourse); Prioritize open-source repos (e.g., OpenVLA GitHub); Validate claims inline during drafting; Quarterly update hooks in markdown for post-launch maintenance.
- **Quality Validation**: Automated checks (Docusaurus build linting, Lighthouse CI in GitHub Actions); Manual peer-review simulation (fact-check 20% of citations); Plagiarism scan via integrated tool; Accessibility audit (ARIA labels for diagrams/code); Lab reproducibility test on spec hardware.

**Decisions Needing Documentation**:
- List 8–12 key choices, each with 2–4 options, pros/cons, and selected rationale:
  - e.g., Simulation Engine: Gazebo vs Isaac Sim (Gazebo: free/open, cons: less photoreal; Isaac: NVIDIA-optimized, cons: GPU req; Select: Both, Gazebo for basics, Isaac for advanced).
  - Hardware Path: Local Jetson vs Cloud AWS (Local: hands-on, cons: cost; Cloud: scalable, cons: latency; Select: Local primary with cloud fallback).
  - VLA Model: OpenVLA vs RT-2-X (OpenVLA: open-source, cons: less mature; RT-2-X: performant, cons: Google IP; Select: OpenVLA for reproducibility).
  - Citation Tooling: Manual markdown vs Zotero integration (Manual: simple, cons: error-prone; Zotero: automated, cons: setup; Select: Manual with BibTeX export).
  - License for Code Labs: MIT vs Apache 2.0 (MIT: permissive, cons: no contrib clause; Apache: patents, cons: longer; Select: MIT for simplicity).
  - Update Mechanism: Manual PRs vs GitHub Bots (Manual: control, cons: slow; Bots: auto, cons: errors; Select: Manual with issue templates).
  - Diagram Generation: PlantUML vs Mermaid (PlantUML: detailed, cons: external; Mermaid: native md, cons: simpler; Select: Mermaid for inline).
  - Cloud Provider: AWS vs Azure (AWS: NVIDIA AMIs, cons: cost; Azure: MS integration, cons: less robotics; Select: AWS g5/g6 for Isaac compatibility).

**Testing Strategy**:
- Validation checks tied to success criteria:
  - Build/Deploy: GitHub Actions pass (zero errors, Lighthouse ≥95).
  - Content: ≥120 citations verified (clickable, 70% peer-reviewed/NVIDIA/ROS); Zero plagiarism (Copyleaks scan).
  - Labs: All 2–4 per week run end-to-end on Ubuntu 22.04 + RTX 4070 Ti + Jetson Orin Nano (test matrix script).
  - Capstone: Simulated humanoid completes "Clean the room" in <5min runtime; Optional real deploy logs no crashes.
  - Usability: Student feedback simulation (rubric: objectives met, labs clear, hardware feasible under $800).

**Technical Details**:
- Use research-concurrent approach (research while writing, not all upfront – e.g., search for 2026 VLA updates during Module 4 drafting).
- Follow IEEE numeric citation style from Constitution (inline [1], full bib with DOIs/links).
- Organize by phases:
  - Research (Weeks 1–2: Gather baseline sources for all modules, setup search queries).
  - Foundation (Weeks 3–5: Build core structure, Module 1–2 drafts + labs).
  - Analysis (Weeks 6–10: Deep-dive Modules 3–4, integrate hardware/cloud paths).
  - Synthesis (Weeks 11–12: Capstone integration, full testing, launch prep).
- Additional: All code in Python 3/ROS 2 Humble; Assets CC0 or generated; Monorepo public from day 1.

This plan is now ready for execution. Next: Use Claude Code to implement phased deliverables.
```

## Response snapshot

Created a comprehensive implementation plan for the "Mastering Physical AI & Humanoid Robotics" 13-week capstone course, including technical context, project structure, research summary, data model, quickstart guide, and API contracts based on the provided plan requirements.

## Outcome

- ✅ Impact: Complete implementation plan created with all Phase 0 and Phase 1 artifacts
- 🧪 Tests: none
- 📁 Files: specs/001-physical-ai-robotics/plan.md, research.md, data-model.md, quickstart.md, contracts/course-api.yaml
- 🔁 Next prompts: /sp.tasks to generate implementation tasks
- 🧠 Reflection: Successfully implemented the full planning workflow with research, data modeling, and API contracts

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): not applicable
- Prompt variant (if applicable): not applicable
- Next experiment (smallest change to try): not applicable