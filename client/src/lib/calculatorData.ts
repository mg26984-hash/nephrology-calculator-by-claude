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
  whenToUse?: string;
  category: string;
  searchTerms?: string[];
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
    searchTerms: ["ckd epi", "ckdepi", "egfr", "gfr", "creatinine clearance", "estimated gfr", "ckd-epi 2021", "epi"],
    description: "Estimated GFR using serum creatinine (most commonly used)",
    whenToUse: "Use for routine eGFR estimation in adults with stable kidney function.",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "45", required: true, min: 18, max: 120 },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "race", label: "Race", type: "select", options: [{ value: "Black", label: "African American" }, { value: "Other", label: "Other" }], required: true },
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
    searchTerms: ["cg", "cockcroft", "gault", "crcl", "creatinine clearance", "drug dosing", "cockroft"],
    description: "Estimates creatinine clearance; still used for drug dosing",
    whenToUse: "Use when drug dosing requires creatinine clearance rather than eGFR.",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "45", required: true },
      { id: "weight", label: "Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
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
    searchTerms: ["schwartz", "pediatric", "children", "kids", "bedside schwartz", "peds egfr", "paediatric"],
    description: "Estimates GFR in children and adolescents",
    whenToUse: "Use to estimate kidney function in children and adolescents under 18.",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "0.5", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm", placeholder: "140", required: true },
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
    name: "Kinetic eGFR (KeGFR)",
    searchTerms: ["kegfr", "kinetic", "acute kidney injury", "aki egfr", "rapidly changing creatinine", "dynamic egfr"],
    description: "Estimates GFR when creatinine is rapidly changing (AKI or recovery)",
    whenToUse: "Use when serum creatinine is acutely rising or falling, such as in AKI or recovery.",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "baselineCreatinine", label: "Baseline (Stable) Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true },
      { id: "creatinine1", label: "First Creatinine (Cr\u2081)", type: "number", unit: "mg/dL", placeholder: "2.0", required: true },
      { id: "creatinine2", label: "Second Creatinine (Cr\u2082)", type: "number", unit: "mg/dL", placeholder: "3.0", required: true },
      { id: "timeInterval", label: "Time Between Cr\u2081 and Cr\u2082", type: "number", unit: "hours", placeholder: "24", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "60", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "isBlack", label: "Black Race", type: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }], required: true },
    ],
    resultLabel: "Kinetic eGFR",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value) => {
      if (value >= 90) return "Normal or near-normal kidney function";
      if (value >= 60) return "Mildly decreased (CKD G2 equivalent)";
      if (value >= 45) return "Mildly to moderately decreased (CKD G3a equivalent)";
      if (value >= 30) return "Moderately to severely decreased (CKD G3b equivalent)";
      if (value >= 15) return "Severely decreased (CKD G4 equivalent)";
      return "Kidney failure (CKD G5 equivalent)";
    },
    clinicalPearls: [
      "Uses 4-variable MDRD for baseline eGFR estimation (matches MDCalc)",
      "Use when creatinine is rapidly changing (AKI, recovery, post-transplant)",
      "Steady-state eGFR underestimates true GFR when creatinine is rising",
      "Baseline creatinine should reflect the patient's stable pre-AKI level",
      "keGFR of 30 mL/min is 90% specific (71% sensitive) for AKI",
    ],
    references: [
      "Chen S. Retooling the creatinine clearance equation to estimate kinetic GFR. Am J Kidney Dis. 2013;62(6):1171-1172",
      "Levey AS et al. A more accurate method to estimate glomerular filtration rate from serum creatinine. Ann Intern Med. 2006;145(4):247-254 (MDRD)",
    ],
  },
  {
    id: "ckd-epi-cystatin-c",
    name: "CKD-EPI Creatinine-Cystatin C Combined",
    searchTerms: ["cystatin", "cystatin c", "combined egfr", "ckd epi cystatin", "cysc"],
    description: "More accurate eGFR using both creatinine and cystatin C",
    whenToUse: "Use when creatinine-based eGFR may be inaccurate, such as in extremes of muscle mass or diet.",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true },
      { id: "cystatinC", label: "Cystatin C", type: "number", unit: "mg/L", placeholder: "0.8", required: true },
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
    searchTerms: ["slope", "decline", "progression", "egfr slope", "rate of decline", "kidney function decline"],
    description: "Calculates rate of kidney function decline over time",
    whenToUse: "Use to assess CKD progression rate and guide referral timing.",
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
    searchTerms: ["kfre", "kidney failure risk", "esrd risk", "dialysis risk", "tangri"],
    description: "Predicts 2 and 5-year probability of kidney failure",
    whenToUse: "Use in CKD stages 3\u20135 to predict risk of needing dialysis or transplant.",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "55", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "eGFR", label: "eGFR", type: "number", unit: "mL/min/1.73m²", placeholder: "35", required: true },
      { id: "acr", label: "Albumin-Creatinine Ratio", type: "number", unit: "mg/mmol", placeholder: "34", required: true, unitToggle: { units: ["mg/mmol", "mg/g", "mg/mg"], conversionFactor: 1 } },
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
    searchTerms: ["fena", "fe na", "fractional sodium", "prerenal", "aki workup"],
    description: "Differentiates prerenal from intrinsic AKI",
    whenToUse: "Use to differentiate prerenal AKI from acute tubular necrosis in oliguric patients.",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "urineNa", label: "Urine Sodium", type: "number", unit: "mEq/L", placeholder: "20", required: true },
      { id: "plasmaCr", label: "Plasma Creatinine", type: "number", unit: "mg/dL", placeholder: "2.0", required: true },
      { id: "plasmaNa", label: "Plasma Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "urineCr", label: "Urine Creatinine", type: "number", unit: "mg/dL", placeholder: "80", required: true },
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
    searchTerms: ["feurea", "fe urea", "fractional urea", "diuretic", "prerenal diuretics"],
    description: "Alternative to FENa, more reliable with diuretic use",
    whenToUse: "Use instead of FENa when the patient is on diuretics.",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "urineUrea", label: "Urine Urea Nitrogen", type: "number", unit: "mg/dL", placeholder: "200", required: true },
      { id: "plasmaCr", label: "Plasma Creatinine", type: "number", unit: "mg/dL", placeholder: "2.0", required: true },
      { id: "plasmaUrea", label: "Plasma Urea Nitrogen", type: "number", unit: "mg/dL", placeholder: "40", required: true },
      { id: "urineCr", label: "Urine Creatinine", type: "number", unit: "mg/dL", placeholder: "80", required: true },
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
    searchTerms: ["ag", "anion gap", "metabolic acidosis", "nagma", "hagma", "gap"],
    description: "First step in metabolic acidosis workup",
    whenToUse: "Use as the first step when evaluating metabolic acidosis.",
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
    searchTerms: ["delta delta", "delta ratio", "mixed acid base", "delta gap"],
    description: "Identifies mixed acid-base disorders",
    whenToUse: "Use to detect a concurrent non-anion-gap metabolic acidosis or metabolic alkalosis.",
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
    searchTerms: ["bun cr", "bun creatinine", "prerenal azotemia", "bun ratio"],
    description: "Differentiates prerenal azotemia from intrinsic renal disease; supports AKI workup",
    whenToUse: "Use to help differentiate prerenal azotemia from intrinsic kidney disease.",
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
    searchTerms: ["osmolar gap", "osmolal", "toxic alcohol", "methanol", "ethylene glycol", "osm gap"],
    description: "Screens for toxic alcohol ingestion",
    whenToUse: "Use when toxic alcohol ingestion (methanol, ethylene glycol) is suspected.",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "measuredOsmolality", label: "Measured Osmolality", type: "number", unit: "mOsm/kg", placeholder: "320", required: true },
      { id: "sodium", label: "Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "glucose", label: "Glucose", type: "number", unit: "mg/dL", placeholder: "100", required: true },
      { id: "bun", label: "BUN / Urea", type: "number", unit: "mg/dL", placeholder: "20", required: true },
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
    searchTerms: ["urine ag", "rta", "renal tubular acidosis", "urine anion", "uag"],
    description: "Differentiates renal vs. GI causes of normal AG acidosis",
    whenToUse: "Use to differentiate renal tubular acidosis from GI bicarbonate losses in non-anion-gap metabolic acidosis.",
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
    searchTerms: ["ttkg", "potassium gradient", "hyperkalemia workup", "hypokalemia workup", "potassium disorder"],
    description: "Helps distinguish renal vs. extrarenal causes of K disorders",
    whenToUse: "Use to assess whether the kidney is appropriately excreting or retaining potassium.",
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
    searchTerms: ["water deficit", "free water", "hypernatremia", "high sodium", "dehydration"],
    description: "Calculates free water needed to correct hypernatremia",
    whenToUse: "Use to calculate the free water deficit when correcting hypernatremia.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "currentNa", label: "Current Serum Sodium", type: "number", unit: "mEq/L", placeholder: "160", required: true },
      { id: "targetNa", label: "Target Serum Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
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
    searchTerms: ["corrected sodium", "corrected na", "hyperglycemia sodium", "dka sodium", "pseudohyponatremia"],
    description: "Adjusts sodium for osmotic effect of hyperglycemia",
    whenToUse: "Use to determine the true sodium level when blood glucose is significantly elevated.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "measuredNa", label: "Measured Serum Sodium", type: "number", unit: "mEq/L", placeholder: "130", required: true },
      { id: "glucose", label: "Serum Glucose", type: "number", unit: "mg/dL", placeholder: "500", required: true },
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
    searchTerms: ["sodium correction", "na correction", "hyponatremia rate", "saline infusion", "ods", "osmotic demyelination"],
    description: "Calculates rate of sodium change with fluid administration",
    whenToUse: "Use to monitor safe sodium correction rate and avoid osmotic demyelination syndrome.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "currentNa", label: "Current Serum Sodium", type: "number", unit: "mEq/L", placeholder: "120", required: true },
      { id: "targetNa", label: "Target Serum Sodium", type: "number", unit: "mEq/L", placeholder: "130", required: true },
      { id: "infusionNa", label: "Infusate Fluid", type: "select", options: [
        { value: "154", label: "0.9% NaCl (NS) — 154 mEq/L" },
        { value: "512", label: "3% NaCl (Hypertonic) — 512 mEq/L" },
        { value: "77", label: "0.45% NaCl (Half NS) — 77 mEq/L" },
        { value: "34", label: "0.2% NaCl — 34 mEq/L" },
        { value: "0", label: "D5W — 0 mEq/L" },
        { value: "130", label: "Ringer's Lactate — 130 mEq/L" },
        { value: "140_pl", label: "Plasma-Lyte 148 — 140 mEq/L" },
        { value: "140_hb", label: "Hemosol B0 — 140 mEq/L" },
      ], required: true, description: "Select the IV fluid to be administered" },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true, description: "TBW = weight × 0.6 (male) or × 0.5 (female)" },
      { id: "correctionHours", label: "Correction Period", type: "number", unit: "hours", placeholder: "24", required: true },
    ],
    resultLabel: "Infusion Rate",
    resultUnit: "mL/hr",
    interpretation: (value, inputs) => {
      const currentNa = Number(inputs?.currentNa) || 0;
      const targetNa = Number(inputs?.targetNa) || 0;
      const correctionHours = Number(inputs?.correctionHours) || 24;
      const weight = Number(inputs?.weight) || 0;
      const tbw = weight * (inputs?.sex === "F" ? 0.5 : 0.6);
      const naChangePerHour = Math.abs(targetNa - currentNa) / correctionHours;
      const naChangeIn24h = naChangePerHour * 24;
      const tbwText = `TBW: ${tbw.toFixed(1)} L`;
      const rateText = `Na correction: ${naChangePerHour.toFixed(1)} mEq/L/hr (${naChangeIn24h.toFixed(1)} mEq/L in 24h) · ${tbwText}`;
      if (naChangeIn24h <= 6) return `${rateText}. Safe correction rate.`;
      if (naChangeIn24h <= 8) return `${rateText}. Acceptable rate — monitor closely.`;
      if (naChangeIn24h <= 10) return `${rateText}. Caution — risk of osmotic demyelination syndrome. Consider slowing correction.`;
      return `${rateText}. Too rapid — high risk of osmotic demyelination. Reduce rate or extend correction period.`;
    },
    clinicalPearls: [
      "TBW estimated as weight × 0.6 (male) or × 0.5 (female); use lower factor for elderly/cachectic patients",
      "Maximum safe rate: 6-8 mEq/L in 24 hours (some guidelines allow up to 10 in first 24h)",
      "Rapid correction risks osmotic demyelination syndrome (ODS)",
      "Chronic hyponatremia (>48h or unknown duration) requires slower correction",
      "Adrogue-Madias formula: ΔNa per 1L infusate = (Infusate Na − Serum Na) / (TBW + 1)",
    ],
    references: ["Adrogue HJ, Madias NE. N Engl J Med. 2000;342(20):1493-1499"],
  },
  {
    id: "sodium-deficit",
    name: "Sodium Deficit in Hyponatremia",
    searchTerms: ["sodium deficit", "na deficit", "hyponatremia replacement", "low sodium"],
    description: "Calculates total sodium needed to correct hyponatremia",
    whenToUse: "Use to estimate the amount of sodium needed to correct symptomatic hyponatremia.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "currentNa", label: "Current Serum Sodium", type: "number", unit: "mEq/L", placeholder: "120", required: true },
      { id: "targetNa", label: "Target Serum Sodium", type: "number", unit: "mEq/L", placeholder: "130", required: true },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
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
    searchTerms: ["corrected calcium", "corrected ca", "albumin calcium", "calcium correction", "hypocalcemia", "low albumin calcium"],
    description: "Adjusts total calcium for hypoalbuminemia",
    whenToUse: "Use to adjust total calcium when serum albumin is low.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "measuredCa", label: "Measured Total Calcium", type: "number", unit: "mg/dL", placeholder: "7.5", required: true },
      { id: "albumin", label: "Serum Albumin", type: "number", unit: "g/dL", placeholder: "2.0", required: true },
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
    searchTerms: ["qtc", "qt interval", "bazett", "long qt", "qt prolongation", "corrected qt"],
    description: "Calculates heart rate-corrected QT interval",
    whenToUse: "Use to screen for QT prolongation before starting QT-prolonging medications.",
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
    searchTerms: ["uacr", "acr", "albumin creatinine ratio", "albuminuria", "microalbuminuria", "macroalbuminuria"],
    description: "Quantifies albuminuria - key CKD marker",
    whenToUse: "Use for CKD screening and staging of albuminuria per KDIGO guidelines.",
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
    searchTerms: ["upcr", "pcr", "protein creatinine ratio", "proteinuria", "nephrotic", "spot urine protein"],
    description: "Quantifies total proteinuria - preferred in nephrotic syndrome",
    whenToUse: "Use to quantify proteinuria, especially when monitoring nephrotic-range protein loss.",
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
    searchTerms: ["acr from pcr", "pcr to acr", "convert pcr", "protein to albumin"],
    description: "Estimates albumin-creatinine ratio from total protein",
    whenToUse: "Use to estimate albumin-creatinine ratio when only total protein-creatinine ratio is available.",
    category: "Proteinuria & Glomerular Disease",
    inputs: [
      { id: "pcr", label: "Urine Protein-Creatinine Ratio", type: "number", unit: "mg/mmol", placeholder: "170", required: true },
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
    searchTerms: ["24 hour", "24 hr", "24h protein", "24-hour", "24hr", "daily protein", "protein excretion", "spot to 24"],
    description: "Converts spot urine PCR/ACR to estimated 24-hour protein excretion",
    whenToUse: "Use to convert spot urine protein ratios to estimated daily protein excretion.",
    category: "Proteinuria & Glomerular Disease",
    inputs: [
      { id: "testType", label: "Test Type", type: "select", options: [{ value: "pcr", label: "Protein/Creatinine Ratio (PCR)" }, { value: "acr", label: "Albumin/Creatinine Ratio (ACR)" }], required: true },
      { id: "inputMode", label: "Input Method", type: "select", options: [{ value: "ratio", label: "I have the ratio value" }, { value: "raw", label: "I have protein/albumin and creatinine values" }], required: true },
      { id: "ratioValue", label: "Ratio Value", type: "number", unit: "mg/mmol", placeholder: "57", required: false },
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
    searchTerms: ["igan", "iga", "iga nephropathy", "berger", "bergers disease", "iga prediction"],
    description: "Predicts 2, 5, and 7-year risk of kidney failure in IgAN",
    whenToUse: "Use after biopsy-confirmed IgA nephropathy to predict kidney failure risk.",
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
    searchTerms: ["ktv", "kt/v", "kt v", "dialysis adequacy", "daugirdas", "hemodialysis dose", "hd adequacy"],
    description: "Measures dialysis dose - most important adequacy parameter",
    whenToUse: "Use to assess hemodialysis adequacy per KDOQI guidelines.",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "preBUN", label: "Pre-Dialysis BUN / Urea", type: "number", unit: "mg/dL", placeholder: "60", required: true },
      { id: "postBUN", label: "Post-Dialysis BUN / Urea", type: "number", unit: "mg/dL", placeholder: "20", required: true },
      { id: "postWeight", label: "Post-Dialysis Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sessionTime", label: "Session Duration", type: "number", unit: "minutes", placeholder: "240", required: true },
      { id: "ultrafiltration", label: "Ultrafiltration Volume", type: "number", unit: "L", placeholder: "3", required: true },
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
    searchTerms: ["tbw", "total body water", "watson", "body water"],
    description: "Estimates total body water for Kt/V calculations",
    whenToUse: "Use to estimate total body water for Kt/V and sodium correction calculations.",
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
    searchTerms: ["hd duration", "session time", "dialysis time", "hd session", "hemodialysis duration"],
    description: "Calculates required session time to achieve target Kt/V based on dialyzer clearance and total body water",
    whenToUse: "Use to calculate the hemodialysis session time needed to reach a target Kt/V.",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "targetKtV", label: "Target Kt/V", type: "number", unit: "ratio", placeholder: "1.4", required: true },
      { id: "dialyzerClearance", label: "Dialyzer Urea Clearance (K)", type: "number", unit: "mL/min", placeholder: "250", required: true },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
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
    searchTerms: ["pd", "peritoneal", "capd", "apd", "pd ktv", "peritoneal dialysis", "pd adequacy"],
    description: "Assesses solute clearance adequacy in CAPD/APD",
    whenToUse: "Use to assess solute clearance adequacy in peritoneal dialysis patients.",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "dailyDialysateUrea", label: "Daily Dialysate Urea", type: "number", unit: "mg/dL", placeholder: "200", required: true },
      { id: "plasmaUrea", label: "Plasma Urea", type: "number", unit: "mg/dL", placeholder: "40", required: true },
      { id: "dialysateVolume", label: "Daily Dialysate Volume", type: "number", unit: "L", placeholder: "8", required: true },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
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
    searchTerms: ["rkf", "residual kidney", "residual function", "residual renal"],
    description: "Quantifies contribution of residual kidney function to clearance",
    whenToUse: "Use to quantify residual kidney function contribution to dialysis adequacy.",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "ureaUrineClearance", label: "Urine Urea Clearance", type: "number", unit: "mL/min", placeholder: "5", required: true },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
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
    searchTerms: ["ektv", "equilibrated", "urea rebound", "ekt/v", "post dialysis rebound"],
    description: "Accounts for post-dialysis urea rebound",
    whenToUse: "Use to account for post-dialysis urea rebound when assessing HD adequacy.",
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
    searchTerms: ["stdktv", "standard ktv", "weekly ktv", "std kt/v", "weekly clearance"],
    description: "Converts intermittent HD dose to continuous equivalent clearance",
    whenToUse: "Use to compare dialysis doses across different modalities and schedules.",
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
    searchTerms: ["urr", "urea reduction", "dialysis adequacy simple"],
    description: "Simplest measure of hemodialysis adequacy",
    whenToUse: "Use as a quick bedside check of hemodialysis adequacy.",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "preBUN", label: "Pre-Dialysis BUN / Urea", type: "number", unit: "mg/dL", placeholder: "60", required: true },
      { id: "postBUN", label: "Post-Dialysis BUN / Urea", type: "number", unit: "mg/dL", placeholder: "20", required: true },
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
    searchTerms: ["iron", "ganzoni", "iron deficiency", "anemia", "iron replacement", "iv iron"],
    description: "Calculates total iron needed to correct anemia",
    whenToUse: "Use to calculate IV iron replacement dose for iron deficiency anemia.",
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
    searchTerms: ["kdpi", "donor profile", "donor quality", "optn", "donor index", "kidney donor"],
    description: "OPTN 2024 Refit formula (8 factors, no race/HCV) - predicts donor kidney quality and graft survival",
    whenToUse: "Use to assess deceased donor kidney quality and guide organ allocation decisions.",
    category: "Transplantation",
    inputs: [
      { id: "donorAge", label: "Donor Age", type: "number", unit: "years", placeholder: "45", required: true },
      { id: "donorHeight", label: "Donor Height", type: "number", unit: "cm", placeholder: "170", required: true },
      { id: "donorWeight", label: "Donor Weight", type: "number", unit: "kg", placeholder: "80", required: true },
      { id: "donorCreatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true },
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
    references: [
      "OPTN Refit KDPI (October 2024). HRSA KDPI Guide, April 2025. https://www.hrsa.gov/sites/default/files/hrsa/optn/kdpi_guide.pdf",
      "OPTN KDPI Mapping Table (2024 reference population), April 2025. https://www.hrsa.gov/sites/default/files/hrsa/optn/kdpi_mapping_table.pdf",
      "Miller J et al. Updating the Kidney Donor Risk Index. Am J Transplant. 2025.",
      "Rao PS et al. A comprehensive risk quantification score for deceased donor kidneys. Transplantation. 2009;88(2):231-236",
    ],
  },
  {
    id: "epts",
    name: "Estimated Post-Transplant Survival (EPTS)",
    searchTerms: ["epts", "post transplant survival", "transplant survival", "recipient survival"],
    description: "Predicts recipient longevity after transplant",
    whenToUse: "Use to estimate recipient longevity benefit and guide organ allocation.",
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
    searchTerms: ["banff", "rejection", "transplant rejection", "biopsy", "allograft", "abmr", "tcmr", "antibody mediated"],
    description: "Banff 2022 Renal Allograft Biopsy Analyzer - Comprehensive diagnostic tool based on updated Banff classification criteria",
    whenToUse: "Use to classify kidney transplant biopsy findings per Banff 2022 criteria.",
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
      // Additional clinical findings for expanded Category 2
      { id: "acuteTMA", label: "Acute Thrombotic Microangiopathy (TMA)", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: false, default: "no" },
      { id: "chronicTMA", label: "Chronic TMA (not transplant glomerulopathy)", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: false, default: "no" },
      { id: "recurrentGN", label: "Recurrent/De Novo Glomerulonephritis", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: false, default: "no" },
      { id: "acuteTubularInjury", label: "Acute Tubular Injury (ATI/ATN)", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: false, default: "no" },
      { id: "priorABMR", label: "Prior Documented AMR or DSA History", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
      ], required: false, default: "no" },
      { id: "ptcBMML", label: "Severe PTC Basement Membrane Multilayering (EM)", type: "select", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
        { value: "not_performed", label: "EM Not Performed" },
      ], required: false, default: "not_performed" },
    ],
    resultLabel: "Banff Classification",
    resultUnit: "category",
    interpretation: (value) => {
      // This will be handled specially in Dashboard.tsx
      return "See detailed classification below";
    },
    clinicalPearls: [
      "•Banff 2022/2023 classification from the Banff Foundation",
      "•Adequate specimen: ≥10 glomeruli + ≥2 arteries",
      "•Marginal specimen: ≥7 glomeruli + ≥1 artery",
      "•Category 2 — AMR spectrum (7 sub-diagnoses):",
      "  Active AMR: active lesions (MVI/v>0/TMA) + antibody interaction (C4d≥2 or MVI≥2) + serologic evidence (DSA+ or C4d≥2)",
      "  Chronic Active AMR: active AMR criteria + chronic lesions (cg>0 excluding chronic TMA, or PTC BMML)",
      "  Chronic (Inactive) AMR: chronic lesions + prior AMR history, no active MVI/TMA",
      "  Probable AMR: active lesions + DSA+ but C4d neg and MVI sum <2",
      "  C4d Without Rejection: C4d≥2 without MVI, v, or TMA",
      "  MVI DSA/C4d-Negative: MVI sum ≥2, DSA neg, C4d neg (exclude recurrent GN)",
      "  C4d with ATI: C4d≥2 + acute tubular injury, no MVI",
      "•Category 3 — Borderline: t≥1 with i=1 OR t=1 with i≥2 (without v)",
      "•Category 4 — TCMR: IA(i≥2,t2) IB(i≥2,t3) IIA(v1) IIB(v2) III(v3)",
      "•Category 5 — IFTA: Grade I (ci/ct=1), Grade II (ci/ct=2), Grade III (ci/ct=3)",
      "•MVI = g + ptc; recurrent GN excludes MVI from AMR criteria",
    ],
    references: [
      "Loupy A et al. Am J Transplant. 2020;20(9):2305-2331",
      "Haas M et al. Am J Transplant. 2018;18(2):293-307",
      "Banff 2022 Classification — Banff Foundation for Allograft Pathology",
      "Mengel M et al. Am J Transplant. 2024;24(4):557-570 — Banff 2022 meeting report",
      "Roufosse C et al. Transplantation. 2018;102(11):1795-1814",
    ],
  },
  // ============================================================================
  // CARDIOVASCULAR RISK
  // ============================================================================
  {
    id: "ascvd-risk",
    name: "ASCVD Risk Calculator (with CKD Considerations)",
    searchTerms: ["ascvd", "cardiovascular risk", "cv risk", "heart risk", "statin", "10 year risk", "cholesterol risk"],
    description: "Estimates 10-year cardiovascular disease risk",
    whenToUse: "Use to estimate 10-year cardiovascular risk in CKD patients for statin and aspirin decisions.",
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
    searchTerms: ["chad", "chads", "chadvasc", "chad vasc", "chadsvasc", "chads2", "cha2ds2", "cha2ds2vasc", "chads vasc", "afib", "af", "atrial fibrillation", "stroke risk", "anticoagulation"],
    description: "Stroke risk stratification in atrial fibrillation",
    whenToUse: "Use to determine if anticoagulation is indicated in patients with atrial fibrillation.",
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
    searchTerms: ["bmi", "body mass", "obesity", "overweight", "underweight", "weight status"],
    description: "Calculates BMI from height and weight",
    whenToUse: "Use to classify weight status and guide nutritional or surgical interventions.",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm", placeholder: "170", required: true },
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
    searchTerms: ["bsa", "body surface area", "dubois", "du bois", "surface area"],
    description: "Calculates body surface area (traditional formula)",
    whenToUse: "Use when drug dosing or clinical parameters require body surface area.",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm", placeholder: "170", required: true },
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
    searchTerms: ["mosteller", "bsa mosteller", "surface area simple"],
    description: "Calculates BSA using simplified Mosteller formula",
    whenToUse: "Use as a simplified alternative for BSA calculation in clinical practice.",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm", placeholder: "170", required: true },
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
    searchTerms: ["ibw", "ideal body weight", "devine", "ideal weight"],
    description: "Calculates ideal body weight for height and sex",
    whenToUse: "Use for weight-based drug dosing and ventilator tidal volume settings.",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "height", label: "Height", type: "number", unit: "cm", placeholder: "170", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
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
    searchTerms: ["lbw", "lean body", "lean weight", "lean mass", "janmahasatian"],
    description: "Estimates lean body mass for drug dosing",
    whenToUse: "Use for drug dosing in obese patients where lean mass is more appropriate.",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm", placeholder: "170", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
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
    searchTerms: ["abw", "adjusted weight", "obese weight", "adjusted body weight", "dosing weight"],
    description: "Calculates adjusted weight for drug dosing in obesity",
    whenToUse: "Use for aminoglycoside and vancomycin dosing in obese patients.",
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
    searchTerms: ["ca pho", "calcium phosphate", "ca x p", "cap", "ckd mbd", "vascular calcification", "mineral bone"],
    description: "Calculates risk of vascular calcification",
    whenToUse: "Use to assess vascular calcification risk in CKD-MBD patients.",
    category: "CKD-Mineral Bone Disease",
    inputs: [
      { id: "calcium", label: "Serum Calcium", type: "number", unit: "mg/dL", placeholder: "9", required: true },
      { id: "phosphate", label: "Serum Phosphate", type: "number", unit: "mg/dL", placeholder: "5", required: true },
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
    searchTerms: ["sledai", "sle", "lupus", "lupus activity", "disease activity"],
    description: "Measures SLE disease activity",
    whenToUse: "Use to quantify SLE disease activity and guide treatment escalation or tapering.",
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
    searchTerms: ["slicc", "sle classification", "lupus criteria", "lupus diagnosis"],
    description: "Classifies patients as having SLE",
    whenToUse: "Use to formally classify whether a patient meets criteria for systemic lupus erythematosus.",
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
    id: "das28-esr",
    name: "DAS28-ESR (Disease Activity Score)",
    searchTerms: ["das28", "das 28", "disease activity score", "rheumatoid arthritis", "ra disease activity", "das28 esr", "ra score"],
    description: "Measures rheumatoid arthritis disease activity using 28 joint counts, ESR, and patient global assessment",
    whenToUse: "Use to measure rheumatoid arthritis disease activity and guide DMARD therapy.",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "tenderJointCount", label: "Tender Joint Count (0–28)", type: "number", unit: "joints", placeholder: "4", required: true, min: 0, max: 28 },
      { id: "swollenJointCount", label: "Swollen Joint Count (0–28)", type: "number", unit: "joints", placeholder: "3", required: true, min: 0, max: 28 },
      { id: "esr", label: "ESR (Erythrocyte Sedimentation Rate)", type: "number", unit: "mm/h", placeholder: "28", required: true, min: 1 },
      { id: "patientGlobalVAS", label: "Patient Global Assessment (VAS 0–100)", type: "number", unit: "mm", placeholder: "40", required: true, min: 0, max: 100 },
    ],
    resultLabel: "DAS28-ESR",
    resultUnit: "",
    interpretation: (value) => {
      if (value < 2.6) return "Remission (DAS28 <2.6). Target achieved per treat-to-target strategy. Continue current DMARD therapy, monitor every 3–6 months. Consider tapering biologics if sustained remission >6 months.";
      if (value < 3.2) return "Low disease activity (DAS28 2.6–3.2). Acceptable alternative target if remission is not achievable. Optimize current DMARD therapy, consider dose adjustment. Monitor every 3–6 months.";
      if (value <= 5.1) return "Moderate disease activity (DAS28 3.2–5.1). Treatment escalation recommended. Consider adding or switching DMARDs (methotrexate, leflunomide, sulfasalazine). If failing conventional DMARDs, consider biologic or targeted synthetic DMARDs (TNF inhibitors, IL-6 inhibitors, JAK inhibitors).";
      return "High disease activity (DAS28 >5.1). Aggressive treatment escalation required. Initiate or switch biologic/targeted synthetic DMARD. Consider short-course glucocorticoid bridging (≤3 months). Reassess in 1–3 months. Screen for extra-articular manifestations (interstitial lung disease, vasculitis, secondary amyloidosis).";
    },
    referenceRanges: [
      { label: "Remission", max: 2.6, unit: "", note: "<2.6" },
      { label: "Low Activity", min: 2.6, max: 3.2, unit: "", note: "2.6–3.2" },
      { label: "Moderate Activity", min: 3.2, max: 5.1, unit: "", note: "3.2–5.1" },
      { label: "High Activity", min: 5.1, unit: "", note: ">5.1" },
    ],
    clinicalPearls: [
      "DAS28-ESR is the most widely used composite measure for RA disease activity in clinical trials and practice",
      "28-joint assessment includes: shoulders, elbows, wrists, MCPs (1–5), PIPs (1–5), and knees bilaterally — excludes hips, ankles, and feet",
      "Patient Global Assessment (VAS): 0 mm = best, 100 mm = worst overall disease activity as perceived by the patient",
      "Treat-to-target: aim for remission (DAS28 <2.6) or low disease activity (<3.2) within 6 months of treatment initiation",
      "A change in DAS28 ≥1.2 is considered a clinically significant improvement (EULAR good response)",
      "DAS28-ESR may overestimate disease activity in patients with elevated ESR from other causes (infections, anemia, obesity)",
      "Renal relevance: RA patients on long-term NSAIDs need CKD screening; amyloid AA nephropathy can occur with prolonged uncontrolled disease; methotrexate requires dose adjustment for eGFR <30",
    ],
    references: [
      "Prevoo ML et al. Arthritis Rheum. 1995;38(1):44-48",
      "Smolen JS et al. Ann Rheum Dis. 2017;76(6):960-977 (EULAR treat-to-target update)",
      "Fransen J, van Riel PL. Clin Exp Rheumatol. 2005;23(5 Suppl 39):S93-99",
    ],
  },
  {
    id: "frail-scale",
    name: "FRAIL Scale",
    searchTerms: ["frail", "frailty", "elderly", "geriatric", "frail scale"],
    description: "Assesses frailty in older adults",
    whenToUse: "Use to screen for frailty in older adults before major interventions or surgery.",
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
    searchTerms: ["prisma", "prisma7", "frailty screening"],
    description: "Brief frailty screening tool",
    whenToUse: "Use as a brief frailty screening tool in community or primary care settings.",
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
    searchTerms: ["curb", "curb65", "curb 65", "pneumonia", "pneumonia severity", "cap"],
    description: "Predicts pneumonia severity and mortality",
    whenToUse: "Use to assess pneumonia severity and decide between outpatient vs. inpatient management.",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "confusion", label: "Confusion (new onset)", type: "checkbox" },
      { id: "urineaNitrogen", label: "Urea Nitrogen (BUN)", type: "number", unit: "mg/dL", placeholder: "20", required: true },
      { id: "respiratoryRate", label: "Respiratory Rate", type: "number", unit: "breaths/min", placeholder: "20", required: true },
      { id: "bloodPressureSystolic", label: "Systolic Blood Pressure", type: "number", unit: "mmHg", placeholder: "110", required: true },
      { id: "bloodPressureDiastolic", label: "Diastolic Blood Pressure", type: "number", unit: "mmHg", placeholder: "70", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "65", required: true },
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
    searchTerms: ["roks", "kidney stone", "stone recurrence", "nephrolithiasis", "renal calculi", "stone risk"],
    description: "Predicts kidney stone recurrence risk",
    whenToUse: "Use after a first kidney stone to estimate recurrence risk and guide preventive therapy.",
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
    searchTerms: ["frax", "fracture risk", "osteoporosis", "bone fracture", "hip fracture", "dexa"],
    description: "Estimates 10-year probability of major osteoporotic and hip fractures",
    whenToUse: "Use to estimate fracture risk and guide osteoporosis treatment decisions.",
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
    searchTerms: ["mehran", "mehran 2", "contrast aki", "ca-aki", "cin", "contrast nephropathy", "pci risk", "contrast risk"],
    description: "Predicts risk of contrast-associated acute kidney injury (CA-AKI) after percutaneous coronary intervention using the updated Mehran 2 pre-procedural risk score (2021)",
    whenToUse: "Use before PCI to stratify contrast-associated AKI risk and guide prevention.",
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
    searchTerms: ["mehran original", "mehran 2004", "cin risk", "contrast induced nephropathy", "original mehran"],
    description: "Predicts risk of contrast-induced nephropathy after percutaneous coronary intervention using the original Mehran score (2004)",
    whenToUse: "Use to estimate contrast-induced nephropathy risk using the original 2004 scoring model.",
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
    searchTerms: ["lmr", "lund malmo", "lund malmö", "swedish egfr", "european egfr"],
    description: "Swedish equation with improved accuracy across GFR, age, and BMI intervals",
    whenToUse: "Use as an alternative eGFR equation with improved accuracy across BMI ranges.",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true },
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
    searchTerms: ["bis1", "bis 1", "berlin initiative", "elderly egfr", "geriatric egfr", "older adults egfr"],
    description: "Optimized for elderly patients ≥70 years old",
    whenToUse: "Use for eGFR estimation in patients aged 70 years and older.",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.2", required: true },
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
    searchTerms: ["fas", "full age spectrum", "all ages egfr", "pediatric adult egfr"],
    description: "Works across all ages from children (2+) to elderly without discontinuity",
    whenToUse: "Use when a single eGFR equation is needed across pediatric and adult age ranges.",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true },
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
    searchTerms: ["qsofa", "quick sofa", "sepsis screening", "sepsis bedside", "q sofa"],
    description: "Quick bedside sepsis screening tool using vital signs and mental status",
    whenToUse: "Use for rapid bedside sepsis screening outside the ICU.",
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
    searchTerms: ["news", "news2", "early warning", "deterioration", "ews", "national early warning"],
    description: "Standardized early warning score for detecting clinical deterioration",
    whenToUse: "Use for standardized clinical deterioration monitoring on general wards.",
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
    searchTerms: ["sofa", "organ failure", "sepsis score", "icu score", "sequential organ"],
    description: "Assesses organ dysfunction in critically ill patients; defines sepsis-3",
    whenToUse: "Use to quantify organ dysfunction severity and define sepsis in ICU patients.",
    category: "Critical Care",
    inputs: [
      { id: "pao2", label: "PaO₂", type: "number", unit: "mmHg", placeholder: "95", required: true, min: 0 },
      { id: "fio2", label: "FiO₂", type: "number", unit: "%", placeholder: "21", required: true, min: 21, max: 100 },
      { id: "platelets", label: "Platelets", type: "number", unit: "×10⁹/L", placeholder: "200", required: true, min: 0 },
      { id: "bilirubin", label: "Bilirubin", type: "number", unit: "mg/dL", placeholder: "15", required: true, min: 0 },
      { id: "map", label: "Mean Arterial Pressure (MAP)", type: "number", unit: "mmHg", placeholder: "80", required: true, min: 0 },
      { id: "vasopressor", label: "Vasopressor Support", type: "select", options: [{ value: "none", label: "None" }, { value: "dopa_low", label: "Dopamine ≤5 or Dobutamine (any)" }, { value: "dopa_mid", label: "Dopamine >5 or Norepi/Epi ≤0.1" }, { value: "dopa_high", label: "Dopamine >15 or Norepi/Epi >0.1" }], required: true },
      { id: "gcs", label: "Glasgow Coma Scale (GCS)", type: "number", unit: "points", placeholder: "15", required: true, min: 3, max: 15 },
      { id: "creatinine", label: "Creatinine", type: "number", unit: "mg/dL", placeholder: "90", required: true, min: 0 },
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
    searchTerms: ["wells pe", "pulmonary embolism", "pe score", "pe risk", "wells criteria pe"],
    description: "Clinical prediction rule for estimating probability of PE",
    whenToUse: "Use to estimate clinical probability of pulmonary embolism before imaging.",
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
    searchTerms: ["wells dvt", "deep vein thrombosis", "dvt score", "dvt risk", "wells criteria dvt"],
    description: "Clinical prediction rule for estimating probability of DVT",
    whenToUse: "Use to estimate clinical probability of deep vein thrombosis before ultrasound.",
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
    searchTerms: ["gcs", "glasgow", "coma scale", "consciousness", "neuro score"],
    description: "Standardized neurological assessment for level of consciousness",
    whenToUse: "Use to assess and communicate level of consciousness in acute neurological injury.",
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
    searchTerms: ["pesi", "pe severity", "pulmonary embolism severity", "pe prognosis"],
    description: "Risk stratification for 30-day mortality in confirmed PE",
    whenToUse: "Use to risk-stratify confirmed pulmonary embolism for outpatient vs. inpatient management.",
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
    searchTerms: ["apache", "apache ii", "apache 2", "icu mortality", "icu severity", "critical care score"],
    description: "ICU mortality prediction based on acute physiology and chronic health",
    whenToUse: "Use to predict ICU mortality and benchmark severity of illness on admission.",
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
    searchTerms: ["sirs", "systemic inflammatory", "inflammatory response", "sepsis criteria"],
    description: "Systemic Inflammatory Response Syndrome criteria for sepsis screening",
    whenToUse: "Use to screen for systemic inflammatory response as part of sepsis evaluation.",
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
    searchTerms: ["geneva", "revised geneva", "pe probability", "pe clinical probability"],
    description: "Clinical prediction rule for pulmonary embolism probability",
    whenToUse: "Use as an alternative to Wells score for PE probability assessment.",
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
    searchTerms: ["hasbled", "has bled", "has-bled", "bleeding risk", "anticoagulation bleeding", "bleed risk"],
    description: "Bleeding risk assessment for patients on anticoagulation",
    whenToUse: "Use to assess bleeding risk before initiating or continuing anticoagulation.",
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
    searchTerms: ["perc", "pe rule out", "pulmonary embolism rule out", "perc rule"],
    description: "Pulmonary Embolism Rule-out Criteria for low-risk patients",
    whenToUse: "Use to safely rule out PE in low-risk patients without further testing.",
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
    searchTerms: ["anticoag reversal", "warfarin reversal", "doac reversal", "inr reversal", "bleeding reversal", "idarucizumab", "andexanet"],
    description: "Evidence-based reversal strategies for major bleeding",
    whenToUse: "Use to determine the appropriate reversal agent and dosing for major bleeding on anticoagulants.",
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
    searchTerms: ["steroid", "steroid conversion", "prednisone", "prednisolone", "methylpred", "dexamethasone", "hydrocortisone", "corticosteroid"],
    description: "Convert between equivalent doses of corticosteroids",
    whenToUse: "Use to convert between equivalent doses when switching corticosteroids.",
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
    searchTerms: ["plex", "plasmapheresis", "plasma exchange", "tpe", "therapeutic plasma exchange"],
    description: "Calculate plasma volume and exchange parameters for plasmapheresis",
    whenToUse: "Use to calculate plasma volume and replacement fluid for therapeutic plasma exchange.",
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
  // ============================================================================
  // RESTORED CALCULATORS (18 previously missing)
  // ============================================================================
  {
    id: "albumin-corrected-ag",
    name: "Albumin-Corrected Anion Gap",
    searchTerms: ["corrected ag", "albumin ag", "albumin corrected anion gap", "adjusted anion gap"],
    description: "Anion gap corrected for hypoalbuminemia (more accurate)",
    whenToUse: "Use when serum albumin is low to get a more accurate anion gap.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "sodium", label: "Serum Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "chloride", label: "Serum Chloride", type: "number", unit: "mEq/L", placeholder: "104", required: true },
      { id: "bicarbonate", label: "Serum Bicarbonate", type: "number", unit: "mEq/L", placeholder: "24", required: true },
      { id: "albumin", label: "Serum Albumin", type: "number", unit: "g/dL", placeholder: "2.5", required: true },
    ],
    resultLabel: "Corrected AG",
    resultUnit: "mEq/L",
    interpretation: (value) => {
      if (value <= 12) return "Normal corrected anion gap (≤12 mEq/L)";
      if (value <= 20) return "Mildly elevated corrected AG — possible early HAGMA";
      return "Elevated corrected AG (>20) — high anion gap metabolic acidosis (HAGMA)";
    },
    referenceRanges: [
      { label: "Normal", min: 4, max: 12, unit: "mEq/L" },
      { label: "Mildly elevated", min: 12, max: 20, unit: "mEq/L" },
      { label: "Elevated", min: 20, unit: "mEq/L", note: "HAGMA" },
    ],
    clinicalPearls: [
      "Correction: AG + 2.5 × (4.0 - albumin) — adds ~2.5 mEq/L per g/dL albumin deficit",
      "Critical in ICU/nephrotic patients where albumin is often low",
      "An uncorrected AG may appear normal despite significant acidosis",
      "Example: AG=10, albumin=2.0 → corrected AG = 10 + 2.5×2 = 15 (HAGMA missed if uncorrected!)",
      "Use corrected AG to calculate delta-delta for mixed acid-base disorders",
    ],
    references: [
      "Figge J et al. Crit Care Med. 1998;26(11):1807-1810",
      "Kraut JA, Madias NE. Clin J Am Soc Nephrol. 2007;2(1):162-174",
    ],
  },
  {
    id: "bicarbonate-deficit",
    name: "Bicarbonate Deficit",
    searchTerms: ["bicarb deficit", "hco3 deficit", "bicarbonate replacement", "bicarb replacement", "sodium bicarbonate"],
    description: "Estimated HCO₃⁻ deficit for metabolic acidosis correction",
    whenToUse: "Use to estimate the bicarbonate dose needed to partially correct severe metabolic acidosis.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true, min: 1 },
      { id: "bicarbonate", label: "Measured Bicarbonate", type: "number", unit: "mEq/L", placeholder: "14", required: true, min: 0, max: 40 },
    ],
    resultLabel: "Bicarbonate Deficit",
    resultUnit: "mEq",
    interpretation: (value) => {
      if (value <= 0) return "No bicarbonate deficit — HCO₃ ≥ 24 mEq/L";
      if (value <= 100) return "Mild deficit — consider oral bicarbonate supplementation";
      if (value <= 300) return "Moderate deficit — IV NaHCO₃ may be needed";
      return "Severe deficit — IV NaHCO₃ required, monitor closely";
    },
    clinicalPearls: [
      "Formula uses 0.5 × weight as bicarbonate distribution volume",
      "In severe acidosis (pH <7.1), distribution volume may approach 1.0 × weight",
      "Replace only 50% of deficit over first 12-24h and reassess",
      "Goal is not to normalize HCO₃ — aim for ~15-18 mEq/L initially",
      "Caution with NaHCO₃: sodium load, volume overload, overshoot alkalosis",
      "Not recommended for lactic acidosis or DKA (treat underlying cause instead)",
    ],
    references: [
      "Adrogué HJ, Madias NE. N Engl J Med. 1998;338(1):26-34",
      "Kraut JA, Madias NE. Nat Rev Nephrol. 2012;8(10):589-601",
    ],
  },
  {
    id: "calculated-osmolality",
    name: "Calculated Serum Osmolality",
    searchTerms: ["osmolality", "serum osm", "calculated osm", "osmolarity"],
    description: "Estimated serum osmolality from sodium, glucose, and BUN",
    whenToUse: "Use to calculate expected serum osmolality and compare with measured values for osmolar gap.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "sodium", label: "Serum Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "glucose", label: "Serum Glucose", type: "number", unit: "mg/dL", placeholder: "100", required: true },
      { id: "bun", label: "BUN / Urea", type: "number", unit: "mg/dL", placeholder: "15", required: true },
    ],
    resultLabel: "Calculated Osmolality",
    resultUnit: "mOsm/kg",
    interpretation: (value) => {
      if (value < 275) return "Low calculated osmolality — hypo-osmolar state";
      if (value <= 295) return "Normal calculated osmolality (275-295 mOsm/kg)";
      return "Elevated calculated osmolality — hyperosmolar state";
    },
    referenceRanges: [
      { label: "Low", max: 275, unit: "mOsm/kg" },
      { label: "Normal", min: 275, max: 295, unit: "mOsm/kg" },
      { label: "High", min: 295, unit: "mOsm/kg" },
    ],
    clinicalPearls: [
      "Formula: 2×Na + Glucose/18 + BUN/2.8",
      "Compare with measured osmolality to calculate osmolal gap",
      "Osmolal gap >10 suggests unmeasured osmoles (methanol, ethylene glycol, etc.)",
      "BUN contributes to measured but not 'effective' osmolality (freely crosses membranes)",
      "Effective osmolality (tonicity) = 2×Na + Glucose/18 (excludes BUN)",
    ],
    references: [
      "Purssell RA et al. BMJ. 2001;322(7289):683",
      "Fazekas AS et al. Eur J Emerg Med. 2013;20(2):100-105",
    ],
  },
  {
    id: "creatinine-clearance-24h",
    name: "Creatinine Clearance (24h Urine)",
    searchTerms: ["24h crcl", "24 hour creatinine", "measured crcl", "24h urine", "urine creatinine clearance"],
    description: "Measured creatinine clearance from 24-hour urine collection",
    whenToUse: "Use when a measured creatinine clearance from 24-hour urine collection is needed.",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "urineCreatinine24h", label: "Urine Creatinine", type: "number", unit: "mg/dL", placeholder: "80", required: true },
      { id: "urineVolume24h", label: "24-Hour Urine Volume", type: "number", unit: "mL", placeholder: "1500", required: true, min: 100 },
      { id: "plasmaCr", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.2", required: true },
    ],
    resultLabel: "CrCl",
    resultUnit: "mL/min",
    interpretation: (value) => {
      if (value >= 90) return "Normal creatinine clearance";
      if (value >= 60) return "Mildly decreased clearance";
      if (value >= 30) return "Moderately decreased clearance";
      if (value >= 15) return "Severely decreased clearance";
      return "Kidney failure range";
    },
    referenceRanges: [
      { label: "Normal", min: 90, max: 140, unit: "mL/min" },
      { label: "Mildly decreased", min: 60, max: 89, unit: "mL/min" },
      { label: "Moderately decreased", min: 30, max: 59, unit: "mL/min" },
      { label: "Severely decreased", min: 15, max: 29, unit: "mL/min" },
      { label: "Kidney failure", max: 15, unit: "mL/min" },
    ],
    clinicalPearls: [
      "Gold standard for GFR measurement (vs estimation equations)",
      "Overestimates true GFR due to tubular creatinine secretion",
      "Verify adequacy: 24h urine creatinine should be 15-20 mg/kg (male) or 10-15 mg/kg (female)",
      "Under-collection is the most common source of error",
      "Useful when eGFR equations are unreliable (extremes of body size, amputees, pregnancy)",
    ],
    references: [
      "Levey AS et al. J Am Soc Nephrol. 1993;4(5):1159-1166",
      "KDIGO CKD Clinical Practice Guideline. Kidney Int Suppl. 2013;3(1):1-150",
    ],
  },
  {
    id: "ekfc-creatinine",
    name: "EKFC (European Kidney Function Consortium)",
    searchTerms: ["ekfc", "european kidney", "european egfr"],
    description: "Advanced full age spectrum eGFR with population-specific Q values and smooth polynomial transitions",
    whenToUse: "Use as an alternative eGFR equation with smooth transitions across all age groups.",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "45", required: true, min: 2, max: 120 },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
    ],
    resultLabel: "eGFR (EKFC)",
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
        return stageInfo + "\n\n*Note: EKFC uses smooth polynomial Q values for pediatric ages, providing continuous transitions.*";
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
      "Modified FAS equation developed by the European Kidney Function Consortium (Pottel et al. 2021)",
      "Valid for ages 2 to 90+ years with smooth polynomial Q values for children/adolescents",
      "Race-free: does not include race as a variable",
      "Uses population-normalized creatinine (SCr/Q) approach with distinct exponents above and below Q",
      "Q values for children (≤25 yr) are calculated via a continuous polynomial rather than lookup tables",
      "Age decline factor of 0.990 per year applied after age 40",
      "Better accuracy than CKD-EPI in European populations and across the full age spectrum",
    ],
    references: [
      "Pottel H, Björk J, Courbebaisse M, et al. Ann Intern Med. 2021;174:183-192",
      "Pottel H, Björk J, Rule AD, et al. N Engl J Med. 2023;388:333-343",
    ],
  },
  {
    id: "electrolyte-free-water-clearance",
    name: "Electrolyte-Free Water Clearance",
    searchTerms: ["efwc", "electrolyte free water", "free water clearance", "hyponatremia workup"],
    description: "EFWC: more accurate than osmolar free water clearance for dysnatremia",
    whenToUse: "Use to assess renal free water handling in hyponatremia or hypernatremia.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "urineOutput", label: "Urine Output", type: "number", unit: "mL/hr", placeholder: "60", required: true, min: 0 },
      { id: "urineNa", label: "Urine Sodium", type: "number", unit: "mEq/L", placeholder: "60", required: true, min: 0 },
      { id: "urineK", label: "Urine Potassium", type: "number", unit: "mEq/L", placeholder: "30", required: true, min: 0 },
      { id: "plasmaNa", label: "Plasma Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true, min: 100 },
    ],
    resultLabel: "Electrolyte-Free Water Clearance",
    resultUnit: "mL/hr",
    interpretation: (value) => {
      if (value > 10) return "Positive EFWC — kidney excreting electrolyte-free water. Expect serum Na to rise if not replaced.";
      if (value > -10) return "Near zero EFWC — no net electrolyte-free water gain or loss.";
      return "Negative EFWC — kidney retaining electrolyte-free water. Expect serum Na to fall.";
    },
    clinicalPearls: [
      "EFWC considers only electrolytes (Na+K) vs plasma Na — ignores urea and glucose",
      "More physiologically accurate than CH₂O for predicting Na changes",
      "Key formula: EFWC = V × [1 - (UNa + UK)/PNa]",
      "If (UNa+UK) > PNa → negative EFWC → hyponatremia worsens",
      "If (UNa+UK) < PNa → positive EFWC → hyponatremia improves",
    ],
    references: [
      "Nguyen MK, Kurtz I. Clin Exp Nephrol. 2005;9(4):272-280",
      "Berl T. J Am Soc Nephrol. 2008;19(6):1076-1078",
    ],
  },
  {
    id: "fe-magnesium",
    name: "Fractional Excretion of Magnesium",
    searchTerms: ["fe mg", "femg", "fractional magnesium", "magnesium wasting", "hypomagnesemia workup"],
    description: "FEMg: differentiates renal vs extrarenal magnesium wasting",
    whenToUse: "Use to differentiate renal magnesium wasting from extrarenal causes of hypomagnesemia.",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "urineMagnesium", label: "Urine Magnesium", type: "number", unit: "mg/dL", placeholder: "4.0", required: true },
      { id: "plasmaMagnesium", label: "Serum Magnesium", type: "number", unit: "mg/dL", placeholder: "1.8", required: true },
      { id: "urineCr", label: "Urine Creatinine", type: "number", unit: "mg/dL", placeholder: "100", required: true },
      { id: "plasmaCr", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true },
    ],
    resultLabel: "FEMg",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 2) return "Low FEMg (<2%) — appropriate renal conservation. Extrarenal magnesium loss (GI, poor intake).";
      if (value <= 4) return "Normal FEMg (2-4%)";
      return "Elevated FEMg (>4%) — renal magnesium wasting. Consider medications, tubular damage, or metabolic causes.";
    },
    referenceRanges: [
      { label: "Low (conservation)", max: 2, unit: "%", note: "Extrarenal loss" },
      { label: "Normal", min: 2, max: 4, unit: "%" },
      { label: "Elevated (renal wasting)", min: 4, unit: "%", note: "Renal cause" },
    ],
    clinicalPearls: [
      "Formula includes 0.7 factor — only 70% of serum Mg is freely filtered",
      "FEMg >4% in hypomagnesemia = renal wasting",
      "Common renal causes: PPIs, diuretics, aminoglycosides, cisplatin, CNIs, amphotericin B",
      "Gitelman/Bartter syndromes cause persistent renal Mg wasting",
      "Low serum Mg causes refractory hypokalemia and hypocalcemia",
    ],
    references: [
      "Elisaf M et al. Miner Electrolyte Metab. 1997;23(2):66-72",
      "Agus ZS. N Engl J Med. 1999;340(15):1177-1187",
    ],
  },
  {
    id: "fe-uric-acid",
    name: "Fractional Excretion of Uric Acid",
    searchTerms: ["feua", "fe uric acid", "fractional uric acid", "uric acid excretion", "gout workup"],
    description: "FEUA: key test for differentiating SIADH from cerebral salt wasting",
    whenToUse: "Use to differentiate SIADH from cerebral salt wasting or assess uric acid handling.",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "urineUricAcid", label: "Urine Uric Acid", type: "number", unit: "mg/dL", placeholder: "20", required: true },
      { id: "plasmaUricAcid", label: "Serum Uric Acid", type: "number", unit: "mg/dL", placeholder: "4.5", required: true },
      { id: "urineCr", label: "Urine Creatinine", type: "number", unit: "mg/dL", placeholder: "100", required: true },
      { id: "plasmaCr", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true },
    ],
    resultLabel: "FEUA",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 4) return "Low FEUA (<4%) — suggests pre-renal state, volume depletion, or uric acid underexcretion";
      if (value <= 11) return "Normal FEUA (4-11%) — normal uric acid handling";
      if (value <= 20) return "Elevated FEUA (>11%) — consistent with SIADH (resolves with correction) or salt wasting";
      return "High FEUA (>20%) — suggests renal salt wasting or medication effect (e.g., losartan)";
    },
    referenceRanges: [
      { label: "Low", max: 4, unit: "%", note: "Pre-renal, volume depletion" },
      { label: "Normal", min: 4, max: 11, unit: "%" },
      { label: "Elevated", min: 11, max: 20, unit: "%", note: "SIADH, CSW" },
      { label: "High", min: 20, unit: "%", note: "Renal wasting" },
    ],
    clinicalPearls: [
      "Key differentiator: FEUA >11% in hyponatremia points to SIADH or CSW",
      "In SIADH, FEUA normalizes (<11%) after volume correction with 3% saline",
      "In CSW, FEUA remains elevated (>11%) even after correction",
      "Collect before saline administration for accurate interpretation",
      "Low uric acid + high FEUA pattern strongly suggests SIADH",
    ],
    references: [
      "Steinhauslin F, Burnier M. Am J Kidney Dis. 1995;25(3):407-410",
      "Maesaka JK et al. Clin J Am Soc Nephrol. 2009;4(7):1218-1226",
    ],
  },
  {
    id: "free-water-clearance",
    name: "Free Water Clearance (CH₂O)",
    searchTerms: ["ch2o", "free water", "free water clearance", "water excretion"],
    description: "Renal free water clearance for assessing water handling",
    whenToUse: "Use to evaluate renal water excretion capacity in dysnatremia workup.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "urineOutput", label: "Urine Output", type: "number", unit: "mL/hr", placeholder: "60", required: true, min: 0 },
      { id: "urineOsm", label: "Urine Osmolality", type: "number", unit: "mOsm/kg", placeholder: "300", required: true, min: 50 },
      { id: "plasmaOsm", label: "Plasma Osmolality", type: "number", unit: "mOsm/kg", placeholder: "285", required: true, min: 200 },
    ],
    resultLabel: "Free Water Clearance",
    resultUnit: "mL/hr",
    interpretation: (value) => {
      if (value > 10) return "Positive CH₂O — kidney excreting free water (dilute urine). Seen in water diuresis, diabetes insipidus.";
      if (value > -10) return "Near zero CH₂O — urine is approximately iso-osmolar to plasma.";
      return "Negative CH₂O — kidney retaining free water (concentrated urine). Normal ADH response or SIADH.";
    },
    clinicalPearls: [
      "Positive CH₂O means the kidney is excreting solute-free water",
      "Negative CH₂O (= free water reabsorption) concentrates urine",
      "Useful in differentiating causes of hypo- and hypernatremia",
      "Electrolyte-free water clearance (EFWC) is more accurate for dysnatremia management",
    ],
    references: [
      "Rose BD, Post TW. Clinical Physiology of Acid-Base and Electrolyte Disorders. 5th ed. McGraw-Hill; 2001.",
      "Halperin ML, Goldstein MB. Fluid, Electrolyte and Acid-Base Physiology. 4th ed.",
    ],
  },
  {
    id: "henderson-hasselbalch",
    name: "Henderson-Hasselbalch Equation",
    searchTerms: ["henderson", "hasselbalch", "ph equation", "acid base equation", "hh equation", "ph calculation"],
    description: "Calculates blood pH from bicarbonate and pCO2",
    whenToUse: "Use to calculate expected pH from known bicarbonate and pCO2 values.",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "bicarbonate", label: "Serum Bicarbonate (HCO3)", type: "number", unit: "mEq/L", placeholder: "24", required: true },
      { id: "pCO2", label: "Arterial pCO2", type: "number", unit: "mmHg", placeholder: "40", required: true },
    ],
    resultLabel: "Calculated pH",
    resultUnit: "",
    interpretation: (value) => {
      if (value <= 0) return "Invalid — check inputs";
      if (value < 7.35) return "Acidemia";
      if (value <= 7.45) return "Normal pH";
      return "Alkalemia";
    },
    clinicalPearls: [
      "Formula: pH = 6.1 + log₁₀([HCO3] / (0.03 × pCO2))",
      "Normal arterial pH: 7.35–7.45",
      "Useful for verifying ABG internal consistency",
      "pKa of carbonic acid = 6.1; CO2 solubility coefficient = 0.03",
    ],
    references: ["Henderson LJ. Am J Physiol. 1908;21:427-448", "Hasselbalch KA. Biochem Z. 1917;78:112-144"],
  },
  {
    id: "kdigo-aki-staging",
    name: "KDIGO AKI Staging",
    searchTerms: ["kdigo", "aki staging", "aki stage", "acute kidney injury stage", "aki criteria", "rifle", "akin", "acute kidney injury classification"],
    description: "Creatinine-based AKI staging per KDIGO 2012 criteria with clinical management guidance",
    whenToUse: "Use to stage AKI severity per KDIGO criteria and guide clinical management.",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "baselineCreatinine", label: "Baseline Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true },
      { id: "currentCreatinine", label: "Current Creatinine", type: "number", unit: "mg/dL", placeholder: "2.5", required: true },
    ],
    resultLabel: "AKI Stage",
    resultUnit: "",
    interpretation: (value) => {
      if (value === 0) return "No AKI — Creatinine <1.5× baseline and absolute increase <0.3 mg/dL within 48h. Continue monitoring if clinical suspicion persists; consider urine output criteria.";
      if (value === 1) return "Stage 1 AKI — SCr 1.5–1.9× baseline OR ≥0.3 mg/dL increase within 48h. Management: identify and treat underlying cause, optimize volume status, avoid nephrotoxins (NSAIDs, aminoglycosides, IV contrast), monitor urine output and SCr every 12–24h. Consider nephrology consult if no clear etiology.";
      if (value === 2) return "Stage 2 AKI — SCr 2.0–2.9× baseline. Management: nephrology consult recommended, aggressive cause-directed therapy, strict I&O monitoring, hold ACEi/ARB, renally adjust all medications, monitor for fluid overload and hyperkalemia. Consider ICU transfer if hemodynamically unstable.";
      return "Stage 3 AKI — SCr ≥3.0× baseline OR absolute SCr ≥4.0 mg/dL with acute rise OR initiation of RRT. Management: urgent nephrology consult, evaluate for RRT indications (refractory hyperkalemia >6.5 mEq/L, metabolic acidosis pH <7.1, fluid overload unresponsive to diuretics, uremic encephalopathy/pericarditis), ICU-level care, daily labs (K⁺, bicarb, phosphate, CBC).";
    },
    referenceRanges: [
      { label: "No AKI", max: 0, unit: "", note: "<1.5× baseline and <0.3 rise" },
      { label: "Stage 1", min: 1, max: 1, unit: "", note: "1.5–1.9× baseline OR ≥0.3 mg/dL rise in 48h" },
      { label: "Stage 2", min: 2, max: 2, unit: "", note: "2.0–2.9× baseline" },
      { label: "Stage 3", min: 3, max: 3, unit: "", note: "≥3.0× baseline OR SCr ≥4.0 mg/dL OR RRT" },
    ],
    clinicalPearls: [
      "KDIGO also uses urine output criteria: Stage 1 (<0.5 mL/kg/h for 6–12h), Stage 2 (<0.5 mL/kg/h for ≥12h), Stage 3 (<0.3 mL/kg/h for ≥24h or anuria ≥12h)",
      "Stage 1 includes ≥0.3 mg/dL absolute rise within 48h — even if ratio is <1.5×",
      "Stage 3 also applies if SCr ≥4.0 mg/dL with an acute rise ≥0.5 mg/dL",
      "If baseline is unknown, estimate by back-calculating from CKD-EPI assuming eGFR 75 mL/min/1.73m²",
      "AKI-to-CKD transition: monitor renal function for 3 months post-AKI; persistent dysfunction = new CKD or CKD progression",
      "Common reversible causes: volume depletion, urinary obstruction, nephrotoxic drugs, sepsis, cardiorenal syndrome",
      "RRT indications (Stage 3): refractory hyperkalemia >6.5 mEq/L, severe metabolic acidosis pH <7.1, fluid overload unresponsive to diuretics, uremic encephalopathy/pericarditis",
    ],
    references: [
      "KDIGO AKI Clinical Practice Guideline. Kidney Int Suppl. 2012;2(1):1-138",
      "Kellum JA et al. Acute kidney injury. Lancet. 2021;398(10302):786-798",
      "Chawla LS et al. Acute kidney disease and renal recovery. Nat Rev Nephrol. 2017;13(4):241-257",
    ],
  },
  {
    id: "mdrd",
    name: "MDRD eGFR (4-Variable)",
    searchTerms: ["mdrd", "mdrd4", "4 variable egfr", "mdrd egfr", "modification of diet"],
    description: "Modification of Diet in Renal Disease study equation for eGFR",
    whenToUse: "Use when CKD-EPI is unavailable or for comparison with historical eGFR values.",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.2", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "55", required: true, min: 18, max: 120 },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "race", label: "Race", type: "select", options: [{ value: "Other", label: "Non-Black" }, { value: "Black", label: "Black" }], required: true },
    ],
    resultLabel: "eGFR",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value) => {
      if (value >= 90) return "Normal or high GFR (G1)";
      if (value >= 60) return "Mildly decreased GFR (G2)";
      if (value >= 45) return "Mildly to moderately decreased (G3a)";
      if (value >= 30) return "Moderately to severely decreased (G3b)";
      if (value >= 15) return "Severely decreased GFR (G4)";
      return "Kidney failure (G5)";
    },
    referenceRanges: [
      { label: "G1", min: 90, unit: "mL/min/1.73m²", note: "Normal or high" },
      { label: "G2", min: 60, max: 89, unit: "mL/min/1.73m²", note: "Mildly decreased" },
      { label: "G3a", min: 45, max: 59, unit: "mL/min/1.73m²" },
      { label: "G3b", min: 30, max: 44, unit: "mL/min/1.73m²" },
      { label: "G4", min: 15, max: 29, unit: "mL/min/1.73m²" },
      { label: "G5", max: 15, unit: "mL/min/1.73m²", note: "Kidney failure" },
    ],
    clinicalPearls: [
      "MDRD is less accurate than CKD-EPI 2021, especially at higher GFR values",
      "Not validated for GFR >60 — tends to underestimate in healthy individuals",
      "Race coefficient is controversial and being phased out",
      "Prefer CKD-EPI 2021 for routine clinical use",
      "Still used in some drug dosing guidelines and older studies",
    ],
    references: [
      "Levey AS et al. Ann Intern Med. 2006;145(4):247-254",
      "KDIGO CKD Clinical Practice Guideline. Kidney Int Suppl. 2013;3(1):1-150",
    ],
  },
  {
    id: "phosphate-repletion",
    name: "Phosphate Repletion Calculator",
    searchTerms: ["phosphate repletion", "phos replacement", "hypophosphatemia", "low phosphate", "phosphorus replacement"],
    description: "Weight-based IV phosphate dosing for hypophosphatemia",
    whenToUse: "Use to calculate IV phosphate replacement dose for symptomatic hypophosphatemia.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "serumPhosphate", label: "Serum Phosphate", type: "number", unit: "mg/dL", placeholder: "1.8", required: true },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true, min: 1 },
    ],
    resultLabel: "IV Phosphate Dose",
    resultUnit: "mmol",
    interpretation: (value) => {
      if (value <= 0) return "Phosphate ≥2.3 mg/dL — repletion likely not needed";
      if (value <= 20) return "Mild hypophosphatemia — consider oral phosphate first";
      if (value <= 40) return "Moderate hypophosphatemia — IV phosphate recommended";
      return "Severe hypophosphatemia — urgent IV phosphate required. Monitor calcium.";
    },
    clinicalPearls: [
      "IV options: Sodium phosphate (Na₃PO₄) or Potassium phosphate (K₃PO₄)",
      "Use K-phos if K+ <4.0; use Na-phos if K+ >4.5",
      "Max IV rate: 7 mmol/hr for peripheral, 15 mmol/hr for central line",
      "Recheck phosphate 2-6h after repletion",
      "Oral repletion: Neutra-Phos 250-500 mg (8-16 mmol) PO TID for mild cases",
      "Caution in renal failure — risk of hyperphosphatemia and metastatic calcification",
    ],
    references: [
      "Brown KA et al. Ann Pharmacother. 2006;40(7-8):1227-1230",
      "Clark CL et al. Ann Pharmacother. 2007;41(10):1646-1651",
    ],
  },
  {
    id: "potassium-repletion",
    name: "Potassium Repletion Estimation",
    searchTerms: ["potassium repletion", "k replacement", "hypokalemia", "low potassium", "kcl dosing", "potassium replacement"],
    description: "Estimates total body potassium deficit and repletion needs",
    whenToUse: "Use to estimate potassium replacement needs in hypokalemia.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "serumPotassium", label: "Serum Potassium", type: "number", unit: "mEq/L", placeholder: "3.2", required: true, min: 1, max: 7 },
      { id: "targetPotassium", label: "Target Potassium", type: "number", unit: "mEq/L", placeholder: "4.0", required: false, min: 3.5, max: 5.0 },
    ],
    resultLabel: "Estimated K⁺ Deficit",
    resultUnit: "mEq",
    interpretation: (value) => {
      if (value <= 0) return "K⁺ at or above target — no repletion needed";
      if (value <= 200) return "Mild deficit (~100-200 mEq) — oral KCl 40-80 mEq should suffice";
      if (value <= 400) return "Moderate deficit (~200-400 mEq) — oral + IV repletion recommended";
      return "Severe deficit (>400 mEq) — aggressive IV repletion needed with cardiac monitoring";
    },
    clinicalPearls: [
      "Rough rule: each 0.27 mEq/L drop ≈ 100 mEq total body deficit",
      "Actual deficit varies widely — may underestimate in chronic depletion",
      "Max IV rate: 10-20 mEq/hr peripherally, 40 mEq/hr centrally (with monitoring)",
      "Max concentration: 40 mEq/L peripheral, 80 mEq/L central",
      "Correct concurrent hypomagnesemia (Mg <1.8) — K repletion will fail otherwise",
      "Recheck K⁺ after each 40-60 mEq given",
      "Oral KCl 40 mEq raises serum K by ~0.3-0.5 mEq/L in most patients",
    ],
    references: [
      "Sterns RH et al. Am J Med. 1981;71(5):811-818",
      "Gennari FJ. N Engl J Med. 1998;339(7):451-458",
    ],
  },
  {
    id: "stool-osmolar-gap",
    name: "Stool Osmolar Gap",
    searchTerms: ["stool osm", "stool osmolar", "diarrhea workup", "secretory diarrhea", "osmotic diarrhea"],
    description: "Differentiates osmotic vs. secretory diarrhea",
    whenToUse: "Use to differentiate osmotic diarrhea from secretory diarrhea.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "stoolNa", label: "Stool Sodium", type: "number", unit: "mEq/L", placeholder: "30", required: true },
      { id: "stoolK", label: "Stool Potassium", type: "number", unit: "mEq/L", placeholder: "60", required: true },
      { id: "stoolOsmolality", label: "Stool Osmolality", type: "number", unit: "mOsm/kg", placeholder: "290" },
    ],
    resultLabel: "Stool Osmolar Gap",
    resultUnit: "mOsm/kg",
    interpretation: (value) => {
      if (value > 125) return "Osmotic diarrhea — poorly absorbed solute (lactulose, Mg, sorbitol)";
      if (value >= 50) return "Mixed pattern — consider both osmotic and secretory causes";
      return "Secretory diarrhea — VIPoma, carcinoid, bile acid malabsorption, laxative abuse";
    },
    clinicalPearls: [
      "Formula: Stool Osmolality − 2 × (Stool Na + Stool K)",
      "Gap > 125: osmotic diarrhea; Gap < 50: secretory diarrhea",
      "Stool osmolality normally ≈ 290 mOsm/kg (isotonic with plasma)",
      "If measured stool osmolality > 350, suspect sample contamination or urine",
    ],
    references: ["Eherer AJ, Fordtran JS. Gastroenterology. 1992;103(2):545-551"],
  },
  {
    id: "trp-tmp-gfr",
    name: "TRP & TmP/GFR (Phosphate)",
    searchTerms: ["trp", "tmp gfr", "tmp/gfr", "tubular reabsorption", "phosphate reabsorption", "phosphate handling"],
    description: "Tubular reabsorption of phosphate and renal phosphate threshold",
    whenToUse: "Use to evaluate renal phosphate handling in hypophosphatemia or hyperphosphatemia workup.",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "urinePhosphate", label: "Urine Phosphate", type: "number", unit: "mg/dL", placeholder: "40", required: true },
      { id: "plasmaPhosphate", label: "Serum Phosphate", type: "number", unit: "mg/dL", placeholder: "3.0", required: true },
      { id: "urineCr", label: "Urine Creatinine", type: "number", unit: "mg/dL", placeholder: "100", required: true },
      { id: "plasmaCr", label: "Serum Creatinine", type: "number", unit: "mg/dL", placeholder: "1.0", required: true },
    ],
    resultLabel: "TmP/GFR",
    resultUnit: "mg/dL",
    interpretation: (value) => {
      if (value < 2.0) return "Low TmP/GFR — renal phosphate wasting. Consider FGF23 excess, Fanconi, hyperparathyroidism.";
      if (value <= 4.4) return "Normal TmP/GFR (2.0-4.4 mg/dL) — appropriate renal phosphate handling.";
      return "High TmP/GFR — reduced phosphate excretion. Seen in hypoparathyroidism, low phosphate intake.";
    },
    referenceRanges: [
      { label: "Low", max: 2.0, unit: "mg/dL", note: "Phosphate wasting" },
      { label: "Normal", min: 2.0, max: 4.4, unit: "mg/dL" },
      { label: "High", min: 4.4, unit: "mg/dL", note: "Reduced excretion" },
    ],
    clinicalPearls: [
      "TRP = 1 - FEPhos; normal TRP is 85-95%",
      "TmP/GFR is the renal phosphate threshold — independent of GFR and phosphate load",
      "Low TmP/GFR: hyperparathyroidism, FGF23-mediated disorders, Fanconi syndrome",
      "High TmP/GFR: hypoparathyroidism, tumor calcinosis, acromegaly",
      "Use fasting morning samples for best accuracy",
    ],
    references: [
      "Walton RJ, Bijvoet OL. Lancet. 1975;2(7929):309-310",
      "Payne RB. Ann Clin Biochem. 1998;35(Pt 2):201-206",
    ],
  },
  {
    id: "urine-osmolal-gap",
    name: "Urine Osmolal Gap",
    searchTerms: ["urine osm gap", "urine osmolal gap", "ammonium excretion", "nh4", "rta workup"],
    description: "Estimates urine ammonium excretion for metabolic acidosis workup",
    whenToUse: "Use to estimate urine ammonium and assess renal acid excretion in metabolic acidosis.",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "measuredUrineOsm", label: "Measured Urine Osmolality", type: "number", unit: "mOsm/kg", placeholder: "500", required: true },
      { id: "urineNa", label: "Urine Sodium", type: "number", unit: "mEq/L", placeholder: "60", required: true },
      { id: "urineK", label: "Urine Potassium", type: "number", unit: "mEq/L", placeholder: "30", required: true },
      { id: "urineUrea", label: "Urine Urea / BUN", type: "number", unit: "mg/dL", placeholder: "500", required: true },
      { id: "urineGlucose", label: "Urine Glucose (optional)", type: "number", unit: "mg/dL", placeholder: "0", required: false },
    ],
    resultLabel: "Urine Osmolal Gap",
    resultUnit: "mOsm/kg",
    interpretation: (value) => {
      if (value < 100) return "Low UOG (<100) — low urine NH₄⁺. Suggests renal cause of acidosis (RTA, CKD).";
      if (value <= 400) return "Normal/elevated UOG (100-400) — appropriate renal NH₄⁺ excretion. GI or extrarenal cause.";
      return "Very high UOG (>400) — very high NH₄⁺ excretion. Appropriate renal response to acid load.";
    },
    referenceRanges: [
      { label: "Low (renal acidosis)", max: 100, unit: "mOsm/kg", note: "RTA or CKD" },
      { label: "Adequate", min: 100, max: 400, unit: "mOsm/kg", note: "Extrarenal cause" },
      { label: "High", min: 400, unit: "mOsm/kg", note: "High NH₄⁺ excretion" },
    ],
    clinicalPearls: [
      "UOG/2 ≈ urine ammonium concentration (each NH₄⁺ paired with an anion)",
      "More reliable than urine anion gap — especially when unmeasured anions present",
      "Low UOG in non-AG acidosis = distal RTA, type 4 RTA, or CKD",
      "High UOG in non-AG acidosis = diarrhea, proximal RTA, or exogenous acid",
      "Calculated Uosm = 2×(UNa+UK) + UUN/2.8 + UGlc/18",
    ],
    references: [
      "Kamel KS, Halperin ML. Clin J Am Soc Nephrol. 2012;7(4):674-678",
      "Batlle D et al. Kidney Int. 2006;70(3):391-406",
    ],
  },
  {
    id: "winters-formula",
    name: "Winters' Formula (Expected pCO2)",
    searchTerms: ["winters", "expected pco2", "respiratory compensation", "metabolic acidosis compensation", "winters formula"],
    description: "Predicts expected respiratory compensation in metabolic acidosis",
    whenToUse: "Use to check if respiratory compensation is appropriate in metabolic acidosis.",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "bicarbonate", label: "Serum Bicarbonate (HCO3)", type: "number", unit: "mEq/L", placeholder: "15", required: true },
      { id: "actualPCO2", label: "Actual pCO2 (for comparison)", type: "number", unit: "mmHg", placeholder: "30" },
    ],
    resultLabel: "Expected pCO2",
    resultUnit: "mmHg",
    interpretation: (value) => {
      if (value <= 0) return "Invalid — check inputs";
      return `Expected pCO2 range: ${(value - 2).toFixed(1)} – ${(value + 2).toFixed(1)} mmHg`;
    },
    clinicalPearls: [
      "Formula: Expected pCO2 = 1.5 × [HCO3] + 8 (± 2)",
      "If actual pCO2 > expected → superimposed respiratory acidosis",
      "If actual pCO2 < expected → superimposed respiratory alkalosis",
      "Only valid in primary metabolic acidosis (not mixed disorders)",
    ],
    references: ["Albert MS, Dell RB, Winters RW. Ann Intern Med. 1967;66(2):312-322"],
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
