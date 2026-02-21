# Nephrology Calculator - Development Rules

## Unit Conversion Rules (CRITICAL)

All calculator inputs that accept values with multiple possible units MUST have:

1. **Inline toggle unit conversion** — a pill-button toggle rendered next to the input field (via `unitOptions` in Dashboard.tsx), NOT a separate select dropdown.

2. **Linked units** — when a calculator has multiple inputs of the same measurement type (e.g., baseline creatinine + current creatinine), toggling the unit on ANY one of them MUST switch ALL of them to the same unit. This is handled in `handleUnitChange` via `creatinineGroups`.

3. **Default to one unit type** — when the user selects a unit for one input, all related inputs should default to match.

4. **Never use redundant select dropdowns** — do NOT add `type: "select"` inputs for unit selection (like `creatinineUnit` or `bunUnit`). The inline toggle pills handle this. Inputs ending with "Unit" are filtered out of the form anyway.

## Common Unit Toggles

Defined in `unitOptions` (Dashboard.tsx):
- Creatinine: mg/dL ↔ μmol/L (factor: 88.4)
- BUN/Urea: 4-option toggle via `bunUreaInputIds` (BUN mg/dL, BUN mmol/L, Urea mg/dL, Urea mmol/L)
- Albumin: g/dL ↔ g/L (factor: 10)
- Glucose: mg/dL ↔ mmol/L (factor: 18.0182)
- Calcium: mg/dL ↔ mmol/L (factor: 4.0)

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
- Domain: nephrocalcs.xyz

## KDPI Calculator (CRITICAL)
- Uses exact OPTN 2024 Refit formula (8 factors, no race/HCV)
- DCD coefficient: 0.1966
- Age threshold: >= 50
- Full-precision OPTN mapping table (14-digit values)
- NEVER change these coefficients without verifying against official OPTN documentation
