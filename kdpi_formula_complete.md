# KDPI Formula - Complete Coefficients (OPTN 2024 Refit)

## KDRI Coefficients Table

| Donor Characteristic | Applies to | Coefficient (β) | Component |
|---------------------|------------|-----------------|-----------|
| Age (years) | All | 0.0092 | 0.0092*(Age-40) |
| Age < 18 | Age < 18 | 0.0113 | 0.0113*(Age-18) |
| Age > 50 | Age > 50 | 0.0067 | 0.0067*(Age-50) |
| Height (cm) | All | -0.0557 | -0.0557*(Hgt-170)/10 |
| Weight (kg) | Weight < 80 kg | -0.0333 | -0.0333*(Wgt-80)/5 |
| History of Hypertension | Hypertensive | 0.1106 | 0.1106 |
| History of Diabetes | Diabetic | 0.2577 | 0.2577 |
| Cause of Death | CVA | 0.0743 | 0.0743 |
| Serum Creatinine (mg/dL) | All | 0.2128 | 0.2128*(Creat-1) |
| Creatinine > 1.5 | Creat > 1.5 | -0.2199 | -0.2199*(Creat-1.5) |
| DCD Status | DCD | 0.1966 | 0.1966 |

## KDRI Calculation
1. Calculate Xβ = sum of all applicable KDRI score components
2. KDRI_RAO = e^(Xβ)
3. KDRI_SCALED = KDRI_RAO / scaling_factor
   - 2023 scaling factor: 1.30900852563932

## KDPI Mapping
- KDPI is the percentile rank of KDRI_SCALED
- Uses KDRI-to-KDPI mapping table from OPTN
- KDRI_RAO ranged from 0.65 to 3.91 in 2023
- KDRI_SCALED ranged from 0.49 to 2.97

## Notes
- Race and HCV status removed October 31, 2024
- Reference donor: age 40, non-diabetic (50th percentile)
- Lower KDPI = better quality kidney
