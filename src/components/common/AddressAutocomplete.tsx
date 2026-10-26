import React, { useState, useEffect, useRef } from 'react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

interface AddressSuggestion {
  formatted: string;
  suburb: string;
  postcode: string;
  state: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Start typing address or suburb...',
  required = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSelectedRef = useRef(false);
  const selectedTextRef = useRef('');

  useEffect(() => {
    // If this update was triggered by selecting a suggestion, ignore and keep closed
    if (isSelectedRef.current || (selectedTextRef.current && value.trim().toLowerCase() === selectedTextRef.current.trim().toLowerCase())) {
      isSelectedRef.current = false;
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (!value || value.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const query = encodeURIComponent(value.trim());
        // Live Australian geocoding with Victoria bias (Melbourne lat/lon)
        const url = `https://photon.komoot.io/api/?q=${query}&limit=6&lat=-37.8136&lon=144.9631`;
        const res = await fetch(url);
        
        if (res.ok) {
          const data = await res.json();
          const items: AddressSuggestion[] = [];

          if (data && data.features && Array.isArray(data.features)) {
            for (const feat of data.features) {
              const p = feat.properties || {};
              const house = p.housenumber ? `${p.housenumber} ` : '';
              const street = p.street || p.name || '';
              const suburb = p.district || p.suburb || p.city || p.locality || '';
              const state = p.state || 'VIC';
              const postcode = p.postcode || '';

              let line = '';
              if (street) {
                line = `${house}${street}`.trim();
              }
              if (suburb) {
                line = line ? `${line}, ${suburb}` : suburb;
              }
              if (state) {
                line = `${line} ${state}`.trim();
              }
              if (postcode) {
                line = `${line} ${postcode}`.trim();
              }

              // Filter out duplicates and foreign addresses if country is not AU
              if (line && (p.countrycode === 'AU' || p.country === 'Australia' || !p.countrycode)) {
                if (!items.some((i) => i.formatted.toLowerCase() === line.toLowerCase())) {
                  items.push({
                    formatted: line,
                    suburb: suburb || line,
                    postcode: postcode,
                    state: state || 'VIC',
                  });
                }
              }
            }
          }

          // Fallback if external API returned 0 results but user typed a valid query
          if (items.length === 0 && value.trim().length >= 4) {
            items.push({
              formatted: `${value.trim()}, VIC Australia`,
              suburb: value.trim(),
              postcode: '',
              state: 'VIC',
            });
          }

          // If the user's current value matches the top suggestion exactly, do not pop open
          if (items.length === 1 && items[0].formatted.toLowerCase() === value.trim().toLowerCase()) {
            setSuggestions([]);
            setIsOpen(false);
          } else {
            setSuggestions(items);
            setIsOpen(items.length > 0);
          }
        }
      } catch (err) {
        console.warn('Address autocomplete fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: AddressSuggestion) => {
    isSelectedRef.current = true;
    selectedTextRef.current = item.formatted;
    setSuggestions([]);
    setIsOpen(false);
    onChange(item.formatted);
    if (onSelect) onSelect(item.formatted);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => {
            isSelectedRef.current = false;
            selectedTextRef.current = '';
            onChange(e.target.value);
          }}
          onFocus={() => {
            if (
              suggestions.length > 0 &&
              (!selectedTextRef.current || value.trim().toLowerCase() !== selectedTextRef.current.trim().toLowerCase())
            ) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          autoComplete="street-address"
          className={`w-full bg-[#080D15] border border-[#FAF8F5]/20 focus:border-[#C5A869] text-[#FAF8F5] pl-4 sm:pl-5 pr-14 py-3 text-sm focus:outline-none transition-colors placeholder-[#FAF8F5]/30 rounded-full ${className}`}
        />
        
        {/* Right side controls: Clear button & Pin Icon / Spinner */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={() => {
                isSelectedRef.current = false;
                selectedTextRef.current = '';
                setSuggestions([]);
                setIsOpen(false);
                onChange('');
              }}
              className="p-1 text-[#FAF8F5]/40 hover:text-[#C5A869] transition-colors cursor-pointer"
              title="Clear address"
              aria-label="Clear address"
            >
              <svg className="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div className="text-[#C5A869]/70 flex items-center pointer-events-none">
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin text-[#C5A869]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10z" />
                <circle cx="12" cy="11" r="2" strokeWidth={1.5} />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Autocomplete Dropdown Popup */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#0E1624] border border-[#C5A869]/50 shadow-2xl max-h-60 overflow-y-auto divide-y divide-[#FAF8F5]/10 animate-in fade-in duration-150 rounded-2xl overflow-hidden">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              className="px-3.5 py-3 hover:bg-[#141F32] active:bg-[#141F32] cursor-pointer text-xs text-[#FAF8F5] flex items-center justify-between gap-3 transition-colors min-h-[44px]"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A869] shrink-0" />
                <span className="truncate tracking-wide font-light">{item.formatted}</span>
              </div>
              <span className="text-[10px] text-[#C5A869] uppercase font-sans tracking-widest shrink-0 font-medium">
                Select
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
