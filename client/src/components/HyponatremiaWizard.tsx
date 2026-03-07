import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface HyponatremiaWizardProps {
  onClose: () => void;
  onNavigateToCalculator?: (calcId: string) => void;
}

type VolumeStatus = "hypovolemic" | "euvolemic" | "hypervolemic";

interface DiagnosisResult {
  title: string;
  causes: string[];
  management: string[];
  severity: "danger" | "warning" | "info";
}

const STEPS = ["Labs", "Volume Status", "Urine", "Result"] as const;

function getOsmolalityCategory(osm: number): "hypertonic" | "isotonic" | "hypotonic" {
  if (osm > 295) return "hypertonic";
  if (osm >= 275) return "isotonic";
  return "hypotonic";
}

function getDiagnosis(
  volumeStatus: VolumeStatus,
  urineNa: number,
  urineOsm: number
): DiagnosisResult {
  if (volumeStatus === "hypovolemic") {
    if (urineNa < 20) {
      return {
        title: "Extrarenal Losses",
        causes: [
          "GI losses (vomiting, diarrhea, NG suction)",
          "Third-spacing (pancreatitis, burns, bowel obstruction)",
          "Excessive sweating",
        ],
        management: [
          "Normal saline (0.9% NaCl) for volume resuscitation",
          "Treat underlying cause",
          "Monitor serum Na every 4-6 hours",
          "Limit correction rate to <10 mEq/L per 24 hours",
        ],
        severity: "warning",
      };
    }
    return {
      title: "Renal Losses",
      causes: [
        "Thiazide diuretics",
        "Cerebral salt wasting (CSW)",
        "Mineralocorticoid deficiency (adrenal insufficiency)",
        "Salt-losing nephropathy",
      ],
      management: [
        "Stop offending diuretics",
        "Normal saline (0.9% NaCl) for volume resuscitation",
        "Check morning cortisol / ACTH stimulation test",
        "Consider fludrocortisone if mineralocorticoid deficiency",
      ],
      severity: "danger",
    };
  }

  if (volumeStatus === "euvolemic") {
    if (urineOsm > 100) {
      return {
        title: "SIADH / Endocrine Causes",
        causes: [
          "SIADH (drugs, CNS disease, pulmonary disease, malignancy)",
          "Hypothyroidism",
          "Adrenal insufficiency (glucocorticoid deficiency)",
        ],
        management: [
          "Fluid restriction (typically <1-1.5 L/day)",
          "Hypertonic saline (3% NaCl) if severe/symptomatic",
          "Salt tablets +/- loop diuretic",
          "Consider vaptans (tolvaptan) for refractory SIADH",
          "Check TSH, morning cortisol",
        ],
        severity: "danger",
      };
    }
    return {
      title: "Primary Polydipsia / Low Solute Intake",
      causes: [
        "Primary (psychogenic) polydipsia",
        "Beer potomania",
        "Tea-and-toast diet (low solute intake)",
      ],
      management: [
        "Fluid restriction",
        "Nutritional counseling (increase dietary solute)",
        "Psychiatric evaluation if psychogenic polydipsia",
        "Monitor for rapid autocorrection risk",
      ],
      severity: "info",
    };
  }

  // Hypervolemic
  if (urineNa < 20) {
    return {
      title: "Edematous States",
      causes: [
        "Congestive heart failure (CHF)",
        "Cirrhosis with ascites",
        "Nephrotic syndrome",
      ],
      management: [
        "Fluid restriction (<1.5 L/day)",
        "Sodium restriction (<2 g/day)",
        "Loop diuretics (furosemide, torsemide)",
        "Treat underlying condition (HF optimization, TIPS for cirrhosis)",
      ],
      severity: "warning",
    };
  }
  return {
    title: "Renal Failure",
    causes: [
      "Chronic kidney disease (CKD) with impaired free water excretion",
      "Acute kidney injury (AKI)",
    ],
    management: [
      "Fluid restriction",
      "Dialysis if severe or refractory",
      "Treat underlying renal disease",
      "Avoid nephrotoxins",
    ],
    severity: "danger",
  };
}

const severityStyles = {
  danger: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    title: "text-red-800 dark:text-red-200",
    text: "text-red-700 dark:text-red-300",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    title: "text-amber-800 dark:text-amber-200",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    title: "text-blue-800 dark:text-blue-200",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300",
  },
};

const volumeOptions: {
  value: VolumeStatus;
  label: string;
  signs: string[];
}[] = [
  {
    value: "hypovolemic",
    label: "Hypovolemic",
    signs: [
      "Tachycardia",
      "Orthostatic hypotension",
      "Dry mucous membranes",
      "Flat JVP",
      "Poor skin turgor",
    ],
  },
  {
    value: "euvolemic",
    label: "Euvolemic",
    signs: [
      "Normal vital signs",
      "No peripheral edema",
      "Normal JVP",
      "Moist mucous membranes",
    ],
  },
  {
    value: "hypervolemic",
    label: "Hypervolemic",
    signs: [
      "Peripheral edema",
      "Ascites",
      "Elevated JVP",
      "Pulmonary crackles",
      "S3 gallop",
    ],
  },
];

export function HyponatremiaWizard({
  onClose,
  onNavigateToCalculator,
}: HyponatremiaWizardProps) {
  const [step, setStep] = useState(0);

  // Step 1: Labs
  const [serumNa, setSerumNa] = useState("");
  const [serumOsm, setSerumOsm] = useState("");

  // Step 2: Volume status
  const [volumeStatus, setVolumeStatus] = useState<VolumeStatus | null>(null);

  // Step 3: Urine
  const [urineNa, setUrineNa] = useState("");
  const [urineOsm, setUrineOsm] = useState("");

  const osmCategory = useMemo(() => {
    const osm = Number(serumOsm);
    if (!osm || osm <= 0) return null;
    return getOsmolalityCategory(osm);
  }, [serumOsm]);

  const diagnosis = useMemo(() => {
    if (
      step !== 3 ||
      !volumeStatus ||
      !urineNa ||
      !urineOsm
    )
      return null;
    return getDiagnosis(
      volumeStatus,
      Number(urineNa),
      Number(urineOsm)
    );
  }, [step, volumeStatus, urineNa, urineOsm]);

  const handleNumericChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (/^\d*\.?\d*$/.test(e.target.value)) {
        setter(e.target.value);
      }
    };

  const canProceedStep0 =
    serumNa !== "" &&
    Number(serumNa) > 0 &&
    serumOsm !== "" &&
    Number(serumOsm) > 0;

  const canProceedStep1 = volumeStatus !== null;

  const canProceedStep2 =
    urineNa !== "" &&
    Number(urineNa) >= 0 &&
    urineOsm !== "" &&
    Number(urineOsm) > 0;

  const handleNext = () => {
    if (step === 0 && osmCategory !== "hypotonic") {
      // Workup ends here for hypertonic/isotonic
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleStartOver = () => {
    setStep(0);
    setSerumNa("");
    setSerumOsm("");
    setVolumeStatus(null);
    setUrineNa("");
    setUrineOsm("");
  };

  // Progress indicator
  const renderProgress = () => {
    const totalSteps =
      osmCategory && osmCategory !== "hypotonic" ? 1 : STEPS.length;
    const stepsToShow =
      osmCategory && osmCategory !== "hypotonic"
        ? [STEPS[0]]
        : [...STEPS];

    return (
      <div className="flex items-center gap-1 mb-6">
        {stepsToShow.map((label, i) => {
          const isActive = i === step;
          const isCompleted = i < step;
          return (
            <React.Fragment key={label}>
              {i > 0 && (
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    isCompleted
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                />
              )}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {i + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium whitespace-nowrap",
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-primary/70"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Step 1: Labs
  const renderStep0 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hypo-serum-na">Serum Sodium (mEq/L)</Label>
          <Input
            id="hypo-serum-na"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={serumNa}
            onChange={handleNumericChange(setSerumNa)}
            placeholder="128"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hypo-serum-osm">Serum Osmolality (mOsm/kg)</Label>
          <Input
            id="hypo-serum-osm"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={serumOsm}
            onChange={handleNumericChange(setSerumOsm)}
            placeholder="260"
          />
        </div>
      </div>

      {/* Osmolality feedback panel */}
      {osmCategory && (
        <div
          className={cn(
            "p-4 rounded-lg border",
            osmCategory === "hypertonic" &&
              "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
            osmCategory === "isotonic" &&
              "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
            osmCategory === "hypotonic" &&
              "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
          )}
        >
          {osmCategory === "hypertonic" && (
            <div>
              <div className="font-medium text-red-800 dark:text-red-200 mb-1">
                Hypertonic Hyponatremia (Osm &gt;295)
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                Serum osmolality is elevated. Consider hyperglycemia,
                mannitol, or other osmotically active solutes drawing water
                into the extracellular space.
              </p>
              {onNavigateToCalculator && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30"
                  onClick={() =>
                    onNavigateToCalculator(
                      "corrected-sodium-hyperglycemia"
                    )
                  }
                >
                  Calculate Corrected Sodium
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          )}
          {osmCategory === "isotonic" && (
            <div>
              <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                Isotonic (Pseudohyponatremia) (Osm 275-295)
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Normal effective osmolality. This is pseudohyponatremia
                caused by elevated lipids (hyperlipidemia) or
                paraproteins (multiple myeloma). No further workup needed
                for hyponatremia itself. Check lipid panel and SPEP.
              </p>
            </div>
          )}
          {osmCategory === "hypotonic" && (
            <div>
              <div className="font-medium text-green-800 dark:text-green-200 mb-1">
                True Hypotonic Hyponatremia (Osm &lt;275)
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Confirmed hypotonic hyponatremia. Proceed to assess volume
                status.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!canProceedStep0 || osmCategory !== "hypotonic"}
        >
          Next: Volume Status
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // Step 2: Volume Status
  const renderStep1 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Assess the patient's volume status based on clinical examination.
      </p>
      <div className="grid gap-3">
        {volumeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setVolumeStatus(opt.value)}
            className={cn(
              "w-full text-left rounded-lg border p-4 transition-all",
              volumeStatus === opt.value
                ? "border-primary bg-primary/5 ring-2 ring-primary/50"
                : "border-muted-foreground/20 hover:border-muted-foreground/40"
            )}
          >
            <div className="font-medium mb-1">{opt.label}</div>
            <div className="text-xs text-muted-foreground">
              {opt.signs.join(" \u00B7 ")}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceedStep1}>
          Next: Urine Studies
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // Step 3: Urine
  const renderStep2 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter urine electrolytes and osmolality.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hypo-urine-na">Urine Sodium (mEq/L)</Label>
          <Input
            id="hypo-urine-na"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={urineNa}
            onChange={handleNumericChange(setUrineNa)}
            placeholder="15"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hypo-urine-osm">Urine Osmolality (mOsm/kg)</Label>
          <Input
            id="hypo-urine-osm"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={urineOsm}
            onChange={handleNumericChange(setUrineOsm)}
            placeholder="350"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceedStep2}
        >
          See Diagnosis
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // Step 4: Result
  const renderStep3 = () => {
    if (!diagnosis) return null;
    const styles = severityStyles[diagnosis.severity];

    return (
      <div className="space-y-4">
        {/* Summary badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Na: {serumNa} mEq/L</Badge>
          <Badge variant="outline">Osm: {serumOsm} mOsm/kg</Badge>
          <Badge variant="outline">
            {volumeStatus === "hypovolemic"
              ? "Hypovolemic"
              : volumeStatus === "euvolemic"
              ? "Euvolemic"
              : "Hypervolemic"}
          </Badge>
          <Badge variant="outline">UNa: {urineNa} mEq/L</Badge>
          <Badge variant="outline">UOsm: {urineOsm} mOsm/kg</Badge>
        </div>

        {/* Diagnosis panel */}
        <div
          className={cn(
            "p-4 rounded-lg border",
            styles.bg,
            styles.border
          )}
        >
          <div className={cn("text-lg font-semibold mb-2", styles.title)}>
            {diagnosis.title}
          </div>

          <div className="mb-3">
            <div className={cn("text-sm font-medium mb-1", styles.title)}>
              Likely Causes:
            </div>
            <ul className={cn("text-sm space-y-1", styles.text)}>
              {diagnosis.causes.map((cause, i) => (
                <li key={i}>
                  {"\u2022"} {cause}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className={cn("text-sm font-medium mb-1", styles.title)}>
              Management:
            </div>
            <ul className={cn("text-sm space-y-1", styles.text)}>
              {diagnosis.management.map((item, i) => (
                <li key={i}>
                  {"\u2022"} {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Related calculators */}
        {onNavigateToCalculator && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onNavigateToCalculator("sodium-correction-rate")
              }
            >
              Na Correction Rate Calculator
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onNavigateToCalculator("sodium-deficit")
              }
            >
              Sodium Deficit Calculator
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button onClick={handleStartOver}>Start New Workup</Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Hyponatremia Workup Wizard
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Step-by-step guide to diagnosing the cause of hyponatremia
        </p>
      </CardHeader>
      <CardContent>
        {renderProgress()}
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </CardContent>
    </Card>
  );
}
