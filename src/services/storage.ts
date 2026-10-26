import { DrawEntry, CharterEnquiry } from '../types';

const CRM_WEBHOOK_KEY = 'peninsula_yachts_crm_webhook_url';

export const PROMOTION_CONFIG = {
  drawDate: '31 December 2026',
  closeDate: '31 December 2026 at 11:59 PM AEDT',
  prize: 'A 4-Hour Private Luxury Yacht Charter on Port Phillip Bay for up to 12 guests with Captain and Crew',
  instagramHandle: '@peninsula_yachts',
  instagramUrl: 'https://instagram.com/peninsula_yachts',
  contactEmail: 'peninsulaluxuryyachts@gmail.com',
};

export function getDrawEntries(): DrawEntry[] {
  return [];
}

export async function saveDrawEntry(entryData: Omit<DrawEntry, 'id' | 'timestamp' | 'source'>): Promise<DrawEntry> {
  return {
    ...entryData,
    id: 'entry_' + Date.now(),
    timestamp: new Date().toISOString(),
    source: 'Website'
  };
}

export function getCharterEnquiries(): CharterEnquiry[] {
  return [];
}

export async function saveCharterEnquiry(enquiryData: Omit<CharterEnquiry, 'id' | 'timestamp'>): Promise<CharterEnquiry> {
  const newEnquiry: CharterEnquiry = {
    ...enquiryData,
    id: 'charter_' + Date.now(),
    timestamp: new Date().toISOString()
  };

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
