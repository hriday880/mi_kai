'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './TheHouse.module.css';

const ToriiA = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    style={{ 
      height: '0.8em', 
      width: 'auto', 
      display: 'inline-block', 
      margin: '0 0.05em',
      transform: 'translateY(-0.02em)' 
    }}
  >
    {/* Top horizontal beam (kasagi) */}
    <rect x="0" y="3" width="24" height="2.5" />
    {/* Middle horizontal beam (nuki) */}
    <rect x="2" y="10" width="20" height="2" />
    {/* Left pillar */}
    <polygon points="7,3 9.5,3 6,22 3.5,22" />
    {/* Right pillar */}
    <polygon points="14.5,3 17,3 20.5,22 18,22" />
  </svg>
);

export default function TheHouse() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const elements = sectionRef.current?.querySelectorAll(`.${styles.reveal}`);
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const titleParts = t('theHouse.title').split('Mi-KAI');

  return (
    <section ref={sectionRef} id="the-house" className={styles.section}>
      {/* Subtle Kanji Watermark */}
      <div className={styles.kanjiWatermark} aria-hidden="true">
        光明
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Title & Tagline */}
          <div className={styles.titleColumn}>
            <div className={styles.stickyTitle}>
              <h2 className={`${styles.title} ${styles.reveal}`}>
                {titleParts.map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'baseline' }}>
                        Mi-K<ToriiA />I
                      </span>
                    )}
                  </span>
                ))}
              </h2>
              <div className={`${styles.titleDivider} ${styles.reveal}`} style={{ transitionDelay: '0.2s' }} />
              <p className={`${styles.tagline} ${styles.reveal}`} style={{ transitionDelay: '0.3s' }}>
                {t('theHouse.tagline')}
              </p>
            </div>
          </div>

          {/* Right Column: Editorial Paragraphs */}
          <div className={styles.textColumn}>
            <p className={`${styles.paragraph} ${styles.reveal}`} style={{ transitionDelay: '0.4s' }}>
              {t('theHouse.p1')}
            </p>
            <p className={`${styles.paragraph} ${styles.reveal}`} style={{ transitionDelay: '0.5s' }}>
              {t('theHouse.p2')}
            </p>
            <p className={`${styles.paragraph} ${styles.reveal}`} style={{ transitionDelay: '0.6s' }}>
              {t('theHouse.p3')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
