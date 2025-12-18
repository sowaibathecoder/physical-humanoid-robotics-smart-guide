---
id: 1
title: Update Project Constitution
stage: constitution
date: 2025-12-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: [constitution,documentation,setup]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

```text
/sp.constitution # Project Constitution: Physical AI & Humanoid Robotics Smart Guide (Book)

## Project Overview
**Book Title**: Mastering Physical AI & Humanoid Robotics
**Delivery Platform**: Docusaurus website deployed via GitHub Pages
**Tooling**: Spec-Kit Plus + Claude Code
**Final Output**: A living, open-source, continuously updated online book (not a static PDF)

## Core Principles

- Technical accuracy grounded in the latest research, real-world implementations, and primary sources (arXiv preprints, conference papers, official company releases, patents, open-source repositories, and verified technical blogs from practitioners).
- Engineering-first mindset: prioritize how things actually work over hype or marketing narratives.
- Clarity and accessibility for readers with a computer science/engineering background while remaining approachable to motivated learners.
- Future-proof and updatable: the book must be structured so new developments (e.g., new models, hardware releases, benchmarks) can be added seamlessly without breaking existing content.
- Radical transparency: every major claim must be traceable; code snippets, math, and experiments should be reproducible where possible.

## Key Standards

- Citation style: IEEE numeric style with clickable links (preferred for technical web books); include DOI or direct URL whenever available.
- Source priority order:
  1. Peer-reviewed papers (ICRA, IROS, RSS, CoRL, NeurIPS, Science Robotics, etc.)
  2. Official technical reports/blogs from leading labs and companies (Tesla AI, Figure, Boston Dynamics, Google DeepMind, OpenAI, Anthropic, Agility Robotics, 1X, Apptronik, etc.)
  3. Patents and patent applications
  4. Verified GitHub repositories and open-source codebases
  5. High-signal technical YouTube breakdowns or conference talks by primary researchers
- Minimum 70% of cited sources must be from categories 1–3 above.
- Every chapter must include a "Recent Developments" or "Timeline" section that can be updated quarterly.
- Code snippets (Python, ROS2, MuJoCo, PyTorch, etc.) must be tested and functional where feasible.
- Math and equations rendered correctly using markdown + LaTeX (KaTeX).
- Writing clarity target: Flesch-Kincaid Grade Level 11–14 (advanced undergraduate to early graduate).

## Constraints

- Written and maintained exclusively using Spec-Kit Plus workflow (specs → constitution → outline → chapters).
- All content lives in markdown files under `/docs/` in the Docusaurus structure.
- Images/diagrams: either generated via Spec-Kit Plus prompts or sourced with clear licensing (prefer CC0 or explicitly allowed).
- No paywalled content without providing an open-access alternative or archived link.
- Maximum staleness: any chapter older than 9 months without updates must be flagged with a visible banner.

## Success Criteria

- Book successfully builds and deploys via GitHub Pages or Vercel with zero errors.
- At least 12 core chapters completed (see outline below for reference).
- Every factual claim about performance, architecture, or timelines has a working hyperlink to its source.
- Zero plagiarism (checked via Copyleaks/GitGuardian or equivalent before merge).
- At least 150 total citations across the book at launch, with >100 being peer-reviewed or primary sources.
- Site achieves Lighthouse scores: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- Community contribution guide exists and at least one external PR merged within 60 days of launch.
- Quarterly update cadence established and first post-launch update completed on schedule.

This constitution serves as the immutable north star for the entire book project. Any deviation requires explicit amendment to this document and approval via pull request.
```

## Response snapshot

Updated the project constitution at .specify/memory/constitution.md with the content for the Physical AI & Humanoid Robotics Smart Guide project, replacing the template placeholders with actual project-specific content.

## Outcome

- ✅ Impact: Updated project constitution with specific content for Physical AI & Humanoid Robotics Smart Guide
- 🧪 Tests: none
- 📁 Files: .specify/memory/constitution.md
- 🔁 Next prompts: none needed
- 🧠 Reflection: Successfully replaced the template constitution with project-specific content

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): not applicable
- Prompt variant (if applicable): not applicable
- Next experiment (smallest change to try): not applicable