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

All calculator `type: "number"` inputs render as `<input type="text" inputMode="decimal">` in Dashboard.tsx, NOT `type="number"`. This guarantees a numpad keyboard on all mobile devices.

1. **Never use `type="number"`** on calculator inputs — always `type="text"` with `inputMode="decimal"`
2. **onChange uses regex validation** — `/^\d*\.?\d*$/` blocks non-numeric characters while allowing decimal typing (e.g., "5." is preserved, not truncated to "5")
3. **Values stored as strings** — all calculation code uses `Number(val) || 0` which handles strings identically
4. **Floating calculate button** uses `useKeyboardOffset()` hook (Visual Viewport API) to stay above the mobile keyboard
