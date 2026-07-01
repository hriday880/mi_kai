'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './TheExperience.module.css';

/* ─── SVG Icons ─── */
function CRIIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={styles.icon} aria-hidden="true">
      <circle cx="32" cy="32" r="14" stroke="#D4AF37" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="6" fill="#D4AF37" opacity="0.3" />
      {/* Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="32"
          y1="12"
          x2="32"
          y2="6"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={styles.icon} aria-hidden="true">
      <path
        d="M8 32s8-16 24-16 24 16 24 16-8 16-24 16S8 32 8 32z"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="8" stroke="#D4AF37" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="3" fill="#D4AF37" opacity="0.4" />
    </svg>
  );
}

function CircadianIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={styles.icon} aria-hidden="true">
      {/* Sun half */}
      <path
        d="M32 16a16 16 0 0 1 0 32"
        stroke="#D4AF37"
        strokeWidth="1.5"
      />
      {/* Moon half */}
      <path
        d="M32 16a16 16 0 0 0 0 32"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      {/* Sun rays on right */}
      {[0, 60, 120].map((deg) => (
        <line
          key={deg}
          x1="52"
          y1="32"
          x2="58"
          y2="32"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
    </svg>
  );
}

function InfinityIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={styles.icon} aria-hidden="true">
      <path
        d="M20 32c0-5.5 3.5-10 8-10s8 4.5 8 10-3.5 10-8 10-8-4.5-8-10z"
        stroke="#D4AF37"
        strokeWidth="1.5"
      />
      <path
        d="M36 32c0-5.5 3.5-10 8-10s8 4.5 8 10-3.5 10-8 10-8-4.5-8-10z"
        stroke="#D4AF37"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ─── Main Component ─── */
export default function TheExperience() {
  const { t } = useLanguage();
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targets = [
      titleRef.current,
      ...cardsRef.current.filter(Boolean),
    ] as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = targets.indexOf(entry.target as HTMLElement);
            /* Stagger by index */
            setTimeout(() => {
              entry.target.classList.add(styles.revealed);
            }, idx * 150);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      Icon: CRIIcon,
      titleKey: 'theExperience.cri.title',
      subtitleKey: 'theExperience.cri.subtitle',
      descKey: 'theExperience.cri.desc',
    },
    {
      Icon: EyeIcon,
      titleKey: 'theExperience.glareFree.title',
      descKey: 'theExperience.glareFree.desc',
    },
    {
      Icon: CircadianIcon,
      titleKey: 'theExperience.circadian.title',
      descKey: 'theExperience.circadian.desc',
    },
    {
      Icon: InfinityIcon,
      titleKey: 'theExperience.longevity.title',
      descKey: 'theExperience.longevity.desc',
    },
  ];

  return (
    <section id="the-experience" className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div ref={titleRef} className={styles.header}>
          <h2 className={styles.title}>{t('theExperience.title')}</h2>
          <p className={styles.tagline}>{t('theExperience.tagline')}</p>
          <div className={styles.titleDivider} />
        </div>

        {/* Cards Grid */}
        <div className={styles.grid}>
          {features.map((feature, idx) => (
            <div
              key={feature.titleKey}
              ref={(el) => { cardsRef.current[idx] = el; }}
              className={styles.card}
            >
              <div className={styles.cardIcon}>
                <feature.Icon />
              </div>
              <h3 className={styles.cardTitle}>{t(feature.titleKey)}</h3>
              {feature.subtitleKey && (
                <span className={styles.badge}>{t(feature.subtitleKey)}</span>
              )}
              <p className={styles.cardDesc}>{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
