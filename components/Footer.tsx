'use client';

import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.topBorder} />
      
      <div className={styles.container}>
        <div className={styles.logoContainer} onClick={scrollToTop}>
          <Image 
            src="/logo-gold.svg" 
            alt="Mi-KAI Tokyo" 
            width={150} 
            height={50} 
            className={styles.logo} 
          />
        </div>
        
        <p className={styles.tagline}>{t('footer.tagline')}</p>
        
        <div className={styles.divider} />
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>{t('footer.copyright')}</p>
          <div className={styles.links}>
            <span className={styles.link}>Privacy Policy</span>
            <span className={styles.separator}>|</span>
            <span className={styles.link}>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
