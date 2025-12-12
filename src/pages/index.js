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
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link className="button button--secondary button--lg" to="/docs/intro">
              Begin Your Journey
            </Link>
            <Link className="button button--outline button--lg" to="/docs/module-1-the-robotic-nervous-system/week-1-foundations-of-physical-ai">
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
      title: '🤖 Module 1: The Robotic Nervous System',
      description: 'Master ROS 2, the industry-standard middleware that connects everything. Foundation of Physical AI and humanoid robotics.',
      icon: '🤖'
    },
    {
      title: '🌐 Module 2: The Digital Twin',
      description: 'Simulation environments with Gazebo Ignition and Unity ROS TCP Connector. Create digital replicas of your robots.',
      icon: '🌐'
    },
    {
      title: '🧠 Module 3: The AI-Robot Brain',
      description: 'NVIDIA Isaac Sim, Isaac ROS GEMs, and Navigation2 SMAC Planner. Intelligent decision-making for autonomous robots.',
      icon: '🧠'
    },
    {
      title: '👁️ Module 4: Vision-Language-Action Models',
      description: 'OpenVLA, RT-2X, Octo, and final capstone project. Advanced AI models that understand and interact with the world.',
      icon: '👁️'
    },
    {
      title: '⚡ Hardware Integration',
      description: 'Designed for Jetson Orin Nano, Ubuntu 22.04, and AWS g5/g6 instances. Real-world deployment scenarios.',
      icon: '⚡'
    },
    {
      title: '🎓 Capstone Project',
      description: 'Build fully autonomous humanoid robots that accept voice commands, understand intent, plan, navigate, and manipulate objects.',
      icon: '🎓'
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
                <Link className="button button--outline button--lg" to="/docs/module-1-the-robotic-nervous-system/week-1-foundations-of-physical-ai">
                  View Curriculum
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}