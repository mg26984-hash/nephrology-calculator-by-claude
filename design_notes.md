# Kidney.org Calculator Design Notes

## Unit Toggle Design
- Unit toggle is inline with the input field (mg/dL | μmol/L)
- Radio buttons placed directly next to the input
- Clean horizontal layout: Input field | unit toggle buttons
- No global unit toggle - each field has its own unit selector

## Key Design Elements
1. Serum Creatinine: Input field with mg/dL / μmol/L toggle
2. Serum Cystatin C: Input field with mg/L unit (fixed)
3. Age: Input field with "Years" label
4. Gender: Male/Female radio buttons
5. Calculate button

## Implementation Plan
- Add inline unit toggle for each input that supports multiple units
- Remove global SI/Conventional toggle from header
- Each input field should have its own unit selector
- Use radio buttons or segmented control for unit selection
