import React from 'react';
import { CheckCheck, FileText, Download } from 'lucide-react';
import type { ChatMessage, MediaAttachment } from './types';
import { VoiceNotePlayer } from './VoiceNotePlayer';

interface ChatBubbleProps {
  message: ChatMessage;
  isOutgoing: boolean;
  showTail: boolean;
  showSenderName: boolean;
  senderColor?: string;
  searchQuery?: string;
  theme?: 'dark' | 'light';
  onMediaClick?: (media: MediaAttachment) => void;
}

/**
 * Format message text with WhatsApp markdown (*bold*, _italic_, ~strike~, ```code```)
 * and make URLs clickable, plus search highlight.
 */
function formatMessageText(text: string, searchQuery?: string) {
  if (!text) return null;

  // Split lines
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Regex for URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = line.split(urlRegex);

    const renderedParts = parts.map((part, partIdx) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={partIdx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 underline hover:text-cyan-300 break-all inline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }

      // If search query is present, highlight match
      if (searchQuery && searchQuery.trim().length > 0) {
        const queryEscaped = searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(`(${queryEscaped})`, 'gi');
        const qParts = part.split(searchRegex);

        return (
          <span key={partIdx}>
            {qParts.map((qPart, qIdx) => {
              if (searchRegex.test(qPart)) {
                return (
                  <mark key={qIdx} className="bg-amber-400 text-black font-semibold rounded px-0.5">
                    {qPart}
                  </mark>
                );
              }
              return qPart;
            })}
          </span>
        );
      }

      return <span key={partIdx}>{part}</span>;
    });

    return (
      <React.Fragment key={lineIdx}>
        {renderedParts}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOutgoing,
  showTail,
  showSenderName,
  senderColor = '#00a884',
  searchQuery,
  theme = 'dark',
  onMediaClick,
}) => {
  const isDark = theme === 'dark';

  // 1. System notification bubble (center pill)
  if (message.isSystem) {
    return (
      <div className="flex justify-center my-3 px-4">
        <div className={`px-4 py-1.5 rounded-lg text-xs font-medium max-w-lg text-center shadow-sm select-text ${
          isDark 
            ? 'bg-[#182229] text-[#ffd279] border border-white/[0.04]' 
            : 'bg-[#ffeecd] text-[#54656f] border border-amber-200'
        }`}>
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  const isSticker = message.attachment?.mediaType === 'sticker';
  const isAudio = message.attachment?.mediaType === 'audio';
  const isImage = message.attachment?.mediaType === 'image';
  const isVideo = message.attachment?.mediaType === 'video';
  const isDoc = message.attachment?.mediaType === 'document';

  // 2. Sticker rendering (transparent without bubble container)
  if (isSticker && message.attachment) {
    return (
      <div className={`flex flex-col mb-1.5 ${isOutgoing ? 'items-end' : 'items-start'}`}>
        {showSenderName && !isOutgoing && (
          <span 
            className="text-[12px] font-semibold mb-1 ml-3"
            style={{ color: senderColor }}
          >
            {message.sender}
          </span>
        )}
        <div 
          onClick={() => message.attachment && onMediaClick && onMediaClick(message.attachment)}
          className="relative cursor-pointer group select-none max-w-[150px] sm:max-w-[170px]"
        >
          {message.attachment.blobUrl ? (
            <img
              src={message.attachment.blobUrl}
              alt={message.attachment.fileName}
              className="w-36 h-36 object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          ) : (
            <div className="w-32 h-32 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-400">
              Sticker
            </div>
          )}

          {/* Floating Time Pill */}
          <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-gray-200 flex items-center gap-1">
            <span>{message.timeStr}</span>
            {isOutgoing && <CheckCheck size={13} className="text-[#53bdeb]" />}
          </div>
        </div>
      </div>
    );
  }

  // 3. Standard Message Bubble (Text, Audio, Image, Video, Doc)
  return (
    <div className={`flex flex-col mb-1 ${isOutgoing ? 'items-end' : 'items-start'}`}>
      <div className="relative group max-w-[85%] sm:max-w-[70%] md:max-w-[65%]">
        
        {/* Outgoing speech tail */}
        {showTail && isOutgoing && (
          <svg
            viewBox="0 0 8 13"
            height="13"
            width="8"
            className={`absolute top-0 -right-2 ${
              isDark ? 'fill-[#005c4b]' : 'fill-[#d9fdd3]'
            }`}
          >
            <path opacity="0.13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
            <path d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z" />
          </svg>
        )}

        {/* Incoming speech tail */}
        {showTail && !isOutgoing && (
          <svg
            viewBox="0 0 8 13"
            height="13"
            width="8"
            className={`absolute top-0 -left-2 ${
              isDark ? 'fill-[#202c33]' : 'fill-[#ffffff]'
            }`}
          >
            <path opacity="0.13" d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z" />
            <path d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z" />
          </svg>
        )}

        {/* Bubble Box */}
        <div className={`rounded-2xl px-3.5 py-2 shadow-sm relative text-sm select-text ${
          isOutgoing
            ? isDark
              ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
              : 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
            : isDark
              ? 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
              : 'bg-[#ffffff] text-[#111b21] rounded-tl-none border border-gray-200/60'
        }`}>
          
          {/* Sender Name in group chats */}
          {showSenderName && !isOutgoing && (
            <div 
              className="text-[12.5px] font-bold mb-1 leading-tight"
              style={{ color: senderColor }}
            >
              {message.sender}
            </div>
          )}

          {/* Media Attachments */}
          {message.attachment && (
            <div className="mb-2">
              {/* Voice Note Player */}
              {isAudio && (
                <VoiceNotePlayer
                  src={message.attachment.blobUrl}
                  fileName={message.attachment.fileName}
                  isOutgoing={isOutgoing}
                  theme={theme}
                />
              )}

              {/* Photo Image */}
              {isImage && (
                <div
                  onClick={() => message.attachment && onMediaClick && onMediaClick(message.attachment)}
                  className="rounded-xl overflow-hidden cursor-pointer max-w-sm max-h-72 bg-black/20 relative group/img"
                >
                  {message.attachment.blobUrl ? (
                    <img
                      src={message.attachment.blobUrl}
                      alt={message.attachment.fileName}
                      className="w-full h-auto max-h-72 object-cover hover:scale-102 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-gray-400">Photo Attached</div>
                  )}
                </div>
              )}

              {/* Video Player / Thumbnail */}
              {isVideo && (
                <div
                  onClick={() => message.attachment && onMediaClick && onMediaClick(message.attachment)}
                  className="rounded-xl overflow-hidden cursor-pointer max-w-sm max-h-72 bg-black relative"
                >
                  {message.attachment.blobUrl ? (
                    <video
                      src={message.attachment.blobUrl}
                      className="w-full h-auto max-h-72 object-cover"
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-gray-400">Video Attached</div>
                  )}
                </div>
              )}

              {/* Document Attachment */}
              {isDoc && (
                <div className={`p-3 rounded-xl flex items-center justify-between gap-3 ${
                  isDark ? 'bg-black/20' : 'bg-black/5'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate max-w-[180px]">
                        {message.attachment.fileName}
                      </p>
                      <span className="text-[10px] text-gray-400 uppercase">
                        {message.attachment.fileName.split('.').pop()} document
                      </span>
                    </div>
                  </div>

                  {message.attachment.blobUrl && (
                    <button
                      type="button"
                      onClick={() => message.attachment && onMediaClick && onMediaClick(message.attachment)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                      title="Open document"
                    >
                      <Download size={15} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Message Text Content */}
          {message.content && (
            <div className={`leading-relaxed whitespace-pre-wrap break-words ${
              message.isDeleted ? 'italic text-gray-400 flex items-center gap-1.5' : ''
            }`}>
              {formatMessageText(message.content, searchQuery)}
            </div>
          )}

          {/* Bottom Timestamp & Double Checkmarks */}
          <div className="flex items-center justify-end gap-1 mt-1 text-[11px] float-right ml-3 select-none">
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {message.timeStr}
            </span>
            {isOutgoing && (
              <CheckCheck 
                size={14} 
                className={isDark ? 'text-[#53bdeb]' : 'text-[#53bdeb]'} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
