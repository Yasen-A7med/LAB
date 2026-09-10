import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, X, ArrowLeft } from 'lucide-react';
import AnimatedLiquidBackground from '../../AnimatedLiquidBackground';

interface MobileRestrictionModalProps {
  onBack: () => void;
}

export const MobileRestrictionModal: React.FC<MobileRestrictionModalProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#07070f] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <AnimatedLiquidBackground />

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-red-500/30 rounded-3xl p-8 shadow-2xl relative z-10 text-center flex flex-col items-center"
      >
        {/* Warning Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 shadow-xl relative">
          <Smartphone size={36} className="text-red-400" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs">
            <X size={14} />
          </div>
        </div>

        {/* Badge & Title */}
        <span className="px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono font-bold text-[11px] uppercase tracking-wider mb-3">
          PC / Desktop Only Tool
        </span>

        <h2 className="text-2xl font-black text-white tracking-tight mb-3">
          Mobile Device Detected
        </h2>

        <p className="text-sm text-gray-300 leading-relaxed font-medium mb-6">
          Yashoo YD Downloader requires a local Python extraction engine (<code className="text-red-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">yd_companion.py</code>) running on desktop operating systems (Windows / macOS). Mobile devices are not supported.
        </p>

        {/* Diagnostic Info Box */}
        <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-left mb-6 space-y-2 text-xs">
          <div className="flex items-center justify-between text-gray-400">
            <span>Access Permission:</span>
            <span className="text-red-400 font-bold font-mono">Restricted (Mobile)</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Supported Environments:</span>
            <span className="text-emerald-400 font-bold">Windows & macOS</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onBack}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          <span>Return to Dashboard</span>
        </button>
      </motion.div>
    </div>
  );
};
