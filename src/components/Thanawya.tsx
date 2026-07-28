import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { 
  ArrowRight, Search, X, ChevronLeft, ChevronRight, 
  GraduationCap, Loader2, Copy, Share2, Check, SlidersHorizontal, AlertCircle, Sparkles, Filter
} from 'lucide-react';
import type { Record4, SearchOptions } from '../workers/thanawyaWorker';

interface ThanawayaProps {
  onBack: () => void;
}

interface WorkerResultItem {
  rec: Record4;
  score: number;
}

const PER_PAGE = 20;

// Spring physics config per Design Skill directive
const SPRING_TRANSITION: Transition = { type: "spring", stiffness: 380, damping: 32 };

export const Thanawya: React.FC<ThanawayaProps> = ({ onBack }) => {
  // Worker & Progress State
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [loadMsg, setLoadMsg] = useState('جاري بدء النظام...');
  const [casesList, setCasesList] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter State
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rel' | 'score_desc' | 'score_asc' | 'seat_asc' | 'name_asc'>('rel');
  const [showOptions, setShowOptions] = useState(false);

  // In-Result Sub-Filter State
  const [subFilterText, setSubFilterText] = useState('');

  // Results State
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<WorkerResultItem[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subFilterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    const worker = new Worker(new URL('../workers/thanawyaWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data;
      if (data.type === 'PROGRESS') {
        setProgressPct(data.percent);
        setLoadMsg(data.message);
      } else if (data.type === 'READY') {
        setProgressPct(100);
        setIsReady(true);
        setCasesList(data.cases);
      } else if (data.type === 'SEARCH_RESULTS') {
        setResults(data.records);
        setTotalMatches(data.totalMatches);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setSearching(false);
        setSearched(true);
      } else if (data.type === 'ERROR') {
        setErrorMsg(data.error);
        setSearching(false);
      }
    };

    worker.postMessage({ type: 'INIT', url: '/thanawya/data.json.gz' });

    return () => {
      worker.terminate();
    };
  }, []);

  // Dispatch search to worker
  const dispatchSearch = useCallback((overrideOpts?: Partial<SearchOptions>) => {
    if (!workerRef.current || !isReady) return;

    const opts: SearchOptions = {
      query: overrideOpts?.query !== undefined ? overrideOpts.query : query,
      subQuery: overrideOpts?.subQuery !== undefined ? overrideOpts.subQuery : subFilterText,
      statusFilter: overrideOpts?.statusFilter !== undefined ? overrideOpts.statusFilter : statusFilter,
      minScore: null,
      maxScore: null,
      sortBy: overrideOpts?.sortBy !== undefined ? overrideOpts.sortBy : sortBy,
      matchMode: 'smart',
      page: overrideOpts?.page !== undefined ? overrideOpts.page : page,
      perPage: PER_PAGE,
    };

    setSearching(true);
    workerRef.current.postMessage({ type: 'SEARCH', options: opts });
  }, [isReady, query, subFilterText, statusFilter, sortBy, page]);

  // Main search debounce effect (desktop auto-search, mobile button/enter)
  useEffect(() => {
    if (!isReady) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    if (isMobile) return;

    searchDebounceRef.current = setTimeout(() => {
      if (query.trim() || statusFilter !== 'all') {
        dispatchSearch({ page: 1 });
      } else {
        setSearched(false);
        setResults([]);
        setTotalMatches(0);
      }
    }, 180);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [query, statusFilter, sortBy, isReady, dispatchSearch]);

  // Debounce sub-filter changes across entire dataset in worker!
  const handleSubFilterChange = (val: string) => {
    setSubFilterText(val);
    if (subFilterDebounceRef.current) clearTimeout(subFilterDebounceRef.current);

    subFilterDebounceRef.current = setTimeout(() => {
      dispatchSearch({ subQuery: val, page: 1 });
    }, 120);
  };

  // Status Filter Change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    dispatchSearch({ statusFilter: status, page: 1 });
  };

  // Sort Change
  const handleSortByChange = (sort: typeof sortBy) => {
    setSortBy(sort);
    dispatchSearch({ sortBy: sort, page: 1 });
  };

  // Copy result text
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

  // Share result
  const handleShareResult = (rec: Record4) => {
    const seat = rec[0];
    const name = rec[1];
    const score = rec[2];
    const caseName = casesList[rec[3]] || '';
    const perc = !isNaN(parseFloat(score)) ? ((parseFloat(score) / 320) * 100).toFixed(1) + '%' : '';

    const text = `🎓 نتيجة الثانوية العامة 2026\n👤 ${name}\n🔢 رقم الجلوس: ${seat}\n📊 المجموع: ${score} (${perc})\n📌 الحالة: ${caseName}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Status Badge Styling with Glow (from Design Skill status-badge)
  const getStatusBadgeStyle = (caseName: string) => {
    if (caseName.includes('ناجح')) return {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'bg-[radial-gradient(ellipse_80%_100%_at_50%_100%,rgba(16,185,129,0.4)_0%,transparent_70%)]'
    };
    if (caseName.includes('راسب') || caseName.includes('رسب')) return {
      border: 'border-red-500/30',
      bg: 'bg-red-500/10 text-red-400',
      glow: 'bg-[radial-gradient(ellipse_80%_100%_at_50%_100%,rgba(239,68,68,0.4)_0%,transparent_70%)]'
    };
    if (caseName.includes('دور ثان')) return {
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

        {/* Loading Progress State (Zeigarnik Effect with Framer Motion) */}
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
              {/* Radial Top Glow */}
              <div className="pointer-events-none absolute -top-4 left-[10%] right-[10%] h-8 blur-[16px] bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,rgba(99,102,241,0.5)_0%,transparent_70%)]" />

              <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                  {loadMsg}
                </span>
                <span className="text-indigo-400 font-extrabold text-sm">{progressPct}%</span>
              </div>

              {/* Progress Track */}
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

        {/* Interactive Search UI */}
        {isReady && (
          <div className="space-y-4">

            {/* Mobile-Optimized Search Card Layout */}
            <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-xl space-y-3 focus-within:border-indigo-500/60 focus-within:shadow-[0_0_24px_rgba(99,102,241,0.2)] transition-all">
              
              {/* Row 1: Full-Width Search Input */}
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-3.5 py-1">
                <Search size={22} className="text-indigo-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && dispatchSearch({ page: 1 })}
                  placeholder="اكتب الاسم أو رقم الجلوس..."
                  className="w-full bg-transparent border-none outline-none text-white text-base py-3 placeholder:text-gray-500 leading-normal"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    className="p-2 rounded-lg bg-white/10 text-gray-400 hover:text-white min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0"
                    title="مسح النص"
                  >
                    <X size={18} />
                  </motion.button>
                )}
              </div>

              {/* Row 2: Action Buttons */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => dispatchSearch({ page: 1 })}
                  disabled={searching}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:brightness-110 text-white font-extrabold text-sm rounded-xl transition-all disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  {searching ? <Loader2 size={18} className="animate-spin" /> : <span>بحث</span>}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowOptions(!showOptions)}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all min-h-[44px] flex items-center gap-2 shrink-0 ${
                    showOptions || statusFilter !== 'all' || sortBy !== 'rel'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/30'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                  title="خيارات إضافية"
                >
                  <SlidersHorizontal size={18} />
                  <span className="text-xs">الترتيب</span>
                </motion.button>
              </div>

            </div>

            {/* Quick Status Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => handleStatusFilterChange('all')}
                className={`px-4 py-2 rounded-xl border font-semibold shrink-0 transition-all min-h-[38px] ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/30'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                الكل
              </button>
              {casesList.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleStatusFilterChange(c)}
                  className={`px-4 py-2 rounded-xl border font-semibold shrink-0 transition-all min-h-[38px] ${
                    statusFilter === c
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/30'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Collapsible Options Dropdown */}
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={SPRING_TRANSITION}
                  className="bg-[#0b0b14] border border-white/10 rounded-2xl p-4 space-y-3 text-xs overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-semibold">ترتيب النتائج حسب</span>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortByChange(e.target.value as any)}
                      className="bg-[#141424] border border-white/10 rounded-lg px-3 py-2 text-white font-semibold outline-none focus:border-indigo-500 text-xs"
                    >
                      <option value="rel">الأكثر صلة وتطابقاً</option>
                      <option value="score_desc">الأعلى مجموعاً</option>
                      <option value="score_asc">الأقل مجموعاً</option>
                      <option value="seat_asc">رقم الجلوس</option>
                      <option value="name_asc">أبجدي بالاسم</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Grid & In-Result Sub-Filter */}
            {searched && (
              <div className="space-y-4 pt-2">
                
                {/* Result Bar & Instant Sub-Filter Across All Matches */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b0b14] border border-white/10 rounded-2xl p-3">
                  <div className="text-xs text-gray-400 font-semibold">
                    تم العثور على <strong className="text-indigo-400 font-extrabold text-sm">{totalMatches.toLocaleString('ar-EG')}</strong> نتيجة
                  </div>

                  {/* Instant Sub-Filter Input (searches across all matching candidates in dataset!) */}
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
                        <button
                          onClick={() => handleSubFilterChange('')}
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Cards List */}
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
                      {results.map(({ rec }, i) => {
                        const seat = rec[0];
                        const name = rec[1];
                        const scoreStr = rec[2];
                        const caseName = casesList[rec[3]] || '';
                        const badgeStyle = getStatusBadgeStyle(caseName);
                        const scoreNum = parseFloat(scoreStr);
                        const perc = !isNaN(scoreNum) ? ((scoreNum / 320) * 100).toFixed(1) : null;

                        return (
                          <motion.div
                            key={i}
                            variants={{
                              hidden: { opacity: 0, y: 15 },
                              visible: { opacity: 1, y: 0 }
                            }}
                            transition={SPRING_TRANSITION}
                            className="bg-[#0b0b14] border border-white/10 hover:border-indigo-500/30 rounded-2xl p-4 transition-colors space-y-3 relative overflow-hidden group"
                          >
                            {/* Radial Card Top Glow */}
                            <div className={`pointer-events-none absolute -top-4 left-[10%] right-[10%] h-4 blur-[8px] ${badgeStyle.glow}`} />

                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-base text-white leading-snug">{name}</h3>
                              <div className="flex items-center gap-1 shrink-0">
                                <motion.button
                                  whileTap={{ scale: 0.85 }}
                                  onClick={() => handleCopyResult(rec)}
                                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
                                  title="نسخ النتيجة"
                                >
                                  {copiedId === seat ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                                </motion.button>
                                <motion.button
                                  whileTap={{ scale: 0.85 }}
                                  onClick={() => handleShareResult(rec)}
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
                      })}
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
