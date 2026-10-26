import express, { Express, Request, Response } from 'express';
import {
  handleStep1Email,
  handleStep2Phone,
  handleStep3Details,
  handleCharterEnquiry,
  checkRateLimit,
} from './leads.js';

// Helper for client IP
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export function registerApi(app: Express): Express {
  // Trust proxy for IP rate limiting behind Cloud Run / Vercel / reverse proxies
  app.set('trust proxy', 1);

  // Parse JSON payloads
  app.use(express.json({ limit: '1mb' }));

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Peninsula Yachts API',
      timestamp: new Date().toISOString(),
      googleSheetsConfigured: Boolean(
        process.env.GOOGLE_APPS_SCRIPT_URL &&
        !process.env.GOOGLE_APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID')
      ),
    });
  });

  // Step 1: Email Submission & Lead ID Creation
  app.post('/api/leads/step1', async (req: Request, res: Response) => {
    try {
      const clientIp = getClientIp(req);
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests. Please wait a moment and try again.'
        });
      }

      // Honeypot spam check
      if (req.body.website_hp) {
        return res.json({ success: true, leadId: 'lead_verified' });
      }

      const { email, leadId, source } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address.'
        });
      }

      const result = await handleStep1Email({
        email,
        leadId,
        source: source || 'Website',
      });

      return res.json(result);
    } catch (err: unknown) {
      console.error('[API /api/leads/step1 error]', err);
      const message = err instanceof Error ? err.message : 'Failed to record step 1.';
      return res.status(500).json({ success: false, error: message });
    }
  });

  // Step 2: Phone Number Update
  app.post('/api/leads/step2', async (req: Request, res: Response) => {
    try {
      const clientIp = getClientIp(req);
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests. Please wait a moment and try again.'
        });
      }

      if (req.body.website_hp) {
        return res.json({ success: true, leadId: req.body.leadId });
      }

      const { leadId, phone } = req.body;
      if (!leadId || typeof leadId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing Lead ID. Please start from Step 1.'
        });
      }

      if (!phone || typeof phone !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid mobile number.'
        });
      }

      const result = await handleStep2Phone({ leadId, phone });
      return res.json(result);
    } catch (err: unknown) {
      console.error('[API /api/leads/step2 error]', err);
      const message = err instanceof Error ? err.message : 'Failed to record phone.';
      return res.status(400).json({ success: false, error: message });
    }
  });

  // Step 3: Full Name, Address, and Completion
  app.post('/api/leads/step3', async (req: Request, res: Response) => {
    try {
      const clientIp = getClientIp(req);
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests. Please wait a moment and try again.'
        });
      }

      if (req.body.website_hp) {
        return res.json({ success: true, leadId: req.body.leadId });
      }

      const { leadId, fullName, address, marketingConsent, agreedToTerms } = req.body;
      if (!leadId || typeof leadId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing Lead ID. Please start from Step 1.'
        });
      }

      if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Please enter your full name.'
        });
      }

      if (!address || typeof address !== 'string' || !address.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Please enter your address or suburb.'
        });
      }

      const result = await handleStep3Details({
        leadId,
        fullName,
        address,
        marketingConsent: Boolean(marketingConsent),
        agreedToTerms: Boolean(agreedToTerms),
      });

      return res.json(result);
    } catch (err: unknown) {
      console.error('[API /api/leads/step3 error]', err);
      const message = err instanceof Error ? err.message : 'Failed to complete entry.';
      return res.status(500).json({ success: false, error: message });
    }
  });

  // Charter Enquiry Submission
  app.post('/api/enquiry', async (req: Request, res: Response) => {
    try {
      const clientIp = getClientIp(req);
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests. Please wait a moment and try again.'
        });
      }

      if (req.body.website_hp) {
        return res.json({ success: true });
      }

      const result = await handleCharterEnquiry(req.body);
      return res.json(result);
    } catch (err: unknown) {
      console.error('[API /api/enquiry error]', err);
      const message = err instanceof Error ? err.message : 'Failed to record charter enquiry.';
      return res.status(400).json({ success: false, error: message });
    }
  });

  return app;
}

export function createApiApp(): Express {
  const app = express();
  registerApi(app);
  return app;
}
