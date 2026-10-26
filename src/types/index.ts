export interface DrawEntry {
  id: string;
  email: string;
  mobile: string;
  fullName: string;
  suburb: string;
  agreedToTerms: boolean;
  marketingConsent: boolean;
  timestamp: string; // ISO string
  source: string;
}

export type OccasionType = 'birthday' | 'corporate' | 'celebration' | 'sunset_cruise' | 'other';
export type DurationOption = '3_hours' | '4_hours' | '5_hours' | '6_hours' | '8_hours' | 'full_day' | 'overnight';
export type DepartureLocation = 'Docklands' | 'Port Melbourne' | 'Mornington' | 'Sorrento' | 'Portsea' | 'No preference';
export type DayPreference = 'weekday' | 'weekend' | 'no_preference';
export type FoodPreference = 'catered' | 'byo';
export type DrinksPreference = 'drinks_package' | 'byo';

export interface CharterEnquiry {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  preferredDate: string;
  dateFlexibility: 'exact' | 'flexible';
  occasion: OccasionType;
  occasionDetails?: string;
  guests: number;
  duration: DurationOption;
  dayPreference: DayPreference;
  departure: DepartureLocation;
  food: FoodPreference;
  drinks: DrinksPreference;
  addOns: string[];
  notes: string;
  timestamp: string; // ISO string
}

export type ActivePage = 'home' | 'draw' | 'charters' | 'terms';
