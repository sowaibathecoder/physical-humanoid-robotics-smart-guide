import React from 'react';
import clsx from 'clsx';
import styles from './ChapterMetadata.module.css';

/**
 * ChapterMetadata Component - Displays chapter metadata including version and staleness warning
 * @param {Object} props - Component properties
 * @param {string} props.chapterId - Unique chapter identifier
 * @param {string} props.lastUpdated - Date of last update (ISO format)
 * @param {boolean} props.stalenessWarning - Whether to show staleness warning
 * @param {string} props.version - Chapter version
 * @param {number} props.stalenessThreshold - Days after which to show warning (default 270 days = 9 months)
 */
function ChapterMetadata({
  chapterId,
  lastUpdated,
  stalenessWarning = false,
  version = '1.0.0',
  stalenessThreshold = 270 // 9 months in days
}) {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const lastUpdatedDate = new Date(lastUpdated);
  const today = new Date();
  const timeDiff = Math.abs(today - lastUpdatedDate);
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  const isStale = daysDiff > stalenessThreshold;

  return (
    <div className={styles.metadataContainer}>
      <div className={styles.metadataGrid}>
        <div className={styles.metadataItem}>
          <span className={styles.label}>Chapter ID:</span>
          <span className={styles.value}>{chapterId}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.label}>Version:</span>
          <span className={styles.value}>{version}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.label}>Last Updated:</span>
          <span className={styles.value}>{formatDate(lastUpdated)}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.label}>Age:</span>
          <span className={styles.value}>{daysDiff} days</span>
        </div>
      </div>

      {(isStale || stalenessWarning) && (
        <div className={clsx(styles.warningBanner, styles.stale)}>
          <div className={styles.warningIcon}>⚠️</div>
          <div className={styles.warningContent}>
            <strong>Content Review Needed:</strong> This chapter was last updated {formatDate(lastUpdated)} ({daysDiff} days ago).
            Content may be outdated. Please verify information is current before use.
          </div>
        </div>
      )}

      <div className={styles.updateSuggestion}>
        <p>
          Found an issue or outdated information?
          <a href="#" className={styles.updateLink}> Suggest an update</a>
        </p>
      </div>
    </div>
  );
}

export default ChapterMetadata;