# Data Model: Physical AI & Humanoid Robotics Textbook

**Date**: 2025-12-16
**Feature**: 1-book-spec-physical-ai

## Overview

This document defines the data model for the Physical AI & Humanoid Robotics textbook platform. The model focuses on content organization and educational features while maintaining compliance with the project constitution and specification requirements.

## Core Entities

### Book
**Description**: The complete textbook containing all four parts

**Attributes**:
- `id` (string): Unique identifier for the book
- `title` (string): "Physical AI & Humanoid Robotics – Smart Guide"
- `version` (string): Current version following semantic versioning
- `lastUpdated` (date): Timestamp of last content update
- `parts` (array): References to Part entities (4 required)
- `tableOfContents` (object): Navigation structure
- `metadata` (object): Additional book-level information

**Validation Rules**:
- Must contain exactly 4 parts
- Title must match constitution specification
- Version must follow semantic versioning

### Part
**Description**: A major section of the textbook (one of the four required parts)

**Attributes**:
- `id` (string): Part identifier (P1, P2, P3, P4)
- `title` (string): Part title (e.g., "Foundations of Physical AI")
- `order` (integer): Sequential order (1-4)
- `chapters` (array): References to Chapter entities (2-4 required per part)
- `weeklyBreakdown` (object): Weekly organization structure
- `description` (string): Brief description of the part

**Relationships**:
- Belongs to: Book
- Contains: 2-4 Chapter entities

**Validation Rules**:
- Must have 2-4 chapters depending on part
- Title must match specification requirements
- Order must be sequential 1-4 across all parts

### Chapter
**Description**: Individual textbook chapters containing comprehensive content

**Attributes**:
- `id` (string): Unique chapter identifier (e.g., "P1-C01")
- `title` (string): Chapter title
- `partId` (string): Reference to parent Part
- `orderInPart` (integer): Chapter sequence within part (1-4)
- `content` (string): Markdown content of the chapter
- `learningObjectives` (array): 3-5 measurable learning outcomes
- `technicalContent` (object): Code snippets, diagrams, equations
- `practicalExamples` (array): Humanoid robotics context examples
- `systemPerspective` (string): Full-stack reasoning content
- `failureModes` (array): Common mistakes and debugging tips
- `exercises` (array): Practice tasks (beginner to advanced)
- `mcqs` (array): 10 multiple-choice questions with answers
- `chapterSummary` (string): Key takeaways
- `citations` (array): IEEE-style references
- `recentDevelopments` (string): Update timeline section
- `lastUpdated` (date): Timestamp of last update
- `stalenessWarning` (boolean): Flag if chapter is >9 months old without updates
- `difficultyLevel` (string): Beginner, Intermediate, or Advanced

**Relationships**:
- Belongs to: Part
- Contains: Multiple Exercise, MCQ, and Citation entities

**Validation Rules**:
- Must contain all 12 required sections as per constitution
- Learning objectives must be 3-5 measurable outcomes
- Must include 10 MCQs with answers
- Citations must follow IEEE numeric style
- Content must meet textbook depth requirements
- Must be flagged if >9 months old without updates

### Exercise
**Description**: Practice tasks associated with chapters

**Attributes**:
- `id` (string): Unique exercise identifier
- `chapterId` (string): Reference to parent Chapter
- `title` (string): Exercise title
- `description` (string): Detailed exercise instructions
- `difficulty` (string): "beginner", "intermediate", or "advanced"
- `type` (string): "conceptual", "applied", "scenario-based", or "mini-project"
- `instructions` (string): Step-by-step guidance
- `expectedOutcome` (string): What the exercise should demonstrate
- `solution` (string): Optional solution or guidance for instructors

**Relationships**:
- Belongs to: Chapter
- Referenced by: Assessment (optional)

**Validation Rules**:
- Difficulty must be one of the specified values
- Must have clear instructions and expected outcome
- Should progress from beginner to advanced within each chapter

### MCQ (Multiple Choice Question)
**Description**: Assessment questions for chapters

**Attributes**:
- `id` (string): Unique MCQ identifier
- `chapterId` (string): Reference to parent Chapter
- `question` (string): The question text
- `options` (array): Array of 4 answer options (A, B, C, D)
- `correctAnswer` (string): The correct option identifier (A, B, C, or D)
- `explanation` (string): Explanation of why the answer is correct
- `difficulty` (string): "beginner", "intermediate", or "advanced"

**Relationships**:
- Belongs to: Chapter
- Referenced by: Assessment (optional)

**Validation Rules**:
- Must have exactly 4 options per question
- Must have one correct answer
- Should have explanations for each answer
- Difficulty must match chapter content

### Citation
**Description**: Reference to external sources

**Attributes**:
- `id` (string): Unique citation identifier
- `chapterId` (string): Reference to parent Chapter
- `ieeeNumber` (integer): IEEE numeric reference number
- `type` (string): "academic-paper", "technical-publication", "patent", "open-source", or "talk"
- `title` (string): Title of the source
- `authors` (array): Array of author names
- `publication` (string): Journal, conference, or source name
- `date` (date): Publication date
- `url` (string): DOI or direct URL (required)
- `accessDate` (date): Date the source was accessed
- `category` (string): Category based on source priority (1-5 per constitution)

**Relationships**:
- Belongs to: Chapter

**Validation Rules**:
- At least 70% must be from categories 1-3 (per constitution)
- Must have valid DOI or URL
- Must follow IEEE numeric citation style
- No paywalled-only references without open-access alternatives

### Assessment
**Description**: Organized collection of exercises and questions for evaluation

**Attributes**:
- `id` (string): Unique assessment identifier
- `type` (string): "chapter-quiz", "module-project", "capstone-project", or "certification-exam"
- `title` (string): Assessment title
- `chapters` (array): Array of chapter IDs included
- `questions` (array): Array of MCQ IDs
- `exercises` (array): Array of Exercise IDs
- `timeLimit` (integer): Time limit in minutes (null if none)
- `passingScore` (integer): Minimum percentage required to pass
- `certificationEligible` (boolean): Whether this contributes to certification

**Relationships**:
- Contains: MCQ and Exercise entities
- Associated with: Multiple Chapter entities

**Validation Rules**:
- Must have appropriate mix of questions and exercises for type
- Passing score must be between 0-100
- Certification assessments must meet additional requirements

## State Transitions

### Chapter State Model
- `draft` → `review` → `published` → `archived`
- `published` chapters can transition to `stale` if >9 months without updates
- `stale` chapters require review before remaining in published state

### Assessment State Model
- `design` → `pilot` → `published` → `deprecated`
- Pilot assessments are used for testing before full publication

## Relationships Summary

```
Book (1) ─── contains ───> Part (4)
Part (4) ─── contains ───> Chapter (16 total)
Chapter (16) ─── contains ───> MCQ (160 total, 10 per chapter)
Chapter (16) ─── contains ───> Exercise (varies, multiple per chapter)
Chapter (16) ─── contains ───> Citation (varies, multiple per chapter)
Assessment ─── references ───> Chapter, MCQ, Exercise
```

## Indexes and Performance Considerations

### Required Indexes
- Chapter: `partId`, `orderInPart` (for navigation)
- Citation: `chapterId`, `category` (for validation)
- MCQ: `chapterId`, `difficulty` (for assessment building)
- Exercise: `chapterId`, `difficulty`, `type` (for practice organization)

### Performance Requirements
- Page load time under 3 seconds for any chapter
- Search functionality response under 1 second
- Assessment rendering under 2 seconds
- Service worker registration for offline access

## Compliance Verification

All entities comply with:
- ✅ Constitution structural mandates (PARTS → Weekly Breakdown → Chapters → Sections)
- ✅ Chapter requirements (all 12 sections present)
- ✅ Citation standards (IEEE style, 70%+ categories 1-3)
- ✅ Maintenance requirements (staleness warnings)
- ✅ Accessibility requirements (WCAG 2.1 AA)