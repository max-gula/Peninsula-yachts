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

function getPageFromPath(pathname: string): ActivePage {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (cleanPath === '/charters' || cleanPath === '/charter') {
    return 'charters';
  }
  if (cleanPath === '/terms' || cleanPath === '/privacy' || cleanPath === '/guidelines') {
    return 'terms';
  }
  if (cleanPath === '/home' || cleanPath === '/overview') {
    return 'home';
  }
  // "/" = draw
  return 'draw';
}

function getPathFromPage(page: ActivePage): string {
  switch (page) {
    case 'charters':
      return '/charters';
    case 'terms':
      return '/terms';
    case 'home':
      return '/home';
    case 'draw':
    default:
      return '/';
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<ActivePage>(() => {
    if (typeof window !== 'undefined') {
      return getPageFromPath(window.location.pathname);
    }
    return 'draw';
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'terms' | 'guidelines' | 'privacy'>('terms');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entriesCount, setEntriesCount] = useState(0);

  // Synchronise browser URL with History API
  const handleNavigate = (page: ActivePage, replace = false) => {
    setCurrentPage(page);
    const targetPath = getPathFromPage(page);
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState({ page }, '', targetPath);
      } else {
        window.history.pushState({ page }, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle browser back and forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const page = getPageFromPath(window.location.pathname);
      setCurrentPage(page);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Sync initial URL if needed
  useEffect(() => {
    const initialPage = getPageFromPath(window.location.pathname);
    const targetPath = getPathFromPage(initialPage);
    if (window.location.pathname !== targetPath && window.location.pathname === '/draw') {
      window.history.replaceState({ page: initialPage }, '', targetPath);
    }
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
        onNavigate={handleNavigate}
        onOpenAdmin={() => setIsAdminOpen(true)}
        entriesCount={entriesCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Brand Home (Reached when clicking the logo) */}
        {currentPage === 'home' && (
          <BrandHome
            onNavigate={handleNavigate}
          />
        )}

        {/* Enter the Draw Funnel */}
        {currentPage === 'draw' && (
          <DrawFunnel
            onNavigate={handleNavigate}
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
        onNavigate={handleNavigate}
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
