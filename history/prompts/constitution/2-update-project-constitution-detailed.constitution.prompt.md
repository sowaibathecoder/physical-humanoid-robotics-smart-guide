---
id: 2
title: Update Project Constitution Detailed
stage: constitution
date: 2025-12-16
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: user
command: /sp.constitution
labels: ["constitution", "governance", "project-setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
 - history/prompts/constitution/2-update-project-constitution-detailed.constitution.prompt.md
tests:
 - none
---

## Prompt

# Project Constitution: Physical AI & Humanoid Robotics Smart Guide (Textbook-Grade, Spec-Driven Book)

You are defining the immutable constitution for a long-lived, engineering-grade technical book project.
This document is the highest authority in the project hierarchy and overrides all future specifications,
plans, tasks, and implementations unless explicitly amended.

────────────────────────────────────────
PROJECT IDENTITY
────────────────────────────────────────

Book Title:
Physical AI & Humanoid Robotics – Smart Guide

Project Type:
A continuously evolving, open-source, textbook-grade technical book
(not a short course, not lecture notes, not a blog series, and not a static PDF).

Delivery Platform:
- Docusaurus documentation site
- Deployed via GitHub Pages or Vercel
- Structured for long-term maintenance and community contributions

Primary Toolchain:
- Spec-Kit Plus (spec-driven authoring, PHR preservation)
- Claude Code CLI (content generation and implementation)
- GitHub (version control, review, governance)

Final Output Vision:
A canonical reference for Physical AI and Humanoid Robotics that bridges:
- Digital AI → Embodied Intelligence
- Simulation → Real-world deployment
- Research → Engineering practice

────────────────────────────────────────
NON-NEGOTIABLE PHILOSOPHY
────────────────────────────────────────

This book MUST adhere to the following principles at all times:

1. Engineering Reality Over Abstraction
   - Explain how systems actually work in practice, including constraints, trade-offs, and failure modes.
   - Avoid marketing language, hype cycles, and speculative claims without evidence.

2. Textbook-Level Depth
   - Content must be written at the level of a serious undergraduate / early graduate engineering textbook.
   - Shallow summaries, bullet-only explanations, or "week-style" content are forbidden.

3. Physical AI First
   - All AI concepts must be grounded in physical embodiment:
     sensors, actuators, latency, power, noise, safety, and real-world physics.
   - Humanoid robots are the primary reference architecture unless explicitly stated otherwise.

4. Systems Thinking
   - Emphasize full-stack reasoning:
     perception → cognition → planning → control → actuation.
   - Readers should emerge capable of designing complete robotic systems, not isolated components.

5. Longevity & Evolvability
   - The book must remain relevant for years.
   - Content must be structured so that new hardware, models, and benchmarks can be added without rewriting foundations.

────────────────────────────────────────
STRUCTURAL MANDATES
────────────────────────────────────────

- The book is organized as:
- PARTS (Modules) → Weekly Breakdown → Weeks → Chapters → Sections
- Modules are NOT weeks.
- Weeks are learning roadmaps only and must never dictate chapter boundaries.
- Each module represents a coherent conceptual domain, not a time slice.

Every chapter MUST include:
- Conceptual explanation (intuition-first)
- Humanoid robotics context
- System-level architectural perspective
- Practical reasoning or design exercises
- Common failure modes and debugging insights
- Chapter summary
- MCQs for assessment
- Practice tasks (beginner → advanced)

────────────────────────────────────────
SOURCE & CITATION STANDARDS
────────────────────────────────────────

Citation Style:
- IEEE numeric style with inline clickable references
- DOI or direct URL required wherever available

Source Priority (descending):
1. Peer-reviewed venues (ICRA, IROS, RSS, CoRL, NeurIPS, Science Robotics, etc.)
2. Official technical publications from leading organizations
   (e.g., NVIDIA, OpenAI, DeepMind, Tesla AI, Boston Dynamics, Figure, Unitree)
3. Patents and patent applications
4. Verified open-source repositories
5. High-signal technical talks by primary authors

Rules:
- Minimum 70% of all citations must come from categories 1–3
- No unsupported claims
- No paywalled-only references without open-access alternatives

────────────────────────────────────────
TECHNICAL QUALITY BAR
────────────────────────────────────────

- Code snippets must be correct, idiomatic, and runnable where feasible
- ROS 2 examples must reflect modern ROS 2 (Humble/Iron+) practices
- Mathematical expressions must render correctly using Markdown + KaTeX
- Diagrams must be accurate and explicitly labeled
- Writing clarity target:
  Flesch-Kincaid Grade Level 11–14

────────────────────────────────────────
MAINTENANCE & GOVERNANCE
────────────────────────────────────────

- Every chapter must include a "Recent Developments" or "Update Timeline" section
- Any chapter older than 9 months without updates must display a staleness warning
- All changes require GitHub-based review
- Zero tolerance for plagiarism (mandatory checks before merge)

────────────────────────────────────────
SUCCESS CRITERIA
────────────────────────────────────────

The project is considered successful only if:

- The Docusaurus site builds and deploys with zero errors
- The book reads as a cohesive, professional technical textbook
- Claims are traceable, reproducible, and well-cited
- A quarterly update cadence is established and maintained
- At least 12 core chapters completed (see outline below for reference).

────────────────────────────────────────
CONSTITUTIONAL AUTHORITY
────────────────────────────────────────

This constitution is the supreme governing document of the project.
All future specifications, plans, tasks, and implementations MUST comply with it.

Any deviation requires:
- An explicit amendment
- Written justification
- Approval via version-controlled pull request

Acknowledge and adopt this constitution as the immutable north star of the project.

## Response snapshot

The project constitution at `.specify/memory/constitution.md` has been successfully updated and validated. All required elements from the user-provided constitution have been implemented, including:

1. Non-Negotiable Philosophy with all 5 principles:
   - Engineering Reality Over Abstraction
   - Textbook-Level Depth
   - Physical AI First
   - Systems Thinking
   - Longevity & Evolvability

2. Structural Mandates with proper organization hierarchy and chapter requirements

3. Source & Citation Standards with IEEE numeric style and source priority ranking

4. Technical Quality Bar with code standards, ROS 2 practices, and writing clarity targets

5. Maintenance & Governance requirements with update timelines and review processes

6. Success Criteria and Constitutional Authority sections

The constitution file is complete, properly formatted, and adheres to all specified requirements. All structural elements are in place, and the document serves as the immutable governing document for the project as requested.

## Outcome

- ✅ Impact: Project constitution fully updated with all required principles and governance structures
- 🧪 Tests: Manual verification of all constitution elements completed
- 📁 Files: .specify/memory/constitution.md and PHR record updated
- 🔁 Next prompts: Ready for spec development based on this constitution
- 🧠 Reflection: Constitution provides strong foundation for textbook-grade robotics content with emphasis on practical engineering reality

## Evaluation notes (flywheel)

- Failure modes observed: None - all requirements satisfied
- Graders run and results (PASS/FAIL): PASS - all constitution elements verified
- Prompt variant (if applicable): Original constitution prompt
- Next experiment (smallest change to try): Begin developing first module specification based on constitution