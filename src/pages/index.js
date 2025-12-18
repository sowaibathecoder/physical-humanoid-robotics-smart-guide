import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <h1 className={clsx('hero__title', styles.mainTitle)}>
            Mastering Physical AI &<br />Humanoid Robotics
          </h1>
          <p className={clsx('hero__subtitle', styles.mainSubtitle)}>The definitive guide to building intelligent humanoid robots with cutting-edge AI technology</p>
          <div className={styles.buttons}>
            <Link className="button button--secondary button--lg" to="/docs/intro">
              Begin Your Journey
            </Link>
            <Link className="button button--outline button--lg button--outline-special" to="/docs/part-1-foundations-of-physical-ai/weekly-breakdown/week-1/chapter-01-what-is-physical-ai">
              Explore Modules
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className={clsx('col col--4', styles.featureCard)}>
      <div className={styles.featureCardInner}>
        <div className={styles.featureIcon}>
          {icon}
        </div>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

function StatsSection() {
  return (
    <section className={styles.statsSection}>
      <div className="container">
        <div className="row">
          <div className="col col--3">
            <div className={styles.statItem}>
              <div className={styles.statNumber}>13</div>
              <div className={styles.statLabel}>Weeks Intensive</div>
            </div>
          </div>
          <div className="col col--3">
            <div className={styles.statItem}>
              <div className={styles.statNumber}>4</div>
              <div className={styles.statLabel}>Core Modules</div>
            </div>
          </div>
          <div className="col col--3">
            <div className={styles.statItem}>
              <div className={styles.statNumber}>800</div>
              <div className={styles.statLabel}>Budget (USD)</div>
            </div>
          </div>
          <div className="col col--3">
            <div className={styles.statItem}>
              <div className={styles.statNumber}>∞</div>
              <div className={styles.statLabel}>Possibilities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();

  const features = [
    {
      title: '📚 Part 1: Foundations of Physical AI',
      description: 'Understanding the fundamentals of Physical AI, sensors, perception, and the landscape of humanoid robotics.',
      icon: '📚'
    },
    {
      title: '🔌 Part 2: The ROS Nervous System (ROS2)',
      description: 'Master ROS 2, the industry-standard middleware that connects everything. Foundation of Physical AI and humanoid robotics.',
      icon: '🔌'
    },
    {
      title: '🎮 Part 3: Digital Twins & Simulation AI Robot Brain',
      description: 'Simulation environments with Gazebo, Isaac Sim, and Isaac ROS GEMs. Create intelligent decision-making for autonomous robots.',
      icon: '🎮'
    },
    {
      title: '🤖 Part 4: VLA Humanoid Systems',
      description: 'Vision-Language-Action models, voice-to-action pipelines, bipedal locomotion, manipulation, and conversational humanoids.',
      icon: '🤖'
    }
  ];

  return (
    <Layout
      title={`Mastering Physical AI & Humanoid Robotics`}
      description="The definitive guide to building intelligent humanoid robots with cutting-edge AI technology">
      <HomepageHeader />
      <StatsSection />
      <main>
        <section className={styles.featuresSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Course Modules</h2>
              <p className={styles.sectionSubtitle}>Comprehensive learning path designed for the future of robotics</p>
            </div>
            <div className="row">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to Shape the Future of Robotics?</h2>
              <p className={styles.ctaSubtitle}>Join thousands of students mastering the cutting-edge technology of Physical AI and humanoid robotics.</p>
              <div className={styles.ctaButtons}>
                <Link className="button button--primary button--lg" to="/docs/intro">
                  Start Learning Now
                </Link>
                <Link className="button button--outline button--lg" to="/docs/table-of-content/">
                  Explore Curriculum
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}