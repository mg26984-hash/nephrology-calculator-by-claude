/**
 * Nephrology Calculator Functions Library
 * All 52 formulas with unit conversion support
 * Last Updated: February 4, 2026
 */

// ============================================================================
// UNIT CONVERSION HELPERS
// ============================================================================

export const unitConversions = {
  creatinine: {
    toSI: (conventional: number) => conventional * 88.4,
    toConventional: (si: number) => si / 88.4,
  },
  glucose: {
    toSI: (conventional: number) => conventional / 18,
    toConventional: (si: number) => si * 18,
  },
  albumin: {
    toSI: (conventional: number) => conventional * 10,
    toConventional: (si: number) => si / 10,
  },
  bun: {
    toSI: (conventional: number) => conventional / 2.8,
    toConventional: (si: number) => si * 2.8,
  },
  phosphate: {
    toSI: (conventional: number) => conventional / 3.1,
    toConventional: (si: number) => si * 3.1,
  },
  calcium: {
    toSI: (conventional: number) => conventional / 4,
    toConventional: (si: number) => si * 4,
  },
};

// ============================================================================
// 1. KIDNEY FUNCTION & CKD RISK CALCULATORS
// ============================================================================

export function ckdEpiCreatinine(
  creatinine: number,
  age: number,
  sex: "M" | "F",
  race: "Black" | "Other" = "Other",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // CKD-EPI 2021 Race-Free Equation
  // Reference: https://www.kidney.org/professionals/gfr_calculator
  
  // Convert to mg/dL if needed
  let scr = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;

  // Define sex-specific constants
  const kappa = sex === "F" ? 0.7 : 0.9;
  const alpha = sex === "F" ? -0.241 : -0.302;
  const sexMultiplier = sex === "F" ? 1.012 : 1.0;

  let eGFR: number;
  
  if (scr <= kappa) {
    // When creatinine is at or below kappa
    eGFR = 142 * Math.pow(scr / kappa, alpha) * Math.pow(0.9938, age) * sexMultiplier;
  } else {
    // When creatinine is above kappa
    eGFR = 142 * Math.pow(scr / kappa, -1.200) * Math.pow(0.9938, age) * sexMultiplier;
  }

  return Math.round(eGFR);
}

export function mdrdGfr(
  creatinine: number,
  age: number,
  sex: "M" | "F",
  race: "Black" | "Other" = "Other",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // MDRD-4 (Modification of Diet in Renal Disease) Study Equation
  // eGFR = 175 × (SCr)^-1.154 × (Age)^-0.203 × 0.742 (if female) × 1.212 (if Black)
  // Reference: Levey AS et al. Ann Intern Med. 2006;145(4):247-254
  
  let scr = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;
  
  const sexMultiplier = sex === "F" ? 0.742 : 1.0;
  const raceMultiplier = race === "Black" ? 1.212 : 1.0;
  
  const eGFR = 175 * Math.pow(scr, -1.154) * Math.pow(age, -0.203) * sexMultiplier * raceMultiplier;
  
  return Math.round(eGFR);
}

export function cockcrofGault(
  creatinine: number,
  age: number,
  weight: number,
  sex: "M" | "F",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // Cockcroft-Gault Creatinine Clearance Formula
  // CrCl = [(140 - age) × weight] / (72 × SCr) [× 0.85 if female]
  
  let creatMgDl = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;

  const sexMultiplier = sex === "F" ? 0.85 : 1.0;

  const clearance = ((140 - age) * weight * sexMultiplier) / (72 * creatMgDl);

  return Math.round(clearance);
}

export function schwartzPediatric(
  creatinine: number,
  height: number,
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  let creatMgDl = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;

  const eGFR = (0.413 * height) / creatMgDl;

  return Math.round(eGFR);
}

export function kineticEgfr(
  baselineCreatinine: number,
  cr1: number,
  cr2: number,
  timeIntervalHours: number,
  age: number,
  sex: "M" | "F",
  isBlack: boolean = false
): number {
  // Chen 2013 Kinetic eGFR (KeGFR) formula — MDCalc implementation
  // Reference: Chen S. Am J Kidney Dis. 2013;62(6):1171-1172
  //
  // keGFR = baselineEGFR × (Cr_baseline / Cr_mean) × kineticFactor
  // kineticFactor = 1 - (24 × ΔCr) / (Δt × MaxΔCr), clamped to [0, 1]
  // MaxΔCr = 1.5 mg/dL/day (assumed maximal daily creatinine production at zero GFR)
  //
  // Baseline eGFR uses 4-variable MDRD (matches MDCalc):
  // eGFR = 175 × SCr^(-1.154) × Age^(-0.203) × 0.742 (if female) × 1.212 (if Black)

  if (baselineCreatinine <= 0 || cr1 <= 0 || cr2 <= 0 || age <= 0 || timeIntervalHours <= 0) return 0;

  // Step 1: Calculate baseline eGFR using 4-variable MDRD
  let baselineEgfr = 175 * Math.pow(baselineCreatinine, -1.154) * Math.pow(age, -0.203);
  if (sex === "F") baselineEgfr *= 0.742;
  if (isBlack) baselineEgfr *= 1.212;

  // Step 2: Mean creatinine
  const crMean = (cr1 + cr2) / 2;

  // Step 3: Kinetic correction factor
  const deltaCr = cr2 - cr1;
  let kineticFactor = 1 - (24 * deltaCr) / (timeIntervalHours * 1.5);
  kineticFactor = Math.max(0, Math.min(1, kineticFactor)); // Clamp 0-1

  // Step 4: KeGFR
  const keGFR = baselineEgfr * (baselineCreatinine / crMean) * kineticFactor;

  return Math.round(keGFR * 10) / 10;
}

export function ckdEpiCystatinC(
  creatinine: number,
  cystatinC: number,
  age: number,
  sex: "M" | "F",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // CKD-EPI Creatinine-Cystatin C Combined Equation (2021)
  // Reference: https://www.kidney.org/professionals/gfr_calculator
  
  let scr = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;
  let scys = cystatinC; // Cystatin C in mg/L

  // Sex-specific constants for creatinine
  const kappaCr = sex === "F" ? 0.7 : 0.9;
  const alphaCr = sex === "F" ? -0.219 : -0.144;
  
  // Cystatin C constants (same for both sexes)
  const kappaCys = 0.8;
  const alphaCys = -0.323;
  
  // Sex multiplier
  const sexMultiplier = sex === "F" ? 0.963 : 1.0;

  // Calculate creatinine component
  const crMin = Math.min(scr / kappaCr, 1);
  const crMax = Math.max(scr / kappaCr, 1);
  
  // Calculate cystatin C component
  const cysMin = Math.min(scys / kappaCys, 1);
  const cysMax = Math.max(scys / kappaCys, 1);

  const eGFR =
    135 *
    Math.pow(crMin, alphaCr) *
    Math.pow(crMax, -0.544) *
    Math.pow(cysMin, alphaCys) *
    Math.pow(cysMax, -0.778) *
    Math.pow(0.9961, age) *
    sexMultiplier;

  return Math.round(eGFR);
}

export function eGFRSlope(
  eGFRBaseline: number,
  eGFRFinal: number,
  timeYears: number
): number {
  const slope = (eGFRFinal - eGFRBaseline) / timeYears;
  return Math.round(slope * 100) / 100;
}

export function kfre(
  age: number,
  sex: "M" | "F",
  eGFR: number,
  acr: number,
  acrUnit: "mg/g" | "mg/mmol" | "mg/mg" = "mg/g",
  years: 2 | 5 = 5
): number {
  // KFRE 4-variable equation (Tangri et al. 2016)
  // Formula: Risk = 1 - S0^exp(risk_score) where S0 is baseline survival
  // Reference: https://kidneyfailurerisk.com/

  // Convert ACR to mg/g (formula uses mg/g internally)
  let acrMgG: number;
  if (acrUnit === "mg/g") {
    acrMgG = acr;
  } else if (acrUnit === "mg/mmol") {
    acrMgG = acr * 8.84;
  } else {
    // mg/mg = g/g, multiply by 1000 to get mg/g
    acrMgG = acr * 1000;
  }

  const lnACR = Math.log(acrMgG);
  const male = sex === "M" ? 1 : 0;

  // Centered regression coefficients (Tangri 2016, North American calibration)
  // Variables are centered around population means
  const riskScore =
    -0.2201 * (age / 10 - 7.036) +
    0.2467 * (male - 0.5642) +
    -0.5567 * (eGFR / 5 - 7.222) +
    0.4510 * (lnACR - 5.137);

  // Baseline survival: North American calibration
  // Non-North American: S0_2yr = 0.9832, S0_5yr = 0.9365
  const S0 = years === 2 ? 0.9750 : 0.9240;

  const risk = (1 - Math.pow(S0, Math.exp(riskScore))) * 100;

  return Math.round(risk * 10) / 10;
}

// ============================================================================
// 2. ACUTE KIDNEY INJURY (AKI) WORKUP CALCULATORS
// ============================================================================

export function fena(
  urineNa: number,
  plasmaCr: number,
  plasmaNa: number,
  urineCr: number,
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  let plasmaCrMgDl =
    creatinineUnit === "μmol/L" ? plasmaCr / 88.4 : plasmaCr;
  let urineCrMgDl =
    creatinineUnit === "μmol/L" ? urineCr / 88.4 : urineCr;

  const fena = ((urineNa * plasmaCrMgDl) / (plasmaNa * urineCrMgDl)) * 100;

  return Math.round(fena * 100) / 100;
}

export function feurea(
  urineUrea: number,
  plasmaCr: number,
  plasmaUrea: number,
  urineCr: number,
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  let plasmaCrMgDl =
    creatinineUnit === "μmol/L" ? plasmaCr / 88.4 : plasmaCr;
  let urineCrMgDl =
    creatinineUnit === "μmol/L" ? urineCr / 88.4 : urineCr;

  const feurea = ((urineUrea * plasmaCrMgDl) / (plasmaUrea * urineCrMgDl)) * 100;

  return Math.round(feurea * 100) / 100;
}

export function anionGap(
  sodium: number,
  chloride: number,
  bicarbonate: number
): number {
  const ag = sodium - (chloride + bicarbonate);
  return ag;
}

export function deltaGap(
  measuredAG: number,
  measuredHCO3: number,
  normalAG: number = 12,
  normalHCO3: number = 24
): { deltaGap: number; deltaHCO3: number; ratio: number } {
  const deltaGap = measuredAG - normalAG;
  const deltaHCO3 = normalHCO3 - measuredHCO3;
  const ratio = deltaHCO3 !== 0 ? deltaGap / deltaHCO3 : 0;

  return {
    deltaGap: Math.round(deltaGap * 100) / 100,
    deltaHCO3: Math.round(deltaHCO3 * 100) / 100,
    ratio: Math.round(ratio * 100) / 100,
  };
}

export function osmolalGap(
  measuredOsmolality: number,
  sodium: number,
  glucose: number,
  bun: number,
  ethanol: number = 0,
  glucoseUnit: "mg/dL" | "mmol/L" = "mg/dL",
  bunUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  let glucoseMgDl = glucoseUnit === "mmol/L" ? glucose * 18 : glucose;
  let bunMgDl = bunUnit === "mmol/L" ? bun * 2.8 : bun;

  const calculatedOsmolality =
    2 * sodium + glucoseMgDl / 18 + bunMgDl / 2.8 + ethanol / 4.6;
  const gap = measuredOsmolality - calculatedOsmolality;

  return Math.round(gap * 100) / 100;
}

export function urineAnionGap(
  urineNa: number,
  urineK: number,
  urineCl: number
): number {
  const uag = urineNa + urineK - urineCl;
  return uag;
}

export function bunCreatinineRatio(
  bun: number,
  creatinine: number,
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // BUN should already be in mg/dL (converted by getBunValue helper)
  // Creatinine needs to be converted if in μmol/L
  let creatinineMgDl = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;
  
  if (creatinineMgDl === 0) return 0;
  
  const ratio = bun / creatinineMgDl;
  return Math.round(ratio * 100) / 100;
}

// ============================================================================
// 3. ELECTROLYTES & ACID-BASE CALCULATORS
// ============================================================================

export function ttkg(
  urineK: number,
  plasmaK: number,
  urineOsm: number,
  plasmaOsm: number
): number {
  const ttkg = (urineK / plasmaK) / (urineOsm / plasmaOsm);
  return Math.round(ttkg * 100) / 100;
}

export function waterDeficitHypernatremia(
  currentNa: number,
  targetNa: number = 140,
  totalBodyWater: number
): number {
  const deficit = totalBodyWater * ((currentNa - targetNa) / targetNa);
  return Math.round(deficit * 10) / 10;
}

export function correctedSodiumHyperglycemia(
  measuredNa: number,
  glucose: number,
  glucoseUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  let glucoseMgDl = glucoseUnit === "mmol/L" ? glucose * 18 : glucose;

  const correctedNa = measuredNa + 0.016 * (glucoseMgDl - 100);

  return Math.round(correctedNa * 10) / 10;
}

export function sodiumCorrectionRateHyponatremia(
  currentNa: number,
  targetNa: number,
  infusionNa: number,
  totalBodyWater: number,
  correctionHours: number
): number {
  const changeInNa = (infusionNa - currentNa) / (totalBodyWater + 1);
  const ratePerHour = changeInNa / correctionHours;

  return Math.round(ratePerHour * 100) / 100;
}

export function sodiumDeficitHyponatremia(
  currentNa: number,
  targetNa: number,
  totalBodyWater: number
): number {
  const deficit = totalBodyWater * (targetNa - currentNa);

  return Math.round(deficit * 10) / 10;
}

export function correctedCalcium(
  measuredCa: number,
  albumin: number,
  albuminUnit: "g/dL" | "g/L" = "g/dL"
): { mgDl: number; mmolL: number } {
  let albuminGdL = albuminUnit === "g/L" ? albumin / 10 : albumin;

  const correctedCaMgDl = measuredCa + 0.8 * (4.0 - albuminGdL);
  const correctedCaMmolL = correctedCaMgDl / 4.0; // Conversion factor: 1 mmol/L = 4 mg/dL

  return {
    mgDl: Math.round(correctedCaMgDl * 100) / 100,
    mmolL: Math.round(correctedCaMmolL * 100) / 100
  };
}

export function qtcBazett(
  qtInterval: number,
  heartRate: number
): number {
  const rrInterval = 60 / heartRate;
  const qtc = qtInterval / Math.sqrt(rrInterval);

  return Math.round(qtc * 10) / 10;
}

// ============================================================================
// 4. PROTEINURIA & GLOMERULAR DISEASE CALCULATORS
// ============================================================================

export function uacr(
  urineAlbumin: number,
  urineCreatinine: number,
  albuminUnit: "mg" | "μg" = "mg",
  creatinineUnit: "g" | "mg" = "g"
): number {
  let albuminMg = albuminUnit === "μg" ? urineAlbumin / 1000 : urineAlbumin;
  let creatinineG = creatinineUnit === "mg" ? urineCreatinine / 1000 : urineCreatinine;

  const acr = albuminMg / creatinineG;

  return Math.round(acr * 10) / 10;
}

export function upcr(
  urineProtein: number,
  urineCreatinine: number,
  proteinUnit: "mg" | "g" = "mg",
  creatinineUnit: "mg" | "g" = "mg"
): number {
  let proteinMg = proteinUnit === "g" ? urineProtein * 1000 : urineProtein;
  let creatinineMg = creatinineUnit === "g" ? urineCreatinine * 1000 : urineCreatinine;

  const pcr = proteinMg / creatinineMg;

  return Math.round(pcr * 100) / 100;
}

export function acrFromPcr(pcr: number): number {
  // Simplified conversion: ACR ≈ PCR × 700
  const acr = pcr * 700;

  return Math.round(acr * 10) / 10;
}

export function uacrTo24HourAlbumin(
  uacr: number,
  uacrUnit: "mg/g" | "mg/mmol" = "mg/g"
): number {
  // UACR to 24-hour albumin excretion estimation
  // ACR in mg/g approximates albumin excretion in mg/24h (1:1 relationship)
  // Reference: KDIGO 2012 Clinical Practice Guideline for CKD
  // https://www.scymed.com/en/smnxps/psdjb222.htm
  
  // Convert to mg/g if needed (mg/mmol × 8.84 = mg/g)
  let acrMgG = uacrUnit === "mg/mmol" ? uacr * 8.84 : uacr;
  
  // ACR in mg/g ≈ 24-hour albumin excretion in mg/day
  const albumin24h = acrMgG;
  
  return Math.round(albumin24h * 10) / 10;
}

export function iganPredictionTool(
  age: number,
  eGFR: number,
  map: number,
  proteinuria: number,
  years: 2 | 5 | 7 = 5
): number {
  // International IgAN Prediction Tool (Barbour et al. 2019)
  // Predicts 2, 5, and 7-year risk of kidney failure
  // Reference: JAMA Intern Med. 2019;179(7):942-952
  
  // Coefficients from the publication for different timeframes
  const coefficients = {
    2: { intercept: -4.44, age: 0.0242, eGFR: -0.0331, map: 0.0102, proteinuria: 0.0897 },
    5: { intercept: -3.58, age: 0.0253, eGFR: -0.0405, map: 0.0120, proteinuria: 0.1050 },
    7: { intercept: -3.12, age: 0.0268, eGFR: -0.0445, map: 0.0135, proteinuria: 0.1180 }
  };

  const coeff = coefficients[years];
  
  // Calculate log odds
  const logOdds = 
    coeff.intercept +
    coeff.age * age +
    coeff.eGFR * eGFR +
    coeff.map * map +
    coeff.proteinuria * Math.log(proteinuria + 1); // Log transform proteinuria
  
  // Convert log odds to probability
  const probability = (1 / (1 + Math.exp(-logOdds))) * 100;

  return Math.round(probability * 10) / 10;
}

// ============================================================================
// 5. DIALYSIS ADEQUACY CALCULATORS
// ============================================================================

export function ktv(
  preBUN: number,
  postBUN: number,
  weight: number,
  sessionTime: number,
  ultrafiltration: number = 0,
  bunUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  // Daugirdas Second Generation Kt/V Formula
  // Kt/V = -ln(R - 0.008 * t) + (4 - 3.5 * R) * UF/W
  let preBUNMgDl = bunUnit === "mmol/L" ? preBUN * 2.8 : preBUN;
  let postBUNMgDl = bunUnit === "mmol/L" ? postBUN * 2.8 : postBUN;

  const R = postBUNMgDl / preBUNMgDl;
  const t = sessionTime / 60; // Convert minutes to hours
  const logArg = R - 0.008 * t;
  if (logArg <= 0) return 0;
  
  const Kt_V = -Math.log(logArg) + (4 - 3.5 * R) * (ultrafiltration / weight);

  return Math.round(Kt_V * 100) / 100;
}

export function totalBodyWaterWatson(
  weight: number,
  height: number,
  age: number,
  sex: "M" | "F"
): number {
  // Watson Formula for Total Body Water (Watson et al. 1980)
  // Male: TBW = 2.447 - 0.09516 * age + 0.1074 * height + 0.3362 * weight
  // Female: TBW = -2.097 + 0.1069 * height + 0.2466 * weight
  let tbw;

  if (sex === "M") {
    tbw = 2.447 - 0.09516 * age + 0.1074 * height + 0.3362 * weight;
  } else {
    tbw = -2.097 + 0.1069 * height + 0.2466 * weight;
  }

  return Math.round(tbw * 100) / 100;
}

export function hemodialysisSessionDuration(
  targetKtV: number,
  dialyzerClearance: number,
  totalBodyWater: number
): number {
  // Simple formula: Kt/V = K × t / V
  // Solving for t: t = (Kt/V × V) / K
  // K = dialyzer clearance in mL/min
  // V = total body water in mL (liters × 1000)
  // t = session time in minutes
  
  const vInMl = totalBodyWater * 1000; // Convert L to mL
  const sessionTimeMinutes = (targetKtV * vInMl) / dialyzerClearance;
  
  return Math.round(sessionTimeMinutes * 10) / 10;
}

export function pdWeeklyKtv(
  dailyDialysateUrea: number,
  plasmaUrea: number,
  dialysateVolume: number,
  totalBodyWater: number,
  residualKtv: number = 0
): number {
  const dailyKtv = (dailyDialysateUrea / plasmaUrea) * (dialysateVolume / totalBodyWater);
  const weeklyKtv = dailyKtv * 7 + residualKtv;

  return Math.round(weeklyKtv * 100) / 100;
}

export function residualKfKtv(
  ureaUrineClearance: number,
  totalBodyWater: number
): number {
  const residualKtv = (ureaUrineClearance * 10.08) / totalBodyWater;

  return Math.round(residualKtv * 100) / 100;
}

export function equilibratedKtv(
  spKtv: number,
  sessionTime: number // Session time in hours (Daugirdas-Schneditz formula)
): number {
  const eKtv = spKtv - (0.6 * spKtv) / sessionTime + 0.03;

  return Math.round(eKtv * 100) / 100;
}

export function standardKtv(
  spKtv: number,
  sessionTime: number, // Session time in hours
  sessionsPerWeek: number = 3,
  residualKtv: number = 0
): number {
  // Standard Kt/V per Casino-Lopez (Gotch) formula
  // Accounts for frequency, session length, and urea generation rate
  // stdKt/V = (10080 / Tinterval) * (1 - exp(-eKtV)) / (1 - exp(-eKtV) * Tinterval/10080)
  // Simplified Leypoldt formula for thrice-weekly HD:
  // stdKt/V ≈ (10080 * (1 - exp(-eKtV))) / (T_interval - T_session + (10080 / (eKtV * N)) * (1 - exp(-eKtV)))
  // Using the NKF-KDOQI recommended approximation:
  const eKtv = spKtv - (0.6 * spKtv) / sessionTime + 0.03;
  const tSession = sessionTime * 60; // convert hours to minutes
  const tInterval = 10080 / sessionsPerWeek; // minutes between sessions (10080 = minutes/week)

  const numerator = 10080 * (1 - Math.exp(-eKtv));
  const denominator = tInterval - tSession + (10080 / (eKtv * sessionsPerWeek)) * (1 - Math.exp(-eKtv));

  const stdKtv = (numerator / denominator) + residualKtv;

  return Math.round(stdKtv * 100) / 100;
}

export function urrHemodialysis(
  preBUN: number,
  postBUN: number,
  bunUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  let preBUNMgDl = bunUnit === "mmol/L" ? preBUN * 2.8 : preBUN;
  let postBUNMgDl = bunUnit === "mmol/L" ? postBUN * 2.8 : postBUN;

  const urr = ((preBUNMgDl - postBUNMgDl) / preBUNMgDl) * 100;

  return Math.round(urr * 10) / 10;
}

export function ironDeficitGanzoni(
  targetHemoglobin: number,
  currentHemoglobin: number,
  weight: number,
  sex: "M" | "F" = "M"
): number {
  const hemoglobinDeficit = targetHemoglobin - currentHemoglobin;
  const bodyIronStore = 500; // Standard iron stores for all adults (mg)
  const ironDeficit = hemoglobinDeficit * weight * 2.4 + bodyIronStore;

  return Math.round(ironDeficit * 10) / 10;
}

// ============================================================================
// 6. TRANSPLANTATION CALCULATORS
// ============================================================================

export function kdpi(
  donorAge: number,
  donorHeightCm: number,
  donorWeightKg: number,
  donorCreatinine: number,
  hypertensionDuration: "NO" | "0-5" | "6-10" | ">10",
  diabetesDuration: "NO" | "0-5" | "6-10" | ">10",
  causeOfDeath: "ANOXIA" | "CVA" | "HEAD_TRAUMA" | "CNS_TUMOR" | "OTHER",
  isDCD: boolean,
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): { kdri: number; kdpi: number } {
  // OPTN KDPI Calculator - October 2024 Refit Formula
  // Reference: https://www.hrsa.gov/sites/default/files/hrsa/optn/kdpi_guide.pdf
  // Note: Race and HCV status removed October 31, 2024
  
  let creatMgDl = creatinineUnit === "μmol/L" ? donorCreatinine / 88.4 : donorCreatinine;
  
  // Calculate Xβ (sum of KDRI score components)
  let xBeta = 0;
  
  // Age component: 0.0092*(Age-40)
  xBeta += 0.0092 * (donorAge - 40);
  
  // Age < 18: additional 0.0113*(Age-18)
  if (donorAge < 18) {
    xBeta += 0.0113 * (donorAge - 18);
  }
  
  // Age >= 50: additional 0.0067*(Age-50)
  if (donorAge >= 50) {
    xBeta += 0.0067 * (donorAge - 50);
  }
  
  // Height component: -0.0557*(Height-170)/10
  xBeta += -0.0557 * (donorHeightCm - 170) / 10;
  
  // Weight component (only if < 80 kg): -0.0333*(Weight-80)/5
  if (donorWeightKg < 80) {
    xBeta += -0.0333 * (donorWeightKg - 80) / 5;
  }
  
  // History of Hypertension: 0.1106 if hypertensive
  if (hypertensionDuration !== "NO") {
    xBeta += 0.1106;
  }
  
  // History of Diabetes: 0.2577 if diabetic
  if (diabetesDuration !== "NO") {
    xBeta += 0.2577;
  }
  
  // Cause of Death CVA/Stroke: 0.0743
  if (causeOfDeath === "CVA") {
    xBeta += 0.0743;
  }
  
  // Serum Creatinine: 0.2128*(Creat-1)
  xBeta += 0.2128 * (creatMgDl - 1);
  
  // Creatinine > 1.5: additional -0.2199*(Creat-1.5)
  if (creatMgDl > 1.5) {
    xBeta += -0.2199 * (creatMgDl - 1.5);
  }
  
  // DCD Status: 0.1966 (OPTN 2024 Refit)
  if (isDCD) {
    xBeta += 0.1966;
  }
  
  // Calculate KDRI_RAO = e^(Xβ)
  const kdriRao = Math.exp(xBeta);
  
  // Scaling factor for 2024 (from OPTN KDPI mapping table April 2025)
  const scalingFactor = 1.40436817065005;
  
  // Calculate KDRI_SCALED
  const kdriScaled = kdriRao / scalingFactor;
  
  // Convert KDRI to KDPI using official OPTN mapping table (April 2025)
  // Reference: https://www.hrsa.gov/sites/default/files/hrsa/optn/kdpi_mapping_table.pdf
  // KDPI is the percentile rank of KDRI_SCALED based on 2024 reference population
  let kdpi: number;
  
  // Full-precision OPTN KDRI-to-KDPI mapping table (April 2025)
  // Source: https://www.hrsa.gov/sites/default/files/hrsa/optn/kdpi_mapping_table.pdf
  if (kdriScaled <= 0.43756347366936) kdpi = 0;
  else if (kdriScaled <= 0.54140400678998) kdpi = 1;
  else if (kdriScaled <= 0.56455335268328) kdpi = 2;
  else if (kdriScaled <= 0.58227670794108) kdpi = 3;
  else if (kdriScaled <= 0.59655639363358) kdpi = 4;
  else if (kdriScaled <= 0.60825393903620) kdpi = 5;
  else if (kdriScaled <= 0.62073718385389) kdpi = 6;
  else if (kdriScaled <= 0.63214751577493) kdpi = 7;
  else if (kdriScaled <= 0.64347410023235) kdpi = 8;
  else if (kdriScaled <= 0.65318851478785) kdpi = 9;
  else if (kdriScaled <= 0.66302770586452) kdpi = 10;
  else if (kdriScaled <= 0.67145522964513) kdpi = 11;
  else if (kdriScaled <= 0.68087570963769) kdpi = 12;
  else if (kdriScaled <= 0.69029274652971) kdpi = 13;
  else if (kdriScaled <= 0.69751483197311) kdpi = 14;
  else if (kdriScaled <= 0.70694281453250) kdpi = 15;
  else if (kdriScaled <= 0.71473924076668) kdpi = 16;
  else if (kdriScaled <= 0.72358482223375) kdpi = 17;
  else if (kdriScaled <= 0.73165769729743) kdpi = 18;
  else if (kdriScaled <= 0.73996713862377) kdpi = 19;
  else if (kdriScaled <= 0.74791682700397) kdpi = 20;
  else if (kdriScaled <= 0.75595207245550) kdpi = 21;
  else if (kdriScaled <= 0.76380290485577) kdpi = 22;
  else if (kdriScaled <= 0.77160424143161) kdpi = 23;
  else if (kdriScaled <= 0.78021363869746) kdpi = 24;
  else if (kdriScaled <= 0.78851346149113) kdpi = 25;
  else if (kdriScaled <= 0.79655510945428) kdpi = 26;
  else if (kdriScaled <= 0.80387692407067) kdpi = 27;
  else if (kdriScaled <= 0.81072894733318) kdpi = 28;
  else if (kdriScaled <= 0.81856104693612) kdpi = 29;
  else if (kdriScaled <= 0.82627642950060) kdpi = 30;
  else if (kdriScaled <= 0.83318339328986) kdpi = 31;
  else if (kdriScaled <= 0.84121542290184) kdpi = 32;
  else if (kdriScaled <= 0.84935715740213) kdpi = 33;
  else if (kdriScaled <= 0.85645842665560) kdpi = 34;
  else if (kdriScaled <= 0.86460674884622) kdpi = 35;
  else if (kdriScaled <= 0.87434827297452) kdpi = 36;
  else if (kdriScaled <= 0.88372133226563) kdpi = 37;
  else if (kdriScaled <= 0.89269482214228) kdpi = 38;
  else if (kdriScaled <= 0.90077164376820) kdpi = 39;
  else if (kdriScaled <= 0.90931337155045) kdpi = 40;
  else if (kdriScaled <= 0.91735632893166) kdpi = 41;
  else if (kdriScaled <= 0.92571141314443) kdpi = 42;
  else if (kdriScaled <= 0.93474875125877) kdpi = 43;
  else if (kdriScaled <= 0.94395526660055) kdpi = 44;
  else if (kdriScaled <= 0.95360141288907) kdpi = 45;
  else if (kdriScaled <= 0.96147289850279) kdpi = 46;
  else if (kdriScaled <= 0.97141500633747) kdpi = 47;
  else if (kdriScaled <= 0.97969822621390) kdpi = 48;
  else if (kdriScaled <= 0.98914385687021) kdpi = 49;
  else if (kdriScaled <= 1.00000000000001) kdpi = 50;
  else if (kdriScaled <= 1.00985758010347) kdpi = 51;
  else if (kdriScaled <= 1.01958175487502) kdpi = 52;
  else if (kdriScaled <= 1.02880558070335) kdpi = 53;
  else if (kdriScaled <= 1.03725904354631) kdpi = 54;
  else if (kdriScaled <= 1.04748546724369) kdpi = 55;
  else if (kdriScaled <= 1.05701035027583) kdpi = 56;
  else if (kdriScaled <= 1.06633035599198) kdpi = 57;
  else if (kdriScaled <= 1.07573892220660) kdpi = 58;
  else if (kdriScaled <= 1.08566912172970) kdpi = 59;
  else if (kdriScaled <= 1.09533088857168) kdpi = 60;
  else if (kdriScaled <= 1.10529967684360) kdpi = 61;
  else if (kdriScaled <= 1.11546364557302) kdpi = 62;
  else if (kdriScaled <= 1.12583220387625) kdpi = 63;
  else if (kdriScaled <= 1.13596203398932) kdpi = 64;
  else if (kdriScaled <= 1.14607664781339) kdpi = 65;
  else if (kdriScaled <= 1.15614802585337) kdpi = 66;
  else if (kdriScaled <= 1.16950575516190) kdpi = 67;
  else if (kdriScaled <= 1.17597158234812) kdpi = 68;
  else if (kdriScaled <= 1.18797063065605) kdpi = 69;
  else if (kdriScaled <= 1.19958840121024) kdpi = 70;
  else if (kdriScaled <= 1.21092254012845) kdpi = 71;
  else if (kdriScaled <= 1.22137860162032) kdpi = 72;
  else if (kdriScaled <= 1.23397479393383) kdpi = 73;
  else if (kdriScaled <= 1.24670304020145) kdpi = 74;
  else if (kdriScaled <= 1.25914195259812) kdpi = 75;
  else if (kdriScaled <= 1.27152186119531) kdpi = 76;
  else if (kdriScaled <= 1.28446270045611) kdpi = 77;
  else if (kdriScaled <= 1.29752226906290) kdpi = 78;
  else if (kdriScaled <= 1.31372090832136) kdpi = 79;
  else if (kdriScaled <= 1.32913598921872) kdpi = 80;
  else if (kdriScaled <= 1.34428799207615) kdpi = 81;
  else if (kdriScaled <= 1.36002692720158) kdpi = 82;
  else if (kdriScaled <= 1.37645657674097) kdpi = 83;
  else if (kdriScaled <= 1.39274343883440) kdpi = 84;
  else if (kdriScaled <= 1.41088970093023) kdpi = 85;
  else if (kdriScaled <= 1.42882224348119) kdpi = 86;
  else if (kdriScaled <= 1.44689676213656) kdpi = 87;
  else if (kdriScaled <= 1.47000896434346) kdpi = 88;
  else if (kdriScaled <= 1.49117067437256) kdpi = 89;
  else if (kdriScaled <= 1.51572594977824) kdpi = 90;
  else if (kdriScaled <= 1.54164889013418) kdpi = 91;
  else if (kdriScaled <= 1.56911614985970) kdpi = 92;
  else if (kdriScaled <= 1.60239998973729) kdpi = 93;
  else if (kdriScaled <= 1.63668114440017) kdpi = 94;
  else if (kdriScaled <= 1.68076407902584) kdpi = 95;
  else if (kdriScaled <= 1.72368854740753) kdpi = 96;
  else if (kdriScaled <= 1.77998421976632) kdpi = 97;
  else if (kdriScaled <= 1.86168222116483) kdpi = 98;
  else if (kdriScaled <= 1.98677654539587) kdpi = 99;
  else kdpi = 100;
  
  return {
    kdri: Math.round(kdriScaled * 100) / 100,
    kdpi: Math.round(kdpi)
  };
}

export function epts(
  recipientAge: number,
  recipientDiabetes: boolean,
  priorTransplant: boolean,
  yearsOnDialysis: number
): number {
  // OPTN EPTS Raw Score Formula (Cox proportional hazards model)
  // Reference: https://optn.transplant.hrsa.gov/media/pn1pt2bc/epts_guide.pdf
  const dm = recipientDiabetes ? 1 : 0;
  const prevTx = priorTransplant ? 1 : 0;
  const ageAbove25 = Math.max(recipientAge - 25, 0);
  const neverOnDialysis = yearsOnDialysis === 0 ? 1 : 0;

  const rawEPTS =
    0.047 * ageAbove25 +
    -0.015 * dm * ageAbove25 +
    0.398 * prevTx +
    -0.237 * dm * prevTx +
    0.315 * Math.log(yearsOnDialysis + 1) +
    -0.099 * dm * Math.log(yearsOnDialysis + 1) +
    0.130 * neverOnDialysis +
    -0.348 * dm * neverOnDialysis +
    1.262 * dm;

  // Returns raw EPTS score (conversion to percentile requires annual OPTN mapping table)
  return Math.round(rawEPTS * 10000) / 10000;
}

export function tacrolimusMonitoring(
  dailyDose: number,
  troughLevel: number
): number {
  const ratio = dailyDose / troughLevel;

  return Math.round(ratio * 100) / 100;
}

// ============================================================================
// 7. CARDIOVASCULAR RISK CALCULATORS
// ============================================================================

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

/**
 * CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk
 * Reference: Lip GY et al. Chest. 2010;137(2):263-272
 * 
 * C - Congestive heart failure (1 point)
 * H - Hypertension (1 point)
 * A₂ - Age ≥75 years (2 points)
 * D - Diabetes mellitus (1 point)
 * S₂ - Stroke/TIA/thromboembolism (2 points)
 * V - Vascular disease (1 point)
 * A - Age 65-74 years (1 point)
 * Sc - Sex category (female = 1 point)
 */
export function cha2ds2vasc(
  chf: boolean,
  hypertension: boolean,
  age: number,
  diabetes: boolean,
  strokeTia: boolean,
  vascularDisease: boolean,
  sex: "M" | "F"
): { score: number; annualStrokeRisk: string; recommendation: string } {
  let score = 0;
  
  // C - Congestive heart failure/LV dysfunction (1 point)
  if (chf) score += 1;
  
  // H - Hypertension (1 point)
  if (hypertension) score += 1;
  
  // A₂ - Age ≥75 years (2 points)
  if (age >= 75) score += 2;
  // A - Age 65-74 years (1 point)
  else if (age >= 65) score += 1;
  
  // D - Diabetes mellitus (1 point)
  if (diabetes) score += 1;
  
  // S₂ - Stroke/TIA/thromboembolism (2 points)
  if (strokeTia) score += 2;
  
  // V - Vascular disease (prior MI, PAD, aortic plaque) (1 point)
  if (vascularDisease) score += 1;
  
  // Sc - Sex category (female = 1 point)
  if (sex === "F") score += 1;
  
  // Annual stroke risk percentages (Lip et al. 2010, Friberg et al. 2012)
  const strokeRiskMap: Record<number, string> = {
    0: "0%",
    1: "1.3%",
    2: "2.2%",
    3: "3.2%",
    4: "4.0%",
    5: "6.7%",
    6: "9.8%",
    7: "11.2%",
    8: "12.5%",
    9: "15.2%"
  };
  
  const annualStrokeRisk = strokeRiskMap[Math.min(score, 9)] || ">15%";
  
  // Anticoagulation recommendations based on 2020 ESC Guidelines
  let recommendation: string;
  if (score === 0) {
    recommendation = "No antithrombotic therapy recommended (Class III)";
  } else if (score === 1) {
    if (sex === "M") {
      recommendation = "Oral anticoagulation should be considered (Class IIa). Assess bleeding risk with HAS-BLED.";
    } else {
      // Female with score of 1 (only from sex) = effectively 0 risk factors
      recommendation = "No antithrombotic therapy recommended if female sex is the only risk factor (Class III)";
    }
  } else {
    recommendation = "Oral anticoagulation is recommended (Class I). DOACs preferred over warfarin. Assess bleeding risk with HAS-BLED.";
  }
  
  return { score, annualStrokeRisk, recommendation };
}

// ============================================================================
// 8. ANTHROPOMETRIC & BODY COMPOSITION CALCULATORS
// ============================================================================

export function bmi(weight: number, height: number, heightUnit: "cm" | "in" = "cm"): number {
  let heightM = heightUnit === "cm" ? height / 100 : height * 0.0254;

  const bmi = weight / (heightM * heightM);

  return Math.round(bmi * 10) / 10;
}

export function bsaDuBois(weight: number, height: number, heightUnit: "cm" | "in" = "cm"): number {
  let heightCm = heightUnit === "in" ? height * 2.54 : height;

  const bsa = 0.007184 * Math.pow(weight, 0.425) * Math.pow(heightCm, 0.725);

  return Math.round(bsa * 100) / 100;
}

export function bsaMosteller(weight: number, height: number, heightUnit: "cm" | "in" = "cm"): number {
  let heightCm = heightUnit === "in" ? height * 2.54 : height;

  const bsa = Math.sqrt((weight * heightCm) / 3600);

  return Math.round(bsa * 100) / 100;
}

export function devineIdealBodyWeight(
  height: number,
  sex: "M" | "F",
  heightUnit: "cm" | "in" = "cm"
): number {
  let heightIn = heightUnit === "cm" ? height / 2.54 : height;

  let ibw;
  if (sex === "M") {
    ibw = 50 + 2.3 * (heightIn - 60);
  } else {
    ibw = 45.5 + 2.3 * (heightIn - 60);
  }

  return Math.round(ibw * 10) / 10;
}

export function leanBodyWeight(
  weight: number,
  height: number,
  sex: "M" | "F",
  heightUnit: "cm" | "in" = "cm"
): number {
  let heightCm = heightUnit === "in" ? height * 2.54 : height;

  let lbw;
  if (sex === "M") {
    lbw = 1.1 * weight - 128 * (weight / heightCm) ** 2;
  } else {
    lbw = 1.07 * weight - 148 * (weight / heightCm) ** 2;
  }

  return Math.round(lbw * 10) / 10;
}

export function adjustedBodyWeight(
  actualWeight: number,
  idealWeight: number
): number {
  const adjustedBW = idealWeight + 0.4 * (actualWeight - idealWeight);

  return Math.round(adjustedBW * 10) / 10;
}

// ============================================================================
// 9. CKD-MINERAL BONE DISEASE CALCULATORS
// ============================================================================

export function caPhoProduct(
  calcium: number,
  phosphate: number,
  calciumUnit: "mg/dL" | "mmol/L" = "mg/dL",
  phosphateUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  let caMgDl = calciumUnit === "mmol/L" ? calcium * 4 : calcium;
  let phMgDl = phosphateUnit === "mmol/L" ? phosphate * 3.1 : phosphate;

  const product = caMgDl * phMgDl;

  return Math.round(product * 10) / 10;
}

// ============================================================================
// 10. SYSTEMIC DISEASES & SCORES
// ============================================================================

export function sledai2k(
  seizures: boolean,
  psychosis: boolean,
  organicBrainSyndrome: boolean,
  visualDisorder: boolean,
  cranialNerveDisorder: boolean,
  lupusHeadache: boolean,
  cerebrovasitisAccident: boolean,
  vasculitis: boolean,
  arthritis: boolean,
  myositis: boolean,
  urinaryCasts: boolean,
  proteinuria: boolean,
  hematuria: boolean,
  pyuria: boolean,
  rash: boolean,
  alopecia: boolean,
  mucousalUlcers: boolean,
  pleuritis: boolean,
  pericarditis: boolean,
  lowComplement: boolean,
  elevatedDNA: boolean,
  fever: boolean = false,
  thrombocytopenia: boolean = false,
  leukopenia: boolean = false
): number {
  // SLEDAI-2K scoring per Gladman et al. (24 descriptors, max 105)
  let score = 0;

  if (seizures) score += 8;
  if (psychosis) score += 8;
  if (organicBrainSyndrome) score += 8;
  if (visualDisorder) score += 8;
  if (cranialNerveDisorder) score += 8;
  if (lupusHeadache) score += 8;
  if (cerebrovasitisAccident) score += 8;
  if (vasculitis) score += 8;
  if (arthritis) score += 4;
  if (myositis) score += 4;
  if (urinaryCasts) score += 4;
  if (proteinuria) score += 4;
  if (hematuria) score += 4;
  if (pyuria) score += 4;
  if (rash) score += 2;
  if (alopecia) score += 2;
  if (mucousalUlcers) score += 2;
  if (pleuritis) score += 2;
  if (pericarditis) score += 2;
  if (lowComplement) score += 2;
  if (elevatedDNA) score += 2;
  if (fever) score += 1;
  if (thrombocytopenia) score += 1;
  if (leukopenia) score += 1;

  return score;
}

export function frailScale(
  fatigue: boolean,
  resistance: boolean,
  ambulation: boolean,
  illness: boolean,
  lossOfWeight: boolean
): number {
  let score = 0;

  if (fatigue) score += 1;
  if (resistance) score += 1;
  if (ambulation) score += 1;
  if (illness) score += 1;
  if (lossOfWeight) score += 1;

  return score;
}

export function prisma7(
  age85: boolean,
  male: boolean,
  healthLimitActivities: boolean,
  needHelp: boolean,
  healthStayHome: boolean,
  socialSupport: boolean,
  mobilityAid: boolean
): number {
  let score = 0;

  if (age85) score += 1;           // Q1: Are you older than 85 years?
  if (male) score += 1;            // Q2: Are you male?
  if (healthLimitActivities) score += 1; // Q3: Health problems that limit activities?
  if (needHelp) score += 1;        // Q4: Need someone to help on a regular basis?
  if (healthStayHome) score += 1;  // Q5: Health problems that require staying at home?
  if (socialSupport) score += 1;   // Q6: Can you count on someone close to you? (Yes = 1 point)
  if (mobilityAid) score += 1;     // Q7: Regularly use stick, walker or wheelchair?

  return score;
}

export function curb65(
  confusion: boolean,
  urineaNitrogen: number,
  respiratoryRate: number,
  bloodPressureSystolic: number,
  bloodPressureDiastolic: number,
  age: number,
  bunUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  let score = 0;

  if (confusion) score += 1;

  let bunMgDl = bunUnit === "mmol/L" ? urineaNitrogen * 2.8 : urineaNitrogen;
  // BUN > 19 mg/dL (or > 7 mmol/L) - Reference: MDCalc CURB-65
  if (bunMgDl > 19) score += 1;

  if (respiratoryRate >= 30) score += 1;

  if (bloodPressureSystolic < 90 || bloodPressureDiastolic <= 60) score += 1;

  if (age >= 65) score += 1;

  return score;
}

// ============================================================================
// 11. CLINICAL RISK SCORES
// ============================================================================

export function roks(
  age: number,
  bmi: number,
  maleGender: boolean,
  previousStone: boolean,
  familyHistory: boolean
): number {
  // Simplified ROKS calculation
  let score = 0;

  score += age * 0.01;
  score += bmi * 0.02;
  score += maleGender ? 0.3 : 0;
  score += previousStone ? 0.5 : 0;
  score += familyHistory ? 0.3 : 0;

  const recurrenceRisk = Math.min(100, Math.max(0, score * 100));

  return Math.round(recurrenceRisk * 10) / 10;
}

// ============================================================================
// SLICC 2012 SLE CLASSIFICATION CRITERIA
// ============================================================================

export function slicc2012(
  acuteRash: boolean,
  chronicRash: boolean,
  oralUlcers: boolean,
  alopecia: boolean,
  photosensitivity: boolean,
  arthritis: boolean,
  serositis: boolean,
  renal: boolean,
  psychosis: boolean,
  seizures: boolean,
  hemolytic: boolean,
  leukopenia: boolean,
  thrombocytopenia: boolean,
  ana: boolean,
  antiDsDna: boolean,
  antiSmRnp: boolean,
  antiRoSsa: boolean,
  antiLaSSb: boolean,
  antiC1q: boolean,
  directCoombs: boolean
): number {
  // SLICC 2012: Each criterion counts as 1 point. SLE classification requires ≥4 criteria
  // with at least 1 clinical and 1 immunological criterion.
  let score = 0;

  // Clinical criteria (items 1-13)
  if (acuteRash) score += 1;
  if (chronicRash) score += 1;
  if (oralUlcers) score += 1;
  if (alopecia) score += 1;
  if (photosensitivity) score += 1;
  if (arthritis) score += 1;
  if (serositis) score += 1;
  if (renal) score += 1;
  if (psychosis) score += 1;
  if (seizures) score += 1;
  if (hemolytic) score += 1;
  if (leukopenia) score += 1;
  if (thrombocytopenia) score += 1;
  // Immunological criteria (items 14-20)
  if (ana) score += 1;
  if (antiDsDna) score += 1;
  if (antiSmRnp) score += 1;
  if (antiRoSsa) score += 1;
  if (antiLaSSb) score += 1;
  if (antiC1q) score += 1;
  if (directCoombs) score += 1;

  return score;
}


// ============================================================================
// FRAX FRACTURE RISK ASSESSMENT (Simplified)
// ============================================================================

export function fraxSimplified(
  age: number,
  sex: "M" | "F",
  weight: number,
  height: number,
  previousFracture: boolean = false,
  parentHipFracture: boolean = false,
  currentSmoking: boolean = false,
  glucocorticoids: boolean = false,
  rheumatoidArthritis: boolean = false,
  secondaryOsteoporosis: boolean = false,
  alcoholIntake: boolean = false,
  bmdTScore?: number
): { majorFracture: number; hipFracture: number } {
  // Calculate BMI
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  // Base risk calculation (simplified FRAX algorithm)
  // Based on age and sex baseline risks
  let baseRiskMajor = 0;
  let baseRiskHip = 0;

  // Age-based baseline risk (approximate values from FRAX tables)
  if (sex === "F") {
    if (age < 50) { baseRiskMajor = 3.2; baseRiskHip = 0.3; }
    else if (age < 55) { baseRiskMajor = 4.5; baseRiskHip = 0.5; }
    else if (age < 60) { baseRiskMajor = 6.5; baseRiskHip = 0.9; }
    else if (age < 65) { baseRiskMajor = 8.5; baseRiskHip = 1.5; }
    else if (age < 70) { baseRiskMajor = 11.0; baseRiskHip = 2.5; }
    else if (age < 75) { baseRiskMajor = 14.0; baseRiskHip = 4.5; }
    else if (age < 80) { baseRiskMajor = 18.0; baseRiskHip = 7.5; }
    else if (age < 85) { baseRiskMajor = 22.0; baseRiskHip = 11.0; }
    else { baseRiskMajor = 25.0; baseRiskHip = 14.0; }
  } else {
    if (age < 50) { baseRiskMajor = 2.5; baseRiskHip = 0.2; }
    else if (age < 55) { baseRiskMajor = 3.5; baseRiskHip = 0.4; }
    else if (age < 60) { baseRiskMajor = 4.5; baseRiskHip = 0.7; }
    else if (age < 65) { baseRiskMajor = 5.5; baseRiskHip = 1.1; }
    else if (age < 70) { baseRiskMajor = 7.0; baseRiskHip = 1.8; }
    else if (age < 75) { baseRiskMajor = 9.0; baseRiskHip = 3.0; }
    else if (age < 80) { baseRiskMajor = 12.0; baseRiskHip = 5.0; }
    else if (age < 85) { baseRiskMajor = 15.0; baseRiskHip = 8.0; }
    else { baseRiskMajor = 18.0; baseRiskHip = 11.0; }
  }

  // Risk multipliers for clinical risk factors
  let riskMultiplier = 1.0;

  if (previousFracture) riskMultiplier *= 1.85;
  if (parentHipFracture) riskMultiplier *= 1.55;
  if (currentSmoking) riskMultiplier *= 1.25;
  if (glucocorticoids) riskMultiplier *= 1.65;
  if (rheumatoidArthritis) riskMultiplier *= 1.35;
  if (secondaryOsteoporosis) riskMultiplier *= 1.40;
  if (alcoholIntake) riskMultiplier *= 1.35;

  // BMI adjustment (low BMI increases risk)
  if (bmi < 20) riskMultiplier *= 1.25;
  else if (bmi > 30) riskMultiplier *= 0.95;

  // BMD T-score adjustment if provided
  if (bmdTScore !== undefined && !isNaN(bmdTScore)) {
    // Each SD decrease in BMD approximately doubles fracture risk
    const bmdMultiplier = Math.pow(1.5, Math.abs(bmdTScore + 2.5));
    if (bmdTScore < -2.5) {
      riskMultiplier *= bmdMultiplier;
    } else if (bmdTScore > -1.0) {
      riskMultiplier *= 0.7;
    }
  }

  // Calculate final risks
  const majorFracture = Math.min(baseRiskMajor * riskMultiplier, 80);
  const hipFracture = Math.min(baseRiskHip * riskMultiplier, 50);

  return {
    majorFracture: Math.round(majorFracture * 10) / 10,
    hipFracture: Math.round(hipFracture * 10) / 10,
  };
}


// ============================================================================
// BANFF CLASSIFICATION FOR KIDNEY TRANSPLANT REJECTION (2019 Update)
// ============================================================================

export interface BanffScores {
  // Biopsy adequacy
  glomeruli: number;  // Number of glomeruli in sample
  arteries: number;   // Number of arteries in sample
  // Acute lesions
  i: number;      // Interstitial inflammation (0-3)
  t: number;      // Tubulitis (0-3)
  v: number;      // Intimal arteritis (0-3)
  g: number;      // Glomerulitis (0-3)
  ptc: number;    // Peritubular capillaritis (0-3)
  // Chronic lesions
  ci: number;     // Interstitial fibrosis (0-3)
  ct: number;     // Tubular atrophy (0-3)
  cv: number;     // Vascular fibrous intimal thickening (0-3)
  cg: number;     // Transplant glomerulopathy (0-3)
  // Chronic active inflammation
  ti: number;     // Total inflammation (0-3)
  iIfta: number;  // Inflammation in IFTA (0-3)
  tIfta: number;  // Tubulitis in atrophic tubules (0-3)
  // Other
  ah: number;     // Arteriolar hyalinosis (0-3)
  // Antibody-mediated markers
  c4d: number;    // C4d staining (0=negative, 1=minimal, 2=focal, 3=diffuse)
  dsa: string;    // Donor-specific antibody (negative/positive/unknown)
}

export interface BanffDiagnosis {
  diagnosed: boolean;
  type: 'normal' | 'borderline' | 'tcmr' | 'abmr';
  category: string;
  title: string;
  description: string;
  criteria: { met: boolean; text: string }[];
  interpretation?: string;
}

export interface BanffResult {
  diagnoses: BanffDiagnosis[];
  isAdequate: boolean;
  adequacyStatus: 'Adequate' | 'Marginal' | 'Unsatisfactory';
  scoreSummary: {
    acute: string;
    chronic: string;
    chronicActive: string;
    other: string;
  };
}

export function banffClassification(scores: BanffScores): BanffResult {
  const { glomeruli, arteries, i, t, v, g, ptc, ci, ct, cv, cg, ti, iIfta, tIfta, ah, c4d, dsa } = scores;
  
  // Check biopsy adequacy
  let adequacyStatus: 'Adequate' | 'Marginal' | 'Unsatisfactory';
  let isAdequate = true;
  
  if (glomeruli >= 10 && arteries >= 2) {
    adequacyStatus = 'Adequate';
  } else if (glomeruli >= 7 && arteries >= 1) {
    adequacyStatus = 'Marginal';
    isAdequate = false;
  } else {
    adequacyStatus = 'Unsatisfactory';
    isAdequate = false;
  }
  
  const diagnoses: BanffDiagnosis[] = [];
  
  // Check for ABMR
  const abmrResult = checkABMR(scores);
  if (abmrResult.diagnosed) {
    diagnoses.push(abmrResult);
  }
  
  // Check for TCMR
  const tcmrResult = checkTCMR(scores);
  if (tcmrResult.diagnosed) {
    diagnoses.push(tcmrResult);
  }
  
  // Check for Borderline
  const borderlineResult = checkBorderline(scores);
  if (borderlineResult.diagnosed) {
    diagnoses.push(borderlineResult);
  }
  
  // If no diagnoses, add normal
  if (diagnoses.length === 0) {
    diagnoses.push({
      diagnosed: true,
      type: 'normal',
      category: 'Category 1',
      title: 'Normal or Non-Specific Changes',
      description: 'No evidence of acute or chronic rejection based on Banff 2022 criteria.',
      criteria: []
    });
  }
  
  // Build score summary
  const scoreSummary = {
    acute: `i${i} t${t} v${v} g${g} ptc${ptc}`,
    chronic: `ci${ci} ct${ct} cv${cv} cg${cg}`,
    chronicActive: `ti${ti} i-IFTA${iIfta} t-IFTA${tIfta}`,
    other: `C4d${c4d} ah${ah}`
  };
  
  return {
    diagnoses,
    isAdequate,
    adequacyStatus,
    scoreSummary
  };
}

function checkABMR(scores: BanffScores): BanffDiagnosis {
  const { g, ptc, c4d, dsa, cg, cv } = scores;
  
  const mvi = g > 0 || ptc > 0;
  const c4dPositive = c4d >= 2;
  const dsaPositive = dsa === 'positive';
  
  // Active ABMR criteria
  const acuteInjury = g > 0 || ptc > 0;
  const antibodyInteraction = c4dPositive || dsaPositive;
  const dsaCriteria = dsaPositive || c4dPositive;
  
  // Chronic active ABMR criteria
  const chronicInjury = cg > 0 || cv > 0;
  
  if (acuteInjury && antibodyInteraction && dsaCriteria) {
    return {
      diagnosed: true,
      type: 'abmr',
      category: 'Category 2',
      title: 'Active Antibody-Mediated Rejection (ABMR)',
      description: 'All three criteria for active ABMR are met per Banff 2022.',
      criteria: [
        { met: true, text: `Acute tissue injury: g=${g}, ptc=${ptc}` },
        { met: true, text: `Antibody interaction: C4d=${c4d}, DSA=${dsa}` },
        { met: true, text: 'Serologic evidence present' }
      ],
      interpretation: 'Immediate immunosuppression adjustment recommended. Consider plasma exchange, IVIG, rituximab, or complement inhibition based on severity.'
    };
  }
  
  if (chronicInjury && antibodyInteraction && dsaCriteria) {
    return {
      diagnosed: true,
      type: 'abmr',
      category: 'Category 2',
      title: 'Chronic Active Antibody-Mediated Rejection',
      description: 'Criteria for chronic active ABMR are met.',
      criteria: [
        { met: true, text: `Chronic injury: cg=${cg}, cv=${cv}` },
        { met: true, text: `Antibody interaction: C4d=${c4d}, DSA=${dsa}` },
        { met: true, text: 'Serologic evidence present' }
      ],
      interpretation: 'Indicates ongoing chronic antibody-mediated damage. Optimize immunosuppression and consider DSA monitoring.'
    };
  }
  
  return { diagnosed: false, type: 'normal', category: '', title: '', description: '', criteria: [] };
}

function checkTCMR(scores: BanffScores): BanffDiagnosis {
  const { i, t, v, ti, iIfta, tIfta, cv } = scores;
  
  // Acute TCMR - Grade III (v3)
  if (v === 3) {
    return {
      diagnosed: true,
      type: 'tcmr',
      category: 'Category 4',
      title: 'Acute TCMR - Grade III',
      description: 'Transmural arteritis with severe vascular involvement.',
      criteria: [
        { met: true, text: `v3 - Transmural arteritis (v=${v})` }
      ],
      interpretation: 'Severe acute rejection. High-dose corticosteroids and potentially ATG required. Poor prognosis if treatment delayed.'
    };
  }
  
  // Acute TCMR - Grade IIB (v2)
  if (v === 2) {
    return {
      diagnosed: true,
      type: 'tcmr',
      category: 'Category 4',
      title: 'Acute TCMR - Grade IIB',
      description: 'Severe intimal arteritis.',
      criteria: [
        { met: true, text: `v2 - Severe intimal arteritis (v=${v})` }
      ],
      interpretation: 'Severe vascular rejection. High-dose corticosteroids recommended, consider ATG.'
    };
  }
  
  // Acute TCMR - Grade IIA (v1)
  if (v === 1) {
    return {
      diagnosed: true,
      type: 'tcmr',
      category: 'Category 4',
      title: 'Acute TCMR - Grade IIA',
      description: 'Mild to moderate intimal arteritis.',
      criteria: [
        { met: true, text: `v1 - Intimal arteritis (v=${v})` }
      ],
      interpretation: 'Vascular rejection present. Corticosteroid pulse therapy typically effective.'
    };
  }
  
  // Acute TCMR - Grade IB (i≥2 with t3)
  if ((i >= 2) && t === 3) {
    return {
      diagnosed: true,
      type: 'tcmr',
      category: 'Category 4',
      title: 'Acute TCMR - Grade IB',
      description: 'Significant interstitial inflammation with severe tubulitis.',
      criteria: [
        { met: true, text: `i≥2 with t3 (i=${i}, t=${t})` }
      ],
      interpretation: 'Moderate to severe acute cellular rejection. Corticosteroid pulse therapy recommended.'
    };
  }
  
  // Acute TCMR - Grade IA (i≥2 with t2)
  if ((i >= 2) && t === 2) {
    return {
      diagnosed: true,
      type: 'tcmr',
      category: 'Category 4',
      title: 'Acute TCMR - Grade IA',
      description: 'Interstitial inflammation with moderate tubulitis.',
      criteria: [
        { met: true, text: `i≥2 with t2 (i=${i}, t=${t})` }
      ],
      interpretation: 'Acute cellular rejection. Corticosteroid pulse therapy typically effective.'
    };
  }
  
  // Chronic Active TCMR - Grade IB
  if (ti >= 2 && iIfta >= 2 && (tIfta === 3 || t === 3)) {
    return {
      diagnosed: true,
      type: 'tcmr',
      category: 'Category 4',
      title: 'Chronic Active TCMR - Grade IB',
      description: 'Inflammation in IFTA areas with severe tubulitis.',
      criteria: [
        { met: true, text: `ti≥2 and i-IFTA≥2 (ti=${ti}, i-IFTA=${iIfta})` },
        { met: true, text: `t-IFTA3 or t3 (t-IFTA=${tIfta}, t=${t})` }
      ],
      interpretation: 'Chronic active cellular rejection. May require immunosuppression optimization.'
    };
  }
  
  // Chronic Active TCMR - Grade IA
  if (ti >= 2 && iIfta >= 2 && (tIfta === 2 || t === 2)) {
    return {
      diagnosed: true,
      type: 'tcmr',
      category: 'Category 4',
      title: 'Chronic Active TCMR - Grade IA',
      description: 'Inflammation in IFTA areas with moderate tubulitis.',
      criteria: [
        { met: true, text: `ti≥2 and i-IFTA≥2 (ti=${ti}, i-IFTA=${iIfta})` },
        { met: true, text: `t-IFTA2 or t2 (t-IFTA=${tIfta}, t=${t})` }
      ],
      interpretation: 'Chronic active rejection present. Consider immunosuppression adjustment.'
    };
  }
  
  // Chronic Active TCMR - Grade II (cv>0 with mononuclear inflammation)
  if (cv > 0) {
    return {
      diagnosed: true,
      type: 'tcmr',
      category: 'Category 4',
      title: 'Chronic Active TCMR - Grade II',
      description: 'Chronic allograft arteriopathy with inflammation.',
      criteria: [
        { met: true, text: `cv>0 with mononuclear inflammation (cv=${cv})` }
      ],
      interpretation: 'Chronic vascular rejection. Poor prognostic indicator. Optimize immunosuppression.'
    };
  }
  
  return { diagnosed: false, type: 'normal', category: '', title: '', description: '', criteria: [] };
}

function checkBorderline(scores: BanffScores): BanffDiagnosis {
  const { i, t, v } = scores;
  
  if (v === 0) {
    if ((t >= 1 && i === 1) || (t === 1 && i >= 2)) {
      return {
        diagnosed: true,
        type: 'borderline',
        category: 'Category 3',
        title: 'Borderline Changes (Suspicious for Acute TCMR)',
        description: 'Findings suspicious but not diagnostic for acute T-cell mediated rejection.',
        criteria: [
          { met: true, text: `Tubulitis present (t=${t})` },
          { met: true, text: `Mild inflammation (i=${i})` },
          { met: true, text: 'No arteritis (v=0)' }
        ],
        interpretation: 'Clinical correlation required. Consider repeat biopsy if graft dysfunction. May not require treatment if stable function.'
      };
    }
  }
  
  return { diagnosed: false, type: 'normal', category: '', title: '', description: '', criteria: [] };
}

// Helper to get Banff score interpretation
export function getBanffScoreDescription(score: string, value: number): string {
  const descriptions: Record<string, string[]> = {
    i: ["No inflammation", "10-25% of cortex inflamed", "26-50% of cortex inflamed", ">50% of cortex inflamed"],
    t: ["No tubulitis", "1-4 mononuclear cells/tubular cross-section", "5-10 cells/tubular cross-section", ">10 cells/tubular cross-section"],
    v: ["No arteritis", "Mild-moderate intimal arteritis", "Severe intimal arteritis (>25% luminal loss)", "Transmural arteritis/fibrinoid necrosis"],
    g: ["No glomerulitis", "Segmental/global glomerulitis in <25% of glomeruli", "25-75% of glomeruli", ">75% of glomeruli"],
    ptc: ["No peritubular capillaritis", "<10% of cortical PTCs", "10-50% of cortical PTCs", ">50% of cortical PTCs"],
    ci: ["≤5% of cortex fibrosed", "6-25% of cortex fibrosed", "26-50% of cortex fibrosed", ">50% of cortex fibrosed"],
    ct: ["No tubular atrophy", "≤25% of tubules atrophic", "26-50% of tubules atrophic", ">50% of tubules atrophic"],
    cv: ["No intimal thickening", "≤25% luminal narrowing", "26-50% luminal narrowing", ">50% luminal narrowing"],
    cg: ["No TG changes", "1a: Early TG (EM only) or 1b: GBM double contours in 1-25%", "GBM double contours in 26-50%", "GBM double contours in >50%"],
    c4d: ["Negative", "Minimal (<10%)", "Focal (10-50%)", "Diffuse (>50%)"],
  };
  
  return descriptions[score]?.[value] || "Unknown";
}


// ============================================================================
// 24-HOUR PROTEIN EXCRETION ESTIMATOR
// ============================================================================

export function estimated24HourProtein(
  testType: "pcr" | "acr",
  inputMode: "ratio" | "raw",
  ratioValue?: number,
  ratioUnit?: "mg_mg" | "mg_mmol" | "mg_g",
  proteinValue?: number,
  proteinUnit?: "mg_dL" | "g_L" | "mg_L",
  creatinineValue?: number,
  creatinineUnit?: "mg_dL" | "mmol_L"
): number {
  // 24-Hour Urinary Protein Excretion Estimator
  // Supports both PCR (Protein/Creatinine Ratio) and ACR (Albumin/Creatinine Ratio)
  // Exact implementation matching the original HTML calculator
  // Formula: ratio in mg/mg = g/day

  let ratioMgPerMg: number;

  if (inputMode === "ratio") {
    // Convert ratio to mg/mg using the exact same logic as original HTML
    if (ratioValue === undefined || isNaN(ratioValue)) return 0;

    const unit = ratioUnit || "mg_mg";

    if (unit === "mg_mg") {
      ratioMgPerMg = ratioValue;
    } else if (unit === "mg_g") {
      // Original: r / 1000.0
      ratioMgPerMg = ratioValue / 1000.0;
    } else if (unit === "mg_mmol") {
      // Original: r / 113.12
      ratioMgPerMg = ratioValue / 113.12;
    } else {
      ratioMgPerMg = ratioValue;
    }
  } else {
    // Calculate from raw values using exact same logic as original HTML
    if (proteinValue === undefined || creatinineValue === undefined ||
        isNaN(proteinValue) || isNaN(creatinineValue) || creatinineValue <= 0) return 0;

    let protein = proteinValue;
    let creat = creatinineValue;

    // Default units to mg_dL if not specified
    const pUnit = proteinUnit || "mg_dL";
    const cUnit = creatinineUnit || "mg_dL";

    // Convert protein/albumin to mg/L (exact same as original HTML)
    if (pUnit === "mg_dL") {
      protein = protein * 10;
    } else if (pUnit === "g_L") {
      protein = protein * 1000;
    }
    // mg_L stays as is

    // Convert creatinine to mg/L (exact same as original HTML)
    if (cUnit === "mg_dL") {
      creat = creat * 10;
    } else if (cUnit === "mmol_L") {
      creat = creat * 113.12;
    }

    // Calculate ratio: protein (mg/L) / creatinine (mg/L) = mg/mg = g/day
    ratioMgPerMg = protein / creat;
  }

  // The ratio in mg/mg equals g/day (standard approximation)
  // This applies to both PCR and ACR - the formula is the same
  // The difference is in the interpretation (albumin vs total protein)
  const gPerDay = ratioMgPerMg;

  return Math.round(gPerDay * 1000) / 1000;
}


// ============================================================================
// ADDITIONAL GFR EQUATIONS
// ============================================================================

/**
 * Lund-Malmö Revised (LMR) eGFR Equation
 * Swedish equation with improved accuracy across GFR, age, and BMI intervals
 * Reference: Björk J et al. Scand J Clin Lab Invest. 2011;71:232-239
 *            Nyman U et al. Clin Chem Lab Med. 2014;52:815-824
 */
export function lundMalmoRevised(
  creatinine: number,
  age: number,
  sex: "M" | "F",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // Convert to mg/dL if needed
  let scr = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;
  
  // Q values (median creatinine for healthy population)
  const Q = sex === "F" ? 0.70 : 0.90;
  
  // LMR formula uses piecewise function based on SCr/Q ratio
  const scrOverQ = scr / Q;
  
  // X constant (intercept) - derived from the original equation
  // For females: X ≈ 2.50 + 0.0121 × 180 = 4.68 (at reference height 180cm)
  // For males: X ≈ 2.56 + 0.0121 × 180 = 4.74
  // Simplified form using the published coefficients
  
  let eGFR: number;
  
  if (sex === "F") {
    if (scrOverQ < 1) {
      // eGFR = e^(X - 0.0158 × Age + 0.438 × ln(Age))
      const X = 4.0 - 0.0158 * age + 0.438 * Math.log(age);
      eGFR = Math.exp(X) * Math.pow(scrOverQ, -0.323);
    } else {
      const X = 4.0 - 0.0158 * age + 0.438 * Math.log(age);
      eGFR = Math.exp(X) * Math.pow(scrOverQ, -1.129);
    }
  } else {
    if (scrOverQ < 1) {
      const X = 4.1 - 0.0158 * age + 0.438 * Math.log(age);
      eGFR = Math.exp(X) * Math.pow(scrOverQ, -0.323);
    } else {
      const X = 4.1 - 0.0158 * age + 0.438 * Math.log(age);
      eGFR = Math.exp(X) * Math.pow(scrOverQ, -1.129);
    }
  }
  
  return Math.round(eGFR);
}

/**
 * BIS1 (Berlin Initiative Study 1) eGFR Equation
 * Optimized for elderly patients ≥70 years old
 * Reference: Schaeffner ES et al. Ann Intern Med. 2012;157(7):471-481
 * Formula: eGFR = 3736 × SCr^(-0.87) × Age^(-0.95) × (0.82 if female)
 */
export function bis1Elderly(
  creatinine: number,
  age: number,
  sex: "M" | "F",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // BIS1 formula uses creatinine in mg/dL
  // Convert μmol/L to mg/dL if needed (divide by 88.4)
  let scrMgdl = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;
  
  // BIS1 formula: eGFR = 3736 × SCr^(-0.87) × Age^(-0.95) × 0.82 (if female)
  // Where SCr is in mg/dL
  const sexMultiplier = sex === "F" ? 0.82 : 1.0;
  
  const eGFR = 3736 * Math.pow(scrMgdl, -0.87) * Math.pow(age, -0.95) * sexMultiplier;
  
  return Math.round(eGFR);
}

/**
 * FAS (Full Age Spectrum) eGFR Equation
 * Works across all ages from children (2+) to elderly without discontinuity
 * Reference: Pottel H et al. Nephrol Dial Transplant. 2016;31(5):798-806
 * Formula: eGFR = 107.3 / (SCr/Q) for SCr/Q ≤ 1
 *          eGFR = 107.3 / (SCr/Q)^1.209 for SCr/Q > 1
 *          For age ≥40: multiply by 0.988^(Age-40)
 */
export function fasFullAgeSpectrum(
  creatinine: number,
  age: number,
  sex: "M" | "F",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // Convert to mg/dL if needed
  let scr = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;
  
  // Get Q value based on age and sex
  const Q = getFasQValue(age, sex);
  
  const scrOverQ = scr / Q;
  
  let eGFR: number;
  
  if (scrOverQ <= 1) {
    eGFR = 107.3 / scrOverQ;
  } else {
    eGFR = 107.3 / Math.pow(scrOverQ, 1.209);
  }
  
  // Age adjustment for patients ≥40 years
  if (age >= 40) {
    eGFR = eGFR * Math.pow(0.988, age - 40);
  }
  
  return Math.round(eGFR);
}

/**
 * Get FAS Q value (median serum creatinine for healthy population)
 * Based on age and sex from Pottel et al. 2016
 */
function getFasQValue(age: number, sex: "M" | "F"): number {
  // Q values in mg/dL
  // Children (both sexes) - ages 1-14
  const childrenQ: Record<number, number> = {
    1: 0.26, 2: 0.29, 3: 0.31, 4: 0.34, 5: 0.38,
    6: 0.41, 7: 0.44, 8: 0.46, 9: 0.49, 10: 0.51,
    11: 0.53, 12: 0.57, 13: 0.59, 14: 0.61
  };
  
  // Male adolescents - ages 15-19
  const maleAdolescentQ: Record<number, number> = {
    15: 0.72, 16: 0.78, 17: 0.82, 18: 0.85, 19: 0.88
  };
  
  // Female adolescents - ages 15-19
  const femaleAdolescentQ: Record<number, number> = {
    15: 0.64, 16: 0.67, 17: 0.69, 18: 0.69, 19: 0.70
  };
  
  // Adults (≥20 years)
  const maleAdultQ = 0.90;
  const femaleAdultQ = 0.70;
  
  // Return appropriate Q value
  if (age <= 14) {
    // Use children Q values (same for both sexes)
    const roundedAge = Math.max(1, Math.min(14, Math.round(age)));
    return childrenQ[roundedAge] || 0.51; // Default to age 10 if not found
  } else if (age <= 19) {
    // Use adolescent Q values (sex-specific)
    const roundedAge = Math.round(age);
    if (sex === "M") {
      return maleAdolescentQ[roundedAge] || 0.82;
    } else {
      return femaleAdolescentQ[roundedAge] || 0.69;
    }
  } else {
    // Adults ≥20 years
    return sex === "M" ? maleAdultQ : femaleAdultQ;
  }
}


// ============================================================================
// CRITICAL CARE CALCULATORS
// ============================================================================

/**
 * qSOFA (Quick SOFA) Score
 * Quick bedside sepsis screening tool
 */
export function qsofa(
  respiratoryRate: number,
  systolicBP: number,
  gcs: number
): { score: number; criteria: string[]; interpretation: string; riskClass: string } {
  let score = 0;
  const criteria: string[] = [];

  // Respiratory Rate ≥22
  if (respiratoryRate >= 22) {
    score += 1;
    criteria.push(`RR ≥22: +1 (${respiratoryRate} breaths/min)`);
  } else {
    criteria.push(`RR <22: 0 (${respiratoryRate} breaths/min)`);
  }

  // Systolic BP ≤100
  if (systolicBP <= 100) {
    score += 1;
    criteria.push(`SBP ≤100: +1 (${systolicBP} mmHg)`);
  } else {
    criteria.push(`SBP >100: 0 (${systolicBP} mmHg)`);
  }

  // GCS <15
  if (gcs < 15) {
    score += 1;
    criteria.push(`GCS <15: +1 (GCS ${gcs})`);
  } else {
    criteria.push(`GCS 15: 0 (GCS ${gcs})`);
  }

  let interpretation = '';
  let riskClass = '';

  if (score >= 2) {
    interpretation = 'HIGH RISK';
    riskClass = 'high';
  } else if (score === 1) {
    interpretation = 'Intermediate';
    riskClass = 'medium';
  } else {
    interpretation = 'Low Score';
    riskClass = 'low';
  }

  return { score, criteria, interpretation, riskClass };
}

/**
 * NEWS2 (National Early Warning Score 2)
 * Standardized early warning score for clinical deterioration
 */
export function news2(
  respiratoryRate: number,
  spo2: number,
  supplementalO2: boolean,
  systolicBP: number,
  heartRate: number,
  temperature: number,
  consciousness: 'A' | 'C' | 'V' | 'P' | 'U'
): { score: number; breakdown: string[]; interpretation: string; riskClass: string } {
  let score = 0;
  const breakdown: string[] = [];

  // Respiratory Rate scoring
  let rrScore = 0;
  if (respiratoryRate <= 8) rrScore = 3;
  else if (respiratoryRate >= 9 && respiratoryRate <= 11) rrScore = 1;
  else if (respiratoryRate >= 12 && respiratoryRate <= 20) rrScore = 0;
  else if (respiratoryRate >= 21 && respiratoryRate <= 24) rrScore = 2;
  else if (respiratoryRate >= 25) rrScore = 3;
  score += rrScore;
  breakdown.push(`RR: ${rrScore} (${respiratoryRate}/min)`);

  // SpO2 scoring (Scale 1 - normal)
  let spo2Score = 0;
  if (spo2 <= 91) spo2Score = 3;
  else if (spo2 >= 92 && spo2 <= 93) spo2Score = 2;
  else if (spo2 >= 94 && spo2 <= 95) spo2Score = 1;
  else if (spo2 >= 96) spo2Score = 0;
  score += spo2Score;
  breakdown.push(`SpO₂: ${spo2Score} (${spo2}%)`);

  // Supplemental O2
  let o2Score = supplementalO2 ? 2 : 0;
  score += o2Score;
  breakdown.push(`O₂ therapy: ${o2Score} (${supplementalO2 ? 'Yes' : 'No'})`);

  // Systolic BP scoring
  let sbpScore = 0;
  if (systolicBP <= 90) sbpScore = 3;
  else if (systolicBP >= 91 && systolicBP <= 100) sbpScore = 2;
  else if (systolicBP >= 101 && systolicBP <= 110) sbpScore = 1;
  else if (systolicBP >= 111 && systolicBP <= 219) sbpScore = 0;
  else if (systolicBP >= 220) sbpScore = 3;
  score += sbpScore;
  breakdown.push(`SBP: ${sbpScore} (${systolicBP} mmHg)`);

  // Heart Rate scoring
  let hrScore = 0;
  if (heartRate <= 40) hrScore = 3;
  else if (heartRate >= 41 && heartRate <= 50) hrScore = 1;
  else if (heartRate >= 51 && heartRate <= 90) hrScore = 0;
  else if (heartRate >= 91 && heartRate <= 110) hrScore = 1;
  else if (heartRate >= 111 && heartRate <= 130) hrScore = 2;
  else if (heartRate >= 131) hrScore = 3;
  score += hrScore;
  breakdown.push(`HR: ${hrScore} (${heartRate}/min)`);

  // Temperature scoring
  let tempScore = 0;
  if (temperature <= 35.0) tempScore = 3;
  else if (temperature >= 35.1 && temperature <= 36.0) tempScore = 1;
  else if (temperature >= 36.1 && temperature <= 38.0) tempScore = 0;
  else if (temperature >= 38.1 && temperature <= 39.0) tempScore = 1;
  else if (temperature >= 39.1) tempScore = 2;
  score += tempScore;
  breakdown.push(`Temp: ${tempScore} (${temperature}°C)`);

  // Consciousness (AVPU) scoring
  let avpuScore = consciousness === 'A' ? 0 : 3;
  score += avpuScore;
  breakdown.push(`AVPU: ${avpuScore} (${consciousness})`);

  let interpretation = '';
  let riskClass = '';

  if (score >= 7) {
    interpretation = 'HIGH RISK';
    riskClass = 'high';
  } else if (score >= 5) {
    interpretation = 'MEDIUM RISK';
    riskClass = 'medium';
  } else if (score >= 1) {
    interpretation = 'Low-Medium Risk';
    riskClass = 'low';
  } else {
    interpretation = 'Low Risk';
    riskClass = 'low';
  }

  return { score, breakdown, interpretation, riskClass };
}

/**
 * SOFA (Sequential Organ Failure Assessment) Score
 * Assesses organ dysfunction in critically ill patients
 */
export function sofa(
  pao2: number,
  fio2: number,
  platelets: number,
  bilirubin: number,
  bilirubinUnit: 'μmol/L' | 'mg/dL',
  map: number,
  vasopressor: 'none' | 'dopa_low' | 'dopa_mid' | 'dopa_high',
  gcs: number,
  creatinine: number,
  creatinineUnit: 'μmol/L' | 'mg/dL',
  urineOutput: number
): { score: number; organScores: Record<string, number>; interpretation: string; riskClass: string } {
  let sofaTotal = 0;
  const organScores: Record<string, number> = {};

  // Convert bilirubin to μmol/L if needed
  let bilirubinSI = bilirubin;
  if (bilirubinUnit === 'mg/dL') {
    bilirubinSI = bilirubin * 17.1; // mg/dL to μmol/L
  }

  // Convert creatinine to μmol/L if needed
  let creatinineSI = creatinine;
  if (creatinineUnit === 'mg/dL') {
    creatinineSI = creatinine * 88.4; // mg/dL to μmol/L
  }

  // Respiratory (PaO2/FiO2 ratio)
  const pfRatio = pao2 / (fio2 / 100);
  let respScore = 0;
  if (pfRatio < 100) respScore = 4;
  else if (pfRatio >= 100 && pfRatio < 200) respScore = 3;
  else if (pfRatio >= 200 && pfRatio < 300) respScore = 2;
  else if (pfRatio >= 300 && pfRatio < 400) respScore = 1;
  else respScore = 0;
  organScores.respiratory = respScore;
  sofaTotal += respScore;

  // Coagulation (Platelets)
  let coagScore = 0;
  if (platelets < 20) coagScore = 4;
  else if (platelets >= 20 && platelets < 50) coagScore = 3;
  else if (platelets >= 50 && platelets < 100) coagScore = 2;
  else if (platelets >= 100 && platelets < 150) coagScore = 1;
  else coagScore = 0;
  organScores.coagulation = coagScore;
  sofaTotal += coagScore;

  // Liver (Bilirubin μmol/L)
  let liverScore = 0;
  if (bilirubinSI >= 204) liverScore = 4;
  else if (bilirubinSI >= 102 && bilirubinSI < 204) liverScore = 3;
  else if (bilirubinSI >= 34 && bilirubinSI < 102) liverScore = 2;
  else if (bilirubinSI >= 20 && bilirubinSI < 34) liverScore = 1;
  else liverScore = 0;
  organScores.liver = liverScore;
  sofaTotal += liverScore;

  // Cardiovascular (MAP and vasopressors)
  let cvScore = 0;
  if (vasopressor === 'dopa_high') cvScore = 4;
  else if (vasopressor === 'dopa_mid') cvScore = 3;
  else if (vasopressor === 'dopa_low') cvScore = 2;
  else if (map < 70) cvScore = 1;
  else cvScore = 0;
  organScores.cardiovascular = cvScore;
  sofaTotal += cvScore;

  // CNS (GCS)
  let cnsScore = 0;
  if (gcs >= 13 && gcs <= 15) cnsScore = 0;
  else if (gcs >= 10 && gcs <= 12) cnsScore = 1;
  else if (gcs >= 6 && gcs <= 9) cnsScore = 2;
  else if (gcs >= 3 && gcs < 6) cnsScore = 3;
  else cnsScore = 4;
  organScores.cns = cnsScore;
  sofaTotal += cnsScore;

  // Renal (Creatinine μmol/L or UOP)
  let renalScore = 0;
  if (creatinineSI >= 442 || urineOutput < 200) renalScore = 4;
  else if (creatinineSI >= 354 && creatinineSI < 442) renalScore = 3;
  else if ((creatinineSI >= 221 && creatinineSI < 354) || urineOutput < 500) renalScore = 2;
  else if (creatinineSI >= 110 && creatinineSI < 221) renalScore = 1;
  else renalScore = 0;
  organScores.renal = renalScore;
  sofaTotal += renalScore;

  let interpretation = '';
  let riskClass = '';

  if (sofaTotal >= 11) {
    interpretation = 'VERY HIGH';
    riskClass = 'high';
  } else if (sofaTotal >= 6) {
    interpretation = 'HIGH';
    riskClass = 'high';
  } else if (sofaTotal >= 2) {
    interpretation = 'MODERATE';
    riskClass = 'medium';
  } else {
    interpretation = 'Low';
    riskClass = 'low';
  }

  return { score: sofaTotal, organScores, interpretation, riskClass };
}

/**
 * Wells Score for Pulmonary Embolism (PE)
 * Clinical prediction rule for PE probability
 */
export function wellsPE(
  dvtSigns: boolean,
  peTopDiagnosis: boolean,
  heartRateOver100: boolean,
  immobilization: boolean,
  previousPeDvt: boolean,
  hemoptysis: boolean,
  malignancy: boolean
): { score: number; criteria: string[]; interpretation: string; riskClass: string; simplified: string } {
  let score = 0;
  const criteria: string[] = [];

  if (dvtSigns) {
    score += 3.0;
    criteria.push('Clinical signs/symptoms of DVT: +3.0');
  }
  if (peTopDiagnosis) {
    score += 3.0;
    criteria.push('PE is #1 diagnosis or equally likely: +3.0');
  }
  if (heartRateOver100) {
    score += 1.5;
    criteria.push('Heart rate >100: +1.5');
  }
  if (immobilization) {
    score += 1.5;
    criteria.push('Immobilization ≥3 days or surgery in past 4 weeks: +1.5');
  }
  if (previousPeDvt) {
    score += 1.5;
    criteria.push('Previous PE or DVT: +1.5');
  }
  if (hemoptysis) {
    score += 1.0;
    criteria.push('Hemoptysis: +1.0');
  }
  if (malignancy) {
    score += 1.0;
    criteria.push('Malignancy: +1.0');
  }

  let interpretation = '';
  let riskClass = '';
  let simplified = '';

  // Traditional three-tier interpretation
  if (score > 6) {
    interpretation = 'HIGH PROBABILITY';
    riskClass = 'high';
  } else if (score >= 2) {
    interpretation = 'MODERATE PROBABILITY';
    riskClass = 'medium';
  } else {
    interpretation = 'LOW PROBABILITY';
    riskClass = 'low';
  }

  // Simplified two-tier interpretation
  if (score > 4) {
    simplified = 'PE Likely';
  } else {
    simplified = 'PE Unlikely';
  }

  return { score, criteria, interpretation, riskClass, simplified };
}

/**
 * Wells Score for Deep Vein Thrombosis (DVT)
 * Clinical prediction rule for DVT probability
 */
export function wellsDVT(
  activeCancer: boolean,
  paralysis: boolean,
  bedridden: boolean,
  localizedTenderness: boolean,
  entireLegSwollen: boolean,
  calfSwelling: boolean,
  pittingEdema: boolean,
  collateralVeins: boolean,
  previousDvt: boolean,
  alternativeDiagnosis: boolean
): { score: number; criteria: string[]; interpretation: string; riskClass: string } {
  let score = 0;
  const criteria: string[] = [];

  if (activeCancer) {
    score += 1;
    criteria.push('Active cancer: +1');
  }
  if (paralysis) {
    score += 1;
    criteria.push('Paralysis/paresis/recent cast: +1');
  }
  if (bedridden) {
    score += 1;
    criteria.push('Recently bedridden ≥3 days or major surgery: +1');
  }
  if (localizedTenderness) {
    score += 1;
    criteria.push('Localized tenderness along deep venous system: +1');
  }
  if (entireLegSwollen) {
    score += 1;
    criteria.push('Entire leg swollen: +1');
  }
  if (calfSwelling) {
    score += 1;
    criteria.push('Calf swelling ≥3 cm vs asymptomatic leg: +1');
  }
  if (pittingEdema) {
    score += 1;
    criteria.push('Pitting edema confined to symptomatic leg: +1');
  }
  if (collateralVeins) {
    score += 1;
    criteria.push('Collateral superficial veins (non-varicose): +1');
  }
  if (previousDvt) {
    score += 1;
    criteria.push('Previously documented DVT: +1');
  }
  if (alternativeDiagnosis) {
    score -= 2;
    criteria.push('Alternative diagnosis at least as likely: -2');
  }

  let interpretation = '';
  let riskClass = '';

  if (score >= 3) {
    interpretation = 'HIGH PROBABILITY';
    riskClass = 'high';
  } else if (score >= 1) {
    interpretation = 'MODERATE PROBABILITY';
    riskClass = 'medium';
  } else {
    interpretation = 'LOW PROBABILITY';
    riskClass = 'low';
  }

  return { score, criteria, interpretation, riskClass };
}


// Glasgow Coma Scale (GCS) Calculator
export function glasgowComaScale(
  eyeOpening: number,
  verbalResponse: number,
  motorResponse: number
): { score: number; components: { eye: number; verbal: number; motor: number }; severity: string } {
  const score = eyeOpening + verbalResponse + motorResponse;
  
  let severity = '';
  if (score <= 8) {
    severity = 'Severe (Coma)';
  } else if (score <= 12) {
    severity = 'Moderate';
  } else {
    severity = 'Mild';
  }
  
  return {
    score,
    components: {
      eye: eyeOpening,
      verbal: verbalResponse,
      motor: motorResponse
    },
    severity
  };
}

// PESI (Pulmonary Embolism Severity Index) Calculator
export function pesiScore(
  age: number,
  isMale: boolean,
  hasCancer: boolean,
  hasHeartFailure: boolean,
  hasChronicLungDisease: boolean,
  pulseOver110: boolean,
  systolicBPLow: boolean,
  respiratoryRateHigh: boolean,
  tempLow: boolean,
  alteredMentalStatus: boolean,
  spo2Low: boolean
): { score: number; riskClass: string; mortality: string; criteria: string[] } {
  let score = age; // Age contributes directly to score
  const criteria: string[] = [`Age: +${age}`];
  
  if (isMale) {
    score += 10;
    criteria.push('Male sex: +10');
  }
  if (hasCancer) {
    score += 30;
    criteria.push('Cancer: +30');
  }
  if (hasHeartFailure) {
    score += 10;
    criteria.push('Heart failure: +10');
  }
  if (hasChronicLungDisease) {
    score += 10;
    criteria.push('Chronic lung disease: +10');
  }
  if (pulseOver110) {
    score += 20;
    criteria.push('Pulse ≥110/min: +20');
  }
  if (systolicBPLow) {
    score += 30;
    criteria.push('Systolic BP <100 mmHg: +30');
  }
  if (respiratoryRateHigh) {
    score += 20;
    criteria.push('Respiratory rate ≥30/min: +20');
  }
  if (tempLow) {
    score += 20;
    criteria.push('Temperature <36°C: +20');
  }
  if (alteredMentalStatus) {
    score += 60;
    criteria.push('Altered mental status: +60');
  }
  if (spo2Low) {
    score += 20;
    criteria.push('Arterial O₂ saturation <90%: +20');
  }
  
  let riskClass = '';
  let mortality = '';
  
  if (score > 125) {
    riskClass = 'Class V (Very High)';
    mortality = '10.0-24.5%';
  } else if (score > 105) {
    riskClass = 'Class IV (High)';
    mortality = '4.0-11.4%';
  } else if (score > 85) {
    riskClass = 'Class III (Intermediate)';
    mortality = '3.2-7.1%';
  } else if (score > 65) {
    riskClass = 'Class II (Low)';
    mortality = '1.7-3.5%';
  } else {
    riskClass = 'Class I (Very Low)';
    mortality = '0-1.6%';
  }
  
  return { score, riskClass, mortality, criteria };
}

// APACHE II Score Calculator
export function apacheIIScore(
  age: number,
  temperature: number,
  map: number,
  heartRate: number,
  respiratoryRate: number,
  fio2: number,
  pao2: number | null,
  aaGradient: number | null,
  arterialPH: number,
  sodium: number,
  potassium: number,
  creatinine: number,
  acuteRenalFailure: boolean,
  hematocrit: number,
  wbc: number,
  gcs: number,
  chronicHealth: 'none' | 'elective' | 'emergency'
): { score: number; components: { aps: number; age: number; chronic: number }; predictedMortality: string } {
  let apsScore = 0;
  
  // Temperature scoring
  if (temperature >= 41) apsScore += 4;
  else if (temperature >= 39) apsScore += 3;
  else if (temperature >= 38.5) apsScore += 1;
  else if (temperature >= 36) apsScore += 0;
  else if (temperature >= 34) apsScore += 1;
  else if (temperature >= 32) apsScore += 2;
  else if (temperature >= 30) apsScore += 3;
  else apsScore += 4;
  
  // MAP scoring
  if (map >= 160) apsScore += 4;
  else if (map >= 130) apsScore += 3;
  else if (map >= 110) apsScore += 2;
  else if (map >= 70) apsScore += 0;
  else if (map >= 50) apsScore += 2;
  else apsScore += 4;
  
  // Heart rate scoring
  if (heartRate >= 180) apsScore += 4;
  else if (heartRate >= 140) apsScore += 3;
  else if (heartRate >= 110) apsScore += 2;
  else if (heartRate >= 70) apsScore += 0;
  else if (heartRate >= 55) apsScore += 2;
  else if (heartRate >= 40) apsScore += 3;
  else apsScore += 4;
  
  // Respiratory rate scoring
  if (respiratoryRate >= 50) apsScore += 4;
  else if (respiratoryRate >= 35) apsScore += 3;
  else if (respiratoryRate >= 25) apsScore += 1;
  else if (respiratoryRate >= 12) apsScore += 0;
  else if (respiratoryRate >= 10) apsScore += 1;
  else if (respiratoryRate >= 6) apsScore += 2;
  else apsScore += 4;
  
  // Oxygenation scoring
  if (fio2 >= 50 && aaGradient !== null) {
    // Use A-a gradient
    if (aaGradient >= 500) apsScore += 4;
    else if (aaGradient >= 350) apsScore += 3;
    else if (aaGradient >= 200) apsScore += 2;
    else apsScore += 0;
  } else if (pao2 !== null) {
    // Use PaO2
    if (pao2 >= 70) apsScore += 0;
    else if (pao2 >= 61) apsScore += 1;
    else if (pao2 >= 55) apsScore += 3;
    else apsScore += 4;
  }
  
  // Arterial pH scoring
  if (arterialPH >= 7.7) apsScore += 4;
  else if (arterialPH >= 7.6) apsScore += 3;
  else if (arterialPH >= 7.5) apsScore += 1;
  else if (arterialPH >= 7.33) apsScore += 0;
  else if (arterialPH >= 7.25) apsScore += 2;
  else if (arterialPH >= 7.15) apsScore += 3;
  else apsScore += 4;
  
  // Sodium scoring
  if (sodium >= 180) apsScore += 4;
  else if (sodium >= 160) apsScore += 3;
  else if (sodium >= 155) apsScore += 2;
  else if (sodium >= 150) apsScore += 1;
  else if (sodium >= 130) apsScore += 0;
  else if (sodium >= 120) apsScore += 2;
  else if (sodium >= 111) apsScore += 3;
  else apsScore += 4;
  
  // Potassium scoring
  if (potassium >= 7) apsScore += 4;
  else if (potassium >= 6) apsScore += 3;
  else if (potassium >= 5.5) apsScore += 1;
  else if (potassium >= 3.5) apsScore += 0;
  else if (potassium >= 3) apsScore += 1;
  else if (potassium >= 2.5) apsScore += 2;
  else apsScore += 4;
  
  // Creatinine scoring (double if ARF)
  let creatPoints = 0;
  if (creatinine >= 3.5) creatPoints = 4;
  else if (creatinine >= 2) creatPoints = 3;
  else if (creatinine >= 1.5) creatPoints = 2;
  else if (creatinine >= 0.6) creatPoints = 0;
  else creatPoints = 2;
  
  if (acuteRenalFailure) creatPoints *= 2;
  apsScore += creatPoints;
  
  // Hematocrit scoring
  if (hematocrit >= 60) apsScore += 4;
  else if (hematocrit >= 50) apsScore += 2;
  else if (hematocrit >= 46) apsScore += 1;
  else if (hematocrit >= 30) apsScore += 0;
  else if (hematocrit >= 20) apsScore += 2;
  else apsScore += 4;
  
  // WBC scoring
  if (wbc >= 40) apsScore += 4;
  else if (wbc >= 20) apsScore += 2;
  else if (wbc >= 15) apsScore += 1;
  else if (wbc >= 3) apsScore += 0;
  else if (wbc >= 1) apsScore += 2;
  else apsScore += 4;
  
  // GCS scoring (15 - GCS)
  apsScore += (15 - gcs);
  
  // Age points
  let agePoints = 0;
  if (age >= 75) agePoints = 6;
  else if (age >= 65) agePoints = 5;
  else if (age >= 55) agePoints = 3;
  else if (age >= 45) agePoints = 2;
  else agePoints = 0;
  
  // Chronic health points
  let chronicPoints = 0;
  if (chronicHealth === 'emergency') chronicPoints = 5;
  else if (chronicHealth === 'elective') chronicPoints = 2;
  
  const totalScore = apsScore + agePoints + chronicPoints;
  
  // Predicted mortality estimation
  let predictedMortality = '';
  if (totalScore >= 35) predictedMortality = '~85%';
  else if (totalScore >= 30) predictedMortality = '~75%';
  else if (totalScore >= 25) predictedMortality = '~55%';
  else if (totalScore >= 20) predictedMortality = '~40%';
  else if (totalScore >= 15) predictedMortality = '~25%';
  else if (totalScore >= 10) predictedMortality = '~15%';
  else if (totalScore >= 5) predictedMortality = '~8%';
  else predictedMortality = '~4%';
  
  return {
    score: totalScore,
    components: {
      aps: apsScore,
      age: agePoints,
      chronic: chronicPoints
    },
    predictedMortality
  };
}


// SIRS Criteria Calculator
export function sirsScore(
  temperature: string,
  heartRate: string,
  respiratoryRate: string,
  wbc: string
): { score: number; criteria: { temp: boolean; hr: boolean; rr: boolean; wbc: boolean } } {
  const tempAbnormal = temperature === 'abnormal';
  const hrAbnormal = heartRate === 'abnormal';
  const rrAbnormal = respiratoryRate === 'abnormal';
  const wbcAbnormal = wbc === 'abnormal';
  
  const score = (tempAbnormal ? 1 : 0) + (hrAbnormal ? 1 : 0) + (rrAbnormal ? 1 : 0) + (wbcAbnormal ? 1 : 0);
  
  return {
    score,
    criteria: {
      temp: tempAbnormal,
      hr: hrAbnormal,
      rr: rrAbnormal,
      wbc: wbcAbnormal
    }
  };
}

// Revised Geneva Score for PE
export function genevaRevisedScore(
  age: string,
  previousPeDvt: string,
  surgery: string,
  malignancy: string,
  unilateralPain: string,
  hemoptysis: string,
  heartRate: string,
  legPainEdema: string
): { score: number; components: Record<string, number> } {
  const agePoints = age === 'yes' ? 1 : 0;
  const previousPeDvtPoints = previousPeDvt === 'yes' ? 3 : 0;
  const surgeryPoints = surgery === 'yes' ? 2 : 0;
  const malignancyPoints = malignancy === 'yes' ? 2 : 0;
  const unilateralPainPoints = unilateralPain === 'yes' ? 3 : 0;
  const hemoptysisPoints = hemoptysis === 'yes' ? 2 : 0;
  let heartRatePoints = 0;
  if (heartRate === 'moderate') heartRatePoints = 3;
  else if (heartRate === 'high') heartRatePoints = 5;
  const legPainEdemaPoints = legPainEdema === 'yes' ? 4 : 0;
  
  const score = agePoints + previousPeDvtPoints + surgeryPoints + malignancyPoints + 
                unilateralPainPoints + hemoptysisPoints + heartRatePoints + legPainEdemaPoints;
  
  return {
    score,
    components: {
      age: agePoints,
      previousPeDvt: previousPeDvtPoints,
      surgery: surgeryPoints,
      malignancy: malignancyPoints,
      unilateralPain: unilateralPainPoints,
      hemoptysis: hemoptysisPoints,
      heartRate: heartRatePoints,
      legPainEdema: legPainEdemaPoints
    }
  };
}


// ============================================================================
// HAS-BLED Score for Bleeding Risk in Anticoagulated Patients
// ============================================================================

export function hasbledScore(
  hypertension: string,
  renalDisease: string,
  liverDisease: string,
  strokeHistory: string,
  priorBleeding: string,
  labileINR: string,
  age: string,
  medications: string,
  alcoholUse: string
): { score: number; components: Record<string, number>; annualBleedingRisk: string } {
  const hypertensionPoints = hypertension === 'yes' ? 1 : 0;
  const renalPoints = renalDisease === 'yes' ? 1 : 0;
  const liverPoints = liverDisease === 'yes' ? 1 : 0;
  const strokePoints = strokeHistory === 'yes' ? 1 : 0;
  const bleedingPoints = priorBleeding === 'yes' ? 1 : 0;
  const inrPoints = labileINR === 'yes' ? 1 : 0;
  const agePoints = age === 'yes' ? 1 : 0;
  const medsPoints = medications === 'yes' ? 1 : 0;
  const alcoholPoints = alcoholUse === 'yes' ? 1 : 0;
  
  const score = hypertensionPoints + renalPoints + liverPoints + strokePoints + 
                bleedingPoints + inrPoints + agePoints + medsPoints + alcoholPoints;
  
  // Annual major bleeding risk based on score
  let annualBleedingRisk: string;
  if (score === 0) annualBleedingRisk = '0.9%';
  else if (score === 1) annualBleedingRisk = '3.4%';
  else if (score === 2) annualBleedingRisk = '4.1%';
  else if (score === 3) annualBleedingRisk = '5.8%';
  else if (score === 4) annualBleedingRisk = '8.9%';
  else annualBleedingRisk = '>10%';
  
  return {
    score,
    components: {
      hypertension: hypertensionPoints,
      renal: renalPoints,
      liver: liverPoints,
      stroke: strokePoints,
      bleeding: bleedingPoints,
      labileINR: inrPoints,
      age: agePoints,
      medications: medsPoints,
      alcohol: alcoholPoints
    },
    annualBleedingRisk
  };
}

// ============================================================================
// PERC Rule (Pulmonary Embolism Rule-out Criteria)
// ============================================================================

export function percRule(
  age: string,
  heartRate: string,
  oxygenSaturation: string,
  unilateralLegSwelling: string,
  hemoptysis: string,
  recentSurgeryTrauma: string,
  priorPeDvt: string,
  hormoneUse: string
): { allNegative: boolean; criteria: Record<string, boolean>; criteriaCount: number } {
  const agePositive = age === 'yes';
  const hrPositive = heartRate === 'yes';
  const spo2Positive = oxygenSaturation === 'yes';
  const legSwellingPositive = unilateralLegSwelling === 'yes';
  const hemoptysisPositive = hemoptysis === 'yes';
  const surgeryPositive = recentSurgeryTrauma === 'yes';
  const priorPeDvtPositive = priorPeDvt === 'yes';
  const hormonePositive = hormoneUse === 'yes';
  
  const criteriaCount = [agePositive, hrPositive, spo2Positive, legSwellingPositive, 
                         hemoptysisPositive, surgeryPositive, priorPeDvtPositive, hormonePositive]
                         .filter(Boolean).length;
  
  return {
    allNegative: criteriaCount === 0,
    criteria: {
      age: agePositive,
      heartRate: hrPositive,
      oxygenSaturation: spo2Positive,
      unilateralLegSwelling: legSwellingPositive,
      hemoptysis: hemoptysisPositive,
      recentSurgeryTrauma: surgeryPositive,
      priorPeDvt: priorPeDvtPositive,
      hormoneUse: hormonePositive
    },
    criteriaCount
  };
}

// ============================================================================
// Anticoagulation Reversal Guide
// ============================================================================

export interface AnticoagulantReversalResult {
  anticoagulant: string;
  indication: 'bleeding' | 'surgery';
  reversalAgents: {
    primary: string;
    dose: string;
    notes: string;
  }[];
  supportiveMeasures: string[];
  monitoringParameters: string[];
  timeToEffect: string;
  specialConsiderations: string[];
  // Pre-procedural fields (only for surgery indications)
  preProceduralGuidance?: {
    holdTime: string;
    lastDoseToSurgery: string;
    bridgingRequired: boolean;
    bridgingProtocol?: string;
    preOpLabs: string[];
    resumptionGuidance: string;
  };
}

export function anticoagulationReversal(
  anticoagulant: string,
  indication: string,
  renalFunction: string,
  bleedingSeverity: string,
  weight?: number
): AnticoagulantReversalResult {
  const weightKg = weight || 70;
  const isSurgery = indication === 'urgent-surgery' || indication === 'elective';
  const isUrgentSurgery = indication === 'urgent-surgery';
  
  // Pre-procedural hold times based on renal function
  const getHoldTime = (normalHold: string, moderateHold: string, severeHold: string): string => {
    switch (renalFunction) {
      case 'normal': return normalHold;
      case 'moderate': return moderateHold;
      case 'severe':
      case 'dialysis': return severeHold;
      default: return normalHold;
    }
  };
  
  switch (anticoagulant) {
    case 'warfarin':
      if (isSurgery) {
        return {
          anticoagulant: 'Warfarin',
          indication: 'surgery',
          reversalAgents: isUrgentSurgery ? [
            {
              primary: 'Vitamin K (Phytonadione)',
              dose: 'PO: 2.5-5 mg (INR reversal in 24-48h)\nIV: 1-2.5 mg (faster onset, 6-12h)',
              notes: 'For urgent surgery, low-dose vitamin K preferred to avoid over-correction'
            },
            {
              primary: '4-Factor PCC (if surgery <6 hours)',
              dose: 'INR 2-4: 25 units/kg\nINR 4-6: 35 units/kg',
              notes: 'Use only if surgery cannot wait for vitamin K effect'
            }
          ] : [
            {
              primary: 'Hold warfarin',
              dose: 'Stop 5 days before procedure',
              notes: 'INR typically normalizes in 5 days. Check INR day before surgery.'
            },
            {
              primary: 'Vitamin K (if INR elevated day before)',
              dose: 'PO: 1-2.5 mg',
              notes: 'Give if INR >1.5 the day before surgery'
            }
          ],
          supportiveMeasures: [
            'Check INR 1-2 days before procedure',
            'Ensure INR <1.5 for most procedures',
            'Higher INR may be acceptable for minor procedures'
          ],
          monitoringParameters: [
            'INR day before surgery (target <1.5)',
            'INR on day of surgery if concern',
            'Post-op bleeding assessment'
          ],
          timeToEffect: isUrgentSurgery ? 'Vitamin K IV: 6-12 hours; PCC: immediate' : 'Warfarin cessation: 5 days',
          specialConsiderations: [
            'High thrombotic risk patients may need bridging (see bridging protocol)',
            'Low-risk procedures may not require warfarin interruption',
            'Dental procedures: consider continuing warfarin with local hemostasis'
          ],
          preProceduralGuidance: {
            holdTime: '5 days before procedure',
            lastDoseToSurgery: 'Last dose 5 days (120 hours) before surgery',
            bridgingRequired: false, // Depends on thrombotic risk - see notes
            bridgingProtocol: 'HIGH THROMBOTIC RISK (mechanical valve, recent VTE <3mo, CHADS2 ≥5):\n- Start LMWH 3 days before surgery when INR <2\n- Last prophylactic dose: 24h before surgery\n- Last therapeutic dose: 24h before surgery\n\nMODERATE RISK: Consider bridging case-by-case\n\nLOW RISK: No bridging needed',
            preOpLabs: ['INR (day before surgery, target <1.5)', 'CBC', 'Type and screen if major surgery'],
            resumptionGuidance: 'Resume warfarin 12-24 hours post-op if adequate hemostasis. Bridge with LMWH until INR therapeutic if high thrombotic risk.'
          }
        };
      }
      return {
        anticoagulant: 'Warfarin',
        indication: 'bleeding',
        reversalAgents: [
          {
            primary: '4-Factor PCC (Kcentra)',
            dose: bleedingSeverity === 'life-threatening' 
              ? 'INR 2-4: 25 units/kg (max 2500 units)\nINR 4-6: 35 units/kg (max 3500 units)\nINR >6: 50 units/kg (max 5000 units)'
              : 'Consider lower doses for non-life-threatening bleeding',
            notes: 'Preferred for rapid reversal. Contains factors II, VII, IX, X, protein C and S'
          },
          {
            primary: 'Vitamin K (Phytonadione)',
            dose: 'IV: 10 mg slow infusion over 20-60 min\nPO: 2.5-10 mg',
            notes: 'Always give with PCC for sustained reversal. IV onset 6-12 hours, PO onset 24-48 hours'
          },
          {
            primary: 'Fresh Frozen Plasma (FFP)',
            dose: '10-15 mL/kg (typically 4-6 units)',
            notes: 'Use if PCC unavailable. Slower onset, volume overload risk'
          }
        ],
        supportiveMeasures: [
          'Hold warfarin',
          'Identify and treat bleeding source',
          'Transfuse PRBCs if hemoglobin <7-8 g/dL',
          'Consider platelets if <50,000 or on antiplatelet therapy'
        ],
        monitoringParameters: [
          'INR every 30-60 min until stable',
          'Hemoglobin/hematocrit every 4-6 hours',
          'Clinical bleeding assessment'
        ],
        timeToEffect: 'PCC: 10-15 minutes; Vitamin K IV: 6-12 hours',
        specialConsiderations: [
          'PCC is prothrombotic - use caution in recent VTE, DIC',
          'Vitamin K may cause anaphylaxis (rare) - slow IV infusion',
          'Consider heparin bridging when restarting anticoagulation'
        ]
      };
      
    case 'dabigatran':
      if (isSurgery) {
        const dabiHoldTime = getHoldTime('24-48 hours', '48-72 hours', '72-96 hours');
        return {
          anticoagulant: 'Dabigatran (Pradaxa)',
          indication: 'surgery',
          reversalAgents: isUrgentSurgery ? [
            {
              primary: 'Idarucizumab (Praxbind)',
              dose: '5 g IV (two 2.5 g vials) as bolus',
              notes: 'For urgent surgery when dabigatran cannot be held adequately. Complete reversal within minutes.'
            }
          ] : [
            {
              primary: 'Hold dabigatran',
              dose: `Stop ${dabiHoldTime} before procedure`,
              notes: 'Hold time depends on renal function and bleeding risk of procedure'
            }
          ],
          supportiveMeasures: [
            'No bridging anticoagulation needed (short half-life)',
            'Ensure adequate hydration to maintain renal clearance',
            'Avoid NSAIDs perioperatively'
          ],
          monitoringParameters: [
            'Renal function (CrCl) to determine hold time',
            'Thrombin time or aPTT if concerned about residual effect',
            'Post-op bleeding assessment'
          ],
          timeToEffect: isUrgentSurgery ? 'Idarucizumab: immediate' : `Drug clearance: ${dabiHoldTime}`,
          specialConsiderations: [
            'NO BRIDGING NEEDED - dabigatran has rapid onset/offset',
            'Renal function is critical for determining hold time',
            'CrCl >80: 24h hold; CrCl 50-80: 36h; CrCl 30-50: 48h; CrCl <30: 72-96h',
            'High bleeding risk procedures: add 24h to hold time'
          ],
          preProceduralGuidance: {
            holdTime: dabiHoldTime,
            lastDoseToSurgery: `Last dose ${dabiHoldTime} before surgery`,
            bridgingRequired: false,
            preOpLabs: ['CrCl/eGFR', 'aPTT or TT (optional, to confirm clearance)', 'CBC'],
            resumptionGuidance: 'Resume 24-72 hours post-op depending on bleeding risk. No bridging needed.'
          }
        };
      }
      return {
        anticoagulant: 'Dabigatran (Pradaxa)',
        indication: 'bleeding',
        reversalAgents: [
          {
            primary: 'Idarucizumab (Praxbind)',
            dose: '5 g IV (two 2.5 g vials) as bolus or infusion',
            notes: 'Specific reversal agent. Complete reversal within minutes. May redose if needed'
          },
          {
            primary: 'Hemodialysis',
            dose: '4-hour session removes ~60% of drug',
            notes: 'Consider if idarucizumab unavailable. Dabigatran is 35% protein bound'
          },
          {
            primary: '4-Factor PCC (if specific agent unavailable)',
            dose: '50 units/kg',
            notes: 'Less effective than idarucizumab. May provide hemostatic support'
          }
        ],
        supportiveMeasures: [
          'Hold dabigatran',
          'Activated charcoal if ingestion <2 hours',
          'Maintain adequate urine output',
          'Transfuse blood products as needed'
        ],
        monitoringParameters: [
          'Thrombin time (TT) - most sensitive',
          'aPTT - elevated but not linear',
          'Ecarin clotting time if available',
          'Clinical bleeding assessment'
        ],
        timeToEffect: 'Idarucizumab: immediate (within minutes)',
        specialConsiderations: [
          'Renal impairment prolongs half-life significantly',
          'CrCl <30: half-life 18-27 hours vs 12-17 hours normal',
          'Drug levels peak 1-2 hours post-dose',
          'Consider timing of last dose'
        ]
      };
      
    case 'rivaroxaban':
    case 'apixaban':
    case 'edoxaban': {
      const xaName = anticoagulant === 'rivaroxaban' ? 'Rivaroxaban (Xarelto)' :
                     anticoagulant === 'apixaban' ? 'Apixaban (Eliquis)' : 'Edoxaban (Savaysa)';
      if (isSurgery) {
        // Factor Xa inhibitors: hold time based on renal function
        // Apixaban: 24-48h (less renal dependent)
        // Rivaroxaban/Edoxaban: 24-48h normal, longer if renal impairment
        const xaHoldTime = anticoagulant === 'apixaban' 
          ? getHoldTime('24-48 hours', '36-48 hours', '48 hours')
          : getHoldTime('24-48 hours', '48-72 hours', '72+ hours');
        return {
          anticoagulant: xaName,
          indication: 'surgery',
          reversalAgents: isUrgentSurgery ? [
            {
              primary: 'Andexanet alfa (Andexxa) - if available',
              dose: 'Low dose: 400 mg bolus + 480 mg infusion\nHigh dose: 800 mg bolus + 960 mg infusion',
              notes: 'For urgent surgery when drug cannot be held adequately'
            },
            {
              primary: '4-Factor PCC (if andexanet unavailable)',
              dose: '50 units/kg',
              notes: 'Provides hemostatic support but not true reversal'
            }
          ] : [
            {
              primary: `Hold ${anticoagulant}`,
              dose: `Stop ${xaHoldTime} before procedure`,
              notes: 'Hold time depends on renal function and bleeding risk'
            }
          ],
          supportiveMeasures: [
            'No bridging anticoagulation needed (short half-life)',
            'Ensure adequate hydration',
            'Avoid NSAIDs perioperatively'
          ],
          monitoringParameters: [
            'Renal function (CrCl)',
            'Anti-Xa level if concerned about residual effect',
            'Post-op bleeding assessment'
          ],
          timeToEffect: isUrgentSurgery ? 'Andexanet: immediate' : `Drug clearance: ${xaHoldTime}`,
          specialConsiderations: [
            'NO BRIDGING NEEDED - rapid onset/offset',
            anticoagulant === 'apixaban' ? 'Apixaban: least affected by renal function (27% renal elimination)' : '',
            anticoagulant === 'rivaroxaban' ? 'Rivaroxaban: 33% renal elimination' : '',
            anticoagulant === 'edoxaban' ? 'Edoxaban: 50% renal elimination' : '',
            'High bleeding risk procedures: add 24h to hold time'
          ].filter(s => s !== ''),
          preProceduralGuidance: {
            holdTime: xaHoldTime,
            lastDoseToSurgery: `Last dose ${xaHoldTime} before surgery`,
            bridgingRequired: false,
            preOpLabs: ['CrCl/eGFR', 'Anti-Xa level (optional)', 'CBC'],
            resumptionGuidance: 'Resume 24-72 hours post-op depending on bleeding risk. No bridging needed.'
          }
        };
      }
      return {
        anticoagulant: xaName,
        indication: 'bleeding',
        reversalAgents: [
          {
            primary: 'Andexanet alfa (Andexxa)',
            dose: anticoagulant === 'apixaban' 
              ? 'Low dose (≤5 mg or >8h since dose): 400 mg bolus + 480 mg infusion\nHigh dose (>5 mg and ≤8h): 800 mg bolus + 960 mg infusion'
              : 'Low dose (≤10 mg rivaroxaban or >8h): 400 mg bolus + 480 mg infusion\nHigh dose (>10 mg and ≤8h): 800 mg bolus + 960 mg infusion',
            notes: 'Specific reversal agent for factor Xa inhibitors. Bolus over 15-30 min, infusion over 2 hours'
          },
          {
            primary: '4-Factor PCC (Kcentra)',
            dose: '50 units/kg (max 5000 units)',
            notes: 'Use if andexanet unavailable. Provides hemostatic support but not true reversal'
          },
          {
            primary: 'Activated PCC (FEIBA)',
            dose: '50 units/kg (max 5000 units)',
            notes: 'Alternative to 4F-PCC. Higher thrombotic risk'
          }
        ],
        supportiveMeasures: [
          `Hold ${anticoagulant}`,
          'Activated charcoal if ingestion <2-4 hours',
          'Transfuse blood products as needed',
          'Consider tranexamic acid for mucosal bleeding'
        ],
        monitoringParameters: [
          'Anti-Xa activity (drug-specific calibration)',
          'PT may be prolonged (especially rivaroxaban)',
          'Clinical bleeding assessment',
          'Note: Standard coagulation tests unreliable'
        ],
        timeToEffect: 'Andexanet: within minutes; PCC: 15-30 minutes',
        specialConsiderations: [
          'Andexanet has black box warning for thrombosis',
          anticoagulant === 'rivaroxaban' ? 'Rivaroxaban: take with food for absorption' : '',
          anticoagulant === 'apixaban' ? 'Apixaban: least renal elimination (27%)' : '',
          'Half-life: 5-12 hours depending on agent and renal function',
          'Hemodialysis NOT effective (high protein binding)'
        ].filter(s => s !== '')
      };
    }
      
    case 'heparin':
      if (isSurgery) {
        return {
          anticoagulant: 'Unfractionated Heparin (UFH)',
          indication: 'surgery',
          reversalAgents: isUrgentSurgery ? [
            {
              primary: 'Protamine sulfate (if needed)',
              dose: '1 mg per 100 units heparin given recently',
              notes: 'Usually not needed - just stop infusion and wait 4-6 hours'
            }
          ] : [
            {
              primary: 'Stop heparin infusion',
              dose: '4-6 hours before procedure',
              notes: 'Short half-life (60-90 min) allows natural clearance'
            }
          ],
          supportiveMeasures: [
            'Stop infusion 4-6 hours before surgery',
            'No bridging needed - very short half-life',
            'Can restart 12-24 hours post-op'
          ],
          monitoringParameters: [
            'aPTT before surgery (should be normal)',
            'Post-op bleeding assessment'
          ],
          timeToEffect: 'Drug clearance: 4-6 hours after stopping',
          specialConsiderations: [
            'Very short half-life - usually just stop and wait',
            'Protamine rarely needed for elective surgery',
            'Can restart quickly post-op if needed'
          ],
          preProceduralGuidance: {
            holdTime: '4-6 hours before procedure',
            lastDoseToSurgery: 'Stop infusion 4-6 hours before surgery',
            bridgingRequired: false,
            preOpLabs: ['aPTT (should normalize)', 'CBC'],
            resumptionGuidance: 'Resume 12-24 hours post-op if adequate hemostasis'
          }
        };
      }
      return {
        anticoagulant: 'Unfractionated Heparin (UFH)',
        indication: 'bleeding',
        reversalAgents: [
          {
            primary: 'Protamine sulfate',
            dose: `1 mg protamine per 100 units heparin given in last 2-3 hours\nMax single dose: 50 mg\nEstimated dose: ${Math.min(50, Math.round(weightKg * 0.5))} mg for recent full anticoagulation`,
            notes: 'Give slowly IV over 10 min. May repeat if aPTT remains elevated'
          }
        ],
        supportiveMeasures: [
          'Stop heparin infusion immediately',
          'Heparin half-life: 60-90 minutes',
          'Transfuse blood products as needed'
        ],
        monitoringParameters: [
          'aPTT every 15-30 min until normalized',
          'Watch for protamine reactions',
          'Clinical bleeding assessment'
        ],
        timeToEffect: 'Protamine: 5 minutes',
        specialConsiderations: [
          'Protamine can cause hypotension, bradycardia, anaphylaxis',
          'Higher risk of reaction in fish allergy, prior protamine exposure, vasectomy',
          'Protamine itself has mild anticoagulant effect at high doses',
          'Consider waiting if heparin stopped >2-3 hours ago'
        ]
      };
      
    case 'enoxaparin':
    case 'lmwh':
      if (isSurgery) {
        const lmwhHoldTime = getHoldTime('12 hours (prophylactic) / 24 hours (therapeutic)', '24 hours (prophylactic) / 36-48 hours (therapeutic)', '36-48 hours (prophylactic) / 48-72 hours (therapeutic)');
        return {
          anticoagulant: 'Low Molecular Weight Heparin (LMWH/Enoxaparin)',
          indication: 'surgery',
          reversalAgents: isUrgentSurgery ? [
            {
              primary: 'Protamine sulfate',
              dose: '1 mg per 1 mg enoxaparin (if <8h since dose)\n0.5 mg per 1 mg (if 8-12h since dose)',
              notes: 'Only ~60% reversal - may need to delay surgery if possible'
            }
          ] : [
            {
              primary: 'Hold LMWH',
              dose: `Stop ${lmwhHoldTime} before procedure`,
              notes: 'Prophylactic dosing: 12h hold; Therapeutic dosing: 24h hold (normal renal function)'
            }
          ],
          supportiveMeasures: [
            'Prophylactic dose: hold 12 hours before',
            'Therapeutic dose: hold 24 hours before',
            'Adjust for renal function'
          ],
          monitoringParameters: [
            'Renal function (CrCl)',
            'Anti-Xa level if concerned (optional)',
            'Post-op bleeding assessment'
          ],
          timeToEffect: isUrgentSurgery ? 'Protamine: partial reversal in 5 min' : `Drug clearance: ${lmwhHoldTime}`,
          specialConsiderations: [
            'PROPHYLACTIC (e.g., 40mg daily): Hold 12 hours',
            'THERAPEUTIC (e.g., 1mg/kg BID): Hold 24 hours',
            'Renal impairment: extend hold time',
            'No complete reversal agent available'
          ],
          preProceduralGuidance: {
            holdTime: lmwhHoldTime,
            lastDoseToSurgery: `Last dose ${lmwhHoldTime} before surgery`,
            bridgingRequired: false,
            preOpLabs: ['CrCl/eGFR', 'Anti-Xa level (optional)', 'CBC'],
            resumptionGuidance: 'Resume prophylactic dose 12-24h post-op; therapeutic dose 48-72h post-op or when hemostasis assured'
          }
        };
      }
      return {
        anticoagulant: 'Low Molecular Weight Heparin (LMWH/Enoxaparin)',
        indication: 'bleeding',
        reversalAgents: [
          {
            primary: 'Protamine sulfate',
            dose: 'If LMWH given <8 hours ago: 1 mg protamine per 1 mg enoxaparin (or 100 anti-Xa units)\nIf 8-12 hours ago: 0.5 mg per 1 mg enoxaparin\nMax: 50 mg',
            notes: 'Only ~60% reversal of anti-Xa activity. May need second dose of 0.5 mg/1 mg enoxaparin'
          }
        ],
        supportiveMeasures: [
          'Hold LMWH',
          'LMWH half-life: 4-6 hours (longer in renal impairment)',
          'Transfuse blood products as needed',
          'Consider tranexamic acid'
        ],
        monitoringParameters: [
          'Anti-Xa activity (if available)',
          'aPTT less reliable for LMWH',
          'Clinical bleeding assessment'
        ],
        timeToEffect: 'Protamine: 5 minutes (partial reversal)',
        specialConsiderations: [
          'Protamine only partially reverses LMWH (~60%)',
          'Renal impairment significantly prolongs half-life',
          'Consider dialysis in severe renal failure',
          'Same protamine precautions as for UFH'
        ]
      };
      
    default:
      return {
        anticoagulant: 'Unknown Anticoagulant',
        indication: isSurgery ? 'surgery' : 'bleeding',
        reversalAgents: [
          {
            primary: 'Identify specific anticoagulant',
            dose: 'N/A',
            notes: 'Reversal strategy depends on specific agent'
          }
        ],
        supportiveMeasures: [
          'Hold anticoagulant',
          'Supportive care',
          'Transfuse as needed'
        ],
        monitoringParameters: [
          'PT/INR, aPTT, TT',
          'Anti-Xa activity',
          'Clinical assessment'
        ],
        timeToEffect: 'Varies by agent',
        specialConsiderations: [
          'Obtain detailed medication history',
          'Consider pharmacy/toxicology consultation'
        ]
      };
  }
}


// ============================================================================
// MISCELLANEOUS CALCULATORS
// ============================================================================

/**
 * Steroid Conversion Calculator
 * Converts between equivalent doses of different corticosteroids
 */
export interface SteroidConversionResult {
  fromSteroid: string;
  fromDose: number;
  equivalentDoses: {
    steroid: string;
    dose: number;
    unit: string;
    relativeGlucocorticoidPotency: number;
    relativeMineralocorticoidPotency: number;
    biologicalHalfLife: string;
  }[];
}

export function steroidConversion(
  fromSteroid: string,
  dose: number
): SteroidConversionResult {
  // Steroid equivalency data (relative to hydrocortisone 20mg = 1)
  // Reference: Schimmer BP, Funder JW. ACTH, Adrenal Steroids, and Pharmacology of the Adrenal Cortex.
  const steroids: Record<string, {
    equivalentDose: number; // mg equivalent to hydrocortisone 20mg
    glucocorticoidPotency: number;
    mineralocorticoidPotency: number;
    halfLife: string;
    displayName: string;
  }> = {
    hydrocortisone: {
      equivalentDose: 20,
      glucocorticoidPotency: 1,
      mineralocorticoidPotency: 1,
      halfLife: '8-12 hours',
      displayName: 'Hydrocortisone (Cortef)'
    },
    cortisone: {
      equivalentDose: 25,
      glucocorticoidPotency: 0.8,
      mineralocorticoidPotency: 0.8,
      halfLife: '8-12 hours',
      displayName: 'Cortisone'
    },
    prednisone: {
      equivalentDose: 5,
      glucocorticoidPotency: 4,
      mineralocorticoidPotency: 0.8,
      halfLife: '12-36 hours',
      displayName: 'Prednisone'
    },
    prednisolone: {
      equivalentDose: 5,
      glucocorticoidPotency: 4,
      mineralocorticoidPotency: 0.8,
      halfLife: '12-36 hours',
      displayName: 'Prednisolone'
    },
    methylprednisolone: {
      equivalentDose: 4,
      glucocorticoidPotency: 5,
      mineralocorticoidPotency: 0.5,
      halfLife: '12-36 hours',
      displayName: 'Methylprednisolone (Medrol, Solu-Medrol)'
    },
    triamcinolone: {
      equivalentDose: 4,
      glucocorticoidPotency: 5,
      mineralocorticoidPotency: 0,
      halfLife: '12-36 hours',
      displayName: 'Triamcinolone (Kenalog)'
    },
    dexamethasone: {
      equivalentDose: 0.75,
      glucocorticoidPotency: 25,
      mineralocorticoidPotency: 0,
      halfLife: '36-54 hours',
      displayName: 'Dexamethasone (Decadron)'
    },
    betamethasone: {
      equivalentDose: 0.6,
      glucocorticoidPotency: 25,
      mineralocorticoidPotency: 0,
      halfLife: '36-54 hours',
      displayName: 'Betamethasone (Celestone)'
    },
    fludrocortisone: {
      equivalentDose: 0, // Not used for glucocorticoid replacement
      glucocorticoidPotency: 10,
      mineralocorticoidPotency: 125,
      halfLife: '18-36 hours',
      displayName: 'Fludrocortisone (Florinef)'
    }
  };

  const fromData = steroids[fromSteroid];
  if (!fromData || fromData.equivalentDose === 0) {
    return {
      fromSteroid: fromSteroid,
      fromDose: dose,
      equivalentDoses: []
    };
  }

  // Calculate hydrocortisone equivalent first
  const hydrocortisoneEquivalent = (dose / fromData.equivalentDose) * 20;

  // Calculate equivalent doses for all steroids
  const equivalentDoses = Object.entries(steroids)
    .filter(([key, data]) => data.equivalentDose > 0) // Exclude fludrocortisone
    .map(([key, data]) => ({
      steroid: data.displayName,
      dose: Math.round((hydrocortisoneEquivalent / 20) * data.equivalentDose * 100) / 100,
      unit: 'mg',
      relativeGlucocorticoidPotency: data.glucocorticoidPotency,
      relativeMineralocorticoidPotency: data.mineralocorticoidPotency,
      biologicalHalfLife: data.halfLife
    }));

  return {
    fromSteroid: fromData.displayName,
    fromDose: dose,
    equivalentDoses
  };
}

/**
 * Plasma Exchange (Plasmapheresis) Dosing Calculator
 * Calculates plasma volume and exchange parameters
 */
export interface PlasmaExchangeResult {
  totalPlasmaVolume: number; // mL
  plasmaVolumePerKg: number; // mL/kg
  exchangeVolume: number; // mL for one plasma volume exchange
  estimatedDuration: number; // minutes
  replacementFluid: {
    type: string;
    volume: number;
    notes: string;
  }[];
  accessRecommendation: string;
  anticoagulationRecommendation: string;
  expectedIgGRemoval: number; // percentage per session
  sessionsForTarget: {
    target50: number;
    target75: number;
    target90: number;
  };
}

export function plasmaExchangeDosing(
  weight: number, // kg
  height: number, // cm
  hematocrit: number, // %
  sex: 'M' | 'F',
  exchangeVolumes: number = 1, // Number of plasma volumes to exchange (typically 1-1.5)
  indication?: string
): PlasmaExchangeResult {
  // Calculate Total Blood Volume using Nadler's formula
  let totalBloodVolume: number;
  if (sex === 'M') {
    totalBloodVolume = (0.3669 * Math.pow(height / 100, 3)) + (0.03219 * weight) + 0.6041;
  } else {
    totalBloodVolume = (0.3561 * Math.pow(height / 100, 3)) + (0.03308 * weight) + 0.1833;
  }
  totalBloodVolume = totalBloodVolume * 1000; // Convert to mL

  // Calculate Plasma Volume
  // PV = TBV × (1 - Hct)
  const plasmaVolume = totalBloodVolume * (1 - hematocrit / 100);
  const plasmaVolumePerKg = plasmaVolume / weight;

  // Exchange volume for specified number of plasma volumes
  const exchangeVolume = plasmaVolume * exchangeVolumes;

  // Estimated duration (typical flow rate 30-40 mL/min for plasma)
  const flowRate = 35; // mL/min average
  const estimatedDuration = Math.round(exchangeVolume / flowRate);

  // Replacement fluid recommendations
  const replacementFluid = [
    {
      type: '5% Albumin',
      volume: Math.round(exchangeVolume),
      notes: 'Standard replacement for most indications. Safe, no coagulation factors.'
    },
    {
      type: 'Fresh Frozen Plasma (FFP)',
      volume: Math.round(exchangeVolume),
      notes: 'Use for TTP, coagulopathy, or when coagulation factors needed. Risk of allergic reactions, TRALI.'
    },
    {
      type: 'Albumin/FFP Mix (2:1)',
      volume: Math.round(exchangeVolume),
      notes: 'Common for TTP: 2/3 albumin, 1/3 FFP. Balances cost and coagulation support.'
    }
  ];

  // Access recommendations based on indication
  let accessRecommendation = 'Central venous catheter (dialysis catheter) preferred for adequate flow rates.';
  if (weight < 50) {
    accessRecommendation = 'Smaller bore catheter may be needed. Consider femoral access for better flow.';
  }

  // Anticoagulation
  let anticoagulationRecommendation = 'Regional citrate anticoagulation preferred (ACD-A). Heparin alternative if citrate contraindicated.';
  if (indication === 'ttp') {
    anticoagulationRecommendation = 'Citrate strongly preferred for TTP. Avoid heparin due to HIT risk.';
  }

  // Expected IgG removal per session (approximately 60-70% per 1 PV exchange)
  const expectedIgGRemoval = Math.round((1 - Math.exp(-exchangeVolumes)) * 100);

  // Sessions needed for cumulative removal targets
  // Using exponential decay model: remaining = initial × e^(-n×efficiency)
  const efficiencyPerSession = 0.63; // ~63% removal per 1 PV exchange
  const sessionsForTarget = {
    target50: Math.ceil(Math.log(0.5) / Math.log(1 - efficiencyPerSession)),
    target75: Math.ceil(Math.log(0.25) / Math.log(1 - efficiencyPerSession)),
    target90: Math.ceil(Math.log(0.1) / Math.log(1 - efficiencyPerSession))
  };

  return {
    totalPlasmaVolume: Math.round(plasmaVolume),
    plasmaVolumePerKg: Math.round(plasmaVolumePerKg * 10) / 10,
    exchangeVolume: Math.round(exchangeVolume),
    estimatedDuration,
    replacementFluid,
    accessRecommendation,
    anticoagulationRecommendation,
    expectedIgGRemoval,
    sessionsForTarget
  };
}
