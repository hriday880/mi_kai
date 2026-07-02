'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './Footer.module.css';
import logoGold from '@/public/logo-gold.svg';

export default function Footer() {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.topBorder} />
      
      <div className={styles.container}>
        <div 
          className={styles.logoContainer} 
          onClick={scrollToTop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              scrollToTop();
            }
          }}
          aria-label="Scroll to top"
        >
          <Image 
            src={logoGold} 
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
            <Link href="#" className={styles.link}>{t('footer.privacy')}</Link>
            <span className={styles.separator}>|</span>
            <Link href="#" className={styles.link}>{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
