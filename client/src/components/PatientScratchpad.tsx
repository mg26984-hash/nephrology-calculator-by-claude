import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, ClipboardPaste } from "lucide-react";

interface ScratchpadEntry {
  id: string;
  label: string;
  labs: Record<string, string>;
  /** Unit system when entry was saved — needed to display badges and convert on "Use Labs" */
  unitSystem: "conventional" | "si";
  createdAt: number;
}

interface PatientScratchpadProps {
  onClose: () => void;
  onUseLabs?: (labs: Record<string, string>) => void;
  /** Current global unit preference from Dashboard */
  unitPreference: "conventional" | "si";
}

// Unit conversion definitions for labs that support SI
// conversionFactor: multiply conventional value by this to get SI value
interface UnitDef {
  conventional: { unit: string; placeholder: string };
  si: { unit: string; placeholder: string };
  factor: number; // conventional × factor = SI
}

const UNIT_CONVERSIONS: Record<string, UnitDef> = {
  cr:      { conventional: { unit: "mg/dL", placeholder: "1.2" },   si: { unit: "μmol/L", placeholder: "106" },  factor: 88.4 },
  ucr:     { conventional: { unit: "mg/dL", placeholder: "80" },    si: { unit: "μmol/L", placeholder: "7072" }, factor: 88.4 },
  bun:     { conventional: { unit: "mg/dL", placeholder: "20" },    si: { unit: "mmol/L", placeholder: "7.1" },  factor: 0.357 },
  ca:      { conventional: { unit: "mg/dL", placeholder: "9.5" },   si: { unit: "mmol/L", placeholder: "2.38" }, factor: 0.25 },
  phos:    { conventional: { unit: "mg/dL", placeholder: "3.5" },   si: { unit: "mmol/L", placeholder: "1.13" }, factor: 0.3229 },
  mg:      { conventional: { unit: "mg/dL", placeholder: "2.0" },   si: { unit: "mmol/L", placeholder: "0.82" }, factor: 0.4114 },
  alb:     { conventional: { unit: "g/dL", placeholder: "4.0" },    si: { unit: "g/L", placeholder: "40" },      factor: 10 },
  glucose: { conventional: { unit: "mg/dL", placeholder: "100" },   si: { unit: "mmol/L", placeholder: "5.6" },  factor: 0.0555 },
  hgb:     { conventional: { unit: "g/dL", placeholder: "12" },     si: { unit: "g/L", placeholder: "120" },     factor: 10 },
};

interface LabField {
  id: string;
  label: string;
  unit: string;
  placeholder: string;
}

function getLabFields(unitPref: "conventional" | "si"): LabField[] {
  const base: Array<{ id: string; label: string; unit: string; placeholder: string }> = [
    { id: "cr", label: "Cr", unit: "mg/dL", placeholder: "1.2" },
    { id: "na", label: "Na", unit: "mEq/L", placeholder: "140" },
    { id: "k", label: "K", unit: "mEq/L", placeholder: "4.0" },
    { id: "bun", label: "BUN", unit: "mg/dL", placeholder: "20" },
    { id: "hco3", label: "HCO\u2083", unit: "mEq/L", placeholder: "24" },
    { id: "cl", label: "Cl", unit: "mEq/L", placeholder: "100" },
    { id: "ca", label: "Ca", unit: "mg/dL", placeholder: "9.5" },
    { id: "phos", label: "Phos", unit: "mg/dL", placeholder: "3.5" },
    { id: "mg", label: "Mg", unit: "mg/dL", placeholder: "2.0" },
    { id: "alb", label: "Alb", unit: "g/dL", placeholder: "4.0" },
    { id: "glucose", label: "Gluc", unit: "mg/dL", placeholder: "100" },
    { id: "hgb", label: "Hgb", unit: "g/dL", placeholder: "12" },
    { id: "ph", label: "pH", unit: "", placeholder: "7.40" },
    { id: "pco2", label: "pCO\u2082", unit: "mmHg", placeholder: "40" },
    { id: "una", label: "UNa", unit: "mEq/L", placeholder: "40" },
    { id: "ucr", label: "UCr", unit: "mg/dL", placeholder: "80" },
    { id: "uosm", label: "UOsm", unit: "mOsm/kg", placeholder: "500" },
    { id: "sosm", label: "SOsm", unit: "mOsm/kg", placeholder: "285" },
  ];

  return base.map((f) => {
    const conv = UNIT_CONVERSIONS[f.id];
    if (conv && unitPref === "si") {
      return { ...f, unit: conv.si.unit, placeholder: conv.si.placeholder };
    }
    return f;
  });
}

/** Get the display unit for a lab field given the unit system it was saved with */
function getDisplayUnit(labId: string, unitSystem: "conventional" | "si"): string {
  const conv = UNIT_CONVERSIONS[labId];
  if (conv) {
    return unitSystem === "si" ? conv.si.unit : conv.conventional.unit;
  }
  // Non-convertible labs — static units
  const staticUnits: Record<string, string> = {
    na: "mEq/L", k: "mEq/L", hco3: "mEq/L", cl: "mEq/L",
    ph: "", pco2: "mmHg", una: "mEq/L", uosm: "mOsm/kg", sosm: "mOsm/kg",
  };
  return staticUnits[labId] ?? "";
}

/** Convert a value from SI to conventional units */
function siToConventional(labId: string, siValue: number): number {
  const conv = UNIT_CONVERSIONS[labId];
  if (!conv) return siValue;
  return siValue / conv.factor;
}

// Maps scratchpad lab IDs to all possible calculator input IDs
const LAB_TO_CALCULATOR: Record<string, string[]> = {
  cr: ["creatinine", "serumCreatinine", "serumCr"],
  na: ["sodium", "serumNa", "serumSodium"],
  k: ["potassium", "serumPotassium"],
  bun: ["bun", "serumBUN"],
  hco3: ["bicarbonate", "serumBicarbonate"],
  cl: ["chloride", "serumChloride"],
  ca: ["calcium", "serumCalcium"],
  phos: ["phosphate", "serumPhosphate", "serumPhos"],
  mg: ["magnesium", "serumMagnesium"],
  alb: ["albumin", "serumAlbumin"],
  glucose: ["glucose", "serumGlucose"],
  hgb: ["hemoglobin"],
  ph: ["ph", "arterialPH"],
  pco2: ["pco2", "arterialPCO2"],
  una: ["urineNa", "urineSodium"],
  ucr: ["urineCr", "urineCreatinine"],
  uosm: ["urineOsm", "urineOsmolality"],
  sosm: ["serumOsm", "serumOsmolality"],
};

const STORAGE_KEY = "patient-scratchpad";
const MAX_ENTRIES = 8;
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return "expired";
}

function loadEntries(): ScratchpadEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: ScratchpadEntry[] = JSON.parse(raw);
    const now = Date.now();
    return entries.filter((e) => now - e.createdAt < EXPIRY_MS);
  } catch {
    return [];
  }
}

function saveEntries(entries: ScratchpadEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

const SHORT_LABELS: Record<string, string> = {
  cr: "Cr", na: "Na", k: "K", bun: "BUN", hco3: "HCO\u2083", cl: "Cl",
  ca: "Ca", phos: "Phos", mg: "Mg", alb: "Alb", glucose: "Gluc", hgb: "Hgb",
  ph: "pH", pco2: "pCO\u2082", una: "UNa", ucr: "UCr", uosm: "UOsm", sosm: "SOsm",
};

export function PatientScratchpad({ onClose, onUseLabs, unitPreference }: PatientScratchpadProps) {
  const [entries, setEntries] = useState<ScratchpadEntry[]>(loadEntries);
  const [showForm, setShowForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newLabs, setNewLabs] = useState<Record<string, string>>({});

  const labFields = getLabFields(unitPreference);

  // Persist whenever entries change
  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const handleLabChange = useCallback((labId: string, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setNewLabs((prev) => ({ ...prev, [labId]: value }));
    }
  }, []);

  const handleAdd = useCallback(() => {
    const filledLabs: Record<string, string> = {};
    for (const [key, val] of Object.entries(newLabs)) {
      if (val && val.trim()) filledLabs[key] = val.trim();
    }
    if (!newLabel.trim() || Object.keys(filledLabs).length === 0) return;

    const entry: ScratchpadEntry = {
      id: crypto.randomUUID(),
      label: newLabel.trim(),
      labs: filledLabs,
      unitSystem: unitPreference,
      createdAt: Date.now(),
    };

    setEntries((prev) => {
      const next = [entry, ...prev];
      return next.slice(0, MAX_ENTRIES);
    });
    setNewLabel("");
    setNewLabs({});
    setShowForm(false);
  }, [newLabel, newLabs, unitPreference]);

  const handleDelete = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setEntries([]);
  }, []);

  const handleUseLabs = useCallback(
    (entry: ScratchpadEntry) => {
      if (!onUseLabs) return;
      const mapped: Record<string, string> = {};
      for (const [labId, value] of Object.entries(entry.labs)) {
        const numVal = Number(value);
        const calcIds = LAB_TO_CALCULATOR[labId];
        if (!calcIds) continue;

        // If the entry was saved in SI but calculators expect conventional input,
        // convert SI → conventional. Dashboard's getValue() will then convert
        // conventional → SI if the user has SI units active.
        // If entry was saved in conventional, pass as-is.
        let outputValue: string;
        if (entry.unitSystem === "si" && UNIT_CONVERSIONS[labId] && !isNaN(numVal)) {
          const conventionalVal = siToConventional(labId, numVal);
          outputValue = conventionalVal.toFixed(2).replace(/\.?0+$/, "");
        } else {
          outputValue = value;
        }

        for (const calcId of calcIds) {
          mapped[calcId] = outputValue;
        }
      }
      onUseLabs(mapped);
    },
    [onUseLabs]
  );

  const filledCount = Object.values(newLabs).filter((v) => v && v.trim()).length;

  return (
    <Card className="border-emerald-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Patient Scratchpad
          </CardTitle>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs text-destructive hover:text-destructive">
                Clear All
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Save patient labs temporarily for quick reuse. Auto-expires after 24h.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Existing entries */}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg border p-3 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm truncate">{entry.label}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(entry.createdAt)}</span>
                {entry.unitSystem === "si" && (
                  <Badge variant="outline" className="text-[10px] flex-shrink-0">SI</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {onUseLabs && (
                  <Button variant="outline" size="sm" onClick={() => handleUseLabs(entry)} className="text-xs h-7">
                    <ClipboardPaste className="w-3 h-3 mr-1" />
                    Use
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="h-7 w-7 text-destructive hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(entry.labs).map(([labId, value]) => {
                const displayUnit = getDisplayUnit(labId, entry.unitSystem ?? "conventional");
                return (
                  <Badge key={labId} variant="secondary" className="text-xs font-normal">
                    {SHORT_LABELS[labId] ?? labId}: {value}
                    {displayUnit ? ` ${displayUnit}` : ""}
                  </Badge>
                );
              })}
            </div>
          </div>
        ))}

        {/* Add form */}
        {showForm ? (
          <div className="rounded-lg border border-emerald-500/30 p-3 space-y-3">
            <div>
              <Label htmlFor="scratchpad-label" className="text-sm font-medium">
                Label
              </Label>
              <Input
                id="scratchpad-label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Bed 12, Patient A..."
                className="mt-1"
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {labFields.map((field) => (
                <div key={field.id}>
                  <Label className="text-xs text-muted-foreground truncate block">
                    {field.label}
                    {field.unit ? (
                      <span className="ml-1 opacity-60">{field.unit}</span>
                    ) : null}
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={newLabs[field.id] ?? ""}
                    onChange={(e) => handleLabChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {filledCount} lab{filledCount !== 1 ? "s" : ""} filled
                {unitPreference === "si" && " (SI units)"}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setNewLabel("");
                    setNewLabs({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={!newLabel.trim() || filledCount === 0}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setShowForm(true)}
            disabled={entries.length >= MAX_ENTRIES}
          >
            <Plus className="w-4 h-4 mr-2" />
            {entries.length >= MAX_ENTRIES
              ? `Max ${MAX_ENTRIES} entries reached`
              : "Add Patient Labs"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
