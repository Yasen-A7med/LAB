import React, { useState, useEffect } from 'react';
import { APmailProvider, useAPmail } from './APmailContext';
import { APmailLogin } from './APmailLogin';
import { APmailHeader } from './APmailHeader';
import { APmailSidebar } from './APmailSidebar';
import { APmailList } from './APmailList';
import { APmailView } from './APmailView';
import { APmailCompose } from './APmailCompose';
import {
  Inbox,
  Star,
  FileText,
  Send,
  Plus,
  RotateCcw,
} from 'lucide-react';

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
    activeFolder,
    setActiveFolder,
    unreadCounts,
    pendingSend,
    undoSend,
    filteredEmails,
    deleteEmail,
    toggleStar,
    toggleCheck,
  } = useAPmail();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Handle responsive resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Keyboard Shortcuts (Gmail style: j/k, o/Enter, u, s, e/#, x, c, /)
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
      } else if (e.key === 'u' || e.key === 'U' || e.key === 'Escape') {
        e.preventDefault();
        selectEmail(null);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (e.key === 'j') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, filteredEmails.length - 1));
      } else if (e.key === 'k') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'o') {
        if (!selectedEmail && focusedIndex >= 0 && focusedIndex < filteredEmails.length) {
          e.preventDefault();
          selectEmail(filteredEmails[focusedIndex]);
        }
      } else if (e.key === 's') {
        e.preventDefault();
        if (selectedEmail) {
          toggleStar(selectedEmail.id);
        } else if (focusedIndex >= 0 && focusedIndex < filteredEmails.length) {
          toggleStar(filteredEmails[focusedIndex].id);
        }
      } else if (e.key === 'x') {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredEmails.length) {
          toggleCheck(filteredEmails[focusedIndex].id);
        }
      } else if (e.key === '#' || e.key === 'e') {
        e.preventDefault();
        if (selectedEmail) {
          deleteEmail(selectedEmail.id);
        } else if (focusedIndex >= 0 && focusedIndex < filteredEmails.length) {
          deleteEmail(filteredEmails[focusedIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCompose, selectEmail, selectedEmail, focusedIndex, filteredEmails, toggleStar, toggleCheck, deleteEmail]);

  if (!user) {
    return <APmailLogin onBack={onBack} />;
  }

  // Mobile Bottom Nav Items
  const mobileNavItems = [
    { id: 'INBOX', label: 'Mail', icon: Inbox, count: unreadCounts.INBOX },
    { id: 'STARRED', label: 'Starred', icon: Star, count: unreadCounts.STARRED },
    { id: 'DRAFTS', label: 'Drafts', icon: FileText, count: unreadCounts.DRAFTS },
    { id: 'SENT', label: 'Sent', icon: Send, count: 0 },
  ];

  return (
    <div className={`h-screen w-screen flex flex-col bg-[#f6f8fc] dark:bg-[#14171a] text-gray-900 dark:text-gray-100 overflow-hidden font-sans select-none ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <APmailHeader
        onBack={onBack}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Drawer Backdrop */}
        {isMobile && isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
          />
        )}

        {/* Sidebar Container */}
        <div
          className={`${
            isMobile
              ? `fixed top-14 left-0 bottom-0 z-50 transform transition-transform duration-200 ease-out shadow-2xl ${
                  isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : 'relative'
          }`}
        >
          <APmailSidebar
            isOpen={isMobile ? true : isSidebarOpen}
            onCloseMobile={() => isMobile && setIsSidebarOpen(false)}
          />
        </div>

        {/* Content Pane */}
        <main className="flex-1 p-1 sm:p-2 sm:pr-3 sm:pb-2 overflow-hidden flex flex-col min-w-0">
          {selectedEmail ? <APmailView /> : <APmailList />}
        </main>
      </div>

      {/* Mobile Floating Action Button (FAB) for Compose */}
      {isMobile && !selectedEmail && (
        <button
          onClick={() => openCompose()}
          className="fixed bottom-18 right-4 z-30 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#c2e7ff] active:bg-[#b0dbf8] dark:bg-[#004a77] dark:active:bg-[#003d63] text-[#001d35] dark:text-[#c2e7ff] font-semibold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Compose</span>
        </button>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <nav className="h-14 shrink-0 bg-white dark:bg-[#181a20] border-t border-gray-200/80 dark:border-gray-800 flex items-center justify-around px-2 z-30 select-none">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeFolder === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveFolder(item.id);
                  selectEmail(null);
                }}
                className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <div className="relative">
                  <div className={`p-1 rounded-full ${isActive ? 'bg-blue-100/60 dark:bg-blue-900/30' : ''}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {item.count > 0 && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-600 text-white">
                      {item.count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Floating Composer (Responsive) */}
      <APmailCompose />

      {/* 5-Second Undo Send Banner Toast */}
      {pendingSend && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#202124] text-white shadow-2xl border border-gray-700 animate-slide-up">
          <span className="text-xs font-medium">
            Message sending... ({pendingSend.countdown}s)
          </span>
          <button
            onClick={undoSend}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* General Notification Toast */}
      {toast && !pendingSend && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-6 z-50 px-4 py-2 rounded-xl bg-[#202124] text-white text-xs font-medium shadow-xl border border-gray-700/60 animate-fade-in">
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
