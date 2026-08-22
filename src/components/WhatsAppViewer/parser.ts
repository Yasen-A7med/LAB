import type { ChatMessage, ChatParticipant, ChatSession, MediaAttachment, MediaType } from './types';

// Vibrant WhatsApp-style participant colors
const PARTICIPANT_COLORS = [
  '#00a884',
  '#53bdeb',
  '#ff8000',
  '#a62c2b',
  '#e542a3',
  '#7ac82e',
  '#b995e8',
  '#dfa200',
  '#26a69a',
  '#ba33dc',
  '#029d00',
];

/**
 * Clean hidden Unicode control characters (such as \u200E, \u200F, \u202F, \u200B)
 */
export function cleanUnicode(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\u200E\u200F\u200B\uFEFF]/g, '')
    .replace(/\u202F/g, ' ')
    .trim();
}

/**
 * Determine media type from file extension or file name
 */
export function getMediaTypeFromFilename(filename: string): MediaType {
  const cleanName = filename.toLowerCase().trim();
  const ext = cleanName.split('.').pop() || '';

  if (['webp'].includes(ext) || cleanName.startsWith('stk-')) {
    return 'sticker';
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'heic', 'svg'].includes(ext)) {
    return 'image';
  }
  if (['opus', 'mp3', 'ogg', 'wav', 'm4a', 'aac', 'flac'].includes(ext) || cleanName.startsWith('ptt-') || cleanName.startsWith('aud-')) {
    return 'audio';
  }
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp'].includes(ext) || cleanName.startsWith('vid-')) {
    return 'video';
  }
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar', 'csv'].includes(ext)) {
    return 'document';
  }
  return 'document';
}

/**
 * Try to parse datetime string from WhatsApp headers into a JS Date object
 */
export function parseWhatsAppDate(dateStr: string): { date: Date | null; dateKey: string; timeStr: string } {
  const cleaned = cleanUnicode(dateStr);
  let parsedDate: Date | null = null;

  // Normalise Arabic AM/PM markers if present
  const normalised = cleaned
    .replace(/(\d+)\s*ص/g, '$1 AM')
    .replace(/(\d+)\s*م/g, '$1 PM');

  // Common pattern: 8/17/26, 10:12 PM or 17/08/2026, 22:12 or 17/08/26 10:12:30
  // Match components: [Month/Day/Year or Day/Month/Year] and [Time]
  const match = normalised.match(/^(\d{1,4})[./\-](\d{1,2})[./\-](\d{1,4})[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/);
  
  if (match) {
    let p1 = parseInt(match[1], 10);
    let p2 = parseInt(match[2], 10);
    let p3 = parseInt(match[3], 10);
    let hours = parseInt(match[4], 10);
    const minutes = parseInt(match[5], 10);
    const seconds = match[6] ? parseInt(match[6], 10) : 0;
    const ampm = match[7] ? match[7].toUpperCase() : null;

    // Handle 2-digit year vs 4-digit year
    let year = p3;
    let month = p1;
    let day = p2;

    if (p1 > 1000) {
      // YYYY-MM-DD
      year = p1;
      month = p2;
      day = p3;
    } else if (p3 < 100) {
      year = 2000 + p3;
    }

    // Heuristic: if p1 > 12 and p2 <= 12, then p1 is day and p2 is month (DD/MM/YY)
    if (p1 > 12 && p2 <= 12) {
      day = p1;
      month = p2;
    }

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    try {
      parsedDate = new Date(year, month - 1, day, hours, minutes, seconds);
    } catch {
      parsedDate = null;
    }
  }

  // Fallback to Date.parse
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    const fallback = new Date(cleaned);
    if (!isNaN(fallback.getTime())) {
      parsedDate = fallback;
    }
  }

  const dateKey = parsedDate && !isNaN(parsedDate.getTime())
    ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`
    : 'Unknown Date';

  // Extract time portion for display
  let timeStr = '';
  const timeMatch = cleaned.match(/(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm|[\u202f\s]*[AP]M|ص|م)?)$/);
  if (timeMatch) {
    timeStr = timeMatch[1].trim();
  } else if (parsedDate && !isNaN(parsedDate.getTime())) {
    timeStr = parsedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  } else {
    timeStr = cleaned;
  }

  return { date: parsedDate, dateKey, timeStr };
}

/**
 * Detect and extract media attachment information from message content
 */
export function extractMediaAttachment(content: string, mediaMap: Record<string, MediaAttachment>): {
  cleanContent: string;
  attachment?: MediaAttachment;
} {
  const trimmed = content.trim();

  // Patterns:
  // 1. "STK-20260717-WA0007.webp (file attached)"
  // 2. "<attached: STK-20260717-WA0007.webp>"
  // 3. "‎<attached: PTT-20260821-WA0210.opus>"
  // 4. "‎image omitted" / "video omitted" / "audio omitted" / "sticker omitted"
  
  const fileAttachedMatch = trimmed.match(/^([\w\- .]+?\.[a-zA-Z0-9]{2,5})\s*\(file attached\)(.*)$/i);
  if (fileAttachedMatch) {
    const filename = fileAttachedMatch[1].trim();
    const remainingText = fileAttachedMatch[2].trim();
    const existing = mediaMap[filename] || {
      fileName: filename,
      mediaType: getMediaTypeFromFilename(filename),
    };
    return { cleanContent: remainingText, attachment: existing };
  }

  const attachedTagMatch = trimmed.match(/^<attached:\s*([\w\- .]+?\.[a-zA-Z0-9]{2,5})>(.*)$/i);
  if (attachedTagMatch) {
    const filename = attachedTagMatch[1].trim();
    const remainingText = attachedTagMatch[2].trim();
    const existing = mediaMap[filename] || {
      fileName: filename,
      mediaType: getMediaTypeFromFilename(filename),
    };
    return { cleanContent: remainingText, attachment: existing };
  }

  // Check if entire content is just a filename that exists in mediaMap
  if (mediaMap[trimmed]) {
    return { cleanContent: '', attachment: mediaMap[trimmed] };
  }

  return { cleanContent: content };
}

/**
 * System message signatures
 */
const SYSTEM_PATTERNS = [
  /Messages and calls are end-to-end encrypted/i,
  /changed the subject to/i,
  /changed the group/i,
  /created group/i,
  /added you/i,
  /added/i,
  /left/i,
  /removed/i,
  /security code changed/i,
  /Your security code with/i,
  /This chat is with a business/i,
  /missed group voice call/i,
  /missed voice call/i,
  /missed video call/i,
];

export function isSystemMessage(content: string, hasSender: boolean): boolean {
  if (!hasSender) return true;
  for (const pattern of SYSTEM_PATTERNS) {
    if (pattern.test(content)) return true;
  }
  return false;
}

/**
 * Main parser: parse raw WhatsApp chat text into structured ChatSession
 */
export function parseWhatsAppChat(
  rawText: string,
  fileName: string = 'WhatsApp Chat',
  mediaMap: Record<string, MediaAttachment> = {}
): ChatSession {
  const lines = rawText.split(/\r?\n/);
  const messages: ChatMessage[] = [];
  const senderCounts: Record<string, { count: number; media: number }> = {};

  // Standard Header Regexes:
  // 1. Android: "8/17/26, 10:12 PM - Sender: Message" or "8/17/26, 10:12 PM - System Notification"
  const androidRegex = /^(\d{1,4}[./\-]\d{1,2}[./\-]\d{1,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm|[\u202f\s]*[AP]M|ص|م)?)\s*-\s*(?:([^:]+?):\s*)?(.*)$/;

  // 2. iOS: "[17/08/2026, 22:12:30] Sender: Message" or "[8/17/26, 10:12 PM] System message"
  const iosRegex = /^\[(\d{1,4}[./\-]\d{1,2}[./\-]\d{1,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm|[\u202f\s]*[AP]M|ص|م)?)\]\s*(?:([^:]+?):\s*)?(.*)$/;

  let currentMessage: ChatMessage | null = null;
  let totalMediaCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const cleanedLine = cleanUnicode(rawLine);
    if (!cleanedLine && !currentMessage) continue;

    let dateMatch: RegExpMatchArray | null = null;

    if (cleanedLine.startsWith('[')) {
      dateMatch = cleanedLine.match(iosRegex);
    } else {
      dateMatch = cleanedLine.match(androidRegex);
    }

    if (dateMatch) {
      // Save previous message
      if (currentMessage) {
        messages.push(currentMessage);
      }

      const rawDate = dateMatch[1];
      const rawSender = dateMatch[2] ? dateMatch[2].trim() : undefined;
      const rawContent = dateMatch[3] !== undefined ? dateMatch[3] : '';

      const { date, dateKey, timeStr } = parseWhatsAppDate(rawDate);
      const isSystem = !rawSender || isSystemMessage(rawContent, !!rawSender);

      const sender = isSystem ? 'System' : (rawSender || 'Unknown');
      const isDeleted = /This message was deleted|You deleted this message|تم حذف هذه الرسالة/i.test(rawContent);

      const { cleanContent, attachment } = extractMediaAttachment(rawContent, mediaMap);
      if (attachment) {
        totalMediaCount++;
      }

      if (!isSystem) {
        if (!senderCounts[sender]) {
          senderCounts[sender] = { count: 0, media: 0 };
        }
        senderCounts[sender].count++;
        if (attachment) {
          senderCounts[sender].media++;
        }
      }

      currentMessage = {
        id: `msg-${messages.length}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        rawDateStr: rawDate,
        timestamp: date,
        dateKey,
        timeStr,
        sender,
        isSystem,
        isDeleted,
        content: cleanContent,
        attachment,
      };
    } else if (currentMessage) {
      // Multiline message continuation
      currentMessage.content = currentMessage.content
        ? `${currentMessage.content}\n${rawLine}`
        : rawLine;
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  // Compute participants list with assigned theme colors
  const participantsList: ChatParticipant[] = Object.keys(senderCounts).map((name, idx) => ({
    name,
    messageCount: senderCounts[name].count,
    mediaCount: senderCounts[name].media,
    color: PARTICIPANT_COLORS[idx % PARTICIPANT_COLORS.length],
  }));

  // Sort participants by message count descending
  participantsList.sort((a, b) => b.messageCount - a.messageCount);

  // Derive default perspective (primary user on the right side)
  // Usually the second most frequent speaker or "You" / user if named
  let myPerspective = participantsList[0]?.name || '';
  const youParticipant = participantsList.find(p => p.name.toLowerCase() === 'you' || p.name.toLowerCase() === 'انت');
  if (youParticipant) {
    myPerspective = youParticipant.name;
  } else if (participantsList.length >= 2) {
    // If chat title or filename contains participant name (e.g. "WhatsApp Chat with Yaseen Shehab.txt")
    // Then the other person is likely the exporter ("me")
    const cleanFileName = fileName.toLowerCase();
    const otherParticipant = participantsList.find(p => !cleanFileName.includes(p.name.toLowerCase()));
    if (otherParticipant) {
      myPerspective = otherParticipant.name;
    }
  }

  // Derive chat title from file name or participants
  let chatTitle = fileName
    .replace(/^WhatsApp Chat with /i, '')
    .replace(/\.zip$/i, '')
    .replace(/\.txt$/i, '')
    .trim();

  if (!chatTitle || chatTitle === 'WhatsApp Chat' || chatTitle === '_chat') {
    if (participantsList.length === 1) {
      chatTitle = participantsList[0].name;
    } else if (participantsList.length === 2) {
      chatTitle = participantsList.map(p => p.name).join(' & ');
    } else if (participantsList.length > 2) {
      chatTitle = `${participantsList[0].name}, ${participantsList[1].name} & others`;
    } else {
      chatTitle = 'WhatsApp Conversation';
    }
  }

  const validDates = messages.map(m => m.timestamp).filter((d): d is Date => d !== null && !isNaN(d.getTime()));
  const startDate = validDates.length > 0 ? validDates[0] : null;
  const endDate = validDates.length > 0 ? validDates[validDates.length - 1] : null;

  return {
    title: chatTitle,
    participants: participantsList,
    myPerspective,
    messages,
    mediaMap,
    startDate,
    endDate,
    totalMessages: messages.length,
    totalMedia: totalMediaCount,
    isGroup: participantsList.length > 2,
  };
}
