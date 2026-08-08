import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  ArrowLeft, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Music, 
  Film, 
  Check, 
  AlertCircle, 
  Loader2, 
  Clipboard, 
  ExternalLink,
  Clock,
  Eye,
  User,
  Zap,
  RefreshCw,
  ListVideo,
  CheckSquare,
  Square
} from 'lucide-react';
import AnimatedLiquidBackground from '../AnimatedLiquidBackground';

const YoutubeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface YDAppProps {
  onBack: () => void;
}

interface VideoDetails {
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

interface FormatItem {
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

interface VideoFormatsData {
  video: FormatItem[];
  audio: FormatItem[];
}

interface PlaylistEntry {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  durationFormatted: string;
  author: string;
  url: string;
}

interface PlaylistInfo {
  id: string;
  title: string;
  author: string;
  videoCount: number;
}


export const YDApp: React.FC<YDAppProps> = ({ onBack }) => {
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

  // Companion server state
  const [companionAvailable, setCompanionAvailable] = useState<boolean | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showFullInstructions, setShowFullInstructions] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const COMPANION_URL = 'http://localhost:8765';

  // Playlist state
  const [isPlaylist, setIsPlaylist] = useState(false);
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo | null>(null);
  const [playlistEntries, setPlaylistEntries] = useState<PlaylistEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [batchDownloading, setBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentTitle: '' });

  // Check companion server on mount
  React.useEffect(() => {
    const checkCompanion = async () => {
      try {
        const res = await fetch(`${COMPANION_URL}/ping`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'ok') {
            setCompanionAvailable(true);
            return;
          }
        }
      } catch {}
      setCompanionAvailable(false);
    };
    checkCompanion();
  }, []);

  // Auto-detect YouTube URL from clipboard on click
  const handlePasteClipboard = async () => {
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
  };

  // Validate YouTube URL
  const isValidYouTubeUrl = (url: string) => {
    return /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url.trim());
  };

  // Fetch Video Info — tries local companion first, then Vercel API, then oEmbed fallback
  const fetchVideoInfo = async (targetUrl: string) => {
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

      // Strategy 1: Local companion server (has real stream URLs)
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
        // Companion not running, fall through
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

      // Strategy 2: oEmbed for metadata (always works, but no stream URLs)
      if (!data || !data.success) {
        const match = targetUrl.trim().match(/(?:v=|\/shorts\/|\/embed\/|youtu\.be\/|\/v\/|\/e\/)([\\w-]{11})/);
        const videoId = match ? match[1] : null;

        if (!videoId) {
          // Could be a playlist URL without companion — inform user
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

      // Auto select best available quality
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
  };

  // Toggle playlist entry selection
  const toggleEntry = (id: string) => {
    setSelectedEntries(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllEntries = () => {
    if (selectedEntries.size === playlistEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(playlistEntries.map(e => e.id)));
    }
  };

  // Batch download selected playlist videos
  const handleBatchDownload = async () => {
    if (!companionAvailable) {
      setShowSetupGuide(true);
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
        const videoUrl = entry.url || `https://www.youtube.com/watch?v=${entry.id}`;
        const downloadUrl = `${COMPANION_URL}/download?url=${encodeURIComponent(videoUrl)}&format=${activeTab}&quality=${encodeURIComponent(selectedQuality)}`;

        const response = await fetch(downloadUrl);
        if (!response.ok) {
          console.error(`Download failed with status ${response.status} for: ${entry.title}`);
          continue;
        }

        // If the server accidentally returned JSON error with 200 OK
        const respContentType = response.headers.get('content-type');
        if (respContentType && respContentType.includes('application/json')) {
          console.error(`Server returned JSON instead of media file for: ${entry.title}`);
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        const contentType = activeTab === 'mp3' ? 'audio/mpeg' : 'video/mp4';
        const blob = new Blob([arrayBuffer], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);

        const cleanTitle = entry.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
        const filename = `${cleanTitle}.${activeTab === 'mp3' ? 'mp3' : 'mp4'}`;

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Keep Blob URL alive for 60 seconds so browser download manager finishes saving file
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 60000);

        // Delay between downloads so browser download manager handles them cleanly
        await new Promise(r => setTimeout(r, 2500));
      } catch (err) {
        console.error(`Failed to download: ${entry.title}`, err);
      }
    }

    setBatchDownloading(false);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 5000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideoInfo(urlInput);
  };

  // Initiate Download
  const handleDownload = async () => {
    if (!videoData) return;

    // If companion is available, use the /download endpoint (downloads merged file)
    if (companionAvailable) {
      setIsDownloading(true);
      setDownloadProgress(5);
      setDownloadSuccess(false);
      setErrorMsg(null);

      try {
        const downloadUrl = `${COMPANION_URL}/download?url=${encodeURIComponent(urlInput.trim())}&format=${activeTab}&quality=${encodeURIComponent(selectedQuality)}`;

        const response = await fetch(downloadUrl);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: 'Download failed' }));
          throw new Error(errData.error || 'Download failed');
        }

        const contentLength = Number(response.headers.get('Content-Length') || 0);
        const reader = response.body?.getReader();
        const chunks: BlobPart[] = [];
        let received = 0;

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            if (contentLength > 0) {
              setDownloadProgress(Math.min(95, Math.round((received / contentLength) * 95)));
            } else {
              setDownloadProgress(Math.min(90, 5 + Math.round(received / 100000)));
            }
          }
        }

        const arrayBuffer = await response.arrayBuffer();
        const contentType = activeTab === 'mp3' ? 'audio/mpeg' : 'video/mp4';
        const blob = new Blob([arrayBuffer], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);

        const cleanTitle = videoData.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
        const filename = `${cleanTitle}.${activeTab === 'mp3' ? 'mp3' : 'mp4'}`;

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Keep Blob URL alive for 60 seconds so browser download manager finishes saving file
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 60000);

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

    // No companion available — show setup guide
    setShowSetupGuide(true);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#030308] text-white flex flex-col relative overflow-hidden font-sans select-none">
      
      {/* Background Liquid Animation */}
      <AnimatedLiquidBackground />

      {/* Glow Effects */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Companion Status Badge */}
      {companionAvailable !== null && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium backdrop-blur-xl border ${companionAvailable ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400 cursor-pointer hover:bg-amber-500/20'}`}
               onClick={() => !companionAvailable && setShowSetupGuide(true)}>
            <div className={`w-2 h-2 rounded-full ${companionAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {companionAvailable ? 'Engine Connected' : 'Engine Offline — Click to Setup'}
          </div>
        </div>
      )}

      {/* Setup Guide Modal */}
      <AnimatePresence>
        {showSetupGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSetupGuide(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0f0f1a] border border-white/10 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Zap size={20} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">YD Companion Engine</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${companionAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <p className={`text-xs font-semibold ${companionAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {companionAvailable ? 'Connected and Ready' : 'Offline or Not Found'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFullInstructions(!showFullInstructions)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    showFullInstructions 
                      ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
                  }`}
                >
                  First time?
                </button>
              </div>

              {/* Minimal / Connection test view when instructions are hidden */}
              {!showFullInstructions && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-300 mb-4 text-center">
                    The companion engine is a small Python script that runs locally to handle high-quality video and playlist downloads. 
                    Ensure it's running in your terminal, then check connection.
                  </p>
                  
                  <button
                    onClick={async () => {
                      setIsCheckingConnection(true);
                      try {
                        const res = await fetch(`${COMPANION_URL}/ping`, { signal: AbortSignal.timeout(2000) });
                        if (res.ok) {
                          const data = await res.json();
                          if (data.status === 'ok') setCompanionAvailable(true);
                        } else {
                          setCompanionAvailable(false);
                        }
                      } catch {
                        setCompanionAvailable(false);
                      }
                      setIsCheckingConnection(false);
                    }}
                    disabled={isCheckingConnection}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-bold transition-all"
                  >
                    {isCheckingConnection ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    {isCheckingConnection ? 'Checking...' : 'Test Connection'}
                  </button>
                </div>
              )}

              {showFullInstructions && (
                <div className="space-y-4 mb-6 border-t border-white/10 pt-5">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-red-400 shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="text-white text-sm font-semibold">Install Python & yt-dlp</p>
                      <p className="text-gray-400 text-xs mt-0.5">Make sure <a href="https://www.python.org/downloads/" target="_blank" rel="noopener" className="text-red-400 underline">Python</a> is installed, then open Terminal/CMD and run:</p>
                      <code className="block mt-2 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono select-all">pip install yt-dlp</code>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-red-400 shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="text-white text-sm font-semibold">Download the Companion</p>
                      <p className="text-gray-400 text-xs mt-0.5">Download this small script file to your computer:</p>
                      <a href="/yd_companion.py" download className="inline-flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs font-semibold transition-all">
                        <Download size={14} />
                        Download yd_companion.py
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-red-400 shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="text-white text-sm font-semibold">Run it</p>
                      <p className="text-gray-400 text-xs mt-0.5">Just <span className="text-white font-medium">double-click</span> the downloaded file to open it. If your system asks for permissions, approve them to allow the app to run.</p>
                      <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-amber-300 text-[11px]"><span className="font-semibold">Didn't open?</span> Open Terminal/CMD, navigate to the file location, and run manually:</p>
                        <code className="block mt-1.5 bg-black/50 border border-white/10 rounded px-2 py-1.5 text-[11px] text-emerald-400 font-mono select-all">python yd_companion.py</code>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-red-400 shrink-0 mt-0.5">4</div>
                    <div>
                      <p className="text-white text-sm font-semibold">Ready to Download</p>
                      <p className="text-gray-400 text-xs mt-0.5">Once the companion window appears, come back here. The badge in the bottom-right will show <span className="text-emerald-400 font-medium">"Engine Connected"</span> and you can download any video or playlist.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSetupGuide(false)}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-4 flex items-center justify-between">
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-semibold backdrop-blur-xl group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to LAB</span>
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-lg shadow-red-600/20">
            <YoutubeIcon size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            YD <span className="text-red-500 text-xs uppercase font-mono px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 ml-1">Suite</span>
          </span>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 py-6 flex flex-col items-center">
        
        {/* Title & Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-3 shadow-lg shadow-red-500/10">
            <Sparkles size={14} className="animate-pulse" />
            <span>High-Speed YouTube Video & Playlist Downloader for PC</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Download Videos & Playlists in <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">Ultra High Speed</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            Built for PC / Desktop (Windows & Mac). Paste any YouTube video or playlist link below to extract entries, select resolution, and download at maximum speed.
          </p>
        </motion.div>

        {/* Input Bar Form */}
        <motion.form 
          onSubmit={handleFormSubmit}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full relative mb-6"
        >
          <div className="relative flex items-center bg-[#0a0a14]/90 border border-white/10 hover:border-red-500/50 focus-within:border-red-500 rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 shadow-2xl transition-all backdrop-blur-2xl group">
            
            <div className="pl-3 pr-2 text-gray-400 group-focus-within:text-red-500 transition-colors">
              <YoutubeIcon size={22} />
            </div>

            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
              className="flex-1 bg-transparent text-white text-xs sm:text-sm placeholder-gray-500 outline-none px-2 py-2 font-medium"
            />

            {/* Clear / Paste Button */}
            {urlInput ? (
              <button
                type="button"
                onClick={() => setUrlInput('')}
                className="px-2.5 py-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 hover:text-white text-xs font-semibold transition-all border border-white/10"
              >
                <Clipboard size={14} />
                <span>Paste</span>
              </button>
            )}

            {/* Fetch Button */}
            <button
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="ml-2 px-5 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>Fetch Info</span>
                </>
              )}
            </button>
          </div>
        </motion.form>



        {/* Error Alert */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3 shadow-xl backdrop-blur-xl"
            >
              <AlertCircle size={20} className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Spinner Skeleton */}
        {loading && (
          <div className="w-full p-8 rounded-3xl bg-[#0a0a14]/60 border border-white/10 backdrop-blur-2xl flex flex-col items-center justify-center gap-4">
            <Loader2 size={36} className="animate-spin text-red-500" />
            <p className="text-sm text-gray-300 font-medium">Extracting YouTube streams and available resolutions...</p>
          </div>
        )}

        {/* Playlist UI Panel */}
        {isPlaylist && playlistInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full bg-[#0a0a14]/90 border border-white/[0.12] rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-6"
          >
            {/* Playlist Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                  <ListVideo size={14} />
                  <span>Playlist</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug line-clamp-2">
                  {playlistInfo.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-gray-400 font-semibold">
                  <span className="flex items-center gap-1.5"><User size={14} className="text-indigo-400" /> {playlistInfo.author}</span>
                  <span>•</span>
                  <span>{playlistInfo.videoCount} videos</span>
                </div>
              </div>
              
              {/* Batch Actions */}
              <div className="flex flex-col items-end gap-3 shrink-0 w-full sm:w-auto">
                {/* Format Tabs for Playlist */}
                <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/10 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setActiveTab('mp4');
                      setSelectedQuality('1080p');
                    }}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'mp4' 
                        ? 'bg-red-600 text-white shadow-md' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Film size={14} /> MP4
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('mp3');
                      setSelectedQuality('320kbps');
                    }}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'mp3' 
                        ? 'bg-red-600 text-white shadow-md' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Music size={14} /> MP3
                  </button>
                </div>

                {/* Quality Selector for Playlist */}
                <div className="flex items-center gap-2 w-full sm:w-auto bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quality:</label>
                  <select 
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    className="bg-transparent text-xs text-white font-bold outline-none cursor-pointer"
                  >
                    {activeTab === 'mp4' ? (
                      <>
                        <option value="1080p" className="bg-[#0a0a14]">1080p HD</option>
                        <option value="720p" className="bg-[#0a0a14]">720p</option>
                        <option value="480p" className="bg-[#0a0a14]">480p</option>
                        <option value="360p" className="bg-[#0a0a14]">360p</option>
                      </>
                    ) : (
                      <>
                        <option value="320kbps" className="bg-[#0a0a14]">320 kbps</option>
                        <option value="192kbps" className="bg-[#0a0a14]">192 kbps</option>
                        <option value="128kbps" className="bg-[#0a0a14]">128 kbps</option>
                      </>
                    )}
                  </select>
                </div>
                
                {/* Select All & Download Selected */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={toggleAllEntries}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    {selectedEntries.size === playlistEntries.length ? <CheckSquare size={14} className="text-indigo-400"/> : <Square size={14} />}
                    {selectedEntries.size === playlistEntries.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={handleBatchDownload}
                    disabled={selectedEntries.size === 0 || batchDownloading}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {batchDownloading ? (
                      <><Loader2 size={14} className="animate-spin" /> Batching...</>
                    ) : (
                      <><Download size={14} /> Download ({selectedEntries.size})</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Batch Download Progress Bar */}
            {batchDownloading && (
              <div className="w-full bg-black/40 rounded-xl p-4 border border-white/5">
                <div className="flex justify-between items-end mb-2">
                  <div className="text-xs text-indigo-400 font-bold flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Downloading {batchProgress.current} of {batchProgress.total}...
                  </div>
                  <div className="text-[10px] text-gray-500 max-w-[200px] truncate">{batchProgress.currentTitle}</div>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${(batchProgress.current / Math.max(1, batchProgress.total)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="border-t border-white/[0.08]" />

            {/* Playlist Entries Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {playlistEntries.map((entry, idx) => {
                const isSelected = selectedEntries.has(entry.id);
                return (
                  <div 
                    key={entry.id} 
                    onClick={() => !batchDownloading && toggleEntry(entry.id)}
                    className={`flex gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/30' 
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                    } ${batchDownloading ? 'opacity-75 pointer-events-none' : ''}`}
                  >
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-black/50 border border-white/10">
                      <img src={entry.thumbnail} alt="" className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-white font-mono font-bold">
                        {entry.durationFormatted}
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center backdrop-blur-[1px]">
                          <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className={`text-xs font-bold line-clamp-2 leading-tight ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {idx + 1}. {entry.title}
                      </h3>
                      <div className="text-[10px] text-gray-500 mt-1 font-semibold truncate">
                        {entry.author}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Single Video Preview & Download Options Panel */}
        {!isPlaylist && videoData && formats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full bg-[#0a0a14]/90 border border-white/[0.12] rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-6"
          >
            {/* Top Video Preview Header */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              
              {/* Thumbnail Container */}
              <div className="relative w-full sm:w-64 aspect-video rounded-2xl overflow-hidden border border-white/10 group shrink-0 shadow-xl bg-black">
                <img 
                  src={videoData.thumbnail} 
                  alt={videoData.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                
                {/* Duration Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 text-white text-[11px] font-mono font-bold border border-white/10 backdrop-blur-md flex items-center gap-1">
                  <Clock size={12} className="text-red-400" />
                  <span>{videoData.durationFormatted}</span>
                </div>
              </div>

              {/* Video Info Details */}
              <div className="flex-1 space-y-2">
                <h2 className="text-base sm:text-xl font-bold text-white leading-snug line-clamp-2">
                  {videoData.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
                  <a 
                    href={videoData.authorChannelUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-300 hover:text-red-400 transition-colors font-semibold"
                  >
                    <User size={14} className="text-red-500" />
                    <span>{videoData.author}</span>
                    <ExternalLink size={12} className="text-gray-500" />
                  </a>

                  <span>•</span>

                  <div className="flex items-center gap-1 text-gray-400">
                    <Eye size={14} />
                    <span>{videoData.viewCount} views</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 pt-2 leading-relaxed">
                  {videoData.description || 'No description available for this YouTube video.'}
                </p>
              </div>
            </div>

            <div className="border-t border-white/[0.08]" />

            {/* Format Selection Tabs (MP4 vs MP3) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Film size={14} className="text-red-400" /> Choose Format
                </label>

                <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
                  <button
                    onClick={() => {
                      setActiveTab('mp4');
                      if (formats.video.length > 0) setSelectedQuality(formats.video[0].quality);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'mp4' 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Film size={14} />
                    <span>MP4 Video</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('mp3');
                      if (formats.audio.length > 0) setSelectedQuality(formats.audio[0].quality);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'mp3' 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Music size={14} />
                    <span>MP3 Audio</span>
                  </button>
                </div>
              </div>

              {/* Quality Selection Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">
                  Select Quality ({activeTab === 'mp4' ? 'Resolution' : 'Audio Bitrate'}):
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(activeTab === 'mp4' ? formats.video : formats.audio).map((item) => (
                    <button
                      key={item.quality}
                      onClick={() => setSelectedQuality(item.quality)}
                      className={`p-3 rounded-2xl border text-left transition-all backdrop-blur-xl relative overflow-hidden flex flex-col justify-between ${
                        selectedQuality === item.quality
                          ? 'bg-red-600/20 border-red-500 text-white shadow-lg shadow-red-500/20 ring-1 ring-red-500'
                          : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold">{item.qualityLabel}</span>
                        {selectedQuality === item.quality && (
                          <Check size={14} className="text-red-400 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>{item.ext.toUpperCase()}</span>
                        <span className="font-mono">{item.filesizeFormatted || 'Auto'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Option Toggle (Only visible for MP4) */}
              {activeTab === 'mp4' && (
                <div className="pt-2 space-y-2">
                  <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                    <Volume2 size={14} className="text-rose-400" /> Audio Inclusion Options:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      onClick={() => setAudioOption('with_audio')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        audioOption === 'with_audio'
                          ? 'bg-red-600/20 border-red-500 text-white shadow-md shadow-red-500/20'
                          : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-gray-400'
                      }`}
                    >
                      <Volume2 size={18} className="text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">With Sound</div>
                        <div className="text-[10px] text-gray-400">Video + Full Audio</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setAudioOption('muted')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        audioOption === 'muted'
                          ? 'bg-red-600/20 border-red-500 text-white shadow-md shadow-red-500/20'
                          : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-gray-400'
                      }`}
                    >
                      <VolumeX size={18} className="text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Muted (Video Only)</div>
                        <div className="text-[10px] text-gray-400">No Audio Track</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setAudioOption('audio_only')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        audioOption === 'audio_only'
                          ? 'bg-red-600/20 border-red-500 text-white shadow-md shadow-red-500/20'
                          : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-gray-400'
                      }`}
                    >
                      <Music size={18} className="text-cyan-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Audio Only (MP3)</div>
                        <div className="text-[10px] text-gray-400">Extract Sound File</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Download Button */}
            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none text-white text-sm sm:text-base font-extrabold shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                {/* Active Download Progress Bar Overlay */}
                {isDownloading && (
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-white/20 transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-2">
                  {isDownloading ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Processing Stream ({downloadProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                      <span>
                        Download {activeTab.toUpperCase()} ({selectedQuality})
                      </span>
                    </>
                  )}
                </span>
              </button>

              {/* Download Success Banner */}
              {downloadSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>Download initiated! Your browser is saving the media file.</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/[0.08] bg-[#020205]/90 py-4 text-center text-xs text-gray-500 font-medium">
        YD • Yashoo LAB Suite
      </footer>
    </div>
  );
};

export default YDApp;
