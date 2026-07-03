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
  t: (key: string) => string
): RecommendationResult {
  const flags: Flag[] = [];
  const standard = (luxStandards as any)[roomId];
  const targetMin = standard ? standard.min : 100;
  const targetMax = standard ? standard.max : 300;
  const targetLux = targetMin; // Primary target for surface verdicts

  const floorResult = surfaceResults.find(s => s.name.toLowerCase().includes('floor')) || surfaceResults[0];
  const averageLux = floorResult ? floorResult.average : 0;

  let status: 'under' | 'optimal' | 'over' = 'optimal';
  let message = t('pdf.recommender.meetsStandard');

  if (lights.length === 0) {
    status = 'under';
    message = t('pdf.recommender.noLights');
  } else if (averageLux < targetMin) {
    status = 'under';
    message = t('pdf.recommender.underlit')
      .replace('{{lux}}', Math.round(averageLux).toString())
      .replace('{{target}}', targetMin.toString());
  } else if (averageLux > targetMax * 1.5) {
    status = 'over';
    
    // Check wall status
    const walls = surfaceResults.filter(s => s.name.toLowerCase().includes('wall'));
    const wallTarget = 75;
    const overlitWalls = walls.filter(w => w.average > wallTarget * 1.5);
    const darkWalls = walls.filter(w => w.average < wallTarget * 0.5);

    if (overlitWalls.length > 0) {
      message = t('pdf.recommender.overlitWalls')
        .replace('{{lux}}', Math.round(averageLux).toString())
        .replace('{{room}}', roomId.toUpperCase());
    } else if (darkWalls.length > 0) {
      message = t('pdf.recommender.darkWalls')
        .replace('{{lux}}', Math.round(averageLux).toString())
        .replace('{{room}}', roomId.toUpperCase());
    } else {
      message = t('pdf.recommender.overlitGeneric')
        .replace('{{lux}}', Math.round(averageLux).toString())
        .replace('{{room}}', roomId.toUpperCase());
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
        title: t('pdf.recommender.mixedTempsTitle'),
        detail: t('pdf.recommender.mixedTempsDetail')
          .replace('{{minTemp}}', minTemp.toString())
          .replace('{{maxTemp}}', maxTemp.toString())
      });
    }
  }

  // Check for outdoor/balcony/garden rooms needing IP-rated fixtures
  const isOutdoorRoom = roomId === 'outdoor' || roomId === 'balcony' || roomId === 'garden';
  if (isOutdoorRoom && lights.length > 0) {
    flags.push({
      severity: 'warning',
      code: 'INDOOR_OUTDOOR',
      title: t('pdf.recommender.weatherResistanceTitle'),
      detail: t('pdf.recommender.weatherResistanceDetail')
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
