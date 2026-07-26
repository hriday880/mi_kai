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
function mToFtIn(m: number): { ft: number, in: number } {
  const totalIn = m * 39.3701;
  const ft = Math.floor(totalIn / 12);
  const inc = Math.round(totalIn % 12);
  // Handle edge case where rounding inches hits 12
  if (inc === 12) return { ft: ft + 1, in: 0 };
  return { ft, in: inc };
}

function ftInToM(ft: number, inc: number): number {
  return ((ft * 12) + inc) / 39.3701;
}

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

function CeilingGrid({ 
  dimensions, 
  placedLights, 
  selectedLightId, 
  onPlaceLight, 
  onSelectLight 
}: { 
  dimensions: { width: number; length: number; height: number }; 
  placedLights: PlacedLight[];
  selectedLightId: string | null;
  onPlaceLight: (x: number, z: number) => void;
  onSelectLight: (id: string) => void;
}) {
  const { width, length } = dimensions; // in meters
  const scale = 50;
  const vbW = width * scale;
  const vbH = length * scale;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    
    const cursorPt = pt.matrixTransform(ctm.inverse());
    
    // cursorPt is in viewBox coords from 0 to vbW.
    // Convert to world coords (-width/2 to +width/2)
    const worldX = (cursorPt.x / scale) - (width / 2);
    const worldZ = (cursorPt.y / scale) - (length / 2);
    onPlaceLight(worldX, worldZ);
  };

  // Generate grid lines every 0.5m
  const lines = [];
  for (let x = 0.5; x < width; x += 0.5) {
    lines.push(<line key={`vx-${x}`} x1={x * scale} y1={0} x2={x * scale} y2={vbH} stroke="#e0e0e0" strokeWidth={x % 1 === 0 ? "1.5" : "0.5"} />);
  }
  for (let y = 0.5; y < length; y += 0.5) {
    lines.push(<line key={`vy-${y}`} x1={0} y1={y * scale} x2={vbW} y2={y * scale} stroke="#e0e0e0" strokeWidth={y % 1 === 0 ? "1.5" : "0.5"} />);
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: '#f8f9fa' // Light blueprint background
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        aspectRatio: `${width} / ${length}`,
        background: '#ffffff',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid #d4af37'
      }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${vbW} ${vbH}`} 
          onClick={handleSvgClick}
          style={{ cursor: 'crosshair', display: 'block' }}
        >
          {/* Grid */}
          <rect width={vbW} height={vbH} fill="#ffffff" />
          {lines}
          
          {/* Rulers / Measurements text */}
          <text x={vbW / 2} y={-10} textAnchor="middle" fill="#888" fontSize="14">Width: {width.toFixed(2)}m</text>
          <text x={-20} y={vbH / 2} textAnchor="middle" fill="#888" fontSize="14" transform={`rotate(-90, -20, ${vbH/2})`}>Length: {length.toFixed(2)}m</text>

          {/* Placed Lights */}
          {placedLights.map(light => {
            // Convert world coords to viewBox coords
            const cx = (light.position[0] + (width / 2)) * scale;
            const cy = (light.position[2] + (length / 2)) * scale;
            const isSelected = light.id === selectedLightId;

            return (
              <g 
                key={light.id} 
                transform={`translate(${cx}, ${cy})`}
                onClick={(e) => { e.stopPropagation(); onSelectLight(light.id); }}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer ring */}
                <circle 
                  r={12} 
                  fill={isSelected ? "rgba(212, 175, 55, 0.2)" : "#ffffff"} 
                  stroke={isSelected ? "#d4af37" : "#333"} 
                  strokeWidth="2" 
                />
                {/* Inner dot */}
                <circle r={4} fill={isSelected ? "#d4af37" : "#333"} />
                {/* Direction indicator for straight down (just a small cross) */}
                <path d="M-6,0 L6,0 M0,-6 L0,6" stroke={isSelected ? "#d4af37" : "#333"} strokeWidth="1" opacity="0.5" />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function StudioClient() {
  const { t, lang } = useLanguage();
  const [activePreset, setActivePreset] = useState<RoomPresetId>('bedroom');
  const [dimensions, setDimensions] = useState(roomPresetsData.bedroom.defaultDimensions);
  const [wallColor, setWallColor] = useState('#eeeeee');
  const [viewMode, setViewMode] = useState('top');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [placedLights, setPlacedLights] = useState<PlacedLight[]>([]);
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', error: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username.toLowerCase() === 'jain traders' && loginForm.password === 'Mi_Kai_2026') {
      setIsAuthenticated(true);
      setLoginForm({ ...loginForm, error: '' });
    } else {
      setLoginForm({ ...loginForm, error: 'Invalid username or password' });
    }
  };

  const currentPreset = roomPresetsData[activePreset];

  const handleTabClick = (presetId: RoomPresetId) => {
    setActivePreset(presetId);
    setDimensions(roomPresetsData[presetId].defaultDimensions);
    setPlacedLights([]); // Reset lights on room change
    setSelectedLightId(null);
  };

  const handleFtInChange = (axis: 'width' | 'length' | 'height', type: 'ft' | 'in', value: number) => {
    const current = mToFtIn(dimensions[axis]);
    let ft = type === 'ft' ? value : current.ft;
    let inc = type === 'in' ? value : current.in;
    
    if (inc >= 12) {
      ft += Math.floor(inc / 12);
      inc = inc % 12;
    }
    if (ft < 0) ft = 0;
    if (inc < 0) inc = 0;
    
    const newM = ftInToM(ft, inc);
    if (newM > 0) {
      setDimensions(prev => ({ ...prev, [axis]: newM }));
    }
  };

  // Updated to support direct 2D placement
  const handlePlaceLight2D = (worldX: number, worldZ: number) => {
    if (!selectedProductId) {
      setSelectedLightId(null);
      return;
    }

    const product = productsData.find(p => p.id === selectedProductId);
    if (!product) return;

    const defaultBeamAngle = product.specifications && product.specifications.length > 0
      ? parseInt(product.specifications[0].beamAngle) || 45
      : 45;
      
    const defaultWattage = product.specifications && product.specifications.length > 0
      ? parseInt(product.specifications[0].wattage) || 10
      : 10;

    const lightY = currentPreset.hasCeiling ? dimensions.height : 3;

    const newLight: PlacedLight = {
      id: Math.random().toString(36).substring(7),
      productId: selectedProductId,
      position: [worldX, lightY, worldZ],
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
      const renders = await new Promise<string[]>((resolve) => {
        if ((window as any).takeSequenceScreenshots) {
          (window as any).takeSequenceScreenshots(resolve);
        } else {
          resolve([]);
        }
      });

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
      const recommendation = generateRecommendations(activePreset, surfaceResults, placedLights, t);

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

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', backgroundColor: '#000', color: '#fff', flexDirection: 'column' }}>
        <div style={{ background: '#111', padding: '2rem', borderRadius: '8px', border: '1px solid #333', width: '100%', maxWidth: '400px' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#d4af37', fontSize: '1.5rem', fontWeight: 300 }}>Mi-KAI Studio Access</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#888' }}>Username</label>
              <input 
                type="text" 
                value={loginForm.username} 
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                style={{ padding: '0.75rem', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#888' }}>Password</label>
              <input 
                type="password" 
                value={loginForm.password} 
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                style={{ padding: '0.75rem', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
              />
            </div>
            {loginForm.error && <p style={{ color: '#ff4444', fontSize: '0.8rem', margin: 0 }}>{loginForm.error}</p>}
            <button type="submit" style={{ padding: '0.75rem', background: '#d4af37', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h1>{t('studio.title').toUpperCase()}</h1>
          <p style={{ fontSize: '0.8rem', color: '#d4af37', marginTop: '0.5rem' }}>
            Select a product below, then click on the ceiling grid to place lights.
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
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#222', border: '1px solid #333', borderRadius: '4px', paddingRight: '0.5rem', flex: 1 }}>
                  <input 
                    type="number" step="1" min="0"
                    value={mToFtIn(dimensions.width).ft}
                    onChange={(e) => handleFtInChange('width', 'ft', parseInt(e.target.value) || 0)}
                    style={{ border: 'none', background: 'transparent', flex: 1, minWidth: 0 }}
                  />
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>ft</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: '#222', border: '1px solid #333', borderRadius: '4px', paddingRight: '0.5rem', flex: 1 }}>
                  <input 
                    type="number" step="1" min="0" max="11"
                    value={mToFtIn(dimensions.width).in}
                    onChange={(e) => handleFtInChange('width', 'in', parseInt(e.target.value) || 0)}
                    style={{ border: 'none', background: 'transparent', flex: 1, minWidth: 0 }}
                  />
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>in</span>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>{t('studio.length')}</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#222', border: '1px solid #333', borderRadius: '4px', paddingRight: '0.5rem', flex: 1 }}>
                  <input 
                    type="number" step="1" min="0"
                    value={mToFtIn(dimensions.length).ft}
                    onChange={(e) => handleFtInChange('length', 'ft', parseInt(e.target.value) || 0)}
                    style={{ border: 'none', background: 'transparent', flex: 1, minWidth: 0 }}
                  />
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>ft</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: '#222', border: '1px solid #333', borderRadius: '4px', paddingRight: '0.5rem', flex: 1 }}>
                  <input 
                    type="number" step="1" min="0" max="11"
                    value={mToFtIn(dimensions.length).in}
                    onChange={(e) => handleFtInChange('length', 'in', parseInt(e.target.value) || 0)}
                    style={{ border: 'none', background: 'transparent', flex: 1, minWidth: 0 }}
                  />
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>in</span>
                </div>
              </div>
            </div>

            {currentPreset.hasCeiling && (
              <div className={styles.inputGroup}>
                <label>{t('studio.height')}</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#222', border: '1px solid #333', borderRadius: '4px', paddingRight: '0.5rem', flex: 1 }}>
                    <input 
                      type="number" step="1" min="0"
                      value={mToFtIn(dimensions.height).ft}
                      onChange={(e) => handleFtInChange('height', 'ft', parseInt(e.target.value) || 0)}
                      style={{ border: 'none', background: 'transparent', flex: 1, minWidth: 0 }}
                    />
                    <span style={{ color: '#888', fontSize: '0.8rem' }}>ft</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#222', border: '1px solid #333', borderRadius: '4px', paddingRight: '0.5rem', flex: 1 }}>
                    <input 
                      type="number" step="1" min="0" max="11"
                      value={mToFtIn(dimensions.height).in}
                      onChange={(e) => handleFtInChange('height', 'in', parseInt(e.target.value) || 0)}
                      style={{ border: 'none', background: 'transparent', flex: 1, minWidth: 0 }}
                    />
                    <span style={{ color: '#888', fontSize: '0.8rem' }}>in</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedLight ? (
          <div className={styles.section}>
            <h2>Selected Light Properties</h2>
            
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

      {/* Main 2D Interactive Ceiling Blueprint */}
      <div className={styles.canvasContainer}>
        <CeilingGrid 
          dimensions={dimensions}
          placedLights={placedLights}
          selectedLightId={selectedLightId}
          onPlaceLight={handlePlaceLight2D}
          onSelectLight={setSelectedLightId}
        />
        
        <button 
          className={styles.floatingButton} 
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? t('studio.generating') : t('studio.generateReport')}
        </button>
      </div>

      {/* Hidden 3D Environment for Render & Light Calculation */}
      <div style={{ position: 'absolute', left: '-10000px', top: 0, width: '1920px', height: '1080px', pointerEvents: 'none' }}>
        <Canvas 
          shadows="soft"
          camera={{ position: [0, dimensions.height * 0.8, dimensions.length], fov: 50 }}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }} 
        >
          <CameraController viewMode={viewMode} />
          <Screenshotter />
          
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 10, 5]} intensity={0.1} castShadow={false} />

          {currentPreset.hasCeiling ? (
            <RoomScene 
              roomId={activePreset}
              dimensions={dimensions} 
              wallColor={wallColor}
              onFloorClick={() => {}} 
              onWallClick={() => {}}
            />
          ) : (
            <OutdoorScene 
              dimensions={dimensions} 
              wallColor={wallColor}
              variant={activePreset}
              onGroundClick={() => {}}
              onWallClick={() => {}}
            />
          )}

          {placedLights.map((light, index) => (
            <LuminaireGhost 
              key={light.id} 
              position={light.position}
              wattage={light.wattage}
              colorTemp={light.colorTemp}
              beamAngle={light.beamAngle}
              reflectorColor={light.reflectorColor}
              selected={selectedLightId === light.id}
              castShadow={index < 8}
            />
          ))}

          <OrbitControls 
            target={[0, dimensions.height / 2, 0]} 
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Canvas>
      </div>
    </>
  );
}
