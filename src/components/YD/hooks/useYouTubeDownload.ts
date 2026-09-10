import { useState, useEffect, useCallback } from 'react';
import type { 
  VideoDetails, 
  VideoFormatsData, 
  PlaylistEntry, 
  PlaylistInfo, 
  DownloadTaskItem 
} from '../types';
import { 
  COMPANION_URL, 
  isValidYouTubeUrl, 
  extractYouTubeVideoId, 
  triggerNativeDownload 
} from '../utils/ytHelpers';

export function useYouTubeDownload() {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoDetails | null>(null);
  const [formats, setFormats] = useState<VideoFormatsData | null>(null);

  // Selected Options
  const [activeTab, setActiveTab] = useState<'mp4' | 'mp3'>('mp4');
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p');
  const [audioOption, setAudioOption] = useState<'with_audio' | 'muted' | 'audio_only'>('with_audio');

  // Downloading State
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Downloads Manager Queue & History
  const [downloadQueue, setDownloadQueue] = useState<DownloadTaskItem[]>([]);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Companion server state
  const [companionAvailable, setCompanionAvailable] = useState<boolean | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  // Playlist state
  const [isPlaylist, setIsPlaylist] = useState(false);
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo | null>(null);
  const [playlistEntries, setPlaylistEntries] = useState<PlaylistEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [batchDownloading, setBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentTitle: '' });

  // Check companion status
  const checkCompanionConnection = useCallback(async () => {
    setIsCheckingConnection(true);
    try {
      const res = await fetch(`${COMPANION_URL}/ping`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          setCompanionAvailable(true);
          setIsCheckingConnection(false);
          return true;
        }
      }
    } catch {
      // offline
    }
    setCompanionAvailable(false);
    setIsCheckingConnection(false);
    return false;
  }, []);

  useEffect(() => {
    checkCompanionConnection();
  }, [checkCompanionConnection]);

  const registerDownloadTask = useCallback((title: string, url: string, fmt: 'mp4' | 'mp3', quality: string) => {
    const taskId = Math.random().toString(36).substring(2, 9);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newTask: DownloadTaskItem = {
      id: taskId,
      title,
      url,
      format: fmt,
      quality,
      status: 'downloading',
      timestamp: timeStr
    };

    setDownloadQueue(prev => [newTask, ...prev]);

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 120) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`${COMPANION_URL}/status?url=${encodeURIComponent(url)}&format=${fmt}&quality=${encodeURIComponent(quality)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'completed') {
            setDownloadQueue(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t));
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setDownloadQueue(prev => prev.map(t => t.id === taskId ? { ...t, status: 'failed', error: data.error || 'Download failed' } : t));
            clearInterval(interval);
          } else if (data.status === 'serving' || data.status === 'downloading') {
            setDownloadQueue(prev => prev.map(t => t.id === taskId ? { ...t, status: 'downloading', progress: data.progress || 15 } : t));
          }
        }
      } catch {
        // silent fail on network polling error
      }
    }, 1500);

    return taskId;
  }, []);

  const copyLogCommand = useCallback((task: DownloadTaskItem) => {
    const cmd = `python yd_companion.py --url "${task.url}"`;
    navigator.clipboard.writeText(cmd);
    setCopiedLogId(task.id);
    setTimeout(() => setCopiedLogId(null), 2500);
  }, []);

  const fetchVideoInfo = useCallback(async (targetUrl: string) => {
    if (!targetUrl.trim()) return;

    if (!isValidYouTubeUrl(targetUrl)) {
      setErrorMsg('Please enter a valid YouTube video, Shorts, or Playlist link.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setVideoData(null);
    setFormats(null);
    setDownloadSuccess(false);
    setIsPlaylist(false);
    setPlaylistInfo(null);
    setPlaylistEntries([]);
    setSelectedEntries(new Set());

    try {
      let data: any = null;

      // Strategy 1: Local companion server
      try {
        const res = await fetch(`${COMPANION_URL}/info?url=${encodeURIComponent(targetUrl.trim())}`, {
          signal: AbortSignal.timeout(15000)
        });
        if (res.ok) {
          data = await res.json();
          if (data.success) {
            setCompanionAvailable(true);
          }
        }
      } catch {
        // Companion not running
      }

      // If companion returned a playlist, handle it
      if (data && data.success && data.isPlaylist) {
        setIsPlaylist(true);
        setPlaylistInfo(data.playlist);
        setPlaylistEntries(data.entries || []);
        const allIds = new Set<string>((data.entries || []).map((e: PlaylistEntry) => e.id));
        setSelectedEntries(allIds);
        setLoading(false);
        return;
      }

      // Strategy 2: oEmbed fallback
      if (!data || !data.success) {
        const videoId = extractYouTubeVideoId(targetUrl);

        if (!videoId) {
          if (targetUrl.includes('list=')) {
            throw new Error('Playlist detected but the Companion engine is not running. Start the companion to download playlists.');
          }
          throw new Error('Invalid YouTube video link. Please check the URL.');
        }

        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (!oembedRes.ok) {
          throw new Error('Failed to fetch video details from YouTube.');
        }

        const oembed = await oembedRes.json();
        data = {
          success: true,
          video: {
            id: videoId,
            title: oembed.title || 'YouTube Video',
            description: 'High Quality YouTube Media Stream',
            thumbnail: oembed.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            duration: 210,
            durationFormatted: '03:30',
            author: oembed.author_name || 'YouTube Channel',
            authorChannelUrl: oembed.author_url || `https://www.youtube.com/watch?v=${videoId}`,
            viewCount: '—',
            rawViewCount: 0,
            uploadDate: ''
          },
          formats: {
            video: [
              { quality: '1080p', qualityLabel: '1080p Full HD', height: 1080, ext: 'mp4', container: 'mp4', filesizeFormatted: '~45 MB' },
              { quality: '720p', qualityLabel: '720p HD', height: 720, ext: 'mp4', container: 'mp4', filesizeFormatted: '~22 MB' },
              { quality: '480p', qualityLabel: '480p Standard', height: 480, ext: 'mp4', container: 'mp4', filesizeFormatted: '~14 MB' },
              { quality: '360p', qualityLabel: '360p Medium', height: 360, ext: 'mp4', container: 'mp4', filesizeFormatted: '~8 MB' }
            ],
            audio: [
              { quality: '320kbps', qualityLabel: '320 kbps High Quality', bitrate: 320, ext: 'mp3', container: 'mp3', filesizeFormatted: '~8.5 MB' },
              { quality: '192kbps', qualityLabel: '192 kbps Standard', bitrate: 192, ext: 'mp3', container: 'mp3', filesizeFormatted: '~5.2 MB' },
              { quality: '128kbps', qualityLabel: '128 kbps Medium', bitrate: 128, ext: 'mp3', container: 'mp3', filesizeFormatted: '~3.4 MB' }
            ]
          }
        };
      }

      setVideoData(data.video);
      setFormats(data.formats);

      if (data.formats.video && data.formats.video.length > 0) {
        setSelectedQuality(data.formats.video[0].quality);
      } else if (data.formats.audio && data.formats.audio.length > 0) {
        setSelectedQuality(data.formats.audio[0].quality);
      }

    } catch (err: any) {
      console.error('Fetch video info error:', err);
      setErrorMsg(err.message || 'Unable to connect to YouTube server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePasteClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.includes('youtube.com') || text.includes('youtu.be'))) {
        setUrlInput(text.trim());
        fetchVideoInfo(text.trim());
      } else if (text) {
        setUrlInput(text.trim());
      }
    } catch (err) {
      console.warn('Clipboard access denied or unreadable:', err);
    }
  }, [fetchVideoInfo]);

  const toggleEntry = useCallback((id: string) => {
    setSelectedEntries(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAllEntries = useCallback(() => {
    if (selectedEntries.size === playlistEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(playlistEntries.map(e => e.id)));
    }
  }, [playlistEntries, selectedEntries.size]);

  const handleDownload = useCallback(async (onRequireSetup: () => void) => {
    if (!videoData) return;

    if (companionAvailable) {
      setIsDownloading(true);
      setDownloadProgress(50);
      setDownloadSuccess(false);
      setErrorMsg(null);

      try {
        const downloadUrl = `${COMPANION_URL}/download?url=${encodeURIComponent(urlInput.trim())}&format=${activeTab}&quality=${encodeURIComponent(selectedQuality)}`;
        registerDownloadTask(videoData.title, urlInput.trim(), activeTab, selectedQuality);
        triggerNativeDownload(downloadUrl);

        setDownloadProgress(100);
        setIsDownloading(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      } catch (err: any) {
        setIsDownloading(false);
        setDownloadProgress(0);
        setErrorMsg(err.message || 'Download failed. Make sure the companion server is running.');
      }
      return;
    }

    onRequireSetup();
  }, [activeTab, companionAvailable, registerDownloadTask, selectedQuality, urlInput, videoData]);

  const handleBatchDownload = useCallback(async (onRequireSetup: () => void) => {
    if (!companionAvailable) {
      onRequireSetup();
      return;
    }

    const selected = playlistEntries.filter(e => selectedEntries.has(e.id));
    if (selected.length === 0) return;

    setBatchDownloading(true);
    setBatchProgress({ current: 0, total: selected.length, currentTitle: '' });

    for (let i = 0; i < selected.length; i++) {
      const entry = selected[i];
      setBatchProgress({ current: i + 1, total: selected.length, currentTitle: entry.title });

      try {
        const rawVideoUrl = entry.url || `https://www.youtube.com/watch?v=${entry.id}`;
        const videoId = extractYouTubeVideoId(rawVideoUrl);
        const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : rawVideoUrl.trim();
        const downloadUrl = `${COMPANION_URL}/download?url=${encodeURIComponent(videoUrl)}&format=${activeTab}&quality=${encodeURIComponent(selectedQuality)}`;

        registerDownloadTask(entry.title, videoUrl, activeTab, selectedQuality);
        triggerNativeDownload(downloadUrl);

        await new Promise(r => setTimeout(r, 4000));
      } catch (err) {
        console.error(`Failed to download: ${entry.title}`, err);
      }
    }

    setBatchDownloading(false);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 5000);
  }, [activeTab, companionAvailable, playlistEntries, registerDownloadTask, selectedEntries, selectedQuality]);

  return {
    urlInput,
    setUrlInput,
    loading,
    errorMsg,
    videoData,
    formats,
    activeTab,
    setActiveTab,
    selectedQuality,
    setSelectedQuality,
    audioOption,
    setAudioOption,
    isDownloading,
    downloadSuccess,
    downloadProgress,
    downloadQueue,
    setDownloadQueue,
    copiedLogId,
    copyLogCommand,
    companionAvailable,
    isCheckingConnection,
    checkCompanionConnection,
    isPlaylist,
    playlistInfo,
    playlistEntries,
    selectedEntries,
    batchDownloading,
    batchProgress,
    toggleEntry,
    toggleAllEntries,
    fetchVideoInfo,
    handleDownload,
    handleBatchDownload,
    handlePasteClipboard
  };
}
