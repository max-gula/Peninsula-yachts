import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { ActivePage } from '../types';
import { PROMOTION_CONFIG } from '../services/storage';

interface NavbarProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onOpenAdmin?: () => void;
  entriesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenAdmin,
  entriesCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080D15]/90 backdrop-blur-md border-b border-[#FAF8F5]/10 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-8">
        {/* Zone 1: Brand wordmark & crest -> takes to brand homepage */}
        <div className="shrink-0">
          <BrandLogo
            variant="nav"
            onClick={() => handleNav('home')}
          />
        </div>

        {/* Zone 2: Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-light tracking-[0.14em] uppercase text-[#FAF8F5]/80">
          <button
            onClick={() => handleNav('home')}
            className={`whitespace-nowrap transition-colors py-2 relative hover:text-[#C5A869] cursor-pointer ${
              currentPage === 'home' ? 'text-[#FAF8F5] font-normal' : ''
            }`}
          >
            Overview
            {currentPage === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C5A869]" />
            )}
          </button>

          <button
            onClick={() => handleNav('draw')}
            className={`whitespace-nowrap transition-colors py-2 relative hover:text-[#C5A869] cursor-pointer ${
              currentPage === 'draw' ? 'text-[#FAF8F5] font-normal' : ''
            }`}
          >
            Enter the Draw
            {currentPage === 'draw' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C5A869]" />
            )}
          </button>

          <button
            onClick={() => handleNav('charters')}
            className={`whitespace-nowrap transition-colors py-2 relative hover:text-[#C5A869] cursor-pointer ${
              currentPage === 'charters' ? 'text-[#FAF8F5] font-normal' : ''
            }`}
          >
            Charters
            {currentPage === 'charters' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C5A869]" />
            )}
          </button>

          <button
            onClick={() => handleNav('terms')}
            className={`whitespace-nowrap transition-colors py-2 relative hover:text-[#C5A869] cursor-pointer ${
              currentPage === 'terms' ? 'text-[#FAF8F5] font-normal' : ''
            }`}
          >
            Guidelines & Terms
            {currentPage === 'terms' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C5A869]" />
            )}
          </button>

          <a
            href={PROMOTION_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Peninsula Yachts on Instagram"
            className="flex items-center gap-1.5 text-[#C5A869] hover:text-[#D4AF37] transition-colors py-2 whitespace-nowrap"
          >
            <svg
              className="w-4 h-4 fill-none stroke-current stroke-2 shrink-0"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span className="text-xs normal-case tracking-wider font-sans opacity-90">@peninsula_yachts</span>
          </a>
        </nav>

        {/* Zone 3: Primary Action / Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">


          {currentPage !== 'charters' ? (
            <button
              onClick={() => handleNav('charters')}
              className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-[11px] sm:text-xs font-sans tracking-[0.14em] uppercase text-[#080D15] bg-[#C5A869] hover:bg-[#D4AF37] transition-all duration-300 font-medium whitespace-nowrap shadow-sm hover:shadow-md cursor-pointer rounded-full"
            >
              Bespoke Quote
            </button>
          ) : (
            <button
              onClick={() => handleNav('draw')}
              className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-[11px] sm:text-xs font-sans tracking-[0.14em] uppercase text-[#080D15] bg-[#C5A869] hover:bg-[#D4AF37] transition-all duration-300 font-medium whitespace-nowrap shadow-sm hover:shadow-md cursor-pointer rounded-full"
            >
              Enter the Draw
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] p-2 flex items-center justify-center text-[#FAF8F5]/90 hover:text-[#C5A869] focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-6 h-6 stroke-current stroke-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#080D15]/98 backdrop-blur-xl border-b border-[#FAF8F5]/10 px-6 py-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-4 font-serif text-2xl tracking-wide">
            <button
              onClick={() => handleNav('draw')}
              className={`text-left py-2 transition-colors cursor-pointer flex items-center justify-between ${
                currentPage === 'draw' ? 'text-[#C5A869]' : 'text-[#FAF8F5] hover:text-[#C5A869]'
              }`}
            >
              <span>Enter the Draw</span>
              <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#C5A869] font-light">Draw</span>
            </button>
            <button
              onClick={() => handleNav('charters')}
              className={`text-left py-2 transition-colors cursor-pointer flex items-center justify-between ${
                currentPage === 'charters' ? 'text-[#C5A869]' : 'text-[#FAF8F5] hover:text-[#C5A869]'
              }`}
            >
              <span>Bespoke Charters</span>
              <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#C5A869] font-light">Fleet</span>
            </button>
            <button
              onClick={() => handleNav('terms')}
              className={`text-left py-2 transition-colors cursor-pointer flex items-center justify-between ${
                currentPage === 'terms' ? 'text-[#C5A869]' : 'text-[#FAF8F5] hover:text-[#C5A869]'
              }`}
            >
              <span>Guidelines & Terms</span>
              <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#FAF8F5]/40 font-light">Info</span>
            </button>
            
            <a
              href={PROMOTION_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 py-3 text-[#C5A869] hover:text-[#D4AF37] transition-colors border-t border-[#FAF8F5]/10 pt-4"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2 shrink-0" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span className="font-sans normal-case tracking-normal text-xs font-medium">@peninsula_yachts</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
