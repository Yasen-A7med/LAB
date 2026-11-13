import React, { useState, useEffect } from 'react';
import { useAPmail } from './APmailContext';
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Trash2,
  Send,
  Loader2,
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
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isComposeOpen) {
      setTo(composeData.to || '');
      setSubject(composeData.subject || '');
      setBody(composeData.body || '');
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
      subject: subject.trim(),
      bodyHtml: `<div><p>${body.replace(/\n/g, '<br>')}</p></div>`,
      bodyText: body,
      inReplyTo: composeData.inReplyTo,
    });
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  if (composeMode === 'minimized') {
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
      {isMaximized && (
        <div
          onClick={() => setComposeMode('docked')}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      <div
        onKeyDown={handleKeyDown}
        className={`fixed z-50 bg-white dark:bg-[#181a20] text-gray-900 dark:text-gray-100 shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-150 ${
          isMaximized
            ? 'inset-6 rounded-xl'
            : 'bottom-0 right-4 sm:right-10 w-[92vw] sm:w-[500px] h-[480px] rounded-t-xl'
        }`}
      >
        {/* Title Bar */}
        <div className="h-9 px-3 bg-[#f2f6fc] dark:bg-[#20232a] rounded-t-xl flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 select-none">
          <span>{subject ? subject : 'New Message'}</span>
          <div className="flex items-center gap-1 text-gray-400">
            <button
              onClick={() => setComposeMode('minimized')}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setComposeMode(isMaximized ? 'docked' : 'maximized')}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
            <button
              onClick={closeCompose}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="px-3 text-xs divide-y divide-gray-100 dark:divide-gray-800">
          <div className="py-1.5 flex items-center gap-2">
            <span className="text-gray-400 w-8">To</span>
            <input
              type="email"
              autoFocus
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                updateDraft({ to: e.target.value });
              }}
              placeholder="Recipients"
              className="w-full bg-transparent text-xs focus:outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="py-1.5 flex items-center gap-2">
            <span className="text-gray-400 w-8">Subj</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                updateDraft({ subject: e.target.value });
              }}
              placeholder="Subject"
              className="w-full bg-transparent text-xs font-medium focus:outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-3 overflow-y-auto">
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              updateDraft({ body: e.target.value });
            }}
            placeholder="Write your email here..."
            className="w-full h-full resize-none bg-transparent text-xs focus:outline-none placeholder:text-gray-400 leading-relaxed font-sans"
          />
        </div>

        {/* Bottom Bar */}
        <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between select-none">
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </>
            )}
          </button>

          <button
            onClick={closeCompose}
            title="Discard"
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
};
