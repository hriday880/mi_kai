'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage, type Lang } from '@/lib/LanguageContext';
import styles from './Navigation.module.css';
import logoGold from '@/public/logo-gold.svg';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const isInnerPage = pathname !== '/';

  const { t, lang, setLang } = useLanguage();
  const [visible, setVisible] = useState(isInnerPage);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const navLinks = [
    { key: 'nav.catalogue', href: '/catalogue', isExternal: true },
    { key: 'nav.studio', href: '/studio', isExternal: true },
    { key: 'nav.theHouse', href: '#the-house' },
    { key: 'nav.theExperience', href: '#the-experience' },
    { key: 'nav.theCraft', href: '#the-craft' },
    { key: 'nav.theLiving', href: '#the-living' },
  ];

  useEffect(() => {
    if (isInnerPage) {
      setVisible(true);
      return;
    }
    
    const handleScroll = () => {
      // Show immediately or after a tiny scroll so it doesn't conflict with intro,
      // but since intro is an overlay, we can just show it when scrolled even 10px.
      setVisible(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    // Also force it to be visible after 3 seconds in case they don't scroll
    const timeout = setTimeout(() => setVisible(true), 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, [isInnerPage]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleNavClick = useCallback(
    (href: string, isExternal?: boolean) => {
      setMobileOpen(false);
      
      if (isExternal) {
        router.push(href);
        return;
      }
      
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback: If hash not found on current page, redirect to home page with hash
        router.push(`/${href}`);
      }
    },
    [router]
  );

  const languages: Lang[] = ['en', 'jp', 'cn'];

  return (
    <>
      <nav
        ref={navRef}
        className={`${styles.nav} ${visible ? styles.visible : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logoLink} aria-label="Mi-KAI Tokyo Home">
            <Image
              src={logoGold}
              alt="Mi-KAI Tokyo"
              width={120}
              height={40}
              className={styles.logo}
              priority
            />
          </Link>

          {/* Desktop links - always visible */}
          <ul className={styles.links}>
            {navLinks.map((link) => (
              <li key={link.key}>
                <button
                  className={styles.navLink}
                  onClick={() => handleNavClick(link.href, link.isExternal)}
                  type="button"
                >
                  {t(link.key)}
                </button>
              </li>
            ))}
          </ul>

          {/* Right section */}
          <div className={styles.right}>
            {/* Language switcher */}
            <div className={styles.langSwitcher} role="group" aria-label="Language switcher">
              {languages.map((l, i) => (
                <span key={l}>
                  <button
                    className={`${styles.langBtn} ${lang === l ? styles.langActive : ''}`}
                    onClick={() => setLang(l)}
                    type="button"
                    aria-label={`Switch to ${l.toUpperCase()}`}
                  >
                    {l.toUpperCase()}
                  </button>
                  {i < languages.length - 1 && (
                    <span className={styles.langDivider}>|</span>
                  )}
                </span>
              ))}
            </div>

            {/* Contact CTA */}
            <Link href="/contact" className={styles.contactBtn}>
              {t('nav.contact')}
            </Link>

            {/* Hamburger */}
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
              onClick={() => setMobileOpen((prev) => !prev)}
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className={styles.bar} />
              <span className={styles.bar} />
              <span className={styles.bar} />
            </button>
          </div>
        </div>

        {/* Gold accent line */}
        <div className={styles.accentLine} />
      </nav>

      {/* Floating Back Button for Inner Pages - MUST be outside the transformed nav tag */}
      {isInnerPage && (
        <button 
          className={styles.navBackBtn} 
          onClick={() => router.back()}
          type="button"
          aria-label="Go back"
        >
          &larr; {t('nav.back')}
        </button>
      )}

      {/* Mobile drawer overlay */}
      <div
        className={`${styles.overlay} ${mobileOpen ? styles.overlayVisible : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        className={`${styles.drawer} ${mobileOpen ? styles.drawerOpen : ''}`}
        aria-label="Mobile navigation"
      >
        <ul className={styles.drawerLinks}>
          {navLinks.map((link) => (
            <li key={link.key}>
              <button
                className={styles.drawerLink}
                onClick={() => handleNavClick(link.href, link.isExternal)}
                type="button"
              >
                {t(link.key)}
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.drawerLang}>
          {languages.map((l, i) => (
            <span key={l}>
              <button
                className={`${styles.langBtn} ${lang === l ? styles.langActive : ''}`}
                onClick={() => setLang(l)}
                type="button"
              >
                {l.toUpperCase()}
              </button>
              {i < languages.length - 1 && (
                <span className={styles.langDivider}>|</span>
              )}
            </span>
          ))}
        </div>

        <Link
          href="/contact"
          className={styles.drawerContact}
          onClick={() => setMobileOpen(false)}
        >
          {t('nav.contact')}
        </Link>
      </aside>
    </>
  );
}
