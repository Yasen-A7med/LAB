import React, { useState } from 'react';
import { 
  Search, 
  RefreshCw, 
  Download, 
  UserPlus, 
  Mail, 
  Trash2, 
  QrCode, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import type { GuestItem } from '../types';
import { TicketPassModal } from '../TicketPassModal';

interface GuestManagerProps {
  guests: GuestItem[];
  loading: boolean;
  autoRefresh: boolean;
  eventName: string;
  eventDate: string;
  eventAddress: string;
  onToggleAutoRefresh: () => void;
  onAddGuest: (email: string, name: string) => Promise<void>;
  onDeleteGuest: (id: string) => Promise<void>;
  onCheckin: (idOrEmail: string) => Promise<{ success: boolean; message: string } | void>;
  onUndoCheckin: (id: string) => Promise<void>;
}

export const GuestManager: React.FC<GuestManagerProps> = ({
  guests,
  loading,
  autoRefresh,
  eventName,
  eventDate,
  eventAddress,
  onToggleAutoRefresh,
  onAddGuest,
  onDeleteGuest,
  onCheckin,
  onUndoCheckin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'checked-in'>('all');
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [addingGuest, setAddingGuest] = useState(false);
  const [selectedTicketGuest, setSelectedTicketGuest] = useState<GuestItem | null>(null);

  const checkedInCount = guests.filter((g) => g.status === 'checked-in').length;
  const pendingCount = guests.length - checkedInCount;
  const checkinPercentage = guests.length > 0 ? Math.round((checkedInCount / guests.length) * 100) : 0;

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.name && g.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (g.ticket_id && g.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && g.status === statusFilter;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestEmail.trim()) return;
    setAddingGuest(true);
    await onAddGuest(newGuestEmail.trim(), newGuestName.trim());
    setNewGuestName('');
    setNewGuestEmail('');
    setAddingGuest(false);
  };

  const exportCSV = () => {
    if (guests.length === 0) return;
    const headers = ['Name', 'Email', 'Ticket ID', 'Status', 'Registration Date'];
    const rows = guests.map((g) => [
      `"${g.name || ''}"`,
      `"${g.email}"`,
      `"${g.ticket_id || g.id}"`,
      `"${g.status}"`,
      `"${new Date(g.created_at).toLocaleString('en-US')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `guests_${eventName.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl p-4 flex flex-col">
          <span className="text-xs text-gray-400 font-medium">Total Attendees</span>
          <span className="text-2xl font-extrabold text-white mt-1">{guests.length}</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col">
          <span className="text-xs text-emerald-400 font-medium">Checked-In</span>
          <span className="text-2xl font-extrabold text-emerald-400 mt-1">{checkedInCount}</span>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col">
          <span className="text-xs text-amber-400 font-medium">Pending Access</span>
          <span className="text-2xl font-extrabold text-amber-400 mt-1">{pendingCount}</span>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 flex flex-col">
          <span className="text-xs text-purple-400 font-medium">Turnout Rate</span>
          <span className="text-2xl font-extrabold text-purple-300 mt-1">{checkinPercentage}%</span>
        </div>
      </div>

      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or ticket ID..."
              className="w-full bg-[#0b0b14]/80 border border-white/10 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'checked-in')}
            className="bg-[#0b0b14]/80 border border-white/10 text-xs sm:text-sm text-gray-200 rounded-xl px-3 py-2.5 outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="checked-in">Checked-In</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoRefresh}
            className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
              autoRefresh ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border-white/10 text-gray-500'
            }`}
            title="Toggle 5s Live Auto-Sync Across Gatekeeper Devices"
          >
            <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''} />
            <span>{autoRefresh ? 'Live Sync ON' : 'Sync Paused'}</span>
          </button>

          <button
            onClick={exportCSV}
            disabled={guests.length === 0}
            className="px-3.5 py-2.5 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {/* Add Guest Form */}
          <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              placeholder="Guest Name..."
              className="bg-[#0b0b14]/80 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none w-28 sm:w-36"
            />
            <input
              type="email"
              required
              value={newGuestEmail}
              onChange={(e) => setNewGuestEmail(e.target.value)}
              placeholder="Email..."
              className="bg-[#0b0b14]/80 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none w-32 sm:w-44"
            />
            <button
              type="submit"
              disabled={addingGuest}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1 shrink-0 disabled:opacity-50"
            >
              <UserPlus size={15} />
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        {loading ? (
          <div className="py-12 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin" /> Loading attendees...
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">No guests found in roster.</div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredGuests.map((g) => (
              <div key={g.id} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    g.status === 'checked-in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.04] text-gray-400'
                  }`}>
                    {(g.name || g.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-white block">{g.name || 'Event Attendee'}</span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1.5 font-mono">
                      <Mail size={12} className="text-gray-500" />
                      {g.email}
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-mono block mt-0.5">
                      Ticket ID: {g.ticket_id || g.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTicketGuest(g)}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
                    title="View & Share Digital Pass"
                  >
                    <QrCode size={13} className="text-amber-400" />
                    <span className="hidden sm:inline">Ticket Pass</span>
                  </button>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      g.status === 'checked-in'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {g.status === 'checked-in' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                    <span>{g.status}</span>
                  </span>

                  {g.status === 'pending' ? (
                    <button
                      onClick={() => onCheckin(g.ticket_id || g.email)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-bold text-xs rounded-xl transition-all shadow-md"
                    >
                      Check-in
                    </button>
                  ) : (
                    <button
                      onClick={() => onUndoCheckin(g.id)}
                      className="px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-gray-200 text-[11px] rounded-xl transition-colors"
                      title="Undo check-in status"
                    >
                      Undo
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteGuest(g.id)}
                    className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                    title="Remove guest"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Pass Modal */}
      {selectedTicketGuest && (
        <TicketPassModal
          isOpen={true}
          guest={selectedTicketGuest}
          eventDetails={{
            name: eventName,
            date: eventDate,
            address: eventAddress,
          }}
          onClose={() => setSelectedTicketGuest(null)}
        />
      )}
    </div>
  );
};
