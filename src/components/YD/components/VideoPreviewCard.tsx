import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  User, 
  ExternalLink, 
  Eye, 
  Film, 
  Music, 
  Check, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Download 
} from 'lucide-react';
import type { VideoDetails, VideoFormatsData } from '../types';

interface VideoPreviewCardProps {
  videoData: VideoDetails;
  formats: VideoFormatsData;
  activeTab: 'mp4' | 'mp3';
  setActiveTab: (tab: 'mp4' | 'mp3') => void;
  selectedQuality: string;
  setSelectedQuality: (quality: string) => void;
  audioOption: 'with_audio' | 'muted' | 'audio_only';
  setAudioOption: (option: 'with_audio' | 'muted' | 'audio_only') => void;
  isDownloading: boolean;
  downloadProgress: number;
  downloadSuccess: boolean;
  onDownload: () => void;
}

export const VideoPreviewCard: React.FC<VideoPreviewCardProps> = ({
  videoData,
  formats,
  activeTab,
  setActiveTab,
  selectedQuality,
  setSelectedQuality,
  audioOption,
  setAudioOption,
  isDownloading,
  downloadProgress,
  downloadSuccess,
  onDownload
}) => {
  return (
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
          onClick={onDownload}
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
            <span>Download request sent to Python Engine! Track realtime status in the Downloads Drawer.</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
