'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './TheStudioFeature.module.css';

export default function TheStudioFeature() {
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

  return (
    <section ref={sectionRef} id="the-studio-feature" className={styles.section}>
      <div className={styles.container}>
        <h2 className={`${styles.title} ${styles.reveal}`}>
          Mi-KAI Light Studio
        </h2>
        
        <p className={`${styles.tagline} ${styles.reveal}`} style={{ transitionDelay: '0.2s' }}>
          Architectural Precision. Virtual Reality.
        </p>
        
        <p className={`${styles.description} ${styles.reveal}`} style={{ transitionDelay: '0.4s' }}>
          Experience the art of lighting before a single fixture is installed. 
          Our advanced 3D Light Studio allows you to visualize Mi-KAI luminaires 
          in meticulously simulated environments. Calculate lux values, preview 
          shadows, and generate professional DIALux-grade reports instantly.
        </p>

        <div className={`${styles.reveal}`} style={{ transitionDelay: '0.6s' }}>
          <Link href="/studio" className={styles.button}>
            Enter Light Studio
          </Link>
        </div>
      </div>
    </section>
  );
}
