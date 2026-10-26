import React, { useState, useEffect } from 'react';
import { DrawEntry, CharterEnquiry } from '../../types';
import {
  getDrawEntries,
  getCharterEnquiries,
  exportEntriesCsv,
  getCrmWebhookUrl,
  setCrmWebhookUrl,
  dispatchToCrmWebhook,
} from '../../services/storage';

interface EntriesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EntriesDrawer: React.FC<EntriesDrawerProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<DrawEntry[]>([]);
  const [charters, setCharters] = useState<CharterEnquiry[]>([]);
  const [activeTab, setActiveTab] = useState<'draw' | 'charters' | 'webhook'>('draw');
  const [webhookUrl, setWebhookState] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEntries(getDrawEntries());
      setCharters(getCharterEnquiries());
      setWebhookState(getCrmWebhookUrl());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveWebhook = () => {
    setCrmWebhookUrl(webhookUrl.trim());
    setWebhookStatus('CRM Webhook URL saved successfully.');
    setTimeout(() => setWebhookStatus(null), 3000);
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookStatus(null);
    const testPayload = {
      test: true,
      appName: 'Peninsula Yachts',
      timestamp: new Date().toISOString(),
      sampleEntry: entries[0] || { email: 'peninsulaluxuryyachts@gmail.com', fullName: 'Sample Guest' }
    };
    const res = await dispatchToCrmWebhook('draw_entry', testPayload);
    setIsTestingWebhook(false);
    setWebhookStatus(res.message);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-AU', {
        timeZone: 'Australia/Melbourne',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#080D15] border border-[#C5A869]/40 flex flex-col shadow-2xl text-[#FAF8F5] overflow-hidden">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#FAF8F5]/10 flex items-center justify-between bg-[#0E1624]">
          <div className="flex items-center gap-2.5 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A869] shrink-0" />
            <h3 className="font-serif text-base sm:text-lg tracking-wider font-normal truncate">
              Database & CRM Hub
            </h3>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] p-1 flex items-center justify-center text-[#FAF8F5]/60 hover:text-[#FAF8F5] transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 pt-2 border-b border-[#FAF8F5]/10 text-[11px] sm:text-xs uppercase tracking-widest bg-[#0B131F] gap-2">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('draw')}
              className={`py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'draw'
                  ? 'border-[#C5A869] text-[#C5A869]'
                  : 'border-transparent text-[#FAF8F5]/50 hover:text-[#FAF8F5]'
              }`}
            >
              Draw ({entries.length})
            </button>
            <button
              onClick={() => setActiveTab('charters')}
              className={`py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'charters'
                  ? 'border-[#C5A869] text-[#C5A869]'
                  : 'border-transparent text-[#FAF8F5]/50 hover:text-[#FAF8F5]'
              }`}
            >
              Charters ({charters.length})
            </button>
            <button
              onClick={() => setActiveTab('webhook')}
              className={`py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'webhook'
                  ? 'border-[#C5A869] text-[#C5A869]'
                  : 'border-transparent text-[#FAF8F5]/50 hover:text-[#FAF8F5]'
              }`}
            >
              Webhook Config
            </button>
          </div>

          {activeTab === 'draw' && entries.length > 0 && (
            <button
              onClick={exportEntriesCsv}
              className="px-3 py-1 mb-1.5 sm:mb-0 bg-[#C5A869] text-[#080D15] text-[10px] uppercase tracking-wider font-semibold hover:bg-[#D4AF37] transition-colors cursor-pointer rounded-full"
            >
              Export CSV
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 text-xs font-light">
          {/* TAB 1: DRAW SUBMISSIONS */}
          {activeTab === 'draw' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-[#FAF8F5]/60">
                <span>Stored entries recorded with consent timestamp & location.</span>
                <span className="text-[#C5A869]">Total: {entries.length}</span>
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-12 text-[#FAF8F5]/40">
                  No draw entries submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#FAF8F5]/10">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0E1624] text-[9px] sm:text-[10px] uppercase tracking-widest text-[#FAF8F5]/50 border-b border-[#FAF8F5]/10">
                      <tr>
                        <th className="py-2.5 px-3 whitespace-nowrap">Date / Time (AEST)</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Full Name</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Email</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Mobile</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Address / Suburb</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Marketing Consent</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF8F5]/5">
                      {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-[#0E1624]/50 transition-colors">
                          <td className="py-2.5 px-3 whitespace-nowrap text-[#FAF8F5]/70 tabular-nums font-mono text-[11px]">
                            {formatDate(entry.timestamp)}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-[#FAF8F5] font-normal">
                            {entry.fullName}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-[#FAF8F5]/90">
                            {entry.email}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap tabular-nums font-mono text-[11px]">
                            {entry.mobile}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-[#FAF8F5]/80">
                            {entry.suburb}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {entry.marketingConsent ? (
                              <span className="text-[#C5A869] font-medium">Opted In</span>
                            ) : (
                              <span className="text-[#FAF8F5]/40">No</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-[#FAF8F5]/50">
                            {entry.source}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHARTER ENQUIRIES */}
          {activeTab === 'charters' && (
            <div className="space-y-4">
              {charters.length === 0 ? (
                <div className="text-center py-12 text-[#FAF8F5]/40">
                  No charter quote enquiries submitted yet.
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {charters.map((c) => (
                    <div key={c.id} className="border border-[#FAF8F5]/10 bg-[#0E1624] p-3.5 sm:p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs sm:text-sm font-normal text-[#FAF8F5]">{c.fullName}</span>
                          <span className="text-[#C5A869] text-[11px] sm:text-xs ml-2 sm:ml-3 font-mono block sm:inline">{c.email} · {c.mobile}</span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-[#FAF8F5]/50 font-mono">
                          {formatDate(c.timestamp)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] sm:text-[11px] pt-1.5 text-[#FAF8F5]/70">
                        <div>
                          <span className="text-[#FAF8F5]/40 uppercase text-[8px] sm:text-[9px] block">Occasion</span>
                          <span className="capitalize">{c.occasion.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="text-[#FAF8F5]/40 uppercase text-[8px] sm:text-[9px] block">Date</span>
                          <span>{c.preferredDate} ({c.dateFlexibility})</span>
                        </div>
                        <div>
                          <span className="text-[#FAF8F5]/40 uppercase text-[8px] sm:text-[9px] block">Guests & Duration</span>
                          <span>{c.guests} guests · {c.duration.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="text-[#FAF8F5]/40 uppercase text-[8px] sm:text-[9px] block">Departure</span>
                          <span>{c.departure}</span>
                        </div>
                      </div>

                      <div className="text-[10px] sm:text-[11px] text-[#FAF8F5]/70 pt-1">
                        <span className="text-[#FAF8F5]/40 uppercase text-[8px] sm:text-[9px] block">Hospitality</span>
                        <span>Food: <strong className="text-[#FAF8F5] font-normal">{c.food}</strong> | Drinks: <strong className="text-[#FAF8F5] font-normal">{c.drinks}</strong> | Add-ons: {c.addOns.length ? c.addOns.join(', ') : 'None'}</span>
                      </div>

                      {c.notes && (
                        <div className="pt-2 border-t border-[#FAF8F5]/10 text-xs text-[#FAF8F5]/80 italic">
                          "{c.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WEBHOOK CONFIG */}
          {activeTab === 'webhook' && (
            <div className="space-y-4 sm:space-y-6 max-w-xl">
              <div>
                <h4 className="font-serif text-sm sm:text-base text-[#FAF8F5] mb-1 font-normal">
                  CRM / Email Webhook Destination
                </h4>
                <p className="text-[11px] sm:text-xs text-[#FAF8F5]/60 font-light leading-relaxed">
                  Every draw submission and charter quote request automatically saves to the internal database. To also push records in real time to Zapier, Make, HubSpot, or your custom CRM webhook, enter the endpoint below.
                </p>
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-sans tracking-wider uppercase text-[#FAF8F5]/70 mb-1.5">
                  Webhook URL (POST)
                </label>
                <input
                  type="url"
                  placeholder="https://hooks.zapier.com/hooks/catch/... or https://hook.eu1.make.com/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookState(e.target.value)}
                  className="w-full bg-[#080D15] border border-[#FAF8F5]/20 focus:border-[#C5A869] text-[#FAF8F5] px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveWebhook}
                  className="px-5 py-2.5 bg-[#C5A869] hover:bg-[#D4AF37] text-[#080D15] font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer rounded-full"
                >
                  Save URL
                </button>
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  className="px-5 py-2.5 border border-[#C5A869]/40 hover:border-[#C5A869] text-[#C5A869] text-xs tracking-wider uppercase transition-colors disabled:opacity-50 cursor-pointer rounded-full"
                >
                  {isTestingWebhook ? 'Sending...' : 'Test Payload'}
                </button>
              </div>

              {webhookStatus && (
                <div className="p-3 bg-[#0E1624] border border-[#C5A869]/40 text-xs text-[#FAF8F5] tracking-wide">
                  {webhookStatus}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
