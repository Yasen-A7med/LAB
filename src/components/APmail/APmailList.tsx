import React, { useState } from 'react';
import { useAPmail } from './APmailContext';
import type { EmailItem } from './types';
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
  Loader2,
} from 'lucide-react';

export const APmailList: React.FC = () => {
  const {
    filteredEmails,
    isLoading,
    activeFolder,
    activeCategory,
    setActiveCategory,
    categoryCounts,
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
    starredOnly,
    hasAttachmentOnly,
  } = useAPmail();

  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const isAllChecked = filteredEmails.length > 0 && checkedIds.length === filteredEmails.length;
  const isPartiallyChecked = checkedIds.length > 0 && checkedIds.length < filteredEmails.length;

  const categories = [
    { id: 'all', name: 'All Mail', icon: Mail, color: 'text-blue-600 dark:text-blue-400 border-blue-600' },
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

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-600 text-white',
      'bg-emerald-600 text-white',
      'bg-purple-600 text-white',
      'bg-amber-600 text-white',
      'bg-rose-600 text-white',
      'bg-indigo-600 text-white',
      'bg-teal-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    setTouchStartX(e.touches[0].clientX);
    setSwipingId(id);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    if (Math.abs(diff) < 140) {
      setSwipeOffset(diff);
    }
  };

  const handleTouchEnd = (mail: EmailItem) => {
    if (swipeOffset < -70) {
      deleteEmail(mail.id);
    } else if (swipeOffset > 70) {
      markAsRead(mail.id, !mail.isRead);
    }
    setTouchStartX(null);
    setSwipingId(null);
    setSwipeOffset(0);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#181a20] rounded-xl shadow-2xs border border-gray-200/80 dark:border-gray-800 overflow-hidden select-none transition-colors">
      {/* Top Action Bar */}
      <div className="h-10 px-2 sm:px-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 text-xs">
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

        <div className="text-[11px] text-gray-400 flex items-center gap-1">
          <span>{filteredEmails.length} messages</span>
          {(unreadOnly || starredOnly || hasAttachmentOnly) && (
            <span className="text-blue-500 font-medium">(filtered)</span>
          )}
        </div>
      </div>

      {/* Category Tabs (Inbox Only): Shows All Mail + Specific Categories */}
      {activeFolder === 'INBOX' && (
        <div className="flex items-center border-b border-gray-100 dark:border-gray-800 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isCurrent = activeCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-1 min-w-[85px] sm:min-w-[110px] py-2 px-2 sm:px-3 flex items-center justify-center gap-1.5 border-b-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? `${cat.color} font-semibold bg-blue-50/20 dark:bg-blue-900/10`
                    : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1 rounded-full ${isCurrent ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-gray-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* List items Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/50">
        {isLoading && filteredEmails.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <Loader2 className="w-8 h-8 mb-3 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Connecting to Gmail...</p>
            <p className="text-[11px] text-gray-400 mt-1">Fetching your real messages via IMAP</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <Inbox className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-xs font-medium">No messages found in this view</p>
          </div>
        ) : (
          filteredEmails.map((mail) => {
            const isChecked = checkedIds.includes(mail.id);
            const isSwiping = swipingId === mail.id;
            const senderName = mail.from.name || mail.from.address;
            const initial = senderName.charAt(0).toUpperCase();

            return (
              <div
                key={mail.id}
                className="relative overflow-hidden"
                onTouchStart={(e) => handleTouchStart(e, mail.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => handleTouchEnd(mail)}
              >
                {/* Swipe Action Background Layer (Mobile) */}
                {isSwiping && Math.abs(swipeOffset) > 10 && (
                  <div
                    className={`absolute inset-0 flex items-center px-4 transition-colors ${
                      swipeOffset < 0
                        ? 'justify-end bg-red-600 text-white'
                        : 'justify-start bg-blue-600 text-white'
                    }`}
                  >
                    {swipeOffset < 0 ? (
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        <MailCheck className="w-4 h-4" />
                        <span>{mail.isRead ? 'Mark Unread' : 'Mark Read'}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Email Item Body */}
                <div
                  onClick={() => selectEmail(mail)}
                  style={{
                    transform: isSwiping ? `translateX(${swipeOffset}px)` : 'none',
                    transition: isSwiping ? 'none' : 'transform 0.15s ease-out',
                  }}
                  className={`group relative flex items-center px-2.5 sm:px-3 py-2 sm:py-2 text-xs cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-[#c2e7ff]/30 dark:bg-[#004a77]/30'
                      : mail.isRead
                      ? 'bg-white dark:bg-[#181a20] hover:bg-[#f6f8fc] dark:hover:bg-[#202228]'
                      : 'bg-[#f4f7fc] dark:bg-[#20232a] hover:bg-[#ebf1fc] dark:hover:bg-[#262a32]'
                  }`}
                >
                  {/* Select Checkbox (Desktop only) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCheck(mail.id);
                    }}
                    className="hidden sm:block p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-1.5 cursor-pointer shrink-0"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Star Button (Desktop only) */}
                  <button
                    onClick={(e) => toggleStar(mail.id, e)}
                    className="hidden sm:block p-1 rounded mr-2 cursor-pointer transition-transform active:scale-125 shrink-0"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        mail.isStarred
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 dark:text-gray-600 hover:text-gray-500'
                      }`}
                    />
                  </button>

                  {/* MOBILE 3-TIER CARD VIEW (< md screens) */}
                  <div className="flex md:hidden items-start w-full gap-2.5 py-0.5 min-w-0">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck(mail.id);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                        isChecked
                          ? 'bg-blue-600 text-white'
                          : getAvatarColor(senderName)
                      }`}
                    >
                      {isChecked ? '✓' : initial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 leading-tight">
                        <span
                          className={`truncate text-xs ${
                            mail.isRead
                              ? 'text-gray-800 dark:text-gray-200 font-medium'
                              : 'text-gray-950 dark:text-white font-bold'
                          }`}
                        >
                          {senderName}
                        </span>
                        <span
                          className={`text-[10px] shrink-0 ${
                            mail.isRead
                              ? 'text-gray-400'
                              : 'text-blue-600 dark:text-blue-400 font-semibold'
                          }`}
                        >
                          {formatShortDate(mail.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p
                          className={`truncate text-[11px] leading-tight ${
                            mail.isRead
                              ? 'text-gray-700 dark:text-gray-300'
                              : 'text-gray-950 dark:text-white font-semibold'
                          }`}
                        >
                          {mail.subject}
                        </p>
                        {mail.hasAttachments && (
                          <Paperclip className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 truncate">
                          {mail.snippet}
                        </p>
                        <button
                          onClick={(e) => toggleStar(mail.id, e)}
                          className="p-0.5 shrink-0 text-gray-400 cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              mail.isStarred
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP SINGLE-ROW VIEW (>= md screens) */}
                  <div className="hidden md:flex items-center flex-1 min-w-0">
                    <div
                      className={`w-40 lg:w-48 truncate shrink-0 pr-2 ${
                        mail.isRead
                          ? 'text-gray-700 dark:text-gray-300 font-normal'
                          : 'text-gray-900 dark:text-white font-semibold'
                      }`}
                    >
                      {senderName}
                    </div>

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

                    <div
                      className={`w-16 text-right text-[11px] shrink-0 whitespace-nowrap transition-opacity group-hover:opacity-0 ${
                        mail.isRead
                          ? 'text-gray-400'
                          : 'text-gray-900 dark:text-white font-semibold'
                      }`}
                    >
                      {formatShortDate(mail.date)}
                    </div>

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
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
