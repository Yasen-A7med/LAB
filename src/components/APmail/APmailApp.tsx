import React, { useState, useEffect } from 'react';
import { APmailProvider, useAPmail } from './APmailContext';
import { APmailLogin } from './APmailLogin';
import { APmailHeader } from './APmailHeader';
import { APmailSidebar } from './APmailSidebar';
import { APmailList } from './APmailList';
import { APmailView } from './APmailView';
import { APmailCompose } from './APmailCompose';

interface APmailAppProps {
  onBack?: () => void;
}

const APmailContent: React.FC<APmailAppProps> = ({ onBack }) => {
  const {
    user,
    selectedEmail,
    selectEmail,
    openCompose,
    toast,
    isDark,
  } = useAPmail();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        openCompose();
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        selectEmail(null);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCompose, selectEmail]);

  if (!user) {
    return <APmailLogin onBack={onBack} />;
  }

  return (
    <div className={`h-screen w-screen flex flex-col bg-[#f6f8fc] dark:bg-[#14171a] text-gray-900 dark:text-gray-100 overflow-hidden font-sans select-none ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <APmailHeader
        onBack={onBack}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        <APmailSidebar isOpen={isSidebarOpen} />

        <main className="flex-1 p-2 sm:pr-3 sm:pb-2 overflow-hidden flex flex-col min-w-0">
          {selectedEmail ? <APmailView /> : <APmailList />}
        </main>
      </div>

      {/* Floating Composer */}
      <APmailCompose />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 left-5 z-50 px-3.5 py-2 rounded-lg bg-[#202124] text-white text-xs font-medium shadow-xl border border-gray-700/60 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
};

export const APmailApp: React.FC<APmailAppProps> = (props) => {
  return (
    <APmailProvider>
      <APmailContent {...props} />
    </APmailProvider>
  );
};

export default APmailApp;
