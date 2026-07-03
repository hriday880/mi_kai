// lib/recommender.ts
import luxStandards from '../data/lux-standards.json';

export interface Flag {
  severity: 'warning' | 'info';
  code: string;
  title: string;
  detail: string;
}

export interface RecommendationResult {
  status: 'under' | 'optimal' | 'over';
  targetRange: [number, number];
  targetLux: number;
  message: string;
  flags: Flag[];
}

export function generateRecommendations(
  roomId: string,
  surfaceResults: any[],
  lights: any[], // PlacedLight array
  productsData: any[] // full catalogue
): RecommendationResult {
  const flags: Flag[] = [];
  const standard = (luxStandards as any)[roomId];
  const targetMin = standard ? standard.min : 100;
  const targetMax = standard ? standard.max : 300;
  const targetLux = targetMin; // Primary target for surface verdicts

  const floorResult = surfaceResults.find(s => s.name.toLowerCase().includes('floor')) || surfaceResults[0];
  const averageLux = floorResult ? floorResult.average : 0;

  let status: 'under' | 'optimal' | 'over' = 'optimal';
  let message = "Your lighting design meets recommended standards.";

  if (lights.length === 0) {
    status = 'under';
    message = "You have not placed any lights yet. Add fixtures to reach the target illumination.";
  } else if (averageLux < targetMin) {
    status = 'under';
    message = `Your room is receiving ${Math.round(averageLux)} lx. Recommended minimum is ${targetMin} lx. Consider adding more fixtures.`;
  } else if (averageLux > targetMax * 1.5) {
    status = 'over';
    
    // Check wall status
    const walls = surfaceResults.filter(s => s.name.toLowerCase().includes('wall'));
    const wallTarget = 75;
    const overlitWalls = walls.filter(w => w.average > wallTarget * 1.5);
    const darkWalls = walls.filter(w => w.average < wallTarget * 0.5);

    if (overlitWalls.length > 0) {
      message = `Your room is receiving ${Math.round(averageLux)} lx, which is very bright for a ${roomId}. Your walls are also overlit, likely due to fixtures placed too close to them. Consider reducing the number of fixtures or redirecting them away from the walls.`;
    } else if (darkWalls.length > 0) {
      message = `Your room is receiving ${Math.round(averageLux)} lx, which is very bright for a ${roomId}. However, your walls remain dark. Consider reducing the number of ambient downlights and adding dedicated wall-washers or accent fixtures to balance the space.`;
    } else {
      message = `Your room is receiving ${Math.round(averageLux)} lx, which is very bright for a ${roomId}. Consider reducing the overall number of fixtures or lowering their intensity.`;
    }
  }

  // Check for mixed color temperatures
  if (lights.length > 1) {
    const temps = lights.map(l => l.colorTemp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    if (maxTemp - minTemp >= 500) {
      flags.push({
        severity: 'info',
        code: 'MIXED_TEMPS',
        title: 'Mixed Color Temperatures',
        detail: `You are mixing warm (${minTemp}K) and cool (${maxTemp}K) lighting. For a cohesive atmosphere, consider matching color temperatures.`
      });
    }
  }

  // Check for outdoor/balcony/garden rooms needing IP-rated fixtures
  const isOutdoorRoom = roomId === 'outdoor' || roomId === 'balcony' || roomId === 'garden';
  if (isOutdoorRoom && lights.length > 0) {
    flags.push({
      severity: 'warning',
      code: 'INDOOR_OUTDOOR',
      title: 'Weather Resistance Required',
      detail: 'Ensure the selected fixtures are rated for outdoor use (IP54 or higher) before final installation.'
    });
  }

  return {
    status,
    targetRange: [targetMin, targetMax],
    targetLux,
    message,
    flags
  };
}
