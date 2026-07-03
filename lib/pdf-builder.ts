import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RecommendationResult } from './recommender';
import { SurfaceResult, generateHeatmapDataURL } from './lux-calculator';

function getSurfaceStatus(surface: SurfaceResult, mainTargetLux: number) {
  const isFloor = surface.name.toLowerCase().includes('floor');
  const isCeiling = surface.name.toLowerCase().includes('ceiling');
  
  if (isCeiling) {
    return { status: 'INFO', message: 'Ceiling illuminance typically relies on indirect bounces or uplighting, which are not calculated in this direct-light simulation.' };
  }
  
  const target = isFloor ? mainTargetLux : 75; // 75 lux is a standard baseline for vertical walls
  const uniformity = surface.average > 0 ? (surface.min / surface.average) : 0;
  
  if (surface.average > target * 1.5) {
    return { status: 'OVERLIT', message: `Surface is significantly brighter than target (~${target}lx). Consider reducing wattage or fixture count.` };
  }
  
  if (surface.average >= target * 0.85) {
    if (uniformity >= 0.1) {
      return { status: 'OPTIMAL', message: `Surface meets target illuminance with acceptable uniformity.` };
    } else {
      return { status: 'POOR UNIFORMITY', message: `Surface meets average lux target, but has dark spots (Emin: ${Math.round(surface.min)}lx).` };
    }
  }
  
  if (surface.average >= target * 0.5) {
    return { status: 'SUBOPTIMAL', message: `Surface is slightly underlit. Target is ~${target}lx.` };
  }
  
  return { status: 'POOR', message: `Surface is severely underlit. Target is ~${target}lx.` };
}

const REFLECTOR_COLORS = [
  { name: 'Matte Black', hex: '#1a1a1a' },
  { name: 'Matte White', hex: '#f0f0f0' },
  { name: 'Champagne Gold', hex: '#d4af37' },
  { name: 'Chrome', hex: '#e0e0e0' }
];

export async function generatePDFReport({
  roomId,
  dimensions,
  renderDataUrls,
  surfaceResults,
  recommendation,
  placedLights,
  productsData
}: {
  roomId: string;
  dimensions: { width: number, length: number, height: number };
  renderDataUrls: string[];
  surfaceResults: SurfaceResult[];
  recommendation: RecommendationResult;
  placedLights: any[]; // from StudioClient PlacedLight
  productsData: any[];
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Helpers
  const addHeader = (title: string) => {
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(212, 175, 55); // Gold
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('MI-KAI TOKYO', 15, 16);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(title, pageWidth - 15, 16, { align: 'right' });
  };

  const addFooter = (pageNumber: number) => {
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text(`MI-KAI LIGHT STUDIO - Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  };

  let pageNum = 1;

  // --- PAGE 1: COVER & RENDERINGS ---
  addHeader('Project Renderings');
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text('Lighting Design Report', 15, 40);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 15, 48);
  doc.text(`Room Type: ${roomId.toUpperCase()}`, 15, 54);
  doc.text(`Dimensions: ${dimensions.width}m (W) x ${dimensions.length}m (L) x ${dimensions.height || 3}m (H)`, 15, 60);
  
  // Draw Multiple Renders
  if (renderDataUrls && renderDataUrls.length > 0) {
    const mainImg = renderDataUrls[0];
    doc.addImage(mainImg, 'JPEG', 15, 70, pageWidth - 30, 100, '', 'FAST');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.rect(15, 70, pageWidth - 30, 100);

    if (renderDataUrls.length >= 3) {
      const subWidth = (pageWidth - 35) / 2;
      doc.addImage(renderDataUrls[1], 'JPEG', 15, 175, subWidth, 75, '', 'FAST');
      doc.rect(15, 175, subWidth, 75);
      
      doc.addImage(renderDataUrls[2], 'JPEG', 20 + subWidth, 175, subWidth, 75, '', 'FAST');
      doc.rect(20 + subWidth, 175, subWidth, 75);
    }
  }

  addFooter(pageNum++);

  // --- PAGE 2: LUMINAIRE PARTS LIST (BOM) ---
  doc.addPage();
  addHeader('Luminaire Parts List');
  
  const partsMap = new Map<string, any>();
  let totalPower = 0;

  placedLights.forEach(light => {
    const key = `${light.productId}-${light.wattage}-${light.colorTemp}-${light.reflectorColor}`;
    if (!partsMap.has(key)) {
      const prod = productsData.find(p => p.id === light.productId);
      const finishName = REFLECTOR_COLORS.find(c => c.hex.toLowerCase() === light.reflectorColor.toLowerCase())?.name || light.reflectorColor;
      partsMap.set(key, {
        name: prod ? prod.category : `Product ${light.productId}`,
        wattage: light.wattage,
        cct: light.colorTemp,
        finish: finishName,
        quantity: 1,
        totalWatts: light.wattage
      });
    } else {
      const entry = partsMap.get(key);
      entry.quantity += 1;
      entry.totalWatts += light.wattage;
    }
    totalPower += light.wattage;
  });

  const tableBody = Array.from(partsMap.values()).map((p, i) => [
    i + 1,
    p.name,
    `${p.wattage}W`,
    `${p.cct}K`,
    p.finish,
    p.quantity,
    `${p.totalWatts}W`
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['#', 'Luminaire / Type', 'Power', 'CCT', 'Reflector Finish', 'Qty', 'Total Power']],
    body: tableBody,
    headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 15, right: 15 }
  });

  let finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont("helvetica", "bold");
  doc.text(`Total Installed Power: ${totalPower} W`, 15, finalY);
  
  const roomArea = dimensions.width * dimensions.length;
  const powerDensity = (totalPower / roomArea).toFixed(2);
  doc.text(`Specific Connected Load: ${powerDensity} W/m²`, 15, finalY + 7);

  // Recommendation status
  finalY += 25;
  doc.setFillColor(recommendation.status === 'optimal' ? 230 : 255, recommendation.status === 'under' ? 230 : 255, 230);
  doc.rect(15, finalY, pageWidth - 30, 20, 'F');
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Design Status: ${recommendation.status.toUpperCase()}`, 20, finalY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(recommendation.message, pageWidth - 40), 20, finalY + 14);

  // Render Warnings and Info Flags
  let yFlag = finalY + 30;
  recommendation.flags.forEach(flag => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(flag.severity === 'warning' ? 220 : 100, flag.severity === 'warning' ? 50 : 100, 50);
    doc.text(`${flag.severity.toUpperCase()}: ${flag.title}`, 15, yFlag);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(doc.splitTextToSize(flag.detail, pageWidth - 30), 15, yFlag + 6);
    yFlag += 16;
  });

  addFooter(pageNum++);

  // --- MULTIPLE PAGES: SURFACE MAPS ---
  // Create a page for each surface
  for (const surface of surfaceResults) {
    // Skip the ceiling page from the PDF report entirely
    if (surface.name.toLowerCase().includes('ceiling')) {
      continue;
    }
    
    doc.addPage();
    addHeader(`Illuminance Map: ${surface.name}`);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(`Calculation Surface: ${surface.name}`, 15, 40);
    doc.text(`Grid Spacing: 0.5m x 0.5m`, 15, 45);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const roundedAvg = Math.round(surface.average);
    const roundedMin = Math.round(surface.min);
    
    doc.text(`Em: ${roundedAvg} lx`, 120, 40);
    doc.text(`Emin: ${roundedMin} lx`, 155, 40);
    doc.text(`Emax: ${Math.round(surface.max)} lx`, 120, 45);
    const uniformity = roundedAvg > 0 ? (roundedMin / roundedAvg).toFixed(2) : '0.00';
    doc.text(`U0: ${uniformity}`, 155, 45);

    // Surface Status Box
    const surfVerdict = getSurfaceStatus(surface, recommendation.targetLux);
    if (surfVerdict.status === 'OPTIMAL') doc.setFillColor(230, 255, 230); // light green
    else if (surfVerdict.status === 'SUBOPTIMAL') doc.setFillColor(255, 245, 230); // light orange
    else if (surfVerdict.status === 'OVERLIT') doc.setFillColor(255, 255, 210); // light yellow
    else if (surfVerdict.status === 'INFO') doc.setFillColor(240, 240, 245); // light blue-gray
    else doc.setFillColor(255, 230, 230); // light red
    
    doc.rect(15, 52, pageWidth - 30, 15, 'F');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Design Status: ${surfVerdict.status}`, 20, 58);
    doc.setFont("helvetica", "normal");
    doc.text(surfVerdict.message, 20, 63);

    // Draw Heatmap Image FIRST so grid draws on top
    const actualMaxLux = surface.max > 0 ? surface.max : 1; // Prevent division by zero
    const heatmapDataUrl = generateHeatmapDataURL(surface.heatmap, actualMaxLux);
    const gridStartX = 15;
    const gridStartY = 75; // Moved down to accommodate status box
    const maxBoxWidth = pageWidth - 30;
    const maxBoxHeight = 160;
    
    // Scale
    const scaleX = maxBoxWidth / surface.surfaceWidth;
    const scaleY = maxBoxHeight / surface.surfaceLength;
    const scale = Math.min(scaleX, scaleY); 
    
    const boxW = surface.surfaceWidth * scale;
    const boxH = surface.surfaceLength * scale;
    const offsetX = gridStartX + (maxBoxWidth - boxW) / 2;
    
    if (heatmapDataUrl) {
      doc.addImage(heatmapDataUrl, 'PNG', offsetX, gridStartY, boxW, boxH);
    }
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(offsetX, gridStartY, boxW, boxH);

    // Draw Grid Numbers
    const rows = surface.heatmap.length;
    if (rows > 0) {
      const cols = surface.heatmap[0].length;
      doc.setFontSize(5); // Make font small to fit dense grids
      doc.setTextColor(50, 50, 50);
      
      const cellW = 0.5 * scale;
      const cellH = 0.5 * scale;
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = Math.round(surface.heatmap[r][c]);
          const cx = offsetX + (c * cellW) + (cellW / 2);
          const cy = gridStartY + (r * cellH) + (cellH / 2) + 1; 
          
          if (val === Math.round(surface.max) && val > 0) {
            doc.setTextColor(255, 255, 255); // White text on dark red/hot heatmap
            doc.setFont("helvetica", "bold");
          } else {
            doc.setTextColor(15, 15, 15);
            doc.setFont("helvetica", "normal");
          }
          
          doc.text(val.toString(), cx, cy, { align: 'center' });
        }
      }
    }

    addFooter(pageNum++);
  }

  // Trigger download
  doc.save('Mi-KAI-Advanced-Report.pdf');
  
  return doc.output('datauristring');
}
