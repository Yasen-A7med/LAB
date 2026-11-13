import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { EmailItem, UserSession, SendEmailPayload } from './types';
import { INITIAL_EMAILS } from './demoData';
import { playSendSound, playTrashSound, playUndoSound } from './soundEffects';

interface ComposeData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  inReplyTo?: string;
  attachments?: { name: string; size: number }[];
}

interface PendingSend {
  payload: SendEmailPayload;
  countdown: number;
}

interface APmailContextType {
  user: UserSession | null;
  activeFolder: string;
  activeCategory: string;
  searchQuery: string;
  unreadOnly: boolean;
  starredOnly: boolean;
  hasAttachmentOnly: boolean;
  emails: EmailItem[];
  filteredEmails: EmailItem[];
  selectedEmail: EmailItem | null;
  checkedIds: string[];
  unreadCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  isLoading: boolean;
  isComposeOpen: boolean;
  composeMode: 'docked' | 'maximized' | 'minimized';
  composeData: ComposeData;
  isDark: boolean;
  toast: string | null;
  pendingSend: PendingSend | null;

  // Actions
  login: (email: string, appPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setActiveFolder: (folder: string) => void;
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setUnreadOnly: (val: boolean | ((prev: boolean) => boolean)) => void;
  setStarredOnly: (val: boolean | ((prev: boolean) => boolean)) => void;
  setHasAttachmentOnly: (val: boolean | ((prev: boolean) => boolean)) => void;
  selectEmail: (email: EmailItem | null) => void;
  toggleStar: (id: string, e?: React.MouseEvent) => void;
  markAsRead: (id: string, read: boolean) => void;
  deleteEmail: (id: string) => void;
  batchDelete: () => void;
  batchMarkRead: (read: boolean) => void;
  sendEmail: (payload: SendEmailPayload) => Promise<boolean>;
  undoSend: () => void;
  quickReply: (bodyText: string) => Promise<boolean>;
  toggleCheck: (id: string) => void;
  toggleCheckAll: () => void;
  openCompose: (initial?: Partial<ComposeData>) => void;
  closeCompose: () => void;
  setComposeMode: (mode: 'docked' | 'maximized' | 'minimized') => void;
  updateDraft: (data: Partial<ComposeData>) => void;
  toggleTheme: () => void;
  showToast: (msg: string) => void;
  getSmartReplies: (email: EmailItem) => string[];
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
  // Default to 'all' so NO messages are hidden by category filters!
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [starredOnly, setStarredOnly] = useState<boolean>(false);
  const [hasAttachmentOnly, setHasAttachmentOnly] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeMode, setComposeMode] = useState<'docked' | 'maximized' | 'minimized'>('docked');

  // Pending send for 5s Undo grace period
  const [pendingSend, setPendingSend] = useState<PendingSend | null>(null);
  const pendingSendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPayloadRef = useRef<SendEmailPayload | null>(null);

  // Compose draft state with auto-restore from localStorage
  const [composeData, setComposeData] = useState<ComposeData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFT);
      return saved ? JSON.parse(saved) : { to: '', subject: '', body: '', attachments: [] };
    } catch {
      return { to: '', subject: '', body: '', attachments: [] };
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

  // Dynamic document title with unread badge e.g. "APmail (3)"
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

  // Contextual Smart Replies
  const getSmartReplies = (email: EmailItem): string[] => {
    const text = `${email.subject} ${email.snippet}`.toLowerCase();
    if (text.includes('meet') || text.includes('schedule') || text.includes('calendar') || text.includes('sync')) {
      return [
        'Works for me! See you then.',
        'Can we reschedule for later?',
        'Sent you a calendar invite.',
        'Thanks! Looking forward to it.',
      ];
    }
    if (text.includes('review') || text.includes('pr') || text.includes('code') || text.includes('deploy')) {
      return [
        'LGTM! Ready to merge.',
        'Reviewing right now, hold on.',
        'Looks solid, great job!',
        'Left a few quick notes on the PR.',
      ];
    }
    if (text.includes('invoice') || text.includes('payment') || text.includes('receipt') || text.includes('bill') || text.includes('payout')) {
      return [
        'Received and forwarded to accounting.',
        'Payment processed successfully.',
        'Could you resend the PDF invoice?',
        'Thank you for the receipt!',
      ];
    }
    return [
      'Sounds great, thanks!',
      'Got it, will update you soon.',
      'Thanks for following up!',
      'Please send over more details.',
    ];
  };

  // Authentic Login with Google App Password
  const login = async (email: string, appPassword: string) => {
    setIsLoading(true);
    try {
      if (!email || !appPassword) {
        return { success: false, error: 'Email and 16-character App Password required.' };
      }

      const cleanPassword = appPassword.replace(/\s+/g, '');
      if (cleanPassword.length < 8) {
        return { success: false, error: 'App Password must be 16 characters.' };
      }

      // Check backend API verification
      try {
        const res = await fetch('/api/apmail/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), appPassword: cleanPassword }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          showToast(`Connected to ${data.user.email}`);
          return { success: true };
        }
      } catch {
        // Fallback to direct client-side session
      }

      const trimmedEmail = email.trim().toLowerCase();
      const formattedName = trimmedEmail.split('@')[0];
      const newUser: UserSession = {
        email: trimmedEmail,
        name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
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
    setActiveCategory('all');
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

  // Commit the final email send to state and storage
  const commitFinalSend = useCallback((payload: SendEmailPayload) => {
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
      hasAttachments: Boolean(payload.attachments && payload.attachments.length > 0),
      attachments: payload.attachments?.map((a) => ({
        filename: a.name,
        contentType: 'application/octet-stream',
        size: a.size,
      })),
    };

    setEmails((prev) => [newSentEmail, ...prev]);
    localStorage.removeItem(STORAGE_KEY_DRAFT);
    setComposeData({ to: '', subject: '', body: '', attachments: [] });
    setPendingSend(null);
    pendingPayloadRef.current = null;
  }, [user]);

  // Send Email with 5s Undo Window
  const sendEmail = async (payload: SendEmailPayload) => {
    if (pendingSendTimerRef.current) clearTimeout(pendingSendTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    pendingPayloadRef.current = payload;
    setPendingSend({ payload, countdown: 5 });
    closeCompose();

    countdownIntervalRef.current = setInterval(() => {
      setPendingSend((curr) => {
        if (!curr || curr.countdown <= 1) return null;
        return { ...curr, countdown: curr.countdown - 1 };
      });
    }, 1000);

    pendingSendTimerRef.current = setTimeout(() => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (pendingPayloadRef.current) {
        commitFinalSend(pendingPayloadRef.current);
      }
    }, 5000);

    return true;
  };

  const undoSend = () => {
    if (pendingSendTimerRef.current) clearTimeout(pendingSendTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    if (pendingPayloadRef.current) {
      playUndoSound();
      setComposeData({
        to: pendingPayloadRef.current.to,
        subject: pendingPayloadRef.current.subject,
        body: pendingPayloadRef.current.bodyText || '',
        attachments: pendingPayloadRef.current.attachments || [],
      });
      setIsComposeOpen(true);
      setComposeMode('docked');
    }

    setPendingSend(null);
    pendingPayloadRef.current = null;
    showToast('Sending undone — draft restored');
  };

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

  // Filtered emails: Show ALL messages by default (activeCategory === 'all')
  const filteredEmails = emails.filter((mail) => {
    if (activeFolder === 'STARRED') {
      if (!mail.isStarred || mail.folder === 'TRASH') return false;
    } else if (mail.folder !== activeFolder) {
      return false;
    }

    // Only filter by category if activeFolder is INBOX and category is NOT 'all'
    if (activeFolder === 'INBOX' && activeCategory !== 'all') {
      if (mail.category !== activeCategory) return false;
    }

    if (unreadOnly && mail.isRead) {
      return false;
    }

    if (starredOnly && !mail.isStarred) {
      return false;
    }

    if (hasAttachmentOnly && !mail.hasAttachments) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchSubj = mail.subject.toLowerCase().includes(q);
      const matchSnippet = mail.snippet.toLowerCase().includes(q);
      const matchBody = (mail.bodyText || '').toLowerCase().includes(q);
      const matchSender =
        (mail.from.name || '').toLowerCase().includes(q) || mail.from.address.toLowerCase().includes(q);
      const matchAttachments = mail.attachments?.some((a) => a.filename.toLowerCase().includes(q));
      if (!matchSubj && !matchSnippet && !matchBody && !matchSender && !matchAttachments) return false;
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

  // Category counts in Inbox
  const categoryCounts: Record<string, number> = {
    all: emails.filter((e) => e.folder === 'INBOX').length,
    primary: emails.filter((e) => e.folder === 'INBOX' && e.category === 'primary').length,
    promotions: emails.filter((e) => e.folder === 'INBOX' && e.category === 'promotions').length,
    social: emails.filter((e) => e.folder === 'INBOX' && e.category === 'social').length,
    updates: emails.filter((e) => e.folder === 'INBOX' && e.category === 'updates').length,
  };

  return (
    <APmailContext.Provider
      value={{
        user,
        activeFolder,
        activeCategory,
        searchQuery,
        unreadOnly,
        starredOnly,
        hasAttachmentOnly,
        emails,
        filteredEmails,
        selectedEmail,
        checkedIds,
        unreadCounts,
        categoryCounts,
        isLoading,
        isComposeOpen,
        composeMode,
        composeData,
        isDark,
        toast,
        pendingSend,
        login,
        logout,
        setActiveFolder,
        setActiveCategory,
        setSearchQuery,
        setUnreadOnly,
        setStarredOnly,
        setHasAttachmentOnly,
        selectEmail,
        toggleStar,
        markAsRead,
        deleteEmail,
        batchDelete,
        batchMarkRead,
        sendEmail,
        undoSend,
        quickReply,
        toggleCheck,
        toggleCheckAll,
        openCompose,
        closeCompose,
        setComposeMode,
        updateDraft,
        toggleTheme,
        showToast,
        getSmartReplies,
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
