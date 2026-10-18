import React from 'react';
import { ArrowLeft, FileSpreadsheet, ScrollText, Sparkles } from 'lucide-react';

interface GEFHeaderProps {
  onBack: () => void;
  onOpenTemplates: () => void;
  onExportCSV: () => void;
}

export const GEFHeader: React.FC<GEFHeaderProps> = ({
  onBack,
  onOpenTemplates,
  onExportCSV,
}) => {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl mb-6">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all"
            >
              <ArrowLeft size={14} />
              <span>Back to LAB</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              <span>JW Marriott Cairo • Nov 7, 2026</span>
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-amber-200 bg-clip-text text-transparent">
            GEF 2026 Fashion Show — Modeling Outreach Portal
          </h1>

          <p className="mt-2 text-sm text-gray-400 max-w-3xl leading-relaxed">
            Under the distinguished auspices of <strong className="text-gray-200">H.E. Dr. Mostafa Madbouly, Prime Minister of Egypt</strong>. 
            Targeting boutique modeling agencies, catwalk training academies, and youth talent hubs for high-visibility strategic partnerships.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenTemplates}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-sm font-semibold text-gray-200 hover:text-white transition-all"
          >
            <ScrollText size={16} className="text-amber-400" />
            <span>Outreach Templates</span>
          </button>

          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5"
          >
            <FileSpreadsheet size={16} />
            <span>Export Live CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
