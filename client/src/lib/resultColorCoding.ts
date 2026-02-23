/**
 * Result Color Coding for Nephrology Calculators
 * Provides color classes based on clinical thresholds
 */

export interface ColorResult {
  bgClass: string;
  textClass: string;
  borderClass: string;
  label: string;
  severity: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
}

// Get color coding based on calculator ID and result value
export function getResultColorCoding(calculatorId: string, value: number, inputs?: Record<string, unknown>): ColorResult | null {
  switch (calculatorId) {
    // ============================================================================
    // KIDNEY FUNCTION (eGFR-based calculators)
    // ============================================================================
    case 'ckd-epi-creatinine':
    case 'cockcroft-gault':
    case 'schwartz-pediatric':
    case 'kinetic-egfr':
    case 'ckd-epi-cystatin-c':
      return getEGFRColor(value);

    // ============================================================================
    // eGFR SLOPE (Annual Decline)
    // ============================================================================
    case 'egfr-slope':
      return getEGFRSlopeColor(value);

    // ============================================================================
    // KIDNEY FAILURE RISK (KFRE)
    // ============================================================================
    case 'kfre':
      return getKFREColor(value);

    // ============================================================================
    // AKI WORKUP
    // ============================================================================
    case 'fena':
      return getFENaColor(value);

    case 'feurea':
      return getFEUreaColor(value);

    case 'anion-gap':
      return getAnionGapColor(value);

    case 'delta-gap':
      return getDeltaGapColor(value);

    case 'osmolal-gap':
      return getOsmolalGapColor(value);

    case 'urine-anion-gap':
      return getUrineAnionGapColor(value);

    case 'kdigo-aki-staging':
      return getKDIGOAKIColor(value);

    case 'cin-risk':
      return getCINRiskColor(value);

    case 'ttkg':
      return getTTKGColor(value, inputs);

    // ============================================================================
    // ELECTROLYTES
    // ============================================================================
    case 'water-deficit':
      return getWaterDeficitColor(value);

    case 'corrected-sodium':
      return getCorrectedSodiumColor(value);

    case 'sodium-correction-rate':
      return getSodiumCorrectionRateColor(value, inputs);

    case 'sodium-deficit':
      return getSodiumDeficitColor(value);

    case 'corrected-calcium':
      return getCorrectedCalciumColor(value);

    case 'qtc-bazett':
      return getQTcColor(value, inputs);

    // ============================================================================
    // PROTEINURIA
    // ============================================================================
    case 'uacr':
      return getUACRColor(value);

    case 'upcr':
      return getUPCRColor(value);

    case 'acr-from-pcr':
      return getACRColor(value);

    case '24-hour-protein':
      return get24HourProteinColor(value);

    case 'igan-prediction':
      return getIgANRiskColor(value);

    // ============================================================================
    // DIALYSIS ADEQUACY
    // ============================================================================
    case 'ktv-hemodialysis':
    case 'pd-weekly-ktv':
    case 'residual-rkf-ktv':
    case 'standard-ktv':
      return getKtVColor(value, calculatorId);

    case 'equilibrated-ktv':
      return getEKtVColor(value);

    case 'urr':
      return getURRColor(value);

    case 'tbw-watson':
      return null; // TBW doesn't need color coding

    case 'hd-session-duration':
      return null; // Duration is informational

    // ============================================================================
    // TRANSPLANTATION
    // ============================================================================
    case 'epts':
      return getEPTSColor(value);

    case 'tacrolimus':
      return getTacrolimusColor(value, inputs);

    // ============================================================================
    // CARDIOVASCULAR
    // ============================================================================
    case 'ascvd-risk':
      return getASCVDRiskColor(value);

    case 'cha2ds2-vasc':
      return getCHA2DS2VASCColor(value, inputs);

    // ============================================================================
    // ANTHROPOMETRIC
    // ============================================================================
    case 'bmi':
      return getBMIColor(value);

    // BSA, IBW, LBW, ABW don't need color coding - they're reference values

    // ============================================================================
    // CKD-MBD
    // ============================================================================
    case 'ca-phos-product':
      return getCaPhosProductColor(value);

    // ============================================================================
    // IRON
    // ============================================================================
    case 'iron-deficit':
      return getIronDeficitColor(value);

    // ============================================================================
    // SYSTEMIC DISEASES
    // ============================================================================
    case 'sledai':
      return getSLEDAIColor(value);

    case 'slicc':
      return getSLICCColor(value);

    case 'frail':
      return getFRAILColor(value);

    case 'prisma7':
      return getPRISMA7Color(value);

    case 'curb65':
      return getCURB65Color(value);

    case 'roks':
      return getROKSColor(value);

    case 'frax':
      return getFRAXColor(value);

    // ============================================================================
    // CRITICAL CARE
    // ============================================================================
    case 'qsofa':
      return getQSOFAColor(value);

    case 'news2':
      return getNEWS2Color(value);

    case 'sofa':
      return getSOFAColor(value);

    case 'wells-pe':
      return getWellsPEColor(value);

    case 'wells-dvt':
      return getWellsDVTColor(value);

    case 'gcs':
      return getGCSColor(value);

    case 'pesi':
      return getPESIColor(value);

    case 'apache2':
      return getAPACHEIIColor(value);

    case 'sirs':
      return getSIRSColor(value);

    case 'genevaRevised':
      return getGenevaRevisedColor(value);

    case 'hasbled':
      return getHASBLEDColor(value);

    case 'perc':
      return getPERCColor(value);

    default:
      return null;
  }
}

// ============================================================================
// COLOR HELPER FUNCTIONS
// ============================================================================

function getEGFRColor(value: number): ColorResult {
  if (value >= 90) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Normal (G1)',
      severity: 'success'
    };
  }
  if (value >= 60) {
    return {
      bgClass: 'bg-green-500/10',
      textClass: 'text-green-600 dark:text-green-400',
      borderClass: 'border-green-500',
      label: 'Mildly Decreased (G2)',
      severity: 'success'
    };
  }
  if (value >= 45) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Mild-Moderate (G3a)',
      severity: 'warning'
    };
  }
  if (value >= 30) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Moderate-Severe (G3b)',
      severity: 'warning'
    };
  }
  if (value >= 15) {
    return {
      bgClass: 'bg-red-400/10',
      textClass: 'text-red-500 dark:text-red-400',
      borderClass: 'border-red-400',
      label: 'Severe (G4)',
      severity: 'danger'
    };
  }
  return {
    bgClass: 'bg-red-600/10',
    textClass: 'text-red-600 dark:text-red-500',
    borderClass: 'border-red-600',
    label: 'Kidney Failure (G5)',
    severity: 'danger'
  };
}

function getEGFRSlopeColor(value: number): ColorResult {
  if (value > -1) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Normal Aging',
      severity: 'success'
    };
  }
  if (value > -3) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Mild Progression',
      severity: 'warning'
    };
  }
  if (value > -5) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Moderate Progression',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Rapid Progression',
    severity: 'danger'
  };
}

function getKFREColor(value: number): ColorResult {
  if (value < 3) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Risk',
      severity: 'success'
    };
  }
  if (value < 5) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Borderline',
      severity: 'warning'
    };
  }
  if (value < 20) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Moderate Risk',
      severity: 'warning'
    };
  }
  if (value < 40) {
    return {
      bgClass: 'bg-red-400/10',
      textClass: 'text-red-500 dark:text-red-400',
      borderClass: 'border-red-400',
      label: 'High Risk',
      severity: 'danger'
    };
  }
  return {
    bgClass: 'bg-red-600/10',
    textClass: 'text-red-600 dark:text-red-500',
    borderClass: 'border-red-600',
    label: 'Very High Risk',
    severity: 'danger'
  };
}

function getKDIGOAKIColor(value: number): ColorResult {
  if (value === 0) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'No AKI',
      severity: 'success'
    };
  }
  if (value === 1) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Stage 1 AKI',
      severity: 'warning'
    };
  }
  if (value === 2) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Stage 2 AKI',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Stage 3 AKI',
    severity: 'danger'
  };
}

function getFENaColor(value: number): ColorResult {
  if (value < 1) {
    return {
      bgClass: 'bg-blue-500/10',
      textClass: 'text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-500',
      label: 'Prerenal',
      severity: 'info'
    };
  }
  if (value <= 2) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Indeterminate',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500',
    label: 'Intrinsic AKI',
    severity: 'warning'
  };
}

function getFEUreaColor(value: number): ColorResult {
  if (value < 35) {
    return {
      bgClass: 'bg-blue-500/10',
      textClass: 'text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-500',
      label: 'Prerenal',
      severity: 'info'
    };
  }
  if (value <= 50) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Indeterminate',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500',
    label: 'Intrinsic AKI',
    severity: 'warning'
  };
}

function getAnionGapColor(value: number): ColorResult {
  if (value <= 12) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Normal',
      severity: 'success'
    };
  }
  if (value <= 16) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Borderline High',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'High (HAGMA)',
    severity: 'danger'
  };
}

function getDeltaGapColor(value: number): ColorResult {
  if (value >= 1 && value <= 2) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Pure HAGMA',
      severity: 'success'
    };
  }
  if (value < 1) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Mixed HAGMA + NAGMA',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-600 dark:text-purple-400',
    borderClass: 'border-purple-500',
    label: 'Mixed HAGMA + Alkalosis',
    severity: 'warning'
  };
}

function getOsmolalGapColor(value: number): ColorResult {
  if (value <= 10) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Normal',
      severity: 'success'
    };
  }
  if (value <= 20) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Borderline',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Elevated - Toxic Alcohol?',
    severity: 'danger'
  };
}

function getUrineAnionGapColor(value: number): ColorResult {
  if (value < 0) {
    return {
      bgClass: 'bg-blue-500/10',
      textClass: 'text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-500',
      label: 'GI Loss (Diarrhea)',
      severity: 'info'
    };
  }
  return {
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500',
    label: 'Renal (RTA)',
    severity: 'warning'
  };
}

function getCINRiskColor(value: number): ColorResult {
  if (value <= 5) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Risk',
      severity: 'success'
    };
  }
  if (value <= 10) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Risk',
      severity: 'warning'
    };
  }
  if (value <= 15) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'High Risk',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Very High Risk',
    severity: 'danger'
  };
}

function getTTKGColor(value: number, inputs?: Record<string, unknown>): ColorResult {
  // TTKG interpretation depends on clinical context (hypo vs hyperkalemia)
  if (value < 3) {
    return {
      bgClass: 'bg-blue-500/10',
      textClass: 'text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-500',
      label: 'Low Renal K+ Excretion',
      severity: 'info'
    };
  }
  if (value <= 7) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Normal Range',
      severity: 'success'
    };
  }
  return {
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500',
    label: 'High Renal K+ Excretion',
    severity: 'warning'
  };
}

function getWaterDeficitColor(value: number): ColorResult {
  if (value <= 2) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Mild Deficit',
      severity: 'success'
    };
  }
  if (value <= 5) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Deficit',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Severe Deficit',
    severity: 'danger'
  };
}

function getCorrectedSodiumColor(value: number): ColorResult {
  if (value >= 136 && value <= 145) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Normal',
      severity: 'success'
    };
  }
  if (value < 136 && value >= 130) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Mild Hyponatremia',
      severity: 'warning'
    };
  }
  if (value < 130) {
    return {
      bgClass: 'bg-red-500/10',
      textClass: 'text-red-600 dark:text-red-400',
      borderClass: 'border-red-500',
      label: 'Hyponatremia',
      severity: 'danger'
    };
  }
  return {
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500',
    label: 'Hypernatremia',
    severity: 'warning'
  };
}

function getSodiumCorrectionRateColor(_value: number, inputs?: Record<string, unknown>): ColorResult {
  // Color is based on Na correction rate (mEq/L per 24h), not the mL/hr infusion rate
  const currentNa = Number(inputs?.currentNa) || 0;
  const targetNa = Number(inputs?.targetNa) || 0;
  const correctionHours = Number(inputs?.correctionHours) || 24;
  const naChangeIn24h = Math.abs(targetNa - currentNa) / correctionHours * 24;

  if (naChangeIn24h <= 6) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Safe Rate',
      severity: 'success'
    };
  }
  if (naChangeIn24h <= 8) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Acceptable',
      severity: 'warning'
    };
  }
  if (naChangeIn24h <= 10) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'ODS Risk',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Too Rapid!',
    severity: 'danger'
  };
}

function getSodiumDeficitColor(value: number): ColorResult {
  if (value <= 100) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Mild Deficit',
      severity: 'success'
    };
  }
  if (value <= 300) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Deficit',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Severe Deficit',
    severity: 'danger'
  };
}

function getCorrectedCalciumColor(value: number): ColorResult {
  if (value >= 8.5 && value <= 10.5) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Normal',
      severity: 'success'
    };
  }
  if (value < 8.5) {
    return {
      bgClass: 'bg-blue-500/10',
      textClass: 'text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-500',
      label: 'Hypocalcemia',
      severity: 'info'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Hypercalcemia',
    severity: 'danger'
  };
}

function getQTcColor(value: number, inputs?: Record<string, unknown>): ColorResult {
  if (value <= 450) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Normal',
      severity: 'success'
    };
  }
  if (value <= 500) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Prolonged',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Severely Prolonged',
    severity: 'danger'
  };
}

function getUACRColor(value: number): ColorResult {
  if (value < 30) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'A1 - Normal',
      severity: 'success'
    };
  }
  if (value < 300) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'A2 - Moderately Increased',
      severity: 'warning'
    };
  }
  if (value < 2200) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'A3 - Severely Increased',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Nephrotic Range',
    severity: 'danger'
  };
}

function getUPCRColor(value: number): ColorResult {
  if (value < 0.15) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Normal',
      severity: 'success'
    };
  }
  if (value < 0.5) {
    return {
      bgClass: 'bg-green-500/10',
      textClass: 'text-green-600 dark:text-green-400',
      borderClass: 'border-green-500',
      label: 'Mild',
      severity: 'success'
    };
  }
  if (value < 1) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate',
      severity: 'warning'
    };
  }
  if (value < 3) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Heavy',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Nephrotic Range',
    severity: 'danger'
  };
}

function getACRColor(value: number): ColorResult {
  if (value < 30) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'A1 - Normal',
      severity: 'success'
    };
  }
  if (value < 300) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'A2 - Moderately Increased',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'A3 - Severely Increased',
    severity: 'danger'
  };
}

function get24HourProteinColor(value: number): ColorResult {
  if (value < 0.15) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Normal',
      severity: 'success'
    };
  }
  if (value < 3) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Mild-Moderate',
      severity: 'warning'
    };
  }
  if (value < 10) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Nephrotic Range',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Severe Nephrotic',
    severity: 'danger'
  };
}

function getIgANRiskColor(value: number): ColorResult {
  if (value < 10) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Risk',
      severity: 'success'
    };
  }
  if (value < 30) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Risk',
      severity: 'warning'
    };
  }
  if (value < 50) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'High Risk',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Very High Risk',
    severity: 'danger'
  };
}

function getKtVColor(value: number, calculatorId: string): ColorResult {
  // Different thresholds for different Kt/V calculators
  let adequateThreshold = 1.2;
  let targetThreshold = 1.4;
  
  if (calculatorId === 'pd-weekly-ktv') {
    adequateThreshold = 1.7;
    targetThreshold = 2.0;
  } else if (calculatorId === 'standard-ktv') {
    adequateThreshold = 2.0;
    targetThreshold = 2.3;
  }
  
  if (value >= targetThreshold) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Excellent',
      severity: 'success'
    };
  }
  if (value >= adequateThreshold) {
    return {
      bgClass: 'bg-green-500/10',
      textClass: 'text-green-600 dark:text-green-400',
      borderClass: 'border-green-500',
      label: 'Adequate',
      severity: 'success'
    };
  }
  if (value >= adequateThreshold * 0.9) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Borderline',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Inadequate',
    severity: 'danger'
  };
}

function getEKtVColor(value: number): ColorResult {
  if (value >= 1.2) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Adequate',
      severity: 'success'
    };
  }
  if (value >= 1.05) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Borderline',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Inadequate',
    severity: 'danger'
  };
}

function getURRColor(value: number): ColorResult {
  if (value >= 70) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Excellent',
      severity: 'success'
    };
  }
  if (value >= 65) {
    return {
      bgClass: 'bg-green-500/10',
      textClass: 'text-green-600 dark:text-green-400',
      borderClass: 'border-green-500',
      label: 'Adequate',
      severity: 'success'
    };
  }
  if (value >= 60) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Borderline',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Inadequate',
    severity: 'danger'
  };
}

function getEPTSColor(value: number): ColorResult {
  if (value <= 20) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Excellent Candidate',
      severity: 'success'
    };
  }
  if (value <= 50) {
    return {
      bgClass: 'bg-green-500/10',
      textClass: 'text-green-600 dark:text-green-400',
      borderClass: 'border-green-500',
      label: 'Good Candidate',
      severity: 'success'
    };
  }
  if (value <= 80) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Average Candidate',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500',
    label: 'Higher Risk Candidate',
    severity: 'warning'
  };
}

function getTacrolimusColor(value: number, inputs?: Record<string, unknown>): ColorResult {
  // Tacrolimus target ranges vary by time post-transplant
  const phase = inputs?.phase as string || 'maintenance';
  
  let lowTarget = 5;
  let highTarget = 10;
  
  if (phase === 'early') {
    lowTarget = 10;
    highTarget = 15;
  } else if (phase === 'intermediate') {
    lowTarget = 8;
    highTarget = 12;
  }
  
  if (value >= lowTarget && value <= highTarget) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Within Target',
      severity: 'success'
    };
  }
  if (value < lowTarget) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Below Target',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Above Target',
    severity: 'danger'
  };
}

function getASCVDRiskColor(value: number): ColorResult {
  if (value < 5) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Risk',
      severity: 'success'
    };
  }
  if (value < 7.5) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Borderline',
      severity: 'warning'
    };
  }
  if (value < 20) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Intermediate Risk',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'High Risk',
    severity: 'danger'
  };
}

function getCHA2DS2VASCColor(value: number, inputs?: Record<string, unknown>): ColorResult {
  const sex = inputs?.sex as string;
  
  // Score 0: Low risk - no anticoagulation
  if (value === 0) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Risk - No Anticoagulation',
      severity: 'success'
    };
  }
  
  // Score 1: Consider anticoagulation (especially males)
  if (value === 1) {
    // Female with score 1 (only from sex) = effectively low risk
    if (sex === 'F') {
      return {
        bgClass: 'bg-emerald-500/10',
        textClass: 'text-emerald-600 dark:text-emerald-400',
        borderClass: 'border-emerald-500',
        label: 'Low Risk (Female Only)',
        severity: 'success'
      };
    }
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Consider Anticoagulation',
      severity: 'warning'
    };
  }
  
  // Score 2: Anticoagulation recommended
  if (value === 2) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Anticoagulation Recommended',
      severity: 'warning'
    };
  }
  
  // Score >=3: High risk - anticoagulation strongly recommended
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'High Risk - Anticoagulate',
    severity: 'danger'
  };
}

function getBMIColor(value: number): ColorResult {
  if (value < 18.5) {
    return {
      bgClass: 'bg-blue-500/10',
      textClass: 'text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-500',
      label: 'Underweight',
      severity: 'info'
    };
  }
  if (value < 25) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Normal',
      severity: 'success'
    };
  }
  if (value < 30) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Overweight',
      severity: 'warning'
    };
  }
  if (value < 35) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Obese Class I',
      severity: 'warning'
    };
  }
  if (value < 40) {
    return {
      bgClass: 'bg-red-400/10',
      textClass: 'text-red-500 dark:text-red-400',
      borderClass: 'border-red-400',
      label: 'Obese Class II',
      severity: 'danger'
    };
  }
  return {
    bgClass: 'bg-red-600/10',
    textClass: 'text-red-600 dark:text-red-500',
    borderClass: 'border-red-600',
    label: 'Obese Class III',
    severity: 'danger'
  };
}

function getCaPhosProductColor(value: number): ColorResult {
  if (value < 55) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Normal',
      severity: 'success'
    };
  }
  if (value < 70) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Elevated',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'High Risk',
    severity: 'danger'
  };
}

function getIronDeficitColor(value: number): ColorResult {
  if (value <= 500) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Mild Deficit',
      severity: 'success'
    };
  }
  if (value <= 1000) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Deficit',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Severe Deficit',
    severity: 'danger'
  };
}

function getSLEDAIColor(value: number): ColorResult {
  if (value === 0) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Inactive',
      severity: 'success'
    };
  }
  if (value <= 5) {
    return {
      bgClass: 'bg-green-500/10',
      textClass: 'text-green-600 dark:text-green-400',
      borderClass: 'border-green-500',
      label: 'Mild Activity',
      severity: 'success'
    };
  }
  if (value <= 10) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Activity',
      severity: 'warning'
    };
  }
  if (value <= 20) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'High Activity',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Very High Activity',
    severity: 'danger'
  };
}

function getSLICCColor(value: number): ColorResult {
  if (value < 4) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Does Not Meet Criteria',
      severity: 'success'
    };
  }
  return {
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-600 dark:text-purple-400',
    borderClass: 'border-purple-500',
    label: 'Meets SLE Criteria',
    severity: 'info'
  };
}

function getFRAILColor(value: number): ColorResult {
  if (value <= 1) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Robust',
      severity: 'success'
    };
  }
  if (value <= 2) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Pre-Frail',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Frail',
    severity: 'danger'
  };
}

function getPRISMA7Color(value: number): ColorResult {
  if (value <= 3) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Negative Screen',
      severity: 'success'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Positive Screen — Frailty Likely',
    severity: 'danger'
  };
}

function getCURB65Color(value: number): ColorResult {
  if (value <= 1) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Risk',
      severity: 'success'
    };
  }
  if (value === 2) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Risk',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'High Risk',
    severity: 'danger'
  };
}

function getROKSColor(value: number): ColorResult {
  if (value < 25) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Recurrence Risk',
      severity: 'success'
    };
  }
  if (value < 50) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Risk',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500',
    label: 'High Recurrence Risk',
    severity: 'warning'
  };
}

function getFRAXColor(value: number): ColorResult {
  if (value < 10) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Fracture Risk',
      severity: 'success'
    };
  }
  if (value < 20) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Risk',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'High Fracture Risk',
    severity: 'danger'
  };
}


// ============================================================================
// CRITICAL CARE CALCULATORS
// ============================================================================

export function getQSOFAColor(value: number): ColorResult {
  if (value === 0) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Risk',
      severity: 'success'
    };
  }
  if (value === 1) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Intermediate Risk',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'High Risk - Sepsis Likely',
    severity: 'danger'
  };
}

export function getNEWS2Color(value: number): ColorResult {
  if (value <= 4) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Risk',
      severity: 'success'
    };
  }
  if (value <= 6) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Medium Risk',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'High Risk - Urgent Response',
    severity: 'danger'
  };
}

export function getSOFAColor(value: number): ColorResult {
  if (value <= 1) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Minimal Dysfunction',
      severity: 'success'
    };
  }
  if (value <= 6) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Mild-Moderate Dysfunction',
      severity: 'warning'
    };
  }
  if (value <= 10) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Severe Dysfunction',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Critical - High Mortality',
    severity: 'danger'
  };
}

export function getWellsPEColor(value: number): ColorResult {
  if (value < 2) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Probability',
      severity: 'success'
    };
  }
  if (value <= 6) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Probability',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'High Probability - PE Likely',
    severity: 'danger'
  };
}

export function getWellsDVTColor(value: number): ColorResult {
  if (value < 1) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Probability',
      severity: 'success'
    };
  }
  if (value <= 2) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Probability',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'High Probability - DVT Likely',
    severity: 'danger'
  };
}

export function getGCSColor(value: number): ColorResult {
  if (value >= 13) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Mild Brain Injury',
      severity: 'success'
    };
  }
  if (value >= 9) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Brain Injury',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Severe Brain Injury',
    severity: 'danger'
  };
}

export function getPESIColor(value: number): ColorResult {
  if (value <= 65) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Class I - Very Low Risk',
      severity: 'success'
    };
  }
  if (value <= 85) {
    return {
      bgClass: 'bg-green-500/10',
      textClass: 'text-green-600 dark:text-green-400',
      borderClass: 'border-green-500',
      label: 'Class II - Low Risk',
      severity: 'success'
    };
  }
  if (value <= 105) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Class III - Intermediate Risk',
      severity: 'warning'
    };
  }
  if (value <= 125) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Class IV - High Risk',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Class V - Very High Risk',
    severity: 'danger'
  };
}

export function getAPACHEIIColor(value: number): ColorResult {
  if (value <= 4) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Risk (~4% mortality)',
      severity: 'success'
    };
  }
  if (value <= 9) {
    return {
      bgClass: 'bg-green-500/10',
      textClass: 'text-green-600 dark:text-green-400',
      borderClass: 'border-green-500',
      label: 'Low-Moderate (~8% mortality)',
      severity: 'success'
    };
  }
  if (value <= 14) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate (~15% mortality)',
      severity: 'warning'
    };
  }
  if (value <= 19) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'Moderate-High (~25% mortality)',
      severity: 'warning'
    };
  }
  if (value <= 24) {
    return {
      bgClass: 'bg-red-400/10',
      textClass: 'text-red-500 dark:text-red-400',
      borderClass: 'border-red-400',
      label: 'High (~40% mortality)',
      severity: 'danger'
    };
  }
  if (value <= 29) {
    return {
      bgClass: 'bg-red-500/10',
      textClass: 'text-red-600 dark:text-red-400',
      borderClass: 'border-red-500',
      label: 'Very High (~55% mortality)',
      severity: 'danger'
    };
  }
  return {
    bgClass: 'bg-red-600/10',
    textClass: 'text-red-700 dark:text-red-500',
    borderClass: 'border-red-600',
    label: 'Critical (~75%+ mortality)',
    severity: 'danger'
  };
}


export function getSIRSColor(value: number): ColorResult {
  if (value === 0) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'No SIRS Criteria Met',
      severity: 'success'
    };
  }
  if (value === 1) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: '1 Criterion - Monitor',
      severity: 'warning'
    };
  }
  if (value === 2) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'SIRS Positive (2 criteria)',
      severity: 'warning'
    };
  }
  if (value === 3) {
    return {
      bgClass: 'bg-red-500/10',
      textClass: 'text-red-600 dark:text-red-400',
      borderClass: 'border-red-500',
      label: 'SIRS Positive (3 criteria)',
      severity: 'danger'
    };
  }
  return {
    bgClass: 'bg-red-600/10',
    textClass: 'text-red-700 dark:text-red-500',
    borderClass: 'border-red-600',
    label: 'SIRS Positive (All 4 criteria)',
    severity: 'danger'
  };
}

export function getGenevaRevisedColor(value: number): ColorResult {
  if (value <= 3) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Probability (~8%)',
      severity: 'success'
    };
  }
  if (value <= 10) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Intermediate Probability (~28%)',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'High Probability (~74%)',
    severity: 'danger'
  };
}


export function getHASBLEDColor(value: number): ColorResult {
  if (value <= 1) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'Low Bleeding Risk',
      severity: 'success'
    };
  }
  if (value === 2) {
    return {
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500',
      label: 'Moderate Bleeding Risk',
      severity: 'warning'
    };
  }
  if (value === 3) {
    return {
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500',
      label: 'High Bleeding Risk',
      severity: 'warning'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'Very High Bleeding Risk',
    severity: 'danger'
  };
}

export function getPERCColor(value: number): ColorResult {
  if (value === 0) {
    return {
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500',
      label: 'PERC Negative - PE Ruled Out',
      severity: 'success'
    };
  }
  return {
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500',
    label: 'PERC Positive - Cannot Rule Out PE',
    severity: 'danger'
  };
}
