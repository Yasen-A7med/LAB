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
  RefreshCw
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
  const COMPANION_URL = 'http://localhost:8765';

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
      setErrorMsg('Please enter a valid YouTube video or Shorts link.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setVideoData(null);
    setFormats(null);
    setDownloadSuccess(false);

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

      // Strategy 2: oEmbed for metadata (always works, but no stream URLs)
      if (!data || !data.success) {
        const match = targetUrl.trim().match(/(?:v=|\/shorts\/|\/embed\/|youtu\.be\/|\/v\/|\/e\/)([\\w-]{11})/);
        const videoId = match ? match[1] : null;

        if (!videoId) {
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

        // Create blob and trigger download
        const contentType = activeTab === 'mp3' ? 'audio/mpeg' : 'video/mp4';
        const blob = new Blob(chunks, { type: contentType });
        const blobUrl = URL.createObjectURL(blob);

        const cleanTitle = videoData.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
        const filename = `${cleanTitle}.${activeTab === 'mp3' ? 'mp3' : 'mp4'}`;

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);

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
                <div>
                  <h3 className="text-white font-bold text-lg">YD Companion Setup</h3>
                  <p className="text-gray-400 text-xs">One-time setup for unlimited downloads</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-red-400 shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="text-white text-sm font-semibold">Install Python & yt-dlp</p>
                    <p className="text-gray-400 text-xs mt-0.5">Make sure Python is installed, then run:</p>
                    <code className="block mt-2 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono select-all">pip install yt-dlp</code>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-red-400 shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="text-white text-sm font-semibold">Download & Run Companion</p>
                    <p className="text-gray-400 text-xs mt-0.5">Download the companion script and run it:</p>
                    <a href="/yd_companion.py" download className="inline-flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs font-semibold transition-all">
                      <Download size={14} />
                      Download yd_companion.py
                    </a>
                    <code className="block mt-2 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono select-all">python yd_companion.py</code>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-red-400 shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="text-white text-sm font-semibold">Ready to Download</p>
                    <p className="text-gray-400 text-xs mt-0.5">Once the companion is running, come back here and download any video. The badge in the bottom-right will show "Engine Connected".</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSetupGuide(false);
                    // Re-check companion
                    fetch(`${COMPANION_URL}/ping`, { signal: AbortSignal.timeout(2000) })
                      .then(r => r.json())
                      .then(d => { if (d.status === 'ok') setCompanionAvailable(true); })
                      .catch(() => {});
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all"
                >
                  Done — Check Connection
                </button>
                <button
                  onClick={() => setShowSetupGuide(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-medium transition-all"
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
            <span>Ultra Fast YouTube Video & MP3 Downloader</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Download Any Video in <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">HD & MP3</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            Paste your YouTube link below to convert, select resolution, toggle audio, and download cleanly with maximum speed.
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

        {/* Video Preview & Download Options Panel */}
        {videoData && formats && (
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
