'use client';

import { useState } from 'react';
import ImageWithLoading from '@/components/ImageWithLoading';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './page.module.css';

// We define the Product type based on what we need from products.json
type Product = {
  id: string;
  category: string;
  finishes: { id: string; name: string; hex: string }[];
  specifications: { wattage: string; size: string; cutOut: string; beamAngle: string }[];
  media: { video?: string; thumbnail: string; technicalDrawing: string };
};

export default function ProductClient({ product }: { product: Product }) {
  const { t } = useLanguage();
  const [activeFinish, setActiveFinish] = useState(product.finishes[0] || null);
  const [activeSpecIndex, setActiveSpecIndex] = useState<number | null>(null);
  const [panX, setPanX] = useState(50);

  const activeSpec = activeSpecIndex !== null ? product.specifications[activeSpecIndex] : null;

  // Calculate light properties based on wattage, finish, and beam angle
  const getLightStyles = () => {
    if (!activeSpec) return { opacity: 0, '--light-tint': activeFinish?.hex || '#FFF0DC' } as React.CSSProperties;
    
    const wattageNum = parseInt(activeSpec.wattage);
    // Max wattage is 18, base opacity scales up
    const intensity = Math.min((wattageNum / 18) * 0.85 + 0.15, 1);
    
    return {
      opacity: intensity,
      '--light-tint': activeFinish?.hex || '#FFF0DC',
      '--beam-angle': `${activeSpec.beamAngle}deg`,
      '--pan-x': `${panX}%`
    } as React.CSSProperties;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    x = Math.max(0, Math.min(100, x));
    setPanX(x);
  };

  const handlePointerLeave = () => {
    setPanX(50); // reset to center when leaving
  };

  return (
    <main className={styles.main}>
      {/* Hero Image */}
      <section className={styles.heroSection}>
        <div className={styles.imageWrapper}>
          <ImageWithLoading 
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/products/${product.id}-main.png`}
            alt={`Product ${product.id}`}
            fill
            className={styles.heroImage}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </section>

      {/* Specifications Content */}
      <section className={styles.contentSection}>
        <div className={styles.container}>
          
          <div className={styles.header}>
            <h1 className="text-heading text-4xl text-bright">#{product.id}</h1>
            <span className={styles.category}>{t(`categories.${product.category}`)}</span>
          </div>
          
          {/* Interactive Testing Chamber */}
          <div className={styles.chamberWrapper}>
            <div 
              className={styles.testingChamber}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              style={getLightStyles()}
            >
              <div className={styles.chamberInstruction}>
                {activeSpec ? t('product.chamber.active') || 'Interact to see light cast' : t('product.chamber.inactive') || 'Turn on a switch below to test light'}
              </div>
              
              <div className={styles.lightSource} style={{ left: `${panX}%` }}>
                <div className={`${styles.lightCone} ${activeSpec ? styles.lightConeActive : ''}`} />
              </div>
              
              <div className={styles.chamberFloor}>
                <div className={`${styles.floorHighlight} ${activeSpec ? styles.floorHighlightActive : ''}`} style={{ left: `${panX}%` }} />
              </div>
            </div>
          </div>

          <div className={styles.grid}>
            {/* Finishes */}
            <div className={styles.finishesSection}>
              <h2 className="text-heading text-xl text-bright mb-6">{t('product.finishes')}</h2>
              <div className={styles.swatchList}>
                {product.finishes.map((finish) => (
                  <button 
                    key={finish.id} 
                    className={`${styles.swatchItem} ${activeFinish?.id === finish.id ? styles.activeSwatch : ''}`}
                    onClick={() => setActiveFinish(finish)}
                  >
                    <div 
                      className={styles.swatchCircle} 
                      style={{ background: finish.hex }}
                    />
                    <span className={styles.swatchName}>{t(`finishes.${finish.name}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tech Table with Switches */}
            <div className={styles.tableSection}>
              <h2 className="text-heading text-xl text-bright mb-6">{t('product.specs')}</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t('product.table.model')}</th>
                      <th>{t('product.table.size')}</th>
                      <th>{t('product.table.cutout')}</th>
                      <th>{t('product.table.angle')}</th>
                      <th className={styles.centerAlign}>{t('product.table.test')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.specifications.map((spec, i) => {
                      const isActive = activeSpecIndex === i;
                      
                      return (
                        <tr key={i} className={isActive ? styles.activeRow : ''}>
                          <td>{spec.wattage}</td>
                          <td>{spec.size}</td>
                          <td>{spec.cutOut}</td>
                          <td>{spec.beamAngle}°</td>
                          <td className={styles.centerAlign}>
                            <button 
                              className={`${styles.switchButton} ${isActive ? styles.switchOn : ''}`}
                              onClick={() => setActiveSpecIndex(isActive ? null : i)}
                              aria-label={`Toggle ${spec.wattage} light`}
                            >
                              <div className={styles.switchHandle} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
