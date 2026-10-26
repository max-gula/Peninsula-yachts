/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ActivePage } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BrandHome } from './components/home/BrandHome';
import { DrawFunnel } from './components/draw/DrawFunnel';
import { CharterEnquiry } from './components/charter/CharterEnquiry';
import { TermsAndPrivacy } from './components/terms/TermsAndPrivacy';
import { TermsModal } from './components/terms/TermsModal';
import { EntriesDrawer } from './components/admin/EntriesDrawer';
import { getDrawEntries } from './services/storage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<ActivePage>('draw');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'terms' | 'guidelines' | 'privacy'>('terms');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entriesCount, setEntriesCount] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Initial entries count
    const initial = getDrawEntries();
    setEntriesCount(initial.length);
  }, []);

  const refreshCount = () => {
    const list = getDrawEntries();
    setEntriesCount(list.length);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleOpenTermsModal = (tab: 'terms' | 'guidelines' | 'privacy' = 'terms') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080D15] text-[#FAF8F5] font-sans antialiased selection:bg-[#C5A869]/30 selection:text-white">
      {/* Toast Notification for CRM / Database updates */}
      {notification && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 bg-[#0E1624] border border-[#C5A869] p-3 sm:p-4 shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 mt-1 rounded-full bg-[#C5A869] shrink-0" />
            <div className="text-xs text-[#FAF8F5]">
              <p className="font-medium text-[#C5A869] uppercase tracking-wider text-[10px]">Database Recorded</p>
              <p className="mt-0.5 text-[#FAF8F5]/85 leading-snug">{notification}</p>
            </div>
          </div>
        </div>
      )}

      {/* Global Top Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        entriesCount={entriesCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Brand Home (Reached when clicking the logo) */}
        {currentPage === 'home' && (
          <BrandHome
            onNavigate={(page) => setCurrentPage(page)}
          />
        )}

        {/* Enter the Draw Funnel */}
        {currentPage === 'draw' && (
          <DrawFunnel
            onNavigate={(page) => setCurrentPage(page)}
            onOpenTerms={() => handleOpenTermsModal('terms')}
            onOpenPrivacy={() => handleOpenTermsModal('privacy')}
            onSubmissionSuccess={() => {
              refreshCount();
              showToast('Entry securely recorded to database and dispatched to CRM.');
            }}
          />
        )}

        {/* Bespoke Charter Enquiry */}
        {currentPage === 'charters' && (
          <CharterEnquiry
            onSuccess={() => {
              refreshCount();
              showToast('Charter quote request saved to database and sent to team.');
            }}
          />
        )}

        {/* Guidelines & Terms */}
        {currentPage === 'terms' && (
          <TermsAndPrivacy initialTab="terms" />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={(page) => setCurrentPage(page)}
        onOpenTermsModal={() => handleOpenTermsModal('terms')}
        onOpenPrivacyModal={() => handleOpenTermsModal('privacy')}
      />

      {/* Terms & Privacy Quick-view Modal */}
      <TermsModal
        isOpen={isModalOpen}
        initialTab={modalTab}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Admin / CRM Submissions Drawer */}
      <EntriesDrawer
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
