import React from 'react';

interface BrandLogoProps {
  variant?: 'nav' | 'large' | 'footer' | 'icon-only';
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'nav',
  className = '',
  onClick,
}) => {
  const logoImgSrc = '/assets/aistudio/IMG_7745_a4b097a8.jpeg';

  if (variant === 'icon-only') {
    return (
      <div 
        onClick={onClick}
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden border border-[#C5A869]/30 shadow-md ${className}`}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-white/95 flex items-center justify-center">
          <img
            src={logoImgSrc}
            alt="Peninsula Yachts Crest"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-[1.35] object-center"
          />
        </div>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div 
        onClick={onClick}
        className={`flex flex-col items-center text-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        {/* Instagram Profile Crest: compact & perfectly scaled for mobile */}
        <div className="relative w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full overflow-hidden p-0.5 border border-[#C5A869]/40 bg-[#080D15] shadow-xl mb-2.5 sm:mb-3.5 group transition-transform duration-300 hover:scale-105">
          <div className="w-full h-full rounded-full overflow-hidden bg-white/95 flex items-center justify-center">
            <img
              src={logoImgSrc}
              alt="Peninsula Yachts"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-[1.35] object-center transition-transform duration-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="h-[1px] w-4 sm:w-6 md:w-8 bg-gradient-to-r from-transparent to-[#C5A869]/60" />
          <h1 className="font-serif text-lg sm:text-2xl md:text-3xl tracking-[0.2em] sm:tracking-[0.25em] text-[#FAF8F5] uppercase font-light">
            PENINSULA
          </h1>
          <span className="h-[1px] w-4 sm:w-6 md:w-8 bg-gradient-to-l from-transparent to-[#C5A869]/60" />
        </div>
        <div className="text-[9px] sm:text-[10px] md:text-xs tracking-[0.4em] text-[#C5A869] uppercase font-sans mt-0.5 sm:mt-1">
          YACHTS
        </div>
      </div>
    );
  }

  // Navigation & Footer variant
  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none ${className}`}
    >
      <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full overflow-hidden p-0.5 border border-[#C5A869]/40 bg-[#080D15] shrink-0 transition-all duration-300 group-hover:border-[#C5A869]">
        <div className="w-full h-full rounded-full overflow-hidden bg-white/95 flex items-center justify-center">
          <img
            src={logoImgSrc}
            alt="Peninsula Yachts"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-[1.35] object-center transition-transform duration-300"
          />
        </div>
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="font-serif text-sm sm:text-base md:text-lg tracking-[0.16em] sm:tracking-[0.2em] text-[#FAF8F5] uppercase font-normal leading-tight">
            PENINSULA
          </span>
          <span className="text-[8px] sm:text-[9px] md:text-[10px] font-sans tracking-[0.25em] text-[#C5A869] uppercase font-medium">
            YACHTS
          </span>
        </div>
        <span className="text-[8px] sm:text-[9px] tracking-[0.16em] text-[#FAF8F5]/40 uppercase hidden sm:block">
          Port Phillip Bay · Sorrento
        </span>
      </div>
    </div>
  );
};
