# KDPI Formula Reference - OPTN October 2024 Refit

Source: A Guide to Calculating and Interpreting the Kidney Donor Profile Index (KDPI)
Updated: April 21, 2025

## Table 1. KDRI Donor Factors and Model Coefficients

| Donor Characteristic | Applies to Which Donors | KDRI Coefficient (β) | KDRI Xβ Component |
|---------------------|------------------------|---------------------|-------------------|
| Age (integer years) | All | 0.0092 | 0.0092*(Age-40) |
| Age < 18 | Age < 18 | 0.0113 | 0.0113*(Age-18) |
| Age > 50 | Age > 50 | 0.0067 | 0.0067*(Age-50) |
| Height (cm) | All | -0.0557 | -0.0557*(Hgt-170)/10 |
| Weight (kg) | Weight < 80 kg | -0.0333 | -0.0333*(Wgt-80)/5 |
| History of Hypertension | Hypertensive | 0.1106 | 0.1106 |
| History of Diabetes | Diabetic | 0.2577 | 0.2577 |
| Cause of Death | Cause of Death: CVA | 0.0743 | 0.0743 |

## Additional factors (from page 3):
- Serum Creatinine: coefficient 0.2128 for (Creat - 1)
- Serum Creatinine > 1.5: additional coefficient -0.2199 for (Creat - 1.5)
- DCD Status: coefficient 0.1308

## Formula:
KDRI_Rao = exp(Xβ)

Where Xβ is the sum of all applicable components.

## Scaling Factor (2024):
The scaling factor for October 2024 refit is approximately 1.30900852563932

## KDPI Mapping:
KDPI is derived by mapping KDRI_Scaled to a cumulative percentage based on the reference population.

