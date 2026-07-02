'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import styles from './LightSwitch.module.css';

export default function LightSwitch() {
  const pathname = usePathname();
  const [lightsOn, setLightsOn] = useState(false);
  const [pulling, setPulling] = useState(false);

  // Apply/remove the global class on <html>
  useEffect(() => {
    const html = document.documentElement;
    if (lightsOn) {
      html.classList.add('lights-on');
    } else {
      html.classList.remove('lights-on');
    }
  }, [lightsOn]);

  const handlePull = useCallback(() => {
    setPulling(true);
    // Wait for the pull animation to finish, then toggle
    setTimeout(() => {
      setLightsOn(prev => !prev);
      setPulling(false);
    }, 400);
  }, []);

  // Hide the pull cord on the product details pages where we have interactive light testing
  // MUST be placed after all React hooks (useState, useEffect, useCallback)
  if (pathname.match(/^\/catalogue\/.+/)) {
    return null;
  }

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
          {lightsOn ? 'OFF' : 'ON'}
        </span>
      </div>
    </div>
  );
}
