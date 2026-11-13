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
  CornerDownLeft,
} from 'lucide-react';

export const APmailView: React.FC = () => {
  const {
    selectedEmail,
    selectEmail,
    toggleStar,
    deleteEmail,
    markAsRead,
    quickReply,
  } = useAPmail();

  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  if (!selectedEmail) return null;

  const email = selectedEmail;
  const initial = (email.from.name || email.from.address).charAt(0).toUpperCase();

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    await quickReply(replyText.trim());
    setReplyText('');
    setIsReplying(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendReply();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#181a20] rounded-xl shadow-2xs border border-gray-200/80 dark:border-gray-800 overflow-hidden select-text transition-colors">
      {/* Action Bar */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 text-xs select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => selectEmail(null)}
            title="Back to list (u)"
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2 cursor-pointer flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={() => deleteEmail(email.id)}
            title="Delete"
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => markAsRead(email.id, false)}
            title="Mark as unread"
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">
            {new Date(email.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={() => toggleStar(email.id)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                email.isStarred ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Email Body Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Subject Header */}
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">
          {email.subject}
        </h2>

        {/* Sender Info Bar */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div>
              <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                {email.from.name || email.from.address}
              </p>
              <p className="text-[10px] text-gray-400">
                &lt;{email.from.address}&gt; to me
              </p>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="pt-2 text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed overflow-x-auto">
          {email.bodyHtml ? (
            <div
              className="prose dark:prose-invert max-w-none text-xs sm:text-sm [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
            />
          ) : (
            <pre className="font-sans whitespace-pre-wrap text-xs sm:text-sm">{email.bodyText}</pre>
          )}
        </div>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Attachments ({email.attachments.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium truncate max-w-[150px]">{att.filename}</span>
                  <span className="text-[10px] text-gray-400">({Math.round(att.size / 1024)} KB)</span>
                  <button title="Download" className="p-0.5 hover:text-blue-600 cursor-pointer">
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inline Quick-Reply Box */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-gray-50 dark:bg-[#20232a] border border-gray-200 dark:border-gray-700/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
              <CornerDownLeft className="w-3.5 h-3.5 text-blue-500" />
              <span>Quick Reply to {email.from.name || email.from.address}</span>
            </div>
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply here... (Ctrl + Enter to send)"
              className="w-full bg-transparent text-xs resize-none focus:outline-none placeholder:text-gray-400 leading-relaxed font-sans"
            />
            <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
              <span className="text-[10px] text-gray-400">Ctrl + Enter to dispatch</span>
              <button
                onClick={handleSendReply}
                disabled={isReplying || !replyText.trim()}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3 h-3" />
                <span>Send Reply</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
