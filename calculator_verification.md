# Nephrology Calculator Verification Checklist

## Verification Process
For each calculator:
1. Identify trusted online reference calculator
2. Test with standard input values
3. Compare results
4. Fix formula if discrepancy found
5. Re-test to confirm fix

---

## CATEGORY 1: KIDNEY FUNCTION (7 calculators)

### 1. CKD-EPI Creatinine (2021)
- [x] Reference: https://www.kidney.org/professionals/gfr_calculator
- [x] Test Case: Male, 50y, Cr 1.0 mg/dL → Expected: 92 mL/min/1.73m²
- [x] Status: VERIFIED ✓ (Our result: 92.00, NKF result: 92)

### 2. Cockcroft-Gault Creatinine Clearance
- [ ] Reference: https://www.mdcalc.com/calc/43/creatinine-clearance-cockcroft-gault-equation
- [ ] Test Case: Male, 55y, 70kg, Cr 1.2 mg/dL → Expected: ~69 mL/min
- [ ] Status: PENDING

### 3. Schwartz Pediatric eGFR
- [ ] Reference: https://www.mdcalc.com/calc/3939/revised-schwartz-equation-glomerular-filtration-rate-gfr-2009
- [ ] Test Case: Height 120cm, Cr 0.5 mg/dL → Expected: ~99 mL/min/1.73m²
- [ ] Status: PENDING

### 4. Kinetic eGFR
- [ ] Reference: https://www.mdcalc.com/calc/10008/kinetic-estimated-glomerular-filtration-rate-kegfr
- [ ] Test Case: Cr1 1.0, Cr2 2.0, Time 24h → Expected: Variable
- [ ] Status: PENDING

### 5. CKD-EPI Creatinine-Cystatin C Combined
- [ ] Reference: https://www.kidney.org/professionals/gfr_calculator
- [ ] Test Case: Male, 55y, Cr 1.2, CysC 1.0 → Expected: ~71 mL/min/1.73m²
- [ ] Status: PENDING

### 6. Annual eGFR Decline (Slope)
- [ ] Reference: Manual calculation (eGFR2 - eGFR1) / years
- [ ] Test Case: eGFR1 60, eGFR2 50, 2 years → Expected: -5 mL/min/1.73m²/year
- [ ] Status: PENDING

### 7. Kidney Failure Risk Equation (KFRE)
- [ ] Reference: https://kidneyfailurerisk.com/
- [ ] Test Case: Age 60, Sex M, eGFR 30, ACR 300 → Expected: ~15-20% 5-year risk
- [ ] Status: PENDING

---

## CATEGORY 2: AKI WORKUP (6 calculators)

### 8. Fractional Excretion of Sodium (FENa)
- [ ] Reference: https://www.mdcalc.com/calc/60/fractional-excretion-sodium-fena
- [ ] Test Case: UNa 40, PNa 140, UCr 100, PCr 1.0 → Expected: 0.29%
- [ ] Status: PENDING

### 9. Fractional Excretion of Urea (FEUrea)
- [ ] Reference: https://www.mdcalc.com/calc/62/fractional-excretion-urea-feurea
- [ ] Test Case: UUrea 300, PUrea 20, UCr 100, PCr 1.0 → Expected: 15%
- [ ] Status: PENDING

### 10. Serum Anion Gap
- [ ] Reference: https://www.mdcalc.com/calc/1669/anion-gap
- [ ] Test Case: Na 140, Cl 100, HCO3 24 → Expected: 16 mEq/L
- [ ] Status: PENDING

### 11. Delta Gap (Delta-Delta Ratio)
- [ ] Reference: https://www.mdcalc.com/calc/1669/anion-gap (includes delta)
- [ ] Test Case: AG 20, HCO3 18 → Expected: Delta Gap 8, Delta Ratio ~1.3
- [ ] Status: PENDING

### 12. Serum Osmolal Gap
- [ ] Reference: https://www.mdcalc.com/calc/91/serum-osmolality-osmolarity
- [ ] Test Case: Measured 310, Na 140, Glucose 100, BUN 20 → Expected: ~10
- [ ] Status: PENDING

### 13. Urine Anion Gap
- [ ] Reference: https://www.mdcalc.com/calc/1741/urine-anion-gap
- [ ] Test Case: UNa 50, UK 30, UCl 60 → Expected: 20 (positive)
- [ ] Status: PENDING

---

## CATEGORY 3: ELECTROLYTES (7 calculators)

### 14. TTKG (Transtubular Potassium Gradient)
- [ ] Reference: https://www.mdcalc.com/calc/94/transtubular-potassium-gradient-ttkg
- [ ] Test Case: UK 40, PK 4.0, UOsm 600, POsm 300 → Expected: 5
- [ ] Status: PENDING

### 15. Water Deficit in Hypernatremia
- [ ] Reference: https://www.mdcalc.com/calc/113/free-water-deficit-hypernatremia
- [ ] Test Case: Male, 70kg, Na 155 → Expected: ~4.4L
- [ ] Status: PENDING

### 16. Corrected Sodium in Hyperglycemia
- [ ] Reference: https://www.mdcalc.com/calc/50/sodium-correction-hyperglycemia
- [ ] Test Case: Na 130, Glucose 500 → Expected: ~136 mEq/L
- [ ] Status: PENDING

### 17. Sodium Correction Rate in Hyponatremia
- [ ] Reference: Manual calculation
- [ ] Test Case: Na1 120, Na2 126, Time 12h → Expected: 0.5 mEq/L/hr
- [ ] Status: PENDING

### 18. Sodium Deficit in Hyponatremia
- [ ] Reference: https://www.mdcalc.com/calc/480/sodium-deficit-hyponatremia
- [ ] Test Case: Male, 70kg, Na 120, Target 130 → Expected: ~420 mEq
- [ ] Status: PENDING

### 19. Corrected Calcium for Albumin
- [ ] Reference: https://www.mdcalc.com/calc/31/calcium-correction-hypoalbuminemia
- [ ] Test Case: Ca 8.0, Alb 2.0 → Expected: 9.6 mg/dL
- [ ] Status: PENDING

### 20. Corrected QT Interval (QTc - Bazett)
- [ ] Reference: https://www.mdcalc.com/calc/48/corrected-qt-interval-qtc
- [ ] Test Case: QT 400ms, HR 60 → Expected: 400ms
- [ ] Status: PENDING

---

## CATEGORY 4: PROTEINURIA (4 calculators)

### 21. Urine Albumin-to-Creatinine Ratio (uACR)
- [ ] Reference: Manual calculation
- [ ] Test Case: Albumin 300mg/L, Creatinine 100mg/dL → Expected: 300 mg/g
- [ ] Status: PENDING

### 22. Urine Protein-to-Creatinine Ratio (UPCR)
- [ ] Reference: Manual calculation
- [ ] Test Case: Protein 500mg/dL, Creatinine 100mg/dL → Expected: 5.0 g/g
- [ ] Status: PENDING

### 23. Estimated ACR from PCR
- [ ] Reference: Literature formula
- [ ] Test Case: PCR 1.0 → Expected: ~0.7 ACR
- [ ] Status: PENDING

### 24. IgA Nephropathy Prediction Tool
- [ ] Reference: https://qxmd.com/calculate/calculator_499/international-igan-prediction-tool
- [ ] Test Case: Various inputs → Compare with reference
- [ ] Status: PENDING

---

## CATEGORY 5: DIALYSIS ADEQUACY (9 calculators)

### 25. Kt/V (Hemodialysis)
- [ ] Reference: https://www.mdcalc.com/calc/10012/kt-v-calculator-hemodialysis-adequacy
- [ ] Test Case: Pre-BUN 70, Post-BUN 20, UF 3L, Weight 70kg, Time 240min → Expected: ~1.4
- [ ] Status: PENDING

### 26. Total Body Water (Watson)
- [ ] Reference: https://www.mdcalc.com/calc/10013/total-body-water-watson-formula
- [ ] Test Case: Male, 70kg, 170cm, 50y → Expected: ~38L
- [ ] Status: PENDING

### 27. HD Session Duration from Target Kt/V
- [ ] Reference: Derived from Kt/V formula
- [ ] Test Case: Target Kt/V 1.4, K 250, V 40L → Expected: ~224 min
- [ ] Status: PENDING

### 28. Peritoneal Dialysis Weekly Kt/V
- [ ] Reference: https://www.mdcalc.com/calc/10014/peritoneal-dialysis-kt-v
- [ ] Test Case: Dialysate volume, urea concentrations → Compare
- [ ] Status: PENDING

### 29. Residual Kidney Function Kt/V
- [ ] Reference: Derived formula
- [ ] Test Case: Urine volume, urea clearance → Compare
- [ ] Status: PENDING

### 30. Equilibrated Kt/V (eKt/V)
- [ ] Reference: https://www.hdcn.com/calcf/dzer.htm
- [ ] Test Case: spKt/V 1.4, Time 240min → Expected: ~1.2
- [ ] Status: PENDING

### 31. Standard Kt/V (stdKt/V)
- [ ] Reference: Literature formula
- [ ] Test Case: Weekly Kt/V values → Compare
- [ ] Status: PENDING

### 32. Urea Reduction Ratio (URR)
- [ ] Reference: https://www.mdcalc.com/calc/10011/urea-reduction-ratio-urr
- [ ] Test Case: Pre-BUN 70, Post-BUN 20 → Expected: 71.4%
- [ ] Status: PENDING

### 33. Iron Deficit (Ganzoni)
- [ ] Reference: https://www.mdcalc.com/calc/10009/ganzoni-equation-iron-deficiency-anemia
- [ ] Test Case: Weight 70kg, Actual Hb 8, Target Hb 12, Iron stores 500 → Expected: ~1260mg
- [ ] Status: PENDING

---

## CATEGORY 6: TRANSPLANTATION (4 calculators)

### 34. KDPI (Kidney Donor Profile Index)
- [ ] Reference: https://optn.transplant.hrsa.gov/data/allocation-calculators/kdpi-calculator/
- [ ] Test Case: Age 50, Height 170, Weight 80, etc. → Compare
- [ ] Status: PENDING

### 35. EPTS (Estimated Post-Transplant Survival)
- [ ] Reference: https://optn.transplant.hrsa.gov/data/allocation-calculators/epts-calculator/
- [ ] Test Case: Age 50, Dialysis time 3y, Diabetes No → Compare
- [ ] Status: PENDING

### 36. Banff Classification
- [ ] Reference: Banff 2019 criteria manual review
- [ ] Test Case: i=2, t=2, v=0 → Expected: TCMR Grade IA
- [ ] Status: VERIFIED ✓

### 37. Tacrolimus Monitoring
- [ ] Reference: Clinical guidelines
- [ ] Test Case: Trough level interpretation → Compare
- [ ] Status: PENDING

---

## CATEGORY 7: CARDIOVASCULAR (2 calculators)

### 38. ASCVD Risk Calculator
- [ ] Reference: https://tools.acc.org/ascvd-risk-estimator-plus/
- [ ] Test Case: Age 55, Male, TC 200, HDL 50, SBP 140, etc. → Compare
- [ ] Status: PENDING

### 39. Statin Intensity Guide
- [ ] Reference: ACC/AHA guidelines
- [ ] Test Case: Various risk levels → Compare recommendations
- [ ] Status: PENDING

---

## CATEGORY 8: ANTHROPOMETRIC (6 calculators)

### 40. BMI
- [ ] Reference: https://www.mdcalc.com/calc/29/body-mass-index-bmi-body-surface-area-bsa
- [ ] Test Case: Weight 70kg, Height 170cm → Expected: 24.2 kg/m²
- [ ] Status: PENDING

### 41. BSA (Du Bois)
- [ ] Reference: https://www.mdcalc.com/calc/29/body-mass-index-bmi-body-surface-area-bsa
- [ ] Test Case: Weight 70kg, Height 170cm → Expected: 1.81 m²
- [ ] Status: PENDING

### 42. BSA (Mosteller)
- [ ] Reference: https://www.mdcalc.com/calc/29/body-mass-index-bmi-body-surface-area-bsa
- [ ] Test Case: Weight 70kg, Height 170cm → Expected: 1.82 m²
- [ ] Status: PENDING

### 43. Ideal Body Weight (Devine)
- [ ] Reference: https://www.mdcalc.com/calc/68/ideal-body-weight-adjusted-body-weight
- [ ] Test Case: Male, Height 170cm → Expected: 66 kg
- [ ] Status: PENDING

### 44. Lean Body Weight (Janmahasatian)
- [ ] Reference: Literature formula
- [ ] Test Case: Male, 70kg, 170cm → Expected: ~55 kg
- [ ] Status: PENDING

### 45. Adjusted Body Weight
- [ ] Reference: https://www.mdcalc.com/calc/68/ideal-body-weight-adjusted-body-weight
- [ ] Test Case: Actual 100kg, IBW 70kg → Expected: 82 kg
- [ ] Status: PENDING

---

## CATEGORY 9: CKD-MBD (1 calculator)

### 46. Calcium-Phosphate Product
- [ ] Reference: Manual calculation
- [ ] Test Case: Ca 10, Phos 5 → Expected: 50 mg²/dL²
- [ ] Status: PENDING

---

## CATEGORY 10: SYSTEMIC DISEASES (6 calculators)

### 47. SLEDAI-2K
- [ ] Reference: https://www.mdcalc.com/calc/2194/systemic-lupus-erythematosus-disease-activity-index-2000-sledai-2k
- [ ] Test Case: Various criteria → Compare score
- [ ] Status: PENDING

### 48. SLICC 2012 Criteria
- [ ] Reference: https://www.mdcalc.com/calc/10159/slicc-criteria-systemic-lupus-erythematosus-sle-2012
- [ ] Test Case: Various criteria → Compare classification
- [ ] Status: PENDING

### 49. FRAIL Scale
- [ ] Reference: https://www.mdcalc.com/calc/10168/frail-scale
- [ ] Test Case: 3 positive items → Expected: Frail
- [ ] Status: PENDING

### 50. PRISMA-7
- [ ] Reference: Literature
- [ ] Test Case: Various items → Compare score
- [ ] Status: PENDING

### 51. CURB-65
- [ ] Reference: https://www.mdcalc.com/calc/324/curb-65-score-pneumonia-severity
- [ ] Test Case: Age 70, BUN 25, RR 32, SBP 85, Confused → Expected: 4
- [ ] Status: PENDING

### 52. ROKS Nomogram
- [ ] Reference: https://www.mdcalc.com/calc/10018/roks-recurrence-kidney-stone-prediction
- [ ] Test Case: Various risk factors → Compare
- [ ] Status: PENDING

---

## CATEGORY 11: BONE (1 calculator)

### 53. FRAX Fracture Risk
- [ ] Reference: https://frax.shef.ac.uk/
- [ ] Test Case: Age 70, Female, Prior fracture → Compare 10-year risk
- [ ] Status: PENDING

---

## Summary
- Total Calculators: 53
- Verified: 3
- Pending: 50
- Failed: 0
