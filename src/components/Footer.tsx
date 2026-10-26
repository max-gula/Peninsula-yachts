import React from 'react';
import { ActivePage } from '../types';
import { PROMOTION_CONFIG } from '../services/storage';

interface FooterProps {
  onNavigate: (page: ActivePage) => void;
  onOpenTermsModal?: () => void;
  onOpenPrivacyModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenTermsModal,
  onOpenPrivacyModal,
}) => {
  return (
    <footer className="w-full bg-[#05080E] border-t border-[#FAF8F5]/10 text-[#FAF8F5]/60 text-xs py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4 sm:space-y-6 text-center">
        {/* Subtle decorative divider */}
        <div className="flex items-center gap-3 sm:gap-4 w-full max-w-xs">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C5A869]/30" />
          <span className="w-1.5 h-1.5 rotate-45 border border-[#C5A869]/60" />
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C5A869]/30" />
        </div>

        {/* Global Footer Requirements: Peninsula Yachts · Mornington Peninsula, VIC · Email · Terms · Privacy · Instagram */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-[11px] sm:text-xs tracking-[0.14em] sm:tracking-[0.16em] uppercase font-light">
          <span className="text-[#FAF8F5] font-serif text-xs sm:text-sm tracking-[0.18em] font-normal">
            Peninsula Yachts
          </span>
          <span aria-hidden="true" className="text-[#C5A869]/50">·</span>
          <span>Mornington Peninsula, VIC</span>
          <span aria-hidden="true" className="text-[#C5A869]/50">·</span>
          <a
            href="mailto:peninsulaluxuryyachts@gmail.com"
            className="hover:text-[#C5A869] transition-colors lowercase tracking-normal text-[11px] sm:text-xs text-[#FAF8F5]/80 whitespace-nowrap"
          >
            peninsulaluxuryyachts@gmail.com
          </a>
          <span aria-hidden="true" className="text-[#C5A869]/50">·</span>
          <button
            onClick={() => onOpenTermsModal ? onOpenTermsModal() : onNavigate('terms')}
            className="hover:text-[#C5A869] transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            Terms
          </button>
          <span aria-hidden="true" className="text-[#C5A869]/50">·</span>
          <button
            onClick={() => onOpenPrivacyModal ? onOpenPrivacyModal() : onNavigate('terms')}
            className="hover:text-[#C5A869] transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            Privacy
          </button>
          <span aria-hidden="true" className="text-[#C5A869]/50">·</span>
          <a
            href={PROMOTION_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C5A869] transition-colors flex items-center gap-1"
          >
            <span>Instagram</span>
          </a>
        </div>

        <p className="text-[10px] sm:text-[11px] tracking-wider text-[#FAF8F5]/40 max-w-xl font-light px-2">
          Port Phillip Bay & Bass Strait bespoke private maritime charters. Operating out of Sorrento Pier, Portsea Pier, Mornington Marina & Melbourne Docklands.
        </p>
      </div>
    </footer>
  );
};
