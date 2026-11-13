import React from 'react';
import { useAPmail } from './APmailContext';
import {
  Inbox,
  Star,
  Send,
  FileText,
  Trash2,
  Plus,
  X,
  Archive,
  AlertOctagon,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const APmailSidebar: React.FC<Props> = ({ isOpen, onCloseMobile }) => {
  const { activeFolder, setActiveFolder, unreadCounts, openCompose, selectEmail } = useAPmail();

  const navItems = [
    { id: 'INBOX', name: 'Inbox', icon: Inbox },
    { id: 'STARRED', name: 'Starred', icon: Star },
    { id: 'SENT', name: 'Sent', icon: Send },
    { id: 'DRAFTS', name: 'Drafts', icon: FileText },
    { id: 'ALL', name: 'All Mail', icon: Archive },
    { id: 'SPAM', name: 'Spam', icon: AlertOctagon },
    { id: 'TRASH', name: 'Trash', icon: Trash2 },
  ];

  const handleSelectFolder = (folderId: string) => {
    setActiveFolder(folderId);
    selectEmail(null);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] flex flex-col justify-between transition-all duration-150 ease-in-out shrink-0 select-none py-3 ${
        isOpen ? 'w-64 sm:w-56 px-2' : 'w-16 px-1.5 items-center'
      } bg-[#f6f8fc] dark:bg-[#14171a] border-r border-gray-200/40 dark:border-gray-800/40`}
    >
      <div className="flex flex-col w-full space-y-3">
        {/* Mobile Header in Drawer */}
        {onCloseMobile && (
          <div className="flex sm:hidden items-center justify-between px-3 pb-2 border-b border-gray-200/50 dark:border-gray-800">
            <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Folders</span>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Compose Button (Desktop / Drawer) */}
        <div className={`w-full ${isOpen ? 'px-1' : 'flex justify-center'}`}>
          <button
            onClick={() => {
              openCompose();
              if (onCloseMobile) onCloseMobile();
            }}
            className={`flex items-center gap-3 bg-[#c2e7ff] hover:bg-[#b0dbf8] active:bg-[#9ed0f4] dark:bg-[#22242a] dark:hover:bg-[#2b2e35] text-[#001d35] dark:text-[#c2e7ff] font-medium shadow-2xs hover:shadow-xs transition-all rounded-xl cursor-pointer ${
              isOpen ? 'px-4 py-3 w-full justify-start' : 'w-11 h-11 justify-center rounded-xl'
            }`}
          >
            <Plus className="w-5 h-5 text-gray-800 dark:text-blue-400 stroke-[2.5]" />
            {isOpen && <span className="text-xs font-semibold tracking-wide">Compose</span>}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col space-y-0.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeFolder === item.id;
            const count = unreadCounts[item.id] || 0;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectFolder(item.id)}
                title={!isOpen ? item.name : undefined}
                className={`w-full flex items-center justify-between rounded-lg transition-colors cursor-pointer text-xs font-medium ${
                  isOpen ? 'px-3.5 py-2.5' : 'p-2.5 justify-center'
                } ${
                  isActive
                    ? 'bg-[#d3e3fd] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#001d35] dark:text-[#c2e7ff]' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  />
                  {isOpen && <span>{item.name}</span>}
                </div>

                {isOpen && count > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive
                        ? 'text-[#001d35] dark:text-[#c2e7ff]'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {isOpen && (
        <div className="px-3 py-2 text-[10px] text-gray-400 dark:text-gray-500 border-t border-gray-200/50 dark:border-gray-800">
          APmail &bull; Secured with App Password
        </div>
      )}
    </aside>
  );
};
