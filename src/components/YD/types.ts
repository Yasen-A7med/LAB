export interface YDAppProps {
  onBack: () => void;
}

export interface VideoDetails {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  durationFormatted: string;
  author: string;
  authorChannelUrl: string;
  viewCount: string;
  uploadDate: string;
}

export interface FormatItem {
  formatId?: string;
  quality: string;
  qualityLabel: string;
  height?: number;
  bitrate?: number;
  fps?: number;
  ext: string;
  container: string;
  hasVideo?: boolean;
  hasAudio?: boolean;
  filesizeFormatted?: string;
  url?: string;
}

export interface VideoFormatsData {
  video: FormatItem[];
  audio: FormatItem[];
}

export interface PlaylistEntry {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  durationFormatted: string;
  author: string;
  url: string;
}

export interface DownloadTaskItem {
  id: string;
  title: string;
  url: string;
  format: 'mp4' | 'mp3';
  quality: string;
  status: 'downloading' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  timestamp: string;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  author: string;
  videoCount: number;
}
