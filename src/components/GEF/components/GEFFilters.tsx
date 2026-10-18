import React from 'react';
import { Search } from 'lucide-react';
import type { CategoryFilter } from '../types';

interface GEFFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (c: CategoryFilter) => void;
}

const CATEGORIES: { label: string; value: CategoryFilter }[] = [
  { label: 'All Targets (62)', value: 'ALL' },
  { label: '🎓 Catwalk Academies (6)', value: 'Catwalk Academy & Runway Training' },
  { label: '✨ Boutique Agencies (11)', value: 'Boutique Modeling Agency' },
  { label: '🎯 Casting Hubs (12)', value: 'Casting Agency & Talent Hub' },
  { label: '🏛️ Industry Councils (5)', value: 'Industry Organizer & Council' },
  { label: '👗 Designer PR Referrals (28)', value: 'Designer Brand PR & Referral' },
];

export const GEFFilters: React.FC<GEFFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl mb-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by agency name, founder, city, Instagram handle, or notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          aria-label="Filter targets by outreach status"
          className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-gray-200 text-sm font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="To Contact">To Contact (Pending)</option>
          <option value="Contacted">Contacted</option>
          <option value="In Discussion">In Discussion</option>
          <option value="Agreed">🎉 Agreed (Partner Confirmed)</option>
          <option value="Declined">Declined</option>
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = categoryFilter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => onCategoryFilterChange(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
