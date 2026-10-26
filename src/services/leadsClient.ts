/**
 * Client-side integration for Peninsula Yachts progressive 3-step lead capture.
 * Automatically communicates with backend /api/leads endpoints, preserves unique
 * Lead ID across steps, and ensures safe retry behavior.
 */

const LEAD_ID_STORAGE_KEY = 'peninsula_lead_id_session_v1';

export function getStoredLeadId(): string | null {
  try {
    return sessionStorage.getItem(LEAD_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredLeadId(id: string): void {
  try {
    sessionStorage.setItem(LEAD_ID_STORAGE_KEY, id);
  } catch {
    // SessionStorage may be unavailable in private browsing
  }
}

export function clearStoredLeadId(): void {
  try {
    sessionStorage.removeItem(LEAD_ID_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

async function postWithRetry<T>(url: string, data: Record<string, unknown>, maxRetries = 2): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || `Server responded with status ${res.status}`);
      }

      if (!json.success) {
        throw new Error(json.error || 'Submission could not be completed.');
      }

      return json as T;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 600 * attempt));
      }
    }
  }

  throw lastError || new Error('Network error. Please try again.');
}

/**
 * Step 1: Submit Email and establish unique Lead ID
 */
export async function submitLeadStep1(email: string): Promise<{ success: boolean; leadId: string }> {
  const existingLeadId = getStoredLeadId();
  const payload: Record<string, unknown> = {
    email: email.trim().toLowerCase(),
    source: 'Aperio Website',
  };

  if (existingLeadId) {
    payload.leadId = existingLeadId;
  }

  const result = await postWithRetry<{ success: boolean; leadId: string }>(
    '/api/leads/step1',
    payload
  );

  if (result.leadId) {
    setStoredLeadId(result.leadId);
  }

  return result;
}

/**
 * Step 2: Submit Phone number for existing Lead ID
 */
export async function submitLeadStep2(
  leadId: string,
  phone: string
): Promise<{ success: boolean; leadId: string }> {
  const result = await postWithRetry<{ success: boolean; leadId: string }>(
    '/api/leads/step2',
    {
      leadId,
      phone: phone.trim(),
    }
  );

  return result;
}

/**
 * Step 3: Submit Full Name and Address to complete lead
 */
export async function submitLeadStep3(params: {
  leadId: string;
  fullName: string;
  address: string;
  marketingConsent?: boolean;
  agreedToTerms: boolean;
}): Promise<{ success: boolean; leadId: string }> {
  const result = await postWithRetry<{ success: boolean; leadId: string }>(
    '/api/leads/step3',
    {
      leadId: params.leadId,
      fullName: params.fullName.trim(),
      address: params.address.trim(),
      marketingConsent: Boolean(params.marketingConsent),
      agreedToTerms: Boolean(params.agreedToTerms),
    }
  );

  // Clear session storage so next visitor gets a fresh ID
  clearStoredLeadId();

  return result;
}
