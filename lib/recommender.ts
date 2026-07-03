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
  message: string;
  flags: Flag[];
}

export function generateRecommendations(
  roomId: string,
  averageLux: number,
  lights: any[], // PlacedLight array
  productsData: any[] // full catalogue
): RecommendationResult {
  const flags: Flag[] = [];
  const standard = (luxStandards as any)[roomId];
  const targetMin = standard ? standard.min : 100;
  const targetMax = standard ? standard.max : 300;

  let status: 'under' | 'optimal' | 'over' = 'optimal';
  let message = "Your lighting design meets recommended standards.";

  if (lights.length === 0) {
    status = 'under';
    message = "You have not placed any lights yet. Add fixtures to reach the target illumination.";
  } else if (averageLux < targetMin) {
    status = 'under';
    message = `Your room is receiving ${Math.round(averageLux)} lx. Recommended minimum is ${targetMin} lx. Consider adding more fixtures.`;
    flags.push({
      severity: 'warning',
      code: 'UNDER_LIT',
      title: 'Insufficient Lighting',
      detail: message
    });
  } else if (averageLux > targetMax * 1.5) {
    status = 'over';
    message = `Your room is receiving ${Math.round(averageLux)} lx, which is very bright. Consider reducing the number of fixtures or lowering their intensity.`;
    flags.push({
      severity: 'info',
      code: 'OVER_LIT',
      title: 'Excessively Bright',
      detail: message
    });
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

  // Dummy check for indoor/outdoor flag
  // Once we add IP rating to products.json this can be fully realized
  const isOutdoorRoom = roomId === 'outdoor';
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
    message,
    flags
  };
}
