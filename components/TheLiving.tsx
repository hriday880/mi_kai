'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './TheLiving.module.css';

import bedroomImg from '@/public/images/bedroom.jpg';
import livingImg from '@/public/images/living.jpg';
import workspaceImg from '@/public/images/workspace.jpg';

import DynamicLightImage from './DynamicLightImage';

export default function TheLiving() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealActive);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll(`.${styles.reveal}`);
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="the-living" className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={`${styles.title} ${styles.reveal}`}>{t('theLiving.title')}</h2>
          <p className={`${styles.tagline} ${styles.reveal}`}>{t('theLiving.tagline')}</p>
          <div className={`${styles.divider} ${styles.reveal}`} />
          <p className={`${styles.desc} ${styles.reveal}`}>{t('theLiving.desc')}</p>
        </div>

        <div className={styles.grid}>
          {/* Bedroom Card */}
          <div className={`${styles.card} ${styles.reveal}`}>
            <div className={styles.imagePlaceholder}>
              <DynamicLightImage src={bedroomImg.src} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{t('theLiving.bedroom')}</h3>
            </div>
            <div className={styles.cardBorder} />
          </div>

          {/* Living Room Card */}
          <div className={`${styles.card} ${styles.reveal}`} style={{ transitionDelay: '0.1s' }}>
            <div className={styles.imagePlaceholder}>
              <DynamicLightImage src={livingImg.src} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{t('theLiving.living')}</h3>
            </div>
            <div className={styles.cardBorder} />
          </div>

          {/* Workspace Card */}
          <div className={`${styles.card} ${styles.reveal}`} style={{ transitionDelay: '0.2s' }}>
            <div className={styles.imagePlaceholder}>
              <DynamicLightImage src={workspaceImg.src} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{t('theLiving.workspace')}</h3>
            </div>
            <div className={styles.cardBorder} />
          </div>
        </div>
      </div>
    </section>
  );
}
