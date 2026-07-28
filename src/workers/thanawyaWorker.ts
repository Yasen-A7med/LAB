// Web Worker for Thanawya High School Results Processing & Fuzzy Search

export interface Record4 {
  0: string; // seat
  1: string; // name
  2: string; // degree
  3: number; // caseIdx
}

export interface CompactData {
  c: string[];  // cases
  d: Record4[]; // records
}

export interface SearchOptions {
  query: string;
  statusFilter: string; // 'all' or specific case
  minScore: number | null;
  maxScore: number | null;
  sortBy: 'rel' | 'score_desc' | 'score_asc' | 'seat_asc' | 'name_asc';
  matchMode: 'smart' | 'exact' | 'fuzzy';
  page: number;
  perPage: number;
}

export interface SearchResultPayload {
  hitsCount: number;
  totalMatches: number;
  page: number;
  totalPages: number;
  pageIndices: number[];
  timeMs: number;
}

// Global memory inside worker
let RECORDS: Record4[] = [];
let CASES: string[] = [];
let NORM_NAMES: string[] = [];
let DEGREES: Float32Array = new Float32Array(0);
let IS_READY = false;

// Comprehensive Arabic Normalization
const ARABIC_NORM_MAP: Record<string, string> = {
  'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا',
  'ى': 'ي', 'ئ': 'ي',
  'ة': 'ه',
  'ؤ': 'و',
  'ٍ': '', 'ٌ': '', 'ً': '', 'َ': '', 'ُ': '', 'ِ': '', 'ّ': '', 'ْ': '',
  'ـ': '',
  'ظ': 'ض', // Phonetic mapping for typos
  'ذ': 'ز',
  'ث': 'س'
};

function normalizeArabic(str: string, aggressive = false): string {
  if (!str) return '';
  let res = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch in ARABIC_NORM_MAP) {
      // For aggressive fuzzy, map phonetic typos; for normal, map common orthography
      if (!aggressive && (ch === 'ظ' || ch === 'ذ' || ch === 'ث')) {
        res += ch;
      } else {
        res += ARABIC_NORM_MAP[ch];
      }
    } else {
      res += ch;
    }
  }
  
  // Standardize spaces around common compound name prefixes (e.g., عبد الله -> عبدالله, ابو بكر -> ابوبكر)
  let cleaned = res.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/عبد\s+/g, 'عبد');
  cleaned = cleaned.replace(/ابو\s+/g, 'ابو');
  cleaned = cleaned.replace(/ام\s+/g, 'ام');
  cleaned = cleaned.replace(/بن\s+/g, 'بن');
  cleaned = cleaned.replace(/الدين\b/g, 'الدين');

  return cleaned;
}

// Levenshtein distance for fuzzy matching
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// IndexedDB Helper
const DB_NAME = 'ThanawyaDB_v2';
const STORE_NAME = 'records';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getFromIDB(): Promise<CompactData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('dataset');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function saveToIDB(data: CompactData): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(data, 'dataset');
  } catch (e) {
    console.warn('Could not cache to IndexedDB:', e);
  }
}

// Load & Index Dataset
async function loadDataset(url: string) {
  const start = performance.now();
  
  self.postMessage({ type: 'STATUS', message: 'جاري التحقق من التخزين المحلي المؤقت...' });

  let compact: CompactData | null = await getFromIDB();

  if (!compact) {
    self.postMessage({ type: 'STATUS', message: 'جاري تنزيل الملف المضغوط...' });
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    self.postMessage({ type: 'STATUS', message: 'جاري فك الضغط والمعالجة...' });
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

    self.postMessage({ type: 'STATUS', message: 'جاري تحليل واستخراج البيانات...' });
    compact = JSON.parse(text) as CompactData;

    // Cache asynchronously
    saveToIDB(compact).catch(() => {});
  }

  CASES = compact.c;
  RECORDS = compact.d;
  const count = RECORDS.length;

  self.postMessage({ type: 'STATUS', message: 'جاري بناء كشاف البحث السريع...' });

  NORM_NAMES = new Array(count);
  DEGREES = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const rec = RECORDS[i];
    NORM_NAMES[i] = normalizeArabic(rec[1]);
    const degNum = parseFloat(rec[2]);
    DEGREES[i] = isNaN(degNum) ? -1 : degNum;
  }

  IS_READY = true;
  const loadTime = Math.round(performance.now() - start);

  self.postMessage({
    type: 'READY',
    totalRecords: count,
    cases: CASES,
    loadTimeMs: loadTime,
  });
}

// Execute Search
function handleSearch(opts: SearchOptions) {
  if (!IS_READY) return;
  const start = performance.now();
  const rawQ = opts.query.trim();

  if (!rawQ && opts.statusFilter === 'all' && opts.minScore === null && opts.maxScore === null) {
    self.postMessage({
      type: 'SEARCH_RESULTS',
      hitsCount: 0,
      totalMatches: 0,
      page: 1,
      totalPages: 0,
      pageIndices: [],
      records: [],
      timeMs: 0
    });
    return;
  }

  const isNumeric = /^\d+$/.test(rawQ);
  const normQ = normalizeArabic(rawQ, opts.matchMode === 'fuzzy');
  const tokens = normQ.split(/\s+/).filter(Boolean);

  const matchedIndices: { idx: number; score: number }[] = [];

  for (let i = 0; i < RECORDS.length; i++) {
    const rec = RECORDS[i];
    const seat = rec[0];
    const nameNorm = NORM_NAMES[i];
    const caseIdx = rec[3];
    const degree = DEGREES[i];

    // 1. Status Filter
    if (opts.statusFilter !== 'all') {
      const caseName = CASES[caseIdx];
      if (caseName !== opts.statusFilter) continue;
    }

    // 2. Score Range Filter
    if (opts.minScore !== null && degree < opts.minScore) continue;
    if (opts.maxScore !== null && degree > opts.maxScore) continue;

    // 3. Query Matching
    if (!rawQ) {
      // Only status/score filter applied
      matchedIndices.push({ idx: i, score: degree });
      continue;
    }

    if (isNumeric) {
      if (seat === rawQ) {
        matchedIndices.push({ idx: i, score: 10000 });
      } else if (opts.matchMode !== 'exact' && seat.startsWith(rawQ)) {
        matchedIndices.push({ idx: i, score: 5000 + (100 - (seat.length - rawQ.length)) });
      } else if (opts.matchMode !== 'exact' && seat.includes(rawQ)) {
        matchedIndices.push({ idx: i, score: 1000 });
      }
    } else {
      // Text Search
      if (opts.matchMode === 'exact') {
        // Exact name match or exact substring
        if (nameNorm === normQ) {
          matchedIndices.push({ idx: i, score: 1000 });
        } else if (nameNorm.includes(normQ)) {
          matchedIndices.push({ idx: i, score: 800 });
        }
      } else {
        // Smart or Fuzzy match
        let tokenMatches = 0;
        let exactTokenMatches = 0;

        for (const t of tokens) {
          if (nameNorm.includes(t)) {
            tokenMatches++;
            exactTokenMatches++;
          } else if (opts.matchMode === 'fuzzy') {
            // Check for minor edit distance in words
            const nameTokens = nameNorm.split(' ');
            for (const nt of nameTokens) {
              if (nt.length >= 3 && Math.abs(nt.length - t.length) <= 1) {
                if (editDistance(nt, t) <= 1) {
                  tokenMatches++;
                  break;
                }
              }
            }
          }
        }

        if (tokenMatches === tokens.length) {
          let relScore = exactTokenMatches * 200 + tokenMatches * 100;
          if (nameNorm.startsWith(normQ)) relScore += 300;
          matchedIndices.push({ idx: i, score: relScore });
        }
      }
    }
  }

  // 4. Sorting Results
  if (opts.sortBy === 'score_desc') {
    matchedIndices.sort((a, b) => DEGREES[b.idx] - DEGREES[a.idx]);
  } else if (opts.sortBy === 'score_asc') {
    matchedIndices.sort((a, b) => DEGREES[a.idx] - DEGREES[b.idx]);
  } else if (opts.sortBy === 'seat_asc') {
    matchedIndices.sort((a, b) => parseInt(RECORDS[a.idx][0]) - parseInt(RECORDS[b.idx][0]));
  } else if (opts.sortBy === 'name_asc') {
    matchedIndices.sort((a, b) => RECORDS[a.idx][1].localeCompare(RECORDS[b.idx][1], 'ar'));
  } else {
    // Default: Sort by Relevance Score desc, then Degree desc
    matchedIndices.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return DEGREES[b.idx] - DEGREES[a.idx];
    });
  }

  const totalMatches = matchedIndices.length;
  const totalPages = Math.ceil(totalMatches / opts.perPage);
  const page = Math.max(1, Math.min(opts.page, totalPages || 1));
  const startIdx = (page - 1) * opts.perPage;
  const pageItems = matchedIndices.slice(startIdx, startIdx + opts.perPage);

  const resultRecords = pageItems.map(item => ({
    rec: RECORDS[item.idx],
    score: item.score
  }));

  const timeMs = Math.round(performance.now() - start);

  self.postMessage({
    type: 'SEARCH_RESULTS',
    totalMatches,
    page,
    totalPages,
    records: resultRecords,
    timeMs,
  });
}

// Worker Message Handler
self.onmessage = async (e: MessageEvent) => {
  const data = e.data;
  if (data.type === 'INIT') {
    try {
      await loadDataset(data.url);
    } catch (err: any) {
      self.postMessage({ type: 'ERROR', error: err.message || 'فشل في تحميل وتجهيز البيانات' });
    }
  } else if (data.type === 'SEARCH') {
    handleSearch(data.options as SearchOptions);
  }
};
