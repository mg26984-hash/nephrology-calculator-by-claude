import { useState, useCallback, memo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Calculator, ChevronRight } from "lucide-react";
import { calculators } from "@/lib/calculatorData";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  onSearchChange: (query: string) => void;
  onSelectCalculator?: (calculatorId: string) => void;
  placeholder?: string;
  showAutocomplete?: boolean;
}

// Memoized search input component with autocomplete
const SearchInput = memo(function SearchInput({ 
  onSearchChange, 
  onSelectCalculator,
  placeholder = "Search calculators...",
  showAutocomplete = true
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter calculators based on search query
  const suggestions = localValue.length >= 1
    ? calculators.filter(calc => 
        calc.name.toLowerCase().includes(localValue.toLowerCase()) ||
        calc.description.toLowerCase().includes(localValue.toLowerCase()) ||
        calc.category.toLowerCase().includes(localValue.toLowerCase())
      ).slice(0, 8) // Limit to 8 suggestions
    : [];

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    onSearchChange(value);
    setIsOpen(value.length >= 1 && showAutocomplete);
    setSelectedIndex(-1);
  }, [onSearchChange, showAutocomplete]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    onSearchChange("");
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [onSearchChange]);

  const handleSelectSuggestion = useCallback((calculatorId: string) => {
    if (onSelectCalculator) {
      onSelectCalculator(calculatorId);
    }
    setLocalValue("");
    onSearchChange("");
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [onSelectCalculator, onSearchChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex].id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, suggestions, selectedIndex, handleSelectSuggestion]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => localValue.length >= 1 && showAutocomplete && setIsOpen(true)}
        className="pl-9 pr-8 bg-secondary border-border"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="search-suggestions"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && showAutocomplete && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto"
        >
          {suggestions.map((calc, index) => (
            <button
              key={calc.id}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelectSuggestion(calc.id)}
              className={cn(
                "w-full text-left px-3 py-3 flex items-start gap-3 transition-colors border-b border-border/50 last:border-b-0",
                index === selectedIndex 
                  ? "bg-accent text-accent-foreground" 
                  : "hover:bg-muted/50"
              )}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mt-0.5">
                <Calculator className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{calc.name}</div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {calc.description}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {calc.category.split(' & ')[0]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {calc.inputs.length} inputs
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
            </button>
          ))}
          
          {/* Footer hint */}
          <div className="px-3 py-2 bg-muted/30 text-[10px] text-muted-foreground flex items-center justify-between">
            <span>↑↓ to navigate • Enter to select • Esc to close</span>
            <span>{suggestions.length} result{suggestions.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && localValue.length >= 1 && suggestions.length === 0 && showAutocomplete && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-4 text-center"
        >
          <div className="text-muted-foreground text-sm">No calculators found</div>
          <div className="text-xs text-muted-foreground mt-1">Try a different search term</div>
        </div>
      )}
    </div>
  );
});

export default SearchInput;
