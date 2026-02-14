import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, ArrowLeftRight, Info, Users, Baby, UserCheck, Globe, Ruler } from "lucide-react";
import { ckdEpiCreatinine, cockcrofGault, bis1Elderly, fasFullAgeSpectrum, schwartzPediatric } from "@/lib/calculators";

interface EGFRComparisonProps {
  onClose?: () => void;
}

// MDRD function (inline since not exported from calculators.ts)
function mdrdGfr(
  creatinine: number,
  age: number,
  sex: "M" | "F",
  race: "Black" | "Other",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  let creatMgDl = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;
  
  let gfr = 175 * Math.pow(creatMgDl, -1.154) * Math.pow(age, -0.203);
  if (sex === "F") gfr *= 0.742;
  if (race === "Black") gfr *= 1.212;
  
  return Math.round(gfr);
}

// Equation metadata with population/indication information
const equationInfo = {
  ckdEpi: {
    name: "CKD-EPI 2021",
    shortDesc: "Race-free equation (recommended)",
    population: "General adult population (≥18 years)",
    indication: "First-line equation recommended by KDIGO 2024 guidelines. Most accurate across all GFR ranges. Does not include race as a variable.",
    icon: UserCheck,
    highlight: true,
  },
  schwartz: {
    name: "Schwartz Bedside",
    shortDesc: "Pediatric equation (age 1-17 years)",
    population: "Children and adolescents (1-17 years)",
    indication: "The bedside Schwartz equation is the recommended formula for estimating GFR in children. Uses height and creatinine. Simple and validated across pediatric age groups. Not suitable for adults.",
    icon: Baby,
    highlight: false,
  },
  mdrd: {
    name: "MDRD-4",
    shortDesc: "Legacy equation with race factor",
    population: "Adults with CKD (eGFR <60)",
    indication: "Older equation, less accurate at eGFR >60. Still used in some laboratories. Includes race coefficient which is now discouraged.",
    icon: Users,
    highlight: false,
  },
  cockcroftGault: {
    name: "Cockcroft-Gault",
    shortDesc: "Creatinine clearance (not BSA-adjusted)",
    population: "Drug dosing calculations",
    indication: "Estimates creatinine clearance (CrCl), not eGFR. Required for many drug dosing guidelines. Not BSA-adjusted. May overestimate in obese patients.",
    icon: Calculator,
    highlight: false,
  },

  bis1: {
    name: "BIS1 (Berlin Initiative)",
    shortDesc: "Optimized for elderly ≥70 years",
    population: "Elderly patients (≥70 years)",
    indication: "Specifically developed for patients aged 70 and older. Better accuracy than CKD-EPI in elderly populations. Does not include race. Consider BIS2 (cystatin C-based) for even better accuracy.",
    icon: Users,
    highlight: false,
  },
  fas: {
    name: "FAS (Full Age Spectrum)",
    shortDesc: "Children to elderly, continuous",
    population: "All ages (2 years to elderly)",
    indication: "Single equation valid from age 2 to elderly without discontinuity. Uses population-normalized creatinine (SCr/Q) approach. Particularly useful for adolescents transitioning to adult care. Age adjustment applied for patients ≥40 years.",
    icon: Baby,
    highlight: false,
  },
};

export function EGFRComparison({ onClose }: EGFRComparisonProps) {
  // Patient data state
  const [age, setAge] = useState<string>("55");
  const [sex, setSex] = useState<"M" | "F">("M");
  const [race, setRace] = useState<"Black" | "Other">("Other");
  const [creatinine, setCreatinine] = useState<string>("1.2");
  const [creatinineUnit, setCreatinineUnit] = useState<"mg/dL" | "μmol/L">("mg/dL");
  const [weight, setWeight] = useState<string>("70");
  const [height, setHeight] = useState<string>(""); // For Schwartz equation
  const [calculated, setCalculated] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  // Check if patient is pediatric
  const isPediatric = parseFloat(age) < 18 && parseFloat(age) >= 1;

  // Calculate all eGFR values
  const results = useMemo(() => {
    if (!calculated) return null;
    
    const ageNum = parseFloat(age);
    const creatNum = parseFloat(creatinine);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    
    if (isNaN(ageNum) || isNaN(creatNum) || ageNum <= 0 || creatNum <= 0) {
      return null;
    }

    const ckdEpi = ckdEpiCreatinine(creatNum, ageNum, sex, race, creatinineUnit);
    const mdrd = mdrdGfr(creatNum, ageNum, sex, race, creatinineUnit);
    const cockcroftGault = !isNaN(weightNum) && weightNum > 0 
      ? cockcrofGault(creatNum, ageNum, weightNum, sex, creatinineUnit)
      : null;

    const bis1 = bis1Elderly(creatNum, ageNum, sex, creatinineUnit);
    const fas = fasFullAgeSpectrum(creatNum, ageNum, sex, creatinineUnit);
    
    // Schwartz for pediatric patients (requires height)
    const schwartz = (ageNum >= 1 && ageNum < 18 && !isNaN(heightNum) && heightNum > 0)
      ? schwartzPediatric(creatNum, heightNum, creatinineUnit)
      : null;

    return {
      ckdEpi,
      mdrd,
      cockcroftGault,

      bis1,
      fas,
      schwartz,
      ageNum,
      isPediatric: ageNum >= 1 && ageNum < 18,
    };
  }, [calculated, age, creatinine, creatinineUnit, sex, race, weight, height]);

  const handleCalculate = () => {
    setCalculated(true);
  };

  const handleReset = () => {
    setCalculated(false);
    setExpandedInfo(null);
  };

  const getCKDStage = (egfr: number): { stage: string; color: string; description: string } => {
    if (egfr >= 90) return { stage: "G1", color: "bg-green-500", description: "Normal or high" };
    if (egfr >= 60) return { stage: "G2", color: "bg-yellow-500", description: "Mildly decreased" };
    if (egfr >= 45) return { stage: "G3a", color: "bg-orange-400", description: "Mildly to moderately decreased" };
    if (egfr >= 30) return { stage: "G3b", color: "bg-orange-500", description: "Moderately to severely decreased" };
    if (egfr >= 15) return { stage: "G4", color: "bg-red-400", description: "Severely decreased" };
    return { stage: "G5", color: "bg-red-600", description: "Kidney failure" };
  };

  // Determine which equations are most appropriate for this patient
  const getRecommendation = () => {
    if (!results) return null;
    const ageNum = results.ageNum;
    
    const recommendations: string[] = [];
    
    if (ageNum >= 1 && ageNum < 18) {
      recommendations.push("Schwartz Bedside equation is the recommended first-line equation for pediatric patients (age 1-17 years). Requires height measurement.");
      recommendations.push("FAS equation can also be used for children ≥2 years and provides continuous estimates through adolescence into adulthood.");
    } else if (ageNum >= 70) {
      recommendations.push("BIS1 is specifically optimized for patients ≥70 years and may provide better accuracy than CKD-EPI in this age group.");
    } else if (ageNum >= 18 && ageNum < 70) {
      recommendations.push("CKD-EPI 2021 is the recommended first-line equation for adults 18-69 years per KDIGO guidelines.");
    }
    
    return recommendations;
  };

  // Get the number of equations being compared
  const getEquationCount = () => {
    if (results?.isPediatric) return 6; // Including Schwartz
    return 5;
  };

  const renderEquationResult = (
    key: keyof typeof equationInfo,
    value: number | null,
    unit: string = "mL/min/1.73m²",
    requiresInput?: string
  ) => {
    const info = equationInfo[key];
    const Icon = info.icon;
    const isExpanded = expandedInfo === key;
    const isRecommended = results && (
      (key === "schwartz" && results.isPediatric) ||
      (key === "bis1" && results.ageNum >= 70) ||
      (key === "fas" && results.isPediatric && !results.schwartz) ||
      (key === "ckdEpi" && results.ageNum >= 18 && results.ageNum < 70)
    );

    return (
      <div 
        key={key}
        className={`rounded-lg border transition-all ${
          info.highlight ? "bg-primary/5 border-primary/30" : "bg-muted/50"
        } ${isRecommended ? "ring-2 ring-primary/50" : ""}`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${info.highlight ? "bg-primary/10" : "bg-muted"}`}>
              <Icon className={`h-4 w-4 ${info.highlight ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{info.name}</span>
                {isRecommended && (
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300">
                    Recommended for this patient
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{info.shortDesc}</div>
              <button
                type="button"
                onClick={() => setExpandedInfo(isExpanded ? null : key)}
                className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
              >
                <Info className="h-3 w-3" />
                {isExpanded ? "Hide details" : "View population & indication"}
              </button>
            </div>
          </div>
          <div className="text-right">
            {value !== null ? (
              <>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{unit}</div>
                <Badge className={`mt-1 ${getCKDStage(value).color}`}>
                  {getCKDStage(value).stage}: {getCKDStage(value).description}
                </Badge>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                {requiresInput || "N/A"}
              </div>
            )}
          </div>
        </div>
        
        {/* Expanded population/indication info */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-0 border-t mt-2">
            <div className="grid gap-2 text-sm mt-3">
              <div>
                <span className="font-medium text-primary">Target Population:</span>
                <span className="ml-2">{info.population}</span>
              </div>
              <div>
                <span className="font-medium text-primary">Clinical Indication:</span>
                <p className="text-muted-foreground mt-1">{info.indication}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">eGFR Equation Comparison</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Compare eGFR results from {isPediatric ? "6" : "5"} equations with population-specific recommendations
          {isPediatric && <span className="text-primary font-medium"> (including pediatric Schwartz)</span>}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="comp-age">Age (years)</Label>
            <Input
              id="comp-age"
              type="number"
              value={age}
              onChange={(e) => { setAge(e.target.value); setCalculated(false); }}
              placeholder="55"
            />
            {isPediatric && (
              <p className="text-xs text-primary font-medium">Pediatric patient detected</p>
            )}
          </div>

          {/* Creatinine with unit toggle */}
          <div className="space-y-2">
            <Label htmlFor="comp-creatinine">Serum Creatinine</Label>
            <div className="flex gap-1">
              <Input
                id="comp-creatinine"
                type="number"
                step="0.1"
                value={creatinine}
                onChange={(e) => { setCreatinine(e.target.value); setCalculated(false); }}
                placeholder={creatinineUnit === "mg/dL" ? "1.2" : "106"}
                className="flex-1"
              />
              <div className="flex rounded-md border overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setCreatinineUnit("mg/dL"); setCalculated(false); }}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    creatinineUnit === "mg/dL"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  mg/dL
                </button>
                <button
                  type="button"
                  onClick={() => { setCreatinineUnit("μmol/L"); setCalculated(false); }}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    creatinineUnit === "μmol/L"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  μmol/L
                </button>
              </div>
            </div>
          </div>

          {/* Weight (for Cockcroft-Gault) */}
          <div className="space-y-2">
            <Label htmlFor="comp-weight">Weight (kg)</Label>
            <Input
              id="comp-weight"
              type="number"
              value={weight}
              onChange={(e) => { setWeight(e.target.value); setCalculated(false); }}
              placeholder="70"
            />
            <p className="text-xs text-muted-foreground">For Cockcroft-Gault</p>
          </div>

          {/* Height (for Schwartz - shown when pediatric) */}
          {isPediatric && (
            <div className="space-y-2">
              <Label htmlFor="comp-height" className="flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                Height (cm)
              </Label>
              <Input
                id="comp-height"
                type="number"
                value={height}
                onChange={(e) => { setHeight(e.target.value); setCalculated(false); }}
                placeholder="120"
                className="border-primary/50"
              />
              <p className="text-xs text-primary font-medium">Required for Schwartz</p>
            </div>
          )}

          {/* Sex */}
          <div className="space-y-2">
            <Label>Sex</Label>
            <Select value={sex} onValueChange={(v) => { setSex(v as "M" | "F"); setCalculated(false); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Race (for MDRD) */}
          <div className="space-y-2">
            <Label>Race</Label>
            <Select value={race} onValueChange={(v) => { setRace(v as "Black" | "Other"); setCalculated(false); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Other">Non-Black</SelectItem>
                <SelectItem value="Black">Black</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">For MDRD only</p>
          </div>
        </div>

        {/* Calculate Button */}
        <div className="flex gap-2">
          <Button onClick={handleCalculate} className="flex-1">
            <Calculator className="h-4 w-4 mr-2" />
            Compare All {getEquationCount()} Equations
          </Button>
          {calculated && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-4">
            {/* Patient-specific recommendations */}
            {getRecommendation() && getRecommendation()!.length > 0 && (
              <div className={`p-4 rounded-lg border ${
                results.isPediatric 
                  ? "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800"
                  : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
              }`}>
                <div className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                  results.isPediatric
                    ? "text-purple-800 dark:text-purple-200"
                    : "text-blue-800 dark:text-blue-200"
                }`}>
                  {results.isPediatric ? <Baby className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  Recommendation for this {results.isPediatric ? "Pediatric " : ""}Patient (Age {results.ageNum})
                </div>
                <ul className={`text-xs space-y-1 ${
                  results.isPediatric
                    ? "text-purple-700 dark:text-purple-300"
                    : "text-blue-700 dark:text-blue-300"
                }`}>
                  {getRecommendation()!.map((rec, i) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4" />
              Comparison Results ({getEquationCount()} Equations)
            </div>
            
            <div className="grid gap-3">
              {/* Show Schwartz first for pediatric patients */}
              {results.isPediatric && renderEquationResult(
                "schwartz", 
                results.schwartz, 
                "mL/min/1.73m²",
                "Enter height"
              )}
              {renderEquationResult("ckdEpi", results.ckdEpi)}
              {renderEquationResult("fas", results.fas)}
              {renderEquationResult("bis1", results.bis1)}
              {renderEquationResult("mdrd", results.mdrd)}
              {renderEquationResult("cockcroftGault", results.cockcroftGault, "mL/min", "Enter weight")}
            </div>

            {/* Summary Statistics */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="text-sm font-medium mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Range</div>
                  <div className="font-medium">
                    {Math.min(
                      results.ckdEpi,
                      results.mdrd,

                      results.bis1,
                      results.fas,
                      results.schwartz || Infinity,
                      results.cockcroftGault || Infinity
                    )} - {Math.max(
                      results.ckdEpi,
                      results.mdrd,

                      results.bis1,
                      results.fas,
                      results.schwartz || 0,
                      results.cockcroftGault || 0
                    )} mL/min
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Mean (excl. CG)</div>
                  <div className="font-medium">
                    {Math.round(
                      (results.ckdEpi + results.mdrd + results.bis1 + results.fas + (results.schwartz || 0)) / 
                      (results.schwartz ? 5 : 4)
                    )} mL/min/1.73m²
                  </div>
                </div>
                {results.isPediatric && results.schwartz ? (
                  <>
                    <div>
                      <div className="text-muted-foreground">Schwartz vs FAS</div>
                      <div className="font-medium">
                        {results.schwartz > results.fas ? "+" : ""}{results.schwartz - results.fas} mL/min
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Schwartz vs CKD-EPI</div>
                      <div className="font-medium">
                        {results.schwartz > results.ckdEpi ? "+" : ""}{results.schwartz - results.ckdEpi} mL/min
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-muted-foreground">CKD-EPI vs BIS1</div>
                      <div className="font-medium">
                        {results.ckdEpi > results.bis1 ? "+" : ""}{results.ckdEpi - results.bis1} mL/min
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">CKD-EPI vs FAS</div>
                      <div className="font-medium">
                        {results.ckdEpi > results.fas ? "+" : ""}{results.ckdEpi - results.fas} mL/min
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Key Differences */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <div className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                Key Differences Between Equations
              </div>
              <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                {results.isPediatric && (
                  <li>• <strong>Schwartz Bedside</strong>: Gold standard for pediatric patients (1-17 years), requires height measurement</li>
                )}
                <li>• <strong>CKD-EPI 2021</strong>: Gold standard for adults, race-free, recommended by KDIGO for general adult population</li>
                <li>• <strong>FAS</strong>: Continuous equation from children to elderly, ideal for transitional care</li>

                <li>• <strong>BIS1</strong>: Specifically validated for elderly ≥70 years, may be more accurate in this group</li>
                <li>• <strong>MDRD</strong>: Legacy equation, less accurate at eGFR &gt;60, includes race coefficient</li>
                <li>• <strong>Cockcroft-Gault</strong>: Estimates CrCl (not eGFR), primarily for drug dosing</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
