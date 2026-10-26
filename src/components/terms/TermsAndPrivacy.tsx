import React, { useState } from 'react';
import { PROMOTION_CONFIG } from '../../services/storage';

interface TermsAndPrivacyProps {
  initialTab?: 'terms' | 'guidelines' | 'privacy';
}

export const TermsAndPrivacy: React.FC<TermsAndPrivacyProps> = ({
  initialTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'guidelines' | 'privacy'>(initialTab);

  return (
    <div className="min-h-screen py-8 sm:py-16 md:py-20 px-3.5 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Editorial Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
          <span className="h-[1px] w-5 sm:w-6 bg-[#C5A869]/50" />
          <span className="text-[10px] sm:text-xs font-sans uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#C5A869]">
            Legal & Guidelines
          </span>
          <span className="h-[1px] w-5 sm:w-6 bg-[#C5A869]/50" />
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl text-[#FAF8F5] tracking-tight font-normal">
          Terms, Guidelines & Privacy
        </h1>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#FAF8F5]/65 font-light max-w-lg mx-auto">
          Clear, straightforward governance for our promotional draw, maritime charter etiquette, and data protection.
        </p>
      </div>

      {/* Segmented Tab Controls: Pill buttons */}
      <div className="flex items-center justify-center mb-8 sm:mb-12">
        <div className="inline-flex p-1 bg-[#0E1624] border border-[#FAF8F5]/10 rounded-full text-[11px] sm:text-xs tracking-[0.14em] uppercase font-light">
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-2 px-4 sm:px-5 rounded-full transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-[#C5A869] text-[#080D15] font-semibold shadow-md'
                : 'text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
            }`}
          >
            Draw Terms
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`py-2 px-4 sm:px-5 rounded-full transition-all cursor-pointer ${
              activeTab === 'guidelines'
                ? 'bg-[#C5A869] text-[#080D15] font-semibold shadow-md'
                : 'text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
            }`}
          >
            Charter Guidelines
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-4 sm:px-5 rounded-full transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-[#C5A869] text-[#080D15] font-semibold shadow-md'
                : 'text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
            }`}
          >
            Privacy Policy
          </button>
        </div>
      </div>

      {/* TAB 1: DRAW TERMS & CONDITIONS */}
      {activeTab === 'terms' && (
        <article className="prose prose-invert max-w-none text-xs sm:text-sm text-[#FAF8F5]/80 space-y-6 sm:space-y-8 font-light leading-relaxed">
          <div className="border border-[#C5A869]/30 bg-[#0E1624]/60 p-4 sm:p-6">
            <h2 className="font-serif text-lg sm:text-xl text-[#FAF8F5] tracking-wide mb-1 sm:mb-2 font-normal">
              Peninsula Yachts Summer Draw Official Terms
            </h2>
            <p className="text-[10px] sm:text-xs text-[#C5A869] tracking-wider uppercase font-sans">
              Promotion Period: 1 November 2026 - {PROMOTION_CONFIG.closeDate}
            </p>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div>
              <h3 className="font-serif text-base sm:text-lg text-[#FAF8F5] mb-1.5 font-normal">1. The Promoter</h3>
              <p>
                The promoter is Peninsula Yachts, operating on the Mornington Peninsula and Port Phillip Bay, Victoria, Australia.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-base sm:text-lg text-[#FAF8F5] mb-1.5 font-normal">2. Eligibility</h3>
              <p>
                Entry is open exclusively to Australian residents aged 18 years or older at the time of entry. <strong className="text-[#C5A869] font-normal">To be valid to win, entrants must be actively following <a href={PROMOTION_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#D4AF37]">{PROMOTION_CONFIG.instagramHandle}</a> on Instagram at the time of the draw.</strong> Directors, management, employees, and immediate family members of the Promoter and associated agencies are ineligible to enter.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-base sm:text-lg text-[#FAF8F5] mb-1.5 font-normal">3. Entry Period</h3>
              <p>
                The promotion commences on 1 November 2026 at 00:01 AEDT and closes on {PROMOTION_CONFIG.closeDate}. Entries received after this deadline will not be eligible.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-base sm:text-lg text-[#FAF8F5] mb-1.5 font-normal">4. Prize Description</h3>
              <p>
                There is one (1) major prize consisting of:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-[#FAF8F5]/90">
                <li>A 4-Hour Private Luxury Yacht Charter on Port Phillip Bay, departing from Sorrento Pier or Portsea.</li>
                <li>Exclusive vessel use for the winner and up to 11 guests (maximum 12 passengers total).</li>
                <li>Full professional captain, crew, and fuel inclusions.</li>
                <li>Complimentary welcome champagne on arrival.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-base sm:text-lg text-[#FAF8F5] mb-1.5 font-normal">5. Draw Date & Selection Method</h3>
              <p>
                The winner will be determined via a computerized random electronic draw conducted on <strong className="text-[#C5A869] font-normal">{PROMOTION_CONFIG.drawDate}</strong>. Each unique email and mobile number is allocated one valid entry. Entrants must be following <strong className="text-[#C5A869] font-normal">{PROMOTION_CONFIG.instagramHandle}</strong> on Instagram to be verified and confirmed as the valid winner.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-base sm:text-lg text-[#FAF8F5] mb-1.5 font-normal">6. Winner Notification</h3>
              <p>
                The winner will be notified directly via phone call and SMS within 24 hours of the draw, followed by written confirmation via email. If the winner cannot be contacted within 14 days, a redraw will occur under the same conditions.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-base sm:text-lg text-[#FAF8F5] mb-1.5 font-normal">7. Prize Conditions</h3>
              <p>
                The prize is strictly not transferable, exchangeable, or redeemable for cash. Charter booking date is subject to vessel availability and prevailing marine weather conditions. Vessel guidelines and maritime safety rules apply to all passengers.
              </p>
            </div>
          </div>
        </article>
      )}

      {/* TAB 2: CHARTER GUIDELINES SUMMARY */}
      {activeTab === 'guidelines' && (
        <article className="prose prose-invert max-w-none text-xs sm:text-sm text-[#FAF8F5]/80 space-y-6 sm:space-y-8 font-light leading-relaxed">
          <div className="border border-[#C5A869]/30 bg-[#0E1624]/60 p-4 sm:p-6">
            <h2 className="font-serif text-lg sm:text-xl text-[#FAF8F5] tracking-wide mb-1 sm:mb-2 font-normal">
              Maritime Charter Guidelines & Onboard Etiquette
            </h2>
            <p className="text-xs text-[#FAF8F5]/60 font-sans">
              To ensure supreme safety, vessel preservation, and an effortless day on Port Phillip Bay, all guests are requested to observe the following rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="border border-[#FAF8F5]/10 p-4 sm:p-5 bg-[#080D15]">
              <h3 className="font-serif text-sm sm:text-base text-[#C5A869] mb-1 font-normal">3-Hour Minimum Duration</h3>
              <p className="text-xs text-[#FAF8F5]/70">
                All private voyages require a minimum booking duration of three (3) consecutive hours to ensure adequate time for safe harbour transit and anchor relaxation.
              </p>
            </div>

            <div className="border border-[#FAF8F5]/10 p-4 sm:p-5 bg-[#080D15]">
              <h3 className="font-serif text-sm sm:text-base text-[#C5A869] mb-1 font-normal">18+ Onboard Drinking & RSA</h3>
              <p className="text-xs text-[#FAF8F5]/70">
                Guests consuming alcohol must be 18 years of age or older with valid photo identification. Strict Responsible Service of Alcohol (RSA) laws are enforced by our licensed crew.
              </p>
            </div>

            <div className="border border-[#FAF8F5]/10 p-4 sm:p-5 bg-[#080D15]">
              <h3 className="font-serif text-sm sm:text-base text-[#C5A869] mb-1 font-normal">No Smoking & Open-Air Vaping</h3>
              <p className="text-xs text-[#FAF8F5]/70">
                Smoking of tobacco or cigars is strictly prohibited anywhere on board. Vaping is permitted only in designated open-air stern swim platform areas when stationary.
              </p>
            </div>

            <div className="border border-[#FAF8F5]/10 p-4 sm:p-5 bg-[#080D15]">
              <h3 className="font-serif text-sm sm:text-base text-[#C5A869] mb-1 font-normal">Barefoot Yachting (Shoes Off)</h3>
              <p className="text-xs text-[#FAF8F5]/70">
                To protect bespoke Burmese teak decking and luxury carpeted saloons, all outdoor footwear, heels, and dark-soled shoes must be removed upon embarkation into vessel shoe baskets.
              </p>
            </div>

            <div className="border border-[#FAF8F5]/10 p-4 sm:p-5 bg-[#080D15]">
              <h3 className="font-serif text-sm sm:text-base text-[#C5A869] mb-1 font-normal">Strictly No Red Wine</h3>
              <p className="text-xs text-[#FAF8F5]/70">
                To prevent permanent staining of white marine leather, custom upholstery, and teak woodwork, red wine and dark berry liqueurs are not permitted on board under any circumstances.
              </p>
            </div>

            <div className="border border-[#FAF8F5]/10 p-4 sm:p-5 bg-[#080D15]">
              <h3 className="font-serif text-sm sm:text-base text-[#C5A869] mb-1 font-normal">Board 15 Minutes Prior</h3>
              <p className="text-xs text-[#FAF8F5]/70">
                All guests must arrive at the designated pier (Sorrento, Portsea, Mornington, or Melbourne) 15 minutes before scheduled departure for the safety briefing and punctual cast-off.
              </p>
            </div>

            <div className="border border-[#FAF8F5]/10 p-4 sm:p-5 bg-[#080D15]">
              <h3 className="font-serif text-sm sm:text-base text-[#C5A869] mb-1 font-normal">Strict Passenger Capacity</h3>
              <p className="text-xs text-[#FAF8F5]/70">
                Australian Maritime Safety Authority (AMSA) regulations mandate our strict licensed passenger maximum (up to 45 guests depending on vessel configuration). Extra headcount cannot be accommodated.
              </p>
            </div>

            <div className="border border-[#FAF8F5]/10 p-4 sm:p-5 bg-[#080D15]">
              <h3 className="font-serif text-sm sm:text-base text-[#C5A869] mb-1 font-normal">Refundable Security Bond</h3>
              <p className="text-xs text-[#FAF8F5]/70">
                A security bond is held prior to departure and refunded within 48 hours of voyage completion, subject to satisfactory vessel inspection and adherence to guidelines.
              </p>
            </div>
          </div>

          <div className="border-t border-[#FAF8F5]/10 pt-5 sm:pt-6">
            <h3 className="font-serif text-base sm:text-lg text-[#FAF8F5] mb-2 sm:mb-3 font-normal">
              Cancellation & Weather Guarantee
            </h3>
            <div className="space-y-2.5 sm:space-y-3 text-xs text-[#FAF8F5]/75">
              <p>
                <strong className="text-[#C5A869] font-normal">Outside 28 days of charter:</strong> 100% charter credit issued, redeemable across the current and subsequent season.
              </p>
              <p>
                <strong className="text-[#C5A869] font-normal">Between 7 and 28 days of charter:</strong> 50% charter credit applied towards a rescheduled date.
              </p>
              <p>
                <strong className="text-[#C5A869] font-normal">Within 7 days of charter:</strong> Non-refundable due to vessel lock-in and catering allocations.
              </p>
              <p className="border-l-2 border-[#C5A869] pl-3 py-1 text-[#FAF8F5]">
                <strong className="text-[#C5A869] font-normal">Weather Safety Guarantee:</strong> If the Master (Captain) determines marine conditions, swell, or winds in Port Phillip Bay are unsafe for navigation, 100% charter credit or immediate date transfer is provided at no extra fee.
              </p>
            </div>
          </div>
        </article>
      )}

      {/* TAB 3: PRIVACY POLICY */}
      {activeTab === 'privacy' && (
        <article className="prose prose-invert max-w-none text-xs sm:text-sm text-[#FAF8F5]/80 space-y-6 sm:space-y-8 font-light leading-relaxed">
          <div className="border border-[#C5A869]/30 bg-[#0E1624]/60 p-4 sm:p-6">
            <h2 className="font-serif text-lg sm:text-xl text-[#FAF8F5] tracking-wide mb-1 sm:mb-2 font-normal">
              Peninsula Yachts Privacy Policy
            </h2>
            <p className="text-xs text-[#FAF8F5]/60 font-sans">
              Compliant with the Australian Privacy Principles (APPs) and the Privacy Act 1988 (Cth).
            </p>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div>
              <h3 className="font-serif text-base sm:text-lg text-[#FAF8F5] mb-1.5 font-normal">1. What Information We Collect</h3>
              <p>
                When you enter our promotional draw or submit a bespoke charter enquiry, we may collect personal details including:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-[#FAF8F5]/75">
                <li>Your full name</li>
                <li>Email address</li>
                <li>Australian mobile phone number</li>
                <li>Residential suburb or address</li>
                <li>Charter preferences (guest numbers, dates, catering choices, and notes)</li>
                <li>Timestamp and opt-in consent records</li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-base sm:text-lg text-[#FAF8F5] mb-1.5 font-normal">2. Why We Collect It</h3>
              <p>
                We collect your personal information strictly for the following purposes:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-[#FAF8F5]/75">
                <li>Administering and validating the Peninsula Yachts Summer Draw and notifying the winner.</li>
                <li>Preparing and delivering tailored charter quotations based on your specific requirements.</li>
                <li>Where you have explicitly opted in, providing occasional Peninsula Yachts seasonal updates, private event invites, and news.</li>
                <li>Fulfilling legal and maritime safety record-keeping obligations.</li>
              </ul>
              <p className="mt-2 text-[#FAF8F5]/60">
                We never sell, rent, or trade your personal information to third-party data brokers.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-base sm:text-lg text-[#FAF8F5] mb-1.5 font-normal">3. How to Opt Out or Update Your Details</h3>
              <p>
                You may opt out of receiving promotional communications at any time by clicking the "unsubscribe" link included at the bottom of any email, replying STOP to any SMS, or by contacting our team at <a href="mailto:peninsulaluxuryyachts@gmail.com" className="text-[#C5A869] underline hover:text-[#D4AF37] transition-colors">peninsulaluxuryyachts@gmail.com</a>.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-base sm:text-lg text-[#FAF8F5] mb-1.5 font-normal">4. Data Security & Storage</h3>
              <p>
                All data is encrypted in transit and securely stored with restricted access limited exclusively to authorized Peninsula Yachts personnel and our CRM infrastructure.
              </p>
            </div>
          </div>
        </article>
      )}
    </div>
  );
};
