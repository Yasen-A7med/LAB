import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Search, X, Filter, ChevronLeft, ChevronRight, GraduationCap, Hash, BarChart3, CheckCircle2, Loader2 } from 'lucide-react';

interface ThanawayaProps {
  onBack: () => void;
}

// Arabic normalization map
const NORM: Record<string, string> = {
  'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا',
  'ى': 'ي', 'ئ': 'ي',
  'ة': 'ه',
  'ؤ': 'و',
  'ٍ': '', 'ٌ': '', 'ً': '', 'َ': '', 'ُ': '', 'ِ': '', 'ّ': '', 'ْ': '',
  'ـ': '',
};

function normalizeArabic(str: string): string {
  if (!str) return '';
  let r = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    r += ch in NORM ? NORM[ch] : ch;
  }
  return r.replace(/\s+/g, ' ').trim();
}

type Record4 = [string, string, string, number]; // seat, name, degree, caseIdx

const PER_PAGE = 20;

const Thanawya: React.FC<ThanawayaProps> = ({ onBack }) => {
  const [data, setData] = useState<Record4[] | null>(null);
  const [cases, setCases] = useState<string[]>([]);
  const [normNames, setNormNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadMsg, setLoadMsg] = useState('جاري تحميل البيانات...');
  const [loadSub, setLoadSub] = useState('هذا قد يستغرق بضع ثوانٍ');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [filteredResults, setFilteredResults] = useState<number[]>([]);
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(1);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load data
  useEffect(() => {
    (async () => {
      try {
        setLoadMsg('جاري تحميل البيانات...');
        const resp = await fetch('/thanawya/data.json.gz');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        setLoadMsg('جاري فك الضغط...');
        const ds = new DecompressionStream('gzip');
        const decompressed = resp.body!.pipeThrough(ds);
        const reader = decompressed.getReader();
        const chunks: BlobPart[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const blob = new Blob(chunks);
        const text = await blob.text();

        setLoadMsg('جاري معالجة البيانات...');
        const raw = JSON.parse(text) as { c: string[]; d: Record4[] };
        setCases(raw.c);
        setData(raw.d);

        setLoadMsg('جاري بناء الفهرس...');
        const norms = new Array<string>(raw.d.length);
        for (let i = 0; i < raw.d.length; i++) {
          norms[i] = normalizeArabic(raw.d[i][1]);
        }
        setNormNames(norms);
        setLoading(false);
      } catch (err: any) {
        setLoadMsg('خطأ في تحميل البيانات');
        setLoadSub(err.message || 'حاول مرة أخرى');
      }
    })();
  }, []);

  // Focus input after loading
  useEffect(() => {
    if (!loading && inputRef.current) inputRef.current.focus();
  }, [loading]);

  const doSearch = useCallback((queryOverride?: string) => {
    const q = (queryOverride ?? query).trim();
    if (!data || !q) return;
    setSearching(true);
    setFilterText('');
    requestAnimationFrame(() => {
      setTimeout(() => {
        const normQ = normalizeArabic(q);
        const isNum = /^\d+$/.test(q);
        const hits: number[] = [];

        if (isNum) {
          for (let i = 0; i < data.length; i++) {
            if (data[i][0] === q) hits.push(i);
          }
          if (hits.length === 0) {
            for (let i = 0; i < data.length; i++) {
              if (data[i][0].startsWith(q)) {
                hits.push(i);
                if (hits.length >= 200) break;
              }
            }
          }
        } else {
          const tokens = normQ.split(/\s+/).filter(Boolean);
          if (tokens.length > 0) {
            for (let i = 0; i < data.length; i++) {
              const name = normNames[i];
              let ok = true;
              for (const t of tokens) {
                if (name.indexOf(t) === -1) { ok = false; break; }
              }
              if (ok) {
                hits.push(i);
                if (hits.length >= 500) break;
              }
            }
          }
        }

        setSearchResults(hits);
        setFilteredResults(hits);
        setPage(1);
        setSearched(true);
        setSearching(false);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }, 16);
    });
  }, [data, query, normNames]);

  // Sub-filter
  useEffect(() => {
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    filterTimerRef.current = setTimeout(() => {
      if (!filterText.trim()) {
        setFilteredResults(searchResults);
        setPage(1);
        return;
      }
      if (!data) return;
      const tokens = normalizeArabic(filterText.trim()).split(/\s+/).filter(Boolean);
      const filtered = searchResults.filter(i => {
        const combined = normNames[i] + ' ' + data[i][0] + ' ' + normalizeArabic(cases[data[i][3]]);
        return tokens.every(t => combined.indexOf(t) !== -1);
      });
      setFilteredResults(filtered);
      setPage(1);
    }, 250);
    return () => { if (filterTimerRef.current) clearTimeout(filterTimerRef.current); };
  }, [filterText, searchResults, data, normNames, cases]);

  // Status class
  const statusStyle = (desc: string) => {
    if (desc.includes('ناجح')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (desc.includes('راسب') || desc.includes('رسب')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (desc.includes('دور ثان') || desc.includes('ملحق')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const dotColor = (desc: string) => {
    if (desc.includes('ناجح')) return 'bg-emerald-400';
    if (desc.includes('راسب') || desc.includes('رسب')) return 'bg-red-400';
    if (desc.includes('دور ثان') || desc.includes('ملحق')) return 'bg-amber-400';
    return 'bg-gray-400';
  };

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / PER_PAGE);
  const pageData = filteredResults.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
    <div className="min-h-screen bg-[#0f0f1a] text-white font-sans relative overflow-x-hidden" dir="rtl">
      {/* Background shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-[120px] -top-[200px] -right-[100px] animate-pulse" style={{ animationDuration: '20s' }} />
        <div className="absolute w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px] -bottom-[100px] -left-[150px] animate-pulse" style={{ animationDuration: '25s' }} />
        <div className="absolute w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '15s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1100px] mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
              title="رجوع"
            >
              <ArrowRight size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="font-extrabold text-lg">نتيجة الثانوية العامة</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
            الدور الأول 2026
          </div>
        </div>
      </header>

      {/* Hero + Search */}
      <section className="relative z-10 pt-14 pb-10 text-center px-5">
        <h1 className="flex flex-col items-center gap-1 mb-4">
          <span className="text-xl font-semibold text-gray-400">استعلم عن</span>
          <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            نتيجتك الآن
          </span>
        </h1>
        <p className="text-gray-500 text-base mb-10">ابحث بالاسم أو رقم الجلوس عن نتيجة الثانوية العامة</p>

        {/* Search box */}
        <div className="max-w-[640px] mx-auto flex items-stretch bg-[#1a1a2e] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)] focus-within:border-indigo-500/50 focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.3),0_0_0_4px_rgba(99,102,241,0.15)] transition-all duration-300 max-md:flex-col">
          <div className="flex-1 flex items-center gap-3 px-5">
            <Search size={20} className="text-gray-600 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="اكتب الاسم أو رقم الجلوس..."
              className="flex-1 bg-transparent border-none outline-none text-white font-medium py-[18px] text-base placeholder:text-gray-600"
              autoComplete="off"
              spellCheck={false}
              disabled={loading}
            />
            {query && (
              <button
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white transition-all shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => doSearch()}
            disabled={loading || searching}
            className="flex items-center justify-center gap-2 px-7 py-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base border-none cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 max-md:py-3.5 max-md:border-t max-md:border-white/[0.08]"
          >
            {searching ? <Loader2 size={18} className="animate-spin" /> : <span>بحث</span>}
          </button>
        </div>

        {/* Hint chips */}
        {!loading && (
          <div className="flex items-center justify-center gap-2.5 mt-5 flex-wrap">
            <span className="text-gray-600 text-sm">أمثلة:</span>
            {['احمد', '2001970'].map(v => (
              <button
                key={v}
                onClick={() => { setQuery(v); doSearch(v); }}
                className="bg-white/[0.03] border border-white/[0.08] text-gray-400 text-sm px-4 py-1.5 rounded-full cursor-pointer transition-all hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-400"
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Loading */}
      {loading && (
        <section className="relative z-10 px-5 pb-10">
          <div className="max-w-[400px] mx-auto bg-[#1a1a2e] border border-white/[0.08] rounded-2xl p-14 text-center">
            <div className="w-12 h-12 border-3 border-white/[0.08] border-t-indigo-500 rounded-full animate-spin mx-auto mb-5" />
            <p className="text-white font-semibold text-lg">{loadMsg}</p>
            <p className="text-gray-600 text-sm mt-2">{loadSub}</p>
          </div>
        </section>
      )}

      {/* Results */}
      {searched && !loading && (
        <section ref={resultsRef} className="relative z-10 px-5 pb-16">
          <div className="max-w-[1100px] mx-auto">
            {filteredResults.length > 0 ? (
              <>
                {/* Results header */}
                <div className="flex items-center justify-between gap-4 mb-6 flex-wrap max-md:flex-col max-md:items-stretch">
                  <div className="text-gray-400 text-sm font-semibold">
                    <span className="text-indigo-400 text-xl font-extrabold">{filteredResults.length.toLocaleString('ar-EG')}</span> نتيجة
                  </div>
                  {searchResults.length > 1 && (
                    <div className="flex items-center gap-2.5 bg-[#1a1a2e] border border-white/[0.08] rounded-xl px-4 flex-1 max-w-[400px] focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all max-md:max-w-none">
                      <Filter size={16} className="text-gray-600 shrink-0" />
                      <input
                        type="text"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                        placeholder="فلتر النتائج... (اكتب كلمة للتصفية)"
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm py-3 placeholder:text-gray-600"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                  )}
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pageData.map((idx, i) => {
                    const rec = data![idx];
                    const caseDesc = cases[rec[3]];
                    return (
                      <div
                        key={idx}
                        className="bg-[#1a1a2e] border border-white/[0.08] rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:bg-[#222240] hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group"
                        style={{ animation: `cardIn 0.4s ease both`, animationDelay: `${i * 50}ms` }}
                      >
                        <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-l from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="text-lg font-extrabold text-white mb-4 leading-relaxed">{rec[1]}</div>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2 text-gray-600 text-sm font-semibold shrink-0">
                              <Hash size={14} className="opacity-60" />
                              رقم الجلوس
                            </span>
                            <span className="font-bold text-white">{rec[0]}</span>
                          </div>
                          <hr className="border-white/[0.06]" />
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2 text-gray-600 text-sm font-semibold shrink-0">
                              <BarChart3 size={14} className="opacity-60" />
                              المجموع
                            </span>
                            <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{rec[2]}</span>
                          </div>
                          <hr className="border-white/[0.06]" />
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2 text-gray-600 text-sm font-semibold shrink-0">
                              <CheckCircle2 size={14} className="opacity-60" />
                              الحالة
                            </span>
                            <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-1.5 rounded-full border ${statusStyle(caseDesc)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor(caseDesc)} shrink-0`} />
                              {caseDesc}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-10 h-10 flex items-center justify-center border border-white/[0.08] bg-[#1a1a2e] text-gray-400 rounded-lg cursor-pointer transition-all hover:bg-[#222240] hover:border-indigo-500/30 hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronRight size={18} />
                    </button>
                    {getPageNums().map((p, i) =>
                      p === '...' ? (
                        <span key={`e${i}`} className="text-gray-600 px-1 select-none">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => { setPage(p); resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                          className={`w-10 h-10 flex items-center justify-center border rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                            p === page
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-transparent text-white'
                              : 'border-white/[0.08] bg-[#1a1a2e] text-gray-400 hover:bg-[#222240] hover:border-indigo-500/30 hover:text-indigo-400'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-10 h-10 flex items-center justify-center border border-white/[0.08] bg-[#1a1a2e] text-gray-400 rounded-lg cursor-pointer transition-all hover:bg-[#222240] hover:border-indigo-500/30 hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* No results */
              <div className="max-w-[500px] mx-auto bg-[#1a1a2e] border border-white/[0.08] rounded-2xl p-14 text-center">
                <Search size={48} className="text-gray-700 mx-auto mb-5" />
                <h3 className="text-xl font-bold text-white mb-2">لم يتم العثور على نتائج</h3>
                <p className="text-gray-500 text-sm">تأكد من صحة الاسم أو رقم الجلوس وحاول مرة أخرى</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-5 text-center mt-auto">
        <p className="text-gray-600 text-sm">نتيجة الثانوية العامة — الدور الأول 2026</p>
      </footer>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Thanawya;
