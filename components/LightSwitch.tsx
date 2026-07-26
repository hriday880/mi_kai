'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import styles from './LightSwitch.module.css';

export default function LightSwitch() {
  const pathname = usePathname();
  const [pulling, setPulling] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const lightsOn = mounted && resolvedTheme === 'light';

  const handlePull = useCallback(() => {
    setPulling(true);
    // Wait for the pull animation to finish, then toggle
    setTimeout(() => {
      setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
      setPulling(false);
    }, 400);
  }, [resolvedTheme, setTheme]);

  // Hide the pull cord on the product details pages where we have interactive light testing
  // MUST be placed after all React hooks (useState, useEffect, useCallback)
  if (pathname.match(/^\/catalogue\/.+/)) {
    return null;
  }

  // Prevent hydration mismatch by not rendering the interactive parts until mounted
  // or at least wait to determine the correct label
  const label = lightsOn ? 'OFF' : 'ON';

  return (
    <div className={styles.switchContainer}>
      {/* The cord */}
      <div
        className={`${styles.cord} ${pulling ? styles.cordPulled : ''}`}
        onClick={handlePull}
        role="button"
        aria-label={lightsOn ? 'Turn lights off' : 'Turn lights on'}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePull(); }}
      >
        {/* Thread line */}
        <div className={styles.thread} />

        {/* The bead/pull at the end */}
        <div className={styles.bead}>
          <div className={`${styles.beadGlow} ${lightsOn ? styles.beadGlowOn : ''}`} />
        </div>

        {/* Tiny label */}
        <span className={styles.label}>
          {mounted ? label : '...'}
        </span>
      </div>
    </div>
  );
}
