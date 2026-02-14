/**
 * Helper functions for input type detection
 */

import { CalculatorInput } from './calculatorData';

/**
 * Check if a label starts with "Yes" or "No" (case-insensitive)
 * Handles labels like "Yes (+3.0)", "No", "Yes", etc.
 */
function labelStartsWithYes(label: string): boolean {
  return label.toLowerCase().startsWith('yes');
}

function labelStartsWithNo(label: string): boolean {
  return label.toLowerCase().startsWith('no');
}

/**
 * Check if a select input is a binary Yes/No toggle
 * Returns true if the input has exactly 2 options where one starts with "Yes" and one starts with "No"
 * Handles various formats:
 * - Simple: "Yes" / "No"
 * - With points: "Yes (+3.0)" / "No"
 * - With values: { value: "yes", label: "Yes" } or { value: "0", label: "No" }
 */
export function isBinaryYesNoInput(input: CalculatorInput): boolean {
  if (input.type !== 'select' || !input.options) return false;
  if (input.options.length !== 2) return false;
  
  const values = input.options.map(o => o.value.toLowerCase());
  const labels = input.options.map(o => o.label);
  
  // Check for yes/no values (exact match)
  if (values.includes('yes') && values.includes('no')) return true;
  
  // Check for 0/1 values with Yes/No labels
  if ((values.includes('0') && values.includes('1'))) {
    const hasYesLabel = labels.some(l => labelStartsWithYes(l));
    const hasNoLabel = labels.some(l => labelStartsWithNo(l));
    if (hasYesLabel && hasNoLabel) return true;
  }
  
  // Check for labels that start with Yes/No (handles "Yes (+3.0)" format)
  const hasYesLabel = labels.some(l => labelStartsWithYes(l));
  const hasNoLabel = labels.some(l => labelStartsWithNo(l));
  if (hasYesLabel && hasNoLabel) return true;
  
  return false;
}

/**
 * Get the label for a Yes/No option
 */
export function getYesNoLabel(input: CalculatorInput, value: 'yes' | 'no'): string {
  if (!input.options) return value === 'yes' ? 'Yes' : 'No';
  
  // Find option by label starting with Yes/No
  const yesOption = input.options.find(o => labelStartsWithYes(o.label));
  const noOption = input.options.find(o => labelStartsWithNo(o.label));
  
  if (value === 'yes') {
    return yesOption?.label || 'Yes';
  } else {
    return noOption?.label || 'No';
  }
}

/**
 * Get the actual value for Yes/No toggle based on input options
 * Some inputs use "yes"/"no", others use "0"/"1"
 * Handles labels like "Yes (+3.0)" by finding the option that starts with Yes/No
 */
export function getYesNoValue(input: CalculatorInput, isYes: boolean): string {
  if (!input.options) return isYes ? 'yes' : 'no';
  
  // Find option by label starting with Yes/No
  const yesOption = input.options.find(o => labelStartsWithYes(o.label));
  const noOption = input.options.find(o => labelStartsWithNo(o.label));
  
  if (isYes) {
    return yesOption?.value || 'yes';
  } else {
    return noOption?.value || 'no';
  }
}

/**
 * Check if the current value represents "Yes" for this input
 */
export function isYesValue(input: CalculatorInput, value: string | undefined): boolean {
  if (!value) return false;
  if (!input.options) return value.toLowerCase() === 'yes';
  
  // Find the Yes option by label starting with Yes
  const yesOption = input.options.find(o => labelStartsWithYes(o.label));
  return yesOption?.value === value || value.toLowerCase() === 'yes';
}
