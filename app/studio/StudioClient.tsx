'use client';

import { useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import styles from './page.module.css';
import roomPresetsData from '../../data/room-presets.json';
import productsData from '../../data/products.json';
import RoomScene from '../../components/studio/RoomScene';
import OutdoorScene from '../../components/studio/OutdoorScene';
import ProductPicker from '../../components/studio/ProductPicker';
import LuminaireGhost from '../../components/studio/LuminaireGhost';
import { SurfaceDefinition, calculateSurfaceLux } from '../../lib/lux-calculator';
import { generateRecommendations } from '../../lib/recommender';
import { generatePDFReport } from '../../lib/pdf-builder';
import * as THREE from 'three';
import { useLanguage } from '../../lib/LanguageContext';

// Helper to switch camera views
function CameraController({ viewMode }: { viewMode: string }) {
  const { camera } = useThree();
  useEffect(() => {
    switch (viewMode) {
      case 'top':
        camera.position.set(0, 15, 0.1); // slight offset to prevent lookAt flipping
        break;
      case 'iso':
        camera.position.set(-6, 8, 8);
        break;
      case 'front':
        camera.position.set(0, 5, 12);
        break;
      case 'side':
        camera.position.set(12, 5, 0);
        break;
    }
    camera.lookAt(0, 0, 0);
  }, [viewMode, camera]);
  return null;
}

// Helper component to capture screenshot sequence
function Screenshotter() {
  const { gl, scene, camera } = useThree();
  
  if (typeof window !== 'undefined') {
    (window as any).takeSequenceScreenshots = (onComplete: (renders: string[]) => void) => {
      const captures: string[] = [];
      const origPos = camera.position.clone();
      const origRatio = gl.getPixelRatio();
      const origShadowType = gl.shadowMap.type;
      
      // Force max realism for capture
      gl.setPixelRatio(3.0);
      gl.shadowMap.type = THREE.PCFSoftShadowMap;

      const angles = [
        new THREE.Vector3(0.1, 10, 0), // almost top down
        new THREE.Vector3(-6, 6, 8),   // front left iso
        new THREE.Vector3(6, 6, 8)     // front right iso
      ];

      let step = 0;
      const processStep = () => {
        if (step >= angles.length) {
          camera.position.copy(origPos);
          camera.lookAt(0, 0, 0);
          gl.setPixelRatio(origRatio);
          gl.shadowMap.type = origShadowType;
          gl.render(scene, camera);
          onComplete(captures);
          return;
        }

        camera.position.copy(angles[step]);
        camera.lookAt(0, 0, 0);
        
        // --- MULTIPASS ACCUMULATION RENDERER ---
        // Bypasses the WebGL 16-texture limit by rendering lights in chunks of 8
        // and additively blending them on a 2D Canvas.
        const ambientLights: any[] = [];
        const placedLightsObj: any[] = [];
        
        scene.traverse((obj: any) => {
          if (obj.isAmbientLight || obj.isDirectionalLight) {
            ambientLights.push(obj);
          }
          if (obj.isSpotLight && obj.userData?.isPlacedLight) {
            placedLightsObj.push(obj);
          }
        });

        const maxCasters = 8;
        const passes = Math.max(1, Math.ceil(placedLightsObj.length / maxCasters));

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = gl.domElement.width;
        tempCanvas.height = gl.domElement.height;
        const ctx = tempCanvas.getContext('2d');
        
        if (!ctx) return;

        let currentPass = 0;

        const renderPass = () => {
          if (currentPass >= passes) {
            // Restore emissive materials
            scene.traverse((obj: any) => {
               if (obj.isMesh && obj.material && obj.userData.origEmissive) {
                  obj.material.emissive.copy(obj.userData.origEmissive);
               }
            });
            // Restore ambient
            ambientLights.forEach(l => l.visible = true);
            // Restore lights to preview state (only first 8 cast shadow)
            placedLightsObj.forEach((l, i) => {
               l.intensity = l.userData.renderIntensity || l.intensity;
               l.castShadow = (i < 8);
            });

            // Save combined capture in compressed JPEG for hyperrealism without bloating PDF size
            captures.push(tempCanvas.toDataURL('image/jpeg', 0.85));
            step++;
            setTimeout(processStep, 100);
            return;
          }

          // Setup this pass
          ambientLights.forEach(l => {
             l.visible = (currentPass === 0);
          });

          // Disable emissive on meshes for pass > 0 to avoid double-adding
          scene.traverse((obj: any) => {
             if (obj.isMesh && obj.material) {
                if (currentPass === 0) {
                   obj.userData.origEmissive = obj.material.emissive ? obj.material.emissive.clone() : new THREE.Color(0,0,0);
                } else if (obj.material.emissive) {
                   obj.material.emissive.setHex(0x000000); // Black
                }
             }
          });

          // Enable only 8 lights for this pass
          placedLightsObj.forEach((l, i) => {
            if (i >= currentPass * maxCasters && i < (currentPass + 1) * maxCasters) {
               l.intensity = l.userData.renderIntensity;
               l.castShadow = true;
            } else {
               l.intensity = 0;
               l.castShadow = false;
            }
          });

          // Wait for shadows to resolve, then render and blend
          setTimeout(() => {
            gl.render(scene, camera);
            if (currentPass === 0) {
              ctx.globalCompositeOperation = 'source-over';
              
              // Draw the beautiful radial gradient to match the preview exactly!
              const gradient = ctx.createRadialGradient(
                tempCanvas.width / 2, tempCanvas.height / 2, 0,
                tempCanvas.width / 2, tempCanvas.height / 2, Math.max(tempCanvas.width, tempCanvas.height)
              );
              gradient.addColorStop(0, '#2a2a2a');
              gradient.addColorStop(1, '#000000');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
              
            } else {
              ctx.globalCompositeOperation = 'lighter'; // Screen blending causes transparency issues, lighter is correct for light accumulation
            }
            ctx.drawImage(gl.domElement, 0, 0);
            
            currentPass++;
            renderPass();
          }, 400); // 400ms per pass to guarantee 4K shadow maps resolve
        };

        renderPass();
      };

      processStep();
    };
  }
  return null;
}

type RoomPresetId = keyof typeof roomPresetsData;

interface PlacedLight {
  id: string;
  productId: string;
  position: [number, number, number];
  wattage: number;
  colorTemp: number;
  beamAngle: number;
  reflectorColor: string;
}

const REFLECTOR_COLORS = [
  { name: 'Matte Black', hex: '#1a1a1a' },
  { name: 'Matte White', hex: '#f0f0f0' },
  { name: 'Champagne Gold', hex: '#d4af37' },
  { name: 'Chrome', hex: '#e0e0e0' }
];

export default function StudioClient() {
  const { t, lang } = useLanguage();
  const [activePreset, setActivePreset] = useState<RoomPresetId>('bedroom');
  const [dimensions, setDimensions] = useState(roomPresetsData.bedroom.defaultDimensions);
  const [wallColor, setWallColor] = useState('#eeeeee');
  const [viewMode, setViewMode] = useState('iso');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [placedLights, setPlacedLights] = useState<PlacedLight[]>([]);
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderDataUrl, setRenderDataUrl] = useState<string>('');

  const currentPreset = roomPresetsData[activePreset];

  const handleTabClick = (presetId: RoomPresetId) => {
    setActivePreset(presetId);
    setDimensions(roomPresetsData[presetId].defaultDimensions);
    setPlacedLights([]); // Reset lights on room change
    setSelectedLightId(null);
  };

  const handleDimensionChange = (axis: 'width' | 'length' | 'height', value: number) => {
    if (value > 0) {
      setDimensions(prev => ({ ...prev, [axis]: value }));
    }
  };

  const handleFloorClick = (e: any) => {
    if (!selectedProductId) {
      setSelectedLightId(null);
      return;
    }
    
    // Stop event from bubbling
    e.stopPropagation();

    const product = productsData.find(p => p.id === selectedProductId);
    if (!product) return;

    const defaultBeamAngle = product.specifications && product.specifications.length > 0
      ? parseInt(product.specifications[0].beamAngle) || 45
      : 45;
      
    const defaultWattage = product.specifications && product.specifications.length > 0
      ? parseInt(product.specifications[0].wattage) || 10
      : 10;

    // Place light directly above the clicked floor position at the ceiling height
    // If it's outdoor, default to 3 meters height
    const lightY = currentPreset.hasCeiling ? dimensions.height : 3;

    const newLight: PlacedLight = {
      id: Math.random().toString(36).substring(7),
      productId: selectedProductId,
      position: [e.point.x, lightY, e.point.z],
      wattage: defaultWattage,
      colorTemp: 3000,
      beamAngle: defaultBeamAngle,
      reflectorColor: '#1a1a1a'
    };

    setPlacedLights(prev => [...prev, newLight]);
    setSelectedLightId(newLight.id);
  };

  const handleUpdateLight = (id: string, updates: Partial<PlacedLight>) => {
    setPlacedLights(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleDeleteLight = (id: string) => {
    setPlacedLights(prev => prev.filter(l => l.id !== id));
    if (selectedLightId === id) setSelectedLightId(null);
  };

  const selectedLight = placedLights.find(l => l.id === selectedLightId);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // 1. Take 3D screenshot sequence
      const renders = await new Promise<string[]>((resolve) => {
        if ((window as any).takeSequenceScreenshots) {
          (window as any).takeSequenceScreenshots(resolve);
        } else {
          resolve([]);
        }
      });

      // 2. Calculate Lux for ALL Surfaces
      const lightsData = placedLights.map(l => ({
        position: l.position,
        wattage: l.wattage,
        beamAngle: l.beamAngle
      }));

      const sWidth = dimensions.width;
      const sLength = dimensions.length;
      const sHeight = dimensions.height;
      const gs = 0.5; 

      const surfaces: SurfaceDefinition[] = [
        {
          name: 'Floor',
          width: sWidth, length: sLength,
          origin: [-sWidth/2 + gs/2, 0, -sLength/2 + gs/2],
          uVector: [gs, 0, 0], vVector: [0, 0, gs],
          normal: [0, 1, 0]
        }
      ];

      if (currentPreset.hasCeiling) {
        surfaces.push({
          name: 'Ceiling',
          width: sWidth, length: sLength,
          origin: [-sWidth/2 + gs/2, sHeight, -sLength/2 + gs/2],
          uVector: [gs, 0, 0], vVector: [0, 0, gs],
          normal: [0, -1, 0]
        });
        surfaces.push({
          name: 'North Wall',
          width: sWidth, length: sHeight,
          origin: [-sWidth/2 + gs/2, sHeight - gs/2, -sLength/2],
          uVector: [gs, 0, 0], vVector: [0, -gs, 0],
          normal: [0, 0, 1]
        });
        surfaces.push({
          name: 'West Wall',
          width: sLength, length: sHeight,
          origin: [-sWidth/2, sHeight - gs/2, sLength/2 - gs/2],
          uVector: [0, 0, -gs], vVector: [0, -gs, 0],
          normal: [1, 0, 0]
        });
        surfaces.push({
          name: 'East Wall',
          width: sLength, length: sHeight,
          origin: [sWidth/2, sHeight - gs/2, -sLength/2 + gs/2],
          uVector: [0, 0, gs], vVector: [0, -gs, 0],
          normal: [-1, 0, 0]
        });
        surfaces.push({
          name: 'South Wall',
          width: sWidth, length: sHeight,
          origin: [sWidth/2 - gs/2, sHeight - gs/2, sLength/2],
          uVector: [-gs, 0, 0], vVector: [0, -gs, 0],
          normal: [0, 0, -1]
        });
      }

      const surfaceResults = surfaces.map(s => calculateSurfaceLux(s, lightsData, gs));

      // 3. Generate Recommendations (based on floor and walls)
      const recommendation = generateRecommendations(activePreset, surfaceResults, placedLights, t);

      // 4. Build Multi-Surface PDF
      await generatePDFReport({
        roomId: activePreset,
        dimensions,
        renderDataUrls: renders,
        surfaceResults: surfaceResults,
        recommendation,
        placedLights: placedLights,
        productsData,
        lang,
        t
      });

    } catch (e) {
      console.error("Failed to generate report", e);
      alert("Error generating report. Check console.");
    }
    setIsGenerating(false);
  };

  return (
    <>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h1>{t('studio.title').toUpperCase()}</h1>
          <p style={{ fontSize: '0.8rem', color: '#d4af37', marginTop: '0.5rem' }}>
            {t('studio.dragHint')}
          </p>
        </div>

        <div className={styles.section}>
          <h2>Room Preset</h2>
          <div className={styles.tabs}>
            {(Object.keys(roomPresetsData) as RoomPresetId[]).map(key => (
              <div 
                key={key} 
                className={`${styles.tab} ${activePreset === key ? styles.active : ''}`}
                onClick={() => handleTabClick(key)}
              >
                {roomPresetsData[key].icon} {roomPresetsData[key].name}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2>{t('studio.roomDimensions')}</h2>
          <div className={styles.dimensions} style={{ marginBottom: '1rem' }}>
            <div className={styles.inputGroup}>
              <label>{t('studio.width')}</label>
              <input 
                type="number" 
                step="0.5" 
                value={dimensions.width}
                onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>{t('studio.length')}</label>
              <input 
                type="number" 
                step="0.5" 
                value={dimensions.length}
                onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value))}
              />
            </div>
            {currentPreset.hasCeiling && (
              <div className={styles.inputGroup}>
                <label>{t('studio.height')}</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={dimensions.height}
                  onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
                />
              </div>
            )}
          </div>
          {currentPreset.hasCeiling && (
            <div className={styles.inputGroup}>
              <label>Wall Color</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {['#eeeeee', '#a3b1c6', '#8e7f72', '#2a2a2a'].map(color => (
                  <div 
                    key={color}
                    onClick={() => setWallColor(color)}
                    style={{ 
                      width: '24px', height: '24px', backgroundColor: color, 
                      borderRadius: '50%', cursor: 'pointer',
                      border: wallColor === color ? '2px solid #d4af37' : '1px solid #333'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedLight ? (
          <div className={styles.section}>
            <h2>Selected Light Properties</h2>
            <p style={{ fontSize: '0.8rem', color: '#d4af37', marginBottom: '1rem' }}>
              <i>Click anywhere on the floor to move this light.</i>
            </p>
            
            <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
              <label>Reflector Finish</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                {REFLECTOR_COLORS.map(color => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => handleUpdateLight(selectedLight.id, { reflectorColor: color.hex })}
                    style={{
                      background: '#222', color: '#fff', border: `1px solid ${selectedLight.reflectorColor === color.hex ? '#d4af37' : '#333'}`,
                      padding: '0.5rem', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                  >
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: color.hex, display: 'inline-block' }} />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
              <label>Color Temperature (CCT)</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {[2700, 3000, 4000, 5000].map(cct => (
                  <button
                    key={cct}
                    type="button"
                    onClick={() => handleUpdateLight(selectedLight.id, { colorTemp: cct })}
                    style={{
                      flex: 1, background: selectedLight.colorTemp === cct ? '#d4af37' : '#222',
                      color: selectedLight.colorTemp === cct ? '#000' : '#fff',
                      border: '1px solid #333', padding: '0.5rem 0', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer'
                    }}
                  >
                    {cct}K
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
              <label>Wattage ({selectedLight.wattage}W)</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {productsData.find(p => p.id === selectedLight.productId)?.specifications?.map((spec, i) => {
                  const w = parseInt(spec.wattage);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleUpdateLight(selectedLight.id, { wattage: w })}
                      style={{
                        flex: '1 0 calc(25% - 0.5rem)', background: selectedLight.wattage === w ? '#d4af37' : '#222',
                        color: selectedLight.wattage === w ? '#000' : '#fff',
                        border: '1px solid #333', padding: '0.5rem 0', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer'
                      }}
                    >
                      {w}W
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              className={styles.reportButton} 
              style={{ width: '100%', margin: '0', background: '#333', color: '#fff' }}
              onClick={() => handleDeleteLight(selectedLight.id)}
            >
              Delete Light
            </button>
            <button 
              className={styles.reportButton} 
              style={{ width: '100%', margin: '1rem 0 0 0', background: 'transparent', color: '#888', border: '1px solid #333' }}
              onClick={() => setSelectedLightId(null)}
            >
              Done
            </button>
          </div>
        ) : (
          <ProductPicker 
            selectedId={selectedProductId} 
            onSelect={setSelectedProductId} 
          />
        )}
      </div>

      <div className={styles.canvasContainer}>
        {/* Camera View Controls */}
        <div style={{ 
          position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 100, 
          display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px', backdropFilter: 'blur(4px)',
          flexWrap: 'wrap', maxWidth: 'calc(100% - 3rem)'
        }}>
          {['iso', 'top', 'front', 'side'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                background: viewMode === mode ? '#d4af37' : 'transparent',
                color: viewMode === mode ? '#000' : '#fff',
                border: '1px solid #d4af37',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        <Canvas 
          shadows="soft"
          camera={{ position: [0, dimensions.height * 0.8, dimensions.length], fov: 50 }}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }} 
        >
          <CameraController viewMode={viewMode} />
          <Screenshotter />
          
          {/* Base ambient light so we can see the room before placing lights */}
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 10, 5]} intensity={0.1} castShadow={false} />

          {currentPreset.hasCeiling ? (
            <RoomScene 
              roomId={activePreset}
              dimensions={dimensions} 
              wallColor={wallColor}
              onFloorClick={handleFloorClick} 
              onWallClick={handleFloorClick} // allow placing on walls for now
            />
          ) : (
            <OutdoorScene 
              dimensions={dimensions} 
              wallColor={wallColor}
              variant={activePreset}
              onGroundClick={handleFloorClick}
              onWallClick={() => setSelectedLightId(null)}
            />
          )}

          {/* Render placed lights */}
          {placedLights.map((light, index) => (
            <LuminaireGhost 
              key={light.id} 
              position={light.position}
              wattage={light.wattage}
              colorTemp={light.colorTemp}
              beamAngle={light.beamAngle}
              reflectorColor={light.reflectorColor}
              selected={selectedLightId === light.id}
              castShadow={index < 8} // WebGL limits us to 16 texture units total, restrict shadow casters
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLightId(light.id);
              }}
            />
          ))}

          {/* Camera controls */}
          <OrbitControls 
            target={[0, dimensions.height / 2, 0]} 
            maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going under floor
          />
        </Canvas>

        <button 
          className={styles.floatingButton} 
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? t('studio.generating') : t('studio.generateReport')}
        </button>
      </div>
    </>
  );
}
