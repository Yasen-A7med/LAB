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
 * Convert Eastern Arabic-Indic numerals (٠-٩ and ۰-۹) to standard Western ASCII digits (0-9)
 */
export function normalizeDigits(str: string): string {
  if (!str) return '';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹';
  const englishDigits = '01234567890123456789';
  let res = '';
  for (let i = 0; i < str.length; i++) {
    const idx = arabicDigits.indexOf(str[i]);
    res += idx !== -1 ? englishDigits[idx] : str[i];
  }
  return res;
}

/**
 * Clean hidden Unicode control characters, directional marks, and normalize punctuation
 */
export function cleanUnicode(str: string): string {
  if (!str) return '';
  const noControlChars = str
    .replace(/[\u200E\u200F\u200B\u202A-\u202E\u202F\u2060\u2066-\u2069\uFEFF]/g, '')
    .replace(/\u200C|\u200D/g, '')
    .replace(/[\u060C]/g, ',') // Arabic comma '،'
    .replace(/\u00A0/g, ' ')   // Non-breaking space
    .trim();
  
  return normalizeDigits(noControlChars);
}

/**
 * Determine media type from file extension or file name
 */
export function getMediaTypeFromFilename(filename: string): MediaType {
  const cleanName = cleanUnicode(filename).toLowerCase().trim();
  const ext = cleanName.split('.').pop() || '';

  if (['webp'].includes(ext) || cleanName.startsWith('stk-')) {
    return 'sticker';
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'heic', 'svg', 'webp'].includes(ext) || cleanName.startsWith('img-')) {
    return 'image';
  }
  if (['opus', 'mp3', 'ogg', 'wav', 'm4a', 'aac', 'flac', 'amr'].includes(ext) || cleanName.startsWith('ptt-') || cleanName.startsWith('aud-')) {
    return 'audio';
  }
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp'].includes(ext) || cleanName.startsWith('vid-')) {
    return 'video';
  }
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar', 'csv', 'apk'].includes(ext)) {
    return 'document';
  }
  return 'document';
}

/**
 * Robust Multi-Locale Date & Time Parser
 */
export function parseWhatsAppDate(dateStr: string): { date: Date | null; dateKey: string; timeStr: string } {
  const cleaned = cleanUnicode(dateStr);
  let parsedDate: Date | null = null;

  // Normalise Arabic AM/PM markers and lowercase variations
  const normalised = cleaned
    .replace(/ص/gi, 'AM')
    .replace(/م/gi, 'PM')
    .replace(/a\.m\./gi, 'AM')
    .replace(/p\.m\./gi, 'PM')
    .replace(/\s*à\s*/gi, ', ')
    .trim();

  // Pattern matching: [P1/P2/P3] [Time Hours:Mins(:Secs)?] [AM/PM]?
  const match = normalised.match(/^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4})[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  
  if (match) {
    let p1 = parseInt(match[1], 10);
    let p2 = parseInt(match[2], 10);
    let p3 = parseInt(match[3], 10);
    let hours = parseInt(match[4], 10);
    const minutes = parseInt(match[5], 10);
    const seconds = match[6] ? parseInt(match[6], 10) : 0;
    const ampm = match[7] ? match[7].toUpperCase() : null;

    let year = p3;
    let month = p2;
    let day = p1;

    if (p1 > 1000) {
      // YYYY-MM-DD
      year = p1;
      month = p2;
      day = p3;
    } else if (p3 < 100) {
      // 2-digit year (e.g. 25, 26)
      year = 2000 + p3;
    }

    // Heuristic: if p1 <= 12 and p2 > 12 -> MM/DD/YYYY format
    if (p1 <= 12 && p2 > 12) {
      month = p1;
      day = p2;
    }

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    try {
      parsedDate = new Date(year, month - 1, day, hours, minutes, seconds);
      if (isNaN(parsedDate.getTime())) {
        parsedDate = null;
      }
    } catch {
      parsedDate = null;
    }
  }

  // Fallback to standard JS Date.parse if regex didn't resolve
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    const fallback = new Date(normalised);
    if (!isNaN(fallback.getTime())) {
      parsedDate = fallback;
    }
  }

  const dateKey = parsedDate && !isNaN(parsedDate.getTime())
    ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`
    : 'Unknown Date';

  // Format clean display time
  let timeStr = '';
  if (parsedDate && !isNaN(parsedDate.getTime())) {
    timeStr = parsedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  } else {
    const timeMatch = cleaned.match(/(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm|[\u202f\s]*[AP]M|ص|م)?)$/i);
    timeStr = timeMatch ? timeMatch[1].trim() : cleaned;
  }

  return { date: parsedDate, dateKey, timeStr };
}

/**
 * Detect and extract media attachment information from message content across languages
 */
export function extractMediaAttachment(content: string, mediaMap: Record<string, MediaAttachment>): {
  cleanContent: string;
  attachment?: MediaAttachment;
} {
  const trimmed = cleanUnicode(content);

  // Multi-lingual attachment regexes:
  // English: (file attached)
  // Arabic: (الملف مرفق), (تم إرفاق ملف)
  // French: (fichier joint)
  // Spanish: (archivo adjunto)
  // German: (Datei angehängt)
  // Portuguese: (arquivo anexado)
  // Italian: (allegato)
  const fileAttachedMatch = trimmed.match(/^([\w .-]+?\.[a-zA-Z0-9]{2,5})\s*\((?:file attached|الملف مرفق|تم إرفاق ملف|fichier joint|archivo adjunto|Datei angehängt|arquivo anexado|allegato)\)(.*)$/i);
  
  if (fileAttachedMatch) {
    const filename = cleanUnicode(fileAttachedMatch[1].trim());
    const remainingText = fileAttachedMatch[2].trim();
    const existing = mediaMap[filename] || mediaMap[fileAttachedMatch[1].trim()] || {
      fileName: filename,
      mediaType: getMediaTypeFromFilename(filename),
    };
    return { cleanContent: remainingText, attachment: existing };
  }

  // Tag format: <attached: filename.jpg> or <مرفق: filename.jpg>
  const attachedTagMatch = trimmed.match(/^<[\w\u0600-\u06FF]+:\s*([\w .-]+?\.[a-zA-Z0-9]{2,5})>(.*)$/i);
  if (attachedTagMatch) {
    const filename = cleanUnicode(attachedTagMatch[1].trim());
    const remainingText = attachedTagMatch[2].trim();
    const existing = mediaMap[filename] || mediaMap[attachedTagMatch[1].trim()] || {
      fileName: filename,
      mediaType: getMediaTypeFromFilename(filename),
    };
    return { cleanContent: remainingText, attachment: existing };
  }

  // Direct filename match in mediaMap
  if (mediaMap[trimmed]) {
    return { cleanContent: '', attachment: mediaMap[trimmed] };
  }

  return { cleanContent: content };
}

/**
 * Multilingual System Message Signatures
 */
const SYSTEM_PATTERNS = [
  /Messages and calls are end-to-end encrypted/i,
  /الرسائل والمكالمات مشفرة تمامًا/i,
  /changed the subject to/i,
  /changed the group/i,
  /created group/i,
  /أنشأ المجموعة/i,
  /added you/i,
  /added/i,
  /تمت إضافة/i,
  /أصبح .* ضمن جهات الاتصال/i,
  /left/i,
  /غادر/i,
  /removed/i,
  /تمت إزالة/i,
  /security code changed/i,
  /تم تغيير رمز الأمان/i,
  /Your security code with/i,
  /This chat is with a business/i,
  /missed group voice call/i,
  /missed voice call/i,
  /missed video call/i,
  /مكالمة صوتية فائتة/i,
  /مكالمة فيديو فائتة/i,
  /تم تغيير وصف المجموعة/i,
];

export function isSystemMessage(content: string, hasSender: boolean): boolean {
  if (!hasSender) return true;
  for (const pattern of SYSTEM_PATTERNS) {
    if (pattern.test(content)) return true;
  }
  return false;
}

/**
 * Main parser: parses raw WhatsApp chat text into a structured ChatSession
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
  // 1. Android: "8/17/26, 10:12 PM - Sender: Message" or "١٦/١١/٢٠٢٥، ٧:٣٩ ص - Sender: Message"
  const androidRegex = /^(\d{1,4}[./-]\d{1,2}[./-]\d{1,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm|[\u202f\s]*[AP]M|ص|م)?)\s*-\s*(?:([^:]+?):\s*)?(.*)$/i;

  // 2. iOS: "[17/08/2026, 22:12:30] Sender: Message" or "[١٦/١١/٢٠٢٥، ٧:٣٩:٠٠ ص] Sender: Message"
  const iosRegex = /^\[(\d{1,4}[./-]\d{1,2}[./-]\d{1,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm|[\u202f\s]*[AP]M|ص|م)?)\]\s*(?:([^:]+?):\s*)?(.*)$/i;

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
      const isDeleted = /This message was deleted|You deleted this message|تم حذف هذه الرسالة|حذفت هذه الرسالة/i.test(rawContent);

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
  let myPerspective = participantsList[0]?.name || '';
  const youParticipant = participantsList.find(p => p.name.toLowerCase() === 'you' || p.name.toLowerCase() === 'انت' || p.name.toLowerCase() === 'أنت');
  if (youParticipant) {
    myPerspective = youParticipant.name;
  } else if (participantsList.length >= 2) {
    const cleanFileName = cleanUnicode(fileName).toLowerCase();
    const otherParticipant = participantsList.find(p => !cleanFileName.includes(p.name.toLowerCase()));
    if (otherParticipant) {
      myPerspective = otherParticipant.name;
    }
  }

  // Derive chat title from file name or participants
  let chatTitle = cleanUnicode(fileName)
    .replace(/^دردشة في واتساب مع\s*/i, '')
    .replace(/^دردشة واتساب مع\s*/i, '')
    .replace(/^دردشة WhatsApp مع\s*/i, '')
    .replace(/^WhatsApp Chat with\s*/i, '')
    .replace(/^Discussion WhatsApp avec\s*/i, '')
    .replace(/^Chat de WhatsApp con\s*/i, '')
    .replace(/^WhatsApp-Chat mit\s*/i, '')
    .replace(/\.zip$/i, '')
    .replace(/\.txt$/i, '')
    .trim();

  if (!chatTitle || chatTitle === 'WhatsApp Chat' || chatTitle === '_chat' || chatTitle === 'دردشة واتساب') {
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
