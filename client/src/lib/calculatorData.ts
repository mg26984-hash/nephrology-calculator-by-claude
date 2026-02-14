/**
 * Calculator Data Definitions
 * All 52 calculators with metadata, inputs, and interpretation guides
 */
export interface CalculatorInput {
  id: string;
  label: string;
  type: "number" | "select" | "checkbox" | "radio" | "toggle" | "score";
  unit?: string;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unitToggle?: {
    units: string[];
    conversionFactor: number;
  };
  default?: number | string;
}
export interface ReferenceRange {
  label: string;
  min?: number;
  max?: number;
  unit: string;
  ageRange?: string;
  sex?: "M" | "F" | "all";
  note?: string;
}
export interface Calculator {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs: CalculatorInput[];
  resultLabel: string;
  resultUnit?: string;
  interpretation: (value: number, inputs?: Record<string, unknown>) => string;
  referenceRanges?: ReferenceRange[];
  clinicalPearls: string[];
  references: string[];
}
export const calculators: Calculator[] = [
  // ============================================================================
  // KIDNEY FUNCTION & CKD RISK
  // ============================================================================
  {
    id: "ckd-epi-creatinine",
    name: "CKD-EPI Creatinine (2021)",
    description: "Estimated GFR using serum creatinine (most commonly used)",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "1.0", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "45", required: true, min: 18, max: 120 },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "race", label: "Race", type: "select", options: [{ value: "Black", label: "African American" }, { value: "Other", label: "Other" }], required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL (conventional)" }, { value: "μmol/L", label: "μmol/L (SI)" }], required: true },
    ],
    resultLabel: "eGFR",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value) => {
      if (value >= 90) return "Normal kidney function (CKD Stage 1)";
      if (value >= 60) return "Mild decrease in kidney function (CKD Stage 2)";
      if (value >= 45) return "Mild to moderate decrease (CKD Stage 3a)";
      if (value >= 30) return "Moderate to severe decrease (CKD Stage 3b)";
      if (value >= 15) return "Severe decrease in kidney function (CKD Stage 4)";
      return "Kidney failure (CKD Stage 5) - Consider dialysis/transplant planning";
    },
    referenceRanges: [
      { label: "Normal (Stage 1)", min: 90, unit: "mL/min/1.73m²", note: "Normal or high GFR" },
      { label: "Mild decrease (Stage 2)", min: 60, max: 89, unit: "mL/min/1.73m²" },
      { label: "Mild-moderate (Stage 3a)", min: 45, max: 59, unit: "mL/min/1.73m²" },
      { label: "Moderate-severe (Stage 3b)", min: 30, max: 44, unit: "mL/min/1.73m²" },
      { label: "Severe (Stage 4)", min: 15, max: 29, unit: "mL/min/1.73m²" },
      { label: "Kidney failure (Stage 5)", max: 14, unit: "mL/min/1.73m²" },
    ],
    clinicalPearls: [
      "Most accurate creatinine-based eGFR equation",
      "Accounts for sex, race, and age",
      "Use for CKD staging and medication dosing",
      "Compare with cystatin C if creatinine unreliable",
    ],
    references: ["Inker LA et al. N Engl J Med. 2021;385(19):1737-1749"],
  },
  {
    id: "cockcroft-gault",
    name: "Cockcroft-Gault Creatinine Clearance",
    description: "Estimates creatinine clearance; still used for drug dosing",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "1.0", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "45", required: true },
      { id: "weight", label: "Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "μmol/L", label: "μmol/L" }], required: true },
    ],
    resultLabel: "Creatinine Clearance",
    resultUnit: "mL/min",
    interpretation: (value) => {
      if (value >= 90) return "Normal kidney function";
      if (value >= 60) return "Mild reduction";
      if (value >= 30) return "Moderate reduction";
      return "Severe reduction - adjust drug dosing";
    },
    referenceRanges: [
      { label: "Normal", min: 90, unit: "mL/min" },
      { label: "Mild reduction", min: 60, max: 89, unit: "mL/min" },
      { label: "Moderate reduction", min: 30, max: 59, unit: "mL/min" },
      { label: "Severe reduction", max: 29, unit: "mL/min" },
    ],
    clinicalPearls: [
      "Overestimates eGFR compared to CKD-EPI",
      "Still used for aminoglycoside and vancomycin dosing",
      "Less accurate in elderly and obese patients",
    ],
    references: ["Cockcroft DW, Gault MH. Nephron. 1976;16(1):31-41"],
  },
  {
    id: "schwartz-pediatric",
    name: "Schwartz Pediatric eGFR",
    description: "Estimates GFR in children and adolescents",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "0.5", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm", placeholder: "140", required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "μmol/L", label: "μmol/L" }], required: true },
    ],
    resultLabel: "eGFR",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value) => {
      if (value >= 90) return "Normal kidney function";
      if (value >= 60) return "Mild decrease";
      if (value >= 30) return "Moderate decrease";
      return "Severe decrease - nephrologist referral needed";
    },
    clinicalPearls: [
      "Use in children and adolescents",
      "Height-dependent formula",
      "Updated versions available for different age groups",
    ],
    references: ["Schwartz GJ et al. Kidney Int. 2009;76(2):159-166"],
  },
  {
    id: "kinetic-egfr",
    name: "Kinetic eGFR",
    description: "Calculates GFR from urea kinetics during dialysis",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "preBUN", label: "Pre-Dialysis BUN / Urea", type: "number", unit: "mg/dL or mmol/L", placeholder: "60", required: true },
      { id: "postBUN", label: "Post-Dialysis BUN / Urea", type: "number", unit: "mg/dL or mmol/L", placeholder: "20", required: true },
      { id: "preCreatinine", label: "Pre-Dialysis Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "8", required: true },
      { id: "postCreatinine", label: "Post-Dialysis Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "6", required: true },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sessionTime", label: "Session Duration", type: "number", unit: "hours", placeholder: "4", required: true },
      { id: "bunUnit", label: "BUN / Urea Unit", type: "select", options: [{ value: "BUN (mg/dL)", label: "BUN (mg/dL)" }, { value: "BUN (mmol/L)", label: "BUN (mmol/L)" }, { value: "Urea (mg/dL)", label: "Urea (mg/dL)" }, { value: "Urea (mmol/L)", label: "Urea (mmol/L)" }], required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "μmol/L", label: "μmol/L" }], required: true },
    ],
    resultLabel: "Residual eGFR",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value) => {
      if (value >= 2) return "Significant residual kidney function - preserve it!";
      if (value > 0) return "Minimal residual function";
      return "No residual kidney function";
    },
    clinicalPearls: [
      "Assesses residual kidney function in dialysis patients",
      "Preservation of RKF improves survival",
      "Protect RKF: avoid NSAIDs, maintain euvolemia",
    ],
    references: ["KDIGO 2024 CKD Guideline"],
  },
  {
    id: "ckd-epi-cystatin-c",
    name: "CKD-EPI Creatinine-Cystatin C Combined",
    description: "More accurate eGFR using both creatinine and cystatin C",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "1.0", required: true },
      { id: "cystatinC", label: "Cystatin C", type: "number", unit: "mg/L or μmol/L", placeholder: "0.8", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "45", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
    ],
    resultLabel: "eGFR",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value) => {
      if (value >= 90) return "Normal kidney function";
      if (value >= 60) return "Mild decrease";
      if (value >= 30) return "Moderate to severe decrease";
      return "Severe decrease - kidney failure";
    },
    clinicalPearls: [
      "Less biased than creatinine-only equation",
      "Useful in extremes of muscle mass (sarcopenia, athletes)",
      "Recommended when creatinine-based eGFR doesn't fit clinical picture",
    ],
    references: ["Inker LA et al. N Engl J Med. 2021;385(19):1737-1749"],
  },
  {
    id: "egfr-slope",
    name: "Annual eGFR Decline (Slope)",
    description: "Calculates rate of kidney function decline over time",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "eGFRBaseline", label: "Baseline eGFR", type: "number", unit: "mL/min/1.73m²", placeholder: "60", required: true },
      { id: "eGFRFinal", label: "Final eGFR", type: "number", unit: "mL/min/1.73m²", placeholder: "45", required: true },
      { id: "timeYears", label: "Time Period", type: "number", unit: "years", placeholder: "2", required: true, min: 0.5, max: 20 },
    ],
    resultLabel: "eGFR Decline Rate",
    resultUnit: "mL/min/1.73m²/year",
    interpretation: (value) => {
      if (value > -1) return "Normal aging rate";
      if (value > -3) return "Mild CKD progression";
      if (value > -5) return "Moderate CKD progression";
      return "Rapid progression - investigate for acute process or adjust treatment";
    },
    clinicalPearls: [
      "Normal aging: -0.5 to -1 mL/min/1.73m²/year",
      ">20% decline in 1 year suggests acute process",
      ">30% acute dip acceptable after RAAS inhibitor initiation",
    ],
    references: ["KDIGO 2024 CKD Guideline, Practice Point 2.1.3"],
  },
  {
    id: "kfre",
    name: "Kidney Failure Risk Equation (KFRE)",
    description: "Predicts 2 and 5-year probability of kidney failure",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "55", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "eGFR", label: "eGFR", type: "number", unit: "mL/min/1.73m²", placeholder: "35", required: true },
      { id: "acr", label: "Albumin-Creatinine Ratio", type: "number", unit: "mg/g", placeholder: "150", required: true, unitToggle: { units: ["mg/g", "mg/mmol", "mg/mg"], conversionFactor: 1 } },
      { id: "years", label: "Prediction Timeframe", type: "select", options: [{ value: "2", label: "2-year risk" }, { value: "5", label: "5-year risk" }], required: true },
    ],
    resultLabel: "Kidney Failure Risk",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 3) return "Low risk - routine follow-up";
      if (value < 5) return "Borderline - consider nephrology referral";
      if (value < 20) return "Moderate risk - nephrology referral recommended";
      if (value < 40) return "High risk - intensive management";
      return "Very high risk - consider early transplant/dialysis planning";
    },
    clinicalPearls: [
      "Most validated CKD progression risk tool",
      "KDIGO 2024 recommends referral when 5-year risk ≥3-5%",
      "Risk >40% at 2 years = consider early transplant evaluation",
    ],
    references: ["Tangri N et al. JAMA. 2016;315(2):164-174"],
  },
  // ============================================================================
  // ACUTE KIDNEY INJURY (AKI) WORKUP
  // ============================================================================
  {
    id: "fena",
    name: "Fractional Excretion of Sodium (FENa)",
    description: "Differentiates prerenal from intrinsic AKI",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "urineNa", label: "Urine Sodium", type: "number", unit: "mEq/L", placeholder: "20", required: true },
      { id: "plasmaCr", label: "Plasma Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "2.0", required: true },
      { id: "plasmaNa", label: "Plasma Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "urineCr", label: "Urine Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "80", required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "μmol/L", label: "μmol/L" }], required: true },
    ],
    resultLabel: "FENa",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 1) return "Prerenal azotemia (volume depletion, heart failure, cirrhosis)";
      if (value <= 2) return "Indeterminate - consider clinical context";
      return "Intrinsic AKI (acute tubular necrosis most likely)";
    },
    referenceRanges: [
      { label: "Prerenal azotemia", max: 1, unit: "%", note: "Volume depletion, heart failure, cirrhosis" },
      { label: "Intrinsic AKI", min: 1, unit: "%", note: "ATN, interstitial nephritis" },
    ],
    clinicalPearls: [
      "FENa <1% suggests prerenal azotemia",
      "Unreliable in diuretic use, CKD, contrast nephropathy, pigment nephropathy",
      "Must interpret with clinical context (volume status, urine sediment)",
    ],
    references: ["Steiner RW. Am J Med. 1984;77(4):699-702"],
  },
  {
    id: "feurea",
    name: "Fractional Excretion of Urea (FEUrea)",
    description: "Alternative to FENa, more reliable with diuretic use",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "urineUrea", label: "Urine Urea Nitrogen", type: "number", unit: "mg/dL", placeholder: "200", required: true },
      { id: "plasmaCr", label: "Plasma Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "2.0", required: true },
      { id: "plasmaUrea", label: "Plasma Urea Nitrogen", type: "number", unit: "mg/dL", placeholder: "40", required: true },
      { id: "urineCr", label: "Urine Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "80", required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "μmol/L", label: "μmol/L" }], required: true },
    ],
    resultLabel: "FEUrea",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 35) return "Prerenal azotemia";
      if (value <= 50) return "Indeterminate";
      return "Intrinsic AKI (acute tubular necrosis)";
    },
    clinicalPearls: [
      "Superior to FENa in patients on diuretics",
      "Urea reabsorption unaffected by diuretics",
      "Limited added diagnostic value over FENa per recent meta-analysis",
    ],
    references: ["Carvounis CP et al. Kidney Int. 2002;62(6):2223-2229"],
  },
  {
    id: "anion-gap",
    name: "Serum Anion Gap",
    description: "First step in metabolic acidosis workup",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "sodium", label: "Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "chloride", label: "Chloride", type: "number", unit: "mEq/L", placeholder: "105", required: true },
      { id: "bicarbonate", label: "Bicarbonate", type: "number", unit: "mEq/L", placeholder: "20", required: true },
    ],
    resultLabel: "Anion Gap",
    resultUnit: "mEq/L",
    interpretation: (value) => {
      if (value <= 12) return "Normal anion gap (NAGMA) - think HARDUPS";
      if (value <= 16) return "Borderline high";
      return "High anion gap (HAGMA) - think GOLDMARK";
    },
    referenceRanges: [
      { label: "Normal", min: 8, max: 12, unit: "mEq/L", note: "Varies by lab" },
      { label: "Borderline high", min: 13, max: 16, unit: "mEq/L" },
      { label: "High (HAGMA)", min: 17, unit: "mEq/L" },
    ],
    clinicalPearls: [
      "Normal AG = 8-12 mEq/L (varies by lab)",
      "Correct for hypoalbuminemia: Expected AG = 2.5 × Albumin (g/dL)",
      "Essential in DKA, lactic acidosis, toxic ingestions",
    ],
    references: ["Kraut JA, Madias NE. Clin J Am Soc Nephrol. 2007;2(1):162-174"],
  },
  {
    id: "delta-gap",
    name: "Delta Gap (Delta-Delta Ratio)",
    description: "Identifies mixed acid-base disorders",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "measuredAG", label: "Measured Anion Gap", type: "number", unit: "mEq/L", placeholder: "20", required: true },
      { id: "measuredHCO3", label: "Measured HCO3", type: "number", unit: "mEq/L", placeholder: "15", required: true },
      { id: "normalAG", label: "Normal AG", type: "number", unit: "mEq/L", placeholder: "12", required: true },
      { id: "normalHCO3", label: "Normal HCO3", type: "number", unit: "mEq/L", placeholder: "24", required: true },
    ],
    resultLabel: "Delta-Delta Ratio",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value >= 1 && value <= 2) return "Pure high anion gap metabolic acidosis";
      if (value < 1) return "Combined HAGMA + normal anion gap metabolic acidosis";
      return "Combined HAGMA + metabolic alkalosis";
    },
    clinicalPearls: [
      "Identifies mixed acid-base disorders",
      "Essential in DKA (concomitant vomiting causes alkalosis)",
      "Guides treatment strategy",
    ],
    references: ["Rastegar A. J Am Soc Nephrol. 2007;18(9):2429-2431"],
  },
  {
    id: "bun-creatinine-ratio",
    name: "BUN/Creatinine Ratio",
    description: "Differentiates prerenal azotemia from intrinsic renal disease; supports AKI workup",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "bunValue", label: "BUN / Urea", type: "number", unit: "mg/dL", placeholder: "20", required: true },
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true, unitToggle: { units: ["mg/dL", "μmol/L"], conversionFactor: 88.4 } },
    ],
    resultLabel: "BUN/Creatinine Ratio",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value < 10) return "Low - suggests intrinsic renal disease or decreased BUN production";
      if (value <= 20) return "Normal - proportional elevation or normal kidney function";
      if (value <= 30) return "Elevated - suggests prerenal azotemia";
      return "High - strongly suggests prerenal azotemia with significant volume depletion";
    },
    referenceRanges: [
      { label: "Low (<10)", max: 10, unit: "ratio", note: "Intrinsic renal disease, liver disease, malnutrition" },
      { label: "Normal (10-20)", min: 10, max: 20, unit: "ratio", note: "Proportional elevation or normal" },
      { label: "Elevated (20-30)", min: 20, max: 30, unit: "ratio", note: "Prerenal azotemia" },
      { label: "High (>30)", min: 30, unit: "ratio", note: "Significant prerenal azotemia" },
    ],
    clinicalPearls: [
      "Normal ratio: 10-20 (BUN in mg/dL, Creatinine in mg/dL)",
      "Ratio >20 suggests prerenal azotemia (volume depletion, heart failure, cirrhosis)",
      "Ratio <10 suggests intrinsic renal disease, liver disease, or malnutrition",
      "Use with clinical context: volume status, medications (NSAIDs, ACE-I), urine output",
      "Auto-converts urea to BUN: BUN = urea / 2.14 (for mg/dL values)",
    ],
    references: ["Levey AS et al. Kidney Int. 2005;67(6):2089-2100"],
  },
  {
    id: "osmolal-gap",
    name: "Serum Osmolal Gap",
    description: "Screens for toxic alcohol ingestion",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "measuredOsmolality", label: "Measured Osmolality", type: "number", unit: "mOsm/kg", placeholder: "320", required: true },
      { id: "sodium", label: "Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "glucose", label: "Glucose", type: "number", unit: "mg/dL or mmol/L", placeholder: "100", required: true },
      { id: "bun", label: "BUN / Urea", type: "number", unit: "mg/dL or mmol/L", placeholder: "20", required: true },
      { id: "bunUnit", label: "BUN / Urea Unit", type: "select", options: [{ value: "BUN (mg/dL)", label: "BUN (mg/dL)" }, { value: "BUN (mmol/L)", label: "BUN (mmol/L)" }, { value: "Urea (mg/dL)", label: "Urea (mg/dL)" }, { value: "Urea (mmol/L)", label: "Urea (mmol/L)" }], required: true },
      { id: "ethanol", label: "Ethanol (if known)", type: "number", unit: "mg/dL", placeholder: "0" },
    ],
    resultLabel: "Osmolal Gap",
    resultUnit: "mOsm/kg",
    interpretation: (value) => {
      if (value <= 10) return "Normal - no unmeasured osmotically active substances";
      if (value <= 20) return "Borderline - consider toxic alcohol ingestion";
      return "Elevated - suggests methanol, ethylene glycol, isopropanol, or other toxins";
    },
    clinicalPearls: [
      "Critical in suspected toxic alcohol ingestion with HAGMA",
      "Gap normalizes as alcohols metabolize to acids",
      "Nephrology consult for hemodialysis if severe",
    ],
    references: ["Kraut JA, Kurtz I. Clin J Am Soc Nephrol. 2008;3(1):208-225"],
  },
  {
    id: "urine-anion-gap",
    name: "Urine Anion Gap (for RTA diagnosis)",
    description: "Differentiates renal vs. GI causes of normal AG acidosis",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "urineNa", label: "Urine Sodium", type: "number", unit: "mEq/L", placeholder: "40", required: true },
      { id: "urineK", label: "Urine Potassium", type: "number", unit: "mEq/L", placeholder: "20", required: true },
      { id: "urineCl", label: "Urine Chloride", type: "number", unit: "mEq/L", placeholder: "50", required: true },
    ],
    resultLabel: "Urine Anion Gap",
    resultUnit: "mEq/L",
    interpretation: (value) => {
      if (value < -20) return "Negative UAG - intact renal acidification (GI HCO3 losses or proximal RTA)";
      if (value <= 20) return "Equivocal - may need urine pH and NH4+ measurement";
      return "Positive UAG - impaired renal NH4+ excretion (distal RTA or Type 4 RTA)";
    },
    clinicalPearls: [
      "Differentiates renal vs. GI causes of normal AG metabolic acidosis",
      "Urine pH helps further: pH >5.5 in acidosis = distal RTA",
      "Type 1 RTA: positive UAG, urine pH >5.5, may have stones",
    ],
    references: ["Batlle DC et al. N Engl J Med. 1988;318(10):594-599"],
  },
  // ============================================================================
  // ELECTROLYTES & ACID-BASE
  // ============================================================================
  {
    id: "ttkg",
    name: "Transtubular Potassium Gradient (TTKG)",
    description: "Helps distinguish renal vs. extrarenal causes of K disorders",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "urineK", label: "Urine Potassium", type: "number", unit: "mEq/L", placeholder: "40", required: true },
      { id: "plasmaK", label: "Plasma Potassium", type: "number", unit: "mEq/L", placeholder: "5.5", required: true },
      { id: "urineOsm", label: "Urine Osmolality", type: "number", unit: "mOsm/kg", placeholder: "400", required: true },
      { id: "plasmaOsm", label: "Plasma Osmolality", type: "number", unit: "mOsm/kg", placeholder: "290", required: true },
    ],
    resultLabel: "TTKG",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value < 6) return "Low TTKG in hyperkalemia - suggests hypoaldosteronism or aldosterone resistance";
      if (value > 3 && value < 8) return "Normal TTKG";
      if (value > 8) return "High TTKG in hypokalemia - suggests renal K wasting";
      return "Validity criteria not met (need urine Osm >300 and urine Na >25)";
    },
    clinicalPearls: [
      "Validity criteria: urine Osm >300 mOsm/kg and urine Na >25 mEq/L",
      "Normal on regular diet: 8-9",
      "Utility debated; some experts recommend direct urine K measurement",
    ],
    references: ["Ethier JH et al. Am J Kidney Dis. 1990;15(4):309-315"],
  },
  {
    id: "water-deficit-hypernatremia",
    name: "Water Deficit in Hypernatremia",
    description: "Calculates free water needed to correct hypernatremia",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "currentNa", label: "Current Serum Sodium", type: "number", unit: "mEq/L", placeholder: "160", required: true },
      { id: "targetNa", label: "Target Serum Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "totalBodyWater", label: "Total Body Water", type: "number", unit: "L", placeholder: "42", required: true },
    ],
    resultLabel: "Free Water Deficit",
    resultUnit: "L",
    interpretation: (value) => {
      if (value <= 1) return "Mild deficit - oral rehydration may suffice";
      if (value <= 3) return "Moderate deficit - IV D5W or hypotonic saline";
      return "Severe deficit - careful IV rehydration needed to avoid cerebral edema";
    },
    clinicalPearls: [
      "Correct slowly: no more than 10-12 mEq/L in 24 hours",
      "Rapid correction risks cerebral edema",
      "Address underlying cause (diabetes insipidus, insensible losses)",
    ],
    references: ["Adrogue HJ, Madias NE. N Engl J Med. 2000;342(20):1493-1499"],
  },
  {
    id: "corrected-sodium-hyperglycemia",
    name: "Corrected Sodium in Hyperglycemia",
    description: "Adjusts sodium for osmotic effect of hyperglycemia",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "measuredNa", label: "Measured Serum Sodium", type: "number", unit: "mEq/L", placeholder: "130", required: true },
      { id: "glucose", label: "Serum Glucose", type: "number", unit: "mg/dL or mmol/L", placeholder: "500", required: true },
      { id: "glucoseUnit", label: "Glucose Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }], required: true },
    ],
    resultLabel: "Corrected Sodium",
    resultUnit: "mEq/L",
    interpretation: (value) => {
      if (value >= 135) return "Sodium normal when corrected for hyperglycemia";
      if (value >= 130) return "Mild hyponatremia";
      return "Significant hyponatremia - requires careful correction";
    },
    clinicalPearls: [
      "Each 100 mg/dL glucose above 100 lowers Na by ~2-3 mEq/L",
      "Critical in DKA and HHS management",
      "Corrected Na guides treatment decisions",
    ],
    references: ["Katz MA. N Engl J Med. 1973;289(16):843-844"],
  },
  {
    id: "sodium-correction-rate",
    name: "Sodium Correction Rate in Hyponatremia",
    description: "Calculates rate of sodium change with fluid administration",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "currentNa", label: "Current Serum Sodium", type: "number", unit: "mEq/L", placeholder: "120", required: true },
      { id: "targetNa", label: "Target Serum Sodium", type: "number", unit: "mEq/L", placeholder: "130", required: true },
      { id: "infusionNa", label: "Infusate Sodium Concentration", type: "number", unit: "mEq/L", placeholder: "154", required: true },
      { id: "totalBodyWater", label: "Total Body Water", type: "number", unit: "L", placeholder: "42", required: true },
      { id: "correctionHours", label: "Correction Period", type: "number", unit: "hours", placeholder: "24", required: true },
    ],
    resultLabel: "Correction Rate",
    resultUnit: "mEq/L/hour",
    interpretation: (value) => {
      if (value <= 6) return "Safe correction rate";
      if (value <= 8) return "Acceptable rate";
      if (value <= 10) return "Risk of osmotic demyelination syndrome - slow correction";
      return "Too rapid - risk of serious neurological complications";
    },
    clinicalPearls: [
      "Maximum safe rate: 6-8 mEq/L in 24 hours",
      "Rapid correction risks osmotic demyelination syndrome",
      "Chronic hyponatremia requires slower correction",
    ],
    references: ["Adrogue HJ, Madias NE. N Engl J Med. 2000;342(20):1493-1499"],
  },
  {
    id: "sodium-deficit",
    name: "Sodium Deficit in Hyponatremia",
    description: "Calculates total sodium needed to correct hyponatremia",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "currentNa", label: "Current Serum Sodium", type: "number", unit: "mEq/L", placeholder: "120", required: true },
      { id: "targetNa", label: "Target Serum Sodium", type: "number", unit: "mEq/L", placeholder: "130", required: true },
      { id: "totalBodyWater", label: "Total Body Water", type: "number", unit: "L", placeholder: "42", required: true },
    ],
    resultLabel: "Sodium Deficit",
    resultUnit: "mEq",
    interpretation: (value) => {
      if (value <= 100) return "Mild deficit - may use hypotonic saline or fluid restriction";
      if (value <= 300) return "Moderate deficit - hypertonic saline (3%) may be needed";
      return "Severe deficit - careful IV hypertonic saline with monitoring";
    },
    clinicalPearls: [
      "Guides choice of IV fluid and rate of administration",
      "Acute hyponatremia (<48 hours) needs faster correction",
      "Chronic hyponatremia needs slower correction",
    ],
    references: ["Adrogue HJ, Madias NE. N Engl J Med. 2000;342(20):1493-1499"],
  },
  {
    id: "corrected-calcium",
    name: "Corrected Calcium for Albumin",
    description: "Adjusts total calcium for hypoalbuminemia",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "measuredCa", label: "Measured Total Calcium", type: "number", unit: "mg/dL", placeholder: "7.5", required: true },
      { id: "albumin", label: "Serum Albumin", type: "number", unit: "g/dL or g/L", placeholder: "2.0", required: true },
      { id: "albuminUnit", label: "Albumin Unit", type: "select", options: [{ value: "g/dL", label: "g/dL" }, { value: "g/L", label: "g/L" }], required: true },
    ],
    resultLabel: "Corrected Calcium",
    resultUnit: "mg/dL",
    interpretation: (value) => {
      if (value >= 8.5 && value <= 10.5) return "Normal corrected calcium";
      if (value < 8.5) return "Hypocalcemia - may need supplementation";
      return "Hypercalcemia - investigate cause";
    },
    clinicalPearls: [
      "~40% of serum calcium is albumin-bound",
      "Ionized calcium measurement is gold standard",
      "Less accurate in severe acid-base disturbances",
    ],
    references: ["Payne RB et al. Br Med J. 1973;4(5893):643-646"],
  },
  {
    id: "qtc-bazett",
    name: "Corrected QT Interval (QTc - Bazett)",
    description: "Calculates heart rate-corrected QT interval",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "qtInterval", label: "QT Interval", type: "number", unit: "ms", placeholder: "400", required: true },
      { id: "heartRate", label: "Heart Rate", type: "number", unit: "bpm", placeholder: "80", required: true, min: 40, max: 200 },
    ],
    resultLabel: "QTc",
    resultUnit: "ms",
    interpretation: (value) => {
      if (value <= 450) return "Normal (men)";
      if (value <= 460) return "Normal (women)";
      if (value <= 500) return "Prolonged - monitor, correct electrolytes";
      return "Severely prolonged - risk of torsades de pointes, urgent intervention needed";
    },
    clinicalPearls: [
      "Normal: Men <450 ms, Women <460 ms",
      "Causes: hypokalemia, hypocalcemia, hypomagnesemia, medications",
      "Correct electrolytes urgently if QTc >500 ms",
    ],
    references: ["Rautaharju PM et al. Circulation. 2009;119(10):e241-e250"],
  },
  // ============================================================================
  // PROTEINURIA & GLOMERULAR DISEASE
  // ============================================================================
  {
    id: "uacr",
    name: "Urine Albumin-to-Creatinine Ratio (uACR)",
    description: "Quantifies albuminuria - key CKD marker",
    category: "Proteinuria & Glomerular Disease",
    inputs: [
      { id: "urineAlbumin", label: "Urine Albumin", type: "number", unit: "mg", placeholder: "150", required: true },
      { id: "urineCreatinineUACR", label: "Urine Creatinine", type: "number", unit: "g", placeholder: "1.0", required: true },
    ],
    resultLabel: "uACR",
    resultUnit: "mg/g",
    interpretation: (value) => {
      if (value < 30) return "A1: Normal to mildly increased albuminuria";
      if (value < 300) return "A2: Moderately increased albuminuria (formerly microalbuminuria)";
      if (value < 2200) return "A3: Severely increased albuminuria (formerly macroalbuminuria)";
      return "Nephrotic range albuminuria - requires aggressive treatment";
    },
    clinicalPearls: [
      "Key CKD marker; predicts progression and CVD events",
      "Required for KFRE calculation",
      "Use first morning void when possible",
      "Target: 30-50% reduction with treatment",
    ],
    references: ["KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD"],
  },
  {
    id: "upcr",
    name: "Urine Protein-to-Creatinine Ratio (UPCR)",
    description: "Quantifies total proteinuria - preferred in nephrotic syndrome",
    category: "Proteinuria & Glomerular Disease",
    inputs: [
      { id: "urineProtein", label: "Urine Total Protein", type: "number", unit: "mg", placeholder: "500", required: true },
      { id: "urineCreatinineUPCR", label: "Urine Creatinine", type: "number", unit: "mg", placeholder: "100", required: true },
    ],
    resultLabel: "UPCR",
    resultUnit: "g/g",
    interpretation: (value) => {
      if (value < 0.15) return "Normal proteinuria";
      if (value < 0.5) return "Mild proteinuria";
      if (value < 1) return "Moderate proteinuria";
      if (value < 3) return "Heavy proteinuria";
      return "Nephrotic range proteinuria (>3 g/g)";
    },
    clinicalPearls: [
      "Replaces 24-hour urine collection in most cases",
      "Preferred in nephrotic syndrome, amyloidosis, myeloma",
      "UPCR (g/g) ≈ 24-hour proteinuria (g/24h)",
      "GN monitoring: target <0.5-1 g/g with immunosuppression",
    ],
    references: ["Levey AS et al. UpToDate 2024"],
  },
  {
    id: "acr-from-pcr",
    name: "Estimated ACR from PCR (conversion)",
    description: "Estimates albumin-creatinine ratio from total protein",
    category: "Proteinuria & Glomerular Disease",
    inputs: [
      { id: "pcr", label: "Urine Protein-Creatinine Ratio", type: "number", unit: "g/g", placeholder: "1.5", required: true },
    ],
    resultLabel: "Estimated ACR",
    resultUnit: "mg/g",
    interpretation: (value) => {
      if (value < 30) return "A1: Normal to mildly increased";
      if (value < 300) return "A2: Moderately increased";
      return "A3: Severely increased";
    },
    clinicalPearls: [
      "Allows use of KFRE when only PCR available",
      "Simplified conversion: ACR ≈ PCR × 700",
      "Not a substitute for direct ACR measurement when precision needed",
    ],
    references: ["Sumida K et al. Ann Intern Med. 2020;173(6):426-435"],
  },
  {
    id: "24-hour-protein",
    name: "24-Hour Protein Excretion Estimator",
    description: "Converts spot urine PCR/ACR to estimated 24-hour protein excretion",
    category: "Proteinuria & Glomerular Disease",
    inputs: [
      { id: "testType", label: "Test Type", type: "select", options: [{ value: "pcr", label: "Protein/Creatinine Ratio (PCR)" }, { value: "acr", label: "Albumin/Creatinine Ratio (ACR)" }], required: true },
      { id: "inputMode", label: "Input Method", type: "select", options: [{ value: "ratio", label: "I have the ratio value" }, { value: "raw", label: "I have protein/albumin and creatinine values" }], required: true },
      { id: "ratioValue", label: "Ratio Value", type: "number", unit: "mg/mg", placeholder: "0.5", required: false },
      { id: "proteinValue", label: "Urine Protein/Albumin Concentration", type: "number", unit: "mg/dL", placeholder: "50", required: false },
      { id: "creatinineValue", label: "Urine Creatinine Concentration", type: "number", unit: "mg/dL", placeholder: "100", required: false },
    ],
    resultLabel: "Estimated 24-Hour Protein Excretion",
    resultUnit: "g/day",
    interpretation: (value) => {
      if (value < 0.15) return "Normal (A1) - No significant proteinuria";
      if (value < 3.0) return "Mildly to Moderately Increased (A1-A2) - Monitor and treat underlying cause";
      if (value < 10) return "Nephrotic-Range (A3) - Requires aggressive treatment";
      return "Severe Nephrotic-Range (A3) - Timed 24-hour collection recommended for clinical decisions";
    },
    referenceRanges: [
      { label: "Normal (A1)", max: 0.15, unit: "g/day", note: "No significant proteinuria" },
      { label: "Increased (A2)", min: 0.15, max: 3, unit: "g/day", note: "Mildly to moderately increased" },
      { label: "Nephrotic-range (A3)", min: 3, unit: "g/day", note: "Severely increased" },
    ],
    clinicalPearls: [
      "Formula: PCR (g/day) = Urine Protein (mg/dL) ÷ Urine Creatinine (mg/dL)",
      "Spot urine PCR correlates well with 24-hour collection in most patients",
      "Accuracy decreases at nephrotic-range values (>10 g/day)",
      "Timed 24-hour collection recommended for clinical decisions in edge cases",
      "Less accurate with tubular or overflow proteinuria",
    ],
    references: ["KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD"],
  },
  {
    id: "igan-prediction",
    name: "International IgA Nephropathy (IgAN) Prediction Tool",
    description: "Predicts 2, 5, and 7-year risk of kidney failure in IgAN",
    category: "Proteinuria & Glomerular Disease",
    inputs: [
      { id: "age", label: "Age at Biopsy", type: "number", unit: "years", placeholder: "35", required: true },
      { id: "eGFR", label: "eGFR at Biopsy", type: "number", unit: "mL/min/1.73m²", placeholder: "60", required: true },
      { id: "map", label: "Mean Arterial Pressure", type: "number", unit: "mmHg", placeholder: "95", required: true },
      { id: "proteinuria", label: "Proteinuria", type: "number", unit: "g/day", placeholder: "1.5", required: true },
      { id: "years", label: "Prediction Timeframe", type: "select", options: [{ value: "2", label: "2-year risk" }, { value: "5", label: "5-year risk" }, { value: "7", label: "7-year risk" }], required: true },
    ],
    resultLabel: "Kidney Failure Risk",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 20) return "Low risk - conservative management (RAAS blockade, SGLT2i)";
      if (value < 40) return "Intermediate risk - consider immunosuppression";
      return "High risk - immunosuppression recommended";
    },
    clinicalPearls: [
      "Most validated prognostic tool for IgAN",
      "Guides treatment intensity decisions",
      "High-risk: persistent proteinuria >1 g/day despite 3-6 months optimal supportive care",
      "External validation in >4000 patients",
    ],
    references: ["Barbour SJ et al. JAMA Intern Med. 2019;179(7):942-952"],
  },
  // ============================================================================
  // DIALYSIS ADEQUACY
  // ============================================================================
  {
    id: "ktv-hemodialysis",
    name: "Kt/V (Hemodialysis Adequacy)",
    description: "Measures dialysis dose - most important adequacy parameter",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "preBUN", label: "Pre-Dialysis BUN / Urea", type: "number", unit: "mg/dL or mmol/L", placeholder: "60", required: true },
      { id: "postBUN", label: "Post-Dialysis BUN / Urea", type: "number", unit: "mg/dL or mmol/L", placeholder: "20", required: true },
      { id: "postWeight", label: "Post-Dialysis Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sessionTime", label: "Session Duration", type: "number", unit: "minutes", placeholder: "240", required: true },
      { id: "ultrafiltration", label: "Ultrafiltration Volume", type: "number", unit: "L", placeholder: "3", required: true },
      { id: "bunUnit", label: "BUN / Urea Unit", type: "select", options: [{ value: "BUN (mg/dL)", label: "BUN (mg/dL)" }, { value: "BUN (mmol/L)", label: "BUN (mmol/L)" }, { value: "Urea (mg/dL)", label: "Urea (mg/dL)" }, { value: "Urea (mmol/L)", label: "Urea (mmol/L)" }], required: true },
    ],
    resultLabel: "Kt/V",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value >= 1.4) return "Adequate dialysis (≥1.4 recommended)";
      if (value >= 1.2) return "Borderline adequate";
      return "Inadequate dialysis - increase session time or frequency";
    },
    referenceRanges: [
      { label: "Adequate", min: 65, unit: "%", note: "Target ≥65%" },
      { label: "Borderline", min: 60, max: 64, unit: "%" },
      { label: "Inadequate", max: 59, unit: "%" },
    ],
    clinicalPearls: [
      "Target URR ≥65% (minimum 65%)",
      "Accounts for body size and session duration",
      "Does not account for residual kidney function",
      "Post-BUN must be drawn correctly (slow flow or stop pump 15 sec before)",
    ],
    references: ["KDOQI Hemodialysis Adequacy Guidelines 2015"],
  },
  {
    id: "total-body-water",
    name: "Total Body Water (Watson Formula)",
    description: "Estimates total body water for Kt/V calculations",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm", placeholder: "170", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "55", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
    ],
    resultLabel: "Total Body Water",
    resultUnit: "L",
    interpretation: (value) => {
      if (value > 0) return `Estimated TBW: ${value.toFixed(1)} L - use for Kt/V calculations`;
      return "Unable to calculate";
    },
    clinicalPearls: [
      "Used in Kt/V calculation (V = TBW)",
      "Accounts for age and sex differences",
      "Males typically 50-60% of body weight",
      "Females typically 45-50% of body weight",
    ],
    references: ["Watson PE et al. Am J Clin Nutr. 1980;33(12):2641-2645"],
  },
  {
    id: "hd-session-duration",
    name: "Hemodialysis Session Duration from Target Kt/V",
    description: "Calculates required session time to achieve target Kt/V based on dialyzer clearance and total body water",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "targetKtV", label: "Target Kt/V", type: "number", unit: "ratio", placeholder: "1.4", required: true },
      { id: "dialyzerClearance", label: "Dialyzer Urea Clearance (K)", type: "number", unit: "mL/min", placeholder: "250", required: true },
      { id: "totalBodyWater", label: "Total Body Water (V)", type: "number", unit: "L", placeholder: "42", required: true },
    ],
    resultLabel: "Required Session Duration",
    resultUnit: "minutes",
    interpretation: (value) => {
      if (value <= 180) return `${(value / 60).toFixed(1)} hours - short session`;
      if (value <= 240) return `${(value / 60).toFixed(1)} hours - standard session`;
      if (value <= 300) return `${(value / 60).toFixed(1)} hours - extended session`;
      return `${(value / 60).toFixed(1)} hours - very extended session - consider nocturnal HD`;
    },
    clinicalPearls: [
      "Formula: t = (Kt/V × V) / K",
      "Typical dialyzer clearance: 200-300 mL/min",
      "TBW can be estimated using Watson formula (approx. 60% of body weight for men, 50% for women)",
      "Target Kt/V ≥1.4 for thrice-weekly HD (minimum 1.2)",
    ],
    references: ["Daugirdas JT. Adv Ren Replace Ther. 1995;2(4):295-304", "KDOQI Clinical Practice Guideline for Hemodialysis Adequacy: 2015 Update"],
  },
  {
    id: "pd-weekly-ktv",
    name: "Peritoneal Dialysis Weekly Kt/V",
    description: "Assesses solute clearance adequacy in CAPD/APD",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "dailyDialysateUrea", label: "Daily Dialysate Urea", type: "number", unit: "mg/dL", placeholder: "200", required: true },
      { id: "plasmaUrea", label: "Plasma Urea", type: "number", unit: "mg/dL", placeholder: "40", required: true },
      { id: "dialysateVolume", label: "Daily Dialysate Volume", type: "number", unit: "L", placeholder: "8", required: true },
      { id: "totalBodyWater", label: "Total Body Water", type: "number", unit: "L", placeholder: "42", required: true },
      { id: "residualKtv", label: "Residual Renal Kt/V", type: "number", unit: "ratio", placeholder: "0.1" },
    ],
    resultLabel: "Weekly PD Kt/V",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value >= 2.0) return "Optimal PD adequacy (≥2.0 recommended)";
      if (value >= 1.7) return "Minimum adequate PD (≥1.7 minimum)";
      return "Inadequate PD - increase dwell time, add exchange, or consider HD transition";
    },
    clinicalPearls: [
      "Includes both peritoneal and residual renal clearance",
      "Measured every 6 months or when clinically indicated",
      "Low Kt/V associated with malnutrition, inflammation, mortality",
      "Preserve residual kidney function",
    ],
    references: ["ISPD Guidelines 2020: Peritoneal Dialysis Adequacy"],
  },
  {
    id: "residual-rkf-ktv",
    name: "Residual Kidney Function (RKF) Kt/V Component",
    description: "Quantifies contribution of residual kidney function to clearance",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "ureaUrineClearance", label: "Urine Urea Clearance", type: "number", unit: "mL/min", placeholder: "5", required: true },
      { id: "totalBodyWater", label: "Total Body Water", type: "number", unit: "L", placeholder: "42", required: true },
    ],
    resultLabel: "Residual Kt/V",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value >= 0.2) return "Significant residual kidney function - preserve it!";
      if (value >= 0.1) return "Moderate residual function";
      if (value > 0) return "Minimal residual function";
      return "No residual kidney function";
    },
    clinicalPearls: [
      "Preservation of RKF = better survival, fluid balance, phosphate control",
      "Measure RKF if urine output ≥100 mL/day",
      "Protect RKF: avoid NSAIDs, aminoglycosides, contrast, maintain euvolemia",
      "RKF loss faster in HD than PD",
    ],
    references: ["Bargman JM et al. J Am Soc Nephrol. 2001;12(10):2158-2162"],
  },
  {
    id: "equilibrated-ktv",
    name: "Equilibrated Kt/V (eKt/V) for Hemodialysis",
    description: "Accounts for post-dialysis urea rebound",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "spKtv", label: "Single-Pool Kt/V", type: "number", unit: "ratio", placeholder: "1.3", required: true },
      { id: "sessionTime", label: "Session Duration", type: "number", unit: "hours", placeholder: "4", required: true },
    ],
    resultLabel: "Equilibrated Kt/V",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value >= 1.2) return "Adequate eKt/V";
      if (value >= 1.0) return "Borderline adequate";
      return "Inadequate - increase dialysis dose";
    },
    clinicalPearls: [
      "Accounts for post-dialysis urea rebound (30-60 min after HD)",
      "More accurate than spKt/V",
      "Typically 0.1-0.2 lower than spKt/V",
      "Important for short, high-efficiency dialysis",
    ],
    references: ["Daugirdas JT. Adv Ren Replace Ther. 1995;2(4):295-304"],
  },
  {
    id: "standard-ktv",
    name: "Standard Kt/V (stdKt/V) - Weekly Normalized Dose",
    description: "Converts intermittent HD dose to continuous equivalent clearance",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "spKtv", label: "Single-Pool Kt/V", type: "number", unit: "ratio", placeholder: "1.3", required: true },
      { id: "sessionTime", label: "Session Duration", type: "number", unit: "hours", placeholder: "4", required: true },
      { id: "sessionsPerWeek", label: "Sessions per Week", type: "number", unit: "", placeholder: "3" },
      { id: "residualKtv", label: "Residual Kidney Function Kt/V", type: "number", unit: "ratio", placeholder: "0.1" },
    ],
    resultLabel: "Standard Kt/V",
    resultUnit: "ratio/week",
    interpretation: (value) => {
      if (value >= 2.3) return "Adequate stdKt/V (≥2.3 recommended)";
      if (value >= 2.1) return "Borderline adequate";
      return "Inadequate - increase dialysis frequency or duration";
    },
    clinicalPearls: [
      "Allows comparison across different HD schedules",
      "Accounts for dialysis frequency and residual function",
      "Recommended by KDOQI as preferred adequacy measure",
      "Complex calculation - use HD machine software",
    ],
    references: ["KDOQI Clinical Practice Guideline for Hemodialysis Adequacy: 2015 Update"],
  },
  {
    id: "urr",
    name: "Urea Reduction Ratio (URR)",
    description: "Simplest measure of hemodialysis adequacy",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "preBUN", label: "Pre-Dialysis BUN / Urea", type: "number", unit: "mg/dL or mmol/L", placeholder: "60", required: true },
      { id: "postBUN", label: "Post-Dialysis BUN / Urea", type: "number", unit: "mg/dL or mmol/L", placeholder: "20", required: true },
      { id: "bunUnit", label: "BUN / Urea Unit", type: "select", options: [{ value: "BUN (mg/dL)", label: "BUN (mg/dL)" }, { value: "BUN (mmol/L)", label: "BUN (mmol/L)" }, { value: "Urea (mg/dL)", label: "Urea (mg/dL)" }, { value: "Urea (mmol/L)", label: "Urea (mmol/L)" }], required: true },
    ],
    resultLabel: "URR",
    resultUnit: "%",
    interpretation: (value) => {
      if (value >= 70) return "Optimal URR (≥70% recommended)";
      if (value >= 65) return "Minimum adequate URR (≥65% minimum)";
      return "Inadequate dialysis - increase session time or frequency";
    },
    clinicalPearls: [
      "Simplest measure - does not require weight or session time",
      "Underestimates adequacy in short session/high UF",
      "URR 65% ≈ Kt/V 1.2; URR 70% ≈ Kt/V 1.4",
      "Post-BUN must be drawn correctly (slow flow or stop pump 15 sec)",
    ],
    references: ["KDOQI Hemodialysis Adequacy Guidelines 2015"],
  },
  {
    id: "iron-deficit",
    name: "Iron Deficit (Ganzoni Formula)",
    description: "Calculates total iron needed to correct anemia",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "targetHemoglobin", label: "Target Hemoglobin", type: "number", unit: "g/dL", placeholder: "11", required: true },
      { id: "currentHemoglobin", label: "Current Hemoglobin", type: "number", unit: "g/dL", placeholder: "8", required: true },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
    ],
    resultLabel: "Total Iron Needed",
    resultUnit: "mg",
    interpretation: (value) => {
      if (value <= 500) return "Mild iron deficit - oral iron may suffice";
      if (value <= 1000) return "Moderate deficit - IV iron likely needed";
      return "Severe deficit - significant IV iron supplementation required";
    },
    clinicalPearls: [
      "Accounts for hemoglobin deficit + iron stores",
      "Iron stores: ~500 mg (men), ~300 mg (women)",
      "IV iron preferred in dialysis patients",
      "Monitor ferritin and TSAT during repletion",
    ],
    references: ["Ganzoni AM. Schweiz Med Wochenschr. 1970;100(7):301-303"],
  },
  // ============================================================================
  // TRANSPLANTATION
  // ============================================================================
  {
    id: "kdpi",
    name: "Kidney Donor Profile Index (KDPI)",
    description: "OPTN 2024 formula - predicts donor kidney quality and graft survival",
    category: "Transplantation",
    inputs: [
      { id: "donorAge", label: "Donor Age", type: "number", unit: "years", placeholder: "45", required: true },
      { id: "donorHeight", label: "Donor Height", type: "number", unit: "cm", placeholder: "170", required: true },
      { id: "donorWeight", label: "Donor Weight", type: "number", unit: "kg", placeholder: "80", required: true },
      { id: "donorCreatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "1.0", required: true },
      { id: "hypertensionDuration", label: "History of Hypertension", type: "select", options: [
        { value: "NO", label: "No" },
        { value: "0-5", label: "Yes, 0-5 years" },
        { value: "6-10", label: "Yes, 6-10 years" },
        { value: ">10", label: "Yes, >10 years" }
      ], required: true },
      { id: "diabetesDuration", label: "History of Diabetes", type: "select", options: [
        { value: "NO", label: "No" },
        { value: "0-5", label: "Yes, 0-5 years" },
        { value: "6-10", label: "Yes, 6-10 years" },
        { value: ">10", label: "Yes, >10 years" }
      ], required: true },
      { id: "causeOfDeath", label: "Cause of Death", type: "select", options: [
        { value: "ANOXIA", label: "Anoxia" },
        { value: "CVA", label: "Cerebrovascular/Stroke" },
        { value: "HEAD_TRAUMA", label: "Head Trauma" },
        { value: "CNS_TUMOR", label: "CNS Tumor" },
        { value: "OTHER", label: "Other" }
      ], required: true },
      { id: "isDCD", label: "Donation after Circulatory Death (DCD)", type: "select", options: [
        { value: "NO", label: "No" },
        { value: "YES", label: "Yes" }
      ], required: true },
    ],
    resultLabel: "KDPI",
    resultUnit: "%",
    interpretation: (value) => {
      if (value <= 20) return "KDPI 0-20%: Highest quality organs (longevity matching to EPTS ≤20%)";
      if (value <= 85) return "KDPI 21-85%: Standard criteria donors";
      return "KDPI 86-100%: Expanded criteria donors (ECD) - higher discard rate but better than dialysis";
    },
    clinicalPearls: [
      "Replaced ECD classification in US allocation system (2014)",
      "KDPI 100% = reference donor (median donor from prior year)",
      "Does not predict rejection or surgical complications",
      "KDPI >85% kidneys: higher early discard rate but transplant better than dialysis",
    ],
    references: ["Rao PS et al. Transplantation. 2009;88(2):231-236"],
  },
  {
    id: "epts",
    name: "Estimated Post-Transplant Survival (EPTS)",
    description: "Predicts recipient longevity after transplant",
    category: "Transplantation",
    inputs: [
      { id: "recipientAge", label: "Recipient Age", type: "number", unit: "years", placeholder: "50", required: true },
      { id: "recipientDiabetes", label: "Recipient Diabetes", type: "checkbox" },
      { id: "priorTransplant", label: "Prior Solid Organ Transplant", type: "checkbox" },
      { id: "yearsOnDialysis", label: "Years on Dialysis", type: "number", unit: "years", placeholder: "3", required: true },
    ],
    resultLabel: "EPTS",
    resultUnit: "%",
    interpretation: (value) => {
      if (value <= 20) return "EPTS 0-20%: Highest longevity candidates (receive KDPI ≤20% kidneys first)";
      return "EPTS 21-100%: Standard allocation";
    },
    clinicalPearls: [
      "Matches best kidneys to longest-lived recipients",
      "Does not measure medical urgency (unlike liver MELD)",
      "EPTS ≤20% candidates get priority for KDPI ≤20% kidneys nationally",
      "Important for patient counseling on accepting organ offers",
    ],
    references: ["OPTN/UNOS Kidney Allocation System. Final Rule 2014"],
  },
  {
    id: "banff-classification",
    name: "Banff Classification for Kidney Transplant Rejection",
    description: "Banff 2022 Renal Allograft Biopsy Analyzer - Comprehensive diagnostic tool based on updated Banff classification criteria",
    category: "Transplantation",
    inputs: [
      // Biopsy Adequacy
      { id: "glomeruli", label: "Glomeruli Count", type: "number", placeholder: "10", required: false, default: 10 },
      { id: "arteries", label: "Arteries Count", type: "number", placeholder: "2", required: false, default: 2 },
      // Acute lesion scores - Interstitial & Tubular
      { id: "i", label: "i - Interstitial Inflammation", type: "score", description: "In non-scarred cortex", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
      { id: "t", label: "t - Tubulitis", type: "score", description: "Mononuclear cells/tubular section", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
      // Acute lesion scores - Vascular
      { id: "v", label: "v - Intimal Arteritis", type: "score", description: "Arterial inflammation", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
      { id: "g", label: "g - Glomerulitis", type: "score", description: "Glomerular inflammation", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
      { id: "ptc", label: "ptc - Peritubular Capillaritis", type: "score", description: "PTC inflammation", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
      // Antibody markers
      { id: "c4d", label: "C4d - C4d Staining", type: "select", options: [
        { value: "0", label: "0 - Negative" },
        { value: "1", label: "1 - Minimal (<10%)" },
        { value: "2", label: "2 - Focal (10-50%)" },
        { value: "3", label: "3 - Diffuse (>50%)" },
      ], required: false, default: "0" },
      { id: "dsa", label: "DSA - Donor Specific Antibody", type: "select", options: [
        { value: "negative", label: "Negative" },
        { value: "positive", label: "Positive" },
        { value: "unknown", label: "Unknown" },
      ], required: false, default: "negative" },
      // Chronic lesion scores - Chronic Changes
      { id: "ci", label: "ci - Interstitial Fibrosis", type: "score", description: "Cortical fibrosis", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
      { id: "ct", label: "ct - Tubular Atrophy", type: "score", description: "Tubular atrophy", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
      { id: "cv", label: "cv - Vascular Fibrosis", type: "score", description: "Vascular fibrous intimal thickening", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
      { id: "cg", label: "cg - Transplant Glomerulopathy", type: "score", description: "GBM duplication", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
      // Chronic Active Inflammation
      { id: "ti", label: "ti - Total Inflammation", type: "score", description: "Total cortical inflammation", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
      { id: "iIfta", label: "i-IFTA - Inflammation in IFTA", type: "score", description: "Inflammation in areas of IFTA", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
      { id: "tIfta", label: "t-IFTA - Tubulitis in Atrophic Tubules", type: "score", description: "Tubulitis in atrophic tubules", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
      // Other scores
      { id: "ah", label: "ah - Arteriolar Hyalinosis", type: "score", description: "PAS-positive hyaline thickening", placeholder: "0", required: false, default: 0, min: 0, max: 3 },
    ],
    resultLabel: "Banff Classification",
    resultUnit: "category",
    interpretation: (value) => {
      // This will be handled specially in Dashboard.tsx
      return "See detailed classification below";
    },
    clinicalPearls: [
      "•Banff 2022 classification from the Banff Foundation",
      "•Adequate specimen: ≥10 glomeruli + ≥2 arteries",
      "•Marginal specimen: ≥7 glomeruli + ≥1 artery",
      "•Acute TCMR Grade IA: i≥2 with t2",
      "•Acute TCMR Grade IB: i≥2 with t3",
      "•Acute TCMR Grade IIA: v1 (mild-moderate intimal arteritis)",
      "•Acute TCMR Grade IIB: v2 (severe intimal arteritis)",
      "•Acute TCMR Grade III: v3 (transmural arteritis)",
      "•Active ABMR: MVI (g>0 or ptc>0) + C4d≥2 or DSA positive",
      "•Chronic Active ABMR: cg>0 or cv>0 + C4d≥2 or DSA positive",
      "•Borderline: t≥1 with i=1 OR t=1 with i≥2 (without v)",
    ],
    references: ["Loupy A et al. Am J Transplant. 2020;20(9):2305-2331", "Haas M et al. Am J Transplant. 2018;18(2):293-307", "Banff 2022 Classification"],
  },
  {
    id: "tacrolimus-monitoring",
    name: "Tacrolimus Therapeutic Monitoring",
    description: "Assesses tacrolimus metabolism and adherence",
    category: "Transplantation",
    inputs: [
      { id: "dailyDose", label: "Daily Tacrolimus Dose", type: "number", unit: "mg", placeholder: "4", required: true },
      { id: "troughLevel", label: "Trough Level", type: "number", unit: "ng/mL", placeholder: "8", required: true },
    ],
    resultLabel: "Dose-to-Trough Ratio",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value > 2.5) return "Fast metabolizer (CYP3A5 expresser) - may need higher doses or BID dosing";
      if (value >= 1.0) return "Normal metabolism - typical dose-to-trough ratio";
      return "Slow metabolizer - risk of toxicity, consider dose reduction";
    },
    clinicalPearls: [
      "Typical range: 1.6-2.4",
      "Identifies metabolism phenotype (genetic or drug interaction)",
      "Assesses adherence (high ratio with low level = missed doses)",
      "CYP3A5 expressers more common in African Americans (~50% vs. 10-20% other populations)",
    ],
    references: ["Thölking G et al. Sci Rep. 2016;6:32273"],
  },
  // ============================================================================
  // CARDIOVASCULAR RISK
  // ============================================================================
  {
    id: "ascvd-risk",
    name: "ASCVD Risk Calculator (with CKD Considerations)",
    description: "Estimates 10-year cardiovascular disease risk",
    category: "Cardiovascular Risk",
    inputs: [
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "55", required: true, min: 40, max: 79 },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "race", label: "Race", type: "select", options: [{ value: "Black", label: "African American" }, { value: "White", label: "White/Other" }], required: true },
      { id: "totalCholesterol", label: "Total Cholesterol", type: "number", unit: "mg/dL", placeholder: "200", required: true },
      { id: "hdl", label: "HDL Cholesterol", type: "number", unit: "mg/dL", placeholder: "50", required: true },
      { id: "systolicBP", label: "Systolic Blood Pressure", type: "number", unit: "mmHg", placeholder: "130", required: true },
      { id: "treated", label: "On Blood Pressure Medication", type: "checkbox" },
      { id: "diabetes", label: "Diabetes Mellitus", type: "checkbox" },
      { id: "smoker", label: "Current Smoker", type: "checkbox" },
    ],
    resultLabel: "10-Year ASCVD Risk",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 5) return "Low risk (<5%)";
      if (value < 7.5) return "Borderline risk (5-7.5%) - CKD is risk enhancer";
      if (value < 20) return "Intermediate risk (7.5-20%)";
      return "High risk (>20%)";
    },
    clinicalPearls: [
      "CKD (eGFR <60 or ACR ≥30) = risk enhancer → consider statin even if calculated risk 5-7.5%",
      "Traditional calculators UNDERESTIMATE risk in CKD",
      "CVD = leading cause of death in CKD",
      "Lower thresholds for statin initiation in CKD patients",
    ],
    references: ["Goff DC Jr et al. Circulation. 2014;129(25 Suppl 2):S49-73"],
  },
  {
    id: "cha2ds2-vasc",
    name: "CHA\u2082DS\u2082-VASc Score",
    description: "Stroke risk stratification in atrial fibrillation",
    category: "Cardiovascular Risk",
    inputs: [
      { id: "chf", label: "Congestive Heart Failure / LV Dysfunction", type: "select", options: [{ value: "0", label: "No" }, { value: "1", label: "Yes" }], required: true, description: "History of CHF or objective evidence of moderate-severe LV dysfunction" },
      { id: "hypertension", label: "Hypertension", type: "select", options: [{ value: "0", label: "No" }, { value: "1", label: "Yes" }], required: true, description: "Resting BP >140/90 mmHg on at least 2 occasions or current antihypertensive treatment" },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "65", required: true, min: 18, max: 120 },
      { id: "diabetes", label: "Diabetes Mellitus", type: "select", options: [{ value: "0", label: "No" }, { value: "1", label: "Yes" }], required: true, description: "Fasting glucose \u2265126 mg/dL or treatment with oral hypoglycemic/insulin" },
      { id: "strokeTia", label: "Prior Stroke / TIA / Thromboembolism", type: "select", options: [{ value: "0", label: "No" }, { value: "1", label: "Yes" }], required: true, description: "History of stroke, TIA, or systemic embolism" },
      { id: "vascularDisease", label: "Vascular Disease", type: "select", options: [{ value: "0", label: "No" }, { value: "1", label: "Yes" }], required: true, description: "Prior MI, peripheral artery disease, or aortic plaque" },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
    ],
    resultLabel: "CHA\u2082DS\u2082-VASc Score",
    resultUnit: "points",
    interpretation: (value) => {
      const strokeRisk: Record<number, string> = {
        0: "0%", 1: "1.3%", 2: "2.2%", 3: "3.2%", 4: "4.0%",
        5: "6.7%", 6: "9.8%", 7: "9.6%", 8: "6.7%", 9: "15.2%"
      };
      const risk = strokeRisk[Math.min(value, 9)] || ">15%";
      if (value === 0) return `Score ${value} - Annual stroke risk: ${risk}. LOW RISK - No antithrombotic therapy recommended.`;
      if (value === 1) return `Score ${value} - Annual stroke risk: ${risk}. LOW-MODERATE RISK - Consider oral anticoagulation (especially if male). Assess bleeding risk with HAS-BLED.`;
      if (value === 2) return `Score ${value} - Annual stroke risk: ${risk}. MODERATE RISK - Oral anticoagulation recommended. DOACs preferred over warfarin.`;
      return `Score ${value} - Annual stroke risk: ${risk}. HIGH RISK - Oral anticoagulation strongly recommended. DOACs preferred over warfarin.`;
    },
    referenceRanges: [
      { label: "Low Risk", min: 0, max: 0, unit: "points", note: "No anticoagulation needed" },
      { label: "Low-Moderate Risk", min: 1, max: 1, unit: "points", note: "Consider anticoagulation" },
      { label: "Moderate Risk", min: 2, max: 2, unit: "points", note: "Anticoagulation recommended" },
      { label: "High Risk", min: 3, max: 9, unit: "points", note: "Anticoagulation strongly recommended" },
    ],
    clinicalPearls: [
      "C = CHF/LV dysfunction (1 pt), H = Hypertension (1 pt), A\u2082 = Age \u226575 (2 pts)",
      "D = Diabetes (1 pt), S\u2082 = Stroke/TIA (2 pts), V = Vascular disease (1 pt)",
      "A = Age 65-74 (1 pt), Sc = Sex category female (1 pt)",
      "Female sex alone (score=1) does not warrant anticoagulation",
      "DOACs (apixaban, rivaroxaban, dabigatran, edoxaban) preferred over warfarin in non-valvular AF",
      "Always assess bleeding risk with HAS-BLED before starting anticoagulation",
      "CKD patients: Adjust DOAC dosing based on CrCl; warfarin may be preferred in severe CKD/dialysis",
    ],
    references: [
      "Lip GY et al. Chest. 2010;137(2):263-272",
      "Hindricks G et al. Eur Heart J. 2021;42(5):373-498 (2020 ESC AF Guidelines)",
      "January CT et al. Circulation. 2019;140(2):e125-e151 (2019 AHA/ACC/HRS Focused Update)",
    ],
  },
  // ============================================================================
  // ANTHROPOMETRIC & BODY COMPOSITION
  // ============================================================================
  {
    id: "bmi",
    name: "Body Mass Index (BMI)",
    description: "Calculates BMI from height and weight",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm or inches", placeholder: "170", required: true },
      { id: "heightUnit", label: "Height Unit", type: "select", options: [{ value: "cm", label: "cm" }, { value: "in", label: "inches" }], required: true },
    ],
    resultLabel: "BMI",
    resultUnit: "kg/m²",
    interpretation: (value) => {
      if (value < 18.5) return "Underweight";
      if (value < 25) return "Normal weight";
      if (value < 30) return "Overweight";
      if (value < 35) return "Obese Class I";
      if (value < 40) return "Obese Class II";
      return "Obese Class III (Severe obesity)";
    },
    referenceRanges: [
      { label: "Underweight", max: 18.4, unit: "kg/m²" },
      { label: "Normal weight", min: 18.5, max: 24.9, unit: "kg/m²" },
      { label: "Overweight", min: 25, max: 29.9, unit: "kg/m²" },
      { label: "Obese Class I", min: 30, max: 34.9, unit: "kg/m²" },
      { label: "Obese Class II", min: 35, max: 39.9, unit: "kg/m²" },
      { label: "Obese Class III", min: 40, unit: "kg/m²" },
    ],
    clinicalPearls: [
      "BMI is a screening tool, not a diagnostic tool",
      "Does not distinguish muscle from fat",
      "CKD patients: obesity increases CVD risk",
      "Use adjusted body weight for drug dosing in obesity",
    ],
    references: ["WHO BMI Classification"],
  },
  {
    id: "bsa-dubois",
    name: "BSA – Du Bois & Du Bois Formula",
    description: "Calculates body surface area (traditional formula)",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm or inches", placeholder: "170", required: true },
      { id: "heightUnit", label: "Height Unit", type: "select", options: [{ value: "cm", label: "cm" }, { value: "in", label: "inches" }], required: true },
    ],
    resultLabel: "Body Surface Area",
    resultUnit: "m²",
    interpretation: (value) => {
      if (value < 1.5) return "Small BSA - typical for children or small adults";
      if (value < 2.0) return "Average BSA - typical for adults";
      return "Large BSA - typical for large/obese adults";
    },
    clinicalPearls: [
      "eGFR indexed to 1.73 m² BSA (average adult)",
      "Used for drug dosing (chemotherapy, certain antibiotics)",
      "De-indexing eGFR may be needed in extremes of body size",
      "Average adult BSA: 1.7-2.0 m²",
    ],
    references: ["Du Bois D, Du Bois EF. Arch Intern Med. 1916;17(6):863-871"],
  },
  {
    id: "bsa-mosteller",
    name: "Body Surface Area - Mosteller Formula",
    description: "Calculates BSA using simplified Mosteller formula",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm or inches", placeholder: "170", required: true },
      { id: "heightUnit", label: "Height Unit", type: "select", options: [{ value: "cm", label: "cm" }, { value: "in", label: "inches" }], required: true },
    ],
    resultLabel: "Body Surface Area",
    resultUnit: "m²",
    interpretation: (value) => {
      if (value < 1.5) return "Small BSA";
      if (value < 2.0) return "Average BSA";
      return "Large BSA";
    },
    clinicalPearls: [
      "Simpler than Du Bois formula (equivalent accuracy)",
      "Used for drug dosing (chemotherapy, certain antibiotics)",
      "Easier to calculate than Du Bois",
    ],
    references: ["Mosteller RD. N Engl J Med. 1987;317(17):1098"],
  },
  {
    id: "devine-ibw",
    name: "Devine Ideal Body Weight",
    description: "Calculates ideal body weight for height and sex",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "height", label: "Height", type: "number", unit: "cm or inches", placeholder: "170", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "heightUnit", label: "Height Unit", type: "select", options: [{ value: "cm", label: "cm" }, { value: "in", label: "inches" }], required: true },
    ],
    resultLabel: "Ideal Body Weight",
    resultUnit: "kg",
    interpretation: (value) => {
      if (value > 0) return `Ideal body weight: ${value.toFixed(1)} kg`;
      return "Unable to calculate";
    },
    clinicalPearls: [
      "Men: 50 + 2.3 × (height in inches - 60)",
      "Women: 45.5 + 2.3 × (height in inches - 60)",
      "Used for drug dosing in obesity",
      "Reference for calculating adjusted body weight",
    ],
    references: ["Devine BJ. Drug Intell Clin Pharm. 1974;8(7):470-471"],
  },
  {
    id: "lean-body-weight",
    name: "Lean Body Weight (Janmahasatian)",
    description: "Estimates lean body mass for drug dosing",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm or inches", placeholder: "170", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "heightUnit", label: "Height Unit", type: "select", options: [{ value: "cm", label: "cm" }, { value: "in", label: "inches" }], required: true },
    ],
    resultLabel: "Lean Body Weight",
    resultUnit: "kg",
    interpretation: (value) => {
      if (value > 0) return `Lean body weight: ${value.toFixed(1)} kg`;
      return "Unable to calculate";
    },
    clinicalPearls: [
      "More accurate than adjusted body weight for some drugs",
      "Used for aminoglycoside dosing in obesity",
      "Accounts for sex differences in body composition",
    ],
    references: ["Janmahasatian S et al. Clin Pharmacokinet. 2005;44(10):1051-1065"],
  },
  {
    id: "adjusted-body-weight",
    name: "Adjusted Body Weight (for Obese Patients)",
    description: "Calculates adjusted weight for drug dosing in obesity",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "actualWeight", label: "Actual Body Weight", type: "number", unit: "kg", placeholder: "120", required: true },
      { id: "idealWeight", label: "Ideal Body Weight", type: "number", unit: "kg", placeholder: "73", required: true },
    ],
    resultLabel: "Adjusted Body Weight",
    resultUnit: "kg",
    interpretation: (value) => {
      if (value > 0) return `Adjusted BW: ${value.toFixed(1)} kg - use for aminoglycosides`;
      return "Unable to calculate";
    },
    clinicalPearls: [
      "Formula: Adjusted BW = IBW + 0.4 × (Actual BW - IBW)",
      "Used for aminoglycoside dosing in obesity",
      "Assumes 40% of excess weight is metabolically active",
      "Vancomycin: controversial (some use actual BW, some adjusted)",
    ],
    references: ["Pai MP, Paloucek FP. Ann Pharmacother. 2000;34(9):1066-1069"],
  },
  // ============================================================================
  // CKD-MINERAL BONE DISEASE
  // ============================================================================
  {
    id: "ca-pho-product",
    name: "Calcium-Phosphate Product (CKD-MBD)",
    description: "Calculates risk of vascular calcification",
    category: "CKD-Mineral Bone Disease",
    inputs: [
      { id: "calcium", label: "Serum Calcium", type: "number", unit: "mg/dL or mmol/L", placeholder: "9", required: true },
      { id: "phosphate", label: "Serum Phosphate", type: "number", unit: "mg/dL or mmol/L", placeholder: "5", required: true },
      { id: "calciumUnit", label: "Calcium Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }], required: true },
      { id: "phosphateUnit", label: "Phosphate Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }], required: true },
    ],
    resultLabel: "Ca × PO₄ Product",
    resultUnit: "mg²/dL²",
    interpretation: (value) => {
      if (value < 55) return "Target range - low vascular calcification risk";
      if (value < 70) return "Caution zone - risk of vascular calcification";
      return "High risk - immediate intervention needed (phosphate binders, dialysis, calcimimetics)";
    },
    clinicalPearls: [
      "Target: <55 mg²/dL²",
      "High product → metastatic calcification (vessels, soft tissues, heart valves)",
      "Associated with cardiovascular mortality in CKD and dialysis",
      "Management: phosphate binders, dietary restriction, dialysis adequacy, calcimimetics",
    ],
    references: ["KDIGO 2017 Clinical Practice Guideline Update for CKD-MBD"],
  },
  // ============================================================================
  // SYSTEMIC DISEASES & SCORES
  // ============================================================================
  {
    id: "sledai-2k",
    name: "SLEDAI-2K Disease-Activity Score",
    description: "Measures SLE disease activity",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "seizures", label: "Seizures", type: "checkbox" },
      { id: "psychosis", label: "Psychosis", type: "checkbox" },
      { id: "organicBrainSyndrome", label: "Organic Brain Syndrome", type: "checkbox" },
      { id: "visualDisorder", label: "Visual Disorder", type: "checkbox" },
      { id: "cranialNerveDisorder", label: "Cranial Nerve Disorder", type: "checkbox" },
      { id: "lupusHeadache", label: "Lupus Headache", type: "checkbox" },
      { id: "cerebrovasitisAccident", label: "Cerebrovascular Accident", type: "checkbox" },
      { id: "vasculitis", label: "Vasculitis", type: "checkbox" },
      { id: "arthritis", label: "Arthritis", type: "checkbox" },
      { id: "myositis", label: "Myositis", type: "checkbox" },
      { id: "urinaryCasts", label: "Urinary Casts", type: "checkbox" },
      { id: "proteinuria", label: "Proteinuria (>0.5 g/day)", type: "checkbox" },
      { id: "hematuria", label: "Hematuria", type: "checkbox" },
      { id: "pyuria", label: "Pyuria", type: "checkbox" },
      { id: "rash", label: "Rash", type: "checkbox" },
      { id: "alopecia", label: "Alopecia", type: "checkbox" },
      { id: "mucousalUlcers", label: "Mucosal Ulcers", type: "checkbox" },
      { id: "pleuritis", label: "Pleuritis", type: "checkbox" },
      { id: "pericarditis", label: "Pericarditis", type: "checkbox" },
      { id: "lowComplement", label: "Low Complement (C3 or C4)", type: "checkbox" },
      { id: "elevatedDNA", label: "Elevated Anti-DNA Antibodies", type: "checkbox" },
      { id: "fever", label: "Fever (>38°C, non-infectious)", type: "checkbox" },
      { id: "thrombocytopenia", label: "Thrombocytopenia (<100,000/mm³)", type: "checkbox" },
      { id: "leukopenia", label: "Leukopenia (<3,000/mm³)", type: "checkbox" },
    ],
    resultLabel: "SLEDAI-2K Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value === 0) return "Remission - no active disease";
      if (value <= 4) return "Mild disease activity";
      if (value <= 8) return "Moderate disease activity";
      if (value <= 16) return "High disease activity";
      return "Very high disease activity - requires aggressive treatment";
    },
    clinicalPearls: [
      "Measures current SLE disease activity",
      "Useful for monitoring treatment response",
      "Guides immunosuppression intensity",
      "Serial measurements track disease course",
    ],
    references: ["Gladman DD et al. Lupus. 2011;20(5):453-462"],
  },
  {
    id: "slicc-2012",
    name: "SLICC 2012 SLE Classification Criteria",
    description: "Classifies patients as having SLE",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "acuteRash", label: "Acute Cutaneous Lupus (malar, bullous, TEN-like)", type: "checkbox" },
      { id: "chronicRash", label: "Chronic Cutaneous Lupus (DLE, ACLE)", type: "checkbox" },
      { id: "oralUlcers", label: "Oral Ulcers", type: "checkbox" },
      { id: "alopecia", label: "Alopecia", type: "checkbox" },
      { id: "photosensitivity", label: "Photosensitivity", type: "checkbox" },
      { id: "arthritis", label: "Arthritis (≥2 joints)", type: "checkbox" },
      { id: "serositis", label: "Serositis (pleuritis or pericarditis)", type: "checkbox" },
      { id: "renal", label: "Renal (proteinuria >0.5 g/day or cellular casts)", type: "checkbox" },
      { id: "psychosis", label: "Psychosis", type: "checkbox" },
      { id: "seizures", label: "Seizures", type: "checkbox" },
      { id: "hemolytic", label: "Hemolytic Anemia", type: "checkbox" },
      { id: "leukopenia", label: "Leukopenia (<4000/μL)", type: "checkbox" },
      { id: "thrombocytopenia", label: "Thrombocytopenia (<100,000/μL)", type: "checkbox" },
      { id: "ana", label: "ANA (≥1:80)", type: "checkbox" },
      { id: "antiDsDna", label: "Anti-dsDNA Antibodies", type: "checkbox" },
      { id: "antiSmRnp", label: "Anti-Sm or Anti-RNP Antibodies", type: "checkbox" },
      { id: "antiRoSsa", label: "Anti-Ro/SSA Antibodies", type: "checkbox" },
      { id: "antiLaSSb", label: "Anti-La/SSB Antibodies", type: "checkbox" },
      { id: "antiC1q", label: "Anti-C1q Antibodies", type: "checkbox" },
      { id: "directCoombs", label: "Direct Coombs Test (without hemolytic anemia)", type: "checkbox" },
    ],
    resultLabel: "SLICC 2012 Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value >= 4) return "Meets SLICC 2012 SLE classification criteria";
      return "Does not meet SLICC 2012 SLE classification criteria";
    },
    clinicalPearls: [
      "Classification criteria (not diagnostic criteria)",
      "Requires ≥4 points from clinical and immunologic criteria",
      "At least 1 clinical criterion required",
      "Updated from 1997 ACR criteria",
    ],
    references: ["Petri M et al. Arthritis Care Res (Hoboken). 2012;64(8):1246-1255"],
  },
  {
    id: "frail-scale",
    name: "FRAIL Scale",
    description: "Assesses frailty in older adults",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "fatigue", label: "Fatigue", type: "checkbox" },
      { id: "resistance", label: "Resistance (difficulty climbing stairs)", type: "checkbox" },
      { id: "ambulation", label: "Ambulation (difficulty walking)", type: "checkbox" },
      { id: "illness", label: "Illness (>5 diseases)", type: "checkbox" },
      { id: "lossOfWeight", label: "Loss of Weight (>5% in past year)", type: "checkbox" },
    ],
    resultLabel: "FRAIL Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value === 0) return "Not frail";
      if (value === 1) return "Pre-frail";
      if (value >= 2) return "Frail - higher mortality and morbidity risk";
      return "Unable to determine";
    },
    clinicalPearls: [
      "Simple 5-item screening tool",
      "Identifies frail older adults at risk",
      "Guides treatment intensity and goals of care",
      "Useful in transplant candidate evaluation",
    ],
    references: ["Fried LP et al. J Gerontol A Biol Sci Med Sci. 2001;56(3):M146-M156"],
  },
  {
    id: "prisma-7",
    name: "PRISMA-7 Frailty Score",
    description: "Brief frailty screening tool",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "age85", label: "Are you older than 85 years?", type: "checkbox" },
      { id: "male", label: "Are you male?", type: "checkbox" },
      { id: "healthLimitActivities", label: "In general, do you have any health problems that require you to limit your activities?", type: "checkbox" },
      { id: "needHelp", label: "Do you need someone to help you on a regular basis?", type: "checkbox" },
      { id: "healthStayHome", label: "In general, do you have any health problems that require you to stay at home?", type: "checkbox" },
      { id: "socialSupport", label: "If you need help, can you count on someone close to you?", type: "checkbox" },
      { id: "mobilityAid", label: "Do you regularly use a stick, walker or wheelchair to move about?", type: "checkbox" },
    ],
    resultLabel: "PRISMA-7 Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value <= 3) return "Negative screen (0-3) — frailty unlikely";
      if (value >= 4) return "Positive screen (≥4) — further comprehensive geriatric assessment recommended";
      return "Unable to determine";
    },
    clinicalPearls: [
      "PRISMA-7 is a validated 7-item yes/no screening questionnaire for frailty",
      "Both scores of ≥3 and ≥4 are acceptable cut-points; in practice, ≥4 is frequently used",
      "Relies on self-report only — do not judge the respondent's answer",
      "If the respondent hesitates between yes and no, ask them to choose one; if they persist with 'a little' or 'at times', enter 'yes'",
      "Each 'Yes' answer scores 1 point (maximum score = 7)",
      "Quick to administer (~3 minutes), suitable for clinical practice, transplant, and dialysis settings",
      "A positive screen should be followed by a detailed comprehensive geriatric assessment (CGA)",
    ],
    references: [
      "Raîche M, Hébert R, Dubois MF. PRISMA-7: a case-finding tool to identify older adults with moderate to severe disabilities. Arch Gerontol Geriatr. 2008;47(1):9-18",
      "Clegg A et al. Development and validation of an electronic frailty index using routine primary care electronic health record data. Age Ageing. 2016;45(3):353-360",
      "BCGuidelines.ca: Frailty in Older Adults — Early Identification and Management (2017)",
    ],
  },
  {
    id: "curb-65",
    name: "CURB-65 Pneumonia Severity Score",
    description: "Predicts pneumonia severity and mortality",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "confusion", label: "Confusion (new onset)", type: "checkbox" },
      { id: "urineaNitrogen", label: "Urea Nitrogen (BUN)", type: "number", unit: "mg/dL or mmol/L", placeholder: "20", required: true },
      { id: "respiratoryRate", label: "Respiratory Rate", type: "number", unit: "breaths/min", placeholder: "20", required: true },
      { id: "bloodPressureSystolic", label: "Systolic Blood Pressure", type: "number", unit: "mmHg", placeholder: "110", required: true },
      { id: "bloodPressureDiastolic", label: "Diastolic Blood Pressure", type: "number", unit: "mmHg", placeholder: "70", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "65", required: true },
      { id: "bunUnit", label: "BUN / Urea Unit", type: "select", options: [{ value: "BUN (mg/dL)", label: "BUN (mg/dL)" }, { value: "BUN (mmol/L)", label: "BUN (mmol/L)" }, { value: "Urea (mg/dL)", label: "Urea (mg/dL)" }, { value: "Urea (mmol/L)", label: "Urea (mmol/L)" }], required: true },
    ],
    resultLabel: "CURB-65 Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value === 0) return "Low risk (0.7% mortality) - outpatient treatment";
      if (value === 1) return "Low-intermediate risk (2.1% mortality) - consider hospitalization";
      if (value === 2) return "Intermediate risk (9.2% mortality) - hospitalize";
      if (value === 3) return "High risk (14.5% mortality) - hospitalize, consider ICU";
      return "Very high risk (>40% mortality) - ICU admission";
    },
    clinicalPearls: [
      "Guides hospitalization and ICU admission decisions",
      "Simple bedside assessment",
      "Useful in CKD patients with infection",
      "BUN >7 mmol/L (>20 mg/dL) = 1 point",
    ],
    references: ["Lim WS et al. Thorax. 2003;58(5):377-382"],
  },
  {
    id: "roks",
    name: "ROKS (Recurrence Of Kidney Stone) Nomogram",
    description: "Predicts kidney stone recurrence risk",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "45", required: true },
      { id: "bmi", label: "BMI", type: "number", unit: "kg/m²", placeholder: "28", required: true },
      { id: "maleGender", label: "Male Gender", type: "checkbox" },
      { id: "previousStone", label: "Previous Kidney Stone", type: "checkbox" },
      { id: "familyHistory", label: "Family History of Kidney Stones", type: "checkbox" },
    ],
    resultLabel: "Recurrence Risk",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 20) return "Low recurrence risk";
      if (value < 50) return "Moderate recurrence risk";
      return "High recurrence risk - aggressive prevention recommended";
    },
    clinicalPearls: [
      "Predicts 5-year stone recurrence",
      "Guides prevention intensity",
      "Male gender, previous stone, family history increase risk",
      "Obesity increases recurrence risk",
    ],
    references: ["Siener R, Hesse A. Urol Res. 2003;31(3):169-173"],
  },
  // ============================================================================
  // BONE & FRACTURE RISK
  // ============================================================================
  {
    id: "frax-simplified",
    name: "FRAX Fracture Risk Assessment",
    description: "Estimates 10-year probability of major osteoporotic and hip fractures",
    category: "Bone & Fracture Risk",
    inputs: [
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "65", required: true, min: 40, max: 90 },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "weight", label: "Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm", placeholder: "170", required: true },
      { id: "previousFracture", label: "Previous Fragility Fracture", type: "checkbox" },
      { id: "parentHipFracture", label: "Parent with Hip Fracture", type: "checkbox" },
      { id: "currentSmoking", label: "Current Smoking", type: "checkbox" },
      { id: "glucocorticoids", label: "Glucocorticoids (>=5mg/day prednisone >=3 months)", type: "checkbox" },
      { id: "rheumatoidArthritis", label: "Rheumatoid Arthritis", type: "checkbox" },
      { id: "secondaryOsteoporosis", label: "Secondary Osteoporosis (CKD, diabetes, etc.)", type: "checkbox" },
      { id: "alcoholIntake", label: "Alcohol >=3 units/day", type: "checkbox" },
      { id: "bmdTScore", label: "Femoral Neck BMD T-score (if available)", type: "number", placeholder: "-2.5" },
    ],
    resultLabel: "10-Year Major Osteoporotic Fracture Risk",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 10) return "Low fracture risk - lifestyle measures recommended";
      if (value < 20) return "Moderate fracture risk - consider pharmacotherapy";
      return "High fracture risk - pharmacotherapy strongly recommended";
    },
    clinicalPearls: [
      "CKD patients have 2-4x increased fracture risk",
      "FRAX may underestimate risk in CKD (does not account for CKD-MBD)",
      "Consider bone biopsy in CKD 4-5 before bisphosphonates",
      "Glucocorticoid use common in GN patients - increases risk significantly",
      "Post-transplant patients on steroids need fracture risk assessment",
      "For full FRAX calculation, visit: frax.shef.ac.uk",
    ],
    references: [
      "Kanis JA et al. Osteoporos Int. 2008;19(4):385-397",
      "KDIGO 2017 Clinical Practice Guideline Update for CKD-MBD",
      "Naylor KL et al. Am J Kidney Dis. 2014;63(4):612-622",
    ],
  },
  // ============================================================================
  // CONTRAST-INDUCED NEPHROPATHY RISK
  // ============================================================================
  {
    id: "cin-mehran-score",
    name: "Contrast-Associated AKI Risk - Mehran 2 Score (Model 1)",
    description: "Predicts risk of contrast-associated acute kidney injury (CA-AKI) after percutaneous coronary intervention using the updated Mehran 2 pre-procedural risk score (2021)",
    category: "Contrast-Induced Nephropathy",
    inputs: [
      { id: "presentation", label: "Clinical Presentation", type: "select", options: [
        { value: "stable", label: "Asymptomatic / Stable Angina" },
        { value: "unstable", label: "Unstable Angina" },
        { value: "nstemi", label: "NSTEMI" },
        { value: "stemi", label: "STEMI" },
      ], required: true },
      { id: "egfr", label: "eGFR", type: "number", unit: "mL/min/1.73m²", placeholder: "45", required: true },
      { id: "lvef", label: "Left Ventricular Ejection Fraction (LVEF)", type: "number", unit: "%", placeholder: "55", required: true },
      { id: "diabetesType", label: "Diabetes Status", type: "select", options: [
        { value: "none", label: "No Diabetes" },
        { value: "noninsulin", label: "Non-Insulin-Treated Diabetes" },
        { value: "insulin", label: "Insulin-Treated Diabetes" },
      ], required: true },
      { id: "hemoglobin", label: "Hemoglobin", type: "number", unit: "g/dL", placeholder: "12", required: true, unitToggle: { units: ["g/dL", "g/L"], conversionFactor: 10 } },
      { id: "glucose", label: "Basal Glucose", type: "number", unit: "mg/dL", placeholder: "100", required: true, unitToggle: { units: ["mg/dL", "mmol/L"], conversionFactor: 18.0182 } },
      { id: "chf", label: "Congestive Heart Failure on Presentation", type: "select", options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" },
      ] },
      { id: "ageOver75", label: "Age >75 years", type: "select", options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" },
      ] },
    ],
    resultLabel: "Mehran 2 Score",
    resultUnit: "points",
    interpretation: (value, inputs) => {
      let riskCategory = "";
      let cakiRisk = "";
      if (value <= 4) {
        riskCategory = "Low Risk";
        cakiRisk = "~2.3%";
      } else if (value <= 8) {
        riskCategory = "Moderate Risk";
        cakiRisk = "~8.3%";
      } else if (value <= 11) {
        riskCategory = "High Risk";
        cakiRisk = "~16.5%";
      } else {
        riskCategory = "Very High Risk";
        cakiRisk = "~34.9%";
      }
      return `**${riskCategory}**\n\n` +
        `**Risk of CA-AKI:** ${cakiRisk}\n\n` +
        `**Prevention Strategies:**\n` +
        `• IV hydration: 0.9% NaCl at 1-1.5 mL/kg/h for 12h before and after procedure\n` +
        `• Minimize contrast volume (target <3-4 × eGFR in mL)\n` +
        `• Use iso-osmolar or low-osmolar contrast agents\n` +
        `• Hold nephrotoxins (NSAIDs, aminoglycosides) 24-48h before\n` +
        `• Consider holding metformin 48h post-procedure\n` +
        `• Monitor SCr at 48-72h post-procedure\n` +
        `• Optimize hemodynamics and avoid hypotension`;
    },
    clinicalPearls: [
      "Mehran 2 (2021) is the updated version of the original Mehran score (2004), with improved discrimination (C-statistic 0.72-0.84 vs ~0.67)",
      "Model 1 uses only pre-procedural variables, allowing risk assessment BEFORE the procedure",
      "STEMI presentation carries the highest weight (8 points) reflecting hemodynamic instability and urgency",
      "CA-AKI typically occurs 24-72h after contrast exposure, peaks at 3-5 days",
      "Most cases are non-oliguric and reversible within 1-2 weeks",
      "IV hydration remains the most effective preventive measure",
      "N-acetylcysteine (NAC) has NOT shown consistent benefit in recent trials (PRESERVE trial)",
      "Model 2 adds procedural variables (contrast volume, bleeding, no-reflow, complex anatomy) for post-procedural risk refinement",
      "Statins may have a protective effect — continue if patient is already on therapy",
    ],
    references: [
      "Mehran R, et al. A contemporary simple risk score for prediction of contrast-associated acute kidney injury after percutaneous coronary intervention: derivation and validation from an observational registry. Lancet. 2021;398(10315):1974-1983",
      "Mehran R, et al. A simple risk score for prediction of contrast-induced nephropathy after percutaneous coronary intervention. J Am Coll Cardiol. 2004;44(7):1393-1399",
      "Weisbord SD, et al. Outcomes after Angiography with Sodium Bicarbonate and Acetylcysteine. N Engl J Med. 2018;378(7):603-614 (PRESERVE trial)",
      "KDIGO Clinical Practice Guideline for AKI. Kidney Int Suppl. 2012;2:1-138",
    ],
  },
  {
    id: "cin-mehran-original-score",
    name: "Contrast-Induced Nephropathy (CIN) Risk - Original Mehran Score",
    description: "Predicts risk of contrast-induced nephropathy after percutaneous coronary intervention using the original Mehran score (2004)",
    category: "Contrast-Induced Nephropathy",
    inputs: [
      { id: "hypotension", label: "Hypotension (SBP <80 mmHg for ≥1h requiring inotropes or IABP within 24h)", type: "checkbox" },
      { id: "iabp", label: "Intra-aortic balloon pump (IABP) use", type: "checkbox" },
      { id: "chf", label: "Congestive heart failure (NYHA class III-IV or history of pulmonary edema)", type: "checkbox" },
      { id: "ageOver75", label: "Age >75 years", type: "checkbox" },
      { id: "anemia", label: "Anemia (Hct <39% for men, <36% for women)", type: "checkbox" },
      { id: "diabetes", label: "Diabetes mellitus", type: "checkbox" },
      { id: "contrastVolume", label: "Contrast Volume", type: "number", unit: "mL", placeholder: "100", required: true },
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.5", required: true,
        unitToggle: { units: ["mg/dL", "μmol/L"], conversionFactor: 88.4 } },
      { id: "egfr", label: "eGFR (if known, otherwise calculated from SCr)", type: "number", unit: "mL/min/1.73m²", placeholder: "45" },
    ],
    resultLabel: "Mehran Score",
    resultUnit: "points",
    interpretation: (value, inputs) => {
      let riskCategory = "";
      let cinRisk = "";
      let dialysisRisk = "";
      if (value <= 5) {
        riskCategory = "Low Risk";
        cinRisk = "7.5%";
        dialysisRisk = "0.04%";
      } else if (value <= 10) {
        riskCategory = "Moderate Risk";
        cinRisk = "14%";
        dialysisRisk = "0.12%";
      } else if (value <= 15) {
        riskCategory = "High Risk";
        cinRisk = "26.1%";
        dialysisRisk = "1.09%";
      } else {
        riskCategory = "Very High Risk";
        cinRisk = "57.3%";
        dialysisRisk = "12.6%";
      }
      return `**${riskCategory}**\n\n` +
        `**Risk of CIN (SCr rise ≥25% or ≥0.5 mg/dL):** ${cinRisk}\n` +
        `**Risk of requiring dialysis:** ${dialysisRisk}\n\n` +
        `**Prevention Strategies:**\n` +
        `• IV hydration: 0.9% NaCl at 1 mL/kg/h for 12h before and after procedure\n` +
        `• Minimize contrast volume (target <3-4 × eGFR in mL)\n` +
        `• Use iso-osmolar or low-osmolar contrast\n` +
        `• Hold nephrotoxins (NSAIDs, aminoglycosides) 24-48h before\n` +
        `• Consider holding metformin 48h post-procedure\n` +
        `• Monitor SCr at 48-72h post-procedure`;
    },
    clinicalPearls: [
      "Mehran score was developed for PCI patients but is widely applied to other contrast procedures",
      "CIN typically occurs 24-72h after contrast exposure, peaks at 3-5 days",
      "Most cases are non-oliguric and reversible within 1-2 weeks",
      "IV hydration is the most effective preventive measure",
      "N-acetylcysteine (NAC) has NOT shown consistent benefit in recent trials",
      "Contrast volume/eGFR ratio >3-4 significantly increases CIN risk",
      "Consider CO2 angiography or intravascular ultrasound to reduce contrast in high-risk patients",
      "Statins may have protective effect - continue if patient is already on therapy",
      "The newer Mehran 2 Score (2021) uses only pre-procedural variables and has better discriminatory performance",
    ],
    references: [
      "Mehran R et al. J Am Coll Cardiol. 2004;44(7):1393-1399",
      "KDIGO Clinical Practice Guideline for AKI. Kidney Int Suppl. 2012;2:1-138",
      "ACR Manual on Contrast Media, Version 2023",
      "Weisbord SD et al. N Engl J Med. 2018;378(7):603-614 (PRESERVE trial)",
    ],
  },
  // ============================================================================
  // ADDITIONAL GFR EQUATIONS
  // ============================================================================
  {
    id: "lund-malmo-revised",
    name: "Lund-Malmö Revised (LMR)",
    description: "Swedish equation with improved accuracy across GFR, age, and BMI intervals",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "1.0", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "50", required: true, min: 18, max: 120 },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
    ],
    resultLabel: "eGFR (LMR)",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value) => {
      if (value >= 90) return "Normal kidney function (CKD Stage 1)";
      if (value >= 60) return "Mild decrease in kidney function (CKD Stage 2)";
      if (value >= 45) return "Mild to moderate decrease (CKD Stage 3a)";
      if (value >= 30) return "Moderate to severe decrease (CKD Stage 3b)";
      if (value >= 15) return "Severe decrease in kidney function (CKD Stage 4)";
      return "Kidney failure (CKD Stage 5) - Consider dialysis/transplant planning";
    },
    referenceRanges: [
      { label: "Normal (Stage 1)", min: 90, unit: "mL/min/1.73m²", note: "Normal or high GFR" },
      { label: "Mild decrease (Stage 2)", min: 60, max: 89, unit: "mL/min/1.73m²" },
      { label: "Mild-moderate (Stage 3a)", min: 45, max: 59, unit: "mL/min/1.73m²" },
      { label: "Moderate-severe (Stage 3b)", min: 30, max: 44, unit: "mL/min/1.73m²" },
      { label: "Severe (Stage 4)", min: 15, max: 29, unit: "mL/min/1.73m²" },
      { label: "Kidney failure (Stage 5)", max: 14, unit: "mL/min/1.73m²" },
    ],
    clinicalPearls: [
      "Developed and validated in Swedish population",
      "Outperforms MDRD and CKD-EPI across GFR, age, and BMI intervals",
      "Does not include race as a variable",
      "More stable across different patient subgroups",
      "Recommended in Scandinavian countries",
    ],
    references: [
      "Björk J et al. Scand J Clin Lab Invest. 2011;71:232-239",
      "Nyman U et al. Clin Chem Lab Med. 2014;52:815-824",
    ],
  },
  {
    id: "bis1-elderly",
    name: "BIS1 (Berlin Initiative Study)",
    description: "Optimized for elderly patients ≥70 years old",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "1.2", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "75", required: true, min: 70, max: 120 },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
    ],
    resultLabel: "eGFR (BIS1)",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value, inputs) => {
      const age = inputs?.age as number || 70;
      if (age < 70) return "⚠️ BIS1 is designed for patients ≥70 years. Consider using CKD-EPI or FAS equation instead.";
      if (value >= 90) return "Normal kidney function (CKD Stage 1)";
      if (value >= 60) return "Mild decrease in kidney function (CKD Stage 2)";
      if (value >= 45) return "Mild to moderate decrease (CKD Stage 3a)";
      if (value >= 30) return "Moderate to severe decrease (CKD Stage 3b)";
      if (value >= 15) return "Severe decrease in kidney function (CKD Stage 4)";
      return "Kidney failure (CKD Stage 5) - Consider dialysis/transplant planning";
    },
    referenceRanges: [
      { label: "Normal (Stage 1)", min: 90, unit: "mL/min/1.73m²", note: "Normal or high GFR" },
      { label: "Mild decrease (Stage 2)", min: 60, max: 89, unit: "mL/min/1.73m²" },
      { label: "Mild-moderate (Stage 3a)", min: 45, max: 59, unit: "mL/min/1.73m²" },
      { label: "Moderate-severe (Stage 3b)", min: 30, max: 44, unit: "mL/min/1.73m²" },
      { label: "Severe (Stage 4)", min: 15, max: 29, unit: "mL/min/1.73m²" },
      { label: "Kidney failure (Stage 5)", max: 14, unit: "mL/min/1.73m²" },
    ],
    clinicalPearls: [
      "Specifically developed for patients aged 70 years and older",
      "Better accuracy than CKD-EPI in elderly populations",
      "Does not include race as a variable",
      "Not validated in African American populations",
      "Consider using BIS2 (cystatin C-based) for even better accuracy in elderly",
      "May better reflect true GFR decline with aging",
    ],
    references: [
      "Schaeffner ES et al. Ann Intern Med. 2012;157(7):471-481",
      "Koppe L et al. Nephrol Dial Transplant. 2013;28(11):2839-2847",
    ],
  },
  {
    id: "fas-full-age-spectrum",
    name: "FAS (Full Age Spectrum)",
    description: "Works across all ages from children (2+) to elderly without discontinuity",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "1.0", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "45", required: true, min: 2, max: 120 },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
    ],
    resultLabel: "eGFR (FAS)",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value, inputs) => {
      const age = inputs?.age as number || 45;
      let stageInfo = "";
      if (value >= 90) stageInfo = "Normal kidney function (CKD Stage 1)";
      else if (value >= 60) stageInfo = "Mild decrease in kidney function (CKD Stage 2)";
      else if (value >= 45) stageInfo = "Mild to moderate decrease (CKD Stage 3a)";
      else if (value >= 30) stageInfo = "Moderate to severe decrease (CKD Stage 3b)";
      else if (value >= 15) stageInfo = "Severe decrease in kidney function (CKD Stage 4)";
      else stageInfo = "Kidney failure (CKD Stage 5)";
      
      if (age < 18) {
        return stageInfo + "\n\n*Note: For pediatric patients, FAS uses age-specific Q values for more accurate estimation.*";
      }
      return stageInfo;
    },
    referenceRanges: [
      { label: "Normal (Stage 1)", min: 90, unit: "mL/min/1.73m²", note: "Normal or high GFR" },
      { label: "Mild decrease (Stage 2)", min: 60, max: 89, unit: "mL/min/1.73m²" },
      { label: "Mild-moderate (Stage 3a)", min: 45, max: 59, unit: "mL/min/1.73m²" },
      { label: "Moderate-severe (Stage 3b)", min: 30, max: 44, unit: "mL/min/1.73m²" },
      { label: "Severe (Stage 4)", min: 15, max: 29, unit: "mL/min/1.73m²" },
      { label: "Kidney failure (Stage 5)", max: 14, unit: "mL/min/1.73m²" },
    ],
    clinicalPearls: [
      "Single equation valid from age 2 to elderly without discontinuity",
      "Uses population-normalized creatinine (SCr/Q) approach",
      "Does not include race as a variable",
      "Q values represent median creatinine for healthy population at each age/sex",
      "Eliminates the abrupt changes when switching between pediatric and adult equations",
      "Particularly useful for adolescents transitioning to adult care",
      "Age adjustment factor applied for patients ≥40 years",
    ],
    references: [
      "Pottel H et al. Nephrol Dial Transplant. 2016;31(5):798-806",
      "Pottel H et al. Nephrol Dial Transplant. 2017;32(3):497-507",
    ],
  },
  // ============================================================================
  // CRITICAL CARE
  // ============================================================================
  {
    id: "qsofa",
    name: "qSOFA (Quick SOFA)",
    description: "Quick bedside sepsis screening tool using vital signs and mental status",
    category: "Critical Care",
    inputs: [
      { id: "respiratoryRate", label: "Respiratory Rate", type: "number", unit: "breaths/min", placeholder: "18", required: true, min: 0, max: 60 },
      { id: "systolicBP", label: "Systolic Blood Pressure", type: "number", unit: "mmHg", placeholder: "120", required: true, min: 0, max: 300 },
      { id: "gcs", label: "Glasgow Coma Scale (GCS)", type: "number", unit: "points", placeholder: "15", required: true, min: 3, max: 15 },
    ],
    resultLabel: "qSOFA Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value >= 2) return "HIGH RISK - High risk of poor outcome. Escalate care immediately.";
      if (value === 1) return "Intermediate - Monitor closely. qSOFA has low sensitivity.";
      return "Low Score - Does not exclude sepsis. Continue clinical assessment.";
    },
    clinicalPearls: [
      "qSOFA ≥2 indicates high risk for poor outcomes in infection",
      "Should NOT be used alone to exclude sepsis (low sensitivity)",
      "NEWS2 is more sensitive for early sepsis detection",
      "Criteria: RR ≥22, SBP ≤100, GCS <15 (each +1 point)",
      "Useful for rapid bedside assessment outside ICU",
    ],
    references: [
      "Singer M et al. JAMA. 2016;315(8):801-810 (Sepsis-3 definitions)",
      "Seymour CW et al. JAMA. 2016;315(8):762-774",
    ],
  },
  {
    id: "news2",
    name: "NEWS2 (National Early Warning Score 2)",
    description: "Standardized early warning score for detecting clinical deterioration",
    category: "Critical Care",
    inputs: [
      { id: "respiratoryRate", label: "Respiratory Rate", type: "number", unit: "breaths/min", placeholder: "18", required: true, min: 0, max: 60 },
      { id: "spo2", label: "Oxygen Saturation (SpO₂)", type: "number", unit: "%", placeholder: "96", required: true, min: 0, max: 100 },
      { id: "supplementalO2", label: "Supplemental Oxygen", type: "select", options: [{ value: "no", label: "No (Room Air)" }, { value: "yes", label: "Yes (Any O₂)" }], required: true },
      { id: "systolicBP", label: "Systolic Blood Pressure", type: "number", unit: "mmHg", placeholder: "120", required: true, min: 0, max: 300 },
      { id: "heartRate", label: "Heart Rate", type: "number", unit: "beats/min", placeholder: "80", required: true, min: 0, max: 250 },
      { id: "temperature", label: "Temperature", type: "number", unit: "°C", placeholder: "37.0", required: true, min: 30, max: 45, step: 0.1 },
      { id: "consciousness", label: "Consciousness (AVPU)", type: "select", options: [{ value: "A", label: "Alert" }, { value: "C", label: "Confused/New confusion" }, { value: "V", label: "Voice responsive" }, { value: "P", label: "Pain responsive" }, { value: "U", label: "Unresponsive" }], required: true },
    ],
    resultLabel: "NEWS2 Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value >= 7) return "HIGH RISK - Emergency assessment by critical care team. ICU referral likely.";
      if (value >= 5) return "MEDIUM RISK - Urgent review within 30-60 min. Consider sepsis bundle.";
      if (value >= 1) return "Low-Medium Risk - Assess by registered nurse. Consider increased monitoring.";
      return "Low Risk - Continue routine monitoring per ward protocol.";
    },
    clinicalPearls: [
      "NEWS2 ≥5: Medium risk - urgent clinical review within 30-60 min",
      "NEWS2 ≥7: High risk - immediate senior review, ICU assessment",
      "Score of 3 in any single parameter also triggers urgent review",
      "More sensitive than qSOFA for early sepsis detection",
      "In transplant patients: immunosuppression may blunt fever response",
    ],
    references: [
      "Royal College of Physicians. NEWS2 (2017)",
      "NICE NG51: Sepsis recognition, diagnosis and early management (2024)",
    ],
  },
  {
    id: "sofa",
    name: "SOFA (Sequential Organ Failure Assessment)",
    description: "Assesses organ dysfunction in critically ill patients; defines sepsis-3",
    category: "Critical Care",
    inputs: [
      { id: "pao2", label: "PaO₂", type: "number", unit: "mmHg", placeholder: "95", required: true, min: 0 },
      { id: "fio2", label: "FiO₂", type: "number", unit: "%", placeholder: "21", required: true, min: 21, max: 100 },
      { id: "platelets", label: "Platelets", type: "number", unit: "×10⁹/L", placeholder: "200", required: true, min: 0 },
      { id: "bilirubin", label: "Bilirubin", type: "number", unit: "μmol/L or mg/dL", placeholder: "15", required: true, min: 0 },
      { id: "bilirubinUnit", label: "Bilirubin Unit", type: "select", options: [{ value: "μmol/L", label: "μmol/L (SI)" }, { value: "mg/dL", label: "mg/dL (conventional)" }], required: true },
      { id: "map", label: "Mean Arterial Pressure (MAP)", type: "number", unit: "mmHg", placeholder: "80", required: true, min: 0 },
      { id: "vasopressor", label: "Vasopressor Support", type: "select", options: [{ value: "none", label: "None" }, { value: "dopa_low", label: "Dopamine ≤5 or Dobutamine (any)" }, { value: "dopa_mid", label: "Dopamine >5 or Norepi/Epi ≤0.1" }, { value: "dopa_high", label: "Dopamine >15 or Norepi/Epi >0.1" }], required: true },
      { id: "gcs", label: "Glasgow Coma Scale (GCS)", type: "number", unit: "points", placeholder: "15", required: true, min: 3, max: 15 },
      { id: "creatinine", label: "Creatinine", type: "number", unit: "μmol/L or mg/dL", placeholder: "90", required: true, min: 0 },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "μmol/L", label: "μmol/L (SI)" }, { value: "mg/dL", label: "mg/dL (conventional)" }], required: true },
      { id: "urineOutput", label: "Urine Output (24h)", type: "number", unit: "mL/day", placeholder: "2000", required: true, min: 0 },
    ],
    resultLabel: "SOFA Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value >= 11) return "VERY HIGH - Critical organ dysfunction (~50%+ mortality). Maximum support needed.";
      if (value >= 6) return "HIGH - Significant organ dysfunction. ICU-level care required.";
      if (value >= 2) return "MODERATE - Organ dysfunction present. If acute rise ≥2 + infection = sepsis.";
      return "Low - Minimal organ dysfunction. Continue routine assessment.";
    },
    clinicalPearls: [
      "SOFA ≥2 from baseline + suspected infection = Sepsis-3 definition",
      "Each point increase associated with ~7-9% mortality rise",
      "Scores 6 organ systems: respiratory, coagulation, liver, cardiovascular, CNS, renal",
      "Daily SOFA trending useful for prognosis in ICU",
      "Vasopressor doses in μg/kg/min for cardiovascular scoring",
    ],
    references: [
      "Singer M et al. JAMA. 2016;315(8):801-810 (Sepsis-3)",
      "Vincent JL et al. Intensive Care Med. 1996;22(7):707-710",
    ],
  },
  {
    id: "wells-pe",
    name: "Wells Score for Pulmonary Embolism (PE)",
    description: "Clinical prediction rule for estimating probability of PE",
    category: "Critical Care",
    inputs: [
      { id: "dvtSigns", label: "Clinical signs/symptoms of DVT", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+3.0)" }], required: true },
      { id: "peTopDiagnosis", label: "PE is #1 diagnosis or equally likely", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+3.0)" }], required: true },
      { id: "heartRateOver100", label: "Heart rate >100 bpm", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1.5)" }], required: true },
      { id: "immobilization", label: "Immobilization ≥3 days or surgery in past 4 weeks", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1.5)" }], required: true },
      { id: "previousPeDvt", label: "Previous PE or DVT", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1.5)" }], required: true },
      { id: "hemoptysis", label: "Hemoptysis", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1.0)" }], required: true },
      { id: "malignancy", label: "Malignancy (treatment within 6 months or palliative)", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1.0)" }], required: true },
    ],
    resultLabel: "Wells PE Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value > 6) return "HIGH PROBABILITY - >50% risk of PE. Consider immediate anticoagulation and imaging.";
      if (value >= 2) return "MODERATE PROBABILITY - 20-50% risk. D-dimer or imaging recommended.";
      return "LOW PROBABILITY - <10% risk. D-dimer to rule out; if negative, PE unlikely.";
    },
    clinicalPearls: [
      "Traditional interpretation: >6 high, 2-6 moderate, <2 low probability",
      "Simplified (two-tier): >4 PE likely, ≤4 PE unlikely",
      "If PE unlikely + negative D-dimer: PE can be safely ruled out",
      "If PE likely: proceed directly to CT pulmonary angiography",
      "Consider age-adjusted D-dimer cutoff in patients >50 years",
    ],
    references: [
      "Wells PS et al. Ann Intern Med. 2001;135(2):98-107",
      "van Belle A et al. JAMA. 2006;295(2):172-179",
    ],
  },
  {
    id: "wells-dvt",
    name: "Wells Score for Deep Vein Thrombosis (DVT)",
    description: "Clinical prediction rule for estimating probability of DVT",
    category: "Critical Care",
    inputs: [
      { id: "activeCancer", label: "Active cancer (treatment within 6 months or palliative)", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1)" }], required: true },
      { id: "paralysis", label: "Paralysis, paresis, or recent cast of lower extremity", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1)" }], required: true },
      { id: "bedridden", label: "Recently bedridden ≥3 days or major surgery within 12 weeks", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1)" }], required: true },
      { id: "localizedTenderness", label: "Localized tenderness along deep venous system", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1)" }], required: true },
      { id: "entireLegSwollen", label: "Entire leg swollen", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1)" }], required: true },
      { id: "calfSwelling", label: "Calf swelling ≥3 cm compared to asymptomatic leg", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1)" }], required: true },
      { id: "pittingEdema", label: "Pitting edema confined to symptomatic leg", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1)" }], required: true },
      { id: "collateralVeins", label: "Collateral superficial veins (non-varicose)", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1)" }], required: true },
      { id: "previousDvt", label: "Previously documented DVT", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+1)" }], required: true },
      { id: "alternativeDiagnosis", label: "Alternative diagnosis at least as likely as DVT", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (-2)" }], required: true },
    ],
    resultLabel: "Wells DVT Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value >= 3) return "HIGH PROBABILITY - ~75% risk of DVT. Ultrasound recommended.";
      if (value >= 1) return "MODERATE PROBABILITY - ~17% risk. D-dimer or ultrasound recommended.";
      return "LOW PROBABILITY - ~3% risk. D-dimer to rule out; if negative, DVT unlikely.";
    },
    clinicalPearls: [
      "Score ≥3: High probability (~75% prevalence)",
      "Score 1-2: Moderate probability (~17% prevalence)",
      "Score ≤0: Low probability (~3% prevalence)",
      "If DVT unlikely (≤1) + negative D-dimer: DVT can be safely ruled out",
      "Measure calf circumference 10 cm below tibial tuberosity",
      "Alternative diagnosis (-2 points) is the only negative criterion",
    ],
    references: [
      "Wells PS et al. Lancet. 1997;350(9094):1795-1798",
      "Wells PS et al. N Engl J Med. 2003;349(13):1227-1235",
    ],
  },
  {
    id: "gcs",
    name: "Glasgow Coma Scale (GCS)",
    description: "Standardized neurological assessment for level of consciousness",
    category: "Critical Care",
    inputs: [
      { id: "eyeOpening", label: "Eye Opening", type: "select", options: [
        { value: "4", label: "4 - Spontaneous" },
        { value: "3", label: "3 - To verbal command" },
        { value: "2", label: "2 - To pain" },
        { value: "1", label: "1 - No response" },
      ], required: true },
      { id: "verbalResponse", label: "Verbal Response", type: "select", options: [
        { value: "5", label: "5 - Oriented" },
        { value: "4", label: "4 - Confused" },
        { value: "3", label: "3 - Inappropriate words" },
        { value: "2", label: "2 - Incomprehensible sounds" },
        { value: "1", label: "1 - No response" },
      ], required: true },
      { id: "motorResponse", label: "Motor Response", type: "select", options: [
        { value: "6", label: "6 - Obeys commands" },
        { value: "5", label: "5 - Localizes pain" },
        { value: "4", label: "4 - Withdraws from pain" },
        { value: "3", label: "3 - Abnormal flexion (decorticate)" },
        { value: "2", label: "2 - Extension (decerebrate)" },
        { value: "1", label: "1 - No response" },
      ], required: true },
    ],
    resultLabel: "GCS Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value <= 8) return "SEVERE - Coma. Intubation usually indicated for airway protection.";
      if (value <= 12) return "MODERATE - Significant impairment. Close monitoring required.";
      return "MILD - Minor impairment (13-15). Continue neurological monitoring.";
    },
    clinicalPearls: [
      "GCS 3-8: Severe brain injury - consider intubation for airway protection",
      "GCS 9-12: Moderate brain injury",
      "GCS 13-15: Mild brain injury",
      "Report as E_V_M_ (e.g., E4V5M6 = 15) for component detail",
      "Motor score is most predictive of outcome",
      "Cannot assess verbal in intubated patients - use GCS-E+M or note 'T'",
    ],
    references: [
      "Teasdale G, Jennett B. Lancet. 1974;2(7872):81-84",
      "Teasdale G et al. J Neurosurg. 2014;120(6):1241-1249",
    ],
  },
  {
    id: "pesi",
    name: "PESI (Pulmonary Embolism Severity Index)",
    description: "Risk stratification for 30-day mortality in confirmed PE",
    category: "Critical Care",
    inputs: [
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "65", required: true, min: 0, max: 120 },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "female", label: "Female" }, { value: "male", label: "Male (+10)" }], required: true },
      { id: "cancer", label: "Cancer (active or within 6 months)", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+30)" }], required: true },
      { id: "heartFailure", label: "Heart failure (history)", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+10)" }], required: true },
      { id: "chronicLungDisease", label: "Chronic lung disease", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+10)" }], required: true },
      { id: "pulse", label: "Pulse ≥110/min", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+20)" }], required: true },
      { id: "systolicBPLow", label: "Systolic BP <100 mmHg", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+30)" }], required: true },
      { id: "respiratoryRateHigh", label: "Respiratory rate ≥30/min", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+20)" }], required: true },
      { id: "tempLow", label: "Temperature <36°C", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+20)" }], required: true },
      { id: "alteredMentalStatus", label: "Altered mental status (disorientation, lethargy, stupor, coma)", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+60)" }], required: true },
      { id: "spo2Low", label: "Arterial oxygen saturation <90%", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (+20)" }], required: true },
    ],
    resultLabel: "PESI Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value > 125) return "CLASS V (Very High Risk) - 10-25% 30-day mortality. ICU admission recommended.";
      if (value > 105) return "CLASS IV (High Risk) - 4-11% 30-day mortality. Inpatient treatment required.";
      if (value > 85) return "CLASS III (Intermediate Risk) - 3-7% 30-day mortality. Consider inpatient care.";
      if (value > 65) return "CLASS II (Low Risk) - 1.7-3.5% 30-day mortality. Consider early discharge.";
      return "CLASS I (Very Low Risk) - 0-1.6% 30-day mortality. Outpatient treatment may be appropriate.";
    },
    clinicalPearls: [
      "PESI is used AFTER PE is confirmed (not for diagnosis)",
      "Class I-II: Consider outpatient treatment if no contraindications",
      "Class III-V: Inpatient treatment recommended",
      "sPESI (simplified) uses 6 variables with equal weighting",
      "Age contributes directly to score (1 point per year)",
      "Combine with troponin/BNP and RV function for risk assessment",
    ],
    references: [
      "Aujesky D et al. Am J Respir Crit Care Med. 2005;172(8):1041-1046",
      "Jiménez D et al. Arch Intern Med. 2010;170(15):1383-1389",
    ],
  },
  {
    id: "apache2",
    name: "APACHE II Score",
    description: "ICU mortality prediction based on acute physiology and chronic health",
    category: "Critical Care",
    inputs: [
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "55", required: true, min: 0, max: 120 },
      { id: "temperature", label: "Temperature (highest in 24h)", type: "number", unit: "°C", placeholder: "37.5", required: true, min: 25, max: 45, step: 0.1 },
      { id: "map", label: "Mean Arterial Pressure", type: "number", unit: "mmHg", placeholder: "80", required: true, min: 0, max: 200 },
      { id: "heartRate", label: "Heart Rate (highest in 24h)", type: "number", unit: "beats/min", placeholder: "85", required: true, min: 0, max: 250 },
      { id: "respiratoryRate", label: "Respiratory Rate (highest in 24h)", type: "number", unit: "breaths/min", placeholder: "18", required: true, min: 0, max: 60 },
      { id: "fio2", label: "FiO₂", type: "number", unit: "%", placeholder: "21", required: true, min: 21, max: 100 },
      { id: "pao2", label: "PaO₂ (if FiO₂ <50%)", type: "number", unit: "mmHg", placeholder: "95", required: false, min: 0 },
      { id: "aaGradient", label: "A-a Gradient (if FiO₂ ≥50%)", type: "number", unit: "mmHg", placeholder: "100", required: false, min: 0 },
      { id: "arterialPH", label: "Arterial pH", type: "number", unit: "", placeholder: "7.40", required: true, min: 6.5, max: 8.0, step: 0.01 },
      { id: "sodium", label: "Serum Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true, min: 100, max: 200 },
      { id: "potassium", label: "Serum Potassium", type: "number", unit: "mEq/L", placeholder: "4.0", required: true, min: 1, max: 10, step: 0.1 },
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true, min: 0, max: 20, step: 0.1 },
      { id: "acuteRenalFailure", label: "Acute Renal Failure", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes (doubles creatinine points)" }], required: true },
      { id: "hematocrit", label: "Hematocrit", type: "number", unit: "%", placeholder: "40", required: true, min: 0, max: 70 },
      { id: "wbc", label: "White Blood Count", type: "number", unit: "×10³/μL", placeholder: "10", required: true, min: 0, max: 100, step: 0.1 },
      { id: "gcs", label: "Glasgow Coma Scale", type: "number", unit: "points", placeholder: "15", required: true, min: 3, max: 15 },
      { id: "chronicHealth", label: "Chronic Health Status", type: "select", options: [
        { value: "none", label: "No severe organ insufficiency" },
        { value: "elective", label: "Elective postop with severe organ insufficiency (+2)" },
        { value: "emergency", label: "Emergency/nonoperative with severe organ insufficiency (+5)" },
      ], required: true },
    ],
    resultLabel: "APACHE II Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value >= 35) return "VERY HIGH RISK - ~85% predicted mortality. Maximum ICU support indicated.";
      if (value >= 25) return "HIGH RISK - ~55% predicted mortality. Aggressive ICU management needed.";
      if (value >= 15) return "MODERATE RISK - ~25% predicted mortality. Close ICU monitoring.";
      if (value >= 10) return "LOW-MODERATE RISK - ~15% predicted mortality.";
      return "LOW RISK - <10% predicted mortality. Continue standard ICU care.";
    },
    clinicalPearls: [
      "Use worst values in first 24 hours of ICU admission",
      "Score range 0-71; higher = worse prognosis",
      "Chronic health points: severe organ insufficiency or immunocompromised",
      "Severe organ insufficiency: cirrhosis, NYHA IV, dialysis, immunosuppression",
      "Does not account for admission diagnosis - use disease-specific coefficients",
      "APACHE IV is newer but APACHE II remains widely used",
    ],
    references: [
      "Knaus WA et al. Crit Care Med. 1985;13(10):818-829",
      "Zimmerman JE et al. Crit Care Med. 2006;34(5):1297-1310",
    ],
  },
  {
    id: "sirs",
    name: "SIRS Criteria",
    description: "Systemic Inflammatory Response Syndrome criteria for sepsis screening",
    category: "Critical Care",
    inputs: [
      { id: "temperature", label: "Temperature", type: "select", options: [
        { value: "normal", label: "36.0-38.0 C (96.8-100.4 F) - Normal" },
        { value: "abnormal", label: ">38 C (>100.4 F) or <36 C (<96.8 F) (+1)" },
      ], required: true },
      { id: "heartRate", label: "Heart Rate", type: "select", options: [
        { value: "normal", label: "<=90 beats/min - Normal" },
        { value: "abnormal", label: ">90 beats/min (+1)" },
      ], required: true },
      { id: "respiratoryRate", label: "Respiratory Rate or PaCO2", type: "select", options: [
        { value: "normal", label: "RR <=20 and PaCO2 >=32 mmHg - Normal" },
        { value: "abnormal", label: "RR >20 or PaCO2 <32 mmHg (+1)" },
      ], required: true },
      { id: "wbc", label: "White Blood Cell Count", type: "select", options: [
        { value: "normal", label: "4,000-12,000/mm3 with <10% bands - Normal" },
        { value: "abnormal", label: ">12,000 or <4,000/mm3 or >10% bands (+1)" },
      ], required: true },
    ],
    resultLabel: "SIRS Criteria Met",
    resultUnit: "of 4",
    interpretation: (value) => {
      if (value >= 2) return "SIRS POSITIVE - >=2 criteria met. If infection suspected, consider sepsis. Evaluate for source and initiate workup.";
      return "SIRS NEGATIVE - <2 criteria met. SIRS not present, but does not rule out infection.";
    },
    clinicalPearls: [
      "SIRS >=2 criteria + suspected infection = Sepsis (Sepsis-1 definition)",
      "SIRS is sensitive but not specific for sepsis",
      "qSOFA and SOFA are now preferred for sepsis diagnosis (Sepsis-3)",
      "SIRS remains useful for early warning and triage",
      "Many non-infectious conditions cause SIRS (trauma, burns, pancreatitis)",
      "Absence of SIRS does not exclude sepsis - clinical judgment essential",
    ],
    references: [
      "Bone RC et al. Chest. 1992;101(6):1644-1655",
      "American College of Chest Physicians/Society of Critical Care Medicine Consensus Conference. Crit Care Med. 1992;20(6):864-874",
    ],
  },
  {
    id: "genevaRevised",
    name: "Revised Geneva Score",
    description: "Clinical prediction rule for pulmonary embolism probability",
    category: "Critical Care",
    inputs: [
      { id: "age", label: "Age >65 years", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+1)" },
      ], required: true },
      { id: "previousPeDvt", label: "Previous PE or DVT", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+3)" },
      ], required: true },
      { id: "surgery", label: "Surgery or fracture within 1 month", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+2)" },
      ], required: true },
      { id: "malignancy", label: "Active malignancy (or cured <1 year)", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+2)" },
      ], required: true },
      { id: "unilateralPain", label: "Unilateral lower limb pain", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+3)" },
      ], required: true },
      { id: "hemoptysis", label: "Hemoptysis", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+2)" },
      ], required: true },
      { id: "heartRate", label: "Heart Rate", type: "select", options: [
        { value: "normal", label: "<75 bpm (0)" },
        { value: "moderate", label: "75-94 bpm (+3)" },
        { value: "high", label: ">=95 bpm (+5)" },
      ], required: true, default: "normal" },
      { id: "legPainEdema", label: "Pain on deep palpation and unilateral edema", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+4)" },
      ], required: true },
    ],
    resultLabel: "Revised Geneva Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value >= 11) return "HIGH PROBABILITY - PE prevalence ~74%. Proceed directly to CTPA or treatment if CTPA unavailable.";
      if (value >= 4) return "INTERMEDIATE PROBABILITY - PE prevalence ~28%. D-dimer testing recommended; if positive, proceed to CTPA.";
      return "LOW PROBABILITY - PE prevalence ~8%. D-dimer testing; if negative, PE can be safely ruled out.";
    },
    clinicalPearls: [
      "Three-tier interpretation: 0-3 low, 4-10 intermediate, >=11 high probability",
      "Two-tier (simplified): 0-5 PE unlikely, >=6 PE likely",
      "Does not include subjective criterion (PE most likely diagnosis)",
      "Can be used with age-adjusted D-dimer (age x 10 if >50 years)",
      "Validated in outpatient and emergency department settings",
      "Similar diagnostic accuracy to Wells score for PE",
    ],
    references: [
      "Le Gal G et al. Ann Intern Med. 2006;144(3):165-171",
      "Klok FA et al. Arch Intern Med. 2008;168(21):2131-2136",
    ],
  },
  {
    id: "hasbled",
    name: "HAS-BLED Score",
    description: "Bleeding risk assessment for patients on anticoagulation",
    category: "Critical Care",
    inputs: [
      { id: "hypertension", label: "Hypertension (uncontrolled, >160 mmHg systolic)", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+1)" },
      ], required: true },
      { id: "renalDisease", label: "Renal disease (dialysis, transplant, Cr >2.26 mg/dL)", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+1)" },
      ], required: true },
      { id: "liverDisease", label: "Liver disease (cirrhosis, bilirubin >2x, AST/ALT >3x)", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+1)" },
      ], required: true },
      { id: "strokeHistory", label: "Stroke history", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+1)" },
      ], required: true },
      { id: "priorBleeding", label: "Prior major bleeding or predisposition", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+1)" },
      ], required: true },
      { id: "labileINR", label: "Labile INR (unstable/high INRs, TTR <60%)", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+1)" },
      ], required: true },
      { id: "age", label: "Age >65 years", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+1)" },
      ], required: true },
      { id: "medications", label: "Medications (antiplatelet agents, NSAIDs)", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+1)" },
      ], required: true },
      { id: "alcoholUse", label: "Alcohol use (≥8 drinks/week)", type: "select", options: [
        { value: "no", label: "No (0)" },
        { value: "yes", label: "Yes (+1)" },
      ], required: true },
    ],
    resultLabel: "HAS-BLED Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value <= 1) return "LOW BLEEDING RISK - Annual major bleeding risk ~1-3%. Anticoagulation generally safe.";
      if (value === 2) return "MODERATE BLEEDING RISK - Annual major bleeding risk ~4%. Consider modifiable risk factors.";
      if (value === 3) return "HIGH BLEEDING RISK - Annual major bleeding risk ~6%. Caution with anticoagulation, address modifiable factors.";
      return "VERY HIGH BLEEDING RISK - Annual major bleeding risk >9%. Carefully weigh risks vs benefits. Consider alternatives.";
    },
    clinicalPearls: [
      "HAS-BLED ≥3 indicates high bleeding risk but is NOT a contraindication to anticoagulation",
      "Focus on modifiable risk factors: hypertension, labile INR, medications, alcohol",
      "Score validated primarily for warfarin; applies to DOACs with some limitations",
      "Use alongside stroke risk scores (CHA₂DS₂-VASc) for shared decision-making",
      "High HAS-BLED should prompt closer monitoring, not necessarily stopping anticoagulation",
      "Mnemonic: Hypertension, Abnormal renal/liver, Stroke, Bleeding, Labile INR, Elderly, Drugs/alcohol",
    ],
    references: [
      "Pisters R et al. Chest. 2010;138(5):1093-1100",
      "Lip GY et al. J Am Coll Cardiol. 2011;57(2):173-180",
    ],
  },
  {
    id: "perc",
    name: "PERC Rule",
    description: "Pulmonary Embolism Rule-out Criteria for low-risk patients",
    category: "Critical Care",
    inputs: [
      { id: "age", label: "Age ≥50 years", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: true },
      { id: "heartRate", label: "Heart rate ≥100 bpm", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: true },
      { id: "oxygenSaturation", label: "SpO₂ <95% on room air", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: true },
      { id: "unilateralLegSwelling", label: "Unilateral leg swelling", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: true },
      { id: "hemoptysis", label: "Hemoptysis", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: true },
      { id: "recentSurgeryTrauma", label: "Recent surgery or trauma (≤4 weeks)", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: true },
      { id: "priorPeDvt", label: "Prior PE or DVT", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: true },
      { id: "hormoneUse", label: "Hormone use (OCP, HRT, or estrogen)", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: true },
    ],
    resultLabel: "PERC Criteria Positive",
    resultUnit: "of 8",
    interpretation: (value) => {
      if (value === 0) return "PERC NEGATIVE - All 8 criteria negative. In low pretest probability patients, PE can be ruled out without D-dimer testing. <2% miss rate.";
      return "PERC POSITIVE - Cannot rule out PE with PERC alone. Proceed with D-dimer testing or further workup based on clinical probability.";
    },
    clinicalPearls: [
      "ONLY apply PERC to LOW pretest probability patients (gestalt <15% or Wells ≤4)",
      "ALL 8 criteria must be negative to rule out PE",
      "If ANY criterion is positive, proceed with D-dimer or imaging",
      "PERC reduces unnecessary D-dimer testing in low-risk patients",
      "Not validated for inpatients or high-risk populations",
      "Sensitivity ~97%, specificity ~22% in appropriate population",
      "Do NOT use PERC in moderate or high pretest probability",
    ],
    references: [
      "Kline JA et al. J Thromb Haemost. 2004;2(8):1247-1255",
      "Kline JA et al. Ann Emerg Med. 2008;52(4):408-415",
      "Singh B et al. JAMA Intern Med. 2013;173(18):1715-1722",
    ],
  },
  {
    id: "anticoagReversal",
    name: "Anticoagulation Reversal Guide",
    description: "Evidence-based reversal strategies for major bleeding",
    category: "Critical Care",
    inputs: [
      { id: "anticoagulant", label: "Anticoagulant", type: "select", options: [
        { value: "warfarin", label: "Warfarin (Coumadin)" },
        { value: "dabigatran", label: "Dabigatran (Pradaxa)" },
        { value: "rivaroxaban", label: "Rivaroxaban (Xarelto)" },
        { value: "apixaban", label: "Apixaban (Eliquis)" },
        { value: "edoxaban", label: "Edoxaban (Savaysa)" },
        { value: "heparin", label: "Unfractionated Heparin" },
        { value: "enoxaparin", label: "LMWH (Enoxaparin/Lovenox)" },
      ], required: true },
      { id: "indication", label: "Indication for Reversal", type: "select", options: [
        { value: "life-threatening", label: "Life-threatening bleeding (ICH, massive GI)" },
        { value: "major", label: "Major bleeding (requiring transfusion)" },
        { value: "urgent-surgery", label: "Urgent surgery (<24 hours)" },
        { value: "elective", label: "Elective procedure planning" },
      ], required: true },
      { id: "renalFunction", label: "Renal Function", type: "select", options: [
        { value: "normal", label: "Normal (CrCl >60 mL/min)" },
        { value: "moderate", label: "Moderate impairment (CrCl 30-60)" },
        { value: "severe", label: "Severe impairment (CrCl <30)" },
        { value: "dialysis", label: "Dialysis-dependent" },
      ], required: true },
      { id: "bleedingSeverity", label: "Bleeding Severity", type: "select", options: [
        { value: "life-threatening", label: "Life-threatening (ICH, hemodynamic instability)" },
        { value: "major", label: "Major (Hgb drop ≥2, transfusion needed)" },
        { value: "minor", label: "Minor (clinically significant but stable)" },
      ], required: true },
      { id: "weight", label: "Patient Weight", type: "number", unit: "kg", placeholder: "70", required: false },
    ],
    resultLabel: "Reversal Strategy",
    resultUnit: "",
    interpretation: () => "See detailed reversal recommendations below.",
    clinicalPearls: [
      "Always hold the anticoagulant and identify/treat the bleeding source",
      "Specific reversal agents preferred over non-specific when available",
      "PCC (4-factor) preferred over FFP for warfarin reversal",
      "Idarucizumab is specific for dabigatran; andexanet for factor Xa inhibitors",
      "Consider timing of last anticoagulant dose when planning reversal",
      "Renal function significantly affects DOAC clearance and reversal strategy",
      "Consult hematology/pharmacy for complex cases",
      "Plan for anticoagulation resumption once bleeding controlled",
    ],
    references: [
      "Tomaselli GF et al. J Am Coll Cardiol. 2020;76(5):594-622",
      "Frontera JA et al. Neurocrit Care. 2016;24(1):6-46",
      "Cuker A et al. Am J Hematol. 2019;94(6):697-709",
      "Levy JH et al. Thromb Haemost. 2016;116(1):13-21",
    ],
  },
  // ============================================================================
  // MISCELLANEOUS
  // ============================================================================
  {
    id: "steroid-conversion",
    name: "Steroid Conversion Calculator",
    description: "Convert between equivalent doses of corticosteroids",
    category: "Miscellaneous",
    inputs: [
      { id: "fromSteroid", label: "From Steroid", type: "select", options: [
        { value: "hydrocortisone", label: "Hydrocortisone (Cortef)" },
        { value: "cortisone", label: "Cortisone" },
        { value: "prednisone", label: "Prednisone" },
        { value: "prednisolone", label: "Prednisolone" },
        { value: "methylprednisolone", label: "Methylprednisolone (Medrol, Solu-Medrol)" },
        { value: "triamcinolone", label: "Triamcinolone (Kenalog)" },
        { value: "dexamethasone", label: "Dexamethasone (Decadron)" },
        { value: "betamethasone", label: "Betamethasone (Celestone)" },
      ], required: true },
      { id: "dose", label: "Dose", type: "number", unit: "mg", placeholder: "40", required: true, min: 0 },
    ],
    resultLabel: "Equivalent Doses",
    resultUnit: "",
    interpretation: () => "See equivalent doses for all corticosteroids below.",
    clinicalPearls: [
      "Equivalencies are based on anti-inflammatory (glucocorticoid) potency",
      "Mineralocorticoid effects vary significantly between steroids",
      "Dexamethasone and betamethasone have NO mineralocorticoid activity",
      "Prednisone is a prodrug converted to prednisolone in the liver",
      "Duration of action: Short (8-12h): hydrocortisone, cortisone; Intermediate (12-36h): prednisone, methylprednisolone; Long (36-54h): dexamethasone",
      "For adrenal insufficiency, hydrocortisone preferred due to physiologic mineralocorticoid activity",
      "High-dose steroids (>20mg prednisone equivalent/day) require stress dosing for procedures",
      "Consider bone protection (calcium, vitamin D, bisphosphonates) for chronic steroid use",
    ],
    references: [
      "Schimmer BP, Funder JW. ACTH, Adrenal Steroids. Goodman & Gilman's Pharmacological Basis of Therapeutics.",
      "Liu D et al. J Allergy Clin Immunol Pract. 2013;1(4):305-316",
      "Buttgereit F et al. Lancet. 2020;396(10252):714-726",
    ],
  },
  {
    id: "plasma-exchange",
    name: "Plasma Exchange (PLEX) Dosing",
    description: "Calculate plasma volume and exchange parameters for plasmapheresis",
    category: "Miscellaneous",
    inputs: [
      { id: "weight", label: "Weight", type: "number", unit: "kg", placeholder: "70", required: true, min: 1 },
      { id: "height", label: "Height", type: "number", unit: "cm", placeholder: "170", required: true, min: 50 },
      { id: "hematocrit", label: "Hematocrit", type: "number", unit: "%", placeholder: "40", required: true, min: 10, max: 70 },
      { id: "sex", label: "Sex", type: "select", options: [
        { value: "M", label: "Male" },
        { value: "F", label: "Female" },
      ], required: true },
      { id: "exchangeVolumes", label: "Plasma Volumes to Exchange", type: "select", options: [
        { value: "1", label: "1.0 PV (standard)" },
        { value: "1.5", label: "1.5 PV (intensive)" },
        { value: "2", label: "2.0 PV (rare)" },
      ], required: true },
      { id: "indication", label: "Indication", type: "select", options: [
        { value: "ttp", label: "TTP/HUS" },
        { value: "gbs", label: "Guillain-Barré Syndrome" },
        { value: "myasthenia", label: "Myasthenia Gravis" },
        { value: "anca", label: "ANCA Vasculitis" },
        { value: "antiGBM", label: "Anti-GBM Disease (Goodpasture)" },
        { value: "cryoglobulinemia", label: "Cryoglobulinemia" },
        { value: "rejection", label: "Antibody-Mediated Rejection" },
        { value: "other", label: "Other" },
      ], required: true },
    ],
    resultLabel: "Plasma Volume",
    resultUnit: "mL",
    interpretation: (value) => {
      if (value < 2000) return "Low plasma volume. Verify patient parameters.";
      if (value < 3000) return "Typical plasma volume for smaller patients.";
      if (value < 4000) return "Normal plasma volume range.";
      return "High plasma volume. Typical for larger patients.";
    },
    clinicalPearls: [
      "Standard exchange: 1-1.5 plasma volumes per session",
      "Typical course: 5-7 sessions over 10-14 days (varies by indication)",
      "TTP: Daily PLEX until platelet count >150,000 for 2+ days",
      "Guillain-Barré: 5 exchanges over 1-2 weeks",
      "ANCA vasculitis: Consider for severe disease (Cr >5.7 or DAH)",
      "Anti-GBM: Daily PLEX for 14 days or until antibody negative",
      "Replace coagulation factors (FFP) if bleeding risk or TTP",
      "Monitor calcium (citrate anticoagulation causes hypocalcemia)",
      "Administer medications AFTER PLEX when possible (especially IVIg, rituximab)",
      "Rebound antibody production occurs; often combine with immunosuppression",
    ],
    references: [
      "Schwartz J et al. J Clin Apher. 2016;31(3):149-162 (ASFA Guidelines)",
      "Padmanabhan A et al. J Clin Apher. 2019;34(3):171-354",
      "Kaplan AA. UpToDate. Therapeutic apheresis (plasma exchange or cytapheresis): Indications and technology.",
    ],
  },
];
export function getCalculatorsByCategory(category: string): Calculator[] {
  return calculators.filter((calc) => calc.category === category);
}
export function getCategories(): string[] {
  const categories = new Set(calculators.map((calc) => calc.category));
  return Array.from(categories).sort();
}
export function getCalculatorById(id: string): Calculator | undefined {
  return calculators.find((calc) => calc.id === id);
}
