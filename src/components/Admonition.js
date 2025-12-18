import React from 'react';
import clsx from 'clsx';
import styles from './Admonition.module.css';

/**
 * Admonition Component - Renders styled content blocks for key concepts, warnings, and exercises
 * @param {Object} props - Component properties
 * @param {string} props.type - Type of admonition (tip, note, caution, danger, concept, exercise)
 * @param {string} props.title - Title for the admonition
 * @param {ReactNode} props.children - Content of the admonition
 */
function Admonition({ type = 'note', title, children }) {
  const iconMap = {
    tip: '💡',
    note: '📝',
    caution: '⚠️',
    danger: '🚨',
    concept: '🎯',
    exercise: '🏋️'
  };

  const icon = iconMap[type] || iconMap.note;
  const displayTitle = title || type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className={clsx(styles.admonition, styles[type])}>
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.title}>{displayTitle}</span>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

export default Admonition;