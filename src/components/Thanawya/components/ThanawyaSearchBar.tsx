import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { Search, X, Loader2, SlidersHorizontal } from 'lucide-react';
import type { ThanawyaSortOption } from '../types';

interface ThanawyaSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: () => void;
  searching: boolean;
  casesList: string[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: ThanawyaSortOption;
  onSortByChange: (sort: ThanawyaSortOption) => void;
  springTransition: Transition;
}

export const ThanawyaSearchBar: React.FC<ThanawyaSearchBarProps> = ({
  query,
  onQueryChange,
  onSearch,
  searching,
  casesList,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  springTransition
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
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
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="اكتب الاسم أو رقم الجلوس..."
            className="w-full bg-transparent border-none outline-none text-white text-base py-3 placeholder:text-gray-500 leading-normal"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                onQueryChange('');
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
            onClick={onSearch}
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
          onClick={() => onStatusFilterChange('all')}
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
            onClick={() => onStatusFilterChange(c)}
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
            transition={springTransition}
            className="bg-[#0b0b14] border border-white/10 rounded-2xl p-4 space-y-3 text-xs overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-semibold">ترتيب النتائج حسب</span>
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as ThanawyaSortOption)}
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
    </div>
  );
};
