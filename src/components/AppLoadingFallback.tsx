import React from 'react';
import { Loader2 } from 'lucide-react';

export const AppLoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#030308] text-white flex flex-col items-center justify-center relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-2xl">
          <Loader2 size={24} className="text-amber-400 animate-spin" />
        </div>
        <span className="text-xs font-mono tracking-widest uppercase text-gray-400">
          Loading Yashoo LAB...
        </span>
      </div>
    </div>
  );
};

export default AppLoadingFallback;
