import React from 'react';
import { motion } from 'motion/react';
import { BrandLogo } from '../BrandLogo';
import { ActivePage } from '../../types';

interface BrandHomeProps {
  onNavigate: (page: ActivePage) => void;
}

export const BrandHome: React.FC<BrandHomeProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] sm:min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20 overflow-hidden">
      {/* Full-bleed background image with slow cinematic ocean ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/src/assets/images/yacht_at_sorrento_1792956725616.jpg"
          alt="Peninsula Yachts anchored off Sorrento"
          className="w-full h-full object-cover object-center animate-subtle-drift filter brightness-[0.52] contrast-[1.1]"
          referrerPolicy="no-referrer"
        />
        {/* Measured scrims: deep navy gradient overlay for perfect contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080D15] via-[#080D15]/75 to-[#080D15]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,13,21,0.3)_0%,rgba(8,13,21,0.92)_100%)]" />
      </div>

      {/* Hero Section Container */}
      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Brand Crest & Wordmark */}
          <div className="flex justify-center">
            <BrandLogo variant="large" />
          </div>

          {/* Elegant Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center">
              <span className="text-[10px] sm:text-xs font-sans uppercase tracking-[0.35em] text-[#C5A869]">
                Mornington Peninsula · Port Phillip Bay
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl text-[#FAF8F5] tracking-tight font-light leading-tight">
              The luxury of quiet water.
            </h2>
          </div>

          {/* Rich Intellectual Note */}
          <div className="border-t border-b border-[#FAF8F5]/10 py-6 sm:py-8 my-4 text-center">
            <div className="max-w-xl mx-auto space-y-4 text-[#FAF8F5]/85 font-light text-xs sm:text-sm md:text-base leading-relaxed tracking-wide">
              <p className="font-serif italic text-base sm:text-lg text-[#C5A869]/90 font-normal">
                We believe the greatest luxury is unhurried time.
              </p>
              <p>
                Far from the noise of the city, where Port Phillip Bay meets the heads and the late afternoon light turns golden over Sorrento, Peninsula Yachts was founded on a singular conviction: that a day on the water should feel less like an excursion, and more like an effortless extension of your own summer house.
              </p>
              <p className="text-[#FAF8F5]/75">
                Every voyage is shaped by the tides, the season, and your company - discreet, unpretentious, and distinctly Melbourne.
              </p>
            </div>
          </div>

          {/* Subtle Dual Actions - Pill Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => onNavigate('draw')}
              className="w-full sm:w-auto min-h-[46px] px-8 py-3.5 bg-[#C5A869] hover:bg-[#D4AF37] text-[#080D15] text-xs font-sans tracking-[0.2em] uppercase font-bold transition-all duration-300 shadow-xl rounded-full cursor-pointer"
            >
              Enter the Summer Draw
            </button>

            <button
              onClick={() => onNavigate('charters')}
              className="w-full sm:w-auto min-h-[46px] px-8 py-3.5 bg-[#0E1624]/90 hover:bg-[#141F32] border border-[#FAF8F5]/25 hover:border-[#C5A869] text-[#FAF8F5] text-xs font-sans tracking-[0.2em] uppercase font-medium transition-all duration-300 rounded-full cursor-pointer"
            >
              Bespoke Charters
            </button>
          </div>

          <div className="pt-4">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#FAF8F5]/40 font-light">
              Sorrento · Portsea · Mornington · Melbourne
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
