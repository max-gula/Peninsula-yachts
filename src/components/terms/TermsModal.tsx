import React from 'react';
import { TermsAndPrivacy } from './TermsAndPrivacy';

interface TermsModalProps {
  isOpen: boolean;
  initialTab?: 'terms' | 'guidelines' | 'privacy';
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#080D15] border border-[#C5A869]/30 flex flex-col shadow-2xl overflow-hidden">
        {/* Close Button Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#FAF8F5]/10 bg-[#0E1624]">
          <span className="font-serif text-xs sm:text-sm tracking-[0.16em] sm:tracking-[0.2em] text-[#C5A869] uppercase truncate">
            Peninsula Yachts Governance
          </span>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] p-1 flex items-center justify-center text-[#FAF8F5]/70 hover:text-[#FAF8F5] transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-8 py-3 sm:py-6">
          <TermsAndPrivacy initialTab={initialTab} />
        </div>

        {/* Modal Bottom Close */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-[#FAF8F5]/10 bg-[#0E1624] text-right">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#C5A869] hover:bg-[#D4AF37] text-[#080D15] text-xs font-sans tracking-widest uppercase font-semibold transition-colors cursor-pointer rounded-full"
          >
            Close & Return to Entry
          </button>
        </div>
      </div>
    </div>
  );
};
