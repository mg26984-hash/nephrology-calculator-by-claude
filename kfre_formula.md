# KFRE Formula (from ukidney.com)

## Kidney Failure Risk Equation

```
KFRE = 1 - exp(-exp(X))

where X = (0.220 × Age) + (0.246 × Male) + (0.451 × eGFR) + (0.556 × Albuminuria) - 1.957
```

Note: This is the 5-year risk equation. The coefficients are:
- Age coefficient: 0.220 (per year)
- Male coefficient: 0.246 (1 if male, 0 if female)
- eGFR coefficient: 0.451 (negative relationship - lower eGFR = higher risk)
- Albuminuria coefficient: 0.556 (log ACR)
- Intercept: -1.957

Wait - looking at this more carefully, the formula seems to use negative eGFR coefficient.
Let me verify by calculating:
- Age 60, Male, eGFR 30, ACR 300 (log(300) = 5.7)
- X = 0.220×60 + 0.246×1 + 0.451×30 + 0.556×5.7 - 1.957
- X = 13.2 + 0.246 + 13.53 + 3.17 - 1.957 = 28.19

That doesn't look right. The eGFR coefficient should be negative.

Looking at the original Tangri paper, the correct 4-variable KFRE formula is:

For 5-year risk (North America):
1 - 0.9240^exp(β₁×(age/10 - 7.036) + β₂×male - β₃×(eGFR/5 - 7.222) + β₄×(ln(ACR) - 5.137))

Where:
- β₁ = 0.2467 (age)
- β₂ = 0.5567 (male)
- β₃ = 0.5567 (eGFR)
- β₄ = 0.4510 (ln ACR)
