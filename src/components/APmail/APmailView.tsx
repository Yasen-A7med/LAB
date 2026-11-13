import React, { useState } from 'react';
import { useAPmail } from './APmailContext';
import {
  ArrowLeft,
  Trash2,
  Mail,
  Star,
  Download,
  FileText,
  Send,
  Sparkles,
  Paperclip,
} from 'lucide-react';

export const APmailView: React.FC = () => {
  const {
    selectedEmail,
    selectEmail,
    toggleStar,
    deleteEmail,
    markAsRead,
    quickReply,
    getSmartReplies,
  } = useAPmail();

  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isThreadExpanded, setIsThreadExpanded] = useState(false);

  if (!selectedEmail) return null;

  const email = selectedEmail;
  const senderName = email.from.name || email.from.address;
  const initial = senderName.charAt(0).toUpperCase();

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    await quickReply(replyText.trim());
    setReplyText('');
    setIsReplying(false);
  };

  const handleSelectSmartReply = (text: string) => {
    setReplyText(text);
    // Smoothly focus the textarea
    const textarea = document.getElementById('apmail-quick-reply-box') as HTMLTextAreaElement;
    if (textarea) textarea.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendReply();
    }
  };

  const smartReplies = getSmartReplies(email);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#181a20] rounded-xl shadow-2xs border border-gray-200/80 dark:border-gray-800 overflow-hidden select-text transition-colors">
      {/* Sticky Action Bar */}
      <div className="h-11 px-2 sm:px-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 text-xs select-none">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => selectEmail(null)}
            title="Back to list (u)"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-1 cursor-pointer flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            onClick={() => deleteEmail(email.id)}
            title="Delete"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-600 dark:text-gray-300"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => markAsRead(email.id, false)}
            title="Mark as unread"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-600 dark:text-gray-300"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 hidden sm:inline">
            {new Date(email.date).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <button
            onClick={() => toggleStar(email.id)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <Star
              className={`w-4 h-4 ${
                email.isStarred ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Email Body Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
        {/* Subject Header */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 leading-snug">
            {email.subject}
          </h1>
          {email.category && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {email.category}
            </span>
          )}
        </div>

        {/* Sender Metadata Card */}
        <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
              {initial}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                  {senderName}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate hidden sm:inline">
                  &lt;{email.from.address}&gt;
                </span>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                to {email.to.map((t) => t.name || t.address).join(', ')}
              </p>
            </div>
          </div>

          <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">
            {new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Thread History Accordion (if in reply) */}
        {email.subject.startsWith('Re:') && (
          <div className="border border-gray-200 dark:border-gray-700/60 rounded-lg p-2.5 bg-gray-50/50 dark:bg-[#1f2228]/50 text-xs">
            <button
              onClick={() => setIsThreadExpanded(!isThreadExpanded)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>{isThreadExpanded ? '▲ Hide previous message' : '▼ Show original message thread'}</span>
            </button>
            {isThreadExpanded && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs whitespace-pre-wrap">
                On {new Date(email.date).toLocaleDateString()}, {email.from.address} wrote:
                {"\n> "}Please refer to earlier updates.
              </div>
            )}
          </div>
        )}

        {/* Message Body Content */}
        <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed space-y-3 pt-1">
          {email.bodyHtml ? (
            <div
              className="prose dark:prose-invert max-w-none text-xs sm:text-sm"
              dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
            />
          ) : (
            <p className="whitespace-pre-wrap">{email.bodyText}</p>
          )}
        </div>

        {/* Attachments Section */}
        {email.hasAttachments && email.attachments && email.attachments.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{email.attachments.length} Attachment{email.attachments.length > 1 ? 's' : ''}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/60 dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-700/60 text-xs transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[140px] sm:max-w-[200px]">
                      {att.filename}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {(att.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Download className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-1 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Smart Reply Chips */}
        <div className="pt-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Smart Replies</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleSelectSmartReply(reply)}
                className="px-3 py-1.5 rounded-full border border-gray-300/80 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-[#1a1d24] hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-gray-700 dark:text-gray-300 text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        {/* Inline Quick Reply Box */}
        <div className="pt-2">
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-blue-500/60 transition-all bg-gray-50/40 dark:bg-[#1c1f26]/60">
            <textarea
              id="apmail-quick-reply-box"
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Quick reply to ${senderName}... (Ctrl + Enter to send)`}
              className="w-full p-3 bg-transparent text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 resize-none focus:outline-none"
            />
            <div className="px-3 py-2 bg-gray-100/60 dark:bg-[#22252c] flex items-center justify-between border-t border-gray-200/60 dark:border-gray-700/60 text-xs">
              <span className="text-[11px] text-gray-400 hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-[10px]">Ctrl + Enter</kbd> to send
              </span>
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || isReplying}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs transition-colors cursor-pointer ml-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isReplying ? 'Sending...' : 'Send Reply'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
