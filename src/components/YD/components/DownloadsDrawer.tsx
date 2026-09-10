import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderDown, 
  Trash2, 
  X, 
  Music, 
  Film, 
  Loader2, 
  Check, 
  AlertCircle, 
  Terminal 
} from 'lucide-react';
import type { DownloadTaskItem } from '../types';

interface DownloadsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  downloadQueue: DownloadTaskItem[];
  onClearCompleted: () => void;
  onCopyLog: (task: DownloadTaskItem) => void;
  copiedLogId: string | null;
}

export const DownloadsDrawer: React.FC<DownloadsDrawerProps> = ({
  isOpen,
  onClose,
  downloadQueue,
  onClearCompleted,
  onCopyLog,
  copiedLogId
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex justify-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-[#0b0b16] border-l border-white/10 w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                  <FolderDown size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base flex items-center gap-2">
                    Downloads Manager
                    {downloadQueue.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-mono font-bold border border-red-500/30">
                        {downloadQueue.length}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">Realtime download status & history</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {downloadQueue.some(t => t.status === 'completed') && (
                  <button
                    onClick={onClearCompleted}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-semibold flex items-center gap-1"
                    title="Clear Completed"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Drawer Body - Tasks List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {downloadQueue.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-3">
                    <FolderDown size={28} className="text-gray-600" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">No active downloads</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                    Downloaded videos and batch playlists will show their status and logs here in realtime.
                  </p>
                </div>
              ) : (
                downloadQueue.map((task) => (
                  <div 
                    key={task.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      task.status === 'downloading'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : task.status === 'failed'
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-gray-300 shrink-0 mt-0.5">
                        {task.format === 'mp3' ? <Music size={16} className="text-red-400" /> : <Film size={16} className="text-red-400" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate leading-tight">
                          {task.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-gray-300 font-bold uppercase">
                            {task.quality} {task.format}
                          </span>
                          <span className="text-[10px] text-gray-500 font-semibold">{task.timestamp}</span>
                        </div>

                        {/* Status Badge */}
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          {task.status === 'downloading' && (
                            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                              <Loader2 size={13} className="animate-spin" />
                              <span>Downloading / Preparing{task.progress ? ` (${task.progress}%)` : ''}...</span>
                            </div>
                          )}

                          {task.status === 'completed' && (
                            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                              <Check size={13} strokeWidth={3} />
                              <span>Completed & Saved</span>
                            </div>
                          )}

                          {task.status === 'failed' && (
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                                <AlertCircle size={13} />
                                <span>Failed</span>
                              </div>
                              {task.error && (
                                <span className="text-[10px] text-rose-300/80 font-mono truncate max-w-[170px]" title={task.error}>
                                  {task.error}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Copy CMD Log Button */}
                          <button
                            onClick={() => onCopyLog(task)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                              copiedLogId === task.id
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white'
                            }`}
                            title="Copy debug log command for terminal"
                          >
                            {copiedLogId === task.id ? <Check size={12} /> : <Terminal size={12} />}
                            <span>{copiedLogId === task.id ? 'Copied Log Cmd!' : 'Copy CMD Log'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02] text-xs text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                <Terminal size={14} className="text-red-400" /> Keep Python Terminal open
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
