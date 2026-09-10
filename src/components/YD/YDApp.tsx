import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  Clipboard, 
  Zap, 
  FolderDown 
} from 'lucide-react';
import AnimatedLiquidBackground from '../AnimatedLiquidBackground';
import { detectDevice } from '../../utils/device';
import type { YDAppProps } from './types';
import { YoutubeIcon } from './components/YoutubeIcon';
import { useYouTubeDownload } from './hooks/useYouTubeDownload';
import { MobileRestrictionModal } from './components/MobileRestrictionModal';
import { DownloadsDrawer } from './components/DownloadsDrawer';
import { CompanionSetupModal } from './components/CompanionSetupModal';
import { PlaylistPanel } from './components/PlaylistPanel';
import { VideoPreviewCard } from './components/VideoPreviewCard';

export const YDApp: React.FC<YDAppProps> = ({ onBack }) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showDownloadsDrawer, setShowDownloadsDrawer] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(detectDevice().isMobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const yt = useYouTubeDownload();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    yt.fetchVideoInfo(yt.urlInput);
  };

  if (isMobile) {
    return <MobileRestrictionModal onBack={onBack} />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#030308] text-white flex flex-col relative overflow-hidden font-sans select-none">
      <AnimatedLiquidBackground />

      {/* Ambient Glow */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Action Badges (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setShowDownloadsDrawer(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur-xl border bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-300 shadow-xl transition-all"
        >
          <FolderDown size={14} className="text-indigo-400" />
          <span>Downloads</span>
          {yt.downloadQueue.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold">
              {yt.downloadQueue.filter(t => t.status === 'downloading').length || yt.downloadQueue.length}
            </span>
          )}
        </button>

        {yt.companionAvailable !== null && (
          <div 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium backdrop-blur-xl border ${
              yt.companionAvailable 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 cursor-pointer hover:bg-amber-500/20'
            }`}
            onClick={() => !yt.companionAvailable && setShowSetupGuide(true)}
          >
            <div className={`w-2 h-2 rounded-full ${yt.companionAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {yt.companionAvailable ? 'Engine Connected' : 'Engine Offline — Click to Setup'}
          </div>
        )}
      </div>

      {/* Downloads Manager Drawer */}
      <DownloadsDrawer
        isOpen={showDownloadsDrawer}
        onClose={() => setShowDownloadsDrawer(false)}
        downloadQueue={yt.downloadQueue}
        onClearCompleted={() => yt.setDownloadQueue(prev => prev.filter(t => t.status !== 'completed'))}
        onCopyLog={yt.copyLogCommand}
        copiedLogId={yt.copiedLogId}
      />

      {/* Companion Setup Modal */}
      <CompanionSetupModal
        isOpen={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
        companionAvailable={yt.companionAvailable}
        isCheckingConnection={yt.isCheckingConnection}
        onCheckConnection={yt.checkCompanionConnection}
      />

      {/* Navigation Header */}
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
          className="flex items-center gap-3"
        >
          <button
            onClick={() => setShowDownloadsDrawer(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-semibold backdrop-blur-xl group"
          >
            <FolderDown size={15} className="text-red-400 group-hover:scale-110 transition-transform" />
            <span>Downloads</span>
            {yt.downloadQueue.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white font-mono">
                {yt.downloadQueue.filter(t => t.status === 'downloading').length || yt.downloadQueue.length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-lg shadow-red-600/20">
              <YoutubeIcon size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              YD <span className="text-red-500 text-xs uppercase font-mono px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 ml-1">Suite</span>
            </span>
          </div>
        </motion.div>
      </header>

      {/* Main Content Area */}
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
              value={yt.urlInput}
              onChange={(e) => yt.setUrlInput(e.target.value)}
              placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
              className="flex-1 bg-transparent text-white text-xs sm:text-sm placeholder-gray-500 outline-none px-2 py-2 font-medium"
            />

            {yt.urlInput ? (
              <button
                type="button"
                onClick={() => yt.setUrlInput('')}
                className="px-2.5 py-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            ) : (
              <button
                type="button"
                onClick={yt.handlePasteClipboard}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 hover:text-white text-xs font-semibold transition-all border border-white/10"
              >
                <Clipboard size={14} />
                <span>Paste</span>
              </button>
            )}

            <button
              type="submit"
              disabled={yt.loading || !yt.urlInput.trim()}
              className="ml-2 px-5 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
            >
              {yt.loading ? (
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
          {yt.errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3 shadow-xl backdrop-blur-xl"
            >
              <AlertCircle size={20} className="shrink-0 text-rose-400" />
              <span>{yt.errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Spinner Skeleton */}
        {yt.loading && (
          <div className="w-full p-8 rounded-3xl bg-[#0a0a14]/60 border border-white/10 backdrop-blur-2xl flex flex-col items-center justify-center gap-4">
            <Loader2 size={36} className="animate-spin text-red-500" />
            <p className="text-sm text-gray-300 font-medium">Extracting YouTube streams and available resolutions...</p>
          </div>
        )}

        {/* Playlist UI Panel */}
        {yt.isPlaylist && yt.playlistInfo && (
          <PlaylistPanel
            playlistInfo={yt.playlistInfo}
            playlistEntries={yt.playlistEntries}
            selectedEntries={yt.selectedEntries}
            toggleEntry={yt.toggleEntry}
            toggleAllEntries={yt.toggleAllEntries}
            activeTab={yt.activeTab}
            setActiveTab={yt.setActiveTab}
            selectedQuality={yt.selectedQuality}
            setSelectedQuality={yt.setSelectedQuality}
            batchDownloading={yt.batchDownloading}
            batchProgress={yt.batchProgress}
            onBatchDownload={() => yt.handleBatchDownload(() => setShowSetupGuide(true))}
          />
        )}

        {/* Single Video Preview & Download Options Panel */}
        {!yt.isPlaylist && yt.videoData && yt.formats && (
          <VideoPreviewCard
            videoData={yt.videoData}
            formats={yt.formats}
            activeTab={yt.activeTab}
            setActiveTab={yt.setActiveTab}
            selectedQuality={yt.selectedQuality}
            setSelectedQuality={yt.setSelectedQuality}
            audioOption={yt.audioOption}
            setAudioOption={yt.setAudioOption}
            isDownloading={yt.isDownloading}
            downloadProgress={yt.downloadProgress}
            downloadSuccess={yt.downloadSuccess}
            onDownload={() => yt.handleDownload(() => setShowSetupGuide(true))}
          />
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
