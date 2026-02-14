/**
 * UnitConversionTooltip Component
 * Shows equivalent values in alternative units on hover
 * Supports common nephrology unit conversions
 */

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

// Unit conversion definitions for nephrology
export const unitConversions: { 
  [key: string]: { 
    name: string;
    conventional: string; 
    si: string; 
    conversionFactor: number;
    description?: string;
  } 
} = {
  // Creatinine: mg/dL to μmol/L (multiply by 88.4)
  creatinine: { 
    name: "Creatinine",
    conventional: "mg/dL", 
    si: "μmol/L", 
    conversionFactor: 88.4,
    description: "Serum creatinine"
  },
  preCreatinine: { 
    name: "Pre-dialysis Creatinine",
    conventional: "mg/dL", 
    si: "μmol/L", 
    conversionFactor: 88.4 
  },
  postCreatinine: { 
    name: "Post-dialysis Creatinine",
    conventional: "mg/dL", 
    si: "μmol/L", 
    conversionFactor: 88.4 
  },
  plasmaCr: { 
    name: "Plasma Creatinine",
    conventional: "mg/dL", 
    si: "μmol/L", 
    conversionFactor: 88.4 
  },
  urineCr: { 
    name: "Urine Creatinine",
    conventional: "mg/dL", 
    si: "μmol/L", 
    conversionFactor: 88.4 
  },
  donorCreatinine: { 
    name: "Donor Creatinine",
    conventional: "mg/dL", 
    si: "μmol/L", 
    conversionFactor: 88.4 
  },
  serumCreatinine: { 
    name: "Serum Creatinine",
    conventional: "mg/dL", 
    si: "μmol/L", 
    conversionFactor: 88.4 
  },
  
  // BUN/Urea: mg/dL to mmol/L (multiply by 0.357)
  bun: { 
    name: "Blood Urea Nitrogen",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.357,
    description: "BUN"
  },
  preBUN: { 
    name: "Pre-dialysis BUN",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.357 
  },
  postBUN: { 
    name: "Post-dialysis BUN",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.357 
  },
  plasmaUrea: { 
    name: "Plasma Urea",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.357 
  },
  urineUrea: { 
    name: "Urine Urea",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.357 
  },
  
  // Glucose: mg/dL to mmol/L (multiply by 0.0555)
  glucose: { 
    name: "Glucose",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.0555,
    description: "Blood glucose"
  },
  
  // Albumin: g/dL to g/L (multiply by 10)
  albumin: { 
    name: "Albumin",
    conventional: "g/dL", 
    si: "g/L", 
    conversionFactor: 10,
    description: "Serum albumin"
  },
  
  // Calcium: mg/dL to mmol/L (multiply by 0.25)
  calcium: { 
    name: "Calcium",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.25,
    description: "Serum calcium"
  },
  measuredCa: { 
    name: "Measured Calcium",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.25 
  },
  
  // Phosphate: mg/dL to mmol/L (multiply by 0.323)
  phosphate: { 
    name: "Phosphate",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.323,
    description: "Serum phosphate"
  },
  phosphorus: { 
    name: "Phosphorus",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.323 
  },
  
  // Cholesterol: mg/dL to mmol/L (multiply by 0.0259)
  totalCholesterol: { 
    name: "Total Cholesterol",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.0259 
  },
  hdl: { 
    name: "HDL Cholesterol",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.0259 
  },
  ldl: { 
    name: "LDL Cholesterol",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.0259 
  },
  
  // Hemoglobin: g/dL to g/L (multiply by 10)
  hemoglobin: { 
    name: "Hemoglobin",
    conventional: "g/dL", 
    si: "g/L", 
    conversionFactor: 10 
  },
  targetHemoglobin: { 
    name: "Target Hemoglobin",
    conventional: "g/dL", 
    si: "g/L", 
    conversionFactor: 10 
  },
  currentHemoglobin: { 
    name: "Current Hemoglobin",
    conventional: "g/dL", 
    si: "g/L", 
    conversionFactor: 10 
  },
  
  // Sodium: mEq/L to mmol/L (1:1)
  sodium: { 
    name: "Sodium",
    conventional: "mEq/L", 
    si: "mmol/L", 
    conversionFactor: 1,
    description: "Serum sodium"
  },
  plasmaNa: { 
    name: "Plasma Sodium",
    conventional: "mEq/L", 
    si: "mmol/L", 
    conversionFactor: 1 
  },
  urineNa: { 
    name: "Urine Sodium",
    conventional: "mEq/L", 
    si: "mmol/L", 
    conversionFactor: 1 
  },
  measuredNa: { 
    name: "Measured Sodium",
    conventional: "mEq/L", 
    si: "mmol/L", 
    conversionFactor: 1 
  },
  targetNa: { 
    name: "Target Sodium",
    conventional: "mEq/L", 
    si: "mmol/L", 
    conversionFactor: 1 
  },
  
  // Potassium: mEq/L to mmol/L (1:1)
  potassium: { 
    name: "Potassium",
    conventional: "mEq/L", 
    si: "mmol/L", 
    conversionFactor: 1,
    description: "Serum potassium"
  },
  urineK: { 
    name: "Urine Potassium",
    conventional: "mEq/L", 
    si: "mmol/L", 
    conversionFactor: 1 
  },
  
  // Chloride: mEq/L to mmol/L (1:1)
  chloride: { 
    name: "Chloride",
    conventional: "mEq/L", 
    si: "mmol/L", 
    conversionFactor: 1 
  },
  
  // Bicarbonate: mEq/L to mmol/L (1:1)
  bicarbonate: { 
    name: "Bicarbonate",
    conventional: "mEq/L", 
    si: "mmol/L", 
    conversionFactor: 1 
  },
  hco3: { 
    name: "HCO3",
    conventional: "mEq/L", 
    si: "mmol/L", 
    conversionFactor: 1 
  },
  
  // Magnesium: mg/dL to mmol/L (multiply by 0.411)
  magnesium: { 
    name: "Magnesium",
    conventional: "mg/dL", 
    si: "mmol/L", 
    conversionFactor: 0.411 
  },
  
  // Uric acid: mg/dL to μmol/L (multiply by 59.48)
  uricAcid: { 
    name: "Uric Acid",
    conventional: "mg/dL", 
    si: "μmol/L", 
    conversionFactor: 59.48 
  },
  
  // ACR: mg/g to mg/mmol (multiply by 0.113)
  acr: { 
    name: "Albumin-to-Creatinine Ratio",
    conventional: "mg/g", 
    si: "mg/mmol", 
    conversionFactor: 0.113 
  },
  
  // PCR: g/g to mg/mmol (multiply by 113)
  pcr: { 
    name: "Protein-to-Creatinine Ratio",
    conventional: "g/g", 
    si: "mg/mmol", 
    conversionFactor: 113 
  },
  
  // Osmolality: same units
  osmolality: { 
    name: "Osmolality",
    conventional: "mOsm/kg", 
    si: "mmol/kg", 
    conversionFactor: 1 
  },
  measuredOsm: { 
    name: "Measured Osmolality",
    conventional: "mOsm/kg", 
    si: "mmol/kg", 
    conversionFactor: 1 
  },
};

interface UnitConversionTooltipProps {
  inputId: string;
  value: number | string;
  currentUnit: "conventional" | "si";
  className?: string;
}

export function UnitConversionTooltip({ 
  inputId, 
  value, 
  currentUnit,
  className = ""
}: UnitConversionTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  const conversion = unitConversions[inputId];
  
  if (!conversion) return null;
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue === 0) return null;
  
  // Calculate converted value
  let convertedValue: number;
  let fromUnit: string;
  let toUnit: string;
  
  if (currentUnit === "conventional") {
    convertedValue = numValue * conversion.conversionFactor;
    fromUnit = conversion.conventional;
    toUnit = conversion.si;
  } else {
    convertedValue = numValue / conversion.conversionFactor;
    fromUnit = conversion.si;
    toUnit = conversion.conventional;
  }
  
  // Format the converted value
  const formattedValue = convertedValue < 0.01 
    ? convertedValue.toExponential(2)
    : convertedValue < 10 
      ? convertedValue.toFixed(2)
      : convertedValue < 100
        ? convertedValue.toFixed(1)
        : Math.round(convertedValue).toString();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className="p-1 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label="Show unit conversion"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground border rounded-lg shadow-lg text-xs whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-150"
          role="tooltip"
        >
          <div className="font-medium text-center mb-1">
            {conversion.name}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{numValue} {fromUnit}</span>
            <span>=</span>
            <span className="font-semibold text-foreground">{formattedValue} {toUnit}</span>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-popover border-r border-b rotate-45 -translate-y-1/2"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to check if an input has unit conversion available
export function hasUnitConversion(inputId: string): boolean {
  return inputId in unitConversions;
}

// Helper function to get conversion info for an input
export function getConversionInfo(inputId: string) {
  return unitConversions[inputId] || null;
}

export default UnitConversionTooltip;
