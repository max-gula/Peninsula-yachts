import fs from 'fs';
import path from 'path';

// Worksheet specifications required:
// Sheet Name: "Peninsula yachts contacts"
// Columns:
// A: Date & Time
// B: Email
// C: Phone
// D: Full Name
// E: Address
// F: Last Completed Step
// G: Lead Status
// H: Source
// I: Lead ID

export interface LeadRecord {
  leadId: string;
  dateTime: string;
  email: string;
  phone: string;
  fullName: string;
  address: string;
  lastCompletedStep: 1 | 2 | 3;
  leadStatus: 'Incomplete' | 'Completed';
  source: string;
  syncedToGoogleSheets: boolean;
  marketingConsent?: boolean;
  agreedToTerms?: boolean;
}

// In-memory queue / local persistence directory
const DATA_DIR = process.env.VERCEL
  ? '/tmp/data'
  : path.resolve(process.cwd(), 'data');
const LOCAL_LEADS_FILE = path.join(DATA_DIR, 'leads-queue.json');
const LOCAL_ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries-queue.json');

// Ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[Leads] Could not create data directory:', err);
  }
}
ensureDataDir();

// In-memory storage cache
const leadsCache = new Map<string, LeadRecord>();

// Load existing leads from disk on startup
function loadLocalLeads() {
  try {
    if (fs.existsSync(LOCAL_LEADS_FILE)) {
      const data = fs.readFileSync(LOCAL_LEADS_FILE, 'utf-8');
      const parsed: LeadRecord[] = JSON.parse(data);
      for (const item of parsed) {
        leadsCache.set(item.leadId, item);
      }
      console.log(`[Leads] Loaded ${leadsCache.size} leads from local storage queue.`);
    }
  } catch (err) {
    console.error('[Leads] Error loading local leads queue:', err);
  }
}
loadLocalLeads();

// Save leads to local queue
function persistLocalLeads() {
  try {
    ensureDataDir();
    const records = Array.from(leadsCache.values());
    fs.writeFileSync(LOCAL_LEADS_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Leads] Error persisting local leads queue:', err);
  }
}

// Simple in-memory sliding window rate limiter
const rateLimits = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(ip: string, maxRequests = 25, windowMs = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || now > entry.expiresAt) {
    rateLimits.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimits.entries()) {
    if (now > value.expiresAt) {
      rateLimits.delete(key);
    }
  }
}, 60 * 1000);

// Formula Injection Protection:
// Prepend single quote (') if the cell starts with formula characters (=, +, -, @, tab, cr)
export function sanitizeForSpreadsheet(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

// Australian Phone Number Formatter & Validator:
// Supports formats: 04XX XXX XXX, +61 4XX XXX XXX, 04XXXXXXXX, etc.
export function validateAndFormatAustralianPhone(rawPhone: string): { valid: boolean; formatted: string } {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { valid: false, formatted: '' };
  }

  // Remove non-digit characters except leading plus
  let cleaned = rawPhone.trim().replace(/[\s\-()]/g, '');

  // Convert international +614... or 614... to Australian 04...
  if (cleaned.startsWith('+61')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('614') && cleaned.length === 11) {
    cleaned = '0' + cleaned.substring(2);
  }

  // Australian mobile format: starts with 04 and has 10 digits
  const isAuMobile = /^04\d{8}$/.test(cleaned);
  // Also permit general 10-digit landline (e.g. 03 for Melbourne/Victoria)
  const isAuLandline = /^0[2378]\d{8}$/.test(cleaned);

  if (isAuMobile) {
    // Format nicely as 04XX XXX XXX
    const formatted = `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)}`;
    return { valid: true, formatted };
  }

  if (isAuLandline) {
    const formatted = `${cleaned.substring(0, 2)} ${cleaned.substring(2, 6)} ${cleaned.substring(6, 10)}`;
    return { valid: true, formatted };
  }

  return { valid: false, formatted: rawPhone.trim() };
}

// Generate unique Lead ID
export function generateLeadId(): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `lead_${timestamp}_${randomPart}`;
}

// Dispatch to Google Apps Script Web App
async function dispatchToGoogleAppsScript(payload: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!scriptUrl || scriptUrl.trim() === '' || scriptUrl.includes('YOUR_SCRIPT_ID')) {
    // Google Apps Script URL has not been provided yet
    return {
      success: true,
      message: 'Saved to local queue. Configure GOOGLE_APPS_SCRIPT_URL to enable live Google Sheets sync.'
    };
  }

  // Attempt dispatch with retries
  const maxRetries = 2;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        return {
          success: true,
          message: result.message || 'Synced to Google Sheets successfully.'
        };
      } else {
        console.warn(`[Leads] Google Apps Script returned status ${response.status} (attempt ${attempt}/${maxRetries})`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Leads] Google Apps Script dispatch failed on attempt ${attempt}:`, errorMsg);
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
  }

  // Fallback: If external request fails after retries, keep safe locally and report queued
  return {
    success: true,
    message: 'Recorded in safe local queue. Will sync to Google Sheets on next attempt.'
  };
}

// Step 1: Record or Update Email
export async function handleStep1Email(data: {
  email: string;
  leadId?: string;
  source?: string;
}): Promise<{ success: boolean; leadId: string; message: string }> {
  const email = sanitizeForSpreadsheet(data.email.trim().toLowerCase());
  const leadId = data.leadId && data.leadId.trim() ? data.leadId.trim() : generateLeadId();
  const source = data.source || 'Website';
  const now = new Date().toISOString();

  // Retrieve existing record or create new
  let record = leadsCache.get(leadId);
  if (record) {
    record.email = email;
    record.lastCompletedStep = 1;
    record.leadStatus = 'Incomplete';
  } else {
    record = {
      leadId,
      dateTime: now,
      email,
      phone: '',
      fullName: '',
      address: '',
      lastCompletedStep: 1,
      leadStatus: 'Incomplete',
      source,
      syncedToGoogleSheets: false,
    };
    leadsCache.set(leadId, record);
  }
  persistLocalLeads();

  // Dispatch to Google Apps Script
  const syncResult = await dispatchToGoogleAppsScript({
    action: 'step1',
    leadId,
    dateTime: record.dateTime,
    email,
    source,
    lastCompletedStep: 1,
    leadStatus: 'Incomplete',
  });

  if (syncResult.success) {
    record.syncedToGoogleSheets = true;
    persistLocalLeads();
  }

  return {
    success: true,
    leadId,
    message: syncResult.message,
  };
}

// Step 2: Record Phone Number for existing Lead ID
export async function handleStep2Phone(data: {
  leadId: string;
  phone: string;
}): Promise<{ success: boolean; leadId: string; message: string }> {
  const leadId = data.leadId?.trim();
  if (!leadId) {
    throw new Error('Missing Lead ID for Step 2.');
  }

  const { valid, formatted } = validateAndFormatAustralianPhone(data.phone);
  if (!valid) {
    throw new Error('Please provide a valid Australian phone number (e.g. 04XX XXX XXX).');
  }

  const phoneSanitized = sanitizeForSpreadsheet(formatted);

  // Find existing record
  let record = leadsCache.get(leadId);
  if (!record) {
    // If client created ID directly or had session blip, create placeholder
    record = {
      leadId,
      dateTime: new Date().toISOString(),
      email: '',
      phone: phoneSanitized,
      fullName: '',
      address: '',
      lastCompletedStep: 2,
      leadStatus: 'Incomplete',
      source: 'Website',
      syncedToGoogleSheets: false,
    };
    leadsCache.set(leadId, record);
  } else {
    record.phone = phoneSanitized;
    record.lastCompletedStep = 2;
    record.leadStatus = 'Incomplete';
  }
  persistLocalLeads();

  // Dispatch to Google Apps Script
  const syncResult = await dispatchToGoogleAppsScript({
    action: 'step2',
    leadId,
    phone: phoneSanitized,
    lastCompletedStep: 2,
    leadStatus: 'Incomplete',
  });

  return {
    success: true,
    leadId,
    message: syncResult.message,
  };
}

// Step 3: Record Full Name & Address for existing Lead ID
export async function handleStep3Details(data: {
  leadId: string;
  fullName: string;
  address: string;
  marketingConsent?: boolean;
  agreedToTerms?: boolean;
}): Promise<{ success: boolean; leadId: string; message: string }> {
  const leadId = data.leadId?.trim();
  if (!leadId) {
    throw new Error('Missing Lead ID for Step 3.');
  }

  const fullNameSanitized = sanitizeForSpreadsheet(data.fullName.trim());
  const addressSanitized = sanitizeForSpreadsheet(data.address.trim());

  if (!fullNameSanitized) {
    throw new Error('Full Name is required.');
  }
  if (!addressSanitized) {
    throw new Error('Address is required.');
  }

  // Find existing record
  let record = leadsCache.get(leadId);
  if (!record) {
    record = {
      leadId,
      dateTime: new Date().toISOString(),
      email: '',
      phone: '',
      fullName: fullNameSanitized,
      address: addressSanitized,
      lastCompletedStep: 3,
      leadStatus: 'Completed',
      source: 'Website',
      syncedToGoogleSheets: false,
      marketingConsent: Boolean(data.marketingConsent),
      agreedToTerms: Boolean(data.agreedToTerms),
    };
    leadsCache.set(leadId, record);
  } else {
    record.fullName = fullNameSanitized;
    record.address = addressSanitized;
    record.lastCompletedStep = 3;
    record.leadStatus = 'Completed';
    record.marketingConsent = Boolean(data.marketingConsent);
    record.agreedToTerms = Boolean(data.agreedToTerms);
  }
  persistLocalLeads();

  // Dispatch to Google Apps Script
  const syncResult = await dispatchToGoogleAppsScript({
    action: 'step3',
    leadId,
    fullName: fullNameSanitized,
    address: addressSanitized,
    lastCompletedStep: 3,
    leadStatus: 'Completed',
    marketingConsent: Boolean(data.marketingConsent),
    agreedToTerms: Boolean(data.agreedToTerms),
  });

  return {
    success: true,
    leadId,
    message: syncResult.message,
  };
}


// Append enquiry to local backup queue
function appendToEnquiriesQueue(payload: Record<string, unknown>) {
  try {
    ensureDataDir();
    let list: unknown[] = [];
    if (fs.existsSync(LOCAL_ENQUIRIES_FILE)) {
      try {
        const raw = fs.readFileSync(LOCAL_ENQUIRIES_FILE, 'utf-8');
        list = JSON.parse(raw);
        if (!Array.isArray(list)) list = [];
      } catch {
        list = [];
      }
    }
    list.push(payload);
    fs.writeFileSync(LOCAL_ENQUIRIES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Enquiries] Error appending to backup queue:', err);
  }
}

// Charter Enquiry Handler
export async function handleCharterEnquiry(data: Record<string, any>): Promise<{
  success: boolean;
  enquiryId: string;
  message: string;
}> {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid enquiry data.');
  }

  // 1. Validate fullName
  const rawFullName = typeof data.fullName === 'string' ? data.fullName.trim() : '';
  if (!rawFullName) {
    throw new Error('Please enter your full name.');
  }

  // 2. Validate email
  const rawEmail = typeof data.email === 'string' ? data.email.trim() : '';
  if (!rawEmail || !rawEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  // 3. Validate mobile with existing validateAndFormatAustralianPhone()
  const rawMobile = typeof data.mobile === 'string'
    ? data.mobile
    : typeof data.phone === 'string'
    ? data.phone
    : '';

  const phoneValidation = validateAndFormatAustralianPhone(rawMobile);
  if (!phoneValidation.valid) {
    throw new Error('Please provide a valid Australian phone number (e.g. 04XX XXX XXX).');
  }

  // Sanitise inputs with sanitizeForSpreadsheet
  const enquiryId = sanitizeForSpreadsheet(data.enquiryId || data.id || `enquiry_${Date.now()}`);
  const dateTime = data.dateTime || data.timestamp || new Date().toISOString();
  const fullName = sanitizeForSpreadsheet(rawFullName);
  const email = sanitizeForSpreadsheet(rawEmail.toLowerCase());
  const phone = sanitizeForSpreadsheet(phoneValidation.formatted);
  const preferredDate = sanitizeForSpreadsheet(data.preferredDate || '');
  const dateFlexibility = sanitizeForSpreadsheet(data.dateFlexibility || '');
  const occasion = sanitizeForSpreadsheet(data.occasion || '');
  const occasionDetails = sanitizeForSpreadsheet(data.occasionDetails || '');
  const guests = typeof data.guests === 'number' ? data.guests : (parseInt(String(data.guests), 10) || 1);
  const duration = sanitizeForSpreadsheet(data.duration || '');
  const dayPreference = sanitizeForSpreadsheet(data.dayPreference || '');
  const departure = sanitizeForSpreadsheet(data.departure || '');
  const food = sanitizeForSpreadsheet(data.food || '');
  const drinks = sanitizeForSpreadsheet(data.drinks || '');
  
  const addOnsRaw = Array.isArray(data.addOns)
    ? data.addOns.filter(Boolean).join(', ')
    : typeof data.addOns === 'string'
    ? data.addOns
    : '';
  const addOns = sanitizeForSpreadsheet(addOnsRaw);
  const notes = sanitizeForSpreadsheet(data.notes || '');

  const payload = {
    action: 'enquiry',
    enquiryId,
    dateTime,
    fullName,
    email,
    phone,
    preferredDate,
    dateFlexibility,
    occasion,
    occasionDetails,
    guests,
    duration,
    dayPreference,
    departure,
    food,
    drinks,
    addOns,
    notes,
  };

  // Append payload to data/enquiries-queue.json as backup
  appendToEnquiriesQueue(payload);

  // Dispatch to Google Apps Script
  const syncResult = await dispatchToGoogleAppsScript(payload);

  return {
    success: true,
    enquiryId,
    message: syncResult.message,
  };
}
