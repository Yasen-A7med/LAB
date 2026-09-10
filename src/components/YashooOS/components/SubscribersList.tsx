import React, { useState } from 'react';
import { Search, RefreshCw, UserCheck } from 'lucide-react';
import type { SubscriberItem } from '../types';

interface SubscribersListProps {
  subscribers: SubscriberItem[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export const SubscribersList: React.FC<SubscribersListProps> = ({
  subscribers,
  loading,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Maintenance Subscribers</h2>
          <p className="text-xs text-gray-400">List of subscriber emails collected during maintenance mode.</p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter subscribers by email..."
          className="w-full bg-[#0b0b14]/80 border border-white/10 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        {loading ? (
          <div className="py-12 text-center text-gray-500 text-xs">Loading subscribers...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">No subscribers registered yet.</div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filtered.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <UserCheck size={18} className="text-amber-400" />
                  <div>
                    <span className="font-semibold text-xs sm:text-sm text-white block">{s.email}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      Subscribed: {new Date(s.created_at).toLocaleString('en-US')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(s.email);
                    alert(`Copied email: ${s.email}`);
                  }}
                  className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-lg transition-colors"
                >
                  Copy Email
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
