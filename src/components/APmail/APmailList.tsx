import React from 'react';
import { useAPmail } from './APmailContext';
import {
  Trash2,
  MailCheck,
  Mail,
  Star,
  Inbox,
  Tag,
  Users,
  Info,
  Paperclip,
  CheckSquare,
  Square,
  MinusSquare,
} from 'lucide-react';

export const APmailList: React.FC = () => {
  const {
    filteredEmails,
    activeFolder,
    activeCategory,
    setActiveCategory,
    selectEmail,
    toggleStar,
    deleteEmail,
    markAsRead,
    checkedIds,
    toggleCheck,
    toggleCheckAll,
    batchDelete,
    batchMarkRead,
    unreadOnly,
  } = useAPmail();

  const isAllChecked = filteredEmails.length > 0 && checkedIds.length === filteredEmails.length;
  const isPartiallyChecked = checkedIds.length > 0 && checkedIds.length < filteredEmails.length;

  const categories = [
    { id: 'primary', name: 'Primary', icon: Inbox, color: 'text-blue-600 dark:text-blue-400 border-blue-600' },
    { id: 'promotions', name: 'Promotions', icon: Tag, color: 'text-emerald-600 dark:text-emerald-400 border-emerald-600' },
    { id: 'social', name: 'Social', icon: Users, color: 'text-sky-600 dark:text-sky-400 border-sky-600' },
    { id: 'updates', name: 'Updates', icon: Info, color: 'text-amber-600 dark:text-amber-400 border-amber-600' },
  ];

  const formatShortDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const now = new Date();
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#181a20] rounded-xl shadow-2xs border border-gray-200/80 dark:border-gray-800 overflow-hidden select-none transition-colors">
      {/* Top Action Bar */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleCheckAll}
            title={isAllChecked ? 'Deselect all' : 'Select all'}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {isAllChecked ? (
              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : isPartiallyChecked ? (
              <MinusSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {checkedIds.length > 0 && (
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={batchDelete}
                title="Delete selected"
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => batchMarkRead(true)}
                title="Mark as read"
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                <MailCheck className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => batchMarkRead(false)}
                title="Mark as unread"
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-gray-400 ml-1">
                {checkedIds.length} selected
              </span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-gray-400">
          {filteredEmails.length} messages {unreadOnly && '(unread only)'}
        </div>
      </div>

      {/* Category Tabs (Inbox Only) */}
      {activeFolder === 'INBOX' && (
        <div className="flex items-center border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isCurrent = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-1 min-w-[110px] py-2 px-3 flex items-center justify-center gap-2 border-b-2 text-xs font-medium transition-all cursor-pointer ${
                  isCurrent
                    ? `${cat.color} font-semibold bg-blue-50/20 dark:bg-blue-900/10`
                    : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* List items */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/50">
        {filteredEmails.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <Inbox className="w-8 h-8 mb-2 stroke-1" />
            <p className="text-xs font-medium">No messages found</p>
          </div>
        ) : (
          filteredEmails.map((mail) => {
            const isChecked = checkedIds.includes(mail.id);

            return (
              <div
                key={mail.id}
                onClick={() => selectEmail(mail)}
                className={`group relative flex items-center px-3 py-2 text-xs cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-[#c2e7ff]/30 dark:bg-[#004a77]/30'
                    : mail.isRead
                    ? 'bg-white dark:bg-[#181a20] hover:bg-[#f6f8fc] dark:hover:bg-[#202228]'
                    : 'bg-[#f4f7fc] dark:bg-[#20232a] hover:bg-[#ebf1fc] dark:hover:bg-[#262a32]'
                }`}
              >
                {/* Select Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCheck(mail.id);
                  }}
                  className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-1.5 cursor-pointer"
                >
                  {isChecked ? (
                    <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Star Button */}
                <button
                  onClick={(e) => toggleStar(mail.id, e)}
                  className="p-1 rounded mr-2 cursor-pointer transition-transform active:scale-125"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      mail.isStarred
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600 hover:text-gray-500'
                    }`}
                  />
                </button>

                {/* Sender */}
                <div
                  className={`w-36 sm:w-44 truncate shrink-0 pr-2 ${
                    mail.isRead
                      ? 'text-gray-700 dark:text-gray-300 font-normal'
                      : 'text-gray-900 dark:text-white font-semibold'
                  }`}
                >
                  {mail.from.name || mail.from.address}
                </div>

                {/* Subject & Snippet */}
                <div className="flex-1 flex items-center truncate min-w-0 pr-3">
                  <span
                    className={`truncate ${
                      mail.isRead
                        ? 'text-gray-800 dark:text-gray-200 font-normal'
                        : 'text-gray-950 dark:text-white font-semibold'
                    }`}
                  >
                    {mail.subject}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 font-normal ml-1.5 truncate">
                    - {mail.snippet}
                  </span>

                  {mail.hasAttachments && (
                    <span className="ml-1.5 shrink-0 text-gray-400" title="Attachment">
                      <Paperclip className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Date */}
                <div
                  className={`w-16 text-right text-[11px] shrink-0 whitespace-nowrap transition-opacity group-hover:opacity-0 ${
                    mail.isRead
                      ? 'text-gray-400'
                      : 'text-gray-900 dark:text-white font-semibold'
                  }`}
                >
                  {formatShortDate(mail.date)}
                </div>

                {/* Quick Hover Actions */}
                <div className="absolute right-3 hidden group-hover:flex items-center gap-1 bg-inherit pl-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEmail(mail.id);
                    }}
                    title="Delete"
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(mail.id, !mail.isRead);
                    }}
                    title={mail.isRead ? 'Mark as unread' : 'Mark as read'}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    {mail.isRead ? <Mail className="w-3.5 h-3.5" /> : <MailCheck className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
