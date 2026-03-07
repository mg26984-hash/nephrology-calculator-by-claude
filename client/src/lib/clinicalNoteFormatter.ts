/**
 * Clinical Note Formatter
 * Generates EMR-ready text snippets from calculator results.
 *
 * Example output:
 *   eGFR (CKD-EPI 2021): 34.00 mL/min/1.73m² — CKD Stage 3b
 *   (Cr 1.8 mg/dL, Age 62, Male)
 */

import type { Calculator, CalculatorInput } from "./calculatorData";

/** Short clinical abbreviations for common input labels */
const SHORT_LABELS: Record<string, string> = {
  // Creatinine family
  creatinine: "Cr",
  "serum creatinine": "Cr",
  "serum creatinine (scr)": "Cr",
  "baseline creatinine": "Baseline Cr",
  "current creatinine": "Current Cr",
  "pre-dialysis creatinine": "Pre Cr",
  "post-dialysis creatinine": "Post Cr",
  "donor creatinine": "Donor Cr",
  "plasma creatinine": "Plasma Cr",
  "urine creatinine": "Urine Cr",
  "creatinine 1": "Cr1",
  "creatinine 2": "Cr2",
  "creatinine 3": "Cr3",
  "baseline creatinine (trajectory)": "Baseline Cr",
  // BUN / Urea
  bun: "BUN",
  "blood urea nitrogen": "BUN",
  "pre-dialysis bun": "Pre BUN",
  "post-dialysis bun": "Post BUN",
  "plasma urea": "Plasma Urea",
  "urine urea": "Urine Urea",
  "urine urea nitrogen": "Urine Urea N",
  // Electrolytes
  sodium: "Na",
  "serum sodium": "Na",
  "urine sodium": "UNa",
  potassium: "K",
  "serum potassium": "K",
  chloride: "Cl",
  "serum chloride": "Cl",
  bicarbonate: "HCO₃",
  "serum bicarbonate": "HCO₃",
  // Calcium / Phosphate
  calcium: "Ca",
  "serum calcium": "Ca",
  "measured calcium": "Ca",
  phosphate: "Phos",
  "serum phosphate": "Phos",
  "phosphate level": "Phos",
  // Proteins
  albumin: "Alb",
  "serum albumin": "Alb",
  // Vitals
  age: "Age",
  weight: "Wt",
  height: "Ht",
  "systolic bp": "SBP",
  "diastolic bp": "DBP",
  "heart rate": "HR",
  // Labs
  hemoglobin: "Hb",
  glucose: "Glc",
  "serum glucose": "Glc",
  "cystatin c": "CysC",
  "uric acid": "UA",
  pth: "PTH",
  "vitamin d": "Vit D",
  bilirubin: "Bili",
  "total cholesterol": "TC",
  hdl: "HDL",
  ldl: "LDL",
  // Urine
  "urine volume": "UVol",
  "urine osmolality": "UOsm",
  "serum osmolality": "SOsm",
  "urine protein": "UProt",
  "urine albumin": "UAlb",
  acr: "ACR",
  pcr: "PCR",
  // Magnesium
  magnesium: "Mg",
  "serum magnesium": "Mg",
  "target magnesium": "Tgt Mg",
  // Plasma electrolytes
  "plasma potassium": "K",
  "plasma sodium": "Na",
  // Target labs
  "target potassium": "Tgt K",
  // Measured variants
  "measured hco3": "HCO₃",
  "measured bicarbonate": "HCO₃",
  // Cardiac
  "left ventricular ejection fraction": "LVEF",
  lvef: "LVEF",
  // Urine creatinine variants
  "urine creatinine concentration": "Urine Cr",
  // Hematology
  "white blood cell count": "WBC",
  "white blood count": "WBC",
  wbc: "WBC",
  // eGFR
  egfr: "eGFR",
};

interface ClinicalNoteParams {
  calculator: Calculator;
  result: number | { [key: string]: number } | null;
  resultInterpretation: string;
  calculatorState: Record<string, string>;
  unitState: Record<string, string>;
  getUnitLabel: (input: { id: string; unit?: string }) => string;
}

/**
 * Get a short clinical label for an input.
 * Tries the SHORT_LABELS map (case-insensitive), then falls back to
 * the original label (truncated if excessively long).
 */
function getShortLabel(input: CalculatorInput): string {
  const key = input.label.toLowerCase();
  if (SHORT_LABELS[key]) return SHORT_LABELS[key];

  // Try partial match — e.g. "Serum Creatinine (SCr)" -> match "serum creatinine"
  for (const [pattern, abbrev] of Object.entries(SHORT_LABELS)) {
    if (key.startsWith(pattern)) return abbrev;
  }

  return input.label;
}

/**
 * Get the display value for an input, respecting units and select labels.
 */
function getDisplayValue(
  input: CalculatorInput,
  rawValue: string,
  getUnitLabel: ClinicalNoteParams["getUnitLabel"]
): string | null {
  if (!rawValue && rawValue !== "0") return null;

  switch (input.type) {
    case "select": {
      const option = input.options?.find((o) => o.value === rawValue);
      return option?.label ?? rawValue;
    }
    case "toggle":
    case "checkbox": {
      // "on" = checked, "" = unchecked
      const isChecked = rawValue === "on" || rawValue === "true" || rawValue === "yes";
      // Skip negative toggles entirely — caller will filter nulls
      if (!isChecked) return null;
      return "Yes";
    }
    case "radio": {
      const option = input.options?.find((o) => o.value === rawValue);
      return option?.label ?? rawValue;
    }
    case "score": {
      const option = input.options?.find((o) => o.value === rawValue);
      return option ? `${option.label}` : rawValue;
    }
    case "number":
    default: {
      const unit = getUnitLabel(input);
      return unit ? `${rawValue} ${unit}` : rawValue;
    }
  }
}

/**
 * Generate an EMR-ready clinical note from a calculator result.
 */
export function generateClinicalNote({
  calculator,
  result,
  resultInterpretation,
  calculatorState,
  unitState: _unitState,
  getUnitLabel,
}: ClinicalNoteParams): string {
  const lines: string[] = [];

  // --- Line 1: Result headline ---
  let resultStr: string;

  if (calculator.id === "corrected-calcium" && result && typeof result === "object") {
    const obj = result as { mgDl: number; mmolL: number };
    resultStr = `${obj.mgDl.toFixed(2)} mg/dL (${obj.mmolL.toFixed(2)} mmol/L)`;
  } else if (typeof result === "number") {
    resultStr = result.toFixed(2);
    if (calculator.resultUnit) {
      resultStr += ` ${calculator.resultUnit}`;
    }
  } else {
    resultStr = "N/A";
  }

  // First sentence of interpretation only
  const firstSentence = resultInterpretation
    ? resultInterpretation.split(/[.!]\s/)[0].replace(/[.!]$/, "").trim()
    : "";

  const headline = firstSentence
    ? `${calculator.name}: ${resultStr} — ${firstSentence}`
    : `${calculator.name}: ${resultStr}`;

  lines.push(headline);

  // --- Line 2: Input summary in parentheses ---
  const parts: string[] = [];

  for (const input of calculator.inputs) {
    // Skip hidden/unit-selector inputs
    if (input.id.endsWith("Unit")) continue;

    const rawValue = calculatorState[input.id] ?? "";
    const displayValue = getDisplayValue(input, rawValue, getUnitLabel);

    if (displayValue === null) continue;

    const label = getShortLabel(input);
    parts.push(`${label} ${displayValue}`);
  }

  if (parts.length > 0) {
    lines.push(`(${parts.join(", ")})`);
  }

  return lines.join("\n");
}
