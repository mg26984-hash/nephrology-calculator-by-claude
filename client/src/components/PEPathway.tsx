import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Stethoscope,
  ShieldCheck,
  FlaskConical,
  Scan,
  Heart,
  AlertTriangle,
  Pill,
  Check,
  ArrowLeft,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type StepId =
  | "pretest"
  | "perc"
  | "ddimer"
  | "ctpa"
  | "stability"
  | "risk"
  | "treatment"
  | "ruled_out"
  | "excluded"
  | "ctpa_negative";

type RiskCategory = "HIGH" | "INTERMEDIATE-HIGH" | "INTERMEDIATE-LOW" | "LOW";
type PretestRisk = "HIGH" | "MODERATE" | "LOW";
type ScoringSystem = "wells" | "geneva";

interface StepMeta {
  id: StepId;
  label: string;
  icon: React.ReactNode;
}

const STEP_META: Record<string, StepMeta> = {
  pretest: { id: "pretest", label: "Pre-test Probability", icon: <Stethoscope className="w-4 h-4" /> },
  perc: { id: "perc", label: "PERC Rule", icon: <ShieldCheck className="w-4 h-4" /> },
  ddimer: { id: "ddimer", label: "D-Dimer / YEARS", icon: <FlaskConical className="w-4 h-4" /> },
  ctpa: { id: "ctpa", label: "CTPA Result", icon: <Scan className="w-4 h-4" /> },
  stability: { id: "stability", label: "Hemodynamic Stability", icon: <Heart className="w-4 h-4" /> },
  risk: { id: "risk", label: "Risk Stratification", icon: <AlertTriangle className="w-4 h-4" /> },
  treatment: { id: "treatment", label: "Treatment Plan", icon: <Pill className="w-4 h-4" /> },
  ruled_out: { id: "ruled_out", label: "PE Ruled Out", icon: <Check className="w-4 h-4" /> },
  excluded: { id: "excluded", label: "PE Excluded", icon: <Check className="w-4 h-4" /> },
  ctpa_negative: { id: "ctpa_negative", label: "PE Excluded (CTPA)", icon: <Check className="w-4 h-4" /> },
};

// ─── Wells PE Criteria ───────────────────────────────────────────────────────

const WELLS_CRITERIA = [
  { id: "dvt", label: "Clinical signs/symptoms of DVT", points: 3 },
  { id: "altDx", label: "PE is #1 diagnosis, or equally likely", points: 3 },
  { id: "hr100", label: "Heart rate > 100 bpm", points: 1.5 },
  { id: "immob", label: "Immobilization (≥3 days) or surgery in past 4 weeks", points: 1.5 },
  { id: "prevDvtPe", label: "Previous DVT/PE", points: 1.5 },
  { id: "hemoptysis", label: "Hemoptysis", points: 1 },
  { id: "malignancy", label: "Malignancy (treatment within 6 months or palliative)", points: 1 },
];

// ─── Geneva Revised Criteria ─────────────────────────────────────────────────

const GENEVA_CRITERIA = [
  { id: "age65", label: "Age > 65 years", points: 1 },
  { id: "prevDvtPe", label: "Previous DVT or PE", points: 3 },
  { id: "surgery", label: "Surgery or fracture within 1 month", points: 2 },
  { id: "cancer", label: "Active malignancy", points: 2 },
  { id: "uniLegPain", label: "Unilateral lower-limb pain", points: 3 },
  { id: "legPalpation", label: "Pain on lower-limb deep vein palpation and unilateral edema", points: 4 },
  { id: "hr75", label: "Heart rate 75–94 bpm", points: 3 },
  { id: "hr95", label: "Heart rate ≥ 95 bpm", points: 5 },
];

// ─── PERC Criteria ───────────────────────────────────────────────────────────

const PERC_CRITERIA = [
  { id: "age50", label: "Age ≥ 50" },
  { id: "hr100", label: "Heart rate ≥ 100 bpm" },
  { id: "spo2_95", label: "SpO₂ < 95% on room air" },
  { id: "uniLegSwelling", label: "Unilateral leg swelling" },
  { id: "hemoptysis", label: "Hemoptysis" },
  { id: "recentSurgery", label: "Recent surgery or trauma (≤4 weeks)" },
  { id: "prevDvtPe", label: "Prior PE or DVT" },
  { id: "estrogen", label: "Hormone use (estrogen)" },
];

// ─── YEARS Items ─────────────────────────────────────────────────────────────

const YEARS_ITEMS = [
  { id: "dvtSigns", label: "Clinical signs of DVT" },
  { id: "hemoptysis", label: "Hemoptysis" },
  { id: "peMostLikely", label: "PE is the most likely diagnosis" },
];

// ─── sPESI Criteria ──────────────────────────────────────────────────────────

const SPESI_CRITERIA = [
  { id: "age60", label: "Age > 60 years" },
  { id: "cancer", label: "Cancer" },
  { id: "heartFailure", label: "Heart failure or chronic lung disease" },
  { id: "hr110", label: "Heart rate ≥ 110 bpm" },
  { id: "sbp100", label: "Systolic BP < 100 mmHg" },
  { id: "spo2_90", label: "SpO₂ < 90%" },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface PEPathwayProps {
  onClose?: () => void;
}

export function PEPathway({ onClose }: PEPathwayProps) {
  // Navigation state
  const [stepHistory, setStepHistory] = useState<StepId[]>(["pretest"]);
  const currentStep = stepHistory[stepHistory.length - 1];

  // Pre-test probability
  const [scoringSystem, setScoringSystem] = useState<ScoringSystem>("wells");
  const [wellsInputs, setWellsInputs] = useState<Record<string, boolean>>(
    () => Object.fromEntries(WELLS_CRITERIA.map((c) => [c.id, false]))
  );
  const [genevaInputs, setGenevaInputs] = useState<Record<string, boolean>>(
    () => Object.fromEntries(GENEVA_CRITERIA.map((c) => [c.id, false]))
  );

  // PERC
  const [percInputs, setPercInputs] = useState<Record<string, boolean>>(
    () => Object.fromEntries(PERC_CRITERIA.map((c) => [c.id, false]))
  );

  // D-Dimer / YEARS
  const [patientAge, setPatientAge] = useState("");
  const [ddimerValue, setDdimerValue] = useState("");
  const [yearsInputs, setYearsInputs] = useState<Record<string, boolean>>(
    () => Object.fromEntries(YEARS_ITEMS.map((c) => [c.id, false]))
  );

  // CTPA
  const [ctpaPositive, setCtpaPositive] = useState<boolean | null>(null);

  // Hemodynamic Stability
  const [hemodynamicallyUnstable, setHemodynamicallyUnstable] = useState<boolean | null>(null);

  // sPESI + RV + Troponin
  const [spesiInputs, setSpesiInputs] = useState<Record<string, boolean>>(
    () => Object.fromEntries(SPESI_CRITERIA.map((c) => [c.id, false]))
  );
  const [rvDysfunction, setRvDysfunction] = useState<boolean | null>(null);
  const [troponinElevated, setTroponinElevated] = useState<boolean | null>(null);

  // ─── Computed Scores ─────────────────────────────────────────────────────

  const wellsScore = useMemo(
    () => WELLS_CRITERIA.reduce((sum, c) => sum + (wellsInputs[c.id] ? c.points : 0), 0),
    [wellsInputs]
  );

  const genevaScore = useMemo(
    () => GENEVA_CRITERIA.reduce((sum, c) => sum + (genevaInputs[c.id] ? c.points : 0), 0),
    [genevaInputs]
  );

  const pretestRisk = useMemo((): PretestRisk => {
    if (scoringSystem === "wells") {
      if (wellsScore > 6) return "HIGH";
      if (wellsScore >= 2) return "MODERATE";
      return "LOW";
    }
    // Geneva
    if (genevaScore >= 11) return "HIGH";
    if (genevaScore >= 4) return "MODERATE";
    return "LOW";
  }, [scoringSystem, wellsScore, genevaScore]);

  const percAllNegative = useMemo(
    () => Object.values(percInputs).every((v) => !v),
    [percInputs]
  );

  const yearsCount = useMemo(
    () => Object.values(yearsInputs).filter(Boolean).length,
    [yearsInputs]
  );

  const ddimerCutoff = useMemo(() => {
    const age = Number(patientAge) || 0;
    const yearsCutoff = yearsCount === 0 ? 1000 : 500;
    const ageAdjusted = age > 50 ? age * 10 : 500;
    return { yearsCutoff, ageAdjusted, applicable: yearsCutoff };
  }, [yearsCount, patientAge]);

  const ddimerPositive = useMemo(() => {
    const val = Number(ddimerValue) || 0;
    return val >= ddimerCutoff.applicable;
  }, [ddimerValue, ddimerCutoff]);

  const spesiScore = useMemo(
    () => SPESI_CRITERIA.reduce((sum, c) => sum + (spesiInputs[c.id] ? 1 : 0), 0),
    [spesiInputs]
  );

  const riskCategory = useMemo((): RiskCategory => {
    if (hemodynamicallyUnstable) return "HIGH";
    if (spesiScore >= 1 && rvDysfunction && troponinElevated) return "INTERMEDIATE-HIGH";
    if (spesiScore >= 1) return "INTERMEDIATE-LOW";
    return "LOW";
  }, [hemodynamicallyUnstable, spesiScore, rvDysfunction, troponinElevated]);

  // ─── Navigation ──────────────────────────────────────────────────────────

  const goTo = (step: StepId) => {
    setStepHistory((prev) => [...prev, step]);
  };

  const goBack = () => {
    if (stepHistory.length > 1) {
      setStepHistory((prev) => prev.slice(0, -1));
    }
  };

  const restart = () => {
    setStepHistory(["pretest"]);
    setScoringSystem("wells");
    setWellsInputs(Object.fromEntries(WELLS_CRITERIA.map((c) => [c.id, false])));
    setGenevaInputs(Object.fromEntries(GENEVA_CRITERIA.map((c) => [c.id, false])));
    setPercInputs(Object.fromEntries(PERC_CRITERIA.map((c) => [c.id, false])));
    setPatientAge("");
    setDdimerValue("");
    setYearsInputs(Object.fromEntries(YEARS_ITEMS.map((c) => [c.id, false])));
    setCtpaPositive(null);
    setHemodynamicallyUnstable(null);
    setSpesiInputs(Object.fromEntries(SPESI_CRITERIA.map((c) => [c.id, false])));
    setRvDysfunction(null);
    setTroponinElevated(null);
  };

  // ─── Pretest Step Logic ──────────────────────────────────────────────────

  const handlePretestNext = () => {
    if (pretestRisk === "HIGH") {
      goTo("ctpa");
    } else {
      goTo("perc");
    }
  };

  const handlePercNext = () => {
    if (percAllNegative) {
      goTo("ruled_out");
    } else {
      goTo("ddimer");
    }
  };

  const handleDdimerNext = () => {
    if (ddimerPositive) {
      goTo("ctpa");
    } else {
      goTo("excluded");
    }
  };

  const handleCtpaNext = () => {
    if (ctpaPositive) {
      goTo("stability");
    } else {
      goTo("ctpa_negative");
    }
  };

  const handleStabilityNext = () => {
    if (hemodynamicallyUnstable) {
      goTo("treatment");
    } else {
      goTo("risk");
    }
  };

  const handleRiskNext = () => {
    goTo("treatment");
  };

  // ─── Breadcrumb ──────────────────────────────────────────────────────────

  const renderBreadcrumb = () => (
    <div className="flex items-center gap-1 flex-wrap text-sm mb-4">
      {stepHistory.map((stepId, i) => {
        const meta = STEP_META[stepId];
        if (!meta) return null;
        const isLast = i === stepHistory.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            <span
              className={
                isLast
                  ? "font-medium text-foreground flex items-center gap-1"
                  : "text-muted-foreground flex items-center gap-1"
              }
            >
              {meta.icon}
              {meta.label}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );

  // ─── Helper: Checkbox Row ────────────────────────────────────────────────

  const renderCheckboxRow = (
    id: string,
    label: string,
    checked: boolean,
    onChange: (v: boolean) => void,
    points?: number
  ) => (
    <label
      key={id}
      htmlFor={`pe-${id}`}
      className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
    >
      <Checkbox
        id={`pe-${id}`}
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        className="mt-0.5"
      />
      <span className="text-sm flex-1">{label}</span>
      {points !== undefined && (
        <Badge variant="secondary" className="text-xs shrink-0">
          {points} pt{points !== 1 ? "s" : ""}
        </Badge>
      )}
    </label>
  );

  // ─── Helper: Binary Choice ──────────────────────────────────────────────

  const renderBinaryChoice = (
    value: boolean | null,
    onChange: (v: boolean) => void,
    yesLabel: string,
    noLabel: string,
    yesColor?: string,
    noColor?: string
  ) => (
    <div className="flex gap-3">
      <Button
        variant={value === true ? "default" : "outline"}
        className={`flex-1 ${value === true ? yesColor || "" : ""}`}
        onClick={() => onChange(true)}
      >
        {yesLabel}
      </Button>
      <Button
        variant={value === false ? "default" : "outline"}
        className={`flex-1 ${value === false ? noColor || "" : ""}`}
        onClick={() => onChange(false)}
      >
        {noLabel}
      </Button>
    </div>
  );

  // ─── Risk Color Helpers ──────────────────────────────────────────────────

  const getRiskColors = (risk: PretestRisk | RiskCategory) => {
    switch (risk) {
      case "HIGH":
        return {
          bg: "bg-red-50 dark:bg-red-950/30",
          border: "border-red-200 dark:border-red-800",
          text: "text-red-700 dark:text-red-400",
          badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
      case "INTERMEDIATE-HIGH":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/30",
          border: "border-amber-200 dark:border-amber-800",
          text: "text-amber-700 dark:text-amber-400",
          badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        };
      case "MODERATE":
      case "INTERMEDIATE-LOW":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-950/30",
          border: "border-yellow-200 dark:border-yellow-800",
          text: "text-yellow-700 dark:text-yellow-400",
          badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        };
      case "LOW":
        return {
          bg: "bg-green-50 dark:bg-green-950/30",
          border: "border-green-200 dark:border-green-800",
          text: "text-green-700 dark:text-green-400",
          badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
    }
  };

  // ─── Step Renderers ──────────────────────────────────────────────────────

  const renderPretest = () => {
    const score = scoringSystem === "wells" ? wellsScore : genevaScore;
    const criteria = scoringSystem === "wells" ? WELLS_CRITERIA : GENEVA_CRITERIA;
    const inputs = scoringSystem === "wells" ? wellsInputs : genevaInputs;
    const setInputs = scoringSystem === "wells" ? setWellsInputs : setGenevaInputs;
    const colors = getRiskColors(pretestRisk);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Pre-test Probability
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg border p-1 gap-1">
          <Button
            variant={scoringSystem === "wells" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setScoringSystem("wells")}
          >
            Wells Score
          </Button>
          <Button
            variant={scoringSystem === "geneva" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setScoringSystem("geneva")}
          >
            Geneva Revised
          </Button>
        </div>

        {/* Criteria */}
        <div className="space-y-1">
          {criteria.map((c) =>
            renderCheckboxRow(
              `${scoringSystem}-${c.id}`,
              c.label,
              inputs[c.id],
              (v) => setInputs((prev) => ({ ...prev, [c.id]: v })),
              c.points
            )
          )}
        </div>

        {/* Score Display */}
        <div className={`rounded-lg border p-4 ${colors.bg} ${colors.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {scoringSystem === "wells" ? "Wells" : "Geneva Revised"} Score
              </p>
              <p className="text-2xl font-bold">{score}</p>
            </div>
            <Badge className={colors.badge}>
              {pretestRisk === "MODERATE" ? "MODERATE" : pretestRisk} Risk
            </Badge>
          </div>
          <p className="text-sm mt-2 text-muted-foreground">
            {scoringSystem === "wells"
              ? ">6 = High, 2–6 = Moderate, <2 = Low"
              : "≥11 = High, 4–10 = Moderate, 0–3 = Low"}
          </p>
        </div>

        {/* Next */}
        <Button className="w-full" onClick={handlePretestNext}>
          Continue — {pretestRisk === "HIGH" ? "Proceed to CTPA" : "Check PERC Rule"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>

        {pretestRisk === "HIGH" && (
          <p className="text-sm text-muted-foreground text-center">
            High pre-test probability — skip PERC and D-Dimer, proceed directly to CTPA
          </p>
        )}
      </div>
    );
  };

  const renderPerc = () => {
    const anyPositive = Object.values(percInputs).some(Boolean);
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          PERC Rule
        </h3>
        <p className="text-sm text-muted-foreground">
          If ALL 8 criteria are <strong>negative</strong> (unchecked), PE can be ruled out without further testing.
        </p>

        <div className="space-y-1">
          {PERC_CRITERIA.map((c) =>
            renderCheckboxRow(
              `perc-${c.id}`,
              c.label,
              percInputs[c.id],
              (v) => setPercInputs((prev) => ({ ...prev, [c.id]: v }))
            )
          )}
        </div>

        {/* Result preview */}
        <div
          className={`rounded-lg border p-4 ${
            anyPositive
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
              : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
          }`}
        >
          {anyPositive ? (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-300">
                  PERC Positive — {Object.values(percInputs).filter(Boolean).length} criterion(s) present
                </p>
                <p className="text-sm text-muted-foreground">Proceed to D-Dimer</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">
                  All PERC Negative
                </p>
                <p className="text-sm text-muted-foreground">PE can be clinically ruled out</p>
              </div>
            </div>
          )}
        </div>

        <Button className="w-full" onClick={handlePercNext}>
          {percAllNegative ? "PE Ruled Out" : "Continue to D-Dimer"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  };

  const renderDdimer = () => {
    const age = Number(patientAge) || 0;
    const val = Number(ddimerValue) || 0;
    const hasInput = ddimerValue !== "" && patientAge !== "";

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FlaskConical className="w-5 h-5" />
          D-Dimer + YEARS Algorithm
        </h3>

        {/* YEARS items */}
        <div>
          <Label className="text-sm font-medium mb-2 block">YEARS Items</Label>
          <div className="space-y-1">
            {YEARS_ITEMS.map((c) =>
              renderCheckboxRow(
                `years-${c.id}`,
                c.label,
                yearsInputs[c.id],
                (v) => setYearsInputs((prev) => ({ ...prev, [c.id]: v }))
              )
            )}
          </div>
        </div>

        {/* Age + D-Dimer inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pe-age" className="text-sm mb-1 block">
              Patient Age
            </Label>
            <Input
              id="pe-age"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 55"
              value={patientAge}
              onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value)) setPatientAge(e.target.value); }}
            />
          </div>
          <div>
            <Label htmlFor="pe-ddimer" className="text-sm mb-1 block">
              D-Dimer (ng/mL)
            </Label>
            <Input
              id="pe-ddimer"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 600"
              value={ddimerValue}
              onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value)) setDdimerValue(e.target.value); }}
            />
          </div>
        </div>

        {/* Cutoff display */}
        <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
          <p className="text-sm font-medium">Applicable Cutoffs:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">YEARS cutoff: </span>
              <span className="font-medium">
                {yearsCount === 0 ? "1,000" : "500"} ng/mL
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                ({yearsCount} item{yearsCount !== 1 ? "s" : ""})
              </span>
            </div>
            {age > 50 && (
              <div>
                <span className="text-muted-foreground">Age-adjusted: </span>
                <span className="font-medium">{(age * 10).toLocaleString()} ng/mL</span>
                <span className="text-xs text-muted-foreground ml-1">(age × 10)</span>
              </div>
            )}
          </div>
        </div>

        {/* Result preview */}
        {hasInput && (
          <div
            className={`rounded-lg border p-4 ${
              ddimerPositive
                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
            }`}
          >
            {ddimerPositive ? (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">
                    D-Dimer Positive ({val.toLocaleString()} ≥ {ddimerCutoff.applicable.toLocaleString()} ng/mL)
                  </p>
                  <p className="text-sm text-muted-foreground">Proceed to CTPA</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-300">
                    D-Dimer Negative ({val.toLocaleString()} &lt; {ddimerCutoff.applicable.toLocaleString()} ng/mL)
                  </p>
                  <p className="text-sm text-muted-foreground">PE can be excluded</p>
                </div>
              </div>
            )}
          </div>
        )}

        <Button className="w-full" disabled={!hasInput} onClick={handleDdimerNext}>
          {!hasInput
            ? "Enter age and D-Dimer to continue"
            : ddimerPositive
            ? "Continue to CTPA"
            : "PE Excluded"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  };

  const renderCtpa = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Scan className="w-5 h-5" />
        CTPA Result
      </h3>
      <p className="text-sm text-muted-foreground">
        CT Pulmonary Angiography result:
      </p>

      {renderBinaryChoice(
        ctpaPositive,
        setCtpaPositive,
        "PE Confirmed",
        "PE Negative",
        "bg-red-600 hover:bg-red-700 text-white",
        "bg-green-600 hover:bg-green-700 text-white"
      )}

      {ctpaPositive !== null && (
        <div
          className={`rounded-lg border p-4 ${
            ctpaPositive
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
          }`}
        >
          {ctpaPositive ? (
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              PE confirmed — assess hemodynamic stability
            </p>
          ) : (
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              CTPA negative — consider alternative diagnoses
            </p>
          )}
        </div>
      )}

      <Button className="w-full" disabled={ctpaPositive === null} onClick={handleCtpaNext}>
        {ctpaPositive === null
          ? "Select CTPA result to continue"
          : ctpaPositive
          ? "Assess Hemodynamic Stability"
          : "PE Excluded"}
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderStability = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Heart className="w-5 h-5" />
        Hemodynamic Stability
      </h3>
      <p className="text-sm text-muted-foreground">
        Hemodynamic instability: sustained hypotension (SBP &lt;90 mmHg for ≥15 min), need for vasopressors, or cardiac arrest/obstructive shock.
      </p>

      {renderBinaryChoice(
        hemodynamicallyUnstable,
        setHemodynamicallyUnstable,
        "Unstable",
        "Stable",
        "bg-red-600 hover:bg-red-700 text-white",
        "bg-green-600 hover:bg-green-700 text-white"
      )}

      {hemodynamicallyUnstable !== null && (
        <div
          className={`rounded-lg border p-4 ${
            hemodynamicallyUnstable
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
          }`}
        >
          {hemodynamicallyUnstable ? (
            <div>
              <p className="font-medium text-red-700 dark:text-red-300">
                HIGH RISK — Massive PE
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Proceed directly to high-risk treatment protocol
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              Hemodynamically stable — proceed to risk stratification
            </p>
          )}
        </div>
      )}

      <Button className="w-full" disabled={hemodynamicallyUnstable === null} onClick={handleStabilityNext}>
        {hemodynamicallyUnstable === null
          ? "Select stability status to continue"
          : hemodynamicallyUnstable
          ? "High-Risk Treatment Plan"
          : "Risk Stratification (sPESI)"}
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderRisk = () => {
    const colors = getRiskColors(riskCategory);
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Risk Stratification
        </h3>

        {/* sPESI */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Simplified PESI (sPESI) — {spesiScore} point{spesiScore !== 1 ? "s" : ""}
          </Label>
          <div className="space-y-1">
            {SPESI_CRITERIA.map((c) =>
              renderCheckboxRow(
                `spesi-${c.id}`,
                c.label,
                spesiInputs[c.id],
                (v) => setSpesiInputs((prev) => ({ ...prev, [c.id]: v }))
              )
            )}
          </div>
        </div>

        {/* RV Dysfunction */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            RV Dysfunction (echo or CT RV/LV ratio &gt;0.9)?
          </Label>
          {renderBinaryChoice(rvDysfunction, setRvDysfunction, "Yes", "No")}
        </div>

        {/* Troponin */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Troponin Elevated?
          </Label>
          {renderBinaryChoice(troponinElevated, setTroponinElevated, "Yes", "No")}
        </div>

        {/* Risk Result */}
        <div className={`rounded-lg border p-4 ${colors.bg} ${colors.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Risk Category</p>
              <p className="text-xl font-bold">{riskCategory}</p>
            </div>
            <Badge className={colors.badge}>{riskCategory}</Badge>
          </div>
          <p className="text-sm mt-2 text-muted-foreground">
            sPESI: {spesiScore} | RV dysfunction: {rvDysfunction ? "Yes" : rvDysfunction === false ? "No" : "—"} | Troponin: {troponinElevated ? "Elevated" : troponinElevated === false ? "Normal" : "—"}
          </p>
        </div>

        <Button className="w-full" onClick={handleRiskNext}>
          View Treatment Plan
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  };

  const renderTreatment = () => {
    const risk = hemodynamicallyUnstable ? "HIGH" : riskCategory;
    const colors = getRiskColors(risk);

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Pill className="w-5 h-5" />
          Treatment Plan
        </h3>

        <div className={`rounded-lg border-2 p-4 ${colors.bg} ${colors.border}`}>
          <Badge className={`${colors.badge} mb-3`}>{risk} RISK</Badge>

          {risk === "HIGH" && (
            <div className="space-y-3">
              <h4 className="font-semibold text-red-700 dark:text-red-300">
                Massive PE — Emergency Treatment
              </h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">1.</span>
                  <div>
                    <p className="font-medium">UFH Anticoagulation</p>
                    <p className="text-muted-foreground">80 units/kg IV bolus → 18 units/kg/hr infusion</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">2.</span>
                  <div>
                    <p className="font-medium">Hemodynamic Support</p>
                    <p className="text-muted-foreground">IV fluids (cautious, ≤500 mL), vasopressors (norepinephrine preferred)</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">3.</span>
                  <div>
                    <p className="font-medium">Systemic Thrombolysis</p>
                    <p className="text-muted-foreground">Alteplase 100 mg IV over 2 hours (or 0.6 mg/kg over 15 min if cardiac arrest)</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">4.</span>
                  <div>
                    <p className="font-medium">Rescue if Thrombolysis Fails</p>
                    <p className="text-muted-foreground">Catheter-directed therapy (CDT) or surgical embolectomy</p>
                  </div>
                </li>
              </ul>
            </div>
          )}

          {risk === "INTERMEDIATE-HIGH" && (
            <div className="space-y-3">
              <h4 className="font-semibold text-amber-700 dark:text-amber-300">
                Submassive PE — ICU Monitoring
              </h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">1.</span>
                  <div>
                    <p className="font-medium">ICU Admission + Monitoring</p>
                    <p className="text-muted-foreground">Continuous telemetry, serial troponin, watch for hemodynamic deterioration</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">2.</span>
                  <div>
                    <p className="font-medium">Anticoagulation</p>
                    <p className="text-muted-foreground">LMWH, UFH, or fondaparinux; transition to DOAC when stable</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">3.</span>
                  <div>
                    <p className="font-medium">Rescue Reperfusion</p>
                    <p className="text-muted-foreground">If hemodynamic deterioration → systemic thrombolysis or CDT</p>
                  </div>
                </li>
              </ul>
            </div>
          )}

          {risk === "INTERMEDIATE-LOW" && (
            <div className="space-y-3">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">
                Submassive PE — Ward Admission
              </h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">1.</span>
                  <div>
                    <p className="font-medium">Ward + Telemetry</p>
                    <p className="text-muted-foreground">Admit to monitored ward, reassess at 24–48h</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">2.</span>
                  <div>
                    <p className="font-medium">DOAC Preferred</p>
                    <p className="text-muted-foreground">
                      Apixaban 10 mg BID × 7 days → 5 mg BID, or<br />
                      Rivaroxaban 15 mg BID × 21 days → 20 mg daily
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">3.</span>
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">Minimum 3 months; extended if unprovoked or persistent risk factors</p>
                  </div>
                </li>
              </ul>
            </div>
          )}

          {risk === "LOW" && (
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700 dark:text-green-300">
                Low-Risk PE — Outpatient Eligible
              </h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">1.</span>
                  <div>
                    <p className="font-medium">Consider Early Discharge</p>
                    <p className="text-muted-foreground">Hestia criteria or sPESI 0 — outpatient management if safe</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">2.</span>
                  <div>
                    <p className="font-medium">DOAC Anticoagulation</p>
                    <p className="text-muted-foreground">
                      Apixaban 10 mg BID × 7 days → 5 mg BID, or<br />
                      Rivaroxaban 15 mg BID × 21 days → 20 mg daily
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium shrink-0">3.</span>
                  <div>
                    <p className="font-medium">Follow-up</p>
                    <p className="text-muted-foreground">48–72 hour clinic follow-up, patient education on warning signs</p>
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-lg border p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> This pathway is for educational/clinical decision support only. Always apply clinical judgment and consult institutional protocols. ESC/AHA guidelines should be referenced for the most current recommendations.
          </p>
        </div>
      </div>
    );
  };

  // ─── Terminal Outcome Cards ──────────────────────────────────────────────

  const renderRuledOut = () => (
    <div className="space-y-4">
      <div className="rounded-lg border-2 p-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-center">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
          PE Ruled Out
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Low pre-test probability + all PERC criteria negative.<br />
          No further workup needed for PE.
        </p>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          PERC Negative
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Consider alternative diagnoses if symptoms persist.
      </p>
    </div>
  );

  const renderExcluded = () => (
    <div className="space-y-4">
      <div className="rounded-lg border-2 p-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-center">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
          PE Excluded
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          D-Dimer below the YEARS-adjusted threshold.<br />
          PE can be safely excluded without imaging.
        </p>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          D-Dimer Negative
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Consider alternative diagnoses if symptoms persist.
      </p>
    </div>
  );

  const renderCtpaNegative = () => (
    <div className="space-y-4">
      <div className="rounded-lg border-2 p-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-center">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
          PE Excluded (CTPA Negative)
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          CTPA did not demonstrate pulmonary embolism.<br />
          Consider alternative diagnoses.
        </p>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          CTPA Negative
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        If clinical suspicion remains high despite negative CTPA, consider further imaging or consultation.
      </p>
    </div>
  );

  // ─── Main Render ─────────────────────────────────────────────────────────

  const isTerminal = ["ruled_out", "excluded", "ctpa_negative", "treatment"].includes(currentStep);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "pretest": return renderPretest();
      case "perc": return renderPerc();
      case "ddimer": return renderDdimer();
      case "ctpa": return renderCtpa();
      case "stability": return renderStability();
      case "risk": return renderRisk();
      case "treatment": return renderTreatment();
      case "ruled_out": return renderRuledOut();
      case "excluded": return renderExcluded();
      case "ctpa_negative": return renderCtpaNegative();
      default: return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            PE Clinical Pathway
          </CardTitle>
          <div className="flex items-center gap-2">
            {stepHistory.length > 1 && (
              <Button variant="outline" size="sm" onClick={goBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={restart}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Restart
            </Button>
          </div>
        </div>
        {renderBreadcrumb()}
      </CardHeader>
      <CardContent>{renderCurrentStep()}</CardContent>
    </Card>
  );
}
