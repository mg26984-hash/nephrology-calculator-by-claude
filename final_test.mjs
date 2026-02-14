// Final comprehensive test of all calculator formulas
import * as calc from './client/src/lib/calculators.ts';

const tests = [
  // Kidney Function
  { name: 'CKD-EPI 2021 (Male)', fn: () => calc.ckdEpiCreatinine(1.2, 55, 'M'), expected: 71, tolerance: 1 },
  { name: 'CKD-EPI 2021 (Female)', fn: () => calc.ckdEpiCreatinine(1.0, 45, 'F'), expected: 71, tolerance: 2 },
  { name: 'Cockcroft-Gault (Male)', fn: () => calc.cockcrofGault(1.2, 55, 70, 'M'), expected: 69, tolerance: 2 },
  { name: 'Cockcroft-Gault (Female)', fn: () => calc.cockcrofGault(1.0, 45, 60, 'F'), expected: 67, tolerance: 2 },
  { name: 'Schwartz Pediatric', fn: () => calc.schwartzPediatric(0.8, 120), expected: 61.5, tolerance: 2 },
  { name: 'KFRE 5-year', fn: () => calc.kfre(60, 'M', 30, 300, 'mg/mmol', 5), expected: 52.9, tolerance: 0.5 },
  { name: 'KFRE 2-year', fn: () => calc.kfre(60, 'M', 30, 300, 'mg/mmol', 2), expected: 21.4, tolerance: 0.5 },
  
  // AKI Workup - FENa = (UNa × PCr) / (PNa × UCr) × 100
  { name: 'FENa', fn: () => calc.fena(40, 0.8, 140, 1.5), expected: 1.52, tolerance: 0.5 },
  { name: 'FEUrea', fn: () => calc.feurea(300, 1.5, 20, 0.8), expected: 20, tolerance: 5 },
  { name: 'Urine Anion Gap', fn: () => calc.urineAnionGap(50, 40, 80), expected: 10, tolerance: 2 },
  
  // Electrolytes
  { name: 'Corrected Sodium', fn: () => calc.correctedSodiumHyperglycemia(130, 400), expected: 134.5, tolerance: 1 },
  { name: 'Anion Gap', fn: () => calc.anionGap(140, 100, 24), expected: 16, tolerance: 1 },
  { name: 'Corrected Calcium', fn: () => calc.correctedCalcium(8.0, 3.0), expected: 8.8, tolerance: 0.2 },
  { name: 'Osmolar Gap', fn: () => calc.osmolalGap(310, 140, 28, 180), expected: 12, tolerance: 5 },
  { name: 'TTKG', fn: () => calc.ttkg(40, 4.5, 300, 290), expected: 8.6, tolerance: 0.5 },
  
  // Proteinuria
  { name: 'UPCR', fn: () => calc.upcr(500, 50), expected: 10, tolerance: 0.5 },
  { name: 'UACR', fn: () => calc.uacr(300, 50), expected: 6, tolerance: 0.5 },
  
  // Dialysis
  { name: 'Kt/V', fn: () => calc.ktv(60, 10, 70, 240, 2), expected: 1.3, tolerance: 0.5 },
  { name: 'URR', fn: () => calc.urrHemodialysis(60, 20), expected: 66.7, tolerance: 1 },
  
  // Anthropometric
  { name: 'BMI', fn: () => calc.bmi(70, 175), expected: 22.9, tolerance: 0.5 },
  { name: 'BSA DuBois', fn: () => calc.bsaDuBois(70, 175), expected: 1.85, tolerance: 0.1 },
  { name: 'BSA Mosteller', fn: () => calc.bsaMosteller(70, 175), expected: 1.85, tolerance: 0.1 },
  { name: 'IBW Devine Male', fn: () => calc.devineIdealBodyWeight(175, 'M'), expected: 70.5, tolerance: 2 },
  { name: 'IBW Devine Female', fn: () => calc.devineIdealBodyWeight(165, 'F'), expected: 56.8, tolerance: 2 },
  { name: 'AdjBW', fn: () => calc.adjustedBodyWeight(100, 70), expected: 82, tolerance: 2 },
  { name: 'TBW Watson Male', fn: () => calc.totalBodyWaterWatson(70, 175, 40, 'M'), expected: 42, tolerance: 3 },
  
  // Cardiovascular
  { name: 'ASCVD Risk', fn: () => calc.ascvdRisk(55, 200, 50, 130, false, false, 'M', 'white'), expected: 8, tolerance: 5 },
  
  // CKD-MBD
  { name: 'Corrected Calcium (Low Albumin)', fn: () => calc.correctedCalcium(7.5, 2.5), expected: 8.5, tolerance: 0.2 },
  { name: 'Ca-Pho Product', fn: () => calc.caPhoProduct(9.0, 5.0), expected: 45, tolerance: 1 },
  
  // Clinical Scores
  { name: 'CURB-65', fn: () => calc.curb65(true, 25, false, false, 70), expected: 2, tolerance: 1 },
  { name: 'FRAIL', fn: () => calc.frailScale(true, true, false, false, false), expected: 2, tolerance: 0 },
  { name: 'PRISMA-7', fn: () => calc.prisma7(true, true, true, false, false, false, false), expected: 3, tolerance: 0 },
  
  // Transplant
  { name: 'KDPI', fn: () => calc.kdpi(50, 170, 80, 'M', 'white', false, false, false, false, 1.0, 'CVA'), expected: 50, tolerance: 20 },
  { name: 'EPTS', fn: () => calc.epts(50, 5, false, false), expected: 30, tolerance: 20 },
];

console.log('=== Final Calculator Verification ===\n');

let passed = 0;
let failed = 0;

for (const test of tests) {
  try {
    const result = test.fn();
    const diff = Math.abs(result - test.expected);
    const status = diff <= test.tolerance ? '✓ PASS' : '✗ FAIL';
    
    if (diff <= test.tolerance) {
      passed++;
      console.log(`${status}: ${test.name} = ${result} (expected: ${test.expected})`);
    } else {
      failed++;
      console.log(`${status}: ${test.name} = ${result} (expected: ${test.expected}, diff: ${diff.toFixed(2)})`);
    }
  } catch (e) {
    failed++;
    console.log(`✗ ERROR: ${test.name} - ${e.message}`);
  }
}

console.log(`\n=== Summary: ${passed}/${tests.length} tests passed ===`);
if (failed > 0) {
  console.log(`${failed} tests failed`);
}
