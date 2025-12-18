import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './MCQ.module.css';

/**
 * MCQ Component - Renders a multiple choice question with interactive features
 * @param {Object} props - Component properties
 * @param {string} props.question - The question text
 * @param {Array} props.options - Array of option objects with text and isCorrect properties
 * @param {string} props.explanation - Explanation for the correct answer
 * @param {string} props.difficulty - Difficulty level (beginner, intermediate, advanced)
 */
function MCQ({ question, options, explanation, difficulty = 'intermediate' }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOptionSelect = (index) => {
    if (!submitted) {
      setSelectedOption(index);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowExplanation(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setShowExplanation(false);
  };

  const correctOptionIndex = options.findIndex(option => option.isCorrect);

  return (
    <div className={clsx(styles.mcqContainer, styles[difficulty])}>
      <div className={styles.questionSection}>
        <h4 className={styles.question}>{question}</h4>
        <div className={styles.options}>
          {options.map((option, index) => (
            <div
              key={index}
              className={clsx(
                styles.option,
                selectedOption === index && styles.selected,
                submitted && option.isCorrect && styles.correct,
                submitted && selectedOption === index && !option.isCorrect && styles.incorrect
              )}
              onClick={() => handleOptionSelect(index)}
            >
              <div className={styles.optionIndicator}>
                {String.fromCharCode(65 + index)}.{' '}
              </div>
              <div className={styles.optionText}>
                {option.text}
              </div>
              {submitted && option.isCorrect && (
                <div className={styles.correctIndicator}>✓</div>
              )}
              {submitted && selectedOption === index && !option.isCorrect && (
                <div className={styles.incorrectIndicator}>✗</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        {!submitted ? (
          <button
            className={clsx('button button--primary', styles.submitButton)}
            onClick={handleSubmit}
            disabled={selectedOption === null}
          >
            Submit Answer
          </button>
        ) : (
          <button
            className={clsx('button button--secondary', styles.resetButton)}
            onClick={handleReset}
          >
            Try Again
          </button>
        )}
      </div>

      {showExplanation && (
        <div className={styles.explanation}>
          <h5>Explanation:</h5>
          <p>{explanation}</p>
          {selectedOption !== correctOptionIndex && selectedOption !== null && (
            <p className={styles.feedback}>
              <strong>Correct Answer: </strong>
              {String.fromCharCode(65 + correctOptionIndex)}. {options[correctOptionIndex].text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default MCQ;