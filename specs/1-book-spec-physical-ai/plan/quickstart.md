# Quickstart Guide: Physical AI & Humanoid Robotics Textbook

**Date**: 2025-12-16
**Feature**: 1-book-spec-physical-ai

## Overview

This quickstart guide provides the essential steps to begin implementing the Physical AI & Humanoid Robotics textbook project. Follow these steps to set up the development environment and initial project structure.

## Prerequisites

- Node.js (v18 or higher)
- Git
- GitHub account
- Ubuntu 22.04 (or equivalent for ROS 2 development)
- Basic knowledge of Markdown and Docusaurus

## Step 1: Environment Setup

### Install Node.js and Dependencies
```bash
# Install Node.js (version 18 or higher)
# Using nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Docusaurus globally
npm install -g @docusaurus/core@latest
```

### Clone the Repository
```bash
git clone <repository-url>
cd <repository-name>
```

### Install Project Dependencies
```bash
npm install
```

## Step 2: Initialize Docusaurus Project

### Create Initial Structure
```bash
# Initialize Docusaurus (if not already done)
npx create-docusaurus@latest website classic

# The structure will be automatically created based on the implementation plan
```

### Configure Docusaurus
1. Update `docusaurus.config.js` with the textbook configuration
2. Update `sidebars.js` with the book structure (4 parts, 16 chapters)
3. Add custom components for assessments and textbook features

## Step 3: Set Up the Book Structure

### Create Directories
The following directory structure will be created automatically:

```
docs/
├── part-1-foundations-of-physical-ai/
│   └── weekly-breakdown/
│       └── chapters/
├── part-2-robotic-nervous-system/
│   └── weekly-breakdown/
│       └── chapters/
├── part-3-digital-twins-simulation/
│   └── weekly-breakdown/
│       └── chapters/
├── part-4-vla-humanoid-systems/
│   └── weekly-breakdown/
│       └── chapters/
└── table-of-contents/
```

### Initial Chapter Template
Create the first chapter using this template:

```markdown
---
id: chapter-01-what-is-physical-ai
title: Chapter 01: What is Physical AI
sidebar_position: 1
---

# Chapter 01: What is Physical AI

## Learning Objectives
- Define Physical AI and distinguish it from digital AI
- Understand the core principles of embodied intelligence
- Identify key challenges in Physical AI systems

## Conceptual Explanation
[Provide intuition-first explanation of Physical AI concepts]

## Technical Content
[Include diagrams, equations, and technical details]

## Practical Examples / Humanoid Context
[Real-world examples with humanoid robotics applications]

## System-Level Architecture Perspective
[Full-stack reasoning: perception → cognition → planning → control → actuation]

## Practical Reasoning / Design Thinking
[Step-by-step design considerations]

## Failure Modes & Debugging Tips
[Common mistakes and troubleshooting steps]

## Exercises
[Beginner to advanced exercises]

## MCQs
1. [Question 1 with 4 options]
2. [Question 2 with 4 options]
[... continue for 10 MCQs total]

## Chapter Summary
[Key takeaways and concept reinforcement]

## Citations
[IEEE-style references with clickable URLs]

## Recent Developments
[Update timeline and recent advances in the field]
```

## Step 4: Set Up Development Workflow

### GitHub Actions Configuration
Create the following workflow files in `.github/workflows/`:

1. `markdown-lint.yml` - Lint all markdown files
2. `link-validation.yml` - Check for broken links
3. `lighthouse-ci.yml` - Performance and accessibility checks
4. `deploy.yml` - Deploy to GitHub Pages

### Local Development
```bash
# Start local development server
npm start

# Build the site
npm run build

# Serve the built site locally
npm run serve
```

## Step 5: Content Creation Guidelines

### Chapter Requirements
Each chapter must include all 12 required sections:
1. Chapter ID & Title
2. Learning Objectives (3-5 measurable outcomes)
3. Conceptual Explanation (intuition-first)
4. Technical Content (diagrams, code, equations)
5. Practical Examples (humanoid context)
6. System-Level Architecture Perspective (full-stack reasoning)
7. Practical Reasoning (design considerations)
8. Failure Modes & Debugging Tips
9. Exercises (beginner to advanced)
10. MCQs (10 questions with answers)
11. Chapter Summary
12. Citations (IEEE style)

### Citation Standards
- Follow IEEE numeric style
- At least 70% of citations from categories 1-3 (per constitution)
- Include DOI or direct URL for all sources
- Verify open-access alternatives for paywalled content

### Technical Content Standards
- ROS 2 examples must be Humble/Iron compliant
- Code snippets must be runnable on Ubuntu 22.04
- Mathematical expressions must render with KaTeX
- Diagrams must be accurate and explicitly labeled

## Step 6: Quality Assurance

### Automated Checks
- Run `npm run lint` to check for markdown issues
- Verify all links are valid
- Ensure accessibility compliance (WCAG 2.1 AA)
- Check that build completes without errors

### Manual Review
- Verify content depth meets textbook standards
- Confirm all 12 chapter sections are present
- Check that humanoid context is appropriately included
- Validate system-level architecture perspective

## Next Steps

1. Begin with Part I: Foundations of Physical AI
2. Create Chapter 01: What is Physical AI
3. Implement the Docusaurus configuration
4. Set up GitHub Actions for automated validation
5. Begin content creation following the chapter template

## Troubleshooting

### Common Issues
- **Build errors**: Check that all required frontmatter is present
- **Link errors**: Verify all internal links use proper Docusaurus syntax
- **Rendering issues**: Ensure KaTeX and Mermaid are properly configured

### Getting Help
- Review the implementation plan in `specs/1-book-spec-physical-ai/plan/`
- Check the constitution for any compliance questions
- Refer to the specification for detailed requirements