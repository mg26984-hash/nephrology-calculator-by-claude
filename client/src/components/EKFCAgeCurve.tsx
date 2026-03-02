import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceArea,
  ReferenceDot,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ekfcCreatinine, getEkfcQValue } from "@/lib/calculators";

interface EKFCAgeCurveProps {
  patientAge: number;
  patientEgfr: number;
  patientSex: "M" | "F";
  patientCreatinine: number; // mg/dL (already normalized)
}

const CKD_BANDS = [
  { label: "G1", min: 90, max: 150, color: "#10b981" },
  { label: "G2", min: 60, max: 90, color: "#22c55e" },
  { label: "G3a", min: 45, max: 60, color: "#eab308" },
  { label: "G3b", min: 30, max: 45, color: "#f97316" },
  { label: "G4", min: 15, max: 30, color: "#ef4444" },
  { label: "G5", min: 0, max: 15, color: "#dc2626" },
];

export function EKFCAgeCurve({
  patientAge,
  patientEgfr,
  patientSex,
  patientCreatinine,
}: EKFCAgeCurveProps) {
  const data = useMemo(() => {
    const points: {
      age: number;
      healthyMale: number | null;
      healthyFemale: number | null;
      patient: number | null;
    }[] = [];

    for (let age = 2; age <= 90; age++) {
      // Healthy reference: SCr = Q (median) → eGFR ~107 up to 40, then declines
      const qMale = getEkfcQValue(age, "M");
      const qFemale = getEkfcQValue(age, "F");
      const healthyMaleEgfr = ekfcCreatinine(qMale / 88.4, age, "M", "mg/dL");
      const healthyFemaleEgfr = ekfcCreatinine(qFemale / 88.4, age, "F", "mg/dL");

      // Patient curve: same creatinine across all ages
      const patientEgfrAtAge = ekfcCreatinine(
        patientCreatinine,
        age,
        patientSex,
        "mg/dL"
      );

      points.push({
        age,
        healthyMale: Math.min(healthyMaleEgfr, 150),
        healthyFemale: Math.min(healthyFemaleEgfr, 150),
        patient: Math.min(Math.max(patientEgfrAtAge, 0), 150),
      });
    }

    return points;
  }, [patientCreatinine, patientSex]);

  const clampedEgfr = Math.min(Math.max(patientEgfr, 0), 150);

  return (
    <div className="mt-4 pt-4 border-t">
      <p className="text-sm font-medium mb-3">eGFR vs Age Curve</p>
      <div className="h-[280px] sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />

            {/* CKD stage bands */}
            {CKD_BANDS.map((band) => (
              <ReferenceArea
                key={band.label}
                y1={band.min}
                y2={band.max}
                fill={band.color}
                fillOpacity={0.07}
                label={{
                  value: band.label,
                  position: "insideRight",
                  fontSize: 10,
                  fill: "#9ca3af",
                  offset: 4,
                }}
              />
            ))}

            <XAxis
              dataKey="age"
              type="number"
              domain={[2, 90]}
              ticks={[5, 15, 25, 35, 45, 55, 65, 75, 85]}
              tick={{ fontSize: 11, fill: "currentColor" }}
              label={{
                value: "Age (years)",
                position: "insideBottom",
                offset: -10,
                fontSize: 12,
                fill: "currentColor",
              }}
            />
            <YAxis
              domain={[0, 150]}
              ticks={[15, 30, 45, 60, 90, 120, 150]}
              tick={{ fontSize: 11, fill: "currentColor" }}
              label={{
                value: "eGFR",
                angle: -90,
                position: "insideLeft",
                offset: 0,
                fontSize: 12,
                fill: "currentColor",
              }}
              width={40}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                    <p className="font-medium mb-1">Age {label}</p>
                    {payload.map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: {entry.value} mL/min/1.73m²
                      </p>
                    ))}
                  </div>
                );
              }}
            />

            {/* Reference curves */}
            <Line
              type="monotone"
              dataKey="healthyMale"
              name="Healthy Male"
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="healthyFemale"
              name="Healthy Female"
              stroke="#ec4899"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={false}
            />

            {/* Patient curve */}
            <Line
              type="monotone"
              dataKey="patient"
              name="Patient"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              activeDot={false}
            />

            {/* Patient dot */}
            <ReferenceDot
              x={patientAge}
              y={clampedEgfr}
              r={6}
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2 border-dashed" style={{ borderColor: "#3b82f6" }} />
          Healthy Male
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2 border-dashed" style={{ borderColor: "#ec4899" }} />
          Healthy Female
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2" style={{ borderColor: "#f59e0b" }} />
          Patient
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b", border: "2px solid white", boxShadow: "0 0 0 1px #f59e0b" }} />
          Current
        </span>
      </div>
    </div>
  );
}
