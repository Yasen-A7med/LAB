import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Users, 
  Image as ImageIcon, 
  BarChart2, 
  FileText, 
  Mic, 
  Download,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import type { ChatSession, MediaAttachment } from './types';

interface ChatInfoSidebarProps {
  session: ChatSession;
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: MediaAttachment) => void;
  onSetPerspective: (sender: string) => void;
  theme?: 'dark' | 'light';
}

type TabType = 'overview' | 'media' | 'stats';

export const ChatInfoSidebar: React.FC<ChatInfoSidebarProps> = ({
  session,
  isOpen,
  onClose,
  onSelectMedia,
  onSetPerspective,
  theme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'sticker' | 'audio' | 'document'>('all');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const mediaList = Object.values(session.mediaMap);
  const filteredMedia = mediaFilter === 'all' 
    ? mediaList 
    : mediaList.filter(m => m.mediaType === mediaFilter);

  const imagesCount = mediaList.filter(m => m.mediaType === 'image').length;
  const stickersCount = mediaList.filter(m => m.mediaType === 'sticker').length;
  const audioCount = mediaList.filter(m => m.mediaType === 'audio').length;
  const docsCount = mediaList.filter(m => m.mediaType === 'document').length;

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${session.title.replace(/\s+/g, '_')}_chat.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`w-full sm:w-[380px] md:w-[420px] h-full flex flex-col border-l select-none z-30 ${
        isDark 
          ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' 
          : 'bg-[#ffffff] border-[#e9edef] text-[#111b21]'
      }`}
    >
      {/* Top Header */}
      <div className={`h-16 px-5 flex items-center justify-between border-b shrink-0 ${
        isDark ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#f0f2f5] border-[#e9edef]'
      }`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/10 text-gray-600'
            }`}
            title="Close sidebar"
          >
            <X size={20} />
          </button>
          <h2 className="font-semibold text-base">Contact & Chat Info</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex items-center border-b px-2 shrink-0 ${
        isDark ? 'border-[#222e35] bg-[#111b21]' : 'border-[#e9edef] bg-white'
      }`}>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-[#00a884] text-[#00a884]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users size={15} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'media'
              ? 'border-[#00a884] text-[#00a884]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ImageIcon size={15} />
          <span>Media ({mediaList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'stats'
              ? 'border-[#00a884] text-[#00a884]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <BarChart2 size={15} />
          <span>Stats</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Chat Profile Card */}
            <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-white/[0.06]">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00a884] to-emerald-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {session.title.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{session.title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {session.participants.length} Participants • {session.totalMessages} Messages
                </p>
              </div>
            </div>

            {/* Perspective Switcher */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00a884]">
                  My Perspective (Right Bubble)
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Select which participant is viewed as "You" (green outgoing bubbles on the right side):
              </p>
              <div className="space-y-1.5">
                {session.participants.map((p) => {
                  const isSelected = p.name === session.myPerspective;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => onSetPerspective(p.name)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all text-left ${
                        isSelected
                          ? isDark
                            ? 'bg-[#00a884]/15 border-[#00a884]/40 text-white'
                            : 'bg-[#00a884]/10 border-[#00a884]/40 text-[#111b21]'
                          : isDark
                            ? 'bg-[#202c33]/60 border-transparent hover:bg-[#202c33] text-gray-300'
                            : 'bg-gray-100 border-transparent hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-sm font-semibold truncate">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400 font-mono">
                          {p.messageCount} msgs
                        </span>
                        {isSelected && <CheckCircle2 size={16} className="text-[#00a884]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Timeline Info */}
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
              isDark ? 'bg-[#202c33]/40 border-white/[0.06]' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2 text-gray-400 font-medium">
                <Calendar size={14} className="text-[#00a884]" />
                <span>Timeline Period</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>{formatDate(session.startDate)}</span>
                <span className="text-gray-400">→</span>
                <span>{formatDate(session.endDate)}</span>
              </div>
            </div>

            {/* Export actions */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                  isDark
                    ? 'bg-white/[0.05] hover:bg-white/10 border-white/10 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
                }`}
              >
                <Download size={14} />
                <span>Export Parsed Session (JSON)</span>
              </button>
            </div>
          </>
        )}

        {activeTab === 'media' && (
          <div className="space-y-4">
            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'sticker', 'image', 'audio', 'document'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMediaFilter(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    mediaFilter === type
                      ? 'bg-[#00a884] text-white shadow-sm'
                      : isDark
                        ? 'bg-white/[0.06] text-gray-300 hover:bg-white/10'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? `All (${mediaList.length})` : type}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            {filteredMedia.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No {mediaFilter === 'all' ? 'media files' : `${mediaFilter} items`} found in this chat.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {filteredMedia.map((m, idx) => (
                  <div
                    key={`${m.fileName}-${idx}`}
                    onClick={() => onSelectMedia(m)}
                    className={`aspect-square rounded-xl overflow-hidden cursor-pointer relative group border transition-all ${
                      isDark ? 'bg-[#202c33] border-white/[0.06] hover:border-[#00a884]' : 'bg-gray-100 border-gray-200 hover:border-[#00a884]'
                    }`}
                  >
                    {m.mediaType === 'sticker' || m.mediaType === 'image' ? (
                      m.blobUrl ? (
                        <img
                          src={m.blobUrl}
                          alt={m.fileName}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${
                            m.mediaType === 'sticker' ? 'object-contain p-1' : ''
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon size={24} />
                        </div>
                      )
                    ) : m.mediaType === 'audio' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-center bg-[#00a884]/10 text-[#00a884]">
                        <Mic size={24} />
                        <span className="text-[10px] truncate max-w-full font-mono">Audio</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-center bg-amber-500/10 text-amber-400">
                        <FileText size={24} />
                        <span className="text-[10px] truncate max-w-full font-mono">
                          {m.fileName.split('.').pop()}
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] text-white font-medium truncate px-1">
                        {m.fileName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#202c33]/40 border-white/[0.06]' : 'bg-gray-50 border-gray-200'
              }`}>
                <span className="text-xs text-gray-400">Total Messages</span>
                <p className="text-2xl font-bold mt-1 text-[#00a884]">{session.totalMessages}</p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#202c33]/40 border-white/[0.06]' : 'bg-gray-50 border-gray-200'
              }`}>
                <span className="text-xs text-gray-400">Total Media</span>
                <p className="text-2xl font-bold mt-1 text-emerald-400">{session.totalMedia}</p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#202c33]/40 border-white/[0.06]' : 'bg-gray-50 border-gray-200'
              }`}>
                <span className="text-xs text-gray-400">Photos & Images</span>
                <p className="text-xl font-bold mt-1 text-blue-400">{imagesCount}</p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#202c33]/40 border-white/[0.06]' : 'bg-gray-50 border-gray-200'
              }`}>
                <span className="text-xs text-gray-400">Documents</span>
                <p className="text-xl font-bold mt-1 text-amber-400">{docsCount}</p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#202c33]/40 border-white/[0.06]' : 'bg-gray-50 border-gray-200'
              }`}>
                <span className="text-xs text-gray-400">Stickers Shared</span>
                <p className="text-xl font-bold mt-1 text-purple-400">{stickersCount}</p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#202c33]/40 border-white/[0.06]' : 'bg-gray-50 border-gray-200'
              }`}>
                <span className="text-xs text-gray-400">Voice Notes</span>
                <p className="text-xl font-bold mt-1 text-cyan-400">{audioCount}</p>
              </div>
            </div>

            {/* Participant Distribution */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#202c33]/40 border-white/[0.06]' : 'bg-gray-50 border-gray-200'
            }`}>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Participation Breakdown
              </span>
              <div className="space-y-2">
                {session.participants.map((p) => {
                  const percent = session.totalMessages > 0 
                    ? Math.round((p.messageCount / session.totalMessages) * 100)
                    : 0;

                  return (
                    <div key={p.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="truncate max-w-[200px]">{p.name}</span>
                        <span>{p.messageCount} msgs ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: p.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
