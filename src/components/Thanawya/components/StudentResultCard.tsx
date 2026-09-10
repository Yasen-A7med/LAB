import React from 'react';
import { motion, type Transition } from 'framer-motion';
import { Copy, Share2, Check } from 'lucide-react';
import type { Record4 } from '../types';

interface StudentResultCardProps {
  rec: Record4;
  casesList: string[];
  copiedId: string | null;
  onCopy: (rec: Record4) => void;
  onShare: (rec: Record4) => void;
  springTransition: Transition;
}

export const StudentResultCard: React.FC<StudentResultCardProps> = ({
  rec,
  casesList,
  copiedId,
  onCopy,
  onShare,
  springTransition
}) => {
  const seat = rec[0];
  const name = rec[1];
  const scoreStr = rec[2];
  const caseName = casesList[rec[3]] || '';
  const scoreNum = parseFloat(scoreStr);
  const perc = !isNaN(scoreNum) ? ((scoreNum / 320) * 100).toFixed(1) : null;

  const getStatusBadgeStyle = (statusName: string) => {
    if (statusName.includes('ناجح')) return {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'bg-[radial-gradient(ellipse_80%_100%_at_50%_100%,rgba(16,185,129,0.4)_0%,transparent_70%)]'
    };
    if (statusName.includes('راسب') || statusName.includes('رسب')) return {
      border: 'border-red-500/30',
      bg: 'bg-red-500/10 text-red-400',
      glow: 'bg-[radial-gradient(ellipse_80%_100%_at_50%_100%,rgba(239,68,68,0.4)_0%,transparent_70%)]'
    };
    if (statusName.includes('دور ثان')) return {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10 text-amber-400',
      glow: 'bg-[radial-gradient(ellipse_80%_100%_at_50%_100%,rgba(245,158,11,0.4)_0%,transparent_70%)]'
    };
    return {
      border: 'border-gray-500/30',
      bg: 'bg-gray-500/10 text-gray-400',
      glow: 'bg-[radial-gradient(ellipse_80%_100%_at_50%_100%,rgba(156,163,175,0.4)_0%,transparent_70%)]'
    };
  };

  const badgeStyle = getStatusBadgeStyle(caseName);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={springTransition}
      className="bg-[#0b0b14] border border-white/10 hover:border-indigo-500/30 rounded-2xl p-4 transition-colors space-y-3 relative overflow-hidden group"
    >
      {/* Radial Card Top Glow */}
      <div className={`pointer-events-none absolute -top-4 left-[10%] right-[10%] h-4 blur-[8px] ${badgeStyle.glow}`} />

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-base text-white leading-snug">{name}</h3>
        <div className="flex items-center gap-1 shrink-0">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onCopy(rec)}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
            title="نسخ النتيجة"
          >
            {copiedId === seat ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onShare(rec)}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-emerald-400 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
            title="واتساب"
          >
            <Share2 size={15} />
          </motion.button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
        <div>
          <span className="text-gray-500 block text-[10px]">رقم الجلوس</span>
          <span className="font-bold text-white text-sm">{seat}</span>
        </div>
        <div className="text-left">
          <span className="text-gray-500 block text-[10px]">المجموع</span>
          <span className="font-extrabold text-indigo-400 text-sm">
            {scoreStr} {perc && <span className="text-[11px] text-gray-400 font-normal">({perc}%)</span>}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-gray-500 text-[11px]">الحالة</span>
        <span className={`px-2.5 py-1 rounded-full font-semibold border ${badgeStyle.bg} ${badgeStyle.border}`}>
          {caseName}
        </span>
      </div>
    </motion.div>
  );
};
