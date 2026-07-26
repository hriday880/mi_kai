'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import styles from './Navigation.module.css'; // Reusing navigation styles for consistency

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={styles.langBtn} aria-label="Toggle theme">
        <span style={{ visibility: 'hidden' }}>☼</span>
      </button>
    );
  }

  const isLight = resolvedTheme === 'light';

  return (
    <button
      className={`${styles.langBtn} ${isLight ? styles.langActive : ''}`}
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      type="button"
      aria-label="Toggle theme"
      title="Toggle Light/Dark Mode"
      style={{ padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {isLight ? '☾' : '☼'}
    </button>
  );
}
