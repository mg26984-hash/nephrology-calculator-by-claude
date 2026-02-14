# CKD-EPI 2021 Test Results Comparison

## Reference from kidney.org:
- Creatinine: 1.2 mg/dL
- Age: 55 years
- Sex: Male
- **Result: 71 mL/min/1.73m²** (CKD Stage G2)

## My calculator result:
- Same inputs
- **Result: 110 mL/min/1.73m²** (WRONG!)

## Problem Analysis:
The current formula is incorrect. The CKD-EPI 2021 equation should be:

**CKD-EPI Creatinine Equation (2021) - Race-Free:**

For **Female**:
- If Scr ≤ 0.7: eGFR = 142 × (Scr/0.7)^(-0.241) × 0.9938^Age × 1.012
- If Scr > 0.7: eGFR = 142 × (Scr/0.7)^(-1.200) × 0.9938^Age × 1.012

For **Male**:
- If Scr ≤ 0.9: eGFR = 142 × (Scr/0.9)^(-0.302) × 0.9938^Age
- If Scr > 0.9: eGFR = 142 × (Scr/0.9)^(-1.200) × 0.9938^Age

Where:
- Scr = serum creatinine in mg/dL
- Age = age in years

## Verification:
For Male, Age 55, Creatinine 1.2 mg/dL:
- Since 1.2 > 0.9, use: eGFR = 142 × (1.2/0.9)^(-1.200) × 0.9938^55
- = 142 × (1.333)^(-1.200) × 0.9938^55
- = 142 × 0.7123 × 0.7076
- = 71.6 ≈ 71 mL/min/1.73m²

This matches the kidney.org result!
