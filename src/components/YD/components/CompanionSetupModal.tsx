import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Download, RefreshCw, Loader2 } from 'lucide-react';

interface CompanionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionAvailable: boolean | null;
  isCheckingConnection: boolean;
  onCheckConnection: () => Promise<boolean>;
}

export const CompanionSetupModal: React.FC<CompanionSetupModalProps> = ({
  isOpen,
  onClose,
  companionAvailable,
  isCheckingConnection,
  onCheckConnection
}) => {
  const [showFullInstructions, setShowFullInstructions] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
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
                  onClick={() => onCheckConnection()}
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
                    <p className="text-gray-400 text-xs mt-0.5">Make sure <a href="https://www.python.org/downloads/" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">Python</a> is installed, then open Terminal/CMD and run:</p>
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
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all"
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
