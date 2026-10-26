import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROMOTION_CONFIG, saveDrawEntry } from '../../services/storage';
import { ActivePage } from '../../types';
import { BrandLogo } from '../BrandLogo';
import { AddressAutocomplete } from '../common/AddressAutocomplete';
import { PhoneDigitsInput } from '../common/PhoneDigitsInput';
import {
  submitLeadStep1,
  submitLeadStep2,
  submitLeadStep3,
  getStoredLeadId,
} from '../../services/leadsClient';

interface DrawFunnelProps {
  onNavigate: (page: ActivePage) => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onSubmissionSuccess?: () => void;
}

export const DrawFunnel: React.FC<DrawFunnelProps> = ({
  onNavigate,
  onOpenTerms,
  onOpenPrivacy,
  onSubmissionSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1);
  const [leadId, setLeadId] = useState<string>(() => getStoredLeadId() || '');
  const [email, setEmail] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  
  // Consent flags
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [termsError, setTermsError] = useState(false);
  
  // Errors and loading
  const [error, setError] = useState<string | null>(null);
  const [isStep1Submitting, setIsStep1Submitting] = useState(false);
  const [isStep2Submitting, setIsStep2Submitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation
  const validateEmail = (val: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val.trim());
  };

  const handleEmailNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsStep1Submitting(true);
    try {
      const res = await submitLeadStep1(email);
      if (res.leadId) {
        setLeadId(res.leadId);
      }
      setIsStep1Submitting(false);
      setStep(2);
    } catch (err: unknown) {
      console.error('Step 1 submission error:', err);
      setIsStep1Submitting(false);
      setError(err instanceof Error ? err.message : 'Unable to record your email. Please try again.');
    }
  };

  const handleMobileNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanDigits = phoneDigits.replace(/\D/g, '');
    if (cleanDigits.length < 8) {
      setError('Please enter your remaining mobile digits.');
      return;
    }

    const fullMobile = '04' + cleanDigits;
    setIsStep2Submitting(true);
    try {
      let activeLeadId = leadId || getStoredLeadId();
      if (!activeLeadId) {
        const step1Res = await submitLeadStep1(email);
        activeLeadId = step1Res.leadId;
        setLeadId(activeLeadId);
      }

      await submitLeadStep2(activeLeadId, fullMobile);
      setIsStep2Submitting(false);
      setStep(3);
    } catch (err: unknown) {
      console.error('Step 2 submission error:', err);
      setIsStep2Submitting(false);
      setError(err instanceof Error ? err.message : 'Unable to record your mobile number. Please try again.');
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!address.trim()) {
      setError('Please select or enter your address or suburb.');
      return;
    }
    if (!agreedToTerms) {
      setTermsError(true);
      return;
    }

    setIsSubmitting(true);
    const fullMobile = '04' + phoneDigits.replace(/\D/g, '');
    try {
      let activeLeadId = leadId || getStoredLeadId();
      if (!activeLeadId) {
        const step1Res = await submitLeadStep1(email);
        activeLeadId = step1Res.leadId;
        setLeadId(activeLeadId);
        await submitLeadStep2(activeLeadId, fullMobile);
      }

      // Step 3 Progressive Update to Google Sheets
      await submitLeadStep3({
        leadId: activeLeadId,
        fullName: fullName.trim(),
        address: address.trim(),
        marketingConsent: Boolean(marketingConsent),
        agreedToTerms: true,
      });

      // Save to local storage for local admin and data export continuity
      await saveDrawEntry({
        email: email.trim().toLowerCase(),
        mobile: fullMobile,
        fullName: fullName.trim(),
        suburb: address.trim(),
        agreedToTerms: true,
        marketingConsent: Boolean(marketingConsent),
      });

      setIsSubmitting(false);
      setStep('success');
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    } catch (err: unknown) {
      console.error(err);
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Unable to save entry at this moment. Please try again.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] sm:min-h-[calc(100vh-5rem)] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10 md:py-16 overflow-hidden">
      {/* Full-bleed background image with slow cinematic ocean ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/src/assets/images/hero_water_portsea_1792956725001.jpg"
          alt="Portsea and Sorrento waters"
          className="w-full h-full object-cover object-center animate-subtle-drift filter brightness-[0.6] contrast-[1.08]"
          referrerPolicy="no-referrer"
        />
        {/* Measured scrims: deep navy gradient overlay for perfect contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080D15] via-[#080D15]/65 to-[#080D15]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,13,21,0.25)_0%,rgba(8,13,21,0.85)_100%)]" />
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="bg-[#080D15]/90 sm:bg-[#080D15]/85 backdrop-blur-xl border border-[#FAF8F5]/10 p-4 sm:p-8 md:p-10 shadow-2xl transition-all">
          
          {/* Brand Icon / Instagram Profile crest */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <BrandLogo variant="large" />
          </div>

          {/* Minimal Copy Headlines */}
          {step !== 'success' && (
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="font-serif text-2xl sm:text-4xl text-[#FAF8F5] tracking-tight font-normal leading-tight">
                Summer on the water.
              </h2>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#FAF8F5]/75 font-light leading-relaxed max-w-md mx-auto">
                Enter the draw to win a private yacht experience on the Mornington Peninsula this summer.
              </p>

              {/* Thin progress line (1 of 3) */}
              <div className="mt-5 sm:mt-7 max-w-xs mx-auto">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-sans tracking-[0.2em] uppercase text-[#C5A869]/85 mb-1.5 sm:mb-2">
                  <span>Step {step} of 3</span>
                  <span>{step === 1 ? 'Email' : step === 2 ? 'Mobile' : 'Details'}</span>
                </div>
                <div className="w-full h-[2px] bg-[#FAF8F5]/15 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#C5A869]"
                    initial={false}
                    animate={{ width: `${(step / 3) * 100}%` }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 text-xs text-[#EAE4D9] bg-[#C5A869]/15 border border-[#C5A869]/40 text-center tracking-wide animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {/* Interactive Progressive Funnel */}
          <AnimatePresence mode="wait">
            {/* STEP 1: Email */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleEmailNext}
                className="space-y-4 sm:space-y-5"
              >
                <div>
                  <label htmlFor="email" className="block text-[11px] sm:text-xs font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/80 mb-1.5 sm:mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoFocus
                    required
                    placeholder="your.name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-[#0E1624] border border-[#FAF8F5]/20 focus:border-[#C5A869] text-[#FAF8F5] px-4 sm:px-5 py-3 sm:py-3.5 text-sm rounded-full focus:outline-none transition-colors placeholder-[#FAF8F5]/30 tracking-wide"
                  />

                  {/* Top Email Domain Preempts for Fast Filling */}
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 overflow-x-auto pb-1">
                    <span className="text-[10px] text-[#FAF8F5]/40 uppercase tracking-widest shrink-0 mr-0.5">
                      Quick:
                    </span>
                    {['@gmail.com', '@icloud.com', '@outlook.com', '@bigpond.com', '@hotmail.com'].map((domain) => (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => {
                          setError(null);
                          if (!email.trim()) {
                            setEmail(domain);
                          } else {
                            const atIdx = email.indexOf('@');
                            const prefix = atIdx === -1 ? email.trim() : email.slice(0, atIdx);
                            setEmail(prefix + domain);
                          }
                        }}
                        className="px-3 py-1.5 rounded-full border border-[#FAF8F5]/15 hover:border-[#C5A869] text-[#FAF8F5]/85 hover:text-[#C5A869] text-xs font-mono whitespace-nowrap transition-colors cursor-pointer bg-[#080D15]/80 hover:bg-[#C5A869]/10"
                      >
                        {domain}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isStep1Submitting}
                  className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3.5 px-6 bg-[#C5A869] hover:bg-[#D4AF37] text-[#080D15] text-xs font-sans tracking-[0.2em] uppercase font-bold transition-all duration-300 shadow-md group cursor-pointer rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{isStep1Submitting ? 'Continuing...' : 'Continue'}</span>
                  {!isStep1Submitting && (
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </motion.form>
            )}

            {/* STEP 2: Mobile Number with Separate Digit Squares & Digit Keyboard */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleMobileNext}
                className="space-y-4 sm:space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] sm:text-xs font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/80">
                      Mobile Number
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setStep(1);
                      }}
                      className="text-[11px] text-[#C5A869] hover:text-[#D4AF37] tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      ← Back
                    </button>
                  </div>

                  {/* 04 as non-squares at the front + three sets of three empty squares */}
                  <PhoneDigitsInput
                    value={phoneDigits}
                    onChange={(val) => {
                      setPhoneDigits(val);
                      if (error) setError(null);
                    }}
                    autoFocus={true}
                  />
                </div>

                <div className="flex items-center gap-2 sm:gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep(1);
                    }}
                    className="min-h-[46px] min-w-[46px] px-3.5 py-3 text-[#FAF8F5]/70 hover:text-[#FAF8F5] border border-[#FAF8F5]/20 hover:border-[#FAF8F5]/40 transition-colors flex items-center justify-center shrink-0 cursor-pointer rounded-full"
                    aria-label="Back to step 1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>

                  <button
                    type="submit"
                    disabled={isStep2Submitting}
                    className="flex-1 min-h-[46px] flex items-center justify-center gap-2 py-3.5 px-6 bg-[#C5A869] hover:bg-[#D4AF37] text-[#080D15] text-xs font-sans tracking-[0.18em] uppercase font-bold transition-all duration-300 shadow-md group cursor-pointer rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span>{isStep2Submitting ? 'Continuing...' : 'Continue'}</span>
                    {!isStep2Submitting && (
                      <svg
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3: Full Name + Live Address Autocomplete */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleFinalSubmit}
                className="space-y-3.5 sm:space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/80">
                    Final Step
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep(2);
                    }}
                    className="text-[11px] text-[#C5A869] hover:text-[#D4AF37] tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-[10px] sm:text-[11px] font-sans tracking-[0.14em] uppercase text-[#FAF8F5]/70 mb-1">
                    Full Name <span className="text-[#C5A869]">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    autoFocus
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-[#080D15] border border-[#FAF8F5]/20 focus:border-[#C5A869] text-[#FAF8F5] px-4 sm:px-5 py-3 text-sm rounded-full focus:outline-none transition-colors placeholder-[#FAF8F5]/30"
                  />
                </div>

                {/* Real-time Address Autocomplete (handles street addresses across Victoria and Australia) */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-sans tracking-[0.14em] uppercase text-[#FAF8F5]/70 mb-1">
                    Address <span className="text-[#C5A869]">*</span>
                  </label>
                  <AddressAutocomplete
                    value={address}
                    onChange={(val) => {
                      setAddress(val);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. Hotel Sorrento, 5-15 Hotham Road, Sorrento VIC 3943"
                  />
                </div>

                {/* Consent checkboxes */}
                <div className="pt-1 space-y-1.5">
                  {/* Required Terms Checkbox */}
                  <label
                    className={`flex items-start gap-2.5 cursor-pointer select-none p-2 rounded-xl transition-all ${
                      termsError
                        ? 'border border-red-500/80 bg-red-950/20 ring-1 ring-red-500/50'
                        : 'border border-transparent hover:bg-[#FAF8F5]/5'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (e.target.checked) setTermsError(false);
                      }}
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded bg-[#0E1624] text-[#C5A869] focus:ring-[#C5A869] accent-[#C5A869] cursor-pointer transition-colors ${
                        termsError
                          ? 'border-2 border-red-500 ring-2 ring-red-500/60'
                          : 'border-[#FAF8F5]/30'
                      }`}
                    />
                    <span className={`text-[11px] sm:text-xs leading-snug font-light ${termsError ? 'text-red-200' : 'text-[#FAF8F5]/80'}`}>
                      <span className={termsError ? 'text-red-400 font-bold mr-0.5' : 'text-[#C5A869] mr-0.5'}>*</span>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={onOpenTerms}
                        className="underline hover:text-[#C5A869] transition-colors font-normal inline"
                      >
                        Terms & Conditions
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={onOpenPrivacy}
                        className="underline hover:text-[#C5A869] transition-colors font-normal inline"
                      >
                        Privacy Policy
                      </button>.
                      <span className={`block text-[10px] mt-0.5 font-light ${termsError ? 'text-red-400 font-medium' : 'text-[#C5A869]/90'}`}>
                        (Must follow @peninsula_yachts on Instagram to be valid to win)
                      </span>
                    </span>
                  </label>

                  {/* Optional Marketing Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none p-2 rounded-xl border border-transparent hover:bg-[#FAF8F5]/5 transition-all">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded bg-[#0E1624] border-[#FAF8F5]/30 text-[#C5A869] focus:ring-[#C5A869] accent-[#C5A869] cursor-pointer"
                    />
                    <span className="text-[11px] sm:text-xs text-[#FAF8F5]/70 leading-snug font-light">
                      Yes, send me Peninsula Yachts offers, events and news by email and SMS.
                    </span>
                  </label>
                </div>

                {/* Large Full-Width Button as Pill */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[48px] py-3.5 sm:py-4 px-6 bg-[#C5A869] hover:bg-[#D4AF37] text-[#080D15] text-xs font-sans tracking-[0.2em] sm:tracking-[0.25em] uppercase font-bold transition-all duration-300 shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                  >
                    {isSubmitting ? 'Entering...' : 'ENTER THE DRAW'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* SUCCESS STATE */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="text-center py-2 sm:py-4 space-y-5 sm:space-y-6"
              >
                {/* Champagne Gold Crest Confirmation */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full border border-[#C5A869] flex items-center justify-center text-[#C5A869] bg-[#C5A869]/10">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div>
                  <h3 className="font-serif text-2xl sm:text-4xl text-[#FAF8F5] tracking-tight font-light">
                    You're in.
                  </h3>
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#FAF8F5]/80 font-light leading-relaxed max-w-sm mx-auto">
                    Winner drawn <span className="text-[#C5A869] font-medium">{PROMOTION_CONFIG.drawDate}</span> and notified directly via phone & email.
                  </p>
                  <p className="mt-1 text-[11px] text-[#C5A869]/85 font-light">
                    Must follow @peninsula_yachts on Instagram to be valid to win.
                  </p>
                </div>

                <div className="pt-1 space-y-3">
                  {/* Instagram Button as Pill */}
                  <a
                    href={PROMOTION_CONFIG.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-6 bg-[#0E1624] hover:bg-[#141F32] border border-[#C5A869]/40 hover:border-[#C5A869] text-[#FAF8F5] text-xs font-sans tracking-[0.16em] uppercase font-medium transition-all duration-300 rounded-full"
                  >
                    <svg className="w-4 h-4 fill-none stroke-[#C5A869] stroke-2 shrink-0" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    <span>Follow @peninsula_yachts</span>
                  </a>

                  {/* Planning a charter? Enquire link to Page 2 */}
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('charters')}
                      className="text-xs tracking-[0.14em] uppercase text-[#C5A869] hover:text-[#D4AF37] transition-colors underline-offset-8 underline cursor-pointer py-1"
                    >
                      Planning a charter? Enquire
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Small Footer on Card */}
          <div className="mt-6 sm:mt-8 pt-4 border-t border-[#FAF8F5]/10 text-center">
            <p className="text-[10px] sm:text-[11px] text-[#FAF8F5]/45 tracking-wider font-light">
              Promotion closes {PROMOTION_CONFIG.closeDate}.{' '}
              <button
                type="button"
                onClick={onOpenTerms}
                className="text-[#C5A869]/70 hover:text-[#C5A869] underline transition-colors cursor-pointer"
              >
                Full terms.
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
