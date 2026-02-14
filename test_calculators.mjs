// Comprehensive test script for all nephrology calculators
// Tests each formula with known reference values

const tests = [
  // 1. CKD-EPI 2021 Creatinine - verified against kidney.org
  {
    name: "CKD-EPI 2021 Creatinine (Male, 55y, Cr 1.2)",
    formula: () => {
      const creatinine = 1.2;
      const age = 55;
      const isFemale = false;
      const A = isFemale ? 0.7 : 0.9;
      const B = isFemale ? -0.241 : -0.302;
      const min = Math.min(creatinine / A, 1);
      const max = Math.max(creatinine / A, 1);
      let eGFR = 142 * Math.pow(min, B) * Math.pow(max, -1.200) * Math.pow(0.9938, age);
      if (isFemale) eGFR *= 1.012;
      return eGFR;
    },
    expected: 71,
    tolerance: 1
  },
  
  // 2. Cockcroft-Gault
  {
    name: "Cockcroft-Gault (Male, 55y, 70kg, Cr 1.2)",
    formula: () => {
      const age = 55;
      const weight = 70;
      const creatinine = 1.2;
      const isFemale = false;
      let CrCl = ((140 - age) * weight) / (72 * creatinine);
      if (isFemale) CrCl *= 0.85;
      return CrCl;
    },
    expected: 69,
    tolerance: 1
  },
  
  // 3. FENa
  {
    name: "FENa (UNa 20, PCr 2.0, PNa 140, UCr 80)",
    formula: () => {
      const urineNa = 20;
      const plasmaCr = 2.0;
      const plasmaNa = 140;
      const urineCr = 80;
      return (urineNa * plasmaCr) / (plasmaNa * urineCr) * 100;
    },
    expected: 0.357,
    tolerance: 0.01
  },
  
  // 4. Anion Gap
  {
    name: "Anion Gap (Na 140, Cl 100, HCO3 24)",
    formula: () => {
      const sodium = 140;
      const chloride = 100;
      const bicarbonate = 24;
      return sodium - chloride - bicarbonate;
    },
    expected: 16,
    tolerance: 0
  },
  
  // 5. Corrected Calcium
  {
    name: "Corrected Calcium (Ca 8.5, Alb 3.0)",
    formula: () => {
      const calcium = 8.5;
      const albumin = 3.0;
      return calcium + 0.8 * (4.0 - albumin);
    },
    expected: 9.3,
    tolerance: 0.1
  },
  
  // 6. BMI
  {
    name: "BMI (70kg, 170cm)",
    formula: () => {
      const weight = 70;
      const height = 170;
      return weight / Math.pow(height / 100, 2);
    },
    expected: 24.22,
    tolerance: 0.1
  },
  
  // 7. BSA Du Bois
  {
    name: "BSA Du Bois (70kg, 170cm)",
    formula: () => {
      const weight = 70;
      const height = 170;
      return 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);
    },
    expected: 1.81,
    tolerance: 0.05
  },
  
  // 8. Kt/V Daugirdas
  {
    name: "Kt/V Daugirdas (Pre 80, Post 25, UF 3, Weight 70, Time 240min)",
    formula: () => {
      const preUrea = 80;
      const postUrea = 25;
      const uf = 3;
      const weight = 70;
      const time = 240; // minutes
      const R = postUrea / preUrea;
      const t = time / 60; // Convert to hours
      const logArg = R - 0.008 * t;
      if (logArg <= 0) return 0;
      return -Math.log(logArg) + (4 - 3.5 * R) * (uf / weight);
    },
    expected: 1.44,
    tolerance: 0.15
  },
  
  // 9. URR
  {
    name: "URR (Pre 80, Post 25)",
    formula: () => {
      const preUrea = 80;
      const postUrea = 25;
      return ((preUrea - postUrea) / preUrea) * 100;
    },
    expected: 68.75,
    tolerance: 0.1
  },
  
  // 10. Total Body Water Watson (Male)
  {
    name: "TBW Watson (Male, 55y, 70kg, 170cm)",
    formula: () => {
      const age = 55;
      const weight = 70;
      const height = 170;
      const isFemale = false;
      if (isFemale) {
        return -2.097 + 0.1069 * height + 0.2466 * weight;
      } else {
        return 2.447 - 0.09156 * age + 0.1074 * height + 0.3362 * weight;
      }
    },
    expected: 38.98,
    tolerance: 0.5
  },
  
  // 11. Corrected Sodium in Hyperglycemia
  {
    name: "Corrected Sodium (Na 130, Glucose 400)",
    formula: () => {
      const sodium = 130;
      const glucose = 400;
      return sodium + 1.6 * ((glucose - 100) / 100);
    },
    expected: 134.8,
    tolerance: 0.1
  },
  
  // 12. Water Deficit
  {
    name: "Water Deficit (Na 155, TBW 40)",
    formula: () => {
      const sodium = 155;
      const tbw = 40;
      return tbw * ((sodium / 140) - 1);
    },
    expected: 4.29,
    tolerance: 0.1
  },
  
  // 13. Schwartz Pediatric eGFR
  {
    name: "Schwartz Pediatric (Cr 0.5, Height 100cm)",
    formula: () => {
      const creatinine = 0.5;
      const height = 100;
      return (0.413 * height) / creatinine;
    },
    expected: 82.6,
    tolerance: 0.5
  },
  
  // 14. UPCR
  {
    name: "UPCR (Protein 500, Creatinine 50)",
    formula: () => {
      const protein = 500;
      const creatinine = 50;
      return protein / creatinine;
    },
    expected: 10,
    tolerance: 0
  },
  
  // 15. uACR
  {
    name: "uACR (Albumin 300, Creatinine 100)",
    formula: () => {
      const albumin = 300;
      const creatinine = 100;
      return albumin / creatinine;
    },
    expected: 3,
    tolerance: 0
  }
];

console.log("=== Nephrology Calculator Test Suite ===\n");

let passed = 0;
let failed = 0;

for (const test of tests) {
  const result = test.formula();
  const diff = Math.abs(result - test.expected);
  const status = diff <= test.tolerance ? "✓ PASS" : "✗ FAIL";
  
  if (diff <= test.tolerance) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${status}: ${test.name}`);
  console.log(`   Expected: ${test.expected}, Got: ${result.toFixed(2)}, Diff: ${diff.toFixed(4)}`);
  console.log("");
}

console.log("=== Summary ===");
console.log(`Passed: ${passed}/${tests.length}`);
console.log(`Failed: ${failed}/${tests.length}`);
