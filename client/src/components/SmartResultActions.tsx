import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SmartAction {
  label: string;
  calculatorId: string;
  warning?: string;
}

interface SmartResultActionsProps {
  calculatorId: string;
  result: number | Record<string, unknown> | null;
  inputs: Record<string, unknown>;
  onNavigate: (calcId: string) => void;
}

function getSmartActions(
  calculatorId: string,
  result: number | Record<string, unknown> | null
): SmartAction[] {
  const actions: SmartAction[] = [];
  const numResult = typeof result === "number" ? result : null;

  switch (calculatorId) {
    case "fena":
      if (numResult !== null && numResult < 1) {
        actions.push({ label: "Calculate Water Deficit", calculatorId: "water-deficit-hypernatremia" });
      }
      if (numResult !== null && numResult > 2) {
        actions.push({ label: "Check Urine Anion Gap (RTA workup)", calculatorId: "urine-anion-gap" });
      }
      break;

    case "feurea":
      if (numResult !== null && numResult < 35) {
        actions.push({ label: "Calculate Water Deficit", calculatorId: "water-deficit-hypernatremia" });
      }
      break;

    case "ckd-epi-creatinine":
    case "cockcroft-gault":
    case "ckd-epi-cystatin-c":
    case "mdrd":
    case "ekfc-creatinine": {
      if (numResult !== null) {
        if (numResult < 15) {
          actions.push({ label: "Check Dialysis Urgency Score", calculatorId: "dialysis-urgency" });
        } else if (numResult < 45) {
          actions.push({ label: "Estimate Kidney Failure Risk (KFRE)", calculatorId: "kfre" });
        }
        if (numResult < 30) {
          actions.push({ label: "Assess PTH Target", calculatorId: "pth-target-ckd" });
          actions.push({ label: "Check Phosphate Management", calculatorId: "phosphate-management" });
        }
      }
      break;
    }

    case "anion-gap":
    case "albumin-corrected-ag":
      if (numResult !== null && numResult > 12) {
        actions.push({ label: "Calculate Delta Gap", calculatorId: "delta-gap" });
        actions.push({ label: "Check Serum Osmolal Gap", calculatorId: "osmolal-gap" });
      }
      break;

    case "delta-gap":
      if (numResult !== null && numResult > 2) {
        actions.push({ label: "Check Osmolal Gap", calculatorId: "osmolal-gap" });
      }
      actions.push({ label: "Verify with Winters' Formula", calculatorId: "winters-formula" });
      break;

    case "corrected-sodium-hyperglycemia":
      actions.push({ label: "Calculate Sodium Correction Rate", calculatorId: "sodium-correction-rate" });
      break;

    case "sodium-correction-rate":
      if (numResult !== null && numResult > 8) {
        actions.push({
          label: "Calculate Sodium Deficit",
          calculatorId: "sodium-deficit",
          warning: "Rate >8 mEq/24h \u2014 ODS risk. Consider DDAVP protocol.",
        });
      }
      break;

    case "water-deficit-hypernatremia":
      actions.push({ label: "Monitor Sodium Correction Rate", calculatorId: "sodium-correction-rate" });
      break;

    case "kdigo-aki-staging":
      if (numResult !== null) {
        if (numResult >= 3) {
          actions.push({ label: "Evaluate Dialysis Urgency", calculatorId: "dialysis-urgency" });
        }
        if (numResult >= 1) {
          actions.push({ label: "Calculate FENa", calculatorId: "fena" });
          actions.push({ label: "Calculate FEUrea", calculatorId: "feurea" });
        }
      }
      break;

    case "corrected-calcium":
      if (numResult !== null && numResult > 10.5) {
        actions.push({ label: "Assess PTH Target", calculatorId: "pth-target-ckd" });
      }
      break;

    case "potassium-repletion":
      actions.push({ label: "Check Magnesium", calculatorId: "magnesium-repletion" });
      break;

    case "magnesium-repletion":
      actions.push({ label: "Check FE-Magnesium", calculatorId: "fe-magnesium" });
      break;

    case "qsofa":
      if (numResult !== null && numResult >= 2) {
        actions.push({ label: "Calculate Full SOFA Score", calculatorId: "sofa" });
      }
      break;

    case "wells-pe":
      if (numResult !== null && numResult <= 4) {
        actions.push({ label: "Apply PERC Rule", calculatorId: "perc" });
      }
      break;

    case "uacr":
      if (numResult !== null && numResult >= 30) {
        actions.push({ label: "Estimate Kidney Failure Risk (KFRE)", calculatorId: "kfre" });
      }
      break;

    case "ktv-hemodialysis":
      if (numResult !== null && numResult < 1.2) {
        actions.push({ label: "Calculate Required Session Duration", calculatorId: "hd-session-duration" });
      }
      break;

    case "dialysis-urgency":
      if (numResult !== null && numResult >= 6) {
        actions.push({ label: "Calculate Kt/V", calculatorId: "ktv-hemodialysis" });
      }
      break;

    case "ca-pho-product":
      if (numResult !== null && numResult > 55) {
        actions.push({
          label: "Phosphate Management Advisor",
          calculatorId: "phosphate-management",
          warning: "Ca\u00D7P >55 \u2014 increased calcification risk.",
        });
      }
      break;
  }

  return actions;
}

export function SmartResultActions({
  calculatorId,
  result,
  inputs: _inputs,
  onNavigate,
}: SmartResultActionsProps) {
  const actions = getSmartActions(calculatorId, result);

  if (actions.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-border/50">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Next:
        </span>
        {actions.map((action) => (
          <div key={action.calculatorId} className="flex flex-col">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onNavigate(action.calculatorId)}
            >
              {action.label}
              <ChevronRight className="w-3 h-3" />
            </Button>
            {action.warning && (
              <span className="text-[10px] text-red-600 dark:text-red-400 mt-0.5 max-w-[250px]">
                {action.warning}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
