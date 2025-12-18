import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './Exercise.module.css';

/**
 * Exercise Component - Renders an interactive exercise with difficulty levels
 * @param {Object} props - Component properties
 * @param {string} props.title - Title of the exercise
 * @param {string} props.description - Description of the exercise
 * @param {string} props.instructions - Step-by-step instructions
 * @param {string} props.expectedOutcome - What the exercise should demonstrate
 * @param {string} props.difficulty - Difficulty level (beginner, intermediate, advanced)
 * @param {string} props.type - Type of exercise (conceptual, applied, scenario-based, mini-project)
 * @param {string} props.solution - Optional solution or guidance for instructors
 */
function Exercise({
  title,
  description,
  instructions,
  expectedOutcome,
  difficulty = 'intermediate',
  type = 'applied',
  solution
}) {
  const [expandedSolution, setExpandedSolution] = useState(false);

  const getDifficultyColor = () => {
    switch(difficulty) {
      case 'beginner': return '#4caf50';
      case 'intermediate': return '#ff9800';
      case 'advanced': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getTypeLabel = () => {
    switch(type) {
      case 'conceptual': return 'Conceptual';
      case 'applied': return 'Applied';
      case 'scenario-based': return 'Scenario-based';
      case 'mini-project': return 'Mini-project';
      default: return type;
    }
  };

  return (
    <div className={clsx(styles.exerciseContainer, styles[difficulty])}>
      <div className={styles.header}>
        <h4 className={styles.title}>{title}</h4>
        <div className={styles.meta}>
          <span className={clsx(styles.difficulty, styles[difficulty])}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
          <span className={styles.type}>
            {getTypeLabel()}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.description}>
          <h5>Description</h5>
          <p>{description}</p>
        </div>

        <div className={styles.instructions}>
          <h5>Instructions</h5>
          <ol>
            {instructions.split('\n').filter(line => line.trim()).map((line, index) => (
              <li key={index}>{line.trim()}</li>
            ))}
          </ol>
        </div>

        <div className={styles.expectedOutcome}>
          <h5>Expected Outcome</h5>
          <p>{expectedOutcome}</p>
        </div>
      </div>

      {solution && (
        <div className={styles.solutionSection}>
          <button
            className={clsx('button button--secondary button--sm', styles.solutionButton)}
            onClick={() => setExpandedSolution(!expandedSolution)}
          >
            {expandedSolution ? 'Hide Solution' : 'Show Solution'}
          </button>

          {expandedSolution && (
            <div className={styles.solutionContent}>
              <h5>Solution</h5>
              <div className={styles.solutionText}>
                {solution}
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.statusTracker}>
        <div className={styles.statusButtons}>
          <button className={clsx('button button--outline button--sm', styles.statusButton)}>
            Not Started
          </button>
          <button className={clsx('button button--outline button--sm', styles.statusButton)}>
            In Progress
          </button>
          <button className={clsx('button button--outline button--sm', styles.statusButton)}>
            Completed
          </button>
        </div>
      </div>
    </div>
  );
}

export default Exercise;