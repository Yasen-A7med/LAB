import { useState, useEffect, useRef, useCallback } from 'react';
import type { SearchOptions, WorkerResultItem, ThanawyaSortOption } from '../types';

export const PER_PAGE = 20;

export function useThanawyaWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [loadMsg, setLoadMsg] = useState('جاري بدء النظام...');
  const [casesList, setCasesList] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter State
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<ThanawyaSortOption>('rel');
  const [subFilterText, setSubFilterText] = useState('');

  // Results State
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<WorkerResultItem[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subFilterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    const worker = new Worker(new URL('../../../workers/thanawyaWorker.ts', import.meta.url), { type: 'module' });
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
  }, [isReady, page, query, sortBy, statusFilter, subFilterText]);

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

  const handleSubFilterChange = (val: string) => {
    setSubFilterText(val);
    if (subFilterDebounceRef.current) clearTimeout(subFilterDebounceRef.current);

    subFilterDebounceRef.current = setTimeout(() => {
      dispatchSearch({ subQuery: val, page: 1 });
    }, 120);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    dispatchSearch({ statusFilter: status, page: 1 });
  };

  const handleSortByChange = (sort: ThanawyaSortOption) => {
    setSortBy(sort);
    dispatchSearch({ sortBy: sort, page: 1 });
  };

  return {
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
  };
}
