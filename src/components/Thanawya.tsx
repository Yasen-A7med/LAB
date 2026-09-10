import React, { useState } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { 
  ArrowRight, X, ChevronLeft, ChevronRight, 
  GraduationCap, AlertCircle, Sparkles, Filter 
} from 'lucide-react';
import type { ThanawyaProps, Record4 } from './Thanawya/types';
import { useThanawyaWorker } from './Thanawya/hooks/useThanawyaWorker';
import { ThanawyaSearchBar } from './Thanawya/components/ThanawyaSearchBar';
import { StudentResultCard } from './Thanawya/components/StudentResultCard';

const SPRING_TRANSITION: Transition = { type: "spring", stiffness: 380, damping: 32 };

export const Thanawya: React.FC<ThanawyaProps> = ({ onBack }) => {
  const {
    isReady,
    progressPct,
    loadMsg,
    casesList,
    errorMsg,
    query,
    setQuery,
    statusFilter,
    sortBy,
    subFilterText,
    searching,
    searched,
    results,
    totalMatches,
    page,
    setPage,
    totalPages,
    dispatchSearch,
    handleSubFilterChange,
    handleStatusFilterChange,
    handleSortByChange
  } = useThanawyaWorker();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyResult = (rec: Record4) => {
    const seat = rec[0];
    const name = rec[1];
    const score = rec[2];
    const caseName = casesList[rec[3]] || '';
    const perc = !isNaN(parseFloat(score)) ? ((parseFloat(score) / 320) * 100).toFixed(1) + '%' : '';

    const text = `🎓 نتيجة الطالب: ${name}\n🔢 رقم الجلوس: ${seat}\n📊 المجموع: ${score} (${perc})\n📌 الحالة: ${caseName}`;
    navigator.clipboard.writeText(text);
    setCopiedId(seat);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareResult = (rec: Record4) => {
    const seat = rec[0];
    const name = rec[1];
    const score = rec[2];
    const caseName = casesList[rec[3]] || '';
    const perc = !isNaN(parseFloat(score)) ? ((parseFloat(score) / 320) * 100).toFixed(1) + '%' : '';

    const text = `🎓 نتيجة الثانوية العامة 2026\n👤 ${name}\n🔢 رقم الجلوس: ${seat}\n📊 المجموع: ${score} (${perc})\n📌 الحالة: ${caseName}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-white font-['Cairo',sans-serif] selection:bg-indigo-500/30 relative overflow-x-hidden" dir="rtl">
      {/* Subtle Background Glow Accent */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] -top-[150px] -right-[100px]" />
        <div className="absolute w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[160px] -bottom-[100px] -left-[100px]" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#05050a]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="رجوع"
            >
              <ArrowRight size={18} />
            </motion.button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <GraduationCap size={20} className="text-white" />
              </div>
              <h1 className="font-bold text-base md:text-lg text-white">نتيجة الثانوية العامة 2026</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-6 pb-16 space-y-5">
        {/* Loading Progress State */}
        <AnimatePresence mode="wait">
          {!isReady && !errorMsg && (
            <motion.div
              key="loading-progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={SPRING_TRANSITION}
              className="bg-[#0b0b14]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden"
            >
              <div className="pointer-events-none absolute -top-4 left-[10%] right-[10%] h-8 blur-[16px] bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,rgba(99,102,241,0.5)_0%,transparent_70%)]" />

              <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                  {loadMsg}
                </span>
                <span className="text-indigo-400 font-extrabold text-sm">{progressPct}%</span>
              </div>

              <div className="w-full bg-white/[0.04] rounded-full h-3 overflow-hidden p-0.5 border border-white/10 relative">
                <motion.div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>

              <p className="text-gray-500 text-xs">تجهيز مؤقت مرة واحدة لاستعلام تلمي ومباشر ⚡</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-400">
            <AlertCircle size={32} className="mx-auto mb-2" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Interactive Search Area */}
        {isReady && (
          <div className="space-y-4">
            <ThanawyaSearchBar
              query={query}
              onQueryChange={setQuery}
              onSearch={() => dispatchSearch({ page: 1 })}
              searching={searching}
              casesList={casesList}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              sortBy={sortBy}
              onSortByChange={handleSortByChange}
              springTransition={SPRING_TRANSITION}
            />

            {/* Results Grid & Sub-Filter */}
            {searched && (
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b0b14] border border-white/10 rounded-2xl p-3">
                  <div className="text-xs text-gray-400 font-semibold">
                    تم العثور على <strong className="text-indigo-400 font-extrabold text-sm">{totalMatches.toLocaleString('ar-EG')}</strong> نتيجة
                  </div>

                  {totalMatches > 1 && (
                    <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 flex-1 max-w-full sm:max-w-[300px]">
                      <Filter size={14} className="text-indigo-400 shrink-0" />
                      <input
                        type="text"
                        value={subFilterText}
                        onChange={(e) => handleSubFilterChange(e.target.value)}
                        placeholder="فلترة وتعمق داخل كل النتائج..."
                        className="w-full bg-transparent border-none outline-none text-white text-xs py-1 placeholder:text-gray-500"
                        autoComplete="off"
                        spellCheck={false}
                      />
                      {subFilterText && (
                        <button onClick={() => handleSubFilterChange('')} className="text-gray-400 hover:text-white">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {results.length > 0 ? (
                  <>
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: { transition: { staggerChildren: 0.04 } }
                      }}
                    >
                      {results.map(({ rec }, i) => (
                        <StudentResultCard
                          key={i}
                          rec={rec}
                          casesList={casesList}
                          copiedId={copiedId}
                          onCopy={handleCopyResult}
                          onShare={handleShareResult}
                          springTransition={SPRING_TRANSITION}
                        />
                      ))}
                    </motion.div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            const p = Math.max(1, page - 1);
                            setPage(p);
                            dispatchSearch({ page: p });
                          }}
                          disabled={page === 1}
                          className="p-2.5 rounded-xl border border-white/10 bg-[#0b0b14] text-gray-400 disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        >
                          <ChevronRight size={18} />
                        </motion.button>

                        <span className="text-xs text-gray-400 font-semibold px-2">
                          صفحة {page} من {totalPages}
                        </span>

                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            const p = Math.min(totalPages, page + 1);
                            setPage(p);
                            dispatchSearch({ page: p });
                          }}
                          disabled={page === totalPages}
                          className="p-2.5 rounded-xl border border-white/10 bg-[#0b0b14] text-gray-400 disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        >
                          <ChevronLeft size={18} />
                        </motion.button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-8 text-center text-gray-400 text-xs">
                    لم يتم العثور على نتائج طابق معلومات بحثك.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Thanawya;
