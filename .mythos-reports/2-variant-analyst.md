# Variant Analyst

## Structural Variants & Logic Flaws

- **Variant 1**: Insufficient checks before accessing array indexes or object properties from user-provided inputs.
  - *Location*: `lib/recommender.ts` (`surfaceResults.find(...) || surfaceResults[0]`)
  - *Location*: `lib/pdf-builder.ts` (`placedLights.forEach`, `renderDataUrls[0]`, `renderDataUrls[1]`)
- **Variant 2**: Missing bounds checking on arrays used for PDF generation.
  - *Location*: `lib/pdf-builder.ts` - `renderDataUrls` handles indexing 0, 1, 2 safely via `.length` checks, but if `productsData` is empty while `placedLights` has items, it results in undefined products leading to fallbacks like `Product ${light.productId}`.
- **Variant 3**: Incomplete handling of edge case values (e.g., negative lux values, although domain specific, could cause unexpected string translations or logic).
