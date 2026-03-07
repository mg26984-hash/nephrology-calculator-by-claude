import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialysisSession {
  id: string;
  date: string;        // YYYY-MM-DD
  preWeight: string;   // kg
  postWeight: string;  // kg
  ufVolume: string;    // mL
  preBP: string;       // "140/90"
  postBP: string;      // "110/70"
  dryWeight: string;   // target kg
  sessionHours: string; // default "4"
}

interface DryWeightTrackerProps {
  onClose: () => void;
}

const STORAGE_KEY = "dialysis-sessions";
const MAX_ENTRIES = 10;

function loadSessions(): DialysisSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions: DialysisSession[] = JSON.parse(raw);
    return sessions.slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function saveSessions(sessions: DialysisSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function parseSBP(bp: string): number | null {
  const match = bp.match(/^(\d+)\s*[/]\s*\d+$/);
  if (match) return parseInt(match[1], 10);
  return null;
}

function calcIDWG(preWeight: number, dryWeight: number): { kg: number; pct: number } | null {
  if (dryWeight <= 0 || preWeight <= 0) return null;
  const kg = preWeight - dryWeight;
  const pct = (kg / dryWeight) * 100;
  return { kg, pct };
}

function calcUFRate(ufVolume: number, postWeight: number, sessionHours: number): number | null {
  if (postWeight <= 0 || sessionHours <= 0) return null;
  return (ufVolume / postWeight) / sessionHours;
}

type Severity = "normal" | "amber" | "red";

function getIDWGSeverity(pct: number): Severity {
  if (pct > 4) return "red";
  if (pct > 3) return "amber";
  return "normal";
}

function getUFRateSeverity(rate: number): Severity {
  if (rate > 13) return "red";
  if (rate > 10) return "amber";
  return "normal";
}

function getPostBPSeverity(bp: string): Severity {
  const sbp = parseSBP(bp);
  if (sbp !== null && sbp < 90) return "red";
  return "normal";
}

function worstSeverity(a: Severity, b: Severity): Severity {
  if (a === "red" || b === "red") return "red";
  if (a === "amber" || b === "amber") return "amber";
  return "normal";
}

function severityClass(sev: Severity): string {
  if (sev === "red") return "text-red-600 dark:text-red-400 font-semibold";
  if (sev === "amber") return "text-amber-600 dark:text-amber-400 font-medium";
  return "";
}

export function DryWeightTracker({ onClose }: DryWeightTrackerProps) {
  const [sessions, setSessions] = useState<DialysisSession[]>(loadSessions);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<DialysisSession, "id">>({
    date: new Date().toISOString().slice(0, 10),
    preWeight: "",
    postWeight: "",
    ufVolume: "",
    preBP: "",
    postBP: "",
    dryWeight: sessions.length > 0 ? sessions[0].dryWeight : "",
    sessionHours: "4",
  });

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const handleNumericChange = useCallback((field: keyof Omit<DialysisSession, "id">, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  }, []);

  const handleTextChange = useCallback((field: keyof Omit<DialysisSession, "id">, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAdd = useCallback(() => {
    if (!form.preWeight || !form.postWeight || !form.dryWeight || !form.date) return;

    const session: DialysisSession = {
      id: crypto.randomUUID(),
      ...form,
    };

    setSessions((prev) => {
      const next = [session, ...prev];
      return next.slice(0, MAX_ENTRIES);
    });

    // Reset form but keep dryWeight and sessionHours for convenience
    setForm((prev) => ({
      date: new Date().toISOString().slice(0, 10),
      preWeight: "",
      postWeight: "",
      ufVolume: "",
      preBP: "",
      postBP: "",
      dryWeight: prev.dryWeight,
      sessionHours: prev.sessionHours,
    }));
    setShowForm(false);
  }, [form]);

  const handleDelete = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setSessions([]);
  }, []);

  // Summary calculations
  const last5 = sessions.slice(0, 5);
  const avgIDWG = last5.length > 0
    ? (() => {
        const idwgs = last5
          .map((s) => calcIDWG(Number(s.preWeight), Number(s.dryWeight)))
          .filter((v): v is { kg: number; pct: number } => v !== null);
        if (idwgs.length === 0) return null;
        const avgPct = idwgs.reduce((sum, v) => sum + v.pct, 0) / idwgs.length;
        return avgPct;
      })()
    : null;

  const currentDryWeight = sessions.length > 0 ? sessions[0].dryWeight : null;

  const canAdd = form.preWeight && form.postWeight && form.dryWeight && form.date;

  return (
    <Card className="border-teal-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v17M5 12h14M8 7l4-4 4 4M8 17l4 4 4-4" />
            </svg>
            Dry Weight Tracker
          </CardTitle>
          <div className="flex items-center gap-2">
            {sessions.length > 0 && (
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
          Track dialysis sessions and spot concerning IDWG/UF rate trends. Max {MAX_ENTRIES} sessions.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary badges */}
        {sessions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {avgIDWG !== null && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  avgIDWG > 4 ? "border-red-500 text-red-600 dark:text-red-400" :
                  avgIDWG > 3 ? "border-amber-500 text-amber-600 dark:text-amber-400" :
                  "border-teal-500 text-teal-600 dark:text-teal-400"
                )}
              >
                Avg IDWG (last {last5.length}): {avgIDWG.toFixed(1)}%
              </Badge>
            )}
            {currentDryWeight && (
              <Badge variant="outline" className="text-xs border-teal-500 text-teal-600 dark:text-teal-400">
                Target Dry Weight: {currentDryWeight} kg
              </Badge>
            )}
          </div>
        )}

        {/* Sessions table */}
        {sessions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 whitespace-nowrap font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-2 px-2 whitespace-nowrap font-medium text-muted-foreground">Pre (kg)</th>
                  <th className="text-left py-2 px-2 whitespace-nowrap font-medium text-muted-foreground">Post (kg)</th>
                  <th className="text-left py-2 px-2 whitespace-nowrap font-medium text-muted-foreground">UF (mL)</th>
                  <th className="text-left py-2 px-2 whitespace-nowrap font-medium text-muted-foreground">IDWG</th>
                  <th className="text-left py-2 px-2 whitespace-nowrap font-medium text-muted-foreground">UF Rate</th>
                  <th className="text-left py-2 px-2 whitespace-nowrap font-medium text-muted-foreground">Pre BP</th>
                  <th className="text-left py-2 px-2 whitespace-nowrap font-medium text-muted-foreground">Post BP</th>
                  <th className="py-2 px-2 whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const preW = Number(s.preWeight);
                  const postW = Number(s.postWeight);
                  const uf = Number(s.ufVolume);
                  const dw = Number(s.dryWeight);
                  const hours = Number(s.sessionHours) || 4;

                  const idwg = calcIDWG(preW, dw);
                  const ufRate = uf > 0 ? calcUFRate(uf, postW, hours) : null;

                  const idwgSev = idwg ? getIDWGSeverity(idwg.pct) : "normal";
                  const ufSev = ufRate !== null ? getUFRateSeverity(ufRate) : "normal";
                  const bpSev = s.postBP ? getPostBPSeverity(s.postBP) : "normal";
                  const rowSev = worstSeverity(worstSeverity(idwgSev, ufSev), bpSev);

                  return (
                    <tr
                      key={s.id}
                      className={cn(
                        "border-b last:border-b-0",
                        rowSev === "red" ? "bg-red-50/50 dark:bg-red-950/20" :
                        rowSev === "amber" ? "bg-amber-50/50 dark:bg-amber-950/20" : ""
                      )}
                    >
                      <td className="py-2 px-2 whitespace-nowrap">{s.date}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{s.preWeight}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{s.postWeight}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{s.ufVolume || "-"}</td>
                      <td className={cn("py-2 px-2 whitespace-nowrap", severityClass(idwgSev))}>
                        {idwg ? `${idwg.kg.toFixed(1)} kg (${idwg.pct.toFixed(1)}%)` : "-"}
                      </td>
                      <td className={cn("py-2 px-2 whitespace-nowrap", severityClass(ufSev))}>
                        {ufRate !== null ? `${ufRate.toFixed(1)} mL/kg/h` : "-"}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">{s.preBP || "-"}</td>
                      <td className={cn("py-2 px-2 whitespace-nowrap", severityClass(bpSev))}>
                        {s.postBP || "-"}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(s.id)}
                          className="h-7 w-7 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Warning legend */}
        {sessions.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              IDWG &gt;3% or UF &gt;10 mL/kg/h
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              IDWG &gt;4% or UF &gt;13 mL/kg/h or post-SBP &lt;90
            </span>
          </div>
        )}

        {/* Add session form */}
        {showForm ? (
          <div className="rounded-lg border border-teal-500/30 p-3 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleTextChange("date", e.target.value)}
                  className="h-8 text-sm"
                  autoComplete="off"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Pre Weight (kg)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={form.preWeight}
                  onChange={(e) => handleNumericChange("preWeight", e.target.value)}
                  placeholder="75.0"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Post Weight (kg)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={form.postWeight}
                  onChange={(e) => handleNumericChange("postWeight", e.target.value)}
                  placeholder="72.0"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">UF Volume (mL)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={form.ufVolume}
                  onChange={(e) => handleNumericChange("ufVolume", e.target.value)}
                  placeholder="3000"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Dry Weight (kg)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={form.dryWeight}
                  onChange={(e) => handleNumericChange("dryWeight", e.target.value)}
                  placeholder="70.0"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Session Hours</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={form.sessionHours}
                  onChange={(e) => handleNumericChange("sessionHours", e.target.value)}
                  placeholder="4"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Pre BP</Label>
                <Input
                  type="text"
                  autoComplete="off"
                  value={form.preBP}
                  onChange={(e) => handleTextChange("preBP", e.target.value)}
                  placeholder="140/90"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Post BP</Label>
                <Input
                  type="text"
                  autoComplete="off"
                  value={form.postBP}
                  onChange={(e) => handleTextChange("postBP", e.target.value)}
                  placeholder="110/70"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!canAdd}
              >
                Save Session
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setShowForm(true)}
            disabled={sessions.length >= MAX_ENTRIES}
          >
            <Plus className="w-4 h-4 mr-2" />
            {sessions.length >= MAX_ENTRIES
              ? `Max ${MAX_ENTRIES} sessions reached`
              : "Add Session"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
