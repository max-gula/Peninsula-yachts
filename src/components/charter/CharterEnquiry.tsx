import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CharterEnquiry as CharterEnquiryType,
  DurationOption,
  DepartureLocation,
  DayPreference,
  FoodPreference,
  DrinksPreference,
  OccasionType,
} from '../../types';
import { saveCharterEnquiry } from '../../services/storage';

interface CharterEnquiryProps {
  onSuccess?: () => void;
}

const OCCASIONS: { label: string; value: OccasionType }[] = [
  { label: 'Celebration', value: 'celebration' },
  { label: 'Birthday', value: 'birthday' },
  { label: 'Corporate & Executive', value: 'corporate' },
  { label: 'Sunset Cruise', value: 'sunset_cruise' },
  { label: 'Other Bespoke Occasion', value: 'other' },
];

const DURATIONS: { label: string; value: DurationOption; note?: string }[] = [
  { label: '3 Hours', value: '3_hours', note: 'Min duration' },
  { label: '4 Hours', value: '4_hours' },
  { label: '5 Hours', value: '5_hours' },
  { label: '6 Hours', value: '6_hours' },
  { label: '8 Hours', value: '8_hours' },
  { label: 'Full Day', value: 'full_day' },
  { label: 'Overnight', value: 'overnight' },
];

const DEPARTURES: DepartureLocation[] = [
  'Sorrento',
  'Portsea',
  'Mornington',
  'Port Melbourne',
  'Docklands',
  'No preference',
];

const ADD_ONS = [
  { id: 'dj', label: 'Resident DJ & Sound System' },
  { id: 'photographer', label: 'Dedicated Marine Photographer' },
  { id: 'videographer', label: 'Cinematic Drone & Videographer' },
  { id: 'waitstaff', label: 'Private Bar Staff & Waitstaff' },
  { id: 'lighting', label: 'Evening Ambient Lighting Package' },
];

export const CharterEnquiry: React.FC<CharterEnquiryProps> = ({ onSuccess }) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  
  const [preferredDate, setPreferredDate] = useState('');
  const [dateFlexibility, setDateFlexibility] = useState<'exact' | 'flexible'>('flexible');
  const [dayPreference, setDayPreference] = useState<DayPreference>('weekend');

  // Interactive Calendar State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Close calendar popover on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        calendarContainerRef.current &&
        !calendarContainerRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCalendarOpen]);
  
  const [occasion, setOccasion] = useState<OccasionType>('celebration');
  const [occasionDetails, setOccasionDetails] = useState('');
  
  const [guests, setGuests] = useState<number>(12);
  const [duration, setDuration] = useState<DurationOption>('4_hours');
  const [departure, setDeparture] = useState<DepartureLocation>('Sorrento');
  
  const [food, setFood] = useState<FoodPreference>('catered');
  const [drinks, setDrinks] = useState<DrinksPreference>('drinks_package');
  
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<CharterEnquiryType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatSelectedDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return date.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Helper for quick-preset dates
  const setQuickPreset = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const isoDate = `${y}-${m}-${day}`;
    setPreferredDate(isoDate);
    setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    if (error) setError(null);
  };

  // Calendar calculations
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const prevMonth = () => {
    setCalendarMonth((prev) => {
      const p = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      return p < currentMonthStart ? currentMonthStart : p;
    });
  };

  const nextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isPrevDisabled =
    calendarMonth.getFullYear() === now.getFullYear() &&
    calendarMonth.getMonth() <= now.getMonth();

  const calYear = calendarMonth.getFullYear();
  const calMonth = calendarMonth.getMonth();
  const calMonthTitle = calendarMonth.toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  });

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const startOffset = (firstDay + 6) % 7; // Monday index 0
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleSelectDate = (dayNum: number) => {
    const mStr = String(calMonth + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const iso = `${calYear}-${mStr}-${dStr}`;
    setPreferredDate(iso);
    setIsCalendarOpen(false);
    if (error) setError(null);
  };

  const triggerNativePicker = () => {
    if (dateInputRef.current) {
      try {
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.focus();
        }
      } catch {
        dateInputRef.current.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !mobile.trim()) {
      setError('Please provide your name, email, and mobile number.');
      return;
    }

    if (!preferredDate) {
      setError('Please select an approximate or preferred date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await saveCharterEnquiry({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        preferredDate,
        dateFlexibility,
        occasion,
        occasionDetails: occasion === 'other' ? occasionDetails : undefined,
        guests: Math.min(Math.max(guests, 1), 45),
        duration,
        dayPreference,
        departure,
        food,
        drinks,
        addOns: selectedAddOns,
        notes: notes.trim(),
      });

      setSubmittedData(saved);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setError('Unable to submit enquiry at this time. Please try again.');
    }
  };

  if (submittedData) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-3.5 sm:px-4 py-8 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full bg-[#0E1624] border border-[#C5A869]/30 p-5 sm:p-10 text-center shadow-2xl"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full border border-[#C5A869] flex items-center justify-center text-[#C5A869] bg-[#C5A869]/10 mb-4 sm:mb-6">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl text-[#FAF8F5] tracking-tight font-normal">
            Thank you.
          </h2>
          <p className="mt-2 sm:mt-4 text-sm sm:text-base text-[#C5A869] tracking-wide font-light">
            We'll be in touch within 24 hours.
          </p>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-[#FAF8F5]/70 font-light leading-relaxed">
            Our charter director is reviewing your bespoke itinerary for {submittedData.guests} guests departing from {submittedData.departure}. A tailored quote and vessel profile will be sent to:
            <span className="block mt-1.5 font-medium text-[#FAF8F5] underline whitespace-nowrap overflow-hidden text-ellipsis">
              {submittedData.email}
            </span>
          </p>

          <div className="mt-6 pt-5 border-t border-[#FAF8F5]/10 text-left text-xs text-[#FAF8F5]/60 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#FAF8F5]/40 uppercase tracking-widest text-[9px] sm:text-[10px]">Occasion</span>
              <span className="text-[#FAF8F5] font-light capitalize">{submittedData.occasion.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#FAF8F5]/40 uppercase tracking-widest text-[9px] sm:text-[10px]">Requested Date</span>
              <span className="text-[#FAF8F5] font-light">{formatSelectedDate(submittedData.preferredDate)} ({submittedData.dateFlexibility})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#FAF8F5]/40 uppercase tracking-widest text-[9px] sm:text-[10px]">Catering</span>
              <span className="text-[#FAF8F5] font-light truncate max-w-[200px] text-right">{submittedData.food === 'catered' ? 'Catered' : 'BYO'} & {submittedData.drinks === 'drinks_package' ? 'Drinks Pkg' : 'BYO'}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setSubmittedData(null);
            }}
            className="mt-6 px-6 py-3 border border-[#C5A869]/40 hover:border-[#C5A869] text-xs font-sans tracking-[0.2em] uppercase text-[#C5A869] transition-colors cursor-pointer rounded-full"
          >
            Submit Another Request
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-16 md:py-20 px-3.5 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Intro Header */}
      <div className="text-center mb-8 sm:mb-14">
        <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
          <span className="h-[1px] w-5 sm:w-6 bg-[#C5A869]/50" />
          <span className="text-[10px] sm:text-xs font-sans uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#C5A869]">
            Bespoke Maritime Charters
          </span>
          <span className="h-[1px] w-5 sm:w-6 bg-[#C5A869]/50" />
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl text-[#FAF8F5] tracking-tight font-normal leading-tight">
          Every charter is tailored.
        </h1>
        <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-[#FAF8F5]/75 font-light leading-relaxed max-w-lg mx-auto">
          Tell us what you have in mind and we'll come back with a quote.
        </p>
      </div>

      {/* Hero vessel visual banner */}
      <div className="mb-6 sm:mb-10 overflow-hidden border border-[#FAF8F5]/10 shadow-xl relative aspect-[16/8] sm:aspect-[21/9]">
        <img
          src="/images/yacht_at_sorrento_1792956725616.jpg"
          alt="Peninsula Yachts vessel at Sorrento"
          className="w-full h-full object-cover object-center filter brightness-[0.85]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080D15] via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6 flex items-center justify-between text-xs text-[#FAF8F5]/80">
          <span className="font-serif tracking-widest text-xs sm:text-sm text-[#FAF8F5]">Portsea & Sorrento Bay</span>
          <span className="text-[10px] sm:text-[11px] font-sans tracking-widest text-[#C5A869] uppercase">Private Fleet</span>
        </div>
      </div>

      {/* Form with Pill Buttons & Mobile-Optimized Date Bar */}
      <div className="w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-[#0E1624]/90 border border-[#FAF8F5]/10 p-4 sm:p-8 md:p-10 space-y-8 sm:space-y-10 shadow-2xl"
        >
          {error && (
            <div className="p-3 bg-[#C5A869]/15 border border-[#C5A869]/40 text-xs text-[#EAE4D9] text-center tracking-wide">
              {error}
            </div>
          )}

          {/* Group 1: Contact Details */}
          <section className="space-y-3.5 sm:space-y-4">
            <div className="border-b border-[#FAF8F5]/10 pb-1.5 sm:pb-2">
              <h2 className="font-serif text-lg sm:text-xl text-[#FAF8F5] tracking-wide font-normal">
                01. Your Details
              </h2>
            </div>

            <div className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70 mb-1">
                  Full Name <span className="text-[#C5A869]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Vane"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#080D15] border border-[#FAF8F5]/20 focus:border-[#C5A869] text-[#FAF8F5] px-4 py-3 text-sm focus:outline-none transition-colors placeholder-[#FAF8F5]/30 rounded-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70 mb-1">
                    Email <span className="text-[#C5A869]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="marcus@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#080D15] border border-[#FAF8F5]/20 focus:border-[#C5A869] text-[#FAF8F5] px-4 py-3 text-sm focus:outline-none transition-colors placeholder-[#FAF8F5]/30 rounded-full"
                  />
                  {/* Top Email Domain Preempts for Fast Mobile Filling */}
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                    <span className="text-[9px] text-[#FAF8F5]/40 uppercase tracking-widest shrink-0">
                      Quick:
                    </span>
                    {['@gmail.com', '@icloud.com', '@outlook.com', '@bigpond.com', '@hotmail.com'].map((domain) => (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => {
                          if (!email.trim()) {
                            setEmail(domain);
                          } else {
                            const atIdx = email.indexOf('@');
                            const prefix = atIdx === -1 ? email.trim() : email.slice(0, atIdx);
                            setEmail(prefix + domain);
                          }
                        }}
                        className="px-2.5 py-1 rounded-full border border-[#FAF8F5]/15 hover:border-[#C5A869] text-[#FAF8F5]/80 hover:text-[#C5A869] text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer bg-[#080D15]/80 hover:bg-[#C5A869]/10"
                      >
                        {domain}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70 mb-1">
                    Mobile Number <span className="text-[#C5A869]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0412 345 678"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-[#080D15] border border-[#FAF8F5]/20 focus:border-[#C5A869] text-[#FAF8F5] px-4 py-3 text-sm focus:outline-none transition-colors placeholder-[#FAF8F5]/30 tabular-nums rounded-full"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Group 2: Mobile-Optimized Date Bar + Flexibility & Day of Week */}
          <section className="space-y-3.5 sm:space-y-4">
            <div className="border-b border-[#FAF8F5]/10 pb-1.5 sm:pb-2">
              <h2 className="font-serif text-lg sm:text-xl text-[#FAF8F5] tracking-wide font-normal">
                02. Date & Timing
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Fully Mobile-Optimized Date Bar */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70 mb-1.5">
                  Preferred Date <span className="text-[#C5A869]">*</span>
                </label>

                {/* Custom styled container with interactive calendar popover */}
                <div className="relative w-full" ref={calendarContainerRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCalendarOpen((prev) => {
                        const nextState = !prev;
                        if (nextState && preferredDate) {
                          const [y, m] = preferredDate.split('-').map(Number);
                          if (y && m) setCalendarMonth(new Date(y, m - 1, 1));
                        }
                        return nextState;
                      });
                    }}
                    aria-expanded={isCalendarOpen}
                    aria-haspopup="dialog"
                    className={`min-h-[48px] w-full bg-[#080D15] border ${
                      isCalendarOpen
                        ? 'border-[#C5A869] ring-1 ring-[#C5A869]/30'
                        : 'border-[#FAF8F5]/20 hover:border-[#C5A869]'
                    } rounded-full px-4 sm:px-5 py-3 flex items-center justify-between text-sm transition-all cursor-pointer text-left`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <svg className="w-4 h-4 text-[#C5A869] shrink-0 stroke-current fill-none" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5" />
                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth="1.5" />
                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth="1.5" />
                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth="1.5" />
                      </svg>
                      {preferredDate ? (
                        <span className="text-[#FAF8F5] font-medium tracking-wide">
                          {formatSelectedDate(preferredDate)}
                        </span>
                      ) : (
                        <span className="text-[#FAF8F5]/40 font-light">
                          Select your preferred date...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] text-[#C5A869] uppercase font-sans tracking-widest font-medium">
                        {preferredDate ? 'Change' : 'Open Calendar'}
                      </span>
                      <svg
                        className={`w-3.5 h-3.5 text-[#C5A869] transition-transform duration-200 ${
                          isCalendarOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Hidden native input synced for HTML5 form validation */}
                  <input
                    ref={dateInputRef}
                    type="date"
                    tabIndex={-1}
                    aria-hidden="true"
                    value={preferredDate}
                    min={todayIso}
                    onChange={(e) => {
                      setPreferredDate(e.target.value);
                      if (error) setError(null);
                    }}
                    className="sr-only pointer-events-none"
                  />

                  {/* Interactive Luxury Calendar Popover */}
                  {isCalendarOpen && (
                    <div
                      role="dialog"
                      aria-label="Choose charter date"
                      className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0B1320] border border-[#C5A869]/30 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl"
                    >
                      {/* Calendar Header: Month, Year & Navigation */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#FAF8F5]/10 mb-3">
                        <button
                          type="button"
                          onClick={prevMonth}
                          disabled={isPrevDisabled}
                          className={`p-1.5 rounded-full transition-colors ${
                            isPrevDisabled
                              ? 'text-[#FAF8F5]/20 cursor-not-allowed'
                              : 'text-[#FAF8F5]/70 hover:text-[#C5A869] hover:bg-[#FAF8F5]/5 cursor-pointer'
                          }`}
                          aria-label="Previous month"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <div className="text-center">
                          <span className="font-serif text-base text-[#FAF8F5] tracking-wide font-medium">
                            {calMonthTitle}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={nextMonth}
                          className="p-1.5 rounded-full text-[#FAF8F5]/70 hover:text-[#C5A869] hover:bg-[#FAF8F5]/5 transition-colors cursor-pointer"
                          aria-label="Next month"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* Day of Week Headers */}
                      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => (
                          <div
                            key={dayName}
                            className={`text-[10px] font-sans tracking-wider uppercase py-1 font-medium ${
                              idx >= 5 ? 'text-[#C5A869]/90 font-semibold' : 'text-[#FAF8F5]/40'
                            }`}
                          >
                            {dayName}
                          </div>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {/* Empty leading slots */}
                        {Array.from({ length: startOffset }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-8 sm:h-9" />
                        ))}

                        {/* Day numbers */}
                        {daysArray.map((dayNum) => {
                          const mStr = String(calMonth + 1).padStart(2, '0');
                          const dStr = String(dayNum).padStart(2, '0');
                          const dateIso = `${calYear}-${mStr}-${dStr}`;
                          const isPast = dateIso < todayIso;
                          const isSelected = preferredDate === dateIso;
                          const isToday = dateIso === todayIso;

                          return (
                            <button
                              key={dateIso}
                              type="button"
                              disabled={isPast}
                              onClick={() => handleSelectDate(dayNum)}
                              className={`h-8 sm:h-9 w-full flex items-center justify-center text-xs font-sans rounded-full transition-all ${
                                isSelected
                                  ? 'bg-[#C5A869] text-[#080D15] font-semibold shadow-md scale-105'
                                  : isPast
                                  ? 'text-[#FAF8F5]/20 cursor-not-allowed'
                                  : isToday
                                  ? 'border border-[#C5A869]/60 text-[#FAF8F5] hover:bg-[#C5A869]/20 hover:text-[#C5A869] cursor-pointer'
                                  : 'text-[#FAF8F5]/80 hover:bg-[#FAF8F5]/10 hover:text-[#C5A869] cursor-pointer'
                              }`}
                            >
                              {dayNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Bottom action row */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#FAF8F5]/10 text-[11px]">
                        <button
                          type="button"
                          onClick={triggerNativePicker}
                          className="text-[#FAF8F5]/50 hover:text-[#C5A869] transition-colors flex items-center gap-1.5 cursor-pointer text-[10px] uppercase tracking-wider"
                        >
                          <svg className="w-3 h-3 text-[#C5A869]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5" />
                            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="1.5" />
                            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="1.5" />
                          </svg>
                          Device Picker
                        </button>

                        <div className="flex items-center gap-2">
                          {preferredDate && (
                            <button
                              type="button"
                              onClick={() => {
                                setPreferredDate('');
                              }}
                              className="text-[#FAF8F5]/50 hover:text-red-400 text-[10px] uppercase tracking-wider transition-colors cursor-pointer px-2 py-1"
                            >
                              Clear
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsCalendarOpen(false)}
                            className="bg-[#C5A869]/10 hover:bg-[#C5A869]/20 text-[#C5A869] text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-[#C5A869]/30 transition-colors cursor-pointer font-medium"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Date Presets: Pill buttons for fast 1-tap mobile selection */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 overflow-x-auto pb-1 text-[10px] sm:text-[11px]">
                  <span className="text-[#FAF8F5]/40 uppercase tracking-widest text-[9px] shrink-0 mr-1">
                    Quick Pick:
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuickPreset(3)}
                    className="px-3 py-1.5 rounded-full border border-[#FAF8F5]/15 hover:border-[#C5A869] text-[#FAF8F5]/80 hover:text-[#C5A869] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    This Weekend
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickPreset(10)}
                    className="px-3 py-1.5 rounded-full border border-[#FAF8F5]/15 hover:border-[#C5A869] text-[#FAF8F5]/80 hover:text-[#C5A869] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Next Weekend
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickPreset(21)}
                    className="px-3 py-1.5 rounded-full border border-[#FAF8F5]/15 hover:border-[#C5A869] text-[#FAF8F5]/80 hover:text-[#C5A869] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    In 3 Weeks
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickPreset(45)}
                    className="px-3 py-1.5 rounded-full border border-[#FAF8F5]/15 hover:border-[#C5A869] text-[#FAF8F5]/80 hover:text-[#C5A869] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Next Month
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
                {/* Flexibility: exact / flexible as Pills */}
                <div>
                  <span className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70 mb-1.5">
                    Date Flexibility
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDateFlexibility('exact')}
                      className={`min-h-[42px] py-2 px-3 text-[11px] sm:text-xs tracking-wider uppercase border rounded-full transition-all cursor-pointer ${
                        dateFlexibility === 'exact'
                          ? 'border-[#C5A869] bg-[#C5A869]/20 text-[#FAF8F5] font-semibold'
                          : 'border-[#FAF8F5]/15 bg-[#080D15] text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
                      }`}
                    >
                      Exact Date
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateFlexibility('flexible')}
                      className={`min-h-[42px] py-2 px-3 text-[11px] sm:text-xs tracking-wider uppercase border rounded-full transition-all cursor-pointer ${
                        dateFlexibility === 'flexible'
                          ? 'border-[#C5A869] bg-[#C5A869]/20 text-[#FAF8F5] font-semibold'
                          : 'border-[#FAF8F5]/15 bg-[#080D15] text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
                      }`}
                    >
                      Flexible (± Days)
                    </button>
                  </div>
                </div>

                {/* Day of Week: weekday / weekend as Pills */}
                <div>
                  <span className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70 mb-1.5">
                    Day Preference
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setDayPreference('weekend')}
                      className={`min-h-[42px] py-2 px-1 text-[10px] sm:text-[11px] tracking-wider uppercase border rounded-full transition-all cursor-pointer truncate ${
                        dayPreference === 'weekend'
                          ? 'border-[#C5A869] bg-[#C5A869]/20 text-[#FAF8F5] font-semibold'
                          : 'border-[#FAF8F5]/15 bg-[#080D15] text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
                      }`}
                    >
                      Weekend
                    </button>
                    <button
                      type="button"
                      onClick={() => setDayPreference('weekday')}
                      className={`min-h-[42px] py-2 px-1 text-[10px] sm:text-[11px] tracking-wider uppercase border rounded-full transition-all cursor-pointer truncate ${
                        dayPreference === 'weekday'
                          ? 'border-[#C5A869] bg-[#C5A869]/20 text-[#FAF8F5] font-semibold'
                          : 'border-[#FAF8F5]/15 bg-[#080D15] text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
                      }`}
                    >
                      Weekday
                    </button>
                    <button
                      type="button"
                      onClick={() => setDayPreference('no_preference')}
                      className={`min-h-[42px] py-2 px-1 text-[10px] sm:text-[11px] tracking-wider uppercase border rounded-full transition-all cursor-pointer truncate ${
                        dayPreference === 'no_preference'
                          ? 'border-[#C5A869] bg-[#C5A869]/20 text-[#FAF8F5] font-semibold'
                          : 'border-[#FAF8F5]/15 bg-[#080D15] text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
                      }`}
                    >
                      Either
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Group 3: Occasion & Guests */}
          <section className="space-y-3.5 sm:space-y-4">
            <div className="border-b border-[#FAF8F5]/10 pb-1.5 sm:pb-2">
              <h2 className="font-serif text-lg sm:text-xl text-[#FAF8F5] tracking-wide font-normal">
                03. Occasion & Guest Count
              </h2>
            </div>

            {/* Occasion Selection as Pills */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70 mb-1.5">
                Occasion
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ.value}
                    type="button"
                    onClick={() => setOccasion(occ.value)}
                    className={`min-h-[42px] p-2.5 sm:p-3 text-center border rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                      occasion === occ.value
                        ? 'border-[#C5A869] bg-[#C5A869]/20 text-[#FAF8F5] font-semibold'
                        : 'border-[#FAF8F5]/15 bg-[#080D15] text-[#FAF8F5]/70 hover:border-[#FAF8F5]/30'
                    }`}
                  >
                    {occ.label}
                  </button>
                ))}
              </div>
              {occasion === 'other' && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    placeholder="Tell us about the occasion..."
                    value={occasionDetails}
                    onChange={(e) => setOccasionDetails(e.target.value)}
                    className="w-full bg-[#080D15] border border-[#FAF8F5]/20 focus:border-[#C5A869] text-[#FAF8F5] px-4 py-2.5 text-xs focus:outline-none rounded-full"
                  />
                </div>
              )}
            </div>

            {/* Guests (number, max 45) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70">
                  Guests: <span className="text-[#C5A869] font-medium text-sm tabular-nums">{guests}</span>
                </label>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#FAF8F5]/40 font-light">
                  Max 45 capacity
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="45"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-[#FAF8F5]/20 accent-[#C5A869] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] sm:text-[10px] text-[#FAF8F5]/40 mt-1 tabular-nums">
                <span>1 Guest</span>
                <span>15</span>
                <span>30</span>
                <span>45 Guests (Strict vessel limit)</span>
              </div>
            </div>
          </section>

          {/* Group 4: Duration & Departure */}
          <section className="space-y-3.5 sm:space-y-4">
            <div className="border-b border-[#FAF8F5]/10 pb-1.5 sm:pb-2">
              <h2 className="font-serif text-lg sm:text-xl text-[#FAF8F5] tracking-wide font-normal">
                04. Duration & Departure
              </h2>
            </div>

            {/* Duration as Pills */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70">
                  Duration
                </label>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#C5A869] font-light">
                  3-hour min applies
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.value}
                    type="button"
                    onClick={() => setDuration(dur.value)}
                    className={`min-h-[44px] py-2 px-3 text-center border rounded-full text-xs tracking-wider transition-all cursor-pointer ${
                      duration === dur.value
                        ? 'border-[#C5A869] bg-[#C5A869]/20 text-[#FAF8F5] font-semibold'
                        : 'border-[#FAF8F5]/15 bg-[#080D15] text-[#FAF8F5]/65 hover:border-[#FAF8F5]/30'
                    }`}
                  >
                    <span className="truncate">{dur.label}</span>
                    {dur.note && (
                      <span className="text-[8px] sm:text-[9px] text-[#C5A869]/80 uppercase tracking-widest block -mt-0.5">
                        {dur.note}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Departure as Pills */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70 mb-1.5">
                Preferred Departure Port
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {DEPARTURES.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setDeparture(loc)}
                    className={`min-h-[42px] py-2 px-3 text-center border rounded-full text-[11px] sm:text-xs tracking-wider transition-all cursor-pointer truncate ${
                      departure === loc
                        ? 'border-[#C5A869] bg-[#C5A869]/20 text-[#FAF8F5] font-semibold'
                        : 'border-[#FAF8F5]/15 bg-[#080D15] text-[#FAF8F5]/65 hover:border-[#FAF8F5]/30'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Group 5: Catering & Drinks Hospitality as Pills */}
          <section className="space-y-3.5 sm:space-y-4">
            <div className="border-b border-[#FAF8F5]/10 pb-1.5 sm:pb-2">
              <h2 className="font-serif text-lg sm:text-xl text-[#FAF8F5] tracking-wide font-normal">
                05. Hospitality & Add-Ons
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {/* Food */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70 mb-1.5">
                  Food & Dining
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFood('catered')}
                    className={`min-h-[46px] py-2 px-3 text-center border rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                      food === 'catered'
                        ? 'border-[#C5A869] bg-[#C5A869]/20 text-[#FAF8F5] font-semibold'
                        : 'border-[#FAF8F5]/15 bg-[#080D15] text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
                    }`}
                  >
                    <div>Catered</div>
                    <span className="text-[8px] sm:text-[9px] text-[#FAF8F5]/40 block -mt-0.5">Chef prepared</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFood('byo')}
                    className={`min-h-[46px] py-2 px-3 text-center border rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                      food === 'byo'
                        ? 'border-[#C5A869] bg-[#C5A869]/20 text-[#FAF8F5] font-semibold'
                        : 'border-[#FAF8F5]/15 bg-[#080D15] text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
                    }`}
                  >
                    <div>BYO</div>
                    <span className="text-[8px] sm:text-[9px] text-[#FAF8F5]/40 block -mt-0.5">Bring your own</span>
                  </button>
                </div>
              </div>

              {/* Drinks */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70 mb-1.5">
                  Beverages
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDrinks('drinks_package')}
                    className={`min-h-[46px] py-2 px-3 text-center border rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                      drinks === 'drinks_package'
                        ? 'border-[#C5A869] bg-[#C5A869]/20 text-[#FAF8F5] font-semibold'
                        : 'border-[#FAF8F5]/15 bg-[#080D15] text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
                    }`}
                  >
                    <div>Drinks Pkg</div>
                    <span className="text-[8px] sm:text-[9px] text-[#FAF8F5]/40 block -mt-0.5">Champagne/wines</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrinks('byo')}
                    className={`min-h-[46px] py-2 px-3 text-center border rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                      drinks === 'byo'
                        ? 'border-[#C5A869] bg-[#C5A869]/20 text-[#FAF8F5] font-semibold'
                        : 'border-[#FAF8F5]/15 bg-[#080D15] text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
                    }`}
                  >
                    <div>BYO Drinks</div>
                    <span className="text-[8px] sm:text-[9px] text-[#FAF8F5]/40 block -mt-0.5">No red wine</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Add-ons as rounded pill rows */}
            <div className="pt-2">
              <label className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70 mb-1.5">
                Curated Add-Ons (Optional)
              </label>
              <div className="space-y-1.5 sm:space-y-2">
                {ADD_ONS.map((addon) => {
                  const isChecked = selectedAddOns.includes(addon.id);
                  return (
                    <label
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={`min-h-[46px] flex items-center justify-between px-4 sm:px-5 py-2.5 border rounded-full transition-colors cursor-pointer select-none ${
                        isChecked
                          ? 'border-[#C5A869] bg-[#C5A869]/15 text-[#FAF8F5]'
                          : 'border-[#FAF8F5]/10 bg-[#080D15] text-[#FAF8F5]/75 hover:border-[#FAF8F5]/25'
                      }`}
                    >
                      <span className="text-xs tracking-wide pr-2">{addon.label}</span>
                      <div className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center ${
                        isChecked ? 'border-[#C5A869] bg-[#C5A869]' : 'border-[#FAF8F5]/30'
                      }`}>
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 text-[#080D15] stroke-current stroke-3" viewBox="0 0 24 24" fill="none">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Group 6: Notes */}
          <section className="space-y-3.5 sm:space-y-4">
            <div className="border-b border-[#FAF8F5]/10 pb-1.5 sm:pb-2">
              <h2 className="font-serif text-lg sm:text-xl text-[#FAF8F5] tracking-wide font-normal">
                06. Tailored Requests & Notes
              </h2>
            </div>

            <div>
              <label htmlFor="notes" className="block text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#FAF8F5]/70 mb-1">
                Anything else we should know?
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Special timing, music preferences, guest of honor details, anchor spot requests off Sorrento or Portsea..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#080D15] border border-[#FAF8F5]/20 focus:border-[#C5A869] text-[#FAF8F5] px-4 py-3 text-sm focus:outline-none transition-colors placeholder-[#FAF8F5]/30 font-light rounded-2xl"
              />
            </div>
          </section>

          {/* Submit Button as Pill */}
          <div className="pt-2 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[50px] py-3.5 sm:py-4 px-6 bg-[#C5A869] hover:bg-[#D4AF37] text-[#080D15] text-xs font-sans tracking-[0.2em] sm:tracking-[0.25em] uppercase font-bold transition-all duration-300 shadow-xl cursor-pointer disabled:opacity-50 rounded-full"
            >
              {isSubmitting ? 'Submitting Request...' : 'REQUEST A QUOTE'}
            </button>
            <p className="mt-2.5 text-[10px] sm:text-[11px] text-[#FAF8F5]/45 tracking-wider font-light">
              We respect your privacy. No obligation. Personalised quote provided within 24 hours.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
