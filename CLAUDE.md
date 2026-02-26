# Nephrology Calculator - Development Rules

## Unit Conversion Rules (CRITICAL)

All calculator inputs that accept values with multiple possible units MUST have:

1. **Inline toggle unit conversion** — a pill-button toggle rendered next to the input field (via `unitOptions` in Dashboard.tsx), NOT a separate select dropdown.

2. **Linked units** — when a calculator has multiple inputs of the same measurement type (e.g., baseline creatinine + current creatinine), toggling the unit on ANY one of them MUST switch ALL of them to the same unit. This is handled in `handleUnitChange` via `creatinineGroups`.

3. **Default to one unit type** — when the user selects a unit for one input, all related inputs should default to match.

4. **Never use redundant select dropdowns** — do NOT add `type: "select"` inputs for unit selection (like `creatinineUnit` or `bunUnit`). The inline toggle pills handle this. Inputs ending with "Unit" are filtered out of the form anyway.

## Global Unit Preference (CRITICAL)

The site has a **global unit preference** (`conventional` or `si`) stored in localStorage (`nephrology-unit-preference`). When a user toggles ANY standard 2-option unit pill (conventional/si), it sets the global preference and clears all per-input overrides, so ALL inputs across ALL calculators follow the chosen system.

1. **Toggling one input changes everything** — switching creatinine to μmol/L sets global to "si", and ALL other inputs (glucose, albumin, calcium, height, etc.) also show SI units.
2. **`getInputUnit(id)`** returns `unitState[id] || globalUnitPreference` — no more hardcoded "conventional" default.
3. **BUN/ACR special toggles** — these use actual unit strings (e.g., "BUN (mmol/L)"), not "conventional"/"si". Their defaults also follow globalUnitPreference.
4. **Never hardcode "conventional" as default** — always use `globalUnitPreference` as the fallback.

## Dynamic Placeholders (CRITICAL)

Every input with a `unitOptions` entry MUST have a corresponding entry in the `typicalValues` dictionary inside `getDynamicPlaceholder` (Dashboard.tsx). This ensures placeholder text updates when units change.

1. **Format**: `inputId: { conventional: "value", si: "value" }` — values should be clinically typical.
2. **All unitOptions inputs covered** — if you add a new `unitOptions` entry, you MUST also add a `typicalValues` entry.
3. **BUN inputs** — handled separately via the BUN placeholder section (not typicalValues).
4. **KFRE ACR** — has special 3-option placeholder handling (mg/g, mg/mmol, mg/mg).

## Common Unit Toggles

Defined in `unitOptions` (Dashboard.tsx):
- Creatinine: mg/dL ↔ μmol/L (factor: 88.4) — 11 linked IDs
- BUN/Urea: 4-option toggle via `bunUreaInputIds` (BUN mg/dL, BUN mmol/L, Urea mg/dL, Urea mmol/L)
- Albumin: g/dL ↔ g/L (factor: 10)
- Glucose: mg/dL ↔ mmol/L (factor: 0.0555)
- Calcium: mg/dL ↔ mmol/L (factor: 0.25)
- Phosphate: mg/dL ↔ mmol/L (factor: 0.3229) — 4 linked IDs
- Magnesium: mg/dL ↔ mmol/L (factor: 0.4114) — 2 linked IDs
- Uric Acid: mg/dL ↔ μmol/L (factor: 59.48) — 2 linked IDs
- Height: cm ↔ in (factor: 0.3937)
- Hemoglobin: g/dL ↔ g/L (factor: 10)
- Cholesterol/HDL: mg/dL ↔ mmol/L (factor: 0.0259)
- Cystatin C: mg/L ↔ μmol/L (factor: 0.0749)
- Bilirubin: mg/dL ↔ μmol/L (factor: 17.1)
- ACR: mg/g ↔ mg/mmol (factor: 0.113)
- PCR: g/g ↔ mg/mmol (factor: 113)

## Yes/No Select Defaults (CRITICAL)

All calculator inputs with Yes/No options MUST:

1. **Default to "No"** — when a calculator is first loaded, all yes/no selects must initialize to the "No" value. This is handled by `getYesNoValue(input, false)` in Dashboard.tsx.

2. **"No" option listed first** — in the options array, the "No" option must come before "Yes" so it's the natural default: `options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]`

3. **Never default to "Yes"** — no clinical scoring input should assume a positive finding by default.

## Safe Value Passing in handleCalculate (CRITICAL)

When passing numeric values from `calculatorState` to calculator functions:

1. **Unit-converted inputs** — use `getValue(id)` which auto-converts SI→conventional via `normalizeValue`
2. **BUN/Urea inputs** — use `getBunValue(id)` which handles 4-way unit conversion
3. **Plain numeric inputs** (age, weight, height, time, sodium, etc.) — use `Number(calculatorState.X) || 0`, NEVER `calculatorState.X as number` (which passes empty strings and causes NaN)

## Stack
- React 19 + TypeScript + Tailwind + shadcn/ui
- GitHub Pages deployment (gh-pages branch of nephrology_calculator_dashboard repo)
- Domain: otccalcs.com (Vercel)

## KDPI Calculator (CRITICAL)
- Uses exact OPTN 2024 Refit formula (8 factors, no race/HCV)
- DCD coefficient: 0.1966
- Age threshold: >= 50
- Full-precision OPTN mapping table (14-digit values)
- NEVER change these coefficients without verifying against official OPTN documentation

## Mobile Numpad Inputs (CRITICAL)

ALL numeric `<Input>` fields — in Dashboard.tsx AND in sub-components (EGFRComparison, PEPathway, ConversionReferenceCard) — MUST use `type="text" inputMode="decimal" autoComplete="off"`, NOT `type="number"`. This guarantees a numpad keyboard on all mobile devices.

1. **Never use `type="number"`** on any numeric input anywhere in the codebase — always `type="text"` with `inputMode="decimal"`
2. **onChange uses regex validation** — `/^\d*\.?\d*$/` blocks non-numeric characters while allowing decimal typing (e.g., "5." is preserved, not truncated to "5")
3. **Values stored as strings** — all calculation code uses `Number(val) || 0` which handles strings identically
4. **Sub-component inputs follow the same pattern** — EGFRComparison (age, creatinine, weight, height), PEPathway (patient age, D-dimer), ConversionReferenceCard (converter value) all use `type="text" inputMode="decimal"` with the regex guard in onChange

## Mobile Calculate Button (CRITICAL)

The calculate button uses a two-tier approach to avoid overlapping inputs on short calculators:

1. **Inline button** — always visible on all screen sizes, in the natural document flow inside the card. Uses `ref={inlineCalculateRef}` for visibility tracking.
2. **Compact circular FAB** — a 56×56px (`w-14 h-14 rounded-full`) floating action button that ONLY appears when the inline button scrolls out of view (via IntersectionObserver). Positioned bottom-right, hidden on desktop (`lg:hidden`). Displays **"Go!"** text (`text-xs font-bold`), NOT an icon.
3. **FAB auto-scrolls to result** — the FAB calls `handleCalculate` which calculates and then scrolls to `resultCardRef` via `scrollIntoView({ behavior: 'smooth', block: 'start' })`.
4. **No full-width fixed bar** — the old full-width fixed bottom bar is removed. Never re-add it — it overlaps inputs on short calculators (2-3 inputs).
5. **No spacer div** — the old 80px spacer that compensated for the fixed bar is removed.
6. **Keyboard awareness** — the FAB repositions above the mobile keyboard via `useKeyboardOffset()` hook (Visual Viewport API): `bottom: Math.max(16, keyboardOffset + 16)`

## eGFR Comparison Layout (CRITICAL)

The EGFRComparison component uses a responsive layout for equation result cards:

1. **Stacked on mobile, side-by-side on sm+** — `flex-col sm:flex-row sm:items-center sm:justify-between` prevents the value column from being crushed into vertical single-character stacking on narrow screens.
2. **Left column (name/badge)** — uses `min-w-0` to allow text truncation, icon gets `shrink-0`.
3. **Right column (value/CKD stage)** — uses `shrink-0` so it never collapses. `text-left sm:text-right` for mobile alignment.
4. **Badge text** — keep short (e.g., "Recommended" not "Recommended for this patient") to save horizontal space. Name+badge row uses `flex-wrap`.

## Result Color Coding IDs (CRITICAL)

Calculator IDs in `resultColorCoding.ts` switch cases MUST exactly match the calculator IDs in `calculatorData.ts`. Use hyphens (e.g., `'curb-65'` not `'curb65'`). Always verify the case string matches the calculator's `id` field.
