import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowRight, Search, X, ChevronLeft, ChevronRight, 
  GraduationCap, Loader2, Copy, Share2, Check, SlidersHorizontal, AlertCircle
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

const Thanawya: React.FC<ThanawayaProps> = ({ onBack }) => {
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
  }, [isReady, query, statusFilter, sortBy, page]);

  // Debounced search on input/filter change
  useEffect(() => {
    if (!isReady) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      if (query.trim() || statusFilter !== 'all') {
        dispatchSearch({ page: 1 });
      } else {
        setSearched(false);
        setResults([]);
        setTotalMatches(0);
      }
    }, 150);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [query, statusFilter, sortBy, isReady, dispatchSearch]);

  // Copy result text
  const handleCopyResult = (rec: Record4) => {
    const seat = rec[0];
    const name = rec[1];
    const score = rec[2];
    const caseName = casesList[rec[3]] || '';
    const perc = !isNaN(parseFloat(score)) ? ((parseFloat(score) / 410) * 100).toFixed(1) + '%' : '';

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
    const perc = !isNaN(parseFloat(score)) ? ((parseFloat(score) / 410) * 100).toFixed(1) + '%' : '';

    const text = `🎓 نتيجة الثانوية العامة 2026\n👤 ${name}\n🔢 رقم الجلوس: ${seat}\n📊 المجموع: ${score} (${perc})\n📌 الحالة: ${caseName}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Status Badge Styling
  const getStatusBadge = (caseName: string) => {
    if (caseName.includes('ناجح')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (caseName.includes('راسب') || caseName.includes('رسب')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (caseName.includes('دور ثان')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="min-h-screen bg-[#06060c] text-white font-sans selection:bg-indigo-500/30 relative" dir="rtl">
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#06060c]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title="رجوع"
            >
              <ArrowRight size={18} />
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap size={22} className="text-indigo-400" />
              <h1 className="font-bold text-lg text-white">نتيجة الثانوية العامة 2026</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-10 pb-16 space-y-8">

        {/* Loading Progress Bar (0% - 100%) */}
        {!isReady && !errorMsg && (
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-1">
              <span>{loadMsg}</span>
              <span className="text-indigo-400 font-bold text-sm">{progressPct}%</span>
            </div>

            {/* Clean Animated Progress Track */}
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-gray-500 text-xs">يتم التجهيز مرة واحدة فقط لتوفير استعلام تلمي فائق السرعة</p>
          </div>
        )}

        {/* Error State */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-400">
            <AlertCircle size={32} className="mx-auto mb-2" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Search View */}
        {isReady && (
          <div className="space-y-6">

            {/* Search Box */}
            <div className="relative flex items-center bg-[#0b0b14] border border-white/10 rounded-2xl p-2 shadow-xl focus-within:border-indigo-500/60 transition-all">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search size={20} className="text-indigo-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="اكتب الاسم أو رقم الجلوس..."
                  className="w-full bg-transparent border-none outline-none text-white text-base py-2.5 placeholder:text-gray-500"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Options Toggle */}
              <button
                onClick={() => setShowOptions(!showOptions)}
                className={`p-3 rounded-xl border text-sm transition-all ml-1 ${
                  showOptions || statusFilter !== 'all' || sortBy !== 'rel'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
                title="خيارات إضافية"
              >
                <SlidersHorizontal size={18} />
              </button>

              {/* Search Button */}
              <button
                onClick={() => dispatchSearch({ page: 1 })}
                disabled={searching}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white font-bold text-sm rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {searching ? <Loader2 size={18} className="animate-spin" /> : <span>بحث</span>}
              </button>
            </div>

            {/* Quick Status Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl border font-semibold shrink-0 transition-all ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                الكل
              </button>
              {casesList.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setStatusFilter(c)}
                  className={`px-3 py-1.5 rounded-xl border font-semibold shrink-0 transition-all ${
                    statusFilter === c
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Additional Options Dropdown */}
            {showOptions && (
              <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-4 space-y-3 text-xs animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-semibold">ترتيب النتائج</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-[#141424] border border-white/10 rounded-lg px-3 py-1.5 text-white font-semibold outline-none"
                  >
                    <option value="rel">الأكثر صلة وتطابقاً</option>
                    <option value="score_desc">الأعلى مجموعاً</option>
                    <option value="score_asc">الأقل مجموعاً</option>
                    <option value="seat_asc">رقم الجلوس</option>
                    <option value="name_asc">أبجدياً بالاسم</option>
                  </select>
                </div>
              </div>
            )}

            {/* Results Output */}
            {searched && (
              <div className="space-y-4 pt-2">
                
                {/* Result Count Bar */}
                <div className="text-xs text-gray-400 font-semibold flex items-center justify-between">
                  <span>تم العثور على <strong className="text-indigo-400 font-bold">{totalMatches.toLocaleString('ar-EG')}</strong> نتيجة</span>
                </div>

                {/* Cards List */}
                {results.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.map(({ rec }, i) => {
                        const seat = rec[0];
                        const name = rec[1];
                        const scoreStr = rec[2];
                        const caseName = casesList[rec[3]] || '';
                        const badgeStyle = getStatusBadge(caseName);
                        const scoreNum = parseFloat(scoreStr);
                        const perc = !isNaN(scoreNum) ? ((scoreNum / 410) * 100).toFixed(1) : null;

                        return (
                          <div
                            key={i}
                            className="bg-[#0b0b14] border border-white/10 hover:border-indigo-500/30 rounded-2xl p-4 transition-all space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-base text-white leading-snug">{name}</h3>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleCopyResult(rec)}
                                  className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                                  title="نسخ النتيجة"
                                >
                                  {copiedId === seat ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                                </button>
                                <button
                                  onClick={() => handleShareResult(rec)}
                                  className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-emerald-400"
                                  title="واتساب"
                                >
                                  <Share2 size={15} />
                                </button>
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
                              <span className={`px-2.5 py-1 rounded-full font-semibold border ${badgeStyle}`}>
                                {caseName}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Simple Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4">
                        <button
                          onClick={() => {
                            const p = Math.max(1, page - 1);
                            setPage(p);
                            dispatchSearch({ page: p });
                          }}
                          disabled={page === 1}
                          className="p-2 rounded-xl border border-white/10 bg-[#0b0b14] text-gray-400 disabled:opacity-30"
                        >
                          <ChevronRight size={18} />
                        </button>

                        <span className="text-xs text-gray-400 font-semibold px-2">
                          صفحة {page} من {totalPages}
                        </span>

                        <button
                          onClick={() => {
                            const p = Math.min(totalPages, page + 1);
                            setPage(p);
                            dispatchSearch({ page: p });
                          }}
                          disabled={page === totalPages}
                          className="p-2 rounded-xl border border-white/10 bg-[#0b0b14] text-gray-400 disabled:opacity-30"
                        >
                          <ChevronLeft size={18} />
                        </button>
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
