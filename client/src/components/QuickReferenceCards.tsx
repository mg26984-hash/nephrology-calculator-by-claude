import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ReferenceCardProps {
  onClose: () => void;
}

// ── RTA Differential Card ──────────────────────────────────────────────

export function RTADifferentialCard({ onClose }: ReferenceCardProps) {
  return (
    <Card className="border-cyan-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">RTA Differential Diagnosis</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile card view */}
        <div className="space-y-3 sm:hidden">
          {[
            { type: "Type 1 (Distal)", color: "text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800", k: "↓ Low", hco3: "Can be <10 mEq/L", uph: ">5.5", uag: "Positive", fehco3: "<5%", causes: "Sjögren's, SLE, amphotericin, lithium, toluene", rx: "NaHCO₃ 1–2 mEq/kg/day + K⁺" },
            { type: "Type 2 (Proximal)", color: "text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-800", k: "↓ Low", hco3: "14–18 mEq/L", uph: "<5.5", uag: "Positive", fehco3: ">15%", causes: "Fanconi syndrome, myeloma, acetazolamide, tenofovir", rx: "NaHCO₃ 5–15 mEq/kg/day + K⁺ + thiazide" },
            { type: "Type 4 (Hypoaldo)", color: "text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800", k: "↑ High", hco3: "17–22 mEq/L", uph: "<5.5", uag: "Positive", fehco3: "<5%", causes: "Diabetes, ACEi, ARB, TMP-SMX, heparin, NSAIDs", rx: "Fludrocortisone, loop diuretic, Na polystyrene, restrict K⁺" },
          ].map((rta) => (
            <div key={rta.type} className={`rounded-lg border p-3 space-y-1.5 text-sm ${rta.color.split(" ").slice(2).join(" ")}`}>
              <div className={`font-semibold ${rta.color.split(" ").slice(0, 2).join(" ")}`}>{rta.type}</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span><span className="font-medium">K⁺:</span> {rta.k}</span>
                <span><span className="font-medium">HCO₃:</span> {rta.hco3}</span>
                <span><span className="font-medium">Urine pH:</span> {rta.uph}</span>
                <span><span className="font-medium">Urine AG:</span> {rta.uag}</span>
                <span className="col-span-2"><span className="font-medium">FE-HCO₃:</span> {rta.fehco3}</span>
              </div>
              <div className="text-xs"><span className="font-medium">Causes:</span> {rta.causes}</div>
              <div className="text-xs"><span className="font-medium">Rx:</span> {rta.rx}</div>
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-[600px] w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="whitespace-nowrap text-left py-2 pr-3 font-semibold">Feature</th>
                <th className="whitespace-nowrap text-left py-2 px-3 font-semibold text-cyan-700 dark:text-cyan-400">Type 1 (Distal)</th>
                <th className="whitespace-nowrap text-left py-2 px-3 font-semibold text-violet-700 dark:text-violet-400">Type 2 (Proximal)</th>
                <th className="whitespace-nowrap text-left py-2 px-3 font-semibold text-amber-700 dark:text-amber-400">Type 4 (Hypoaldo)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="whitespace-nowrap py-2 pr-3 font-medium">Serum K⁺</td>
                <td className="whitespace-nowrap py-2 px-3">↓ Low</td>
                <td className="whitespace-nowrap py-2 px-3">↓ Low</td>
                <td className="whitespace-nowrap py-2 px-3">↑ High</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-2 pr-3 font-medium">Serum HCO₃</td>
                <td className="whitespace-nowrap py-2 px-3">Can be &lt;10 mEq/L</td>
                <td className="whitespace-nowrap py-2 px-3">14–18 mEq/L</td>
                <td className="whitespace-nowrap py-2 px-3">17–22 mEq/L</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-2 pr-3 font-medium">Urine pH</td>
                <td className="whitespace-nowrap py-2 px-3">&gt;5.5</td>
                <td className="whitespace-nowrap py-2 px-3">&lt;5.5</td>
                <td className="whitespace-nowrap py-2 px-3">&lt;5.5</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-2 pr-3 font-medium">Urine AG</td>
                <td className="whitespace-nowrap py-2 px-3">Positive</td>
                <td className="whitespace-nowrap py-2 px-3">Positive</td>
                <td className="whitespace-nowrap py-2 px-3">Positive</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-2 pr-3 font-medium">FE-HCO₃</td>
                <td className="whitespace-nowrap py-2 px-3">&lt;5%</td>
                <td className="whitespace-nowrap py-2 px-3">&gt;15%</td>
                <td className="whitespace-nowrap py-2 px-3">&lt;5%</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-2 pr-3 font-medium">Common Causes</td>
                <td className="py-2 px-3 min-w-[180px]">Sjögren's, SLE, amphotericin, lithium, toluene</td>
                <td className="py-2 px-3 min-w-[180px]">Fanconi syndrome, myeloma, acetazolamide, tenofovir</td>
                <td className="py-2 px-3 min-w-[180px]">Diabetes, ACEi, ARB, TMP-SMX, heparin, NSAIDs</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-2 pr-3 font-medium">Treatment</td>
                <td className="py-2 px-3 min-w-[180px]">NaHCO₃ 1–2 mEq/kg/day + K⁺</td>
                <td className="py-2 px-3 min-w-[180px]">NaHCO₃ 5–15 mEq/kg/day + K⁺ + thiazide</td>
                <td className="py-2 px-3 min-w-[180px]">Fludrocortisone, loop diuretic, Na polystyrene, restrict K⁺</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── GN Serologic Workup Card ───────────────────────────────────────────

interface WorkupGroup {
  title: string;
  color: string;
  items: { disease: string; tests: string }[];
}

const gnWorkupData: WorkupGroup[] = [
  {
    title: "Low C3 + C4",
    color: "text-red-600 dark:text-red-400",
    items: [
      { disease: "Lupus Nephritis", tests: "ANA, anti-dsDNA, anti-Smith" },
      { disease: "Cryoglobulinemia", tests: "Cryoglobulins, Hep C, RF" },
      { disease: "Infective Endocarditis", tests: "Blood cultures, echo" },
      { disease: "Shunt Nephritis", tests: "Blood cultures" },
    ],
  },
  {
    title: "Low C3 Only",
    color: "text-orange-600 dark:text-orange-400",
    items: [
      { disease: "Post-infectious GN", tests: "ASO, anti-DNase B" },
      { disease: "C3 Glomerulopathy", tests: "C3 nephritic factor, complement factor H" },
      { disease: "MPGN", tests: "Hep B, Hep C, cryoglobulins" },
      { disease: "Atypical HUS", tests: "ADAMTS13, complement genetics" },
    ],
  },
  {
    title: "Normal Complement",
    color: "text-green-600 dark:text-green-400",
    items: [
      { disease: "IgA Nephropathy", tests: "Serum IgA (often elevated)" },
      { disease: "ANCA Vasculitis", tests: "c-ANCA/PR3 (GPA), p-ANCA/MPO (MPA)" },
      { disease: "Anti-GBM Disease", tests: "Anti-GBM antibody" },
      { disease: "Membranous Nephropathy", tests: "PLA2R Ab, THSD7A Ab" },
      { disease: "MCD / FSGS", tests: "Diagnosis of exclusion (biopsy)" },
    ],
  },
];

export function GNSerologicWorkupCard({ onClose }: ReferenceCardProps) {
  return (
    <Card className="border-violet-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">GN Serologic Workup by Complement Pattern</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {gnWorkupData.map((group) => (
          <div key={group.title}>
            <h4 className={`font-semibold text-sm mb-2 ${group.color}`}>{group.title}</h4>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <div key={item.disease} className="flex flex-col sm:flex-row sm:gap-2 text-sm">
                  <span className="font-medium sm:min-w-[160px] sm:shrink-0">{item.disease}</span>
                  <span className="text-muted-foreground text-xs sm:text-sm">{item.tests}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="border-t pt-3 mt-3">
          <h4 className="font-semibold text-sm mb-1.5 text-muted-foreground">Standard GN Panel</h4>
          <p className="text-xs text-muted-foreground">
            CBC, BMP, UA + microscopy, spot uPCR, C3/C4, ANA, anti-dsDNA, ANCA (PR3/MPO), anti-GBM,
            PLA2R Ab, serum/urine protein electrophoresis (SPEP/UPEP), free light chains,
            Hep B/C, HIV, cryoglobulins, ASO titer
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Dialysis Indications Card ──────────────────────────────────────────

const aeiouData = [
  {
    letter: "A",
    title: "Acidosis",
    detail: "pH <7.1 refractory to medical management (NaHCO₃)",
    bg: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
  },
  {
    letter: "E",
    title: "Electrolytes",
    detail: "K⁺ >6.5 mEq/L refractory to medical management (insulin/dextrose, kayexalate, albuterol)",
    bg: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
  },
  {
    letter: "I",
    title: "Intoxication",
    detail: "Methanol, ethylene glycol, lithium, salicylates — dialyzable toxins with end-organ damage",
    bg: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300",
  },
  {
    letter: "O",
    title: "Overload",
    detail: "Pulmonary edema refractory to diuretics (furosemide bolus/drip ± metolazone)",
    bg: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  },
  {
    letter: "U",
    title: "Uremia",
    detail: "Uremic encephalopathy, pericarditis, or bleeding diathesis",
    bg: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  },
];

export function DialysisIndicationsCard({ onClose }: ReferenceCardProps) {
  return (
    <Card className="border-red-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Emergent Dialysis Indications (AEIOU)</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {aeiouData.map((item) => (
          <div key={item.letter} className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 ${item.bg}`}>
              {item.letter}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Transplant Screening Card ──────────────────────────────────────────

interface ScreeningRow {
  test: string;
  schedule: boolean[];  // [1mo, 3mo, 6mo, 9mo, 12mo, Annual]
}

const screeningData: ScreeningRow[] = [
  { test: "BK Virus PCR",       schedule: [true,  true,  true,  true,  true,  false] },
  { test: "CMV PCR",            schedule: [true,  true,  true,  false, false, false] },
  { test: "Tacrolimus Level",   schedule: [true,  true,  true,  true,  true,  true]  },
  { test: "DSA",                schedule: [false, true,  false, false, true,  true]  },
  { test: "Cr / eGFR",         schedule: [true,  true,  true,  true,  true,  true]  },
  { test: "UA + uPCR",         schedule: [true,  true,  true,  true,  true,  true]  },
  { test: "Lipid Panel",       schedule: [false, false, true,  false, true,  true]  },
  { test: "HbA1c",             schedule: [false, true,  false, false, true,  true]  },
  { test: "Skin Cancer Screen", schedule: [false, false, false, false, true,  true]  },
];

const timepoints = ["1 mo", "3 mo", "6 mo", "9 mo", "12 mo", "Annual"];

export function TransplantScreeningCard({ onClose }: ReferenceCardProps) {
  return (
    <Card className="border-rose-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Post-Transplant Screening Timeline</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile card view */}
        <div className="space-y-2 sm:hidden">
          {screeningData.map((row) => {
            const activeTimes = timepoints.filter((_, i) => row.schedule[i]);
            return (
              <div key={row.test} className="rounded-lg border p-2.5 text-sm">
                <div className="font-medium mb-1">{row.test}</div>
                <div className="flex flex-wrap gap-1">
                  {activeTimes.length > 0 ? activeTimes.map((tp) => (
                    <span key={tp} className="inline-flex items-center rounded-md bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 text-xs text-green-700 dark:text-green-400">
                      {tp}
                    </span>
                  )) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-[600px] w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="whitespace-nowrap text-left py-2 pr-3 font-semibold">Test</th>
                {timepoints.map((tp) => (
                  <th key={tp} className="whitespace-nowrap text-center py-2 px-2 font-semibold">{tp}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {screeningData.map((row) => (
                <tr key={row.test}>
                  <td className="whitespace-nowrap py-2 pr-3 font-medium">{row.test}</td>
                  {row.schedule.map((checked, i) => (
                    <td key={i} className="whitespace-nowrap text-center py-2 px-2">
                      {checked ? (
                        <span className="text-green-600 dark:text-green-400 font-bold">&#10003;</span>
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
