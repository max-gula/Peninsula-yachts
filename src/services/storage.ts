import { DrawEntry, CharterEnquiry } from '../types';

const DRAW_ENTRIES_KEY = 'peninsula_yachts_draw_entries_v1';
const CHARTER_ENQUIRIES_KEY = 'peninsula_yachts_charters_v1';
const CRM_WEBHOOK_KEY = 'peninsula_yachts_crm_webhook_url';

export const PROMOTION_CONFIG = {
  drawDate: '31 December 2026',
  closeDate: '31 December 2026 at 11:59 PM AEDT',
  prize: 'A 4-Hour Private Luxury Yacht Charter on Port Phillip Bay for up to 12 guests with Captain and Crew',
  instagramHandle: '@peninsula_yachts',
  instagramUrl: 'https://instagram.com/peninsula_yachts',
  contactEmail: 'peninsulaluxuryyachts@gmail.com',
};

// Initial realistic entries for Mornington Peninsula demo
const INITIAL_ENTRIES: DrawEntry[] = [
  {
    id: 'entry_1729001001',
    email: 'c.harrington@toorak.com.au',
    mobile: '0412 884 921',
    fullName: 'Charlotte Harrington',
    suburb: 'Toorak',
    agreedToTerms: true,
    marketingConsent: true,
    timestamp: '2026-10-24T09:14:22.000Z',
    source: 'Instagram'
  },
  {
    id: 'entry_1729001002',
    email: 'marcus.vane@sorrento.co',
    mobile: '0423 559 104',
    fullName: 'Marcus Vane',
    suburb: 'Sorrento',
    agreedToTerms: true,
    marketingConsent: false,
    timestamp: '2026-10-24T14:38:10.000Z',
    source: 'Instagram'
  }
];

export function getDrawEntries(): DrawEntry[] {
  try {
    const raw = localStorage.getItem(DRAW_ENTRIES_KEY);
    if (!raw) {
      localStorage.setItem(DRAW_ENTRIES_KEY, JSON.stringify(INITIAL_ENTRIES));
      return INITIAL_ENTRIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading draw entries', err);
    return INITIAL_ENTRIES;
  }
}

export async function saveDrawEntry(entryData: Omit<DrawEntry, 'id' | 'timestamp' | 'source'>): Promise<DrawEntry> {
  const newEntry: DrawEntry = {
    ...entryData,
    id: 'entry_' + Date.now(),
    timestamp: new Date().toISOString(),
    source: 'Website / Instagram Link'
  };

  const existing = getDrawEntries();
  const updated = [newEntry, ...existing];
  try {
    localStorage.setItem(DRAW_ENTRIES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Could not save to localStorage', e);
  }

  // Dispatch to CRM webhook if configured
  await dispatchToCrmWebhook('draw_entry', newEntry);

  return newEntry;
}

export function getCharterEnquiries(): CharterEnquiry[] {
  try {
    const raw = localStorage.getItem(CHARTER_ENQUIRIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading charter enquiries', err);
    return [];
  }
}

export async function saveCharterEnquiry(enquiryData: Omit<CharterEnquiry, 'id' | 'timestamp'>): Promise<CharterEnquiry> {
  const newEnquiry: CharterEnquiry = {
    ...enquiryData,
    id: 'charter_' + Date.now(),
    timestamp: new Date().toISOString()
  };

  const existing = getCharterEnquiries();
  const updated = [newEnquiry, ...existing];
  try {
    localStorage.setItem(CHARTER_ENQUIRIES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Could not save to localStorage', e);
  }

  // Send to backend endpoint which synchronises with Google Sheets
  const response = await fetch('/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newEnquiry),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `Server responded with status ${response.status}`);
  }

  const json = await response.json();
  if (!json || !json.success) {
    throw new Error(json?.error || 'Unable to submit enquiry.');
  }

  return newEnquiry;
}

export function getCrmWebhookUrl(): string {
  return localStorage.getItem(CRM_WEBHOOK_KEY) || '';
}

export function setCrmWebhookUrl(url: string): void {
  localStorage.setItem(CRM_WEBHOOK_KEY, url);
}

export async function dispatchToCrmWebhook(type: 'draw_entry' | 'charter_enquiry', payload: unknown): Promise<{ success: boolean; message: string }> {
  const webhookUrl = getCrmWebhookUrl();
  console.log(`[PENINSULA YACHTS CRM DISPATCH] [${type}]`, payload);

  if (!webhookUrl) {
    return {
      success: true,
      message: 'Saved to local database. (No external CRM Webhook URL configured).'
    };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'Peninsula Yachts Web',
        eventType: type,
        timestamp: new Date().toISOString(),
        data: payload
      })
    });

    if (res.ok) {
      return { success: true, message: 'Dispatched to CRM webhook successfully.' };
    } else {
      return { success: false, message: `Webhook responded with status ${res.status}` };
    }
  } catch (err) {
    console.warn('Webhook dispatch failed (might be CORS or network):', err);
    return { success: false, message: 'CRM Webhook dispatch failed. Saved locally.' };
  }
}

export function exportEntriesCsv(): void {
  const entries = getDrawEntries();
  if (!entries.length) return;

  const headers = ['ID', 'Full Name', 'Email', 'Mobile', 'Suburb', 'Marketing Consent', 'Agreed To Terms', 'Timestamp', 'Source'];
  const rows = entries.map(e => [
    e.id,
    `"${e.fullName.replace(/"/g, '""')}"`,
    `"${e.email}"`,
    `"${e.mobile}"`,
    `"${e.suburb.replace(/"/g, '""')}"`,
    e.marketingConsent ? 'YES' : 'NO',
    e.agreedToTerms ? 'YES' : 'NO',
    e.timestamp,
    `"${e.source}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `peninsula_yachts_draw_entries_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
