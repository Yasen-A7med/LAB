import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Sun, 
  Moon, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Info,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import type { ChatSession, ChatMessage, MediaAttachment } from './types';
import { processWhatsAppFile, revokeMediaUrls } from './zipHandler';
import { ChatBubble } from './ChatBubble';
import { ChatInfoSidebar } from './ChatInfoSidebar';
import { MediaModal } from './MediaModal';

interface WhatsAppViewerAppProps {
  onBack: () => void;
}

export const WhatsAppViewerApp: React.FC<WhatsAppViewerAppProps> = ({ onBack }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<{ percent: number; statusText: string }>({
    percent: 0,
    statusText: '',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filters
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);

  // Sidebar & Modals
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaAttachment | null>(null);
  const [showExportGuide, setShowExportGuide] = useState(false);

  // Drag & drop highlight
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Cleanup Blob URLs on unmount
  useEffect(() => {
    return () => {
      if (session) {
        revokeMediaUrls(session.mediaMap);
      }
    };
  }, [session]);

  const isDark = theme === 'dark';

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Handle File Input Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await loadFile(file);
  };

  // Load File (ZIP or TXT)
  const loadFile = async (file: File | Blob, customName?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStatus({ percent: 0, statusText: 'Initializing...' });

    try {
      if (session) {
        revokeMediaUrls(session.mediaMap);
      }
      const newSession = await processWhatsAppFile(
        file,
        customName || (file instanceof File ? file.name : 'WhatsApp Chat.zip'),
        (p) => setLoadingStatus(p)
      );
      setSession(newSession);
      setIsLoading(false);
      // Auto-scroll to bottom after render
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);
    } catch (err: any) {
      console.error('Failed to parse WhatsApp file:', err);
      setErrorMsg(err.message || 'Failed to process WhatsApp export file.');
      setIsLoading(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await loadFile(file);
    }
  };

  // Group messages by Date
  const groupedMessages = useMemo(() => {
    if (!session) return [];
    const groups: { dateKey: string; dateTitle: string; messages: ChatMessage[] }[] = [];
    let currentKey = '';
    let currentGroup: ChatMessage[] = [];

    session.messages.forEach((msg) => {
      if (msg.dateKey !== currentKey) {
        if (currentGroup.length > 0) {
          groups.push({
            dateKey: currentKey,
            dateTitle: formatDateTitle(currentKey),
            messages: currentGroup,
          });
        }
        currentKey = msg.dateKey;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({
        dateKey: currentKey,
        dateTitle: formatDateTitle(currentKey),
        messages: currentGroup,
      });
    }

    return groups;
  }, [session]);

  function formatDateTitle(dateKey: string) {
    if (!dateKey || dateKey === 'Unknown Date') return 'Chat History';
    const [y, m, d] = dateKey.split('-').map(Number);
    if (!y || !m || !d) return dateKey;
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Search matches
  const searchMatches = useMemo(() => {
    if (!session || !searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    return session.messages.filter((m) => {
      return m.content.toLowerCase().includes(query) ||
             (m.attachment && m.attachment.fileName.toLowerCase().includes(query));
    });
  }, [session, searchQuery]);

  const handleSearchNav = (direction: 'next' | 'prev') => {
    if (searchMatches.length === 0) return;
    let nextIdx = direction === 'next' ? currentMatchIdx + 1 : currentMatchIdx - 1;
    if (nextIdx >= searchMatches.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = searchMatches.length - 1;
    setCurrentMatchIdx(nextIdx);

    const targetMsg = searchMatches[nextIdx];
    if (targetMsg) {
      const el = messageRefs.current.get(targetMsg.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleSetPerspective = (sender: string) => {
    if (!session) return;
    setSession({
      ...session,
      myPerspective: sender,
    });
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#0c1317] text-[#e9edef]' : 'bg-[#eae6df] text-[#111b21]'
    }`}>
      {/* ──────────────── Top Navigation Bar ──────────────── */}
      <header className={`h-16 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 border-b shadow-sm ${
        isDark ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#f0f2f5] border-[#d1d7db]'
      }`}>
        {/* Left Section: Back to LAB & Chat Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/10 text-gray-600'
            }`}
            title="Return to LAB Dashboard"
          >
            <ArrowLeft size={20} />
          </button>

          {session ? (
            <div 
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-3 cursor-pointer group min-w-0"
              title="Click to view chat info & media"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00a884] to-emerald-400 flex items-center justify-center text-white font-bold shrink-0 shadow">
                {session.title.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex flex-col min-w-0">
                <h1 className="font-semibold text-sm sm:text-base leading-tight truncate group-hover:text-[#00a884] transition-colors">
                  {session.title}
                </h1>
                <span className="text-xs text-gray-400 truncate">
                  {session.participants.map(p => p.name).join(', ')}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                WhatsApp <span className="text-[#00a884]">Viewer</span>
              </span>
            </div>
          )}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {session && (
            <>
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(prev => !prev)}
                className={`p-2.5 rounded-full transition-colors ${
                  isSearchOpen 
                    ? 'bg-[#00a884] text-white' 
                    : isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/10 text-gray-600'
                }`}
                title="Search conversation"
              >
                <Search size={18} />
              </button>

              {/* Perspective Switcher */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] text-xs bg-white/[0.03]">
                <span className="text-gray-400">Perspective:</span>
                <select
                  value={session.myPerspective}
                  onChange={(e) => handleSetPerspective(e.target.value)}
                  className={`bg-transparent font-semibold cursor-pointer outline-none ${
                    isDark ? 'text-[#00a884]' : 'text-[#008069]'
                  }`}
                >
                  {session.participants.map(p => (
                    <option key={p.name} value={p.name} className={isDark ? 'bg-[#202c33] text-white' : 'bg-white text-black'}>
                      {p.name} (You)
                    </option>
                  ))}
                </select>
              </div>

              {/* Chat Info & Media Sidebar Toggle */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(prev => !prev)}
                className={`p-2.5 rounded-full transition-colors ${
                  isSidebarOpen 
                    ? 'bg-[#00a884] text-white' 
                    : isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/10 text-gray-600'
                }`}
                title="Chat Info & Media Gallery"
              >
                <Info size={18} />
              </button>
            </>
          )}

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/10 text-amber-400' : 'hover:bg-black/10 text-gray-700'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Upload / Switch Chat Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-semibold shadow-md transition-all ml-1"
            title="Upload WhatsApp ZIP or TXT export"
          >
            <UploadCloud size={16} />
            <span className="hidden sm:inline">Upload ZIP</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </header>

      {/* ──────────────── Search Bar Overlay ──────────────── */}
      <AnimatePresence>
        {session && isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`w-full px-6 py-2.5 border-b z-10 flex items-center justify-between gap-4 overflow-hidden ${
              isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-[#ffffff] border-[#e9edef]'
            }`}
          >
            <div className="flex-1 max-w-xl relative flex items-center">
              <Search size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentMatchIdx(0);
                }}
                placeholder="Search messages, stickers, or files..."
                autoFocus
                className={`w-full pl-9 pr-8 py-1.5 rounded-lg text-sm border outline-none transition-all ${
                  isDark 
                    ? 'bg-[#202c33] border-transparent text-white focus:border-[#00a884]' 
                    : 'bg-gray-100 border-transparent text-black focus:border-[#00a884]'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-gray-400 font-mono">
                {searchMatches.length > 0 
                  ? `${currentMatchIdx + 1} of ${searchMatches.length}` 
                  : searchQuery ? 'No matches' : ''}
              </span>

              <button
                type="button"
                onClick={() => handleSearchNav('prev')}
                disabled={searchMatches.length === 0}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30"
                title="Previous match"
              >
                <ChevronUp size={16} />
              </button>

              <button
                type="button"
                onClick={() => handleSearchNav('next')}
                disabled={searchMatches.length === 0}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30"
                title="Next match"
              >
                <ChevronDown size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                title="Close search"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── Main Content Area ──────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="w-16 h-16 rounded-3xl bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884] mb-4 animate-bounce">
              <Sparkles size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Processing WhatsApp Archive</h3>
            <p className="text-xs text-gray-300 mb-4">{loadingStatus.statusText}</p>
            
            {/* Progress Bar */}
            <div className="w-64 h-2 rounded-full bg-white/10 overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-[#00a884] to-emerald-400 transition-all duration-300"
                style={{ width: `${loadingStatus.percent}%` }}
              />
            </div>
            <span className="text-xs font-mono text-[#00a884]">{loadingStatus.percent}%</span>
          </div>
        )}

        {/* 1. Empty / Upload Landing State */}
        {!session ? (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-y-auto ${
              isDragging ? 'bg-[#00a884]/15 border-2 border-dashed border-[#00a884]' : ''
            }`}
          >
            {/* Ambient Back Glow */}
            <div className="absolute w-96 h-96 bg-[#00a884]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-xl w-full z-10 flex flex-col items-center space-y-6">
              
              {/* WhatsApp Icon */}
              <div className="w-20 h-20 rounded-3xl bg-[#00a884] text-white flex items-center justify-center shadow-2xl shadow-[#00a884]/40">
                <FileText size={40} />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  WhatsApp Chat <span className="text-[#00a884]">Viewer</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                  Extract and view your exported WhatsApp conversation files with full media, WebP stickers, voice notes, and authentic chat styling.
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3 text-left">
                  <AlertCircle size={20} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="w-full flex items-center justify-center">
                {/* Upload Custom File */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#00a884] hover:bg-[#008f6f] text-white font-bold text-sm shadow-xl shadow-[#00a884]/30 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5"
                >
                  <UploadCloud size={20} />
                  <span>Choose WhatsApp .ZIP or .TXT File</span>
                </button>
              </div>

              {/* Drag & Drop Hint */}
              <p className="text-[11px] text-gray-500">
                Or drag and drop any exported WhatsApp <code className="text-[#00a884]">.zip</code> or <code className="text-[#00a884]">.txt</code> file here.
              </p>

              {/* How to Export Guide Toggle */}
              <div className="pt-4 border-t border-white/[0.06] w-full">
                <button
                  type="button"
                  onClick={() => setShowExportGuide(prev => !prev)}
                  className="text-xs text-[#00a884] hover:underline flex items-center justify-center gap-1.5 mx-auto font-medium"
                >
                  <HelpCircle size={14} />
                  <span>How do I export my WhatsApp chat?</span>
                </button>

                <AnimatePresence>
                  {showExportGuide && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={`mt-4 p-4 rounded-2xl border text-left text-xs space-y-3 overflow-hidden ${
                        isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <strong className="text-white block font-semibold">On Android:</strong>
                        <p className="text-gray-400">
                          1. Open the chat in WhatsApp ➔ Tap the three dots (⋮) in the top right.
                          <br />2. Tap <strong>More</strong> ➔ <strong>Export chat</strong>.
                          <br />3. Choose <strong>Include Media</strong> ➔ Save or share the <code>.zip</code> file.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-white block font-semibold">On iPhone (iOS):</strong>
                        <p className="text-gray-400">
                          1. Open the chat ➔ Tap the contact/group name at the top.
                          <br />2. Scroll down and tap <strong>Export Chat</strong>.
                          <br />3. Select <strong>Attach Media</strong> ➔ Save to Files as <code>.zip</code>.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        ) : (
          /* 2. Active Chat Conversation Viewport */
          <div className="flex-1 flex flex-col min-w-0 relative">
            
            {/* Chat Wallpaper Background */}
            <div 
              className={`absolute inset-0 pointer-events-none opacity-[0.06] ${
                isDark ? 'invert' : ''
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundSize: '240px',
              }}
            />

            {/* Scrollable Message List */}
            <div 
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto px-4 sm:px-12 md:px-20 py-6 space-y-4 relative z-10"
            >
              {groupedMessages.map((group) => (
                <div key={group.dateKey} className="space-y-1.5">
                  
                  {/* Date Divider Pill */}
                  <div className="flex justify-center my-4 sticky top-2 z-20">
                    <span className={`px-3.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide shadow-sm select-none ${
                      isDark 
                        ? 'bg-[#182229] text-gray-300 border border-white/[0.04]' 
                        : 'bg-[#ffffff] text-gray-600 border border-gray-200'
                    }`}>
                      {group.dateTitle}
                    </span>
                  </div>

                  {/* Messages in Group */}
                  {group.messages.map((message, idx) => {
                    const isOutgoing = message.sender === session.myPerspective;
                    const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
                    const showTail = !prevMsg || prevMsg.sender !== message.sender || prevMsg.isSystem;
                    const showSenderName = session.isGroup && showTail && !isOutgoing;
                    
                    const participant = session.participants.find(p => p.name === message.sender);
                    const senderColor = participant ? participant.color : '#00a884';

                    return (
                      <div
                        key={message.id}
                        ref={(el) => {
                          if (el) messageRefs.current.set(message.id, el);
                          else messageRefs.current.delete(message.id);
                        }}
                      >
                        <ChatBubble
                          message={message}
                          isOutgoing={isOutgoing}
                          showTail={showTail}
                          showSenderName={showSenderName}
                          senderColor={senderColor}
                          searchQuery={searchQuery}
                          theme={theme}
                          onMediaClick={(media) => setActiveMedia(media)}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Bottom Read-Only Bar */}
            <footer className={`px-6 py-3 border-t text-center text-xs shrink-0 select-none ${
              isDark ? 'bg-[#202c33] border-[#222e35] text-gray-400' : 'bg-[#f0f2f5] border-[#d1d7db] text-gray-500'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <span>💬 WhatsApp Read-Only Conversation Viewer</span>
                <span>•</span>
                <span>{session.totalMessages} Messages parsed</span>
              </div>
            </footer>

          </div>
        )}

        {/* 3. Right Sidebar Drawer (Chat Info & Media Gallery) */}
        {session && (
          <ChatInfoSidebar
            session={session}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onSelectMedia={(media) => setActiveMedia(media)}
            onSetPerspective={handleSetPerspective}
            theme={theme}
          />
        )}

      </div>

      {/* 4. Lightbox Modal */}
      <MediaModal
        media={activeMedia}
        onClose={() => setActiveMedia(null)}
      />

    </div>
  );
};

export default WhatsAppViewerApp;
