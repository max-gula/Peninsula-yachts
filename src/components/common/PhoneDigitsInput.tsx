import React, { useRef, useEffect } from 'react';

interface PhoneDigitsInputProps {
  value: string; // The 8 digits after '04'
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export const PhoneDigitsInput: React.FC<PhoneDigitsInputProps> = ({
  value,
  onChange,
  autoFocus = true,
}) => {
  // Strip any '04' or '+614' prefix from value to store the remaining 8 digits
  const cleanPrefix = (str: string) => {
    let raw = str.replace(/\D/g, '');
    if (raw.startsWith('614')) raw = raw.slice(3);
    else if (raw.startsWith('04')) raw = raw.slice(2);
    return raw.slice(0, 8);
  };

  const rawDigits = cleanPrefix(value);
  // Exactly 8 empty squares: Set of 2, Set of 3, Set of 3
  const digits = Array.from({ length: 8 }, (_, i) => rawDigits[i] || '');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) {
      const firstEmptyIndex = digits.findIndex((d) => d === '');
      const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
      const el = inputRefs.current[targetIndex] || inputRefs.current[0];
      if (el) {
        setTimeout(() => el.focus(), 80);
      }
    }
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      // User cleared digit
      const next = [...digits];
      next[index] = '';
      onChange(next.join(''));
      return;
    }

    if (clean.length > 1) {
      handlePasteString(clean, index);
      return;
    }

    const next = [...digits];
    next[index] = clean[clean.length - 1];
    const newStr = next.join('');
    onChange(newStr);

    // Auto advance to next input
    if (index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePasteString = (str: string, startIndex: number) => {
    const clean = cleanPrefix(str);
    const next = [...digits];
    
    const start = clean.length >= 6 ? 0 : startIndex;
    for (let i = 0; i < clean.length && start + i < 8; i++) {
      next[start + i] = clean[i];
    }
    onChange(next.join(''));

    const lastFilled = Math.min(start + clean.length, 7);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        onChange(next.join(''));
        inputRefs.current[index - 1]?.focus();
        e.preventDefault();
      } else if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        onChange(next.join(''));
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    handlePasteString(pasted, 0);
  };

  return (
    <div className="w-full flex items-center justify-center select-none" onPaste={handlePaste}>
      {/* 04 as non-squares at the front + Set of 2 + Set of 3 + Set of 3 */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 max-w-full overflow-x-hidden py-1">
        
        {/* 04 as clean non-squares text at the front */}
        <div className="flex items-center justify-center px-1.5 sm:px-2 py-2 text-[#C5A869] font-mono text-base sm:text-lg font-semibold tracking-wider select-none shrink-0 border-b border-[#C5A869]/40">
          04
        </div>

        {/* Set 1: Set of TWO empty squares (indices 0, 1) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {[0, 1].map((idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              maxLength={1}
              value={digits[idx] || ''}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-7.5 h-11 sm:w-9 sm:h-12.5 bg-[#080D15] border border-[#FAF8F5]/25 focus:border-[#C5A869] text-[#FAF8F5] text-center text-base sm:text-lg font-mono font-medium focus:outline-none transition-colors rounded-none shadow-inner"
            />
          ))}
        </div>

        {/* Subtle separator */}
        <span className="text-[#C5A869]/30 text-xs px-0.5">·</span>

        {/* Set 2: Set of THREE empty squares (indices 2, 3, 4) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {[2, 3, 4].map((idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              maxLength={1}
              value={digits[idx] || ''}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-7.5 h-11 sm:w-9 sm:h-12.5 bg-[#080D15] border border-[#FAF8F5]/25 focus:border-[#C5A869] text-[#FAF8F5] text-center text-base sm:text-lg font-mono font-medium focus:outline-none transition-colors rounded-none shadow-inner"
            />
          ))}
        </div>

        {/* Subtle separator */}
        <span className="text-[#C5A869]/30 text-xs px-0.5">·</span>

        {/* Set 3: Set of THREE empty squares (indices 5, 6, 7) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {[5, 6, 7].map((idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              maxLength={1}
              value={digits[idx] || ''}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-7.5 h-11 sm:w-9 sm:h-12.5 bg-[#080D15] border border-[#FAF8F5]/25 focus:border-[#C5A869] text-[#FAF8F5] text-center text-base sm:text-lg font-mono font-medium focus:outline-none transition-colors rounded-none shadow-inner"
            />
          ))}
        </div>

      </div>
    </div>
  );
};
