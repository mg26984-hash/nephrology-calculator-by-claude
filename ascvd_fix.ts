export function ascvdRisk(
  age: number,
  sex: "M" | "F",
  totalCholesterol: number,
  hdl: number,
  systolicBP: number,
  treated: boolean,
  diabetes: boolean,
  smoker: boolean,
  race: "Black" | "White" | "Other" = "White"
): number {
  // ACC/AHA Pooled Cohort Equations (2013)
  // Reference: https://tools.acc.org/ascvd-risk-estimator-plus/
  
  const lnAge = Math.log(age);
  const lnTC = Math.log(totalCholesterol);
  const lnHDL = Math.log(hdl);
  const lnSBP = Math.log(systolicBP);
  
  let sumCoef: number;
  let baseline: number;
  let meanCoef: number;
  
  // Use "Other" race as White for calculation purposes
  const effectiveRace = race === "Black" ? "Black" : "White";
  
  if (sex === "M") {
    if (effectiveRace === "White") {
      // White Male coefficients
      sumCoef = 12.344 * lnAge
        + 11.853 * lnTC
        - 2.664 * lnAge * lnTC
        - 7.990 * lnHDL
        + 1.769 * lnAge * lnHDL
        + (treated ? 1.797 * lnSBP : 1.764 * lnSBP)
        + (smoker ? 7.837 - 1.795 * lnAge : 0)
        + (diabetes ? 0.658 : 0);
      baseline = 0.9144;
      meanCoef = 61.18;
    } else {
      // Black Male coefficients
      sumCoef = 2.469 * lnAge
        + 0.302 * lnTC
        - 0.307 * lnHDL
        + (treated ? 1.916 * lnSBP : 1.809 * lnSBP)
        + (smoker ? 0.549 : 0)
        + (diabetes ? 0.645 : 0);
      baseline = 0.8954;
      meanCoef = 19.54;
    }
  } else {
    if (effectiveRace === "White") {
      // White Female coefficients
      sumCoef = -29.799 * lnAge
        + 4.884 * lnAge * lnAge
        + 13.540 * lnTC
        - 3.114 * lnAge * lnTC
        - 13.578 * lnHDL
        + 3.149 * lnAge * lnHDL
        + (treated ? 2.019 * lnSBP : 1.957 * lnSBP)
        + (smoker ? 7.574 - 1.665 * lnAge : 0)
        + (diabetes ? 0.661 : 0);
      baseline = 0.9665;
      meanCoef = -29.18;
    } else {
      // Black Female coefficients
      sumCoef = 17.114 * lnAge
        + 0.940 * lnTC
        - 18.920 * lnHDL
        + 4.475 * lnAge * lnHDL
        + (treated ? 29.291 * lnSBP - 6.432 * lnAge * lnSBP : 27.820 * lnSBP - 6.087 * lnAge * lnSBP)
        + (smoker ? 0.691 : 0)
        + (diabetes ? 0.874 : 0);
      baseline = 0.9533;
      meanCoef = 86.61;
    }
  }
  
  const tenYearRisk = (1 - Math.pow(baseline, Math.exp(sumCoef - meanCoef))) * 100;
  
  return Math.round(Math.min(100, Math.max(0, tenYearRisk)) * 10) / 10;
}
