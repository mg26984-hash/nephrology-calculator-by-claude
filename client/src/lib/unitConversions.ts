/**
 * Comprehensive Unit Conversion Library for Nephrology Calculators
 * Supports all common clinical laboratory units with seamless conversion
 */

// Unit conversion factors
export const CONVERSION_FACTORS = {
  // Creatinine: mg/dL ↔ μmol/L
  creatinine: {
    toSI: 88.4, // mg/dL to μmol/L
    toConv: 1 / 88.4, // μmol/L to mg/dL
    siUnit: "μmol/L",
    convUnit: "mg/dL",
    siDecimals: 0,
    convDecimals: 2,
  },
  // BUN/Urea: mg/dL ↔ mmol/L
  bun: {
    toSI: 0.357, // mg/dL to mmol/L
    toConv: 1 / 0.357, // mmol/L to mg/dL
    siUnit: "mmol/L",
    convUnit: "mg/dL",
    siDecimals: 1,
    convDecimals: 1,
  },
  // Glucose: mg/dL ↔ mmol/L
  glucose: {
    toSI: 0.0555, // mg/dL to mmol/L
    toConv: 1 / 0.0555, // mmol/L to mg/dL
    siUnit: "mmol/L",
    convUnit: "mg/dL",
    siDecimals: 1,
    convDecimals: 0,
  },
  // Albumin: g/dL ↔ g/L
  albumin: {
    toSI: 10, // g/dL to g/L
    toConv: 0.1, // g/L to g/dL
    siUnit: "g/L",
    convUnit: "g/dL",
    siDecimals: 0,
    convDecimals: 1,
  },
  // Calcium: mg/dL ↔ mmol/L
  calcium: {
    toSI: 0.25, // mg/dL to mmol/L
    toConv: 4, // mmol/L to mg/dL
    siUnit: "mmol/L",
    convUnit: "mg/dL",
    siDecimals: 2,
    convDecimals: 1,
  },
  // Phosphate: mg/dL ↔ mmol/L
  phosphate: {
    toSI: 0.323, // mg/dL to mmol/L
    toConv: 1 / 0.323, // mmol/L to mg/dL
    siUnit: "mmol/L",
    convUnit: "mg/dL",
    siDecimals: 2,
    convDecimals: 1,
  },
  // Sodium/Potassium/Chloride: mEq/L = mmol/L (same)
  electrolyte: {
    toSI: 1,
    toConv: 1,
    siUnit: "mmol/L",
    convUnit: "mEq/L",
    siDecimals: 0,
    convDecimals: 0,
  },
  // Cholesterol: mg/dL ↔ mmol/L
  cholesterol: {
    toSI: 0.0259, // mg/dL to mmol/L
    toConv: 1 / 0.0259, // mmol/L to mg/dL
    siUnit: "mmol/L",
    convUnit: "mg/dL",
    siDecimals: 2,
    convDecimals: 0,
  },
  // Triglycerides: mg/dL ↔ mmol/L
  triglycerides: {
    toSI: 0.0113, // mg/dL to mmol/L
    toConv: 1 / 0.0113, // mmol/L to mg/dL
    siUnit: "mmol/L",
    convUnit: "mg/dL",
    siDecimals: 2,
    convDecimals: 0,
  },
  // Hemoglobin: g/dL ↔ g/L
  hemoglobin: {
    toSI: 10, // g/dL to g/L
    toConv: 0.1, // g/L to g/dL
    siUnit: "g/L",
    convUnit: "g/dL",
    siDecimals: 0,
    convDecimals: 1,
  },
  // Height: cm ↔ inches
  height: {
    toSI: 2.54, // inches to cm
    toConv: 1 / 2.54, // cm to inches
    siUnit: "cm",
    convUnit: "in",
    siDecimals: 0,
    convDecimals: 1,
  },
  // Weight: kg ↔ lbs
  weight: {
    toSI: 0.4536, // lbs to kg
    toConv: 2.205, // kg to lbs
    siUnit: "kg",
    convUnit: "lbs",
    siDecimals: 1,
    convDecimals: 0,
  },
  // Urine albumin: mg ↔ μg
  urineAlbumin: {
    toSI: 1000, // mg to μg
    toConv: 0.001, // μg to mg
    siUnit: "μg",
    convUnit: "mg",
    siDecimals: 0,
    convDecimals: 2,
  },
  // Urine creatinine: g ↔ mg
  urineCreatinine: {
    toSI: 1000, // g to mg
    toConv: 0.001, // mg to g
    siUnit: "mg",
    convUnit: "g",
    siDecimals: 0,
    convDecimals: 3,
  },
  // Urine protein: g ↔ mg
  urineProtein: {
    toSI: 1000, // g to mg
    toConv: 0.001, // mg to g
    siUnit: "mg",
    convUnit: "g",
    siDecimals: 0,
    convDecimals: 3,
  },
  // Osmolality: mOsm/kg (no conversion needed, same unit)
  osmolality: {
    toSI: 1,
    toConv: 1,
    siUnit: "mOsm/kg",
    convUnit: "mOsm/kg",
    siDecimals: 0,
    convDecimals: 0,
  },
  // Cystatin C: mg/L (no conversion, standard unit)
  cystatinC: {
    toSI: 1,
    toConv: 1,
    siUnit: "mg/L",
    convUnit: "mg/L",
    siDecimals: 2,
    convDecimals: 2,
  },
  // Tacrolimus: ng/mL (no conversion, standard unit)
  tacrolimus: {
    toSI: 1,
    toConv: 1,
    siUnit: "ng/mL",
    convUnit: "ng/mL",
    siDecimals: 1,
    convDecimals: 1,
  },
  // Ethanol: mg/dL ↔ mmol/L
  ethanol: {
    toSI: 0.217, // mg/dL to mmol/L
    toConv: 1 / 0.217, // mmol/L to mg/dL
    siUnit: "mmol/L",
    convUnit: "mg/dL",
    siDecimals: 1,
    convDecimals: 0,
  },
} as const;

export type UnitType = keyof typeof CONVERSION_FACTORS;

/**
 * Convert a value from conventional to SI units
 */
export function toSI(value: number, unitType: UnitType): number {
  const factor = CONVERSION_FACTORS[unitType];
  return value * factor.toSI;
}

/**
 * Convert a value from SI to conventional units
 */
export function toConventional(value: number, unitType: UnitType): number {
  const factor = CONVERSION_FACTORS[unitType];
  return value * factor.toConv;
}

/**
 * Convert value based on current unit system
 * If currently in SI, returns value as-is for SI calculations
 * If currently in conventional, converts to SI for calculations
 */
export function normalizeToSI(value: number, unitType: UnitType, currentUnit: "SI" | "conventional"): number {
  if (currentUnit === "SI") {
    return value;
  }
  return toSI(value, unitType);
}

/**
 * Convert value to conventional units for display or calculation
 */
export function normalizeToConventional(value: number, unitType: UnitType, currentUnit: "SI" | "conventional"): number {
  if (currentUnit === "conventional") {
    return value;
  }
  return toConventional(value, unitType);
}

/**
 * Get the display unit string based on unit system
 */
export function getUnitLabel(unitType: UnitType, unitSystem: "SI" | "conventional"): string {
  const factor = CONVERSION_FACTORS[unitType];
  return unitSystem === "SI" ? factor.siUnit : factor.convUnit;
}

/**
 * Format a value with appropriate decimal places based on unit type and system
 */
export function formatValue(value: number, unitType: UnitType, unitSystem: "SI" | "conventional"): string {
  const factor = CONVERSION_FACTORS[unitType];
  const decimals = unitSystem === "SI" ? factor.siDecimals : factor.convDecimals;
  return value.toFixed(decimals);
}

/**
 * Convert and format a value for display
 */
export function convertAndFormat(
  value: number,
  unitType: UnitType,
  fromSystem: "SI" | "conventional",
  toSystem: "SI" | "conventional"
): string {
  if (fromSystem === toSystem) {
    return formatValue(value, unitType, toSystem);
  }
  
  const converted = fromSystem === "SI" 
    ? toConventional(value, unitType)
    : toSI(value, unitType);
  
  return formatValue(converted, unitType, toSystem);
}

/**
 * Get both unit options for a given unit type
 */
export function getUnitOptions(unitType: UnitType): { value: string; label: string }[] {
  const factor = CONVERSION_FACTORS[unitType];
  return [
    { value: "conventional", label: factor.convUnit },
    { value: "SI", label: factor.siUnit },
  ];
}

/**
 * Creatinine-specific conversion for calculator functions
 * Most calculators expect mg/dL, so this normalizes input
 */
export function normalizeCreatinine(value: number, unit: "mg/dL" | "μmol/L"): number {
  if (unit === "μmol/L") {
    return value / 88.4; // Convert to mg/dL
  }
  return value;
}

/**
 * BUN-specific conversion for calculator functions
 * Most calculators expect mg/dL, so this normalizes input
 */
export function normalizeBUN(value: number, unit: "mg/dL" | "mmol/L"): number {
  if (unit === "mmol/L") {
    return value / 0.357; // Convert to mg/dL
  }
  return value;
}

/**
 * Glucose-specific conversion for calculator functions
 * Most calculators expect mg/dL, so this normalizes input
 */
export function normalizeGlucose(value: number, unit: "mg/dL" | "mmol/L"): number {
  if (unit === "mmol/L") {
    return value / 0.0555; // Convert to mg/dL
  }
  return value;
}

/**
 * Albumin-specific conversion for calculator functions
 */
export function normalizeAlbumin(value: number, unit: "g/dL" | "g/L"): number {
  if (unit === "g/L") {
    return value / 10; // Convert to g/dL
  }
  return value;
}

/**
 * Calcium-specific conversion for calculator functions
 */
export function normalizeCalcium(value: number, unit: "mg/dL" | "mmol/L"): number {
  if (unit === "mmol/L") {
    return value * 4; // Convert to mg/dL
  }
  return value;
}

/**
 * Phosphate-specific conversion for calculator functions
 */
export function normalizePhosphate(value: number, unit: "mg/dL" | "mmol/L"): number {
  if (unit === "mmol/L") {
    return value / 0.323; // Convert to mg/dL
  }
  return value;
}

/**
 * Height-specific conversion for calculator functions
 */
export function normalizeHeight(value: number, unit: "cm" | "in"): number {
  if (unit === "in") {
    return value * 2.54; // Convert to cm
  }
  return value;
}

/**
 * Weight-specific conversion for calculator functions
 */
export function normalizeWeight(value: number, unit: "kg" | "lbs"): number {
  if (unit === "lbs") {
    return value * 0.4536; // Convert to kg
  }
  return value;
}
