/**
 * OTC Calculators Dashboard
 * Professional open-access calculator for nephrologists
 * 92 calculators organized by clinical category
 * Features: Light/Dark theme, inline unit conversion per input, mobile-friendly
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet";
import { 
  Calculator, 
  Sun,
  Moon,
  Sparkles,
  Menu, 
  Search, 
  ChevronRight,
  Activity,
  Droplets,
  Heart,
  Scale,
  Pill,
  Stethoscope,
  FlaskConical,
  Bone,
  Brain,
  AlertTriangle,
  Info,
  X,
  Star,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  ArrowLeftRight,
  ChevronDown
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculators, getCategories, getCalculatorById, CalculatorInput } from "@/lib/calculatorData";
import * as calc from "@/lib/calculators";
import { getRecommendations } from '@/lib/clinicalRecommendations';
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import SearchInput from "@/components/SearchInput";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EGFRComparison } from "@/components/EGFRComparison";
import { PEPathway } from "@/components/PEPathway";
import { getResultColorCoding } from "@/lib/resultColorCoding";
import { UnitConversionTooltip, hasUnitConversion } from "@/components/UnitConversionTooltip";
import { isBinaryYesNoInput, getYesNoLabel, getYesNoValue, isYesValue } from "@/lib/inputHelpers";
import ConversionReferenceCard from "@/components/ConversionReferenceCard";

interface CalculatorState {
  [key: string]: string | number | boolean;
}

// Unit state for each input field
interface UnitState {
  [inputId: string]: string;
}

// Category color classes for sidebar accordion titles
const categoryColors: { [key: string]: string } = {
  "Kidney Function & CKD Risk": "text-blue-600 dark:text-blue-400",
  "Acute Kidney Injury (AKI) Workup": "text-red-600 dark:text-red-400",
  "Electrolytes & Acid-Base": "text-cyan-600 dark:text-cyan-400",
  "Proteinuria & Glomerular Disease": "text-violet-600 dark:text-violet-400",
  "Dialysis Adequacy": "text-teal-600 dark:text-teal-400",
  "Transplantation": "text-rose-600 dark:text-rose-400",
  "Cardiovascular Risk": "text-pink-600 dark:text-pink-400",
  "Anthropometric & Body Composition": "text-amber-600 dark:text-amber-400",
  "CKD-Mineral Bone Disease": "text-orange-600 dark:text-orange-400",
  "Systemic Diseases & Scores": "text-indigo-600 dark:text-indigo-400",
  "Bone & Fracture Risk": "text-yellow-700 dark:text-yellow-400",
  "Critical Care": "text-red-700 dark:text-red-300",
};

// Category icons mapping
const categoryIcons: { [key: string]: React.ReactNode } = {
  "Kidney Function & CKD Risk": <Activity className="w-4 h-4" />,
  "Acute Kidney Injury (AKI) Workup": <AlertTriangle className="w-4 h-4" />,
  "Electrolytes & Acid-Base": <Droplets className="w-4 h-4" />,
  "Proteinuria & Glomerular Disease": <FlaskConical className="w-4 h-4" />,
  "Dialysis Adequacy": <Activity className="w-4 h-4" />,
  "Transplantation": <Heart className="w-4 h-4" />,
  "Cardiovascular Risk": <Heart className="w-4 h-4" />,
  "Anthropometric & Body Composition": <Scale className="w-4 h-4" />,
  "CKD-Mineral Bone Disease": <Bone className="w-4 h-4" />,
  "Systemic Diseases & Scores": <Brain className="w-4 h-4" />,
  "Bone & Fracture Risk": <Bone className="w-4 h-4" />,
  "Critical Care": <AlertTriangle className="w-4 h-4" />,
};

// Category descriptions for clinical context
const categoryDescriptions: { [key: string]: string } = {
  "Kidney Function & CKD Risk": "Equations for estimating glomerular filtration rate (eGFR), creatinine clearance, and predicting progression to kidney failure. Essential for CKD staging and drug dosing.",
  "Acute Kidney Injury (AKI) Workup": "Diagnostic tools for evaluating acute kidney injury, including fractional excretion calculations and anion gap analysis to differentiate prerenal, intrinsic, and postrenal causes.",
  "Electrolytes & Acid-Base": "Calculators for sodium, potassium, and calcium disorders. Includes correction formulas for hyperglycemia, hypoalbuminemia, and tools for managing dysnatremias.",
  "Proteinuria & Glomerular Disease": "Tools for quantifying proteinuria, converting between uACR and uPCR, and risk stratification in glomerular diseases including IgA nephropathy.",
  "Dialysis Adequacy": "Comprehensive dialysis dosing calculators including Kt/V for hemodialysis and peritoneal dialysis, URR, and session duration planning.",
  "Transplantation": "Pre- and post-transplant assessment tools including KDPI, EPTS, Banff classification, and immunosuppressant monitoring.",
  "Cardiovascular Risk": "Cardiovascular risk assessment adapted for CKD patients, including ASCVD risk calculation and statin therapy guidance.",
  "Anthropometric & Body Composition": "Body composition calculators including BMI, BSA, ideal body weight, and adjusted body weight for medication dosing in obesity.",
  "CKD-Mineral Bone Disease": "Tools for managing mineral bone disorder in CKD, including calcium-phosphate product calculation.",
  "Systemic Diseases & Scores": "Disease activity scores and classification criteria for systemic conditions affecting the kidney, including lupus nephritis and frailty assessment.",
  "Bone & Fracture Risk": "Fracture risk assessment tools including FRAX for osteoporosis screening in CKD patients.",
  "Critical Care": "Sepsis screening and organ failure assessment tools including qSOFA, NEWS2, SOFA, and Wells scores for PE/DVT. Essential for early recognition of clinical deterioration.",
};

// Define which inputs support unit conversion and their options
const unitOptions: { [inputId: string]: { conventional: string; si: string; conversionFactor: number } } = {
  creatinine: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  preCreatinine: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  postCreatinine: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  baselineCreatinine: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  currentCreatinine: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  creatinine1: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  creatinine2: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  plasmaCr: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  urineCr: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  donorCreatinine: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  bun: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.357 },
  preBUN: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.357 },
  postBUN: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.357 },
  plasmaUrea: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.357 },
  urineUrea: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.357 },
  urineaNitrogen: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.357 },
  glucose: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.0555 },
  albumin: { conventional: "g/dL", si: "g/L", conversionFactor: 10 },
  // UACR inputs
  urineAlbumin: { conventional: "mg", si: "μg", conversionFactor: 1000 },
  urineCreatinineUACR: { conventional: "g", si: "mg", conversionFactor: 1000 },
  // UPCR inputs
  urineProtein: { conventional: "mg", si: "g", conversionFactor: 0.001 },
  urineCreatinineUPCR: { conventional: "mg", si: "g", conversionFactor: 0.001 },
  calcium: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.25 },
  measuredCa: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.25 },
  phosphate: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.323 },
  totalCholesterol: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.0259 },
  hdl: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.0259 },
  hemoglobin: { conventional: "g/dL", si: "g/L", conversionFactor: 10 },
  targetHemoglobin: { conventional: "g/dL", si: "g/L", conversionFactor: 10 },
  currentHemoglobin: { conventional: "g/dL", si: "g/L", conversionFactor: 10 },
  cystatinC: { conventional: "mg/L", si: "μmol/L", conversionFactor: 0.0749 },
  acr: { conventional: "mg/g", si: "mg/mmol", conversionFactor: 0.113 },
  // ACR from PCR calculator - PCR: 1 g/g = 113 mg/mmol (1000 mg/g ÷ 8.84 mmol/g creatinine)
  pcr: { conventional: "g/g", si: "mg/mmol", conversionFactor: 113 },
  // 24-Hour Protein Excretion Estimator inputs
  // ratioValue: mg/mg is base unit, mg/g = mg/mg * 1000, mg/mmol = mg/mg * 113.12
  ratioValue: { conventional: "mg/mg", si: "mg/mmol", conversionFactor: 113.12 },
  proteinValue: { conventional: "mg/dL", si: "g/L", conversionFactor: 0.01 },
  creatinineValue: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.0884 },
  // Critical Care - SOFA inputs
  bilirubin: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 17.1 },
  // 24h Urine creatinine
  urineCreatinine24h: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  // Height
  height: { conventional: "cm", si: "in", conversionFactor: 0.3937 },
  // Magnesium (1 mg/dL = 0.4114 mmol/L)
  urineMagnesium: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.4114 },
  plasmaMagnesium: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.4114 },
  // Uric acid (1 mg/dL = 59.48 μmol/L)
  urineUricAcid: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 59.48 },
  plasmaUricAcid: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 59.48 },
  // Phosphate (additional IDs — same factor as phosphate: 0.3229)
  serumPhosphate: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.3229 },
  urinePhosphate: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.3229 },
  plasmaPhosphate: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.3229 },
  // Urine glucose
  urineGlucose: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.0555 },
};

// Global unit preference key for localStorage
const UNIT_PREF_KEY = 'nephrology-unit-preference';

// BUN/Urea inputs that need 4-option toggle
const bunUreaInputIds = ["bun", "preBUN", "postBUN", "plasmaUrea", "urineUrea", "urineaNitrogen", "bunValue"];

// 4-option BUN/Urea toggle options
const bunUreaOptions = [
  { value: "BUN (mg/dL)", label: "BUN (mg/dL)", isBUN: true, unit: "mg/dL" },
  { value: "BUN (mmol/L)", label: "BUN (mmol/L)", isBUN: true, unit: "mmol/L" },
  { value: "Urea (mg/dL)", label: "Urea (mg/dL)", isBUN: false, unit: "mg/dL" },
  { value: "Urea (mmol/L)", label: "Urea (mmol/L)", isBUN: false, unit: "mmol/L" },
];

// Collapsible section - collapsed by default on mobile, always open on desktop
function MobileCollapsible({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden sm:block">{children}</div>
      {/* Mobile: collapsible */}
      <details className="sm:hidden group">
        <summary className="flex items-center justify-between cursor-pointer list-none p-3 rounded-lg bg-muted/30 border border-border text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-2">{children}</div>
      </details>
    </>
  );
}

// Sortable Favorite Card Component for drag-and-drop
interface SortableFavoriteCardProps {
  calc: typeof calculators[0];
  categoryIcons: { [key: string]: React.ReactNode };
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

function SortableFavoriteCard({ calc, categoryIcons, onSelect, onToggleFavorite }: SortableFavoriteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: calc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-card hover:bg-accent/50 border border-border hover:border-primary/30 rounded-lg px-2.5 py-2 text-left transition-all duration-200 hover:shadow-md hover:shadow-primary/5 flex items-center gap-2",
        isDragging && "shadow-xl ring-2 ring-primary/30"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 p-1 rounded cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors touch-none"
        title="Drag to reorder"
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="pointer-events-none">
          <circle cx="4" cy="4" r="2" />
          <circle cx="12" cy="4" r="2" />
          <circle cx="4" cy="8" r="2" />
          <circle cx="12" cy="8" r="2" />
          <circle cx="4" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>
      
      {/* Category Icon */}
      <span className="flex-shrink-0 p-1 rounded bg-primary/10 text-primary">
        {categoryIcons[calc.category] || <Calculator className="w-3 h-3" />}
      </span>

      {/* Clickable Card Content */}
      <button
        onClick={() => onSelect(calc.id)}
        className="flex-1 text-left truncate"
      >
        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate block">
          {calc.name}
        </span>
      </button>
      
      {/* Favorite Star */}
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => onToggleFavorite(calc.id, e)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onToggleFavorite(calc.id, e as unknown as React.MouseEvent); } }}
        className="flex-shrink-0 p-1 rounded-full hover:bg-amber-500/10 transition-colors"
        title="Remove from favorites"
      >
        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [selectedCalculatorId, setSelectedCalculatorId] = useState<string | null>(null);
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({});
  const [unitState, setUnitState] = useState<UnitState>(() => {
    const saved = localStorage.getItem('nephrology-calculator-units');
    return saved ? JSON.parse(saved) : {};
  });
  const [globalUnitPreference, setGlobalUnitPreference] = useState<"conventional" | "si">(() => {
    const saved = localStorage.getItem(UNIT_PREF_KEY);
    return saved === "si" ? "si" : "conventional";
  });
  const [result, setResult] = useState<number | { [key: string]: number } | null>(null);
  const [lastCalculatedEgfr, setLastCalculatedEgfr] = useState<number | null>(null);
  const [navigatedFromMehran, setNavigatedFromMehran] = useState<string | null>(null);
  const [savedMehranState, setSavedMehranState] = useState<CalculatorState | null>(null);
  const [savedMehranResult, setSavedMehranResult] = useState<{
    totalScore: number;
    riskCategory: string;
    cinRisk: number;
    dialysisRisk: number;
    breakdown: { factor: string; points: number; present: boolean }[];
  } | null>(null);
  const [savedMehranUnitState, setSavedMehranUnitState] = useState<Record<string, string> | null>(null);
  const [resultInterpretation, setResultInterpretation] = useState<string>("");
  const [banffResult, setBanffResult] = useState<calc.BanffResult | null>(null);
  const [kdpiResult, setKdpiResult] = useState<{ kdri: number; kdpi: number } | null>(null);
  const [mehranResult, setMehranResult] = useState<{
    totalScore: number;
    riskCategory: string;
    cinRisk: number;
    dialysisRisk: number;
    breakdown: { factor: string; points: number; present: boolean }[];
  } | null>(null);
  const [fraxResult, setFraxResult] = useState<{ majorFracture: number; hipFracture: number } | null>(null);
  const [anticoagReversalResult, setAnticoagReversalResult] = useState<calc.AnticoagulantReversalResult | null>(null);
  const [steroidConversionResult, setSteroidConversionResult] = useState<calc.SteroidConversionResult | null>(null);
  const [plasmaExchangeResult, setPlasmaExchangeResult] = useState<calc.PlasmaExchangeResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewingCategoryList, setViewingCategoryList] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showCategoryCustomizer, setShowCategoryCustomizer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [sidebarAccordionValue, setSidebarAccordionValue] = useState<string>("");
  const [clinicalRecommendation, setClinicalRecommendation] = useState<any>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showPEPathway, setShowPEPathway] = useState(false);
  const [showConversionCard, setShowConversionCard] = useState(false);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const pePathwayRef = useRef<HTMLDivElement>(null);
  const conversionRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);
  
  // Favorites state with localStorage persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('nephrology-calculator-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('nephrology-calculator-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save unit preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('nephrology-calculator-units', JSON.stringify(unitState));
  }, [unitState]);

  useEffect(() => {
    localStorage.setItem(UNIT_PREF_KEY, globalUnitPreference);
  }, [globalUnitPreference]);

  // Toggle favorite status for a calculator
  const toggleFavorite = useCallback((calcId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent selecting the calculator when clicking the star
    }
    setFavorites(prev => 
      prev.includes(calcId) 
        ? prev.filter(id => id !== calcId)
        : [...prev, calcId]
    );
  }, []);

  // Get favorite calculators - preserve order from favorites array
  const favoriteCalculators = useMemo(() => 
    favorites.map(id => calculators.find(c => c.id === id)).filter(Boolean) as typeof calculators,
    [favorites]
  );

  // DnD sensors for drag-and-drop with touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Haptic feedback helper for mobile devices
  const triggerHapticFeedback = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Vibration API not supported or permission denied
      }
    }
  }, []);

  // Handle drag start with haptic feedback
  const handleDragStart = useCallback(() => {
    triggerHapticFeedback(50); // Short vibration on drag start
  }, [triggerHapticFeedback]);

  // Handle drag end for favorites reordering with haptic feedback
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFavorites((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
      triggerHapticFeedback([30, 50, 30]); // Success pattern: short-pause-short
    } else {
      triggerHapticFeedback(20); // Light tap for cancelled drag
    }
  }, [triggerHapticFeedback]);

  // Category preference state with localStorage persistence
  const [categoryOrder, setCategoryOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('nephrology-calculator-category-order');
    return saved ? JSON.parse(saved) : [];
  });

  // Save category order to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('nephrology-calculator-category-order', JSON.stringify(categoryOrder));
  }, [categoryOrder]);

  // Recent calculators state with localStorage persistence (max 5)
  const [recentCalculatorIds, setRecentCalculatorIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('nephrology-calculator-recent');
    return saved ? JSON.parse(saved) : [];
  });

  // Save recent calculators to localStorage when they change
  useEffect(() => {
    localStorage.setItem('nephrology-calculator-recent', JSON.stringify(recentCalculatorIds));
  }, [recentCalculatorIds]);

  // Scroll to panel when toggled on
  useEffect(() => {
    if (showComparison) {
      setTimeout(() => comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [showComparison]);

  useEffect(() => {
    if (showPEPathway) {
      setTimeout(() => pePathwayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [showPEPathway]);

  useEffect(() => {
    if (showConversionCard) {
      setTimeout(() => conversionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [showConversionCard]);

  // Auto-expand sidebar accordion to selected calculator's category
  useEffect(() => {
    if (selectedCalculatorId) {
      const cat = calculators.find(c => c.id === selectedCalculatorId)?.category;
      if (cat) setSidebarAccordionValue(cat);
    } else if (selectedCategory) {
      setSidebarAccordionValue(selectedCategory);
    }
  }, [selectedCalculatorId, selectedCategory]);

  // Command palette keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Add calculator to recent list (called when selecting a calculator)
  const addToRecent = useCallback((calcId: string) => {
    setRecentCalculatorIds(prev => {
      // Remove if already exists, then add to front
      const filtered = prev.filter(id => id !== calcId);
      // Keep only last 5
      return [calcId, ...filtered].slice(0, 5);
    });
  }, []);

  // Helper function to get recommendation key based on calculator and result
  const getRecommendationKey = (calculatorId: string, result: number): string | null => {
    switch (calculatorId) {
      case "ckd-epi-creatinine":
        if (result >= 90) return "stage1";
        if (result >= 60) return "stage2";
        if (result >= 45) return "stage3a";
        if (result >= 30) return "stage3b";
        if (result >= 15) return "stage4";
        return "stage5";
      
      case "kfre":
        if (result < 10) return "low";
        if (result < 40) return "moderate";
        return "high";
      
      case "cin-mehran":
        if (result < 8) return "low";
        if (result < 16) return "moderate";
        if (result < 26) return "high";
        return "veryhigh";
      
      case "ascvd":
        if (result < 5) return "low";
        if (result < 7.5) return "borderline";
        if (result < 20) return "intermediate";
        return "high";
      
      default:
        return null;
    }
  };

  // Get recent calculators (excluding favorites to avoid duplication)
  const recentCalculators = useMemo(() => 
    calculators.filter(c => recentCalculatorIds.includes(c.id) && !favorites.includes(c.id)),
    [recentCalculatorIds, favorites]
  );

  const categories = useMemo(() => getCategories(), []);
  
  // Get sorted categories based on user preference
  const sortedCategories = useMemo(() => {
    if (categoryOrder.length === 0) return categories;
    const sorted = [...categoryOrder];
    categories.forEach(cat => {
      if (!sorted.includes(cat)) {
        sorted.push(cat);
      }
    });
    return sorted;
  }, [categories, categoryOrder]);
  const selectedCalculator = useMemo(
    () => (selectedCalculatorId ? getCalculatorById(selectedCalculatorId) : null),
    [selectedCalculatorId]
  );

  // Smart search: scores calculators by relevance using tokenized matching,
  // abbreviation handling, prefix matching, and searchTerms aliases
  const filteredCalculators = useMemo(() => {
    let filtered = calculators;

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      // Normalize: strip special chars, collapse spaces
      const normalizedQuery = query.replace(/[₂²\-_\/]/g, "").replace(/\s+/g, " ");
      const queryTokens = normalizedQuery.split(" ").filter(Boolean);

      // Score each calculator
      const scored = calculators.map(c => {
        const name = c.name.toLowerCase();
        const normalizedName = name.replace(/[₂²\-_\/()]/g, "").replace(/\s+/g, " ");
        const desc = c.description.toLowerCase();
        const cat = c.category.toLowerCase();
        const id = c.id.toLowerCase().replace(/[\-_]/g, "");
        const terms = (c.searchTerms || []).map(t => t.toLowerCase());

        let score = 0;

        // Exact match on searchTerms (highest priority)
        if (terms.some(t => t === normalizedQuery || t === query)) {
          score += 100;
        }

        // searchTerm starts with query (prefix match)
        if (terms.some(t => t.startsWith(normalizedQuery) || t.startsWith(query))) {
          score += 80;
        }

        // searchTerm contains query
        if (terms.some(t => t.includes(normalizedQuery) || t.includes(query))) {
          score += 60;
        }

        // Name contains query directly
        if (name.includes(query) || normalizedName.includes(normalizedQuery)) {
          score += 50;
        }

        // ID matches
        if (id.includes(normalizedQuery.replace(/\s/g, ""))) {
          score += 45;
        }

        // All query tokens match somewhere (name, desc, category, or searchTerms)
        const allSearchable = [normalizedName, desc, cat, ...terms, id].join(" ");
        const allTokensMatch = queryTokens.every(token => allSearchable.includes(token));
        if (allTokensMatch && queryTokens.length > 0) {
          score += 40;
        }

        // Description contains query
        if (desc.includes(query) || desc.includes(normalizedQuery)) {
          score += 20;
        }

        // Category contains query
        if (cat.includes(query)) {
          score += 10;
        }

        return { calc: c, score };
      });

      filtered = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(s => s.calc);
    }

    if (selectedCategory) {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Group filtered calculators by category
  const groupedCalculators = useMemo(() => {
    const groups: { [key: string]: typeof calculators } = {};
    filteredCalculators.forEach((calc) => {
      if (!groups[calc.category]) {
        groups[calc.category] = [];
      }
      groups[calc.category].push(calc);
    });
    return groups;
  }, [filteredCalculators]);

  const handleInputChange = useCallback((inputId: string, value: string | number | boolean) => {
    setCalculatorState((prev) => ({
      ...prev,
      [inputId]: value,
    }));
  }, []);

  const handleUnitChange = useCallback((inputId: string, unit: string) => {
    // Standard 2-option toggle (conventional/si) → update global preference for ALL inputs
    if (unit === "conventional" || unit === "si") {
      setGlobalUnitPreference(unit);
      // Clear all per-input overrides so every input follows the global preference
      setUnitState({});
      return;
    }

    // Special multi-option toggles (BUN 4-option, KFRE ACR 3-option) — store specific selection
    // Link related inputs of the same measurement type so they toggle together
    const allCreatinineIds = ["creatinine", "baselineCreatinine", "currentCreatinine", "creatinine1", "creatinine2", "preCreatinine", "postCreatinine", "plasmaCr", "urineCr", "urineCreatinine24h", "donorCreatinine"];
    const allPhosphateIds = ["phosphate", "serumPhosphate", "urinePhosphate", "plasmaPhosphate"];
    const allMagnesiumIds = ["urineMagnesium", "plasmaMagnesium"];
    const allUricAcidIds = ["urineUricAcid", "plasmaUricAcid"];
    const creatinineGroups: Record<string, string[]> = {
      ...Object.fromEntries(allCreatinineIds.map(id => [id, allCreatinineIds])),
      ...Object.fromEntries(allPhosphateIds.map(id => [id, allPhosphateIds])),
      ...Object.fromEntries(allMagnesiumIds.map(id => [id, allMagnesiumIds])),
      ...Object.fromEntries(allUricAcidIds.map(id => [id, allUricAcidIds])),
    };
    const linked = creatinineGroups[inputId];
    if (linked) {
      setUnitState((prev) => {
        const next = { ...prev };
        for (const id of linked) next[id] = unit;
        return next;
      });
    } else {
      setUnitState((prev) => ({ ...prev, [inputId]: unit }));
    }
  }, []);

  // Get the current unit for an input (follows global unit preference)
  const getInputUnit = useCallback((inputId: string): string => {
    if (unitOptions[inputId]) {
      return unitState[inputId] || globalUnitPreference;
    }
    return "conventional";
  }, [unitState, globalUnitPreference]);

  // Get the display unit label for an input
  const getUnitLabel = useCallback((input: { id: string; unit?: string }): string => {
    const options = unitOptions[input.id];
    if (options) {
      const currentUnit = getInputUnit(input.id);
      return currentUnit === "si" ? options.si : options.conventional;
    }
    return input.unit || "";
  }, [getInputUnit]);

  // Get dynamic placeholder based on unit selection
  const getDynamicPlaceholder = useCallback((input: CalculatorInput): string => {
    // Handle ACR multi-unit placeholders for KFRE calculator
    if (selectedCalculatorId === "kfre" && input.id === "acr") {
      const currentAcrUnit = unitState.acr || (globalUnitPreference === "si" ? "mg/mmol" : "mg/g");
      // Typical moderately elevated ACR values for each unit
      // 300 mg/g = 33.9 mg/mmol = 0.3 mg/mg (A3 category)
      switch (currentAcrUnit) {
        case "mg/g":
          return "300";
        case "mg/mmol":
          return "34";
        case "mg/mg":
          return "0.3";
        default:
          return "300";
      }
    }
    
    // Define typical clinical values for common inputs (conventional | SI)
    // These represent typical or moderately abnormal values for clinical context
    const typicalValues: { [inputId: string]: { conventional: string; si: string } } = {
      // Creatinine: 1.2 mg/dL = 106 μmol/L (mildly elevated)
      creatinine: { conventional: "1.2", si: "106" },
      preCreatinine: { conventional: "1.2", si: "106" },
      postCreatinine: { conventional: "0.8", si: "71" },
      plasmaCr: { conventional: "1.0", si: "88" },
      urineCr: { conventional: "100", si: "8840" },
      donorCreatinine: { conventional: "0.9", si: "80" },
      // BUN: 20 mg/dL = 7.1 mmol/L (upper normal)
      bun: { conventional: "20", si: "7.1" },
      preBUN: { conventional: "60", si: "21" },
      postBUN: { conventional: "20", si: "7.1" },
      plasmaUrea: { conventional: "20", si: "7.1" },
      urineUrea: { conventional: "500", si: "178" },
      urineaNitrogen: { conventional: "12", si: "4.3" },
      // Glucose: 100 mg/dL = 5.6 mmol/L (fasting normal)
      glucose: { conventional: "100", si: "5.6" },
      // Albumin: 4.0 g/dL = 40 g/L (normal)
      albumin: { conventional: "4.0", si: "40" },
      // Calcium: 9.5 mg/dL = 2.4 mmol/L (normal)
      calcium: { conventional: "9.5", si: "2.4" },
      measuredCa: { conventional: "9.5", si: "2.4" },
      // Phosphate: 4.0 mg/dL = 1.3 mmol/L (normal)
      phosphate: { conventional: "4.0", si: "1.3" },
      // Cystatin C: 1.0 mg/L = 0.075 μmol/L (normal)
      cystatinC: { conventional: "1.0", si: "0.08" },
      // Hemoglobin: 12 g/dL = 120 g/L (lower normal)
      hemoglobin: { conventional: "12", si: "120" },
      targetHemoglobin: { conventional: "11", si: "110" },
      currentHemoglobin: { conventional: "9", si: "90" },
      // Cholesterol: 200 mg/dL = 5.2 mmol/L (borderline high)
      totalCholesterol: { conventional: "200", si: "5.2" },
      hdl: { conventional: "50", si: "1.3" },
      // ACR: 30 mg/g = 3.4 mg/mmol (A2 category - moderately increased)
      acr: { conventional: "30", si: "3.4" },
      // PCR: 0.5 g/g = 56.5 mg/mmol (mild proteinuria)
      pcr: { conventional: "0.5", si: "57" },
      // Ratio value: 0.5 mg/mg = 56.6 mg/mmol (mild)
      ratioValue: { conventional: "0.5", si: "57" },
      // Additional creatinine inputs
      baselineCreatinine: { conventional: "1.0", si: "88" },
      currentCreatinine: { conventional: "2.5", si: "221" },
      creatinine1: { conventional: "2.0", si: "177" },
      creatinine2: { conventional: "3.0", si: "265" },
      // UACR raw inputs
      urineAlbumin: { conventional: "150", si: "150000" },
      urineCreatinineUACR: { conventional: "1.0", si: "1000" },
      // UPCR raw inputs
      urineProtein: { conventional: "500", si: "0.5" },
      urineCreatinineUPCR: { conventional: "100", si: "0.1" },
      // 24h protein estimator raw inputs
      proteinValue: { conventional: "50", si: "0.5" },
      creatinineValue: { conventional: "100", si: "8.8" },
      // Bilirubin: 1.0 mg/dL = 17.1 μmol/L
      bilirubin: { conventional: "1.0", si: "17" },
      // Urine Creatinine (24h): 80 mg/dL = 7072 μmol/L
      urineCreatinine24h: { conventional: "80", si: "7072" },
      // Height: 170 cm = 67 in
      height: { conventional: "170", si: "67" },
      // Magnesium: urine 4.0 mg/dL = 1.6 mmol/L, plasma 1.8 mg/dL = 0.74 mmol/L
      urineMagnesium: { conventional: "4.0", si: "1.6" },
      plasmaMagnesium: { conventional: "1.8", si: "0.74" },
      // Uric acid: urine 20 mg/dL = 1190 μmol/L, plasma 4.5 mg/dL = 268 μmol/L
      urineUricAcid: { conventional: "20", si: "1190" },
      plasmaUricAcid: { conventional: "4.5", si: "268" },
      // Phosphate (additional IDs): serum 1.8 = 0.58, urine 40 = 12.9, plasma 3.0 = 0.97
      serumPhosphate: { conventional: "1.8", si: "0.58" },
      urinePhosphate: { conventional: "40", si: "12.9" },
      plasmaPhosphate: { conventional: "3.0", si: "0.97" },
      // Urine glucose
      urineGlucose: { conventional: "0", si: "0" },
    };
    
    const typicalValue = typicalValues[input.id];
    if (typicalValue) {
      const currentUnit = getInputUnit(input.id);
      return currentUnit === "si" ? typicalValue.si : typicalValue.conventional;
    }
    
    // Handle BUN/Urea 4-option toggle placeholders
    if (bunUreaInputIds.includes(input.id)) {
      const bunUreaUnit = unitState[input.id] || (globalUnitPreference === "si" ? "BUN (mmol/L)" : "BUN (mg/dL)");
      // Typical pre-dialysis BUN: 60 mg/dL, post-dialysis: 20 mg/dL
      const isPreBUN = input.id === "preBUN";
      const baseBUN = isPreBUN ? 60 : 20; // mg/dL
      switch (bunUreaUnit) {
        case "BUN (mg/dL)":
          return String(baseBUN);
        case "BUN (mmol/L)":
          return (baseBUN * 0.357).toFixed(1);
        case "Urea (mg/dL)":
          return (baseBUN / 0.467).toFixed(0); // BUN to Urea
        case "Urea (mmol/L)":
          return ((baseBUN / 0.467) * 0.166).toFixed(1); // Urea mg/dL to mmol/L
        default:
          return String(baseBUN);
      }
    }
    
    // Fallback to original logic for other inputs
    const options = unitOptions[input.id];
    if (!options || !input.placeholder) return input.placeholder || "";
    const currentUnit = getInputUnit(input.id);
    const placeholderValue = parseFloat(input.placeholder);
    if (isNaN(placeholderValue)) return input.placeholder;
    if (currentUnit === "si") {
      const siValue = placeholderValue * options.conversionFactor;
      return siValue.toFixed(2);
    }
    return input.placeholder;
  }, [getInputUnit, selectedCalculatorId, unitState]);

  // Convert input value to conventional units for calculation
  const normalizeValue = useCallback((inputId: string, value: number): number => {
    const options = unitOptions[inputId];
    if (options && getInputUnit(inputId) === "si") {
      // Convert from SI to conventional
      return value / options.conversionFactor;
    }
    return value;
  }, [getInputUnit]);

  const handleCalculate = useCallback(() => {
    if (!selectedCalculator) return;

    try {
      let calculationResult: number | { [key: string]: number } | undefined;

      // Helper to get normalized value (always in conventional units)
      const getValue = (id: string) => {
        const raw = Number(calculatorState[id]) || 0;
        return normalizeValue(id, raw);
      };

      // Helper to get BUN value in mg/dL from 4-option toggle
      // Converts from BUN/Urea in different units to BUN in mg/dL
      const getBunValue = (inputId: string) => {
        const raw = Number(calculatorState[inputId]) || 0;
        if (raw === undefined || raw === null || isNaN(raw)) return 0;
        
        const selectedUnit = unitState[`${inputId}_bunUrea`] || (globalUnitPreference === "si" ? "BUN (mmol/L)" : "BUN (mg/dL)");
        
        // Conversion factors:
        // BUN (mg/dL) -> BUN (mg/dL): 1
        // BUN (mmol/L) -> BUN (mg/dL): multiply by 2.8 (1 mmol/L BUN = 2.8 mg/dL)
        // Urea (mg/dL) -> BUN (mg/dL): divide by 2.14 (Urea = BUN × 2.14)
        // Urea (mmol/L) -> BUN (mg/dL): multiply by 2.8 / 2.14 = 1.308 (or divide by 0.357 then divide by 2.14)
        
        switch (selectedUnit) {
          case "BUN (mg/dL)":
            return raw;
          case "BUN (mmol/L)":
            return raw * 2.8; // Convert BUN mmol/L to BUN mg/dL
          case "Urea (mg/dL)":
            return raw / 2.14; // Convert Urea mg/dL to BUN mg/dL
          case "Urea (mmol/L)":
            return raw * 6.006; // Convert Urea mmol/L to BUN mg/dL (2.8 / 0.4665)
          default:
            return raw;
        }
      };

      // Call appropriate calculator function based on ID
      switch (selectedCalculator.id) {
        case "ckd-epi-creatinine":
          calculationResult = calc.ckdEpiCreatinine(
            getValue("creatinine"),
            Number(calculatorState.age) || 0,
            calculatorState.sex as "M" | "F",
            calculatorState.race as "Black" | "Other",
            "mg/dL"
          );
          break;

        case "cockcroft-gault":
          calculationResult = calc.cockcrofGault(
            getValue("creatinine"),
            Number(calculatorState.age) || 0,
            Number(calculatorState.weight) || 0,
            calculatorState.sex as "M" | "F",
            "mg/dL"
          );
          break;

        case "schwartz-pediatric":
          calculationResult = calc.schwartzPediatric(
            getValue("creatinine"),
            getValue("height"),
            "mg/dL"
          );
          break;

        case "kinetic-egfr":
          calculationResult = calc.kineticEgfr(
            getValue("baselineCreatinine"),
            getValue("creatinine1"),
            getValue("creatinine2"),
            Number(calculatorState.timeInterval) || 0,
            Number(calculatorState.age) || 0,
            calculatorState.sex as "M" | "F",
            calculatorState.isBlack === "yes"
          );
          break;

        case "ckd-epi-cystatin-c":
          calculationResult = calc.ckdEpiCystatinC(
            getValue("creatinine"),
            Number(calculatorState.cystatinC) || 0,
            Number(calculatorState.age) || 0,
            calculatorState.sex as "M" | "F",
            "mg/dL"
          );
          break;

        case "egfr-slope":
          calculationResult = calc.eGFRSlope(
            Number(calculatorState.eGFRBaseline) || 0,
            Number(calculatorState.eGFRFinal) || 0,
            Number(calculatorState.timeYears) || 0
          );
          break;

        case "kfre":
          calculationResult = calc.kfre(
            Number(calculatorState.age) || 0,
            calculatorState.sex as "M" | "F",
            Number(calculatorState.eGFR) || 0,
            Number(calculatorState.acr) || 0,
            (unitState.acr as "mg/g" | "mg/mmol" | "mg/mg") || (globalUnitPreference === "si" ? "mg/mmol" : "mg/g"),
            (calculatorState.years as 2 | 5) || 5
          );
          break;

        case "lund-malmo-revised":
          calculationResult = calc.lundMalmoRevised(
            getValue("creatinine"),
            Number(calculatorState.age) || 0,
            calculatorState.sex as "M" | "F",
            "mg/dL"
          );
          break;

        case "bis1-elderly":
          calculationResult = calc.bis1Elderly(
            getValue("creatinine"),
            Number(calculatorState.age) || 0,
            calculatorState.sex as "M" | "F",
            "mg/dL"
          );
          break;

        case "fas-full-age-spectrum":
          calculationResult = calc.fasFullAgeSpectrum(
            getValue("creatinine"),
            Number(calculatorState.age) || 0,
            calculatorState.sex as "M" | "F",
            "mg/dL"
          );
          break;

        case "fena":
          calculationResult = calc.fena(
            Number(calculatorState.urineNa) || 0,
            getValue("plasmaCr"),
            Number(calculatorState.plasmaNa) || 0,
            getValue("urineCr"),
            "mg/dL"
          );
          break;

        case "feurea":
          calculationResult = calc.feurea(
            getValue("urineUrea"),
            getValue("plasmaCr"),
            getValue("plasmaUrea"),
            getValue("urineCr"),
            "mg/dL"
          );
          break;

        case "anion-gap":
          calculationResult = calc.anionGap(
            Number(calculatorState.sodium) || 0,
            Number(calculatorState.chloride) || 0,
            Number(calculatorState.bicarbonate) || 0
          );
          break;

        case "delta-gap":
          const deltaResult = calc.deltaGap(
            Number(calculatorState.measuredAG) || 0,
            Number(calculatorState.measuredHCO3) || 0,
            Number(calculatorState.normalAG) || 0,
            Number(calculatorState.normalHCO3) || 0
          );
          calculationResult = deltaResult.ratio;
          break;

        case "osmolal-gap":
          // getValue already normalizes to conventional units (mg/dL)
          // getBunValue handles BUN/Urea 4-option toggle conversion
          calculationResult = calc.osmolalGap(
            Number(calculatorState.measuredOsmolality) || 0,
            Number(calculatorState.sodium) || 0,
            getValue("glucose"),
            getBunValue("bun"),
            Number(calculatorState.ethanol) || 0,
            "mg/dL",
            "mg/dL"
          );
          break;

        case "urine-anion-gap":
          calculationResult = calc.urineAnionGap(
            Number(calculatorState.urineNa) || 0,
            Number(calculatorState.urineK) || 0,
            Number(calculatorState.urineCl) || 0
          );
          break;

        case "bun-creatinine-ratio":
          // getBunValue handles BUN/Urea 4-option toggle conversion to BUN mg/dL
          calculationResult = calc.bunCreatinineRatio(
            getBunValue("bunValue"),
            getValue("creatinine"),
            getInputUnit("creatinine") as "mg/dL" | "μmol/L"
          );
          break;

        case "ttkg":
          calculationResult = calc.ttkg(
            Number(calculatorState.urineK) || 0,
            Number(calculatorState.plasmaK) || 0,
            Number(calculatorState.urineOsm) || 0,
            Number(calculatorState.plasmaOsm) || 0
          );
          break;

        case "water-deficit-hypernatremia": {
          const wdWt = Number(calculatorState.weight) || 0;
          const wdTbw = wdWt * (calculatorState.sex === "F" ? 0.5 : 0.6);
          calculationResult = calc.waterDeficitHypernatremia(
            Number(calculatorState.currentNa) || 0,
            Number(calculatorState.targetNa) || 0,
            wdTbw
          );
          break;
        }

        case "corrected-sodium-hyperglycemia":
          // getValue already normalizes to conventional units (mg/dL)
          calculationResult = calc.correctedSodiumHyperglycemia(
            Number(calculatorState.measuredNa) || 0,
            getValue("glucose"),
            "mg/dL"
          );
          break;

        case "sodium-correction-rate": {
          const wt = Number(calculatorState.weight) || 0;
          const tbwFactor = calculatorState.sex === "F" ? 0.5 : 0.6;
          const tbw = wt * tbwFactor;
          calculationResult = calc.sodiumCorrectionRateHyponatremia(
            Number(calculatorState.currentNa) || 0,
            Number(calculatorState.targetNa) || 0,
            parseInt(String(calculatorState.infusionNa)) || 0,
            tbw,
            Number(calculatorState.correctionHours) || 0
          );
          break;
        }

        case "sodium-deficit": {
          const sdWt = Number(calculatorState.weight) || 0;
          const sdTbw = sdWt * (calculatorState.sex === "F" ? 0.5 : 0.6);
          calculationResult = calc.sodiumDeficitHyponatremia(
            Number(calculatorState.currentNa) || 0,
            Number(calculatorState.targetNa) || 0,
            sdTbw
          );
          break;
        }

        case "corrected-calcium":
          calculationResult = calc.correctedCalcium(
            getValue("measuredCa"),
            getValue("albumin"),
            "g/dL"
          );
          break;

        case "qtc-bazett":
          calculationResult = calc.qtcBazett(
            Number(calculatorState.qtInterval) || 0,
            Number(calculatorState.heartRate) || 0
          );
          break;

        case "uacr":
          calculationResult = calc.uacr(
            getValue("urineAlbumin"),
            getValue("urineCreatinineUACR"),
            getInputUnit("urineAlbumin") === "si" ? "μg" : "mg",
            getInputUnit("urineCreatinineUACR") === "si" ? "mg" : "g"
          );
          break;

        case "upcr":
          calculationResult = calc.upcr(
            getValue("urineProtein"),
            getValue("urineCreatinineUPCR"),
            getInputUnit("urineProtein") === "si" ? "g" : "mg",
            getInputUnit("urineCreatinineUPCR") === "si" ? "g" : "mg"
          );
          break;

        case "selectivity-index":
          // Selectivity Index = (Urine IgG / Plasma IgG) / (Urine Albumin / Plasma Albumin)
          const urineIgG = Number(calculatorState.urineIgG) || 0;
          const plasmaIgG = Number(calculatorState.plasmaIgG) || 0;
          const urineAlb = getValue("urineAlbumin");
          const plasmaAlb = getValue("plasmaAlbumin");
          calculationResult = Math.round(((urineIgG / plasmaIgG) / (urineAlb / plasmaAlb)) * 100) / 100;
          break;

        case "24h-protein":
          calculationResult = calc.upcr(
            Number(calculatorState.spotProtein) || 0,
            Number(calculatorState.spotCreatinine) || 0
          );
          break;

        case "igan-prediction":
          calculationResult = calc.iganPredictionTool(
            Number(calculatorState.age) || 0,
            Number(calculatorState.eGFR) || 0,
            Number(calculatorState.map) || 0,
            Number(calculatorState.proteinuria) || 0,
            parseInt(calculatorState.years as string) as 2 | 5 | 7
          );
          break;

        case "acr-from-pcr":
          calculationResult = calc.acrFromPcr(
            getValue("pcr")
          );
          break;

        case "24-hour-protein": {
          const inputMode = (calculatorState.inputMode as string) || "ratio";
          const testType = (calculatorState.testType as string) || "pcr";
          console.log("24-hour-protein debug:", { inputMode, testType, calculatorState, unitState });
          
          let ratioMgPerMg = 0;
          
          if (inputMode === "ratio") {
            // Get ratio value and convert to mg/mg base unit
            const rawRatio = parseFloat(String(calculatorState.ratioValue)) || 0;
            const ratioUnit = unitState.ratioValue || (globalUnitPreference === "si" ? "mg/mmol" : "mg/mg");
            
            // Convert to mg/mg (base unit)
            if (ratioUnit === "mg/mg") {
              ratioMgPerMg = rawRatio;
            } else if (ratioUnit === "mg/g") {
              ratioMgPerMg = rawRatio / 1000; // mg/g to mg/mg
            } else if (ratioUnit === "mg/mmol") {
              ratioMgPerMg = rawRatio / 113.12; // mg/mmol to mg/mg
            } else if (ratioUnit === "mg/L") {
              ratioMgPerMg = rawRatio; // mg/L ratio is same as mg/mg (both in mg/L)
            }
            console.log("Using ratio mode, rawRatio:", rawRatio, "unit:", ratioUnit, "ratioMgPerMg:", ratioMgPerMg);
          } else {
            // Calculate from raw values
            // First convert protein to mg/L
            const rawProtein = parseFloat(String(calculatorState.proteinValue)) || 0;
            const proteinUnit = unitState.proteinValue || "mg/dL";
            let proteinMgL = rawProtein;
            if (proteinUnit === "mg/dL") {
              proteinMgL = rawProtein * 10; // mg/dL to mg/L
            } else if (proteinUnit === "g/L") {
              proteinMgL = rawProtein * 1000; // g/L to mg/L
            }
            // proteinUnit === "mg/L" stays as is
            
            // Convert creatinine to mg/L
            const rawCreatinine = parseFloat(String(calculatorState.creatinineValue)) || 0;
            const creatinineUnit = unitState.creatinineValue || "mg/dL";
            let creatinineMgL = rawCreatinine;
            if (creatinineUnit === "mg/dL") {
              creatinineMgL = rawCreatinine * 10; // mg/dL to mg/L
            } else if (creatinineUnit === "mmol/L") {
              creatinineMgL = rawCreatinine * 113.12; // mmol/L to mg/L (MW creatinine = 113.12)
            }
            
            // Calculate ratio in mg/mg (which equals mg/L / mg/L)
            ratioMgPerMg = creatinineMgL > 0 ? proteinMgL / creatinineMgL : 0;
            console.log("Using raw mode, protein:", proteinMgL, "mg/L, creatinine:", creatinineMgL, "mg/L, ratioMgPerMg:", ratioMgPerMg);
          }
          
          // PCR/ACR in mg/mg equals estimated 24-hour protein/albumin excretion in g/day
          calculationResult = ratioMgPerMg;
          console.log("Final result:", calculationResult, "g/day, testType:", testType);
          break;
        }

        case "ktv-hemodialysis":
          // getBunValue handles BUN/Urea 4-option toggle conversion to BUN mg/dL
          calculationResult = calc.ktv(
            getBunValue("preBUN"),
            getBunValue("postBUN"),
            Number(calculatorState.postWeight) || 0,
            Number(calculatorState.sessionTime) || 0,
            Number(calculatorState.ultrafiltration) || 0,
            "mg/dL" // Always mg/dL since getBunValue converts to BUN mg/dL
          );
          break;

        case "hd-session-duration": {
          const hdWt = Number(calculatorState.weight) || 0;
          const hdTbw = hdWt * (calculatorState.sex === "F" ? 0.5 : 0.6);
          calculationResult = calc.hemodialysisSessionDuration(
            Number(calculatorState.targetKtV) || 0,
            Number(calculatorState.dialyzerClearance) || 0,
            hdTbw
          );
          break;
        }

        case "pd-weekly-ktv": {
          const pdWt = Number(calculatorState.weight) || 0;
          const pdTbw = pdWt * (calculatorState.sex === "F" ? 0.5 : 0.6);
          calculationResult = calc.pdWeeklyKtv(
            Number(calculatorState.dailyDialysateUrea) || 0,
            Number(calculatorState.plasmaUrea) || 0,
            Number(calculatorState.dialysateVolume) || 0,
            pdTbw,
            Number(calculatorState.residualKtv) || 0
          );
          break;
        }

        case "residual-rkf-ktv": {
          const rkfWt = Number(calculatorState.weight) || 0;
          const rkfTbw = rkfWt * (calculatorState.sex === "F" ? 0.5 : 0.6);
          calculationResult = calc.residualKfKtv(
            Number(calculatorState.ureaUrineClearance) || 0,
            rkfTbw
          );
          break;
        }

        case "equilibrated-ktv":
          calculationResult = calc.equilibratedKtv(
            Number(calculatorState.spKtv) || 0,
            Number(calculatorState.sessionTime) || 0
          );
          break;

        case "standard-ktv":
          calculationResult = calc.standardKtv(
            Number(calculatorState.spKtv) || 0,
            Number(calculatorState.sessionTime) || 4,
            Number(calculatorState.sessionsPerWeek) || 3,
            Number(calculatorState.residualKtv) || 0
          );
          break;

        case "devine-ibw":
          calculationResult = calc.devineIdealBodyWeight(
            getValue("height"),
            calculatorState.sex as "M" | "F",
            "cm"
          );
          break;

        case "kt-v-daugirdas":
          // getBunValue handles BUN/Urea 4-option toggle conversion to BUN mg/dL
          calculationResult = calc.ktv(
            getBunValue("preBUN"),
            getBunValue("postBUN"),
            Number(calculatorState.postWeight) || 0,
            Number(calculatorState.sessionTime) || 0,
            Number(calculatorState.ultrafiltration) || 0,
            "mg/dL"
          );
          break;

        case "kt-v-peritoneal":
          calculationResult = calc.pdWeeklyKtv(
            Number(calculatorState.dialysateUrea) || 0,
            getValue("plasmaUrea"),
            Number(calculatorState.dialysateVolume) || 0,
            Number(calculatorState.bodyWeight) || 0
          );
          break;

        case "creatinine-clearance-pd":
          // Simplified PD creatinine clearance calculation
          const dialysateCr = getValue("dialysateCreatinine");
          const plasmaCr = getValue("plasmaCreatinine");
          const dialVol = Number(calculatorState.dialysateVolume) || 0;
          const bodyWt = Number(calculatorState.bodyWeight) || 0;
          calculationResult = Math.round((dialysateCr / plasmaCr) * (dialVol / bodyWt) * 100) / 100;
          break;

        case "total-body-water":
          calculationResult = calc.totalBodyWaterWatson(
            Number(calculatorState.weight) || 0,
            getValue("height"),
            Number(calculatorState.age) || 0,
            calculatorState.sex as "M" | "F"
          );
          break;

        case "urr":
          // getBunValue handles BUN/Urea 4-option toggle conversion to BUN mg/dL
          calculationResult = calc.urrHemodialysis(
            getBunValue("preBUN"),
            getBunValue("postBUN"),
            "mg/dL"
          );
          break;

        case "iron-deficit":
          calculationResult = calc.ironDeficitGanzoni(
            getValue("targetHemoglobin"),
            getValue("currentHemoglobin"),
            Number(calculatorState.weight) || 0,
            calculatorState.sex as "M" | "F"
          );
          break;

        case "kdpi": {
          const kdpiCalcResult = calc.kdpi(
            Number(calculatorState.donorAge) || 0,
            Number(calculatorState.donorHeight) || 0,
            Number(calculatorState.donorWeight) || 0,
            getValue("donorCreatinine"),
            (calculatorState.hypertensionDuration as "NO" | "0-5" | "6-10" | ">10") || "NO",
            (calculatorState.diabetesDuration as "NO" | "0-5" | "6-10" | ">10") || "NO",
            (calculatorState.causeOfDeath as "ANOXIA" | "CVA" | "HEAD_TRAUMA" | "CNS_TUMOR" | "OTHER") || "ANOXIA",
            calculatorState.isDCD === "YES",
            getInputUnit("donorCreatinine") === "SI" ? "μmol/L" : "mg/dL"
          );
          setKdpiResult(kdpiCalcResult);
          setResult(kdpiCalcResult.kdpi);
          // Generate interpretation based on KDPI value
          let kdpiInterpretation = "";
          if (kdpiCalcResult.kdpi <= 20) {
            kdpiInterpretation = "Low risk donor kidney. Expected to have better long-term graft survival.";
          } else if (kdpiCalcResult.kdpi <= 85) {
            kdpiInterpretation = "Standard criteria donor kidney. Acceptable for most recipients.";
          } else {
            kdpiInterpretation = "High KDPI (≥85%). Consider for expanded criteria donor (ECD) allocation. May be suitable for older recipients or those with limited life expectancy.";
          }
          setResultInterpretation(kdpiInterpretation);
          return;
        }

        case "epts":
          calculationResult = calc.epts(
            Number(calculatorState.recipientAge) || 0,
            Boolean(calculatorState.recipientDiabetes),
            Boolean(calculatorState.priorTransplant),
            Number(calculatorState.yearsOnDialysis) || 0
          );
          break;

        case "ascvd-risk":
          calculationResult = calc.ascvdRisk(
            Number(calculatorState.age) || 0,
            calculatorState.sex as "M" | "F",
            getValue("totalCholesterol"),
            getValue("hdl"),
            Number(calculatorState.systolicBP) || 0,
            Boolean(calculatorState.treated),
            Boolean(calculatorState.diabetes),
            Boolean(calculatorState.smoker),
            calculatorState.race as "Black" | "White"
          );
          break;

        case "cha2ds2-vasc": {
          const cha2Result = calc.cha2ds2vasc(
            calculatorState.chf === "1",
            calculatorState.hypertension === "1",
            Number(calculatorState.age) || 0,
            calculatorState.diabetes === "1",
            calculatorState.strokeTia === "1",
            calculatorState.vascularDisease === "1",
            calculatorState.sex as "M" | "F"
          );
          calculationResult = cha2Result.score;
          // Store the full result for detailed display
          setResultInterpretation(
            `Score: ${cha2Result.score} | Annual Stroke Risk: ${cha2Result.annualStrokeRisk}\n\n${cha2Result.recommendation}`
          );
          break;
        }

        case "bmi":
          calculationResult = calc.bmi(
            Number(calculatorState.weight) || 0,
            getValue("height"),
            "cm"
          );
          break;

        case "bsa-dubois":
          calculationResult = calc.bsaDuBois(
            Number(calculatorState.weight) || 0,
            getValue("height"),
            "cm"
          );
          break;

        case "bsa-mosteller":
          calculationResult = calc.bsaMosteller(
            Number(calculatorState.weight) || 0,
            getValue("height"),
            "cm"
          );
          break;

        case "ideal-body-weight":
          calculationResult = calc.devineIdealBodyWeight(
            getValue("height"),
            calculatorState.sex as "M" | "F",
            "cm"
          );
          break;

        case "lean-body-weight":
          calculationResult = calc.leanBodyWeight(
            Number(calculatorState.weight) || 0,
            getValue("height"),
            calculatorState.sex as "M" | "F",
            "cm"
          );
          break;

        case "adjusted-body-weight":
          calculationResult = calc.adjustedBodyWeight(
            Number(calculatorState.actualWeight) || 0,
            Number(calculatorState.idealWeight) || 0
          );
          break;

        case "ca-pho-product":
          calculationResult = calc.caPhoProduct(
            getValue("calcium"),
            getValue("phosphate"),
            "mg/dL",
            "mg/dL"
          );
          break;

        case "sledai-2k":
          calculationResult = calc.sledai2k(
            Boolean(calculatorState.seizures),
            Boolean(calculatorState.psychosis),
            Boolean(calculatorState.organicBrainSyndrome),
            Boolean(calculatorState.visualDisorder),
            Boolean(calculatorState.cranialNerveDisorder),
            Boolean(calculatorState.lupusHeadache),
            Boolean(calculatorState.cerebrovasitisAccident),
            Boolean(calculatorState.vasculitis),
            Boolean(calculatorState.arthritis),
            Boolean(calculatorState.myositis),
            Boolean(calculatorState.urinaryCasts),
            Boolean(calculatorState.proteinuria),
            Boolean(calculatorState.hematuria),
            Boolean(calculatorState.pyuria),
            Boolean(calculatorState.rash),
            Boolean(calculatorState.alopecia),
            Boolean(calculatorState.mucousalUlcers),
            Boolean(calculatorState.pleuritis),
            Boolean(calculatorState.pericarditis),
            Boolean(calculatorState.lowComplement),
            Boolean(calculatorState.elevatedDNA),
            Boolean(calculatorState.fever),
            Boolean(calculatorState.thrombocytopenia),
            Boolean(calculatorState.leukopenia)
          );
          break;

        case "frail-scale":
          calculationResult = calc.frailScale(
            Boolean(calculatorState.fatigue),
            Boolean(calculatorState.resistance),
            Boolean(calculatorState.ambulation),
            Boolean(calculatorState.illness),
            Boolean(calculatorState.lossOfWeight)
          );
          break;

        case "prisma-7":
          calculationResult = calc.prisma7(
            Boolean(calculatorState.age85),
            Boolean(calculatorState.male),
            Boolean(calculatorState.healthLimitActivities),
            Boolean(calculatorState.needHelp),
            Boolean(calculatorState.healthStayHome),
            Boolean(calculatorState.socialSupport),
            Boolean(calculatorState.mobilityAid)
          );
          break;

        case "curb-65":
          // getBunValue handles BUN/Urea 4-option toggle conversion to BUN mg/dL
          calculationResult = calc.curb65(
            Boolean(calculatorState.confusion),
            getBunValue("urineaNitrogen"),
            Number(calculatorState.respiratoryRate) || 0,
            Number(calculatorState.bloodPressureSystolic) || 0,
            Number(calculatorState.bloodPressureDiastolic) || 0,
            Number(calculatorState.age) || 0,
            "mg/dL"
          );
          break;

        case "roks":
          calculationResult = calc.roks(
            Number(calculatorState.age) || 0,
            Number(calculatorState.bmi) || 0,
            Boolean(calculatorState.maleGender),
            Boolean(calculatorState.previousStone),
            Boolean(calculatorState.familyHistory)
          );
          break;

        case "slicc-2012":
          calculationResult = calc.slicc2012(
            Boolean(calculatorState.acuteRash),
            Boolean(calculatorState.chronicRash),
            Boolean(calculatorState.oralUlcers),
            Boolean(calculatorState.alopecia),
            Boolean(calculatorState.photosensitivity),
            Boolean(calculatorState.arthritis),
            Boolean(calculatorState.serositis),
            Boolean(calculatorState.renal),
            Boolean(calculatorState.psychosis),
            Boolean(calculatorState.seizures),
            Boolean(calculatorState.hemolytic),
            Boolean(calculatorState.leukopenia),
            Boolean(calculatorState.thrombocytopenia),
            Boolean(calculatorState.ana),
            Boolean(calculatorState.antiDsDna),
            Boolean(calculatorState.antiSmRnp),
            Boolean(calculatorState.antiRoSsa),
            Boolean(calculatorState.antiLaSSb),
            Boolean(calculatorState.antiC1q),
            Boolean(calculatorState.directCoombs)
          );
          break;

        case "frax-simplified": {
          const fraxCalcResult = calc.fraxSimplified(
            Number(calculatorState.age) || 0,
            calculatorState.sex as "M" | "F",
            Number(calculatorState.weight) || 0,
            getValue("height"),
            Boolean(calculatorState.previousFracture),
            Boolean(calculatorState.parentHipFracture),
            Boolean(calculatorState.currentSmoking),
            Boolean(calculatorState.glucocorticoids),
            Boolean(calculatorState.rheumatoidArthritis),
            Boolean(calculatorState.secondaryOsteoporosis),
            Boolean(calculatorState.alcoholIntake),
            calculatorState.bmdTScore ? Number(calculatorState.bmdTScore) : undefined
          );
          setFraxResult(fraxCalcResult);
          setResult(fraxCalcResult.majorFracture);
          setResultInterpretation('');
          return;
        }

        case "banff-classification":
          console.log('Banff calculation starting...');
          console.log('calculatorState:', JSON.stringify(calculatorState));
          const banffScores: calc.BanffScores = {
            glomeruli: parseFloat(calculatorState.glomeruli as string) || 10,
            arteries: parseFloat(calculatorState.arteries as string) || 2,
            i: parseFloat(calculatorState.i as string) || 0,
            t: parseFloat(calculatorState.t as string) || 0,
            v: parseFloat(calculatorState.v as string) || 0,
            g: parseFloat(calculatorState.g as string) || 0,
            ptc: parseFloat(calculatorState.ptc as string) || 0,
            ci: parseFloat(calculatorState.ci as string) || 0,
            ct: parseFloat(calculatorState.ct as string) || 0,
            cv: parseFloat(calculatorState.cv as string) || 0,
            cg: parseFloat(calculatorState.cg as string) || 0,
            ti: parseFloat(calculatorState.ti as string) || 0,
            iIfta: parseFloat(calculatorState.iIfta as string) || 0,
            tIfta: parseFloat(calculatorState.tIfta as string) || 0,
            ah: parseFloat(calculatorState.ah as string) || 0,
            c4d: parseInt(calculatorState.c4d as string) || 0,
            dsa: (calculatorState.dsa as string) || 'negative',
          };
          console.log('banffScores:', JSON.stringify(banffScores));
          const banffResultData = calc.banffClassification(banffScores);
          console.log('banffResultData:', JSON.stringify(banffResultData));
          setBanffResult(banffResultData);
          console.log('setBanffResult called');
          setResult(null); // Banff uses custom display, not numeric result
          setResultInterpretation('');
          return; // Skip the default interpretation handling


        // Contrast-Induced Nephropathy Risk Calculator
        case "cin-mehran-score": {
          // Mehran 2 Score Model 1 (Pre-procedural) - Lancet 2021
          const m2breakdown: { factor: string; points: number; present: boolean }[] = [];
          let m2Score = 0;
          
          // 1. Clinical Presentation: 0/2/4/8 points
          const presentation = calculatorState.presentation as string;
          let presentationPoints = 0;
          let presentationLabel = 'Asymptomatic / Stable Angina';
          if (presentation === 'unstable') { presentationPoints = 2; presentationLabel = 'Unstable Angina'; }
          else if (presentation === 'nstemi') { presentationPoints = 4; presentationLabel = 'NSTEMI'; }
          else if (presentation === 'stemi') { presentationPoints = 8; presentationLabel = 'STEMI'; }
          m2breakdown.push({ factor: `Clinical Presentation: ${presentationLabel}`, points: presentationPoints, present: presentationPoints > 0 });
          m2Score += presentationPoints;
          
          // 2. eGFR: 0/1/4 points
          const m2Egfr = Number(calculatorState.egfr) || 0;
          let m2EgfrPoints = 0;
          let m2EgfrLabel = '';
          if (m2Egfr < 30) {
            m2EgfrPoints = 4;
            m2EgfrLabel = `eGFR <30 mL/min/1.73m² (${m2Egfr})`;
          } else if (m2Egfr < 60) {
            m2EgfrPoints = 1;
            m2EgfrLabel = `eGFR 30-59 mL/min/1.73m² (${m2Egfr})`;
          } else {
            m2EgfrLabel = `eGFR ≥60 mL/min/1.73m² (${m2Egfr})`;
          }
          m2breakdown.push({ factor: m2EgfrLabel, points: m2EgfrPoints, present: m2EgfrPoints > 0 });
          m2Score += m2EgfrPoints;
          
          // 3. LVEF: 0/2 points
          const m2Lvef = Number(calculatorState.lvef) || 0;
          const m2LvefPoints = m2Lvef < 40 ? 2 : 0;
          m2breakdown.push({ factor: `LVEF ${m2Lvef < 40 ? '<40%' : '≥40%'} (${m2Lvef}%)`, points: m2LvefPoints, present: m2LvefPoints > 0 });
          m2Score += m2LvefPoints;
          
          // 4. Diabetes: 0/1/2 points
          const m2DiabetesType = calculatorState.diabetesType as string;
          let m2DiabetesPoints = 0;
          let m2DiabetesLabel = 'No Diabetes';
          if (m2DiabetesType === 'noninsulin') { m2DiabetesPoints = 1; m2DiabetesLabel = 'Non-Insulin-Treated Diabetes'; }
          else if (m2DiabetesType === 'insulin') { m2DiabetesPoints = 2; m2DiabetesLabel = 'Insulin-Treated Diabetes'; }
          m2breakdown.push({ factor: `Diabetes: ${m2DiabetesLabel}`, points: m2DiabetesPoints, present: m2DiabetesPoints > 0 });
          m2Score += m2DiabetesPoints;
          
          // 5. Hemoglobin: 0/1 points (convert from g/L if needed)
          let m2Hb = Number(calculatorState.hemoglobin) || 0;
          const m2HbUnit = unitState.hemoglobin || 'g/dL';
          if (m2HbUnit === 'g/L') { m2Hb = m2Hb / 10; }
          const m2HbPoints = m2Hb < 11 ? 1 : 0;
          m2breakdown.push({ factor: `Hemoglobin ${m2Hb < 11 ? '<11' : '≥11'} g/dL (${m2Hb.toFixed(1)})`, points: m2HbPoints, present: m2HbPoints > 0 });
          m2Score += m2HbPoints;
          
          // 6. Basal Glucose: 0/1 points (convert from mmol/L if needed)
          let m2Glucose = Number(calculatorState.glucose) || 0;
          const m2GlucoseUnit = unitState.glucose || 'mg/dL';
          if (m2GlucoseUnit === 'mmol/L') { m2Glucose = m2Glucose * 18.0182; }
          const m2GlucosePoints = m2Glucose >= 150 ? 1 : 0;
          m2breakdown.push({ factor: `Basal Glucose ${m2Glucose >= 150 ? '≥150' : '<150'} mg/dL (${Math.round(m2Glucose)})`, points: m2GlucosePoints, present: m2GlucosePoints > 0 });
          m2Score += m2GlucosePoints;
          
          // 7. CHF on presentation: 0/1 points
          const m2Chf = calculatorState.chf === '1' || calculatorState.chf === true;
          m2breakdown.push({ factor: 'Congestive Heart Failure on Presentation', points: 1, present: m2Chf });
          if (m2Chf) m2Score += 1;
          
          // 8. Age >75: 0/1 points
          const m2AgeOver75 = calculatorState.ageOver75 === '1' || calculatorState.ageOver75 === true;
          m2breakdown.push({ factor: 'Age >75 years', points: 1, present: m2AgeOver75 });
          if (m2AgeOver75) m2Score += 1;
          
          // Determine risk category and CA-AKI risk
          let m2RiskCategory = '';
          let m2CakiRisk = 0;
          if (m2Score <= 4) {
            m2RiskCategory = 'Low Risk';
            m2CakiRisk = 2.3;
          } else if (m2Score <= 8) {
            m2RiskCategory = 'Moderate Risk';
            m2CakiRisk = 8.3;
          } else if (m2Score <= 11) {
            m2RiskCategory = 'High Risk';
            m2CakiRisk = 16.5;
          } else {
            m2RiskCategory = 'Very High Risk';
            m2CakiRisk = 34.9;
          }
          
          setMehranResult({
            totalScore: m2Score,
            riskCategory: m2RiskCategory,
            cinRisk: m2CakiRisk,
            dialysisRisk: 0,
            breakdown: m2breakdown
          });
          setResult(m2Score);
          setResultInterpretation('');
          return;
        }

        // Original Mehran Score (2004)
        case "cin-mehran-original-score": {
          const origBreakdown: { factor: string; points: number; present: boolean }[] = [];
          let origMehranScore = 0;
          
          // Hypotension: 5 points
          const origHasHypotension = calculatorState.hypotension === "1" || calculatorState.hypotension === true;
          origBreakdown.push({ factor: 'Hypotension (SBP <80 mmHg for ≥1 hr requiring inotropes)', points: 5, present: origHasHypotension });
          if (origHasHypotension) origMehranScore += 5;
          
          // IABP: 5 points
          const origHasIABP = calculatorState.iabp === "1" || calculatorState.iabp === true;
          origBreakdown.push({ factor: 'Intra-aortic balloon pump (IABP)', points: 5, present: origHasIABP });
          if (origHasIABP) origMehranScore += 5;
          
          // CHF: 5 points
          const origHasCHF = calculatorState.chf === "1" || calculatorState.chf === true;
          origBreakdown.push({ factor: 'Congestive heart failure (NYHA III-IV or pulmonary edema)', points: 5, present: origHasCHF });
          if (origHasCHF) origMehranScore += 5;
          
          // Age >75: 4 points
          const origHasAge = calculatorState.ageOver75 === "1" || calculatorState.ageOver75 === true;
          origBreakdown.push({ factor: 'Age >75 years', points: 4, present: origHasAge });
          if (origHasAge) origMehranScore += 4;
          
          // Anemia: 3 points
          const origHasAnemia = calculatorState.anemia === "1" || calculatorState.anemia === true;
          origBreakdown.push({ factor: 'Anemia (Hct <39% for men, <36% for women)', points: 3, present: origHasAnemia });
          if (origHasAnemia) origMehranScore += 3;
          
          // Diabetes: 3 points
          const origHasDiabetes = calculatorState.diabetes === "1" || calculatorState.diabetes === true;
          origBreakdown.push({ factor: 'Diabetes mellitus', points: 3, present: origHasDiabetes });
          if (origHasDiabetes) origMehranScore += 3;
          
          // Contrast volume: 1 point per 100cc
          const origContrastVol = Number(calculatorState.contrastVolume) || 0;
          const origContrastPoints = Math.floor(origContrastVol / 100);
          origBreakdown.push({ factor: `Contrast volume (${origContrastVol} mL = ${origContrastPoints} pts)`, points: origContrastPoints, present: origContrastPoints > 0 });
          origMehranScore += origContrastPoints;
          
          // eGFR points: 2 points if 40-60, 4 points if 20-40, 6 points if <20
          let origCreatinine = Number(calculatorState.creatinine) || 1.0;
          // Handle unit conversion for creatinine
          if (unitState['creatinine'] === 'μmol/L') {
            origCreatinine = origCreatinine / 88.4;
          }
          const origCinEgfr = Number(calculatorState.egfr) || 60;
          let origEgfrPoints = 0;
          let origEgfrLabel = '';
          if (origCinEgfr < 20) {
            origEgfrPoints = 6;
            origEgfrLabel = `eGFR <20 mL/min (${origCinEgfr})`;
          } else if (origCinEgfr < 40) {
            origEgfrPoints = 4;
            origEgfrLabel = `eGFR 20-39 mL/min (${origCinEgfr})`;
          } else if (origCinEgfr < 60) {
            origEgfrPoints = 2;
            origEgfrLabel = `eGFR 40-59 mL/min (${origCinEgfr})`;
          } else {
            origEgfrLabel = `eGFR ≥60 mL/min (${origCinEgfr})`;
          }
          origBreakdown.push({ factor: origEgfrLabel, points: origEgfrPoints, present: origEgfrPoints > 0 });
          origMehranScore += origEgfrPoints;
          
          // SCr >1.5: 4 points (only if eGFR not provided)
          if (!calculatorState.egfr && origCreatinine > 1.5) {
            origBreakdown.push({ factor: `Serum Creatinine >1.5 mg/dL (${origCreatinine.toFixed(1)})`, points: 4, present: true });
            origMehranScore += 4;
          }
          
          // Determine risk category
          let origRiskCategory = '';
          let origCinRisk = 0;
          let origDialysisRisk = 0;
          if (origMehranScore <= 5) {
            origRiskCategory = 'Low Risk';
            origCinRisk = 7.5;
            origDialysisRisk = 0.04;
          } else if (origMehranScore <= 10) {
            origRiskCategory = 'Moderate Risk';
            origCinRisk = 14.0;
            origDialysisRisk = 0.12;
          } else if (origMehranScore <= 15) {
            origRiskCategory = 'High Risk';
            origCinRisk = 26.1;
            origDialysisRisk = 1.09;
          } else {
            origRiskCategory = 'Very High Risk';
            origCinRisk = 57.3;
            origDialysisRisk = 12.6;
          }
          
          setMehranResult({
            totalScore: origMehranScore,
            riskCategory: origRiskCategory,
            cinRisk: origCinRisk,
            dialysisRisk: origDialysisRisk,
            breakdown: origBreakdown
          });
          setResult(origMehranScore);
          setResultInterpretation('');
          return;
        }

        // ============================================================================
        // CRITICAL CARE CALCULATORS
        // ============================================================================
        case "qsofa": {
          const qsofaResult = calc.qsofa(
            Number(calculatorState.respiratoryRate) || 0,
            Number(calculatorState.systolicBP) || 0,
            Number(calculatorState.gcs) || 0
          );
          calculationResult = qsofaResult.score;
          setResultInterpretation(
            `${qsofaResult.interpretation}\n\nCriteria:\n${qsofaResult.criteria.join('\n')}`
          );
          break;
        }

        case "news2": {
          const news2Result = calc.news2(
            Number(calculatorState.respiratoryRate) || 0,
            Number(calculatorState.spo2) || 0,
            calculatorState.supplementalO2 === 'yes',
            Number(calculatorState.systolicBP) || 0,
            Number(calculatorState.heartRate) || 0,
            Number(calculatorState.temperature) || 0,
            calculatorState.consciousness as 'A' | 'C' | 'V' | 'P' | 'U'
          );
          calculationResult = news2Result.score;
          setResultInterpretation(
            `${news2Result.interpretation}\n\nBreakdown:\n${news2Result.breakdown.join('\n')}`
          );
          break;
        }

        case "sofa": {
          const sofaResult = calc.sofa(
            Number(calculatorState.pao2) || 0,
            Number(calculatorState.fio2) || 0,
            Number(calculatorState.platelets) || 0,
            Number(calculatorState.bilirubin) || 0,
            (unitState.bilirubin || 'μmol/L') as 'μmol/L' | 'mg/dL',
            Number(calculatorState.map) || 0,
            calculatorState.vasopressor as 'none' | 'dopa_low' | 'dopa_mid' | 'dopa_high',
            Number(calculatorState.gcs) || 0,
            Number(calculatorState.creatinine) || 0,
            (unitState.creatinine || 'mg/dL') as 'μmol/L' | 'mg/dL',
            Number(calculatorState.urineOutput) || 0
          );
          calculationResult = sofaResult.score;
          setResultInterpretation(
            `${sofaResult.interpretation}\n\nOrgan Scores:\n` +
            `• Respiratory: ${sofaResult.organScores.respiratory}\n` +
            `• Coagulation: ${sofaResult.organScores.coagulation}\n` +
            `• Liver: ${sofaResult.organScores.liver}\n` +
            `• Cardiovascular: ${sofaResult.organScores.cardiovascular}\n` +
            `• CNS: ${sofaResult.organScores.cns}\n` +
            `• Renal: ${sofaResult.organScores.renal}`
          );
          break;
        }

        case "wells-pe": {
          const wellsPeResult = calc.wellsPE(
            calculatorState.dvtSigns === 'yes',
            calculatorState.peTopDiagnosis === 'yes',
            calculatorState.heartRateOver100 === 'yes',
            calculatorState.immobilization === 'yes',
            calculatorState.previousPeDvt === 'yes',
            calculatorState.hemoptysis === 'yes',
            calculatorState.malignancy === 'yes'
          );
          calculationResult = wellsPeResult.score;
          setResultInterpretation(
            `${wellsPeResult.interpretation} (${wellsPeResult.simplified})\n\nCriteria:\n${wellsPeResult.criteria.join('\n')}`
          );
          break;
        }

        case "wells-dvt": {
          const wellsDvtResult = calc.wellsDVT(
            calculatorState.activeCancer === 'yes',
            calculatorState.paralysis === 'yes',
            calculatorState.bedridden === 'yes',
            calculatorState.localizedTenderness === 'yes',
            calculatorState.entireLegSwollen === 'yes',
            calculatorState.calfSwelling === 'yes',
            calculatorState.pittingEdema === 'yes',
            calculatorState.collateralVeins === 'yes',
            calculatorState.previousDvt === 'yes',
            calculatorState.alternativeDiagnosis === 'yes'
          );
          calculationResult = wellsDvtResult.score;
          setResultInterpretation(
            `${wellsDvtResult.interpretation}\n\nCriteria:\n${wellsDvtResult.criteria.join('\n')}`
          );
          break;
        }

        case "gcs": {
          const gcsResult = calc.glasgowComaScale(
            parseInt(String(calculatorState.eyeOpening)) || 4,
            parseInt(String(calculatorState.verbalResponse)) || 5,
            parseInt(String(calculatorState.motorResponse)) || 6
          );
          calculationResult = gcsResult.score;
          setResultInterpretation(
            `${gcsResult.severity}\n\nComponents: E${gcsResult.components.eye}V${gcsResult.components.verbal}M${gcsResult.components.motor}`
          );
          break;
        }

        case "pesi": {
          const pesiResult = calc.pesiScore(
            parseFloat(String(calculatorState.age)) || 65,
            calculatorState.sex === 'male',
            calculatorState.cancer === 'yes',
            calculatorState.heartFailure === 'yes',
            calculatorState.chronicLungDisease === 'yes',
            calculatorState.pulse === 'yes',
            calculatorState.systolicBPLow === 'yes',
            calculatorState.respiratoryRateHigh === 'yes',
            calculatorState.tempLow === 'yes',
            calculatorState.alteredMentalStatus === 'yes',
            calculatorState.spo2Low === 'yes'
          );
          calculationResult = pesiResult.score;
          setResultInterpretation(
            `${pesiResult.riskClass}\n30-day mortality: ${pesiResult.mortality}\n\nScoring:\n${pesiResult.criteria.join('\n')}`
          );
          break;
        }

        case "apache2": {
          const apache2Result = calc.apacheIIScore(
            parseFloat(String(calculatorState.age)) || 55,
            parseFloat(String(calculatorState.temperature)) || 37,
            parseFloat(String(calculatorState.map)) || 80,
            parseFloat(String(calculatorState.heartRate)) || 85,
            parseFloat(String(calculatorState.respiratoryRate)) || 18,
            parseFloat(String(calculatorState.fio2)) || 21,
            calculatorState.pao2 ? parseFloat(String(calculatorState.pao2)) : null,
            calculatorState.aaGradient ? parseFloat(String(calculatorState.aaGradient)) : null,
            parseFloat(String(calculatorState.arterialPH)) || 7.4,
            parseFloat(String(calculatorState.sodium)) || 140,
            parseFloat(String(calculatorState.potassium)) || 4.0,
            parseFloat(String(calculatorState.creatinine)) || 1.0,
            calculatorState.acuteRenalFailure === 'yes',
            parseFloat(String(calculatorState.hematocrit)) || 40,
            parseFloat(String(calculatorState.wbc)) || 10,
            parseFloat(String(calculatorState.gcs)) || 15,
            (calculatorState.chronicHealth as 'none' | 'elective' | 'emergency') || 'none'
          );
          calculationResult = apache2Result.score;
          setResultInterpretation(
            `Predicted mortality: ${apache2Result.predictedMortality}\n\nComponents:\n• Acute Physiology Score: ${apache2Result.components.aps}\n• Age Points: ${apache2Result.components.age}\n• Chronic Health Points: ${apache2Result.components.chronic}`
          );
          break;
        }

        case "sirs": {
          const sirsResult = calc.sirsScore(
            String(calculatorState.temperature) || 'normal',
            String(calculatorState.heartRate) || 'normal',
            String(calculatorState.respiratoryRate) || 'normal',
            String(calculatorState.wbc) || 'normal'
          );
          calculationResult = sirsResult.score;
          const criteriaMet = [];
          if (sirsResult.criteria.temp) criteriaMet.push('Temperature >38C or <36C');
          if (sirsResult.criteria.hr) criteriaMet.push('Heart Rate >90 bpm');
          if (sirsResult.criteria.rr) criteriaMet.push('RR >20 or PaCO2 <32');
          if (sirsResult.criteria.wbc) criteriaMet.push('WBC >12k or <4k or >10% bands');
          setResultInterpretation(
            `Criteria Met (${sirsResult.score}/4):\n${criteriaMet.length > 0 ? criteriaMet.map(c => '\u2713 ' + c).join('\n') : 'None'}\n\n${sirsResult.score >= 2 ? 'SIRS POSITIVE - If infection suspected, consider sepsis.' : 'SIRS NEGATIVE - Does not rule out infection.'}`
          );
          break;
        }

        case "genevaRevised": {
          const genevaResult = calc.genevaRevisedScore(
            String(calculatorState.age) || 'no',
            String(calculatorState.previousPeDvt) || 'no',
            String(calculatorState.surgery) || 'no',
            String(calculatorState.malignancy) || 'no',
            String(calculatorState.unilateralPain) || 'no',
            String(calculatorState.hemoptysis) || 'no',
            String(calculatorState.heartRate) || 'normal',
            String(calculatorState.legPainEdema) || 'no'
          );
          calculationResult = genevaResult.score;
          const genevaComponents = [];
          if (genevaResult.components.age > 0) genevaComponents.push(`Age >65: +${genevaResult.components.age}`);
          if (genevaResult.components.previousPeDvt > 0) genevaComponents.push(`Previous PE/DVT: +${genevaResult.components.previousPeDvt}`);
          if (genevaResult.components.surgery > 0) genevaComponents.push(`Surgery/fracture: +${genevaResult.components.surgery}`);
          if (genevaResult.components.malignancy > 0) genevaComponents.push(`Malignancy: +${genevaResult.components.malignancy}`);
          if (genevaResult.components.unilateralPain > 0) genevaComponents.push(`Unilateral leg pain: +${genevaResult.components.unilateralPain}`);
          if (genevaResult.components.hemoptysis > 0) genevaComponents.push(`Hemoptysis: +${genevaResult.components.hemoptysis}`);
          if (genevaResult.components.heartRate > 0) genevaComponents.push(`Heart rate: +${genevaResult.components.heartRate}`);
          if (genevaResult.components.legPainEdema > 0) genevaComponents.push(`Leg pain/edema: +${genevaResult.components.legPainEdema}`);
          let probability = 'LOW';
          let prevalence = '~8%';
          if (genevaResult.score >= 11) { probability = 'HIGH'; prevalence = '~74%'; }
          else if (genevaResult.score >= 4) { probability = 'INTERMEDIATE'; prevalence = '~28%'; }
          setResultInterpretation(
            `${probability} PROBABILITY (PE prevalence ${prevalence})\n\nPoint Breakdown:\n${genevaComponents.length > 0 ? genevaComponents.join('\n') : 'No risk factors identified'}`
          );
          break;
        }

        case "hasbled": {
          const hasbledResult = calc.hasbledScore(
            String(calculatorState.hypertension) || 'no',
            String(calculatorState.renalDisease) || 'no',
            String(calculatorState.liverDisease) || 'no',
            String(calculatorState.strokeHistory) || 'no',
            String(calculatorState.priorBleeding) || 'no',
            String(calculatorState.labileINR) || 'no',
            String(calculatorState.age) || 'no',
            String(calculatorState.medications) || 'no',
            String(calculatorState.alcoholUse) || 'no'
          );
          calculationResult = hasbledResult.score;
          const hasbledComponents = [];
          if (hasbledResult.components.hypertension > 0) hasbledComponents.push('H - Hypertension: +1');
          if (hasbledResult.components.renal > 0) hasbledComponents.push('A - Abnormal renal function: +1');
          if (hasbledResult.components.liver > 0) hasbledComponents.push('A - Abnormal liver function: +1');
          if (hasbledResult.components.stroke > 0) hasbledComponents.push('S - Stroke history: +1');
          if (hasbledResult.components.bleeding > 0) hasbledComponents.push('B - Bleeding history: +1');
          if (hasbledResult.components.labileINR > 0) hasbledComponents.push('L - Labile INR: +1');
          if (hasbledResult.components.age > 0) hasbledComponents.push('E - Elderly (>65): +1');
          if (hasbledResult.components.medications > 0) hasbledComponents.push('D - Drugs (antiplatelets/NSAIDs): +1');
          if (hasbledResult.components.alcohol > 0) hasbledComponents.push('D - Drinking (alcohol): +1');
          let riskLevel = 'LOW';
          if (hasbledResult.score >= 4) riskLevel = 'VERY HIGH';
          else if (hasbledResult.score === 3) riskLevel = 'HIGH';
          else if (hasbledResult.score === 2) riskLevel = 'MODERATE';
          setResultInterpretation(
            `${riskLevel} BLEEDING RISK\nAnnual major bleeding risk: ${hasbledResult.annualBleedingRisk}\n\nComponents (HAS-BLED):\n${hasbledComponents.length > 0 ? hasbledComponents.join('\n') : 'No risk factors identified'}`
          );
          break;
        }

        case "perc": {
          const percResult = calc.percRule(
            String(calculatorState.age) || 'no',
            String(calculatorState.heartRate) || 'no',
            String(calculatorState.oxygenSaturation) || 'no',
            String(calculatorState.unilateralLegSwelling) || 'no',
            String(calculatorState.hemoptysis) || 'no',
            String(calculatorState.recentSurgeryTrauma) || 'no',
            String(calculatorState.priorPeDvt) || 'no',
            String(calculatorState.hormoneUse) || 'no'
          );
          calculationResult = percResult.criteriaCount;
          const percPositive = [];
          const percNegative = [];
          if (percResult.criteria.age) percPositive.push('Age \u226550 years');
          else percNegative.push('Age <50 years');
          if (percResult.criteria.heartRate) percPositive.push('HR \u2265100 bpm');
          else percNegative.push('HR <100 bpm');
          if (percResult.criteria.oxygenSaturation) percPositive.push('SpO\u2082 <95%');
          else percNegative.push('SpO\u2082 \u226595%');
          if (percResult.criteria.unilateralLegSwelling) percPositive.push('Unilateral leg swelling');
          else percNegative.push('No leg swelling');
          if (percResult.criteria.hemoptysis) percPositive.push('Hemoptysis');
          else percNegative.push('No hemoptysis');
          if (percResult.criteria.recentSurgeryTrauma) percPositive.push('Recent surgery/trauma');
          else percNegative.push('No recent surgery');
          if (percResult.criteria.priorPeDvt) percPositive.push('Prior PE/DVT');
          else percNegative.push('No prior PE/DVT');
          if (percResult.criteria.hormoneUse) percPositive.push('Hormone use');
          else percNegative.push('No hormone use');
          const percStatus = percResult.allNegative ? 'PERC NEGATIVE - PE Ruled Out' : 'PERC POSITIVE - Cannot Rule Out PE';
          setResultInterpretation(
            `${percStatus}\n\n${percResult.allNegative ? '\u2713 All 8 criteria negative. In LOW pretest probability patients, PE can be safely ruled out without D-dimer.' : '\u2717 ' + percResult.criteriaCount + ' criteria positive. Proceed with D-dimer or imaging.'}\n\nPositive Criteria:\n${percPositive.length > 0 ? percPositive.map(c => '\u2717 ' + c).join('\n') : 'None'}\n\nNegative Criteria:\n${percNegative.map(c => '\u2713 ' + c).join('\n')}`
          );
          break;
        }

        case "anticoagReversal": {
          const reversalResult = calc.anticoagulationReversal(
            String(calculatorState.anticoagulant) || 'warfarin',
            String(calculatorState.indication) || 'major',
            String(calculatorState.renalFunction) || 'normal',
            String(calculatorState.bleedingSeverity) || 'major',
            calculatorState.weight ? parseFloat(String(calculatorState.weight)) : undefined
          );
          calculationResult = 1; // Placeholder for display
          setAnticoagReversalResult(reversalResult);
          setResultInterpretation(`Reversal protocol generated for ${reversalResult.anticoagulant}. See detailed action plan below.`);
          break;
        }

        case "steroid-conversion": {
          const steroidResult = calc.steroidConversion(
            String(calculatorState.fromSteroid) || 'prednisone',
            parseFloat(String(calculatorState.dose)) || 0
          );
          setSteroidConversionResult(steroidResult);
          calculationResult = steroidResult.fromDose;
          setResultInterpretation(`Equivalent doses calculated for ${steroidResult.fromDose} mg of ${steroidResult.fromSteroid}. See conversion table below.`);
          break;
        }

        case "plasma-exchange": {
          const plexResult = calc.plasmaExchangeDosing(
            parseFloat(String(calculatorState.weight)) || 70,
            getValue("height") || 170,
            parseFloat(String(calculatorState.hematocrit)) || 40,
            (String(calculatorState.sex) || 'M') as 'M' | 'F',
            parseFloat(String(calculatorState.exchangeVolumes)) || 1,
            String(calculatorState.indication) || 'other'
          );
          setPlasmaExchangeResult(plexResult);
          calculationResult = plexResult.totalPlasmaVolume;
          setResultInterpretation(`Plasma volume: ${plexResult.totalPlasmaVolume} mL (${plexResult.plasmaVolumePerKg} mL/kg). Exchange volume: ${plexResult.exchangeVolume} mL. See detailed protocol below.`);
          break;
        }

        // RESTORED CALCULATORS (18 previously missing)
        case "albumin-corrected-ag": {
          const agResult = calc.albuminCorrectedAnionGap(
            Number(calculatorState.sodium) || 0,
            Number(calculatorState.chloride) || 0,
            Number(calculatorState.bicarbonate) || 0,
            getValue("albumin")
          );
          calculationResult = agResult.correctedAG;
          setResultInterpretation(
            `Uncorrected AG: ${agResult.ag} mEq/L | Corrected AG: ${agResult.correctedAG} mEq/L. ` +
            selectedCalculator.interpretation(agResult.correctedAG)
          );
          break;
        }

        case "bicarbonate-deficit":
          calculationResult = calc.bicarbonateDeficit(
            Number(calculatorState.weight) || 0,
            Number(calculatorState.bicarbonate) || 0
          );
          break;

        case "calculated-osmolality":
          calculationResult = calc.calculatedOsmolality(
            Number(calculatorState.sodium) || 0,
            getValue("glucose"),
            getBunValue("bun")
          );
          break;

        case "creatinine-clearance-24h":
          calculationResult = calc.creatinineClearance24h(
            getValue("urineCreatinine24h"),
            Number(calculatorState.urineVolume24h) || 0,
            getValue("plasmaCr")
          );
          break;

        case "ekfc-creatinine":
          calculationResult = calc.ekfcCreatinine(
            getValue("creatinine"),
            Number(calculatorState.age) || 0,
            calculatorState.sex as "M" | "F",
            "mg/dL"
          );
          break;

        case "electrolyte-free-water-clearance":
          calculationResult = calc.electrolyteFreeWaterClearance(
            Number(calculatorState.urineOutput) || 0,
            Number(calculatorState.urineNa) || 0,
            Number(calculatorState.urineK) || 0,
            Number(calculatorState.plasmaNa) || 0
          );
          break;

        case "fe-magnesium":
          calculationResult = calc.feMagnesium(
            getValue("urineMagnesium"),
            getValue("plasmaMagnesium"),
            getValue("urineCr"),
            getValue("plasmaCr")
          );
          break;

        case "fe-uric-acid":
          calculationResult = calc.feUricAcid(
            getValue("urineUricAcid"),
            getValue("plasmaUricAcid"),
            getValue("urineCr"),
            getValue("plasmaCr")
          );
          break;

        case "free-water-clearance":
          calculationResult = calc.freeWaterClearance(
            Number(calculatorState.urineOutput) || 0,
            Number(calculatorState.urineOsm) || 0,
            Number(calculatorState.plasmaOsm) || 0
          );
          break;

        case "henderson-hasselbalch":
          calculationResult = calc.hendersonHasselbalch(
            Number(calculatorState.bicarbonate) || 0,
            Number(calculatorState.pCO2) || 0
          );
          break;

        case "kdigo-aki-staging":
          calculationResult = calc.kdigoAkiStaging(
            getValue("baselineCreatinine"),
            getValue("currentCreatinine")
          );
          break;

        case "mdrd":
          calculationResult = calc.mdrdGfr(
            getValue("creatinine"),
            Number(calculatorState.age) || 0,
            calculatorState.sex as "M" | "F",
            calculatorState.race as "Black" | "Other",
            "mg/dL"
          );
          break;

        case "phosphate-repletion": {
          const phosResult = calc.phosphateRepletion(
            getValue("serumPhosphate"),
            Number(calculatorState.weight) || 0
          );
          calculationResult = phosResult.dose;
          if (phosResult.severity !== "normal") {
            setResultInterpretation(
              `${phosResult.severity.charAt(0).toUpperCase() + phosResult.severity.slice(1)} hypophosphatemia — ` +
              `recommended IV phosphate dose: ${phosResult.dose} mmol. ` +
              selectedCalculator.interpretation(phosResult.dose)
            );
          }
          break;
        }

        case "potassium-repletion": {
          const kResult = calc.potassiumRepletion(
            Number(calculatorState.serumPotassium) || 0,
            Number(calculatorState.targetPotassium) || 4.0
          );
          calculationResult = kResult.deficit;
          if (kResult.severity !== "normal") {
            setResultInterpretation(
              `${kResult.severity.charAt(0).toUpperCase() + kResult.severity.slice(1)} hypokalemia — ` +
              `estimated total body deficit: ~${kResult.deficit} mEq. ` +
              selectedCalculator.interpretation(kResult.deficit)
            );
          }
          break;
        }

        case "stool-osmolar-gap":
          calculationResult = calc.stoolOsmolarGap(
            Number(calculatorState.stoolNa) || 0,
            Number(calculatorState.stoolK) || 0,
            Number(calculatorState.stoolOsmolality) || 290
          );
          break;

        case "trp-tmp-gfr": {
          const trpResult = calc.trpTmpGfr(
            getValue("urinePhosphate"),
            getValue("plasmaPhosphate"),
            getValue("urineCr"),
            getValue("plasmaCr")
          );
          calculationResult = trpResult.tmpGfr;
          setResultInterpretation(
            `TRP: ${(trpResult.trp * 100).toFixed(1)}% | TmP/GFR: ${trpResult.tmpGfr} mg/dL. ` +
            selectedCalculator.interpretation(trpResult.tmpGfr)
          );
          break;
        }

        case "urine-osmolal-gap":
          calculationResult = calc.urineOsmolalGap(
            Number(calculatorState.measuredUrineOsm) || 0,
            Number(calculatorState.urineNa) || 0,
            Number(calculatorState.urineK) || 0,
            getBunValue("urineUrea"),
            getValue("urineGlucose") || 0
          );
          break;

        case "winters-formula": {
          const wintersResult = calc.wintersFormula(
            Number(calculatorState.bicarbonate) || 0
          );
          calculationResult = wintersResult.expectedPCO2;
          break;
        }

        default:
          calculationResult = undefined;
      }

      if (calculationResult !== undefined) {
        // For corrected-calcium, pass the object directly
        if (selectedCalculator.id === "corrected-calcium" && typeof calculationResult === "object") {
          setResult(calculationResult);
          const numResult = (calculationResult as any).mgDl;
          setResultInterpretation(selectedCalculator.interpretation(numResult, calculatorState as Record<string, unknown>));
        } else {
          const numResult = typeof calculationResult === "number" ? calculationResult : 0;
          setResult(numResult);
          setResultInterpretation(selectedCalculator.interpretation(numResult, calculatorState as Record<string, unknown>));
          // Store eGFR result for auto-population in other calculators (e.g., Mehran 2)
          if (['ckd-epi-creatinine', 'ckd-epi-cystatin-c', 'cockcroft-gault', 'kinetic-egfr'].includes(selectedCalculator.id)) {
            setLastCalculatedEgfr(Math.round(numResult * 100) / 100);
          }
        }
        // Auto-scroll to result on mobile
        setTimeout(() => {
          resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (error) {
      console.error("Calculation error:", error);
      setResult(null);
      setResultInterpretation("Error in calculation. Please check your inputs.");
    }
  }, [selectedCalculator, calculatorState, normalizeValue]);

  const handleSelectCalculator = useCallback((calcId: string) => {
    setSelectedCalculatorId(calcId);
    // Initialize calculator state with default values for score inputs
    const calc = calculators.find(c => c.id === calcId);
    const initialState: CalculatorState = {};
    if (calc) {
      calc.inputs.forEach(input => {
        if (input.type === 'score') {
          initialState[input.id] = input.default ?? 0;
        } else if (input.default !== undefined) {
          initialState[input.id] = input.default;
        } else if (isBinaryYesNoInput(input)) {
          // Initialize all Yes/No toggle inputs to 'No' by default using helper function
          initialState[input.id] = getYesNoValue(input, false);
        }
      });
    }
    const isMehranCalc = (id: string) => id === 'cin-mehran-score' || id === 'cin-mehran-original-score';
    const egfrCalculatorIds = ['ckd-epi-creatinine', 'ckd-epi-cystatin-c', 'cockcroft-gault', 'kinetic-egfr', 'schwartz-pediatric', 'lund-malmo-revised', 'bis1-egfr'];
    
    // When navigating FROM a Mehran calculator TO an eGFR calculator, save the Mehran state
    if (egfrCalculatorIds.includes(calcId) && isMehranCalc(selectedCalculatorId || '')) {
      setSavedMehranState({ ...calculatorState });
      setSavedMehranResult(mehranResult ? { ...mehranResult } : null);
      setSavedMehranUnitState({ ...unitState });
      setNavigatedFromMehran(selectedCalculatorId);
    } else if (isMehranCalc(calcId) && navigatedFromMehran && savedMehranState) {
      // When navigating BACK to a Mehran calculator from eGFR, restore saved state
      const restoredState = { ...savedMehranState };
      // Update eGFR with the newly calculated value if available
      if (lastCalculatedEgfr !== null) {
        restoredState.egfr = lastCalculatedEgfr;
      }
      setCalculatorState(restoredState);
      if (savedMehranUnitState) {
        setUnitState(savedMehranUnitState);
      }
      // Restore the Mehran result if it existed, otherwise clear it
      if (savedMehranResult) {
        setMehranResult(savedMehranResult);
        setResult(savedMehranResult.totalScore);
      } else {
        setMehranResult(null);
        setResult(null);
      }
      setResultInterpretation('');
      setBanffResult(null);
      setKdpiResult(null);
      setMobileMenuOpen(false);
      // Clear saved state
      setSavedMehranState(null);
      setSavedMehranResult(null);
      setSavedMehranUnitState(null);
      setNavigatedFromMehran(null);
      // Track recent calculator usage
      addToRecent(calcId);
      // Auto-scroll
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const mainContent = document.getElementById('calculator-content');
        if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        const selectedButton = document.querySelector(`[data-calculator-id="${calcId}"]`) as HTMLElement;
        if (selectedButton) {
          const sidebarScroll = selectedButton.closest('[data-radix-scroll-area-viewport]') || selectedButton.closest('.overflow-y-auto');
          if (sidebarScroll) {
            const buttonRect = selectedButton.getBoundingClientRect();
            const containerRect = sidebarScroll.getBoundingClientRect();
            const scrollTop = (sidebarScroll as HTMLElement).scrollTop;
            const targetScrollTop = scrollTop + buttonRect.top - containerRect.top - (containerRect.height / 2) + (buttonRect.height / 2);
            sidebarScroll.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
          }
        }
      }, 100);
      return; // Early return - we've handled the restore case
    } else if (!egfrCalculatorIds.includes(calcId)) {
      // Clear the navigation tracking when going to a non-eGFR, non-Mehran calculator
      setNavigatedFromMehran(null);
      setSavedMehranState(null);
      setSavedMehranResult(null);
      setSavedMehranUnitState(null);
    }
    // Auto-populate eGFR in Mehran calculators from last calculated eGFR value (fresh navigation)
    if (isMehranCalc(calcId) && lastCalculatedEgfr !== null) {
      initialState.egfr = lastCalculatedEgfr;
    }
    setCalculatorState(initialState);
    // Note: Do NOT reset unitState here - we want to preserve unit preferences across calculator switches
    setResult(null);
    setResultInterpretation("");
    setBanffResult(null);
    setKdpiResult(null);
    setMobileMenuOpen(false);
    // Track recent calculator usage
    addToRecent(calcId);
    // Auto-scroll to top of calculator content area and scroll sidebar to show selected item
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Also scroll the main content area if it exists
      const mainContent = document.getElementById('calculator-content');
      if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // Scroll sidebar to show the selected calculator button within the sidebar scroll area
      const selectedButton = document.querySelector(`[data-calculator-id="${calcId}"]`) as HTMLElement;
      if (selectedButton) {
        // Find the scrollable sidebar container
        const sidebarScroll = selectedButton.closest('[data-radix-scroll-area-viewport]') || 
                              selectedButton.closest('.overflow-y-auto');
        if (sidebarScroll) {
          const buttonRect = selectedButton.getBoundingClientRect();
          const containerRect = sidebarScroll.getBoundingClientRect();
          const scrollTop = (sidebarScroll as HTMLElement).scrollTop;
          const targetScrollTop = scrollTop + buttonRect.top - containerRect.top - (containerRect.height / 2) + (buttonRect.height / 2);
          sidebarScroll.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
        }
      }
    }, 100);
  }, [addToRecent, lastCalculatedEgfr, selectedCalculatorId, calculatorState, unitState, mehranResult, navigatedFromMehran, savedMehranState, savedMehranResult, savedMehranUnitState]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
    setFocusedIndex(-1);
  }, []);

  // Keyboard navigation disabled to prevent search input focus loss on mobile
  // Users can click directly on calculators instead

  // Reset focused index when filtered calculators change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [selectedCategory]);

  // Check if input supports unit toggle
  const hasUnitToggle = (inputId: string): boolean => {
    // For 24-hour-protein calculator, check multi-unit options
    if (selectedCalculatorId === "24-hour-protein") {
      const multiUnitIds = ["ratioValue", "proteinValue", "creatinineValue"];
      if (multiUnitIds.includes(inputId)) return true;
    }
    // Check if this is a BUN/Urea input that needs 4-option toggle
    if (bunUreaInputIds.includes(inputId)) return true;
    return inputId in unitOptions;
  };

  const allRequiredFilled = selectedCalculator
    ? selectedCalculator.inputs
        .filter((input) => input.required)
        .every((input) => {
          // Skip unit selector inputs
          if (input.id.endsWith("Unit")) return true;
          // Skip bleeding severity for surgery indications in anticoag reversal
          if (selectedCalculator.id === 'anticoagReversal' && input.id === 'bleedingSeverity') {
            const indication = calculatorState['indication'] as string;
            if (indication === 'urgent-surgery' || indication === 'elective') {
              return true; // Skip this required field for surgery indications
            }
          }
          return calculatorState[input.id] !== undefined && calculatorState[input.id] !== "";
        })
    : false;

  // Sidebar content - using useMemo to prevent recreation on every render
  const sidebarContent = useMemo(() => (
      <div className="h-full flex flex-col">
      {/* Search - Using separate memoized component to prevent iOS focus loss */}
      <div className="sticky top-0 z-10 p-4 border-b border-border bg-background">
        <SearchInput
          onSearchChange={setSearchQuery}
          onSelectCalculator={handleSelectCalculator}
          placeholder="Search calculators..."
          inputClassName="border-primary/50 bg-primary/5 shadow-[0_0_0_1px_var(--primary)/0.2] animate-pulse focus:animate-none focus:border-primary focus:bg-secondary"
        />
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-border">
        <Label className="text-xs font-medium text-muted-foreground mb-2 block">Filter by Category</Label>
        <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? null : v)}>
          <SelectTrigger className="bg-secondary border-border text-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calculator List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2">
          {/* Regular Calculator List — Accordion */}
          {(() => {
            let globalIndex = 0;
            return (
              <Accordion type="single" collapsible value={sidebarAccordionValue} onValueChange={setSidebarAccordionValue}>
                {Object.entries(groupedCalculators).map(([category, calcs]) => (
                  <AccordionItem key={category} value={category} className="border-b-0">
                    <AccordionTrigger className={cn("px-2 py-2 text-xs font-semibold uppercase tracking-wider hover:no-underline", categoryColors[category] || "text-muted-foreground")}>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {categoryIcons[category] || <Calculator className="w-4 h-4" />}
                        <span className="truncate">{category.split(" & ")[0]}</span>
                        <span className={cn("ml-auto mr-2 text-[10px] px-1.5 py-0.5 rounded", categoryColors[category] ? "bg-current/10" : "bg-secondary")}>{calcs.length}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-2">
                      <div className="space-y-1">
                        {calcs.map((calc) => {
                          const currentIndex = globalIndex++;
                          const isFocused = focusedIndex === currentIndex;
                          const isFavorite = favorites.includes(calc.id);
                          return (
                            <button
                              key={calc.id}
                              data-calculator-id={calc.id}
                              data-calculator-index={currentIndex}
                              onClick={() => handleSelectCalculator(calc.id)}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors group",
                                "hover:bg-accent hover:text-accent-foreground",
                                selectedCalculatorId === calc.id
                                  ? "bg-primary text-primary-foreground"
                                  : isFocused
                                  ? "bg-accent text-accent-foreground ring-2 ring-primary ring-offset-1"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="break-words hyphens-auto pr-2" style={{ wordBreak: 'break-word' }}>{calc.name}</span>
                                <div className="flex items-center gap-1">
                                  <span
                                    onClick={(e) => toggleFavorite(calc.id, e)}
                                    className={cn(
                                      "p-0.5 rounded transition-colors cursor-pointer",
                                      isFavorite
                                        ? "text-amber-500"
                                        : "text-muted-foreground/50 hover:text-amber-500 sm:opacity-0 sm:group-hover:opacity-100"
                                    )}
                                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                  >
                                    <Star className={cn("w-3 h-3", isFavorite && "fill-current")} />
                                  </span>
                                  <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-50" />
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            );
          })()}
          
          {filteredCalculators.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No calculators found</p>
              <button onClick={clearSearch} className="text-primary text-sm mt-2 hover:underline">
                Clear search
              </button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Calculator Count */}
      <div className="p-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          {filteredCalculators.length} of {calculators.length} calculators
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          ↑↓ Navigate · Enter Select · ⌘K Search
        </p>
      </div>
    </div>
  ), [selectedCategory, categories, favoriteCalculators, recentCalculators, groupedCalculators, filteredCalculators, selectedCalculatorId, focusedIndex, favorites, handleSelectCalculator, toggleFavorite, sidebarAccordionValue]);

  // Inline Unit Toggle Component
  // Multi-option unit definitions for calculators with more than 2 unit options
  const multiUnitOptions: { [inputId: string]: string[] } = {
    ratioValue: ["mg/mg", "mg/g", "mg/mmol", "mg/L"],
    proteinValue: ["mg/dL", "g/L", "mg/L"],
    creatinineValue: ["mg/dL", "mmol/L"],
    // ACR for KFRE calculator - mg/g is most common, mg/mmol is SI, mg/mg is ratio
    acr: ["mg/g", "mg/mmol", "mg/mg"],
  };

  const InlineUnitToggle = ({ inputId }: { inputId: string }) => {
    // Check if this input has multi-unit options
    // For 24-hour-protein calculator or ACR in KFRE
    const hasMultiUnitOptions = 
      (selectedCalculatorId === "24-hour-protein" && multiUnitOptions[inputId]) ||
      (selectedCalculatorId === "kfre" && inputId === "acr");
    
    if (hasMultiUnitOptions && multiUnitOptions[inputId]) {
      const options = multiUnitOptions[inputId];
      // Default follows global unit preference: si → mg/mmol, conventional → mg/g (or first option)
      const defaultUnit = globalUnitPreference === "si"
        ? (options.includes("mg/mmol") ? "mg/mmol" : options[0])
        : (options.includes("mg/g") ? "mg/g" : options.includes("mg/mg") ? "mg/mg" : options[0]);
      const currentUnit = unitState[inputId] || defaultUnit;
      
      return (
        <div className="flex items-center gap-0.5 bg-muted rounded p-0.5">
          {options.map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => setUnitState(prev => ({ ...prev, [inputId]: unit }))}
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded transition-colors",
                currentUnit === unit
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {unit}
            </button>
          ))}
        </div>
      );
    }

    // Check if this is a BUN/Urea input that needs 4-option toggle
    if (bunUreaInputIds.includes(inputId)) {
      const currentBunUreaUnit = unitState[`${inputId}_bunUrea`] || (globalUnitPreference === "si" ? "BUN (mmol/L)" : "BUN (mg/dL)");
      
      return (
        <div className="flex items-center gap-0.5 bg-muted rounded p-0.5 flex-wrap">
          {bunUreaOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setUnitState(prev => ({ ...prev, [`${inputId}_bunUrea`]: option.value }))}
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded transition-colors",
                currentBunUreaUnit === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      );
    }

    // Default 2-option toggle for other calculators
    const options = unitOptions[inputId];
    if (!options) return null;

    const currentUnit = getInputUnit(inputId);

    return (
      <div className="flex items-center gap-0.5 bg-muted rounded p-0.5">
        <button
          type="button"
          onClick={() => handleUnitChange(inputId, "conventional")}
          className={cn(
            "px-2 py-0.5 text-xs font-medium rounded transition-colors",
            currentUnit === "conventional"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {options.conventional}
        </button>
        <button
          type="button"
          onClick={() => handleUnitChange(inputId, "si")}
          className={cn(
            "px-2 py-0.5 text-xs font-medium rounded transition-colors",
            currentUnit === "si"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {options.si}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 max-h-screen overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
                <SheetHeader className="sr-only">
                  <SheetTitle>Calculator Navigation</SheetTitle>
                  <SheetDescription>Browse and select nephrology calculators by category</SheetDescription>
                </SheetHeader>
                {sidebarContent}
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <img
                src={`${import.meta.env.BASE_URL}images/kidney-logo.svg`}
                alt="OTC Calculators Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-foreground">OTC Calculators</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Nephrology Clinical Tools</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Command Palette Search Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 text-muted-foreground text-sm h-9 px-3"
            >
              <Search className="w-4 h-4" />
              <span>Search...</span>
              <kbd className="pointer-events-none ml-1 inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCommandOpen(true)}
              className="sm:hidden"
              title="Search calculators"
            >
              <Search className="w-5 h-5" />
            </Button>
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
              title={`Switch to ${theme === "light" ? "dark" : theme === "dark" ? "midnight" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : theme === "dark" ? (
                <Sparkles className="w-5 h-5 text-purple-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 xl:w-80 border-r border-border h-[calc(100vh-4rem)] sticky top-16">
          {sidebarContent}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {viewingCategoryList ? (
            // Category List View
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center gap-2 text-sm mb-6">
                <button
                  onClick={() => {
                    setViewingCategoryList(null);
                    setSelectedCategory(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                >
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                  Dashboard
                </button>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                <span className="text-foreground font-medium">
                  {viewingCategoryList}
                </span>
              </nav>

              {/* Category Header */}
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                    {categoryIcons[viewingCategoryList] || <Calculator className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{viewingCategoryList}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {calculators.filter(c => c.category === viewingCategoryList).length} calculators available
                    </p>
                    {categoryDescriptions[viewingCategoryList] && (
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {categoryDescriptions[viewingCategoryList]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Calculator List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {calculators
                  .filter(c => c.category === viewingCategoryList)
                  .map((calc) => (
                    <button
                      key={calc.id}
                      onClick={() => {
                        setSelectedCalculatorId(calc.id);
                        setViewingCategoryList(null);
                        setSelectedCategory(viewingCategoryList);
                        addToRecent(calc.id);
                        setResult(null);
                        setCalculatorState({});
                      }}
                      className="p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all text-left group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors">
                            {calc.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {calc.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            onClick={(e) => toggleFavorite(calc.id, e)}
                            className="p-1 rounded hover:bg-background/50 transition-colors cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleFavorite(calc.id, e as unknown as React.MouseEvent);
                              }
                            }}
                          >
                            <Star
                              className={cn(
                                "w-4 h-4 transition-colors",
                                favorites.includes(calc.id)
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-muted-foreground hover:text-yellow-500"
                              )}
                            />
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ) : !selectedCalculator ? (
            // Welcome Screen — Bento Grid Layout
            <div className="max-w-5xl mx-auto">
              {/* Compact Header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 flex-shrink-0">
                  <img
                    src={`${import.meta.env.BASE_URL}images/kidney-logo.svg`}
                    alt="OTC Calculators Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">OTC Calculators</h2>
                  <p className="text-sm text-muted-foreground">{calculators.length} clinical calculators for nephrology practice</p>
                </div>
              </div>

              {/* Mobile Search Bar */}
              <div className="lg:hidden mb-4">
                <SearchInput
                  onSearchChange={setSearchQuery}
                  onSelectCalculator={handleSelectCalculator}
                  placeholder="Search calculators..."
                />
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Favorites Card — spans 2 cols */}
                <Card className="md:col-span-2 lg:col-span-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Star className={cn("w-4 h-4", favoriteCalculators.length > 0 ? "fill-amber-500 text-amber-500" : "text-muted-foreground")} />
                        Your Favorites
                        {favoriteCalculators.length > 0 && (
                          <span className="text-xs text-muted-foreground font-normal">({favoriteCalculators.length}) • Drag to reorder</span>
                        )}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {favoriteCalculators.length === 0 ? (
                      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
                        <Star className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click the star icon on any calculator to add it here.
                        </p>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={favorites}
                          strategy={rectSortingStrategy}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {favoriteCalculators.map((calc) => (
                              <SortableFavoriteCard
                                key={calc.id}
                                calc={calc}
                                categoryIcons={categoryIcons}
                                onSelect={handleSelectCalculator}
                                onToggleFavorite={toggleFavorite}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </CardContent>
                </Card>

                {/* Recently Viewed Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Recently Viewed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentCalculators.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Your recently used calculators will appear here.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {recentCalculators.map((calc) => (
                          <button
                            key={`home-recent-${calc.id}`}
                            onClick={() => handleSelectCalculator(calc.id)}
                            className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between group"
                          >
                            <span className="truncate">{calc.name}</span>
                            <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Tools Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-primary" />
                      Quick Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={() => setShowComparison(!showComparison)}
                      variant={showComparison ? "default" : "outline"}
                      className="w-full justify-start"
                      size="sm"
                    >
                      <ArrowLeftRight className="w-4 h-4 mr-2" />
                      {showComparison ? "Hide eGFR Comparison" : "Compare eGFR Equations"}
                    </Button>
                    <Button
                      onClick={() => setShowPEPathway(!showPEPathway)}
                      variant={showPEPathway ? "default" : "outline"}
                      className="w-full justify-start"
                      size="sm"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      {showPEPathway ? "Hide PE Pathway" : "PE Clinical Pathway"}
                    </Button>
                    <Button
                      onClick={() => setShowConversionCard(!showConversionCard)}
                      variant={showConversionCard ? "default" : "outline"}
                      className="w-full justify-start"
                      size="sm"
                    >
                      <ArrowLeftRight className="w-4 h-4 mr-2" />
                      {showConversionCard ? "Hide Unit Converter" : "Unit Conversion Reference"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Categories Section — spans 2 cols */}
                <Card className="md:col-span-2 lg:col-span-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {showAllCategories ? "All Categories" : "Browse by Category"}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCategoryCustomizer(!showCategoryCustomizer)}
                          className="text-primary hover:text-primary/80 h-8 px-2 text-xs"
                          title="Customize category order"
                        >
                          Customize
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllCategories(!showAllCategories)}
                          className="text-primary hover:text-primary/80 h-8 px-2 text-xs"
                        >
                          {showAllCategories ? "Show Less" : `View All (${categories.length})`}
                          <ChevronRight className={cn("w-3 h-3 ml-1 transition-transform", showAllCategories && "rotate-90")} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Category Customizer */}
                    {showCategoryCustomizer && (
                      <div className="mb-4 p-4 rounded-lg border border-primary/50 bg-primary/5 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Reorder Categories</span>
                          <Button variant="ghost" size="sm" onClick={() => setShowCategoryCustomizer(false)} className="h-6 w-6 p-0">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        {sortedCategories.map((category, index) => (
                          <div key={category} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                {categoryIcons[category] || <Calculator className="w-4 h-4" />}
                              </div>
                              <span className="text-sm font-medium">{category}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { if (index > 0) { const newOrder = [...sortedCategories]; [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]]; setCategoryOrder(newOrder); } }} disabled={index === 0} className="h-7 w-7 p-0">↑</Button>
                              <Button variant="ghost" size="sm" onClick={() => { if (index < sortedCategories.length - 1) { const newOrder = [...sortedCategories]; [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]; setCategoryOrder(newOrder); } }} disabled={index === sortedCategories.length - 1} className="h-7 w-7 p-0">↓</Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => setCategoryOrder([])} className="w-full mt-2">Reset to Default</Button>
                      </div>
                    )}

                    {/* Category Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                      {(showAllCategories ? sortedCategories : sortedCategories.filter(cat => [
                        "Acute Kidney Injury (AKI) Workup",
                        "Dialysis Adequacy",
                        "Electrolytes & Acid-Base",
                        "Kidney Function & CKD Risk",
                        "Proteinuria & Glomerular Disease",
                        "Transplantation"
                      ].includes(cat))).map((category) => {
                        const categoryCalculators = calculators.filter((c) => c.category === category);
                        return (
                          <button
                            key={category}
                            onClick={() => { setViewingCategoryList(category); setSelectedCategory(category); }}
                            className="p-3 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all text-left group cursor-pointer"
                          >
                            <div className="flex items-center gap-3 mb-1.5">
                              <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                {categoryIcons[category] || <Calculator className="w-4 h-4" />}
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="font-medium text-sm">{category.split(" & ")[0]}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{categoryCalculators.length} calculators</p>
                            {showAllCategories && categoryDescriptions[category] && (
                              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{categoryDescriptions[category]}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Full-width panels below the grid */}
              {showComparison && (
                <div className="mt-4" ref={comparisonRef}>
                  <EGFRComparison onClose={() => setShowComparison(false)} />
                </div>
              )}

              {showPEPathway && (
                <div className="mt-4" ref={pePathwayRef}>
                  <PEPathway onClose={() => setShowPEPathway(false)} />
                </div>
              )}

              {showConversionCard && (
                <div className="mt-4" ref={conversionRef}>
                  <ConversionReferenceCard onClose={() => setShowConversionCard(false)} />
                </div>
              )}
            </div>
          ) : (
            // Calculator View
            <div className="max-w-2xl mx-auto space-y-6 max-lg:space-y-3">
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setSelectedCalculatorId(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                >
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                  Dashboard
                </button>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 hidden lg:block" />
                <button
                  onClick={() => {
                    setViewingCategoryList(selectedCalculator.category);
                    setSelectedCategory(selectedCalculator.category);
                    setSelectedCalculatorId(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors hidden lg:block"
                >
                  {selectedCalculator.category}
                </button>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
                  {selectedCalculator.name}
                </span>
              </nav>

              {/* Calculator Header */}
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div>
                  <h2 className="text-2xl max-lg:text-lg font-bold">{selectedCalculator.name}</h2>
                  <p className="text-muted-foreground mt-1 hidden lg:block">{selectedCalculator.description}</p>
                </div>
                <button
                  onClick={(e) => toggleFavorite(selectedCalculator.id, e)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors flex-shrink-0"
                  title={favorites.includes(selectedCalculator.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star
                    className={cn(
                      "w-5 h-5 transition-colors",
                      favorites.includes(selectedCalculator.id)
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground hover:text-amber-500"
                    )}
                  />
                </button>
              </div>

              {/* Input Card */}
              <Card className="border-border">
                <CardHeader className="pb-4 hidden sm:block">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Input Values
                  </CardTitle>
                  <CardDescription>
                    Enter patient data. Toggle units inline for each input field.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-lg:gap-2.5">
                    {selectedCalculator.inputs
                      .filter((input) => !input.id.endsWith("Unit")) // Skip unit selector inputs
                      .filter((input) => {
                        // For 24-hour-protein calculator, show/hide inputs based on inputMode
                        if (selectedCalculator.id === "24-hour-protein") {
                          const inputMode = calculatorState.inputMode || "ratio";
                          if (inputMode === "ratio") {
                            // In ratio mode, hide proteinValue and creatinineValue
                            if (input.id === "proteinValue" || input.id === "creatinineValue") return false;
                          } else {
                            // In raw mode, hide ratioValue
                            if (input.id === "ratioValue") return false;
                          }
                        }
                        // For anticoagReversal calculator, hide bleeding severity for surgery indications
                        if (selectedCalculator.id === "anticoagReversal") {
                          const indication = calculatorState.indication;
                          // Hide bleeding severity when indication is surgery-related (not active bleeding)
                          if (input.id === "bleedingSeverity" && (indication === "urgent-surgery" || indication === "elective")) {
                            return false;
                          }
                        }
                        return true;
                      })
                      .map((input) => (
                      <div key={input.id} className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            {input.label}
                            {input.required && <span className="text-destructive">*</span>}
                          </Label>
                          {hasUnitToggle(input.id) && (
                            <InlineUnitToggle inputId={input.id} />
                          )}
                        </div>
                        
                        {input.type === "number" && (
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder={getDynamicPlaceholder(input)}
                              value={String(calculatorState[input.id] ?? "")}
                              onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value) || "")}
                              min={input.min}
                              max={input.max}
                              step={input.step}
                              className={cn("max-lg:text-base max-lg:min-h-[48px]", hasUnitToggle(input.id) ? "" : hasUnitConversion(input.id) ? "pr-20" : "pr-16")}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              {hasUnitConversion(input.id) && calculatorState[input.id] && (
                                <UnitConversionTooltip
                                  inputId={input.id}
                                  value={calculatorState[input.id] as number}
                                  currentUnit={unitState[input.id] === "si" ? "si" : "conventional"}
                                />
                              )}
                              {!hasUnitToggle(input.id) && input.unit && (
                                <span className="text-xs text-muted-foreground">
                                  {input.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {input.type === "select" && (
                          isBinaryYesNoInput(input) ? (
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg border">
                              <Switch
                                checked={isYesValue(input, String(calculatorState[input.id] ?? ''))}
                                onCheckedChange={(checked) => handleInputChange(input.id, getYesNoValue(input, checked))}
                                className="data-[state=checked]:bg-primary sm:h-6 sm:w-11 sm:[&>span]:size-5"
                              />
                              <span className="text-sm sm:text-base font-medium ml-3 flex-1">
                                {isYesValue(input, String(calculatorState[input.id] ?? ''))
                                  ? getYesNoLabel(input, 'yes')
                                  : getYesNoLabel(input, 'no')
                                }
                              </span>
                            </div>
                          ) : (
                            <Select
                              value={String(calculatorState[input.id] ?? "")}
                              onValueChange={(value) => handleInputChange(input.id, value)}
                            >
                              <SelectTrigger className="max-lg:text-base max-lg:min-h-[48px]">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {input.options?.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )
                        )}

                        {input.type === "checkbox" && (
                          <div className="flex items-center space-x-2 pt-1">
                            <Checkbox
                              checked={Boolean(calculatorState[input.id])}
                              onCheckedChange={(checked) => handleInputChange(input.id, checked)}
                            />
                            <Label htmlFor={input.id} className="text-sm font-normal cursor-pointer">
                              Yes
                            </Label>
                          </div>
                        )}

                        {input.type === "radio" && (
                          <div className="flex gap-4">
                            {input.options?.map((opt) => (
                              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={input.id}
                                  value={opt.value}
                                  checked={calculatorState[input.id] === opt.value}
                                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {input.type === "score" && (
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                            <div className="flex-1">
                              {input.description && (
                                <span className="text-xs text-muted-foreground">{input.description}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-8 h-8 max-lg:w-11 max-lg:h-11 p-0 font-semibold text-lg"
                                onClick={() => {
                                  const currentVal = parseInt(String(calculatorState[input.id] ?? 0));
                                  if (currentVal > (input.min ?? 0)) {
                                    handleInputChange(input.id, currentVal - 1);
                                  }
                                }}
                              >
                                −
                              </Button>
                              <span className="w-10 text-center font-semibold text-lg text-primary">
                                {calculatorState[input.id] ?? 0}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-8 h-8 max-lg:w-11 max-lg:h-11 p-0 font-semibold text-lg"
                                onClick={() => {
                                  const currentVal = parseInt(String(calculatorState[input.id] ?? 0));
                                  if (currentVal < (input.max ?? 3)) {
                                    handleInputChange(input.id, currentVal + 1);
                                  }
                                }}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* eGFR Quick Calculator Link - shown in Mehran input area */}
                  {(selectedCalculator.id === 'cin-mehran-score' || selectedCalculator.id === 'cin-mehran-original-score') && (
                    <div className="mt-2 mb-4 p-3 rounded-lg bg-teal-500/10 border border-teal-500/30">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <Calculator className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-teal-700 dark:text-teal-300">
                            {lastCalculatedEgfr !== null 
                              ? `Last calculated eGFR: ${lastCalculatedEgfr} mL/min/1.73m²` 
                              : "Don't know the eGFR? Calculate it first."}
                          </span>
                        </div>
                        <button
                          onClick={() => handleSelectCalculator('ckd-epi-creatinine')}
                          className="w-full text-sm font-medium px-3 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          {lastCalculatedEgfr !== null ? 'Recalculate eGFR' : 'Calculate eGFR'}
                        </button>
                      </div>
                    </div>
                  )}

                  <Separator className="my-6 max-lg:hidden" />

                  {/* Desktop Calculate Button (inline) */}
                  <Button
                    onClick={handleCalculate}
                    disabled={!allRequiredFilled}
                    className="w-full hidden lg:flex"
                    size="lg"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate
                  </Button>
                </CardContent>
              </Card>

              {/* Mobile Sticky Calculate Button */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-background/80 backdrop-blur-lg border-t border-border" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
                <Button
                  onClick={handleCalculate}
                  disabled={!allRequiredFilled}
                  className="w-full"
                  size="lg"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate
                </Button>
              </div>
              {/* Spacer for sticky button on mobile */}
              <div className="lg:hidden h-20" />

              {/* Result Card */}
              {result !== null && (() => {
                const colorCoding = typeof result === 'number' 
                  ? getResultColorCoding(selectedCalculator.id, result, calculatorState as Record<string, unknown>) 
                  : null;
                
                return (
                <Card ref={resultCardRef} className={cn(
                  "border-l-4 scroll-mt-20",
                  colorCoding ? `${colorCoding.bgClass} ${colorCoding.borderClass}` : "border-primary/50 bg-primary/5"
                )}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">Result</CardTitle>
                      {colorCoding && (
                        <Badge variant="outline" className={cn(
                          "text-xs font-medium",
                          colorCoding.bgClass,
                          colorCoding.textClass,
                          colorCoding.borderClass
                        )}>
                          {colorCoding.label}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const resultText = `${selectedCalculator.name}\nResult: ${typeof result === "number" ? result.toFixed(2) : "N/A"}${selectedCalculator.resultUnit ? " " + selectedCalculator.resultUnit : ""}\nInterpretation: ${resultInterpretation}`;
                        navigator.clipboard.writeText(resultText);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? (
                        <><Check className="w-4 h-4 mr-1" /> Copied!</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-1" /> Copy</>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      {selectedCalculator.id === "corrected-calcium" && typeof result === "object" ? (
                        <>
                          <p className={cn("text-3xl font-bold", colorCoding ? colorCoding.textClass : "text-primary")}>
                            {(result as any).mgDl.toFixed(2)} mg/dL
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {(result as any).mmolL.toFixed(2)} mmol/L
                          </p>
                        </>
                      ) : selectedCalculator.id === "anticoagReversal" ? (
                        <>
                          <p className={cn("text-2xl font-bold text-amber-600 dark:text-amber-400")}>
                            Reversal Protocol Generated
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">See detailed recommendations below</p>
                        </>
                      ) : (
                        <>
                          <p className={cn("text-4xl font-bold", colorCoding ? colorCoding.textClass : "text-primary")}>
                            {typeof result === "number" ? result.toFixed(2) : "N/A"}
                          </p>
                          {selectedCalculator.resultUnit && (
                            <p className="text-sm text-muted-foreground mt-1">{selectedCalculator.resultUnit}</p>
                          )}
                        </>
                      )}
                    </div>

                    {resultInterpretation && (
                      <Alert className={cn(
                        "mt-4",
                        colorCoding && colorCoding.severity === 'danger' && "border-red-500/50 bg-red-500/5",
                        colorCoding && colorCoding.severity === 'warning' && "border-yellow-500/50 bg-yellow-500/5",
                        colorCoding && colorCoding.severity === 'success' && "border-emerald-500/50 bg-emerald-500/5",
                        colorCoding && colorCoding.severity === 'info' && "border-blue-500/50 bg-blue-500/5"
                      )}>
                        <Info className={cn(
                          "h-4 w-4",
                          colorCoding && colorCoding.severity === 'danger' && "text-red-500",
                          colorCoding && colorCoding.severity === 'warning' && "text-yellow-600",
                          colorCoding && colorCoding.severity === 'success' && "text-emerald-500",
                          colorCoding && colorCoding.severity === 'info' && "text-blue-500"
                        )} />
                        <AlertDescription className={cn(
                          "break-words",
                          colorCoding && colorCoding.severity === 'danger' && "text-red-700 dark:text-red-400",
                          colorCoding && colorCoding.severity === 'warning' && "text-yellow-700 dark:text-yellow-400",
                          colorCoding && colorCoding.severity === 'success' && "text-emerald-700 dark:text-emerald-400",
                          colorCoding && colorCoding.severity === 'info' && "text-blue-700 dark:text-blue-400"
                        )}>{resultInterpretation}</AlertDescription>
                      </Alert>
                    )}

                    {/* Back to Mehran Quick-Link - shown on eGFR calculators when navigated from Mehran */}
                    {navigatedFromMehran && ['ckd-epi-creatinine', 'ckd-epi-cystatin-c', 'cockcroft-gault', 'kinetic-egfr', 'schwartz-pediatric', 'lund-malmo-revised', 'bis1-egfr'].includes(selectedCalculator.id) && (
                      <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-start gap-2">
                            <ArrowLeft className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-amber-700 dark:text-amber-300">
                              {result !== null
                                ? `eGFR calculated: ${typeof result === 'number' ? Math.round(result * 100) / 100 : result} mL/min/1.73m²`
                                : `Calculate eGFR, then return to ${navigatedFromMehran === 'cin-mehran-score' ? 'Mehran 2 Score' : 'Original Mehran Score'}`
                              }
                            </span>
                          </div>
                          <button
                            onClick={() => handleSelectCalculator(navigatedFromMehran)}
                            className="w-full text-sm font-medium px-3 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            {navigatedFromMehran === 'cin-mehran-score' ? 'Back to Mehran 2 Score' : 'Back to Original Mehran Score'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Custom KDPI/KDRI Result Display */}
                    {selectedCalculator.id === 'kdpi' && kdpiResult && (
                      <div className="mt-4 space-y-4">
                        {/* KDPI and KDRI Display */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* KDPI Box */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            kdpiResult.kdpi <= 20 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : kdpiResult.kdpi <= 85 
                                ? 'bg-amber-500/10 border-amber-500' 
                                : 'bg-red-500/10 border-red-500'
                          }`}>
                            <p className="text-sm font-medium text-muted-foreground">KDPI</p>
                            <p className={`text-3xl font-bold ${
                              kdpiResult.kdpi <= 20 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : kdpiResult.kdpi <= 85 
                                  ? 'text-amber-600 dark:text-amber-400' 
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              {kdpiResult.kdpi}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Kidney Donor Profile Index
                            </p>
                          </div>
                          {/* KDRI Box */}
                          <div className="p-4 rounded-lg bg-blue-500/10 border-l-4 border-blue-500">
                            <p className="text-sm font-medium text-muted-foreground">KDRI</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                              {kdpiResult.kdri.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Kidney Donor Risk Index
                            </p>
                          </div>
                        </div>

                        {/* Risk Category */}
                        <div className={`p-4 rounded-lg ${
                          kdpiResult.kdpi <= 20 
                            ? 'bg-emerald-500/10 border border-emerald-500/30' 
                            : kdpiResult.kdpi <= 85 
                              ? 'bg-amber-500/10 border border-amber-500/30' 
                              : 'bg-red-500/10 border border-red-500/30'
                        }`}>
                          <div className="flex items-center gap-2">
                            {kdpiResult.kdpi <= 20 ? (
                              <Check className={`w-5 h-5 text-emerald-600 dark:text-emerald-400`} />
                            ) : kdpiResult.kdpi <= 85 ? (
                              <Info className={`w-5 h-5 text-amber-600 dark:text-amber-400`} />
                            ) : (
                              <AlertTriangle className={`w-5 h-5 text-red-600 dark:text-red-400`} />
                            )}
                            <span className={`font-semibold ${
                              kdpiResult.kdpi <= 20 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : kdpiResult.kdpi <= 85 
                                  ? 'text-amber-600 dark:text-amber-400' 
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              {kdpiResult.kdpi <= 20 
                                ? 'Low Risk Donor' 
                                : kdpiResult.kdpi <= 85 
                                  ? 'Standard Criteria Donor' 
                                  : 'High Risk / Expanded Criteria Donor'}
                            </span>
                          </div>
                        </div>

                        {/* Reference Ranges */}
                        <MobileCollapsible title="KDPI Reference Ranges" icon={<Info className="w-4 h-4" />}>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm font-semibold mb-3 hidden sm:block">KDPI Reference Ranges</p>
                            <div className="space-y-2">
                              <div className={`flex items-center justify-between p-2 rounded ${
                                kdpiResult.kdpi <= 20 ? 'bg-emerald-500/20 ring-2 ring-emerald-500' : 'bg-muted'
                              }`}>
                                <span className="text-sm">Low Risk</span>
                                <span className="text-sm font-medium">0-20%</span>
                              </div>
                              <div className={`flex items-center justify-between p-2 rounded ${
                                kdpiResult.kdpi > 20 && kdpiResult.kdpi <= 85 ? 'bg-amber-500/20 ring-2 ring-amber-500' : 'bg-muted'
                              }`}>
                                <span className="text-sm">Standard Criteria</span>
                                <span className="text-sm font-medium">21-85%</span>
                              </div>
                              <div className={`flex items-center justify-between p-2 rounded ${
                                kdpiResult.kdpi > 85 ? 'bg-red-500/20 ring-2 ring-red-500' : 'bg-muted'
                              }`}>
                                <span className="text-sm">High Risk / ECD</span>
                                <span className="text-sm font-medium">&gt;85%</span>
                              </div>
                            </div>
                          </div>

                          {/* Info Note */}
                          <div className="mt-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <div className="flex items-start gap-2">
                              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                  <strong>Note:</strong> KDPI represents the percentage of donors in a reference population with a KDRI less than or equal to this donor's KDRI.
                                  Higher KDPI indicates higher relative risk of graft failure. Based on OPTN 2024 mapping table.
                                </p>
                              </div>
                            </div>
                          </div>
                        </MobileCollapsible>
                      </div>
                    )}

                    {/* Custom Banff Result Display */}
                    {selectedCalculator.id === 'banff-classification' && banffResult && (
                      <div className="mt-4 space-y-4">
                        {/* Adequacy Warning/Success */}
                        {!banffResult.isAdequate ? (
                          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                              <AlertTriangle className="w-5 h-5" />
                              <span className="font-semibold">Specimen adequacy is suboptimal ({banffResult.adequacyStatus}).</span>
                            </div>
                            <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
                              Diagnostic accuracy may be limited. Consider repeat biopsy if clinically indicated.
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                              <Check className="w-5 h-5" />
                              <span className="font-semibold">Specimen Adequacy: {banffResult.adequacyStatus}</span>
                            </div>
                            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                              Glomeruli: {calculatorState.glomeruli || 10}, Arteries: {calculatorState.arteries || 2}
                            </p>
                          </div>
                        )}

                        {/* Diagnosis Boxes */}
                        {banffResult.diagnoses.map((diagnosis, idx) => {
                          const diagnosisColors = {
                            tcmr: 'border-l-orange-500 bg-orange-500/5',
                            abmr: 'border-l-red-500 bg-red-500/5',
                            borderline: 'border-l-slate-400 bg-slate-400/5',
                            normal: 'border-l-emerald-500 bg-emerald-500/5'
                          };
                          const colorClass = diagnosisColors[diagnosis.type as keyof typeof diagnosisColors] || diagnosisColors.normal;
                          
                          return (
                            <div key={idx} className={`p-4 rounded-lg border-l-4 ${colorClass}`}>
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-foreground">{diagnosis.title}</h3>
                                <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
                                  {diagnosis.category}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{diagnosis.description}</p>
                              
                              {/* Diagnostic Criteria */}
                              {diagnosis.criteria.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-sm font-semibold mb-2">Diagnostic Criteria:</p>
                                  <div className="space-y-1">
                                    {diagnosis.criteria.map((c, cIdx) => (
                                      <div key={cIdx} className={`flex items-center gap-2 text-sm ${c.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                        <span className="font-bold">{c.met ? '✓' : '✗'}</span>
                                        <span>{c.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Clinical Interpretation */}
                              {diagnosis.interpretation && (
                                <div className="pt-3 border-t border-border/50">
                                  <p className="text-sm font-semibold mb-1">Clinical Interpretation</p>
                                  <p className="text-sm text-muted-foreground">{diagnosis.interpretation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Banff Score Summary */}
                        <div className="p-4 rounded-lg bg-muted/30 border border-border">
                          <h3 className="text-sm font-semibold mb-3">Banff Score Summary</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="text-xs text-muted-foreground">Acute Scores</p>
                              <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.acute}</p>
                            </div>
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="text-xs text-muted-foreground">Chronic Scores</p>
                              <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.chronic}</p>
                            </div>
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="text-xs text-muted-foreground">Chronic Active</p>
                              <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.chronicActive}</p>
                            </div>
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="text-xs text-muted-foreground">Other</p>
                              <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.other}</p>
                            </div>
                          </div>
                        </div>

                        {/* Info Note */}
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <strong>Note:</strong> This tool is based on Banff 2022 classification criteria. Clinical context, including graft function, time post-transplant, immunosuppression regimen, and prior rejection episodes should be considered. Molecular diagnostics may provide additional diagnostic information when available.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Mehran 2 CA-AKI Risk Score Display */}
                    {selectedCalculator.id === 'cin-mehran-score' && mehranResult && (
                      <div className="mt-4 space-y-4">
                        {/* Score and Risk Category Display */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Total Score Box */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            mehranResult.totalScore <= 4 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : mehranResult.totalScore <= 8 
                                ? 'bg-yellow-500/10 border-yellow-500' 
                                : mehranResult.totalScore <= 11
                                  ? 'bg-orange-500/10 border-orange-500'
                                  : 'bg-red-500/10 border-red-500'
                          }`}>
                            <p className="text-sm font-medium text-muted-foreground">Mehran 2 Score</p>
                            <p className={`text-3xl font-bold ${
                              mehranResult.totalScore <= 4 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : mehranResult.totalScore <= 8 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : mehranResult.totalScore <= 11
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}>
                              {mehranResult.totalScore}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">points (max 21)</p>
                          </div>
                          {/* Risk Category Box */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            mehranResult.totalScore <= 4 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : mehranResult.totalScore <= 8 
                                ? 'bg-yellow-500/10 border-yellow-500' 
                                : mehranResult.totalScore <= 11
                                  ? 'bg-orange-500/10 border-orange-500'
                                  : 'bg-red-500/10 border-red-500'
                          }`}>
                            <p className="text-sm font-medium text-muted-foreground">Risk Category</p>
                            <p className={`text-xl font-bold ${
                              mehranResult.totalScore <= 4 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : mehranResult.totalScore <= 8 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : mehranResult.totalScore <= 11
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}>
                              {mehranResult.riskCategory}
                            </p>
                          </div>
                        </div>

                        {/* CA-AKI Risk Display */}
                        <div className="p-4 rounded-lg bg-blue-500/10 border-l-4 border-blue-500">
                          <p className="text-sm font-medium text-muted-foreground">Estimated CA-AKI Risk</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {mehranResult.cinRisk}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Contrast-Associated Acute Kidney Injury after PCI</p>
                        </div>

                        {/* Risk Factor Breakdown + Risk Stratification */}
                        <MobileCollapsible title="Risk Factor Breakdown" icon={<Activity className="w-4 h-4" />}>
                          <div className="p-4 rounded-lg bg-muted/30 border border-border">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 hidden sm:flex">
                              <Activity className="w-4 h-4" />
                              Risk Factor Breakdown
                            </h3>
                            <div className="space-y-2">
                              {mehranResult.breakdown.map((item, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center justify-between p-2 rounded ${
                                    item.present
                                      ? 'bg-primary/10 border border-primary/30'
                                      : 'bg-muted/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold text-sm ${
                                      item.present
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                    }`}>
                                      {item.present ? '✓' : '○'}
                                    </span>
                                    <span className={`text-sm ${
                                      item.present
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                    }`}>
                                      {item.factor}
                                    </span>
                                  </div>
                                  <span className={`text-sm font-medium ${
                                    item.present && item.points > 0
                                      ? 'text-primary'
                                      : 'text-muted-foreground'
                                  }`}>
                                    +{item.points} pts
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Risk Stratification Reference */}
                          <div className="mt-3 p-4 rounded-lg bg-muted/50">
                            <p className="text-sm font-semibold mb-3">Risk Stratification (Mehran 2 Model 1)</p>
                          <div className="space-y-2">
                            <div className={`flex items-center justify-between p-2 rounded ${
                              mehranResult.totalScore <= 4 ? 'bg-emerald-500/20 ring-2 ring-emerald-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">Low Risk</span>
                              <span className="text-sm font-medium">≤4 pts (CA-AKI ~2.3%)</span>
                            </div>
                            <div className={`flex items-center justify-between p-2 rounded ${
                              mehranResult.totalScore > 4 && mehranResult.totalScore <= 8 ? 'bg-yellow-500/20 ring-2 ring-yellow-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">Moderate Risk</span>
                              <span className="text-sm font-medium">5-8 pts (CA-AKI ~8.3%)</span>
                            </div>
                            <div className={`flex items-center justify-between p-2 rounded ${
                              mehranResult.totalScore > 8 && mehranResult.totalScore <= 11 ? 'bg-orange-500/20 ring-2 ring-orange-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">High Risk</span>
                              <span className="text-sm font-medium">9-11 pts (CA-AKI ~16.5%)</span>
                            </div>
                            <div className={`flex items-center justify-between p-2 rounded ${
                              mehranResult.totalScore > 11 ? 'bg-red-500/20 ring-2 ring-red-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">Very High Risk</span>
                              <span className="text-sm font-medium">&gt;11 pts (CA-AKI ~34.9%)</span>
                            </div>
                            </div>
                          </div>
                        </MobileCollapsible>

                        {/* Clinical Recommendations */}
                        <MobileCollapsible title="Clinical Recommendations" icon={<Info className="w-4 h-4" />}>
                          <div className={`p-4 rounded-lg border ${
                            mehranResult.totalScore <= 4
                              ? 'bg-emerald-500/5 border-emerald-500/30'
                              : mehranResult.totalScore <= 8
                                ? 'bg-yellow-500/5 border-yellow-500/30'
                                : mehranResult.totalScore <= 11
                                  ? 'bg-orange-500/5 border-orange-500/30'
                                  : 'bg-red-500/5 border-red-500/30'
                          }`}>
                            <div className="flex items-start gap-2">
                              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold mb-2 hidden sm:block">Clinical Recommendations</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {mehranResult.totalScore <= 4 && (
                                    <>
                                      <li>• Standard hydration protocol (IV NS 1 mL/kg/hr)</li>
                                      <li>• Minimize contrast volume when possible</li>
                                      <li>• Monitor serum creatinine at 48-72 hours post-procedure</li>
                                      <li>• Withhold nephrotoxic medications peri-procedurally</li>
                                    </>
                                  )}
                                  {mehranResult.totalScore > 4 && mehranResult.totalScore <= 8 && (
                                    <>
                                      <li>• Aggressive IV hydration (1-1.5 mL/kg/hr for 12 hrs pre and post)</li>
                                      <li>• Use iso-osmolar or low-osmolar contrast media</li>
                                    <li>• Minimize contrast volume (&lt;3 × eGFR mL)</li>
                                    <li>• Hold metformin, NSAIDs, and other nephrotoxins</li>
                                    <li>• Monitor creatinine at 24, 48, and 72 hours</li>
                                  </>
                                )}
                                {mehranResult.totalScore > 8 && mehranResult.totalScore <= 11 && (
                                  <>
                                    <li>• Consider alternative imaging if clinically appropriate</li>
                                    <li>• Aggressive IV hydration with isotonic saline or sodium bicarbonate</li>
                                    <li>• Strict contrast volume limitation (&lt;2 × eGFR mL)</li>
                                    <li>• Hold all nephrotoxic medications 48 hrs before</li>
                                    <li>• Consider staging procedures if feasible</li>
                                    <li>• Close monitoring with daily creatinine for 72 hrs</li>
                                  </>
                                )}
                                {mehranResult.totalScore > 11 && (
                                  <>
                                    <li>• Strongly consider alternative imaging modalities (CO₂, IVUS)</li>
                                    <li>• If contrast required: ultra-minimal volume, staged procedures</li>
                                    <li>• Nephrology consultation recommended pre-procedure</li>
                                    <li>• Aggressive periprocedural hydration protocol</li>
                                    <li>• Consider prophylactic hemofiltration in select cases</li>
                                    <li>• ICU-level monitoring may be warranted post-procedure</li>
                                    <li>• Daily renal function monitoring for ≥5 days</li>
                                  </>
                                )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </MobileCollapsible>

                        {/* Advantage over Original Mehran */}
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              <strong>Mehran 2 advantage:</strong> Uses only pre-procedural variables (no contrast volume or IABP needed), applicable to ACS patients, and has superior discriminatory performance (C-statistic 0.72-0.84) compared to the original Mehran score.
                            </p>
                          </div>
                        </div>

                        {/* Reference */}
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <strong>Reference:</strong> Mehran R, et al. A contemporary simple risk score for prediction of contrast-associated acute kidney injury after percutaneous coronary intervention: derivation and validation from an observational registry. Lancet. 2021;398(10315):1974-1983.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Original Mehran Score (2004) Display */}
                    {selectedCalculator.id === 'cin-mehran-original-score' && mehranResult && (
                      <div className="mt-4 space-y-4">
                        {/* Score and Risk Category Display */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Total Score Box */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            mehranResult.totalScore <= 5 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : mehranResult.totalScore <= 10 
                                ? 'bg-yellow-500/10 border-yellow-500' 
                                : mehranResult.totalScore <= 15
                                  ? 'bg-orange-500/10 border-orange-500'
                                  : 'bg-red-500/10 border-red-500'
                          }`}>
                            <p className="text-sm font-medium text-muted-foreground">Mehran Score</p>
                            <p className={`text-3xl font-bold ${
                              mehranResult.totalScore <= 5 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : mehranResult.totalScore <= 10 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : mehranResult.totalScore <= 15
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}>
                              {mehranResult.totalScore}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">points</p>
                          </div>
                          {/* Risk Category Box */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            mehranResult.totalScore <= 5 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : mehranResult.totalScore <= 10 
                                ? 'bg-yellow-500/10 border-yellow-500' 
                                : mehranResult.totalScore <= 15
                                  ? 'bg-orange-500/10 border-orange-500'
                                  : 'bg-red-500/10 border-red-500'
                          }`}>
                            <p className="text-sm font-medium text-muted-foreground">Risk Category</p>
                            <p className={`text-xl font-bold ${
                              mehranResult.totalScore <= 5 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : mehranResult.totalScore <= 10 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : mehranResult.totalScore <= 15
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}>
                              {mehranResult.riskCategory}
                            </p>
                          </div>
                        </div>

                        {/* CIN Risk and Dialysis Risk */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-blue-500/10 border-l-4 border-blue-500">
                            <p className="text-sm font-medium text-muted-foreground">CIN Risk</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {mehranResult.cinRisk}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">SCr rise ≥25% or ≥0.5 mg/dL</p>
                          </div>
                          <div className="p-4 rounded-lg bg-purple-500/10 border-l-4 border-purple-500">
                            <p className="text-sm font-medium text-muted-foreground">Dialysis Risk</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {mehranResult.dialysisRisk}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Risk of requiring dialysis</p>
                          </div>
                        </div>

                        {/* Risk Factor Breakdown + Risk Stratification */}
                        <MobileCollapsible title="Risk Factor Breakdown" icon={<Activity className="w-4 h-4" />}>
                          <div className="p-4 rounded-lg bg-muted/30 border border-border">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 hidden sm:flex">
                              <Activity className="w-4 h-4" />
                              Risk Factor Breakdown
                            </h3>
                            <div className="space-y-2">
                              {mehranResult.breakdown.map((item, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center justify-between p-2 rounded ${
                                    item.present
                                      ? 'bg-primary/10 border border-primary/30'
                                      : 'bg-muted/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold text-sm ${
                                      item.present
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                    }`}>
                                      {item.present ? '✓' : '○'}
                                    </span>
                                    <span className={`text-sm ${
                                      item.present
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                    }`}>
                                      {item.factor}
                                    </span>
                                  </div>
                                  <span className={`text-sm font-medium ${
                                    item.present && item.points > 0
                                      ? 'text-primary'
                                      : 'text-muted-foreground'
                                  }`}>
                                    +{item.points} pts
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Risk Stratification Reference Table */}
                          <div className="mt-3 p-4 rounded-lg bg-muted/50">
                            <p className="text-sm font-semibold mb-3">Risk Stratification (Original Mehran 2004)</p>
                            <div className="space-y-2">
                              <div className={`flex items-center justify-between p-2 rounded ${
                                mehranResult.totalScore <= 5 ? 'bg-emerald-500/20 ring-2 ring-emerald-500' : 'bg-muted'
                              }`}>
                                <span className="text-sm">Low Risk</span>
                                <span className="text-sm font-medium">≤5 pts (CIN 7.5%, Dialysis 0.04%)</span>
                              </div>
                              <div className={`flex items-center justify-between p-2 rounded ${
                                mehranResult.totalScore > 5 && mehranResult.totalScore <= 10 ? 'bg-yellow-500/20 ring-2 ring-yellow-500' : 'bg-muted'
                              }`}>
                                <span className="text-sm">Moderate Risk</span>
                                <span className="text-sm font-medium">6-10 pts (CIN 14%, Dialysis 0.12%)</span>
                              </div>
                              <div className={`flex items-center justify-between p-2 rounded ${
                                mehranResult.totalScore > 10 && mehranResult.totalScore <= 15 ? 'bg-orange-500/20 ring-2 ring-orange-500' : 'bg-muted'
                              }`}>
                                <span className="text-sm">High Risk</span>
                                <span className="text-sm font-medium">11-15 pts (CIN 26.1%, Dialysis 1.09%)</span>
                              </div>
                              <div className={`flex items-center justify-between p-2 rounded ${
                                mehranResult.totalScore > 15 ? 'bg-red-500/20 ring-2 ring-red-500' : 'bg-muted'
                              }`}>
                                <span className="text-sm">Very High Risk</span>
                                <span className="text-sm font-medium">&gt;15 pts (CIN 57.3%, Dialysis 12.6%)</span>
                              </div>
                            </div>
                          </div>
                        </MobileCollapsible>

                        {/* Clinical Recommendations */}
                        <MobileCollapsible title="Prevention Strategies" icon={<Info className="w-4 h-4" />}>
                          <div className={`p-4 rounded-lg border ${
                            mehranResult.totalScore <= 5
                              ? 'bg-emerald-500/5 border-emerald-500/30'
                              : mehranResult.totalScore <= 10
                                ? 'bg-yellow-500/5 border-yellow-500/30'
                                : mehranResult.totalScore <= 15
                                  ? 'bg-orange-500/5 border-orange-500/30'
                                  : 'bg-red-500/5 border-red-500/30'
                          }`}>
                            <div className="flex items-start gap-2">
                              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold mb-2 hidden sm:block">Prevention Strategies</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>• IV hydration: 0.9% NaCl at 1 mL/kg/h for 12h before and after procedure</li>
                                  <li>• Minimize contrast volume (target &lt;3-4 × eGFR in mL)</li>
                                  <li>• Use iso-osmolar or low-osmolar contrast</li>
                                  <li>• Hold nephrotoxins (NSAIDs, aminoglycosides) 24-48h before</li>
                                  <li>• Consider holding metformin 48h post-procedure</li>
                                  <li>• Monitor SCr at 48-72h post-procedure</li>
                                  {mehranResult.totalScore > 10 && (
                                    <>
                                      <li>• Consider alternative imaging if clinically appropriate</li>
                                      <li>• Nephrology consultation recommended</li>
                                      <li>• Consider staging procedures if feasible</li>
                                    </>
                                  )}
                                  {mehranResult.totalScore > 15 && (
                                    <>
                                      <li>• Strongly consider CO₂ angiography or IVUS</li>
                                      <li>• Consider prophylactic hemofiltration in select cases</li>
                                      <li>• ICU-level monitoring may be warranted post-procedure</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </MobileCollapsible>

                        {/* Reference */}
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <strong>Reference:</strong> Mehran R, et al. A simple risk score for prediction of contrast-induced nephropathy after percutaneous coronary intervention: development and initial validation. J Am Coll Cardiol. 2004;44(7):1393-1399.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom FRAX Fracture Risk Display */}
                    {selectedCalculator.id === 'frax-simplified' && fraxResult && (
                      <div className="mt-4 space-y-4">
                        {/* Major Fracture and Hip Fracture Risk Display */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Major Osteoporotic Fracture */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            fraxResult.majorFracture < 10 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : fraxResult.majorFracture < 20 
                                ? 'bg-yellow-500/10 border-yellow-500' 
                                : 'bg-red-500/10 border-red-500'
                          }`}>
                            <p className="text-sm font-medium text-muted-foreground">Major Osteoporotic Fracture</p>
                            <p className={`text-3xl font-bold ${
                              fraxResult.majorFracture < 10 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : fraxResult.majorFracture < 20 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              {fraxResult.majorFracture.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">10-year probability</p>
                          </div>
                          {/* Hip Fracture */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            fraxResult.hipFracture < 3 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : fraxResult.hipFracture < 6 
                                ? 'bg-yellow-500/10 border-yellow-500' 
                                : 'bg-red-500/10 border-red-500'
                          }`}>
                            <p className="text-sm font-medium text-muted-foreground">Hip Fracture</p>
                            <p className={`text-3xl font-bold ${
                              fraxResult.hipFracture < 3 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : fraxResult.hipFracture < 6 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              {fraxResult.hipFracture.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">10-year probability</p>
                          </div>
                        </div>

                        {/* Risk Category */}
                        <div className={`p-4 rounded-lg ${
                          fraxResult.majorFracture < 10 
                            ? 'bg-emerald-500/10 border border-emerald-500/30' 
                            : fraxResult.majorFracture < 20 
                              ? 'bg-yellow-500/10 border border-yellow-500/30' 
                              : 'bg-red-500/10 border border-red-500/30'
                        }`}>
                          <div className="flex items-center gap-2">
                            {fraxResult.majorFracture < 10 ? (
                              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : fraxResult.majorFracture < 20 ? (
                              <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                            <span className={`font-semibold ${
                              fraxResult.majorFracture < 10 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : fraxResult.majorFracture < 20 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              {fraxResult.majorFracture < 10 
                                ? 'Low Fracture Risk' 
                                : fraxResult.majorFracture < 20 
                                  ? 'Moderate Fracture Risk - Consider Treatment' 
                                  : 'High Fracture Risk - Treatment Recommended'}
                            </span>
                          </div>
                        </div>

                        {/* Treatment Thresholds */}
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm font-semibold mb-3">Treatment Thresholds (NOF/ISCD Guidelines)</p>
                          <div className="space-y-2">
                            <div className={`flex items-center justify-between p-2 rounded ${
                              fraxResult.majorFracture < 20 && fraxResult.hipFracture < 3 ? 'bg-emerald-500/20 ring-2 ring-emerald-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">Below Treatment Threshold</span>
                              <span className="text-sm font-medium">MOF &lt;20% AND Hip &lt;3%</span>
                            </div>
                            <div className={`flex items-center justify-between p-2 rounded ${
                              fraxResult.majorFracture >= 20 || fraxResult.hipFracture >= 3 ? 'bg-red-500/20 ring-2 ring-red-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">Above Treatment Threshold</span>
                              <span className="text-sm font-medium">MOF ≥20% OR Hip ≥3%</span>
                            </div>
                          </div>
                        </div>

                        {/* Clinical Recommendations */}
                        <MobileCollapsible title="Clinical Recommendations" icon={<Bone className="w-4 h-4" />}>
                          <div className={`p-4 rounded-lg border ${
                            fraxResult.majorFracture < 10
                              ? 'bg-emerald-500/5 border-emerald-500/30'
                              : fraxResult.majorFracture < 20
                                ? 'bg-yellow-500/5 border-yellow-500/30'
                                : 'bg-red-500/5 border-red-500/30'
                          }`}>
                            <div className="flex items-start gap-2">
                              <Bone className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0 hidden sm:block" />
                              <div>
                                <p className="text-sm font-semibold mb-2 hidden sm:block">Clinical Recommendations</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {fraxResult.majorFracture < 10 && fraxResult.hipFracture < 3 && (
                                    <>
                                      <li>• Lifestyle modifications (weight-bearing exercise, fall prevention)</li>
                                      <li>• Adequate calcium (1000-1200 mg/day) and vitamin D (800-1000 IU/day)</li>
                                      <li>• Reassess fracture risk in 5 years or if risk factors change</li>
                                    </>
                                  )}
                                  {(fraxResult.majorFracture >= 10 || fraxResult.hipFracture >= 3) && fraxResult.majorFracture < 20 && (
                                    <>
                                      <li>• Consider DXA scan if not already performed</li>
                                      <li>• Discuss pharmacologic treatment options</li>
                                      <li>• Address modifiable risk factors</li>
                                      <li>• Fall risk assessment and prevention</li>
                                    </>
                                  )}
                                  {(fraxResult.majorFracture >= 20 || fraxResult.hipFracture >= 3) && (
                                    <>
                                      <li>• Pharmacologic treatment recommended</li>
                                      <li>• First-line: Bisphosphonates (alendronate, risedronate, zoledronic acid)</li>
                                      <li>• Alternatives: Denosumab, teriparatide, romosozumab</li>
                                      <li>• Comprehensive fall prevention program</li>
                                      <li>• Monitor treatment response with DXA</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* CKD-Specific Considerations */}
                          <div className="mt-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">CKD-MBD Considerations</p>
                                <ul className="text-sm text-amber-600/80 dark:text-amber-400/80 space-y-1">
                                  <li>• FRAX may underestimate fracture risk in CKD patients</li>
                                  <li>• Bisphosphonates: Use with caution if eGFR &lt;30-35 mL/min</li>
                                  <li>• Consider PTH, calcium, phosphorus, and vitamin D status</li>
                                  <li>• Adynamic bone disease may increase fracture risk</li>
                                  <li>• Consult nephrology for CKD stages 4-5</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </MobileCollapsible>

                        {/* Info Note */}
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <strong>Note:</strong> This is a simplified FRAX calculation. For official FRAX scores, use the FRAX tool at <a href="https://www.sheffield.ac.uk/FRAX/" target="_blank" rel="noopener noreferrer" className="underline">www.sheffield.ac.uk/FRAX</a>. Treatment decisions should incorporate clinical judgment and patient preferences.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Anticoagulation Reversal Display */}
                    {selectedCalculator.id === 'anticoagReversal' && anticoagReversalResult && (
                      <div className="mt-4 space-y-4">
                        {/* Header - Different for Surgery vs Bleeding */}
                        {anticoagReversalResult.indication === 'surgery' ? (
                          <div className="p-4 rounded-lg bg-blue-500/10 border-2 border-blue-500">
                            <div className="flex items-center gap-3">
                              <Clock className="w-6 h-6 text-blue-500" />
                              <div>
                                <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  Pre-Procedural Management: {anticoagReversalResult.anticoagulant}
                                </h3>
                                <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                                  ⏱ {anticoagReversalResult.timeToEffect}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
                              <div>
                                <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                                  URGENT: Reversal Protocol for {anticoagReversalResult.anticoagulant}
                                </h3>
                                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                                  ⏱ Time to Effect: {anticoagReversalResult.timeToEffect}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Pre-Procedural Guidance (Surgery Only) */}
                        {anticoagReversalResult.indication === 'surgery' && anticoagReversalResult.preProceduralGuidance && (
                          <div className="p-4 rounded-lg bg-emerald-500/10 border-l-4 border-emerald-500">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-sm font-bold">1</span>
                              <h4 className="font-semibold text-emerald-700 dark:text-emerald-400">PRE-PROCEDURAL TIMING</h4>
                            </div>
                            <div className="ml-8 space-y-3">
                              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/30">
                                <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-lg">
                                  ⏰ Hold Time: {anticoagReversalResult.preProceduralGuidance.holdTime}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {anticoagReversalResult.preProceduralGuidance.lastDoseToSurgery}
                                </p>
                              </div>
                              {anticoagReversalResult.preProceduralGuidance.bridgingRequired === false && (
                                <div className="p-2 rounded bg-green-500/10 border border-green-500/30">
                                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                                    ✔ NO BRIDGING ANTICOAGULATION NEEDED
                                  </p>
                                </div>
                              )}
                              {anticoagReversalResult.preProceduralGuidance.bridgingProtocol && (
                                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                  <p className="font-medium text-sm mb-2">Bridging Protocol (if applicable):</p>
                                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                                    {anticoagReversalResult.preProceduralGuidance.bridgingProtocol}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Pre-Op Labs (Surgery Only) */}
                        {anticoagReversalResult.indication === 'surgery' && anticoagReversalResult.preProceduralGuidance?.preOpLabs && (
                          <div className="p-4 rounded-lg bg-cyan-500/10 border-l-4 border-cyan-500">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white text-sm font-bold">2</span>
                              <h4 className="font-semibold text-cyan-700 dark:text-cyan-400">PRE-OPERATIVE LABS</h4>
                            </div>
                            <ul className="space-y-2 ml-8">
                              {anticoagReversalResult.preProceduralGuidance.preOpLabs.map((lab, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">•</span>
                                  <span className="text-sm">{lab}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Resumption Guidance (Surgery Only) */}
                        {anticoagReversalResult.indication === 'surgery' && anticoagReversalResult.preProceduralGuidance?.resumptionGuidance && (
                          <div className="p-4 rounded-lg bg-purple-500/10 border-l-4 border-purple-500">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-sm font-bold">3</span>
                              <h4 className="font-semibold text-purple-700 dark:text-purple-400">POST-OPERATIVE RESUMPTION</h4>
                            </div>
                            <p className="text-sm ml-8">{anticoagReversalResult.preProceduralGuidance.resumptionGuidance}</p>
                          </div>
                        )}

                        {/* Step 1: Immediate Actions (Bleeding Only) */}
                        {anticoagReversalResult.indication !== 'surgery' && (
                          <div className="p-4 rounded-lg bg-amber-500/10 border-l-4 border-amber-500">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-sm font-bold">1</span>
                              <h4 className="font-semibold text-amber-700 dark:text-amber-400">IMMEDIATE ACTIONS</h4>
                            </div>
                            <ul className="space-y-2 ml-8">
                              <li className="flex items-start gap-2">
                                <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                                <span className="text-sm">STOP anticoagulant immediately</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                                <span className="text-sm">Establish IV access (large bore)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                                <span className="text-sm">Type and crossmatch blood products</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                                <span className="text-sm">Identify and address bleeding source</span>
                              </li>
                            </ul>
                          </div>
                        )}

                        {/* Step 2: Reversal Agents */}
                        <div className="p-4 rounded-lg bg-blue-500/10 border-l-4 border-blue-500">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold">2</span>
                            <h4 className="font-semibold text-blue-700 dark:text-blue-400">REVERSAL AGENTS</h4>
                          </div>
                          <div className="space-y-3 ml-8">
                            {anticoagReversalResult.reversalAgents.map((agent, idx) => (
                              <div key={idx} className={`p-3 rounded-lg border ${
                                idx === 0 
                                  ? 'bg-emerald-500/10 border-emerald-500/50' 
                                  : 'bg-muted/50 border-border'
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  {idx === 0 && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded">FIRST LINE</span>
                                  )}
                                  {idx === 1 && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">ADJUNCT</span>
                                  )}
                                  {idx > 1 && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">ALTERNATIVE</span>
                                  )}
                                  <span className={`font-semibold ${
                                    idx === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'
                                  }`}>{agent.primary}</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium text-muted-foreground min-w-[50px]">Dose:</span>
                                    <span className="whitespace-pre-line">{agent.dose}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium text-muted-foreground min-w-[50px]">Note:</span>
                                    <span className="text-muted-foreground italic">{agent.notes}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Step 3: Supportive Measures */}
                        <div className="p-4 rounded-lg bg-purple-500/10 border-l-4 border-purple-500">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-sm font-bold">3</span>
                            <h4 className="font-semibold text-purple-700 dark:text-purple-400">SUPPORTIVE MEASURES</h4>
                          </div>
                          <ul className="space-y-2 ml-8">
                            {anticoagReversalResult.supportiveMeasures.map((measure, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                                <span className="text-sm">{measure}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Step 4: Monitoring */}
                        <div className="p-4 rounded-lg bg-cyan-500/10 border-l-4 border-cyan-500">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white text-sm font-bold">4</span>
                            <h4 className="font-semibold text-cyan-700 dark:text-cyan-400">MONITORING PARAMETERS</h4>
                          </div>
                          <ul className="space-y-2 ml-8">
                            {anticoagReversalResult.monitoringParameters.map((param, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-cyan-600 dark:text-cyan-400 font-bold">•</span>
                                <span className="text-sm">{param}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Special Considerations */}
                        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/50">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <h4 className="font-semibold text-orange-700 dark:text-orange-400">SPECIAL CONSIDERATIONS</h4>
                          </div>
                          <ul className="space-y-2">
                            {anticoagReversalResult.specialConsiderations.map((consideration, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400 font-bold">⚠</span>
                                <span className="text-sm text-orange-700 dark:text-orange-300">{consideration}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Quick Reference Card */}
                        <div className="p-4 rounded-lg bg-muted/50 border border-border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Quick Reference: Anticoagulant Half-Lives
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="font-medium">Warfarin</p>
                              <p className="text-muted-foreground">36-42 hours</p>
                            </div>
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="font-medium">Dabigatran</p>
                              <p className="text-muted-foreground">12-17 hours (normal renal)</p>
                            </div>
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="font-medium">Rivaroxaban</p>
                              <p className="text-muted-foreground">5-9 hours</p>
                            </div>
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="font-medium">Apixaban</p>
                              <p className="text-muted-foreground">8-15 hours</p>
                            </div>
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="font-medium">UFH</p>
                              <p className="text-muted-foreground">60-90 minutes</p>
                            </div>
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="font-medium">LMWH</p>
                              <p className="text-muted-foreground">4-6 hours</p>
                            </div>
                          </div>
                        </div>

                        {/* Info Note */}
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <strong>References:</strong> Tomaselli GF et al. J Am Coll Cardiol. 2020;76(5):594-622. Frontera JA et al. Neurocrit Care. 2016;24(1):6-46. Cuker A et al. Am J Hematol. 2019;94(6):697-709.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Steroid Conversion Display */}
                    {selectedCalculator.id === 'steroid-conversion' && steroidConversionResult && (
                      <div className="mt-4 space-y-4">
                        {/* Header */}
                        <div className="p-4 rounded-lg bg-purple-500/10 border-2 border-purple-500">
                          <div className="flex items-center gap-3">
                            <Pill className="w-6 h-6 text-purple-500" />
                            <div>
                              <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                Steroid Conversion: {steroidConversionResult.fromDose} mg {steroidConversionResult.fromSteroid}
                              </h3>
                              <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
                                Equivalent doses based on anti-inflammatory potency
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Conversion Table */}
                        <div className="p-4 rounded-lg bg-muted/50 border border-border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Equivalent Doses
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-2 px-3 font-semibold">Corticosteroid</th>
                                  <th className="text-right py-2 px-3 font-semibold">Equivalent Dose</th>
                                  <th className="text-center py-2 px-3 font-semibold">GC Potency</th>
                                  <th className="text-center py-2 px-3 font-semibold">MC Potency</th>
                                  <th className="text-center py-2 px-3 font-semibold">Half-Life</th>
                                </tr>
                              </thead>
                              <tbody>
                                {steroidConversionResult.equivalentDoses.map((eq, idx) => (
                                  <tr key={idx} className={`border-b border-border/50 ${eq.steroid === steroidConversionResult.fromSteroid ? 'bg-purple-500/10' : ''}`}>
                                    <td className="py-2 px-3">
                                      <span className={eq.steroid === steroidConversionResult.fromSteroid ? 'font-bold text-purple-600 dark:text-purple-400' : ''}>
                                        {eq.steroid}
                                        {eq.steroid === steroidConversionResult.fromSteroid && ' (input)'}
                                      </span>
                                    </td>
                                    <td className="text-right py-2 px-3 font-mono font-semibold">
                                      {eq.dose} {eq.unit}
                                    </td>
                                    <td className="text-center py-2 px-3">
                                      {eq.relativeGlucocorticoidPotency}x
                                    </td>
                                    <td className="text-center py-2 px-3">
                                      {eq.relativeMineralocorticoidPotency === 0 ? 'None' : `${eq.relativeMineralocorticoidPotency}x`}
                                    </td>
                                    <td className="text-center py-2 px-3 text-muted-foreground">
                                      {eq.biologicalHalfLife}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <p className="text-xs text-muted-foreground">
                            <strong>GC</strong> = Glucocorticoid (anti-inflammatory) potency relative to hydrocortisone. 
                            <strong>MC</strong> = Mineralocorticoid (salt-retaining) potency relative to hydrocortisone.
                          </p>
                        </div>

                        {/* Clinical Notes */}
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-amber-700 dark:text-amber-300">
                              <p className="font-semibold mb-1">Clinical Considerations:</p>
                              <ul className="list-disc list-inside space-y-1 text-amber-600 dark:text-amber-400">
                                <li>These are approximate equivalencies for anti-inflammatory effects</li>
                                <li>Individual patient response may vary</li>
                                <li>Consider duration of action when selecting agent</li>
                                <li>Monitor for adrenal suppression with prolonged use</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Plasma Exchange Display */}
                    {selectedCalculator.id === 'plasma-exchange' && plasmaExchangeResult && (
                      <div className="mt-4 space-y-4">
                        {/* Header */}
                        <div className="p-4 rounded-lg bg-cyan-500/10 border-2 border-cyan-500">
                          <div className="flex items-center gap-3">
                            <Droplets className="w-6 h-6 text-cyan-500" />
                            <div>
                              <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                                Plasma Exchange Protocol
                              </h3>
                              <p className="text-sm text-cyan-600/80 dark:text-cyan-400/80">
                                Calculated plasma volume and exchange parameters
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
                            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                              {plasmaExchangeResult.totalPlasmaVolume}
                            </p>
                            <p className="text-xs text-muted-foreground">Plasma Volume (mL)</p>
                          </div>
                          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
                            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                              {plasmaExchangeResult.plasmaVolumePerKg}
                            </p>
                            <p className="text-xs text-muted-foreground">mL/kg</p>
                          </div>
                          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
                            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                              {plasmaExchangeResult.exchangeVolume}
                            </p>
                            <p className="text-xs text-muted-foreground">Exchange Volume (mL)</p>
                          </div>
                          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
                            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                              ~{plasmaExchangeResult.estimatedDuration}
                            </p>
                            <p className="text-xs text-muted-foreground">Est. Duration (min)</p>
                          </div>
                        </div>

                        {/* IgG Removal */}
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                          <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                            <Activity className="w-4 h-4" />
                            Expected IgG Removal
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="text-center">
                              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                ~{plasmaExchangeResult.expectedIgGRemoval}%
                              </p>
                              <p className="text-xs text-muted-foreground">Per Session</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                {plasmaExchangeResult.sessionsForTarget.target50}
                              </p>
                              <p className="text-xs text-muted-foreground">Sessions for 50%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                {plasmaExchangeResult.sessionsForTarget.target75}
                              </p>
                              <p className="text-xs text-muted-foreground">Sessions for 75%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                {plasmaExchangeResult.sessionsForTarget.target90}
                              </p>
                              <p className="text-xs text-muted-foreground">Sessions for 90%</p>
                            </div>
                          </div>
                        </div>

                        {/* Replacement Fluid Options */}
                        <div className="p-4 rounded-lg bg-muted/50 border border-border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Droplets className="w-4 h-4" />
                            Replacement Fluid Options
                          </h4>
                          <div className="space-y-3">
                            {plasmaExchangeResult.replacementFluid.map((fluid, idx) => (
                              <div key={idx} className="p-3 rounded bg-background border border-border/50">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium">{fluid.type}</span>
                                  <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                                    {fluid.volume} mL
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{fluid.notes}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Access and Anticoagulation */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-400">Vascular Access</h4>
                            <p className="text-sm text-blue-600 dark:text-blue-300">
                              {plasmaExchangeResult.accessRecommendation}
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                            <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-400">Anticoagulation</h4>
                            <p className="text-sm text-purple-600 dark:text-purple-300">
                              {plasmaExchangeResult.anticoagulationRecommendation}
                            </p>
                          </div>
                        </div>

                        {/* Warning */}
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-amber-700 dark:text-amber-300">
                              <p className="font-semibold mb-1">Important Reminders:</p>
                              <ul className="list-disc list-inside space-y-1 text-amber-600 dark:text-amber-400">
                                <li>Monitor calcium levels closely with citrate anticoagulation</li>
                                <li>Administer medications AFTER PLEX when possible</li>
                                <li>Check coagulation parameters if using FFP</li>
                                <li>Consult apheresis medicine for complex cases</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reference Ranges */}
                    {selectedCalculator.referenceRanges && selectedCalculator.referenceRanges.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          Reference Ranges
                        </p>
                        <div className="space-y-1">
                          {selectedCalculator.referenceRanges.map((range, idx) => {
                            const isInRange = typeof result === 'number' && (
                              (range.min !== undefined && range.max !== undefined && result >= range.min && result <= range.max) ||
                              (range.min !== undefined && range.max === undefined && result >= range.min) ||
                              (range.min === undefined && range.max !== undefined && result <= range.max)
                            );
                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between text-xs p-2 rounded ${
                                  isInRange ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'
                                }`}
                              >
                                <span className={`font-medium ${isInRange ? 'text-primary' : 'text-muted-foreground'}`}>
                                  {range.label}
                                  {isInRange && ' ✓'}
                                </span>
                                <span className="text-muted-foreground">
                                  {range.min !== undefined && range.max !== undefined
                                    ? `${range.min} - ${range.max} ${range.unit}`
                                    : range.min !== undefined
                                    ? `≥${range.min} ${range.unit}`
                                    : `≤${range.max} ${range.unit}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {selectedCalculator.referenceRanges.some(r => r.note) && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {selectedCalculator.referenceRanges.find(r => r.note)?.note}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
              })()}

              {/* Standalone Banff Result Display - shown when result is null but banffResult exists */}
              {selectedCalculator.id === 'banff-classification' && banffResult && result === null && (
                <Card className="border-l-4 border-emerald-500 bg-emerald-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      Banff Classification Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Adequacy Warning/Success */}
                      {!banffResult.isAdequate ? (
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-semibold">Specimen adequacy is suboptimal ({banffResult.adequacyStatus}).</span>
                          </div>
                          <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
                            Diagnostic accuracy may be limited. Consider repeat biopsy if clinically indicated.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-5 h-5" />
                            <span className="font-semibold">Specimen Adequacy: {banffResult.adequacyStatus}</span>
                          </div>
                          <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                            Glomeruli: {calculatorState.glomeruli || 10}, Arteries: {calculatorState.arteries || 2}
                          </p>
                        </div>
                      )}

                      {/* Diagnosis Boxes */}
                      {banffResult.diagnoses.map((diagnosis, idx) => {
                        const diagnosisColors = {
                          tcmr: 'border-l-orange-500 bg-orange-500/5',
                          abmr: 'border-l-red-500 bg-red-500/5',
                          borderline: 'border-l-slate-400 bg-slate-400/5',
                          normal: 'border-l-emerald-500 bg-emerald-500/5'
                        };
                        const colorClass = diagnosisColors[diagnosis.type as keyof typeof diagnosisColors] || diagnosisColors.normal;
                        
                        return (
                          <div key={idx} className={`p-4 rounded-lg border-l-4 ${colorClass}`}>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-bold text-foreground">{diagnosis.title}</h3>
                              <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
                                {diagnosis.category}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{diagnosis.description}</p>
                            
                            {/* Diagnostic Criteria */}
                            {diagnosis.criteria.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-semibold mb-2">Diagnostic Criteria:</p>
                                <div className="space-y-1">
                                  {diagnosis.criteria.map((c, cIdx) => (
                                    <div key={cIdx} className={`flex items-center gap-2 text-sm ${c.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                      <span className="font-bold">{c.met ? '✓' : '✗'}</span>
                                      <span>{c.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Clinical Interpretation */}
                            {diagnosis.interpretation && (
                              <div className="pt-3 border-t border-border/50">
                                <p className="text-sm font-semibold mb-1">Clinical Interpretation</p>
                                <p className="text-sm text-muted-foreground">{diagnosis.interpretation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Banff Score Summary */}
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h3 className="text-sm font-semibold mb-3">Banff Score Summary</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-background border border-border/50">
                            <p className="text-xs text-muted-foreground">Acute Scores</p>
                            <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.acute}</p>
                          </div>
                          <div className="p-2 rounded bg-background border border-border/50">
                            <p className="text-xs text-muted-foreground">Chronic Scores</p>
                            <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.chronic}</p>
                          </div>
                          <div className="p-2 rounded bg-background border border-border/50">
                            <p className="text-xs text-muted-foreground">Chronic Active</p>
                            <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.chronicActive}</p>
                          </div>
                          <div className="p-2 rounded bg-background border border-border/50">
                            <p className="text-xs text-muted-foreground">Other</p>
                            <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.other}</p>
                          </div>
                        </div>
                      </div>

                      {/* Info Note */}
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            <strong>Note:</strong> This tool is based on Banff 2022 classification criteria. Clinical context, including graft function, time post-transplant, immunosuppression regimen, and prior rejection episodes should be considered.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Clinical Decision Support Recommendations */}
              {result !== null && (() => {
                const recKey = getRecommendationKey(selectedCalculator.id, typeof result === 'number' ? result : 0);
                const rec = recKey ? getRecommendations(selectedCalculator.id, recKey) : null;

                if (!rec) return null;

                const urgencyColorMap = {
                  routine: "border-blue-500/50 bg-blue-500/5",
                  urgent: "border-orange-500/50 bg-orange-500/5",
                  emergent: "border-red-500/50 bg-red-500/5"
                };

                const getUrgencyIcon = (urgency: string) => {
                  switch(urgency) {
                    case 'urgent':
                      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
                    case 'emergent':
                      return <AlertTriangle className="w-4 h-4 text-red-500" />;
                    default:
                      return <Info className="w-4 h-4 text-blue-500" />;
                  }
                };

                return (
                  <MobileCollapsible title="Clinical Decision Support" icon={getUrgencyIcon(rec.urgency || 'routine')}>
                    <Card className={`border ${urgencyColorMap[rec.urgency || 'routine']}`}>
                      <CardHeader className="pb-2 hidden sm:block">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getUrgencyIcon(rec.urgency || 'routine')}
                          Clinical Decision Support
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4 sm:pt-0">
                        <div>
                          <p className="font-semibold text-sm mb-1">{rec.condition}</p>
                          <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                        </div>

                        {rec.actionItems.length > 0 && (
                          <div>
                            <p className="font-semibold text-sm mb-2">Recommended Actions:</p>
                            <ul className="space-y-1">
                              {rec.actionItems.map((item, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                                  <span className="text-primary flex-shrink-0">→</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </MobileCollapsible>
                );
              })()}

              {/* Clinical Pearls */}
              {selectedCalculator.clinicalPearls.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      Clinical Pearls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedCalculator.clinicalPearls.map((pearl, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-primary flex-shrink-0">•</span>
                          <span>{pearl}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* References */}
              {selectedCalculator.references.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">References</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {selectedCalculator.references.map((ref, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground">
                          {idx + 1}. {ref}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Command Palette (Cmd+K) */}
      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title="Search Calculators"
        description="Find a calculator by name, category, or keyword"
      >
        <CommandInput placeholder="Search calculators..." />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No calculators found.</CommandEmpty>
          {favoriteCalculators.length > 0 && (
            <CommandGroup heading="Favorites">
              {favoriteCalculators.map((calc) => (
                <CommandItem
                  key={`cmd-fav-${calc.id}`}
                  value={`${calc.name} ${calc.description} ${calc.category} ${calc.searchTerms?.join(" ") || ""}`}
                  onSelect={() => {
                    handleSelectCalculator(calc.id);
                    setCommandOpen(false);
                  }}
                >
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{calc.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {categories.map((cat) => {
            const catCalcs = calculators.filter(c => c.category === cat);
            return (
              <CommandGroup key={cat} heading={cat}>
                {catCalcs.map((calc) => (
                  <CommandItem
                    key={`cmd-${calc.id}`}
                    value={`${calc.name} ${calc.description} ${calc.category} ${calc.searchTerms?.join(" ") || ""}`}
                    onSelect={() => {
                      handleSelectCalculator(calc.id);
                      setCommandOpen(false);
                    }}
                  >
                    {categoryIcons[calc.category] || <Calculator className="w-4 h-4" />}
                    <span>{calc.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
