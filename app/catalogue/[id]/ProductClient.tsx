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
  
  const cctOptions = [
    { name: 'Warm White', hex: '#FFD6AA', temp: '3000K' },
    { name: 'Natural White', hex: '#FFF4E5', temp: '4000K' },
    { name: 'Cool White', hex: '#FFFFFF', temp: '6000K' }
  ];
  const [activeCCT, setActiveCCT] = useState(cctOptions[0]);

  const activeSpec = activeSpecIndex !== null ? product.specifications[activeSpecIndex] : null;

  // Calculate light properties based on wattage, finish, and beam angle
  const getLightStyles = () => {
    if (!activeSpec) return { opacity: 0, '--light-tint': activeCCT.hex, '--reflector-tint': activeFinish?.hex || '#FFF' } as React.CSSProperties;
    
    const wattageNum = parseInt(activeSpec.wattage) || 10;
    
    return {
      '--wattage': wattageNum,
      '--light-tint': activeCCT.hex,
      '--reflector-tint': activeFinish?.hex || '#FFF',
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
          
          <div className={styles.grid}>
            {/* Left Column: Finishes and CCT */}
            <div className={styles.optionsColumn}>
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

              <div className={styles.finishesSection} style={{ marginTop: '2rem' }}>
                <h2 className="text-heading text-xl text-bright mb-6">Light Color (CCT)</h2>
                <div className={styles.swatchList}>
                  {cctOptions.map((cct) => (
                    <button 
                      key={cct.temp} 
                      className={`${styles.swatchItem} ${activeCCT.temp === cct.temp ? styles.activeSwatch : ''}`}
                      onClick={() => setActiveCCT(cct)}
                    >
                      <div 
                        className={styles.swatchCircle} 
                        style={{ background: cct.hex, border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                      <span className={styles.swatchName}>{cct.name} ({cct.temp})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Tech Table & Chamber */}
            <div className={styles.tableAndChamberSection} style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              
              <div className={styles.tableSection} style={{ flex: '1 1 400px' }}>
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
                            <td className={styles.centerAlign} style={{ position: 'relative' }}>
                              <button 
                                className={`${styles.switchButton} ${isActive ? styles.switchOn : ''}`}
                                onClick={() => setActiveSpecIndex(isActive ? null : i)}
                                aria-label={`Toggle ${spec.wattage} light`}
                              >
                                <div className={styles.switchHandle} />
                              </button>
                              
                              {/* Floating Interactive Testing Chamber */}
                              {isActive && (
                                <div className={styles.floatingChamber}>
                                  <div className={styles.chamberTitle}>Live Preview</div>
                                  <div 
                                    className={styles.testingChamber}
                                    onPointerMove={handlePointerMove}
                                    onPointerLeave={handlePointerLeave}
                                    style={getLightStyles()}
                                  >
                                    <div className={styles.lightSource} style={{ left: `${panX}%` }}>
                                      <div className={`${styles.lightSpill} ${styles.lightConeActive}`} />
                                      <div className={`${styles.lightCone} ${styles.lightConeActive}`} />
                                    </div>
                                    
                                    <div className={styles.chamberFloor}>
                                      <div className={`${styles.floorHighlight} ${styles.floorHighlightActive}`} style={{ left: `${panX}%` }} />
                                    </div>
                                  </div>
                                </div>
                              )}
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
        </div>
      </section>
    </main>
  );
}
