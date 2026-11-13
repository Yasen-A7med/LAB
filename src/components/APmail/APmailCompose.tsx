import React, { useState, useEffect, useRef } from 'react';
import { useAPmail } from './APmailContext';
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Trash2,
  Send,
  Loader2,
  ArrowLeft,
  Paperclip,
  Bold,
  Italic,
  List,
  ListOrdered,
  FileText,
} from 'lucide-react';

export const APmailCompose: React.FC = () => {
  const {
    isComposeOpen,
    closeCompose,
    composeMode,
    setComposeMode,
    composeData,
    updateDraft,
    sendEmail,
    showToast,
  } = useAPmail();

  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; size: number }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isComposeOpen) {
      setTo(composeData.to || '');
      setCc(composeData.cc || '');
      setBcc(composeData.bcc || '');
      setSubject(composeData.subject || '');
      setBody(composeData.body || '');
      setAttachments(composeData.attachments || []);
      if (composeData.cc || composeData.bcc) {
        setShowCcBcc(true);
      }
    }
  }, [isComposeOpen, composeData]);

  if (!isComposeOpen) return null;

  const handleSend = async () => {
    if (!to.trim()) {
      showToast('Enter recipient email');
      return;
    }
    if (!subject.trim()) {
      showToast('Enter email subject');
      return;
    }

    setIsSending(true);
    await sendEmail({
      to: to.trim(),
      cc: cc.trim() || undefined,
      bcc: bcc.trim() || undefined,
      subject: subject.trim(),
      bodyHtml: `<div><p>${body.replace(/\n/g, '<br>')}</p></div>`,
      bodyText: body,
      inReplyTo: composeData.inReplyTo,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: f.size,
      }));
      const updated = [...attachments, ...newFiles];
      setAttachments(updated);
      updateDraft({ attachments: updated });
    }
  };

  const removeAttachment = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    updateDraft({ attachments: updated });
  };

  // Text formatting helpers
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!bodyTextareaRef.current) return;
    const el = bodyTextareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.slice(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const nextBody = body.slice(0, start) + replacement + body.slice(end);
    setBody(nextBody);
    updateDraft({ body: nextBody });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 0);
  };

  // Minimized Mode (Desktop only)
  if (!isMobile && composeMode === 'minimized') {
    return (
      <div className="fixed bottom-0 right-10 z-50 w-60 bg-[#001d35] dark:bg-[#20232a] text-white rounded-t-lg px-3 py-2 flex items-center justify-between shadow-xl cursor-pointer">
        <span
          onClick={() => setComposeMode('docked')}
          className="font-medium text-xs truncate flex-1"
        >
          {subject || 'New Message'}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setComposeMode('docked')} className="p-1 hover:bg-white/10 rounded cursor-pointer">
            <Maximize2 className="w-3 h-3" />
          </button>
          <button onClick={closeCompose} className="p-1 hover:bg-white/10 rounded cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  const isMaximized = composeMode === 'maximized';

  return (
    <>
      {/* Background Dim for Desktop Maximized */}
      {!isMobile && isMaximized && (
        <div
          onClick={() => setComposeMode('docked')}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onKeyDown={handleKeyDown}
        className={`fixed z-50 bg-white dark:bg-[#181a20] text-gray-900 dark:text-gray-100 shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-150 ${
          isMobile
            ? 'inset-0 w-full h-full rounded-none border-none'
            : isMaximized
            ? 'inset-6 rounded-xl'
            : 'bottom-0 right-4 sm:right-10 w-[94vw] sm:w-[540px] h-[520px] rounded-t-xl'
        }`}
      >
        {/* Header / Title Bar */}
        <div className="h-11 px-3 bg-[#f2f6fc] dark:bg-[#20232a] rounded-t-xl sm:rounded-t-xl flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 select-none border-b border-gray-200/50 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={closeCompose}
                className="p-1 rounded-full text-gray-600 dark:text-gray-300 mr-1"
                title="Save & Close"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="truncate max-w-[200px]">{subject ? subject : 'New Message'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-500">
            {/* Attachment Button in Header (Mobile) */}
            {isMobile && (
              <button
                onClick={handleAttachClick}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full cursor-pointer"
                title="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            )}

            {/* Send Button in Header (Mobile) */}
            {isMobile && (
              <button
                onClick={handleSend}
                disabled={isSending}
                className="p-1.5 bg-blue-600 active:bg-blue-700 text-white rounded-full cursor-pointer ml-1"
                title="Send"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            )}

            {/* Desktop Window Controls */}
            {!isMobile && (
              <>
                <button
                  onClick={() => setComposeMode('minimized')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                  title="Minimize"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setComposeMode(isMaximized ? 'docked' : 'maximized')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </button>
                <button
                  onClick={closeCompose}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
                  title="Close"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Inputs Stack */}
        <div className="px-3 text-xs divide-y divide-gray-100 dark:divide-gray-800">
          {/* To Field */}
          <div className="py-2 flex items-center gap-2">
            <span className="text-gray-400 w-8 shrink-0">To</span>
            <input
              type="email"
              autoFocus
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                updateDraft({ to: e.target.value });
              }}
              placeholder="Recipients"
              className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none text-xs sm:text-sm"
            />
            {!showCcBcc && (
              <button
                type="button"
                onClick={() => setShowCcBcc(true)}
                className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                Cc/Bcc
              </button>
            )}
          </div>

          {/* Cc / Bcc Fields */}
          {showCcBcc && (
            <>
              <div className="py-1.5 flex items-center gap-2">
                <span className="text-gray-400 w-8 shrink-0">Cc</span>
                <input
                  type="email"
                  value={cc}
                  onChange={(e) => {
                    setCc(e.target.value);
                    updateDraft({ cc: e.target.value });
                  }}
                  className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none text-xs"
                />
              </div>
              <div className="py-1.5 flex items-center gap-2">
                <span className="text-gray-400 w-8 shrink-0">Bcc</span>
                <input
                  type="email"
                  value={bcc}
                  onChange={(e) => {
                    setBcc(e.target.value);
                    updateDraft({ bcc: e.target.value });
                  }}
                  className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none text-xs"
                />
              </div>
            </>
          )}

          {/* Subject Field */}
          <div className="py-2">
            <input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                updateDraft({ subject: e.target.value });
              }}
              placeholder="Subject"
              className="w-full bg-transparent text-gray-900 dark:text-gray-100 font-medium focus:outline-none text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Attachment Chips Section */}
        {attachments.length > 0 && (
          <div className="px-3 py-1.5 bg-gray-50/70 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-1.5">
            {attachments.map((att, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[11px]"
              >
                <FileText className="w-3 h-3 text-blue-500" />
                <span className="max-w-[120px] truncate">{att.name}</span>
                <span className="text-[10px] text-gray-400">
                  ({(att.size / 1024).toFixed(0)}k)
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="text-gray-400 hover:text-red-500 ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Body Textarea */}
        <div className="flex-1 p-3 flex flex-col min-h-0">
          <textarea
            ref={bodyTextareaRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              updateDraft({ body: e.target.value });
            }}
            placeholder="Compose email..."
            className="flex-1 w-full bg-transparent text-gray-900 dark:text-gray-100 resize-none focus:outline-none text-xs sm:text-sm leading-relaxed"
          />
        </div>

        {/* Bottom Toolbar */}
        <div className="h-12 px-3 bg-gray-50/80 dark:bg-[#20232a] border-t border-gray-100 dark:border-gray-800 flex items-center justify-between select-none">
          {/* Rich Text Toolbar */}
          <div className="flex items-center gap-1 text-gray-500">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n- ')}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
              title="Bullet list"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n1. ')}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
              title="Numbered list"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleAttachClick}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
              title="Attach files"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Send and Discard Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                updateDraft({ to: '', subject: '', body: '', attachments: [] });
                closeCompose();
                showToast('Draft discarded');
              }}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded cursor-pointer"
              title="Discard draft"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {!isMobile && (
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
