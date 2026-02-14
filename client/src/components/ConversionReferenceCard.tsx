import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Calculator, ArrowLeftRight } from "lucide-react";

interface ConversionReferenceCardProps {
  onClose: () => void;
}

interface ConversionItem {
  name: string;
  conventional: { unit: string; factor: number };
  si: { unit: string; factor: number };
  conversionFactor: number;
  formula: string;
}

const conversions: ConversionItem[] = [
  {
    name: "BUN ↔ Urea",
    conventional: { unit: "mg/dL", factor: 1 },
    si: { unit: "mmol/L", factor: 0.357 },
    conversionFactor: 0.357,
    formula: "BUN (mg/dL) × 0.357 = BUN (mmol/L)"
  },
  {
    name: "Urea ↔ BUN",
    conventional: { unit: "mg/dL", factor: 1 },
    si: { unit: "mmol/L", factor: 0.357 },
    conversionFactor: 0.467,
    formula: "Urea (mg/dL) × 0.467 = BUN (mg/dL)"
  },
  {
    name: "Creatinine",
    conventional: { unit: "mg/dL", factor: 1 },
    si: { unit: "μmol/L", factor: 88.4 },
    conversionFactor: 88.4,
    formula: "Cr (mg/dL) × 88.4 = Cr (μmol/L)"
  },
  {
    name: "Glucose",
    conventional: { unit: "mg/dL", factor: 1 },
    si: { unit: "mmol/L", factor: 0.0555 },
    conversionFactor: 0.0555,
    formula: "Glucose (mg/dL) × 0.0555 = Glucose (mmol/L)"
  },
  {
    name: "Calcium",
    conventional: { unit: "mg/dL", factor: 1 },
    si: { unit: "mmol/L", factor: 0.25 },
    conversionFactor: 0.25,
    formula: "Ca (mg/dL) × 0.25 = Ca (mmol/L)"
  },
  {
    name: "Phosphate",
    conventional: { unit: "mg/dL", factor: 1 },
    si: { unit: "mmol/L", factor: 0.323 },
    conversionFactor: 0.323,
    formula: "PO₄ (mg/dL) × 0.323 = PO₄ (mmol/L)"
  },
  {
    name: "Albumin",
    conventional: { unit: "g/dL", factor: 1 },
    si: { unit: "g/L", factor: 10 },
    conversionFactor: 10,
    formula: "Albumin (g/dL) × 10 = Albumin (g/L)"
  },
  {
    name: "Sodium/Potassium/Chloride",
    conventional: { unit: "mEq/L", factor: 1 },
    si: { unit: "mmol/L", factor: 1 },
    conversionFactor: 1,
    formula: "mEq/L = mmol/L (same value)"
  },
  {
    name: "Hemoglobin",
    conventional: { unit: "g/dL", factor: 1 },
    si: { unit: "g/L", factor: 10 },
    conversionFactor: 10,
    formula: "Hb (g/dL) × 10 = Hb (g/L)"
  },
  {
    name: "Total Cholesterol",
    conventional: { unit: "mg/dL", factor: 1 },
    si: { unit: "mmol/L", factor: 0.0259 },
    conversionFactor: 0.0259,
    formula: "Chol (mg/dL) × 0.0259 = Chol (mmol/L)"
  },
  {
    name: "Triglycerides",
    conventional: { unit: "mg/dL", factor: 1 },
    si: { unit: "mmol/L", factor: 0.0113 },
    conversionFactor: 0.0113,
    formula: "TG (mg/dL) × 0.0113 = TG (mmol/L)"
  },
  {
    name: "Uric Acid",
    conventional: { unit: "mg/dL", factor: 1 },
    si: { unit: "μmol/L", factor: 59.48 },
    conversionFactor: 59.48,
    formula: "UA (mg/dL) × 59.48 = UA (μmol/L)"
  }
];

export default function ConversionReferenceCard({ onClose }: ConversionReferenceCardProps) {
  const [selectedConversion, setSelectedConversion] = useState<ConversionItem | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [direction, setDirection] = useState<"toSI" | "toConventional">("toSI");

  const calculateConversion = () => {
    if (!selectedConversion || !inputValue) return null;
    const value = parseFloat(inputValue);
    if (isNaN(value)) return null;

    if (direction === "toSI") {
      return (value * selectedConversion.conversionFactor).toFixed(2);
    } else {
      return (value / selectedConversion.conversionFactor).toFixed(2);
    }
  };

  const result = calculateConversion();

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 border-primary/20">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Unit Conversion Reference
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Reference Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-2 font-medium">Parameter</th>
                <th className="text-left p-2 font-medium">Conventional</th>
                <th className="text-left p-2 font-medium">SI</th>
                <th className="text-left p-2 font-medium">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {conversions.map((conv, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b hover:bg-muted/30 cursor-pointer transition-colors ${
                    selectedConversion?.name === conv.name ? "bg-primary/10" : ""
                  }`}
                  onClick={() => {
                    setSelectedConversion(conv);
                    setInputValue("");
                  }}
                >
                  <td className="p-2 font-medium">{conv.name}</td>
                  <td className="p-2 text-muted-foreground">{conv.conventional.unit}</td>
                  <td className="p-2 text-muted-foreground">{conv.si.unit}</td>
                  <td className="p-2 text-xs text-muted-foreground">{conv.formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interactive Converter */}
        {selectedConversion && (
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{selectedConversion.name} Converter</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDirection(d => d === "toSI" ? "toConventional" : "toSI")}
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                Swap
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Enter value"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="text-center"
                />
                <p className="text-xs text-center text-muted-foreground mt-1">
                  {direction === "toSI" ? selectedConversion.conventional.unit : selectedConversion.si.unit}
                </p>
              </div>
              <span className="text-muted-foreground">=</span>
              <div className="flex-1">
                <div className="h-10 flex items-center justify-center bg-background border rounded-md font-medium">
                  {result || "—"}
                </div>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  {direction === "toSI" ? selectedConversion.si.unit : selectedConversion.conventional.unit}
                </p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Formula: {selectedConversion.formula}
            </p>
          </div>
        )}

        {/* BUN/Urea Special Note */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm mb-1">
            BUN vs Urea Conversion Note
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>BUN (Blood Urea Nitrogen)</strong> measures only the nitrogen portion of urea.
            <br />
            <strong>Urea</strong> measures the entire urea molecule.
            <br />
            <strong>Conversion:</strong> BUN (mg/dL) = Urea (mg/dL) × 0.467
            <br />
            <strong>SI Units:</strong> BUN (mmol/L) = BUN (mg/dL) × 0.357
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
