import React, { useState, useMemo, useCallback } from 'react';
import type { TargetEntity, OutreachStatus, CategoryFilter } from './types';
import { INITIAL_TARGETS } from './data/targetsData';
import { GEFHeader } from './components/GEFHeader';
import { GEFKpiBar } from './components/GEFKpiBar';
import { GEFFilters } from './components/GEFFilters';
import { GEFTargetCard } from './components/GEFTargetCard';
import { GEFTemplatesModal } from './components/GEFTemplatesModal';

interface GEFFashionAppProps {
  onBack: () => void;
}

const STORAGE_KEY = 'gef_outreach_state_v2';

export const GEFFashionApp: React.FC<GEFFashionAppProps> = ({ onBack }) => {
  const [targets, setTargets] = useState<TargetEntity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return INITIAL_TARGETS.map(t => {
          if (parsed[t.id]) {
            return {
              ...t,
              status: parsed[t.id].status || t.status,
              follow_up_notes: parsed[t.id].notes || t.follow_up_notes || '',
            };
          }
          return t;
        });
      } catch (e) {
        console.error('Failed to parse saved outreach state', e);
      }
    }
    return INITIAL_TARGETS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync to localStorage
  const persistState = useCallback((updated: TargetEntity[]) => {
    const state: Record<string, { status: OutreachStatus; notes: string }> = {};
    updated.forEach(t => {
      state[t.id] = {
        status: t.status,
        notes: t.follow_up_notes || '',
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, []);

  const handleStatusChange = useCallback((id: string, newStatus: OutreachStatus) => {
    setTargets(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, status: newStatus } : t));
      persistState(updated);
      return updated;
    });

    if (newStatus === 'Agreed') {
      const target = targets.find(t => t.id === id);
      alert(`🎉 PARTNERSHIP CONFIRMED with ${target?.name || 'Agency'}!\n\nYou can now send them the GEF International Fashion Show 2026 — Official Model Casting Call Form!`);
    }
  }, [targets, persistState]);

  const handleNotesChange = useCallback((id: string, notes: string) => {
    setTargets(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, follow_up_notes: notes } : t));
      persistState(updated);
      return updated;
    });
  }, [persistState]);

  const handleCopyText = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setToastMsg('Copied to clipboard!');
    setTimeout(() => {
      setCopiedLabel(null);
      setToastMsg(null);
    }, 2200);
  }, []);

  const handleExportCSV = useCallback(() => {
    let csv = "ID,Name,Category,Contact Person,Location,Instagram,Phone,Email,Status,Follow-up Notes\n";
    targets.forEach(t => {
      const row = [
        `"${t.id}"`,
        `"${t.name.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${(t.contact_person || '').replace(/"/g, '""')}"`,
        `"${t.location}"`,
        `"${t.instagram || ''}"`,
        `"${t.phone_raw || ''}"`,
        `"${t.email || ''}"`,
        `"${t.status}"`,
        `"${(t.follow_up_notes || '').replace(/"/g, '""')}"`
      ];
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "GEF_2026_Model_Outreach_Live_Tracking.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [targets]);

  const filteredTargets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return targets.filter(t => {
      const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const haystack = (
        t.name + ' ' + 
        t.contact_person + ' ' + 
        t.location + ' ' + 
        t.instagram + ' ' + 
        t.strategic_notes + ' ' + 
        (t.follow_up_notes || '')
      ).toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [targets, searchQuery, statusFilter, categoryFilter]);

  return (
    <div className="min-h-screen bg-[#070A12] text-white p-4 sm:p-6 lg:p-8 font-sans selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto">
        <GEFHeader
          onBack={onBack}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onExportCSV={handleExportCSV}
        />

        <GEFKpiBar targets={targets} />

        <GEFFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
        />

        {filteredTargets.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-white/5 bg-slate-900/30 text-gray-400">
            No targets match your current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTargets.map(target => (
              <GEFTargetCard
                key={target.id}
                target={target}
                onStatusChange={handleStatusChange}
                onNotesChange={handleNotesChange}
                onCopyText={handleCopyText}
                copiedLabel={copiedLabel}
              />
            ))}
          </div>
        )}
      </div>

      <GEFTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onCopyText={handleCopyText}
        copiedLabel={copiedLabel}
      />

      {/* Floating Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl animate-in slide-in-from-bottom-2 duration-150">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default GEFFashionApp;
