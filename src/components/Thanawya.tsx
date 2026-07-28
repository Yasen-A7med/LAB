import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowRight, Search, X, ChevronLeft, ChevronRight, 
  GraduationCap, CheckCircle2, Loader2, Sparkles, 
  Copy, Share2, Zap, SlidersHorizontal, AlertCircle, Check
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
  // Worker & Loading State
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadMsg, setLoadMsg] = useState('جاري بدء النظام...');
  const [totalRecords, setTotalRecords] = useState(0);
  const [casesList, setCasesList] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter State
  const [query, setQuery] = useState('');
  const [matchMode, setMatchMode] = useState<'smart' | 'exact' | 'fuzzy'>('smart');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [presetGradeFilter, setPresetGradeFilter] = useState<string>('all');
  const [minScore, setMinScore] = useState<number | null>(null);
  const [maxScore, setMaxScore] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'rel' | 'score_desc' | 'score_asc' | 'seat_asc' | 'name_asc'>('rel');

  // Results State
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<WorkerResultItem[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTimeMs, setSearchTimeMs] = useState(0);

  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Worker
  useEffect(() => {
    // Dynamic Font Loading for Cairo
    if (!document.getElementById('cairo-font-link')) {
      const link = document.createElement('link');
      link.id = 'cairo-font-link';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap';
      document.head.appendChild(link);
    }

    // Instantiate Worker
    const worker = new Worker(new URL('../workers/thanawyaWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data;
      if (data.type === 'STATUS') {
        setLoadMsg(data.message);
      } else if (data.type === 'READY') {
        setIsReady(true);
        setTotalRecords(data.totalRecords);
        setCasesList(data.cases);
      } else if (data.type === 'SEARCH_RESULTS') {
        setResults(data.records);
        setTotalMatches(data.totalMatches);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setSearchTimeMs(data.timeMs);
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

  // Trigger search to worker
  const dispatchSearch = useCallback((overrideOpts?: Partial<SearchOptions>) => {
    if (!workerRef.current || !isReady) return;

    const opts: SearchOptions = {
      query: overrideOpts?.query !== undefined ? overrideOpts.query : query,
      statusFilter: overrideOpts?.statusFilter !== undefined ? overrideOpts.statusFilter : statusFilter,
      minScore: overrideOpts?.minScore !== undefined ? overrideOpts.minScore : minScore,
      maxScore: overrideOpts?.maxScore !== undefined ? overrideOpts.maxScore : maxScore,
      sortBy: overrideOpts?.sortBy !== undefined ? overrideOpts.sortBy : sortBy,
      matchMode: overrideOpts?.matchMode !== undefined ? overrideOpts.matchMode : matchMode,
      page: overrideOpts?.page !== undefined ? overrideOpts.page : page,
      perPage: PER_PAGE,
    };

    setSearching(true);
    workerRef.current.postMessage({ type: 'SEARCH', options: opts });
  }, [isReady, query, statusFilter, minScore, maxScore, sortBy, matchMode, page]);

  // Debounced search on input change
  useEffect(() => {
    if (!isReady) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      if (query.trim() || statusFilter !== 'all' || minScore !== null || maxScore !== null) {
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
  }, [query, statusFilter, minScore, maxScore, sortBy, matchMode, isReady, dispatchSearch]);

  // Preset Grade Handler
  const handlePresetGradeChange = (preset: string) => {
    setPresetGradeFilter(preset);
    let min: number | null = null;
    let max: number | null = null;

    if (preset === 'top90') min = 369; // 90% of 410 = 369
    else if (preset === 'top85') min = 348.5; // 85% of 410 = 348.5
    else if (preset === 'top75') min = 307.5; // 75% of 410 = 307.5
    else if (preset === 'pass') { min = 205; } // 50% = 205
    else if (preset === 'fail') { max = 204.9; }

    setMinScore(min);
    setMaxScore(max);
    dispatchSearch({ minScore: min, maxScore: max, page: 1 });
  };

  // Copy result card text
  const handleCopyResult = (rec: Record4) => {
    const seat = rec[0];
    const name = rec[1];
    const score = rec[2];
    const caseName = casesList[rec[3]] || '';
    const perc = !isNaN(parseFloat(score)) ? ((parseFloat(score) / 410) * 100).toFixed(2) + '%' : 'غير محدد';

    const text = `🎓 نتيجة الثانوية العامة 2026\n👤 الاسم: ${name}\n🔢 رقم الجلوس: ${seat}\n📊 المجموع: ${score} (${perc})\n📌 الحالة: ${caseName}`;

    navigator.clipboard.writeText(text);
    setCopiedId(seat);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Share result
  const handleShareResult = (rec: Record4) => {
    const seat = rec[0];
    const name = rec[1];
    const score = rec[2];
    const caseName = casesList[rec[3]] || '';
    const perc = !isNaN(parseFloat(score)) ? ((parseFloat(score) / 410) * 100).toFixed(2) + '%' : '';

    const text = `🎓 نتيجة الثانوية العامة 2026\n👤 ${name}\n🔢 رقم الجلوس: ${seat}\n📊 المجموع: ${score} (${perc})\n📌 الحالة: ${caseName}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Status Styling
  const getStatusBadge = (caseName: string) => {
    if (!caseName) return { style: 'bg-gray-500/10 text-gray-400 border-gray-500/20', dot: 'bg-gray-400' };
    if (caseName.includes('ناجح')) return { style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]', dot: 'bg-emerald-400' };
    if (caseName.includes('راسب') || caseName.includes('رسب')) return { style: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' };
    if (caseName.includes('دور ثان') || caseName.includes('ملحق')) return { style: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' };
    return { style: 'bg-gray-500/10 text-gray-400 border-gray-500/20', dot: 'bg-gray-400' };
  };

  // Page numbers pagination generator
  const getPageNums = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const p: (number | '...')[] = [1];
    if (page > 3) p.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) p.push(i);
    if (page < totalPages - 2) p.push('...');
    p.push(totalPages);
    return p;
  };

  return (
    <div className="min-h-screen bg-[#07070e] text-white font-['Cairo',sans-serif] selection:bg-indigo-500/30 relative overflow-x-hidden" dir="rtl">
      
      {/* Background Animated Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] -top-[200px] -right-[100px] animate-pulse" style={{ animationDuration: '18s' }} />
        <div className="absolute w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] -bottom-[100px] -left-[150px] animate-pulse" style={{ animationDuration: '22s' }} />
        <div className="absolute w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#07070e]/85 backdrop-blur-2xl border-b border-white/[0.07]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white active:scale-95"
              title="رجوع للرئيسية"
            >
              <ArrowRight size={19} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0d0d18] rounded-[15px] flex items-center justify-center">
                  <GraduationCap size={22} className="text-indigo-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg md:text-xl tracking-tight text-white leading-none">
                  نتيجة الثانوية العامة
                </span>
                <span className="text-[11px] text-indigo-400 font-semibold mt-1">محرك البحث الذكي الفائق ⚡</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isReady && (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Zap size={13} />
                <span>{totalRecords.toLocaleString('ar-EG')} طالب جاهز</span>
              </div>
            )}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-md shadow-purple-500/20">
              الدور الأول 2026
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-6 pt-8 pb-16">

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-4 animate-fade-in">
            <Sparkles size={14} className="text-indigo-400" />
            <span>بحث فائق السرعة متسامح مع الأخطاء الإملائية</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-3">
            ابحث عن نتيجتك بـ <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">أي كلمة أو رقم جلوس</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-medium leading-relaxed">
            محرك يبحث بالاسم أو رقم الجلوس، يتعامل تلقائياً مع الاختلافات (ي / ى، أ / ا، ة / هـ، عبد الله / عبدالله).
          </p>
        </div>

        {/* Loading Overlay State */}
        {!isReady && !errorMsg && (
          <div className="max-w-md mx-auto my-12 bg-[#0e0e1a]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-purple-500/20 border-b-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{loadMsg}</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              تتم التعرّف على 919 ألف نتيجة وتخزين الكشاف محلياً بسرعة فائقة...
            </p>
          </div>
        )}

        {/* Error State */}
        {errorMsg && (
          <div className="max-w-md mx-auto my-12 bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center text-red-400">
            <AlertCircle size={40} className="mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">عفواً، حدث خطأ أثناء التحميل</h3>
            <p className="text-sm opacity-80">{errorMsg}</p>
          </div>
        )}

        {/* Main Search Panel */}
        {isReady && (
          <div className="space-y-6">

            {/* Search Box */}
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-center bg-[#0d0d1a] border border-white/10 rounded-2xl md:rounded-3xl p-2 shadow-2xl shadow-indigo-950/40 focus-within:border-indigo-500/60 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.25)] transition-all duration-300">
                <div className="flex-1 flex items-center gap-3 px-3 md:px-4">
                  <Search size={22} className="text-indigo-400 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && dispatchSearch({ page: 1 })}
                    placeholder="اكتب اسم الطالب كامل أو جزء منه، أو رقم الجلوس..."
                    className="w-full bg-transparent border-none outline-none text-white font-semibold text-base md:text-lg py-3 placeholder:text-gray-500"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {query && (
                    <button
                      onClick={() => {
                        setQuery('');
                        inputRef.current?.focus();
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all shrink-0"
                      title="مسح"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl md:rounded-2xl font-bold text-sm transition-all duration-300 ml-2 shrink-0 ${
                    showFilters || statusFilter !== 'all' || minScore !== null || sortBy !== 'rel'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <SlidersHorizontal size={17} />
                  <span className="hidden sm:inline">فلترة وتخصيص</span>
                </button>

                {/* Submit Search Button */}
                <button
                  onClick={() => dispatchSearch({ page: 1 })}
                  disabled={searching}
                  className="flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:brightness-110 text-white font-extrabold text-base rounded-xl md:rounded-2xl transition-all duration-300 active:scale-95 shadow-lg shadow-indigo-500/25 shrink-0"
                >
                  {searching ? <Loader2 size={20} className="animate-spin" /> : <span>بحث</span>}
                </button>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex items-center justify-center gap-2 mt-3.5 flex-wrap text-xs">
                <span className="text-gray-500 font-semibold">أمثلة سريعة:</span>
                {[
                  { label: 'احمد محمود', val: 'احمد محمود' },
                  { label: 'عبدالرحمن', val: 'عبدالرحمن' },
                  { label: 'رقم جلوس: 2001970', val: '2001970' },
                  { label: 'فاطمه', val: 'فاطمه' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(chip.val);
                      dispatchSearch({ query: chip.val, page: 1 });
                    }}
                    className="bg-white/[0.03] border border-white/10 text-gray-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 px-3 py-1 rounded-full font-semibold transition-all duration-200"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Expandable Customization & Filter Controls */}
            {showFilters && (
              <div className="max-w-3xl mx-auto bg-[#0d0d1a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl space-y-5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 font-bold text-white text-base">
                    <SlidersHorizontal size={18} className="text-indigo-400" />
                    <span>تخصيص وتصفية البحث</span>
                  </div>
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setPresetGradeFilter('all');
                      setMinScore(null);
                      setMaxScore(null);
                      setSortBy('rel');
                      setMatchMode('smart');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    إعادة ضبط الفلاتر
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  
                  {/* Search Mode */}
                  <div>
                    <label className="block text-gray-400 font-bold mb-2 text-xs">نمط المطابقة الإملائية</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'smart', label: 'ذكي (مرن)' },
                        { id: 'fuzzy', label: 'تخمين (أخطاء)' },
                        { id: 'exact', label: 'مطابق دقيق' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setMatchMode(m.id as any)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            matchMode === m.id
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sorting Mode */}
                  <div>
                    <label className="block text-gray-400 font-bold mb-2 text-xs">ترتيب النتائج</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full bg-[#141426] border border-white/10 rounded-xl px-3 py-2 text-white font-semibold text-xs outline-none focus:border-indigo-500"
                    >
                      <option value="rel">حسب الصلة والتطابق الأفضل</option>
                      <option value="score_desc">الأعلى مجموعاً (تنازلي)</option>
                      <option value="score_asc">الأقل مجموعاً (تصاعدي)</option>
                      <option value="seat_asc">حسب رقم الجلوس</option>
                      <option value="name_asc">أبجدي (اسم الطالب)</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-gray-400 font-bold mb-2 text-xs">تصفية حسب حالة الطالب</label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          statusFilter === 'all'
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        الكل
                      </button>
                      {casesList.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => setStatusFilter(c)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            statusFilter === c
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grade Preset Filter */}
                  <div>
                    <label className="block text-gray-400 font-bold mb-2 text-xs">تصفية المجموع / النسبة</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: 'الكل' },
                        { id: 'top90', label: '+90% (ممتاز مرتفع)' },
                        { id: 'top85', label: '+85% (ممتاز)' },
                        { id: 'top75', label: '+75% (جيد جداً)' },
                        { id: 'pass', label: 'ناجحون (+50%)' },
                        { id: 'fail', label: 'أقل من 50%' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handlePresetGradeChange(p.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            presetGradeFilter === p.id
                              ? 'bg-purple-600 text-white border-purple-500'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Results Output Section */}
            {searched && (
              <div ref={resultsRef} className="space-y-6 pt-4">
                
                {/* Stats Bar */}
                <div className="flex items-center justify-between bg-[#0d0d1a] border border-white/10 rounded-2xl px-5 py-3 text-xs md:text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>
                      تم العثور على <strong className="text-indigo-400 text-base md:text-lg font-black">{totalMatches.toLocaleString('ar-EG')}</strong> نتيجة
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs font-semibold">
                    زمن البحث: {searchTimeMs} مللي ثانية ⚡
                  </div>
                </div>

                {/* Grid of Results */}
                {results.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                      {results.map(({ rec }, i) => {
                        const seat = rec[0];
                        const name = rec[1];
                        const degreeStr = rec[2];
                        const caseName = casesList[rec[3]] || '';
                        const badge = getStatusBadge(caseName);

                        const degreeNum = parseFloat(degreeStr);
                        const percentage = !isNaN(degreeNum) ? ((degreeNum / 410) * 100).toFixed(2) : null;

                        return (
                          <div
                            key={i}
                            className="bg-[#0e0e1c] border border-white/10 hover:border-indigo-500/40 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-950/50 group relative overflow-hidden flex flex-col justify-between"
                          >
                            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div>
                              {/* Top Bar: Name & Actions */}
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <h3 className="font-extrabold text-lg md:text-xl text-white leading-snug group-hover:text-indigo-300 transition-colors">
                                  {name}
                                </h3>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handleCopyResult(rec)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                    title="نسخ النتيجة"
                                  >
                                    {copiedId === seat ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                  </button>
                                  <button
                                    onClick={() => handleShareResult(rec)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 transition-all"
                                    title="مشاركة على واتساب"
                                  >
                                    <Share2 size={16} />
                                  </button>
                                </div>
                              </div>

                              {/* Details Grid */}
                              <div className="grid grid-cols-2 gap-3 mb-4 text-xs md:text-sm">
                                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3">
                                  <span className="text-gray-500 font-semibold block text-[11px] mb-1">رقم الجلوس</span>
                                  <span className="font-extrabold text-white text-base md:text-lg tracking-wider">{seat}</span>
                                </div>

                                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3">
                                  <span className="text-gray-500 font-semibold block text-[11px] mb-1">المجموع الكلي</span>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 text-lg md:text-xl">
                                      {degreeStr}
                                    </span>
                                    {percentage && (
                                      <span className="text-xs text-indigo-400 font-bold">
                                        ({percentage}%)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                              <span className="text-gray-500 text-xs font-semibold">حالة الطالب</span>
                              <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${badge.style}`}>
                                <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                                {caseName}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-6 flex-wrap">
                        <button
                          onClick={() => {
                            const p = Math.max(1, page - 1);
                            setPage(p);
                            dispatchSearch({ page: p });
                            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          disabled={page === 1}
                          className="w-10 h-10 flex items-center justify-center border border-white/10 bg-[#0d0d1a] text-gray-400 rounded-xl transition-all hover:bg-white/10 disabled:opacity-30"
                        >
                          <ChevronRight size={18} />
                        </button>

                        {getPageNums().map((p, i) =>
                          p === '...' ? (
                            <span key={`e${i}`} className="text-gray-600 px-1 select-none">…</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => {
                                setPage(p as number);
                                dispatchSearch({ page: p as number });
                                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={`w-10 h-10 flex items-center justify-center border rounded-xl text-xs font-bold transition-all ${
                                p === page
                                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-transparent text-white shadow-lg shadow-indigo-500/25'
                                  : 'border-white/10 bg-[#0d0d1a] text-gray-400 hover:bg-white/10'
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}

                        <button
                          onClick={() => {
                            const p = Math.min(totalPages, page + 1);
                            setPage(p);
                            dispatchSearch({ page: p });
                            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          disabled={page === totalPages}
                          className="w-10 h-10 flex items-center justify-center border border-white/10 bg-[#0d0d1a] text-gray-400 rounded-xl transition-all hover:bg-white/10 disabled:opacity-30"
                        >
                          <ChevronLeft size={18} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* No Results State */
                  <div className="max-w-md mx-auto bg-[#0e0e1a] border border-white/10 rounded-3xl p-12 text-center my-8 shadow-2xl">
                    <Search size={48} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">لم يتم العثور على نتائج</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      جرب تغيير نمط المطابقة إلى "ذكي" أو "تخمين"، أو ابحث باستخدام جزء من الاسم أو رقم الجلوس.
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center text-xs text-gray-500">
        <p>منظومة استعلام نتيجة الثانوية العامة 2026 — مصممة للسرعة والأداء الفائق</p>
      </footer>
    </div>
  );
};

export default Thanawya;
