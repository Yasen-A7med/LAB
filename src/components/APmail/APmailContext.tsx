import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { EmailItem, UserSession, SendEmailPayload } from './types';
import { INITIAL_EMAILS } from './demoData';
import { playSendSound, playTrashSound } from './soundEffects';

interface ComposeData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  inReplyTo?: string;
}

interface APmailContextType {
  user: UserSession | null;
  activeFolder: string;
  activeCategory: string;
  searchQuery: string;
  unreadOnly: boolean;
  emails: EmailItem[];
  filteredEmails: EmailItem[];
  selectedEmail: EmailItem | null;
  checkedIds: string[];
  unreadCounts: Record<string, number>;
  isLoading: boolean;
  isComposeOpen: boolean;
  composeMode: 'docked' | 'maximized' | 'minimized';
  composeData: ComposeData;
  isDark: boolean;
  toast: string | null;

  // Actions
  login: (email?: string, appPassword?: string, isDemo?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setActiveFolder: (folder: string) => void;
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setUnreadOnly: (unreadOnly: boolean | ((prev: boolean) => boolean)) => void;
  selectEmail: (email: EmailItem | null) => void;
  toggleStar: (id: string, e?: React.MouseEvent) => void;
  markAsRead: (id: string, read: boolean) => void;
  deleteEmail: (id: string) => void;
  batchDelete: () => void;
  batchMarkRead: (read: boolean) => void;
  sendEmail: (payload: SendEmailPayload) => Promise<boolean>;
  quickReply: (bodyText: string) => Promise<boolean>;
  toggleCheck: (id: string) => void;
  toggleCheckAll: () => void;
  openCompose: (initial?: Partial<ComposeData>) => void;
  closeCompose: () => void;
  setComposeMode: (mode: 'docked' | 'maximized' | 'minimized') => void;
  updateDraft: (data: Partial<ComposeData>) => void;
  toggleTheme: () => void;
  showToast: (msg: string) => void;
}

const APmailContext = createContext<APmailContextType | undefined>(undefined);

const STORAGE_KEY_SESSION = 'apmail_user_session';
const STORAGE_KEY_EMAILS = 'apmail_stored_emails';
const STORAGE_KEY_DRAFT = 'apmail_compose_draft';
const STORAGE_KEY_THEME = 'apmail_theme_dark';

export const APmailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [emails, setEmails] = useState<EmailItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EMAILS);
      return saved ? JSON.parse(saved) : INITIAL_EMAILS;
    } catch {
      return INITIAL_EMAILS;
    }
  });

  const [activeFolder, setActiveFolderState] = useState<string>('INBOX');
  const [activeCategory, setActiveCategory] = useState<string>('primary');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeMode, setComposeMode] = useState<'docked' | 'maximized' | 'minimized'>('docked');
  
  // Compose draft state with auto-restore from localStorage
  const [composeData, setComposeData] = useState<ComposeData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFT);
      return saved ? JSON.parse(saved) : { to: '', subject: '', body: '' };
    } catch {
      return { to: '', subject: '', body: '' };
    }
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [toast, setToast] = useState<string | null>(null);

  // Sync emails to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EMAILS, JSON.stringify(emails));
    } catch {
      // quota or private mode
    }
  }, [emails]);

  // Sync session to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
  }, [user]);

  // Sync theme
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, String(isDark));
  }, [isDark]);

  // Dynamic document title with unread badge e.g. "APmail (2)"
  const unreadInboxCount = emails.filter((e) => e.folder === 'INBOX' && !e.isRead).length;
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = unreadInboxCount > 0 ? `APmail (${unreadInboxCount})` : 'APmail';
    }
  }, [unreadInboxCount]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 3000);
  }, []);

  const toggleTheme = () => setIsDark((p) => !p);

  // Login handler (Supports both real App Password and 1-Click Demo)
  const login = async (email?: string, appPassword?: string, isDemo?: boolean) => {
    setIsLoading(true);
    try {
      if (isDemo) {
        const demoUser: UserSession = {
          email: 'alex.developer@gmail.com',
          name: 'Alex Developer',
          isDemo: true,
          createdAt: Date.now(),
        };
        setUser(demoUser);
        showToast('Demo Account Connected');
        return { success: true };
      }

      if (!email || !appPassword) {
        return { success: false, error: 'Email and App Password required.' };
      }

      // Check if backend API is reachable
      try {
        const res = await fetch('/api/apmail/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), appPassword: appPassword.trim() }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          showToast(`Connected to ${data.user.email}`);
          return { success: true };
        }
      } catch {
        // Fallback to direct client-side session if running offline/without API
      }

      const formattedName = email.split('@')[0];
      const newUser: UserSession = {
        email: email.trim().toLowerCase(),
        name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
        isDemo: false,
        createdAt: Date.now(),
      };
      setUser(newUser);
      showToast(`Connected to ${newUser.email}`);
      return { success: true };
    } catch (err: unknown) {
      const error = err as Error;
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSelectedEmail(null);
    setCheckedIds([]);
    showToast('Signed out');
  };

  const setActiveFolder = (folder: string) => {
    setActiveFolderState(folder);
    setSelectedEmail(null);
    setCheckedIds([]);
  };

  const selectEmail = (item: EmailItem | null) => {
    setSelectedEmail(item);
    if (item && !item.isRead) {
      markAsRead(item.id, true);
    }
  };

  const toggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m))
    );
    if (selectedEmail && selectedEmail.id === id) {
      setSelectedEmail((prev) => (prev ? { ...prev, isStarred: !prev.isStarred } : null));
    }
  };

  const markAsRead = (id: string, read: boolean) => {
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: read } : m))
    );
    if (selectedEmail && selectedEmail.id === id) {
      setSelectedEmail((prev) => (prev ? { ...prev, isRead: read } : null));
    }
  };

  const deleteEmail = (id: string) => {
    playTrashSound();
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, folder: 'TRASH' } : m))
    );
    if (selectedEmail && selectedEmail.id === id) {
      setSelectedEmail(null);
    }
    showToast('Moved to Trash');
  };

  const batchDelete = () => {
    if (checkedIds.length === 0) return;
    playTrashSound();
    setEmails((prev) =>
      prev.map((m) => (checkedIds.includes(m.id) ? { ...m, folder: 'TRASH' } : m))
    );
    setCheckedIds([]);
    showToast('Conversations moved to Trash');
  };

  const batchMarkRead = (read: boolean) => {
    if (checkedIds.length === 0) return;
    setEmails((prev) =>
      prev.map((m) => (checkedIds.includes(m.id) ? { ...m, isRead: read } : m))
    );
    setCheckedIds([]);
    showToast(read ? 'Marked as read' : 'Marked as unread');
  };

  // Auto-saving draft
  const updateDraft = (data: Partial<ComposeData>) => {
    setComposeData((prev) => {
      const next = { ...prev, ...data };
      try {
        localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const openCompose = (initial?: Partial<ComposeData>) => {
    if (initial) {
      setComposeData((prev) => ({ ...prev, ...initial }));
    }
    setIsComposeOpen(true);
    setComposeMode('docked');
  };

  const closeCompose = () => {
    setIsComposeOpen(false);
  };

  // Send Email with chime feedback
  const sendEmail = async (payload: SendEmailPayload) => {
    playSendSound();
    const newSentEmail: EmailItem = {
      id: `sent-${Date.now()}`,
      uid: Math.floor(Math.random() * 90000) + 10000,
      from: { name: user?.name || 'You', address: user?.email || 'user@gmail.com' },
      to: [{ address: payload.to }],
      subject: payload.subject,
      snippet: payload.bodyText?.slice(0, 140) || payload.bodyHtml.replace(/<[^>]*>/g, '').slice(0, 140),
      bodyHtml: payload.bodyHtml,
      bodyText: payload.bodyText || payload.bodyHtml.replace(/<[^>]*>/g, ''),
      date: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      folder: 'SENT',
      hasAttachments: false,
    };

    setEmails((prev) => [newSentEmail, ...prev]);
    localStorage.removeItem(STORAGE_KEY_DRAFT);
    setComposeData({ to: '', subject: '', body: '' });
    closeCompose();
    showToast('Message sent');
    return true;
  };

  // Instant Inline Quick Reply
  const quickReply = async (replyText: string) => {
    if (!selectedEmail || !replyText.trim()) return false;
    playSendSound();

    const replySubject = selectedEmail.subject.startsWith('Re:')
      ? selectedEmail.subject
      : `Re: ${selectedEmail.subject}`;

    const newSent: EmailItem = {
      id: `reply-${Date.now()}`,
      uid: Math.floor(Math.random() * 90000) + 10000,
      from: { name: user?.name || 'You', address: user?.email || 'user@gmail.com' },
      to: [selectedEmail.from],
      subject: replySubject,
      snippet: replyText.slice(0, 140),
      bodyText: replyText,
      bodyHtml: `<div><p>${replyText.replace(/\n/g, '<br>')}</p></div>`,
      date: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      folder: 'SENT',
      hasAttachments: false,
    };

    setEmails((prev) => [newSent, ...prev]);
    showToast('Reply dispatched');
    return true;
  };

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleCheckAll = () => {
    const currentList = emails.filter((e) => e.folder === activeFolder);
    if (checkedIds.length === currentList.length && currentList.length > 0) {
      setCheckedIds([]);
    } else {
      setCheckedIds(currentList.map((e) => e.id));
    }
  };

  // Filtered emails based on folder, category, search, and unreadOnly toggle
  const filteredEmails = emails.filter((mail) => {
    if (activeFolder === 'STARRED') {
      if (!mail.isStarred || mail.folder === 'TRASH') return false;
    } else if (mail.folder !== activeFolder) {
      return false;
    }

    if (activeFolder === 'INBOX' && activeCategory !== 'all') {
      if (mail.category && mail.category !== activeCategory) return false;
    }

    if (unreadOnly && mail.isRead) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchSubj = mail.subject.toLowerCase().includes(q);
      const matchSnippet = mail.snippet.toLowerCase().includes(q);
      const matchSender =
        mail.from.name?.toLowerCase().includes(q) || mail.from.address.toLowerCase().includes(q);
      if (!matchSubj && !matchSnippet && !matchSender) return false;
    }

    return true;
  });

  // Dynamic unread count computation
  const unreadCounts: Record<string, number> = {
    INBOX: emails.filter((e) => e.folder === 'INBOX' && !e.isRead).length,
    STARRED: emails.filter((e) => e.isStarred && e.folder !== 'TRASH' && !e.isRead).length,
    SENT: 0,
    DRAFTS: emails.filter((e) => e.folder === 'DRAFTS').length,
    TRASH: 0,
  };

  return (
    <APmailContext.Provider
      value={{
        user,
        activeFolder,
        activeCategory,
        searchQuery,
        unreadOnly,
        emails,
        filteredEmails,
        selectedEmail,
        checkedIds,
        unreadCounts,
        isLoading,
        isComposeOpen,
        composeMode,
        composeData,
        isDark,
        toast,
        login,
        logout,
        setActiveFolder,
        setActiveCategory,
        setSearchQuery,
        setUnreadOnly,
        selectEmail,
        toggleStar,
        markAsRead,
        deleteEmail,
        batchDelete,
        batchMarkRead,
        sendEmail,
        quickReply,
        toggleCheck,
        toggleCheckAll,
        openCompose,
        closeCompose,
        setComposeMode,
        updateDraft,
        toggleTheme,
        showToast,
      }}
    >
      {children}
    </APmailContext.Provider>
  );
};

export const useAPmail = () => {
  const context = useContext(APmailContext);
  if (!context) throw new Error('useAPmail must be used within an APmailProvider');
  return context;
};
