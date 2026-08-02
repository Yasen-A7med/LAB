import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Plus,
  Search,
  ArrowLeft,
  Check,
  Eye,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import AnimatedLiquidBackground from '../AnimatedLiquidBackground';
import type { QRCodeItem, CreateQRInput } from '../../types/qr';
import {
  fetchQRCodes,
  createQRCode,
  updateQRCode,
  deleteQRCode,
} from '../../lib/supabase';
import { QRCard } from './QRCard';
import { CreateQRModal } from './CreateQRModal';
import { EditQRModal } from './EditQRModal';
import { DeleteQRModal } from './DeleteQRModal';

interface DynamicQRStudioProps {
  onBack: () => void;
}

export const DynamicQRStudio: React.FC<DynamicQRStudioProps> = ({ onBack }) => {
  const [items, setItems] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QRCodeItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<QRCodeItem | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchQRCodes();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (label: string) => {
    setToastMessage(`Copied ${label} to clipboard`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCreateSubmit = async (input: CreateQRInput) => {
    const newItem = await createQRCode(input);
    setItems((prev) => [newItem, ...prev]);
    showToast('Dynamic QR created successfully');
  };

  const handleEditSubmit = async (
    id: string,
    passwordInput: string,
    newTargetUrl: string
  ) => {
    const res = await updateQRCode(id, passwordInput, newTargetUrl);
    if (res.success && res.updatedItem) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? res.updatedItem! : item))
      );
      showToast('Target URL updated');
    }
    return res;
  };

  const handleDeleteSubmit = async (id: string, passwordInput: string) => {
    const res = await deleteQRCode(id, passwordInput);
    if (res.success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast('QR Code deleted');
    }
    return res;
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.target_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalScans = items.reduce((acc, curr) => acc + (curr.scans || 0), 0);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#050508] text-white flex flex-col relative overflow-x-hidden select-none">
      {/* Background Liquid Light */}
      <AnimatedLiquidBackground />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-[#0e0e16]/95 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-2xl"
          >
            <Check size={15} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── Top Navigation Bar ──────────────── */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>LAB Dashboard</span>
          </button>
        </div>

        {/* Engine title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <QrCode size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:inline">
            Dynamic QR <span className="text-cyan-400 font-light ml-1">Studio</span>
          </span>
        </div>

        {/* Create Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black text-xs font-bold shadow-lg hover:brightness-110 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>New Dynamic QR</span>
        </button>
      </header>

      {/* ──────────────── Hero / Header Section ──────────────── */}
      <section className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 pt-6 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 uppercase tracking-wider mb-2">
              <Sparkles size={14} />
              <span>Smart Link Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Dynamic QR System.
            </h1>
            <p className="text-sm text-gray-400 font-light mt-2 max-w-xl">
              Create QR codes with fixed redirect links. Update the destination URL at any time using your password without changing the QR image.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4">
            <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Layers size={16} />
              </div>
              <div>
                <div className="text-xs text-gray-400">Total QRs</div>
                <div className="text-lg font-bold text-white">{items.length}</div>
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Eye size={16} />
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Scans</div>
                <div className="text-lg font-bold text-emerald-400">{totalScans}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── Search & Controls Bar ──────────────── */}
      <section className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, short link, or destination URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer self-end sm:self-auto"
            title="Refresh list"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      {/* ──────────────── Main QR Grid ──────────────── */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 pb-20 flex-1">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-3xl p-6 bg-white/[0.02] border border-white/5 animate-pulse flex flex-col gap-4 h-64"
              >
                <div className="h-6 bg-white/10 rounded-full w-1/3" />
                <div className="h-32 bg-white/5 rounded-2xl" />
                <div className="h-8 bg-white/10 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01] p-8">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <QrCode size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Dynamic QRs Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mb-6 font-light">
              {searchQuery
                ? 'No QR codes match your search criteria. Try a different keyword.'
                : 'Create your first dynamic QR code to start tracking scans and updating target links.'}
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black text-xs font-bold shadow-lg hover:brightness-110 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Create New Dynamic QR</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <QRCard
                  key={item.id}
                  item={item}
                  onEdit={(target) => setEditingItem(target)}
                  onDelete={(target) => setDeletingItem(target)}
                  onCopyToast={showToast}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ──────────────── Footer ──────────────── */}
      <footer className="relative z-10 w-full border-t border-white/[0.06] bg-[#030305]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex items-center justify-between text-xs text-gray-500">
          <span>Yashoo LAB • Dynamic QR System</span>
          <span>© {new Date().getFullYear()} LAB</span>
        </div>
      </footer>

      {/* Modals */}
      <CreateQRModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <EditQRModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEditSubmit}
      />

      <DeleteQRModal
        isOpen={!!deletingItem}
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onSubmit={handleDeleteSubmit}
      />
    </div>
  );
};
