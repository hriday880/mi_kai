// lib/lux-calculator.ts

export interface PlacedLightData {
  position: [number, number, number]; // [x, y, z]
  wattage: number;
  beamAngle: number; // in degrees
}

export function estimateCandela(wattage: number, beamAngle: number) {
  // Approximate lumens: 100 lumens per watt
  const lumens = wattage * 100;
  // Convert beam angle to radians
  const angleRad = (beamAngle / 2) * (Math.PI / 180);
  // Solid angle = 2 * PI * (1 - cos(theta))
  const solidAngle = 2 * Math.PI * (1 - Math.cos(angleRad));
  // I = L / Omega
  const candela = lumens / (solidAngle || 1);
  return candela;
}

export function calculateLuxAtPoint(
  px: number, py: number, pz: number, 
  nx: number, ny: number, nz: number,
  lights: PlacedLightData[]
): number {
  let totalLux = 0;

  for (const light of lights) {
    const [lx, ly, lz] = light.position;
    
    // Distance vector
    const dx = px - lx;
    const dy = py - ly;
    const dz = pz - lz;

    const distanceSq = dx*dx + dy*dy + dz*dz;
    if (distanceSq === 0) continue;

    const distance = Math.sqrt(distanceSq);
    
    // Angle of incidence on the surface
    const cosThetaInc = (nx * -dx + ny * -dy + nz * -dz) / distance;
    if (cosThetaInc <= 0) continue; // Light is behind the surface or surface facing away

    // Angle of light ray relative to downward fixture axis (0, -1, 0)
    const cosThetaBeam = -dy / distance;
    if (cosThetaBeam <= 0) continue; // point must be below the light

    // Check if point is inside the beam angle cone
    const beamAngleRad = (light.beamAngle / 2) * (Math.PI / 180);
    if (Math.acos(cosThetaBeam) > beamAngleRad) {
      continue; // outside the cone
    }

    const candela = estimateCandela(light.wattage, light.beamAngle);

    // E = (I / d^2) * cos(theta_incidence)
    const lux = (candela / distanceSq) * cosThetaInc;
    totalLux += lux;
  }

  return totalLux;
}

export interface SurfaceDefinition {
  name: string;
  width: number; // width in columns
  length: number; // length in rows
  origin: [number, number, number]; // Center of the first cell (row 0, col 0)
  uVector: [number, number, number]; // Step vector for columns
  vVector: [number, number, number]; // Step vector for rows
  normal: [number, number, number]; // Surface normal vector
}

export interface SurfaceResult {
  name: string;
  average: number;
  min: number;
  max: number;
  heatmap: number[][];
  surfaceWidth: number;
  surfaceLength: number;
}

export function calculateSurfaceLux(
  surface: SurfaceDefinition,
  lights: PlacedLightData[],
  gridSize: number = 0.5
): SurfaceResult {
  let sum = 0;
  let count = 0;
  let min = Infinity;
  let max = 0;

  const cols = Math.max(1, Math.ceil(surface.width / gridSize));
  const rows = Math.max(1, Math.ceil(surface.length / gridSize));
  const heatmap: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = surface.origin[0] + (c * surface.uVector[0]) + (r * surface.vVector[0]);
      const py = surface.origin[1] + (c * surface.uVector[1]) + (r * surface.vVector[1]);
      const pz = surface.origin[2] + (c * surface.uVector[2]) + (r * surface.vVector[2]);
      
      const lux = calculateLuxAtPoint(px, py, pz, surface.normal[0], surface.normal[1], surface.normal[2], lights);
      
      heatmap[r][c] = lux;
      sum += lux;
      count++;
      if (lux < min) min = lux;
      if (lux > max) max = lux;
    }
  }

  if (count === 0) return { name: surface.name, average: 0, min: 0, max: 0, heatmap: [], surfaceWidth: surface.width, surfaceLength: surface.length };
  if (min === Infinity) min = 0;

  return {
    name: surface.name,
    average: sum / count,
    min,
    max,
    heatmap,
    surfaceWidth: surface.width,
    surfaceLength: surface.length
  };
}

// DEPRECATED function kept for backward compatibility if needed, but not used by new Multi-Surface engine.

export function generateHeatmapDataURL(heatmap: number[][], maxLux: number = 500): string {
  if (typeof window === 'undefined') return ''; // Safety for SSR
  const rows = heatmap.length;
  if (rows === 0) return '';
  const cols = heatmap[0].length;
  if (cols === 0) return '';

  const canvas = document.createElement('canvas');
  canvas.width = cols * 20; // 20px per cell
  canvas.height = rows * 20;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lux = heatmap[r][c];
      const intensity = Math.min(lux / maxLux, 1);
      // Cold to hot color mapping (Blue -> Green -> Yellow -> Red)
      const hue = (1 - intensity) * 240; 
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(c * 20, r * 20, 20, 20);
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.strokeRect(c * 20, r * 20, 20, 20);
    }
  }

  return canvas.toDataURL('image/png');
}
