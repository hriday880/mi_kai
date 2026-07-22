# Data Flow Tracer

## Untrusted Input Mapping

- **Entry Point**: `generatePDFReport` and `generateRecommendations` which receives data from `StudioClient` (frontend state or API payload).
- **Transformer**:
  - `renderDataUrls` strings are mapped directly into `doc.addImage(..., 'FAST')`. If an invalid data URL is passed, jsPDF throws an unhandled exception.
  - `surfaceResults` flows into `recommender.ts` to calculate `averageLux` and `status`. It also flows into `pdf-builder.ts` to generate heatmaps (`generateHeatmapDataURL`).
- **Sink**: Output PDF blob generated via `doc.output('datauristring')`. There is no file system write directly, but the data uri is returned to the client.
- **Conclusion**: Data bounds and format checking should be enforced *before* reaching these library functions to ensure stable generation.
