# Invariants Verifier

## Boundary Conditions & Guarantees

1. **`surfaceResults.length > 0`**:
   - **Verification**: FAILED. `recommender.ts` assumes `surfaceResults[0]` exists.
2. **Division by Zero Protection**:
   - **Verification**: PASSED. `actualMaxLux = surface.max > 0 ? surface.max : 1;` is used, and uniformity checks `surface.average > 0`.
3. **Data Types**:
   - **Verification**: WARNING. `placedLights` is typed as `any[]` and `productsData` as `any[]`, meaning type guarantees are bypassed at compile time.
4. **Resource Cleanup**:
   - **Verification**: PASSED. jsPDF instance is localized and garbage collected after function execution since it returns a string and holds no global references.
