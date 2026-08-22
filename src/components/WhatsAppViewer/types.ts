export type MediaType = 'image' | 'sticker' | 'audio' | 'video' | 'document' | 'none';

export interface MediaAttachment {
  fileName: string;
  blobUrl?: string;
  mediaType: MediaType;
  size?: number;
  mimeType?: string;
}

export interface ChatMessage {
  id: string;
  rawDateStr: string;
  timestamp: Date | null;
  dateKey: string;
  timeStr: string;
  sender: string;
  isSystem: boolean;
  isDeleted?: boolean;
  content: string;
  attachment?: MediaAttachment;
  searchMatch?: boolean;
}

export interface ChatParticipant {
  name: string;
  messageCount: number;
  mediaCount: number;
  color: string;
}

export interface ChatSession {
  title: string;
  participants: ChatParticipant[];
  myPerspective: string;
  messages: ChatMessage[];
  mediaMap: Record<string, MediaAttachment>;
  startDate: Date | null;
  endDate: Date | null;
  totalMessages: number;
  totalMedia: number;
  isGroup: boolean;
}

export interface FilterOptions {
  searchQuery: string;
  selectedSender: string;
  mediaFilter: 'all' | 'text' | 'media' | 'audio' | 'stickers' | 'docs' | 'links';
  dateFilter?: string;
}
