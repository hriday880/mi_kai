# Patch Synthesizer

## Refactored Code Diffs

### Fix 1: `lib/recommender.ts` empty array crash prevention

```diff
--- lib/recommender.ts
+++ lib/recommender.ts
@@ -29,6 +29,10 @@
   const targetMax = standard ? standard.max : 300;
   const targetLux = targetMin; // Primary target for surface verdicts
 
+  if (!surfaceResults || surfaceResults.length === 0) {
+    return { status: 'under', targetRange: [targetMin, targetMax], targetLux, message: t('pdf.recommender.noData'), flags: [] };
+  }
+
   const floorResult = surfaceResults.find(s => s.name.toLowerCase().includes('floor')) || surfaceResults[0];
   const averageLux = floorResult ? floorResult.average : 0;
```

### Fix 2: Type tightening in `pdf-builder.ts`

```typescript
// Replace any[] with properly defined interfaces
export interface PlacedLight {
  productId: string;
  wattage: number;
  colorTemp: number;
  reflectorColor: string;
}

// update function signature
  placedLights: PlacedLight[];
  productsData: Product[];
```

## Unit Test Stubs

```typescript
describe('Recommender', () => {
  it('should handle empty surfaceResults gracefully', () => {
    const result = generateRecommendations('office', [], [], (k) => k);
    expect(result.status).toBe('under');
  });
});
```
