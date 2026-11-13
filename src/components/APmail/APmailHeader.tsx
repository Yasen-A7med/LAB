import React, { useState, useRef, useEffect } from 'react';
import { useAPmail } from './APmailContext';
import {
  Menu,
  Search,
  X,
  Sun,
  Moon,
  ArrowLeft,
  LogOut,
  Mail,
} from 'lucide-react';

interface Props {
  onBack?: () => void;
  onToggleSidebar: () => void;
}

export const APmailHeader: React.FC<Props> = ({ onBack, onToggleSidebar }) => {
  const { user, logout, searchQuery, setSearchQuery, isDark, toggleTheme, unreadOnly, setUnreadOnly } = useAPmail();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="h-14 w-full flex items-center justify-between px-3 bg-[#f6f8fc] dark:bg-[#14171a] border-b border-gray-200/50 dark:border-gray-800/60 select-none z-30 transition-colors">
      {/* Left: LAB Back Button + Hamburger + Brand */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            title="Return to LAB Dashboard"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-200/70 hover:bg-gray-300/80 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors mr-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LAB</span>
          </button>
        )}

        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#4285F4" d="M22.5 12c0-.75-.07-1.47-.2-2.17H12v4.11h5.89c-.25 1.37-1.02 2.53-2.17 3.3v2.74h3.51c2.05-1.89 3.27-4.67 3.27-7.98z" />
            <path fill="#34A853" d="M12 22.7c2.9 0 5.33-.96 7.11-2.61l-3.51-2.74c-.96.65-2.2 1.03-3.6 1.03-2.77 0-5.11-1.87-5.95-4.39H2.38v2.83C4.16 20.35 7.82 22.7 12 22.7z" />
            <path fill="#FBBC05" d="M6.05 13.99c-.21-.65-.34-1.34-.34-2.05s.13-1.4.34-2.05V7.06H2.38C1.65 8.52 1.23 10.2 1.23 12s.42 3.48 1.15 4.94l3.67-2.95z" />
            <path fill="#EA4335" d="M12 5.62c1.57 0 2.98.54 4.09 1.6l3.07-3.07C17.32 2.36 14.89 1.3 12 1.3 7.82 1.3 4.16 3.65 2.38 7.06l3.67 2.83c.84-2.52 3.18-4.39 5.95-4.39z" />
          </svg>
          <span className="text-base font-semibold tracking-tight text-gray-800 dark:text-gray-100">
            APmail
          </span>
          {user?.isDemo && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              Demo
            </span>
          )}
        </div>
      </div>

      {/* Middle: Clean Search */}
      <div className="flex-1 max-w-xl px-2 sm:px-4">
        <div className="relative flex items-center w-full">
          <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search mail (/)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-8 bg-[#eaf1fb] dark:bg-[#1e2025] hover:bg-[#e1eaf7] dark:hover:bg-[#262830] focus:bg-white dark:focus:bg-[#262830] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 text-xs rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-0.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Unread toggle chip */}
        <button
          onClick={() => setUnreadOnly((prev) => !prev)}
          title="Toggle unread only"
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
            unreadOnly
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200/60 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Unread</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Light Mode' : 'Dark Mode'}
          className="p-2 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Profile Avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/40 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
              {userInitial}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 p-3 bg-white dark:bg-[#181a20] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-[#22242a] rounded-lg mb-2">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] truncate mt-0.5">{user?.email}</p>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
