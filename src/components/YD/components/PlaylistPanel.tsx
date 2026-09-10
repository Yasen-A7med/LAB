import React from 'react';
import { motion } from 'framer-motion';
import { ListVideo, User, Film, Music, CheckSquare, Square, Download, Loader2, Check } from 'lucide-react';
import type { PlaylistInfo, PlaylistEntry } from '../types';

interface PlaylistPanelProps {
  playlistInfo: PlaylistInfo;
  playlistEntries: PlaylistEntry[];
  selectedEntries: Set<string>;
  toggleEntry: (id: string) => void;
  toggleAllEntries: () => void;
  activeTab: 'mp4' | 'mp3';
  setActiveTab: (tab: 'mp4' | 'mp3') => void;
  selectedQuality: string;
  setSelectedQuality: (quality: string) => void;
  batchDownloading: boolean;
  batchProgress: { current: number; total: number; currentTitle: string };
  onBatchDownload: () => void;
}

export const PlaylistPanel: React.FC<PlaylistPanelProps> = ({
  playlistInfo,
  playlistEntries,
  selectedEntries,
  toggleEntry,
  toggleAllEntries,
  activeTab,
  setActiveTab,
  selectedQuality,
  setSelectedQuality,
  batchDownloading,
  batchProgress,
  onBatchDownload
}) => {
  return (
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
            <span className="flex items-center gap-1.5">
              <User size={14} className="text-indigo-400" /> {playlistInfo.author}
            </span>
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
              onClick={onBatchDownload}
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
  );
};
