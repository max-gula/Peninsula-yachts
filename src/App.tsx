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

  useEffect(() => {
    // Initial entries count
    const initial = getDrawEntries();
    setEntriesCount(initial.length);
  }, []);

  const refreshCount = () => {
    const list = getDrawEntries();
    setEntriesCount(list.length);
  };

  const handleOpenTermsModal = (tab: 'terms' | 'guidelines' | 'privacy' = 'terms') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080D15] text-[#FAF8F5] font-sans antialiased selection:bg-[#C5A869]/30 selection:text-white">
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
            }}
          />
        )}

        {/* Bespoke Charter Enquiry */}
        {currentPage === 'charters' && (
          <CharterEnquiry
            onSuccess={() => {
              refreshCount();
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
