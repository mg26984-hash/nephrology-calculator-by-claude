import type { Calculator } from "./calculatorData";

/**
 * Bounded Damerau-Levenshtein distance with early termination.
 * Handles insertions, deletions, substitutions, AND transpositions.
 * Returns Infinity if distance exceeds maxDistance.
 */
export function damerauLevenshtein(a: string, b: string, maxDistance: number): number {
  const lenA = a.length;
  const lenB = b.length;

  // Quick length-based pruning
  if (Math.abs(lenA - lenB) > maxDistance) return Infinity;
  if (lenA === 0) return lenB <= maxDistance ? lenB : Infinity;
  if (lenB === 0) return lenA <= maxDistance ? lenA : Infinity;

  // Create matrix with size (lenA+1) x (lenB+1)
  const d: number[][] = [];
  for (let i = 0; i <= lenA; i++) {
    d[i] = new Array(lenB + 1);
    d[i][0] = i;
  }
  for (let j = 0; j <= lenB; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
      if (d[i][j] < rowMin) rowMin = d[i][j];
    }
    // Early termination: if every cell in this row exceeds max, no path can be short enough
    if (rowMin > maxDistance) return Infinity;
  }

  return d[lenA][lenB] <= maxDistance ? d[lenA][lenB] : Infinity;
}

/**
 * Normalize a string for search comparison.
 * Lowercase, strip subscripts/superscripts/punctuation, collapse whitespace.
 */
export function normalizeForSearch(str: string): string {
  return str.toLowerCase().replace(/[₂²\-_\/()]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Score a calculator against a search query.
 * Returns 0 for no match, higher = better match.
 *
 * Tiers:
 *   100 — exact searchTerm match
 *    80 — searchTerm starts with query
 *    60 — searchTerm contains query
 *    50 — name contains query
 *    45 — ID contains query
 *    40 — all query tokens found across searchable text
 *    20 — description contains query
 *    10 — category contains query
 *     8 — fuzzy 1-edit on searchTerm (fallback)
 *     5 — fuzzy 1-edit on name word or ID
 *     3 — fuzzy 2-edit on searchTerm (query ≥ 5 chars)
 */
export function scoreCalculator(calc: Calculator, query: string): number {
  if (!query) return 0;

  const rawQuery = query.toLowerCase().trim();
  const normalizedQuery = normalizeForSearch(query);
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);

  const name = calc.name.toLowerCase();
  const normalizedName = normalizeForSearch(calc.name);
  const desc = calc.description.toLowerCase();
  const cat = calc.category.toLowerCase();
  const id = calc.id.toLowerCase().replace(/[-_]/g, "");
  const terms = (calc.searchTerms || []).map(t => t.toLowerCase());

  let score = 0;

  // Exact match on searchTerms (highest priority)
  if (terms.some(t => t === normalizedQuery || t === rawQuery)) score += 100;

  // searchTerm starts with query
  if (terms.some(t => t.startsWith(normalizedQuery) || t.startsWith(rawQuery))) score += 80;

  // searchTerm contains query
  if (terms.some(t => t.includes(normalizedQuery) || t.includes(rawQuery))) score += 60;

  // Name contains query
  if (name.includes(rawQuery) || normalizedName.includes(normalizedQuery)) score += 50;

  // ID matches
  if (id.includes(normalizedQuery.replace(/\s/g, ""))) score += 45;

  // All query tokens match somewhere
  const allSearchable = [normalizedName, desc, cat, ...terms, id].join(" ");
  if (queryTokens.length > 0 && queryTokens.every(token => allSearchable.includes(token))) score += 40;

  // Description contains query
  if (desc.includes(rawQuery) || desc.includes(normalizedQuery)) score += 20;

  // Category contains query
  if (cat.includes(rawQuery)) score += 10;

  // Fuzzy fallback — only when no substring match found
  if (score === 0 && normalizedQuery.length >= 3) {
    const maxEdit1 = 1;
    const maxEdit2 = normalizedQuery.length >= 4 ? 2 : Infinity;

    // Tier 8: fuzzy 1-edit on searchTerms
    for (const term of terms) {
      const normalizedTerm = normalizeForSearch(term);
      if (damerauLevenshtein(normalizedQuery, normalizedTerm, maxEdit1) <= maxEdit1) {
        score = 8;
        break;
      }
    }

    // Tier 5: fuzzy 1-edit on individual name words or ID
    if (score === 0) {
      const nameWords = normalizedName.split(" ").filter(Boolean);
      const targets = [...nameWords, id];
      for (const target of targets) {
        if (damerauLevenshtein(normalizedQuery, target, maxEdit1) <= maxEdit1) {
          score = 5;
          break;
        }
      }
    }

    // Tier 3: fuzzy 2-edit on searchTerms (only for longer queries)
    if (score === 0 && maxEdit2 !== Infinity) {
      for (const term of terms) {
        const normalizedTerm = normalizeForSearch(term);
        if (damerauLevenshtein(normalizedQuery, normalizedTerm, maxEdit2) <= maxEdit2) {
          score = 3;
          break;
        }
      }
    }
  }

  return score;
}

/**
 * cmdk-compatible filter function with fuzzy matching.
 * Returns 0 (no match) or 1 (match), with ranking handled by value ordering.
 */
export function cmdkFuzzyFilter(value: string, search: string, keywords?: string[]): number {
  if (!search) return 1;

  const rawSearch = search.toLowerCase().trim();
  const normalizedSearch = normalizeForSearch(search);
  const searchTokens = normalizedSearch.split(" ").filter(Boolean);

  // Build searchable text from value + keywords
  const valueLower = value.toLowerCase();
  const normalizedValue = normalizeForSearch(value);
  const allKeywords = (keywords || []).map(k => k.toLowerCase());
  const allSearchable = [normalizedValue, ...allKeywords].join(" ");

  // Substring checks (same tiers as scoreCalculator)
  if (allSearchable.includes(rawSearch) || allSearchable.includes(normalizedSearch)) return 1;
  if (searchTokens.length > 0 && searchTokens.every(token => allSearchable.includes(token))) return 1;

  // Fuzzy fallback
  if (normalizedSearch.length >= 3) {
    const maxEdit = normalizedSearch.length >= 4 ? 2 : 1;
    const words = allSearchable.split(" ").filter(Boolean);
    for (const word of words) {
      if (damerauLevenshtein(normalizedSearch, word, maxEdit) <= maxEdit) return 1;
    }
  }

  return 0;
}
