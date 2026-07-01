'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './TheCraft.module.css';

/* ─── SVG Icons ─── */
function ShieldIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={styles.icon} aria-hidden="true">
      <path
        d="M32 6L10 18v16c0 14 10 22 22 26 12-4 22-12 22-26V18L32 6z"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M24 32l6 6 10-12"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={styles.icon} aria-hidden="true">
      <path
        d="M32 6L6 28l26 30 26-30L32 6z"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M6 28h52"
        stroke="#D4AF37"
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M22 6l-6 22 16 30 16-30-6-22"
        stroke="#D4AF37"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={styles.icon} aria-hidden="true">
      <path
        d="M20 36V20a3 3 0 0 1 6 0v12"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M26 28V16a3 3 0 0 1 6 0v16"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M32 28V18a3 3 0 0 1 6 0v14"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M38 30V24a3 3 0 0 1 6 0v12c0 10-6 18-16 18S14 46 14 40v-4a3 3 0 0 1 6 0"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CircuitIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={styles.icon} aria-hidden="true">
      <rect
        x="22"
        y="22"
        width="20"
        height="20"
        rx="2"
        stroke="#D4AF37"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="32" r="4" fill="#D4AF37" opacity="0.3" />
      {/* Circuit traces */}
      <line x1="32" y1="8" x2="32" y2="22" stroke="#D4AF37" strokeWidth="1" />
      <line x1="32" y1="42" x2="32" y2="56" stroke="#D4AF37" strokeWidth="1" />
      <line x1="8" y1="32" x2="22" y2="32" stroke="#D4AF37" strokeWidth="1" />
      <line x1="42" y1="32" x2="56" y2="32" stroke="#D4AF37" strokeWidth="1" />
      <circle cx="32" cy="8" r="2" fill="#D4AF37" opacity="0.5" />
      <circle cx="32" cy="56" r="2" fill="#D4AF37" opacity="0.5" />
      <circle cx="8" cy="32" r="2" fill="#D4AF37" opacity="0.5" />
      <circle cx="56" cy="32" r="2" fill="#D4AF37" opacity="0.5" />
    </svg>
  );
}

/* ─── Counter Hook ─── */
function useCountUp(target: number, isVisible: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isVisible || hasRun.current) return;
    hasRun.current = true;

    const startTime = performance.now();
    let rafId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease-out cubic */
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, target, duration]);

  return count;
}

/* ─── Main Component ─── */
export default function TheCraft() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [counterVisible, setCounterVisible] = useState(false);
  const criCount = useCountUp(90, counterVisible);

  useEffect(() => {
    const allTargets = [
      titleRef.current,
      ...itemsRef.current.filter(Boolean),
    ] as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = allTargets.indexOf(entry.target as HTMLElement);
            setTimeout(() => {
              entry.target.classList.add(styles.revealed);
            }, idx * 180);
            observer.unobserve(entry.target);

            /* Trigger counter if CRI item is visible (index 2 = second craft item) */
            if (idx === 2) {
              setCounterVisible(true);
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    allTargets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const craftItems = [
    {
      Icon: ShieldIcon,
      titleKey: 'theCraft.quality.title',
      descKey: 'theCraft.quality.desc',
      counter: null,
    },
    {
      Icon: DiamondIcon,
      titleKey: 'theCraft.cri.title',
      descKey: 'theCraft.cri.desc',
      counter: criCount,
    },
    {
      Icon: HandIcon,
      titleKey: 'theCraft.service.title',
      descKey: 'theCraft.service.desc',
      counter: null,
    },
    {
      Icon: CircuitIcon,
      titleKey: 'theCraft.systems.title',
      descKey: 'theCraft.systems.desc',
      counter: null,
    },
  ];

  return (
    <section ref={sectionRef} id="the-craft" className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div ref={titleRef} className={styles.header}>
          <h2 className={styles.title}>{t('theCraft.title')}</h2>
          <p className={styles.tagline}>{t('theCraft.tagline')}</p>
          <div className={styles.titleDivider} />
        </div>

        {/* Items Row */}
        <div className={styles.row}>
          {craftItems.map((item, idx) => (
            <div key={item.titleKey} className={styles.itemWrapper}>
              <div
                ref={(el) => { itemsRef.current[idx] = el; }}
                className={styles.item}
              >
                <div className={styles.iconWrapper}>
                  <item.Icon />
                </div>

                {item.counter !== null && (
                  <div className={styles.counterDisplay}>
                    <span className={styles.counterNumber}>{item.counter}</span>
                    <span className={styles.counterLabel}>CRI&gt;</span>
                  </div>
                )}

                <h3 className={styles.itemTitle}>{t(item.titleKey)}</h3>
                <p className={styles.itemDesc}>{t(item.descKey)}</p>
              </div>

              {/* Vertical divider between items (not after last) */}
              {idx < craftItems.length - 1 && (
                <div className={styles.verticalDivider} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
