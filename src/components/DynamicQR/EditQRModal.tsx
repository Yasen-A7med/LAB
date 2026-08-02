import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Lock, Edit3, Loader2 } from 'lucide-react';
import type { QRCodeItem } from '../../types/qr';

interface EditQRModalProps {
  isOpen: boolean;
  item: QRCodeItem | null;
  onClose: () => void;
  onSubmit: (id: string, passwordInput: string, newTargetUrl: string) => Promise<{ success: boolean; error?: string }>;
}

export const EditQRModal: React.FC<EditQRModalProps> = ({
  isOpen,
  item,
  onClose,
  onSubmit,
}) => {
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setNewTargetUrl(item.target_url);
      setPasswordInput('');
      setError(null);
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetUrl.trim()) {
      setError('Please enter a new target URL.');
      return;
    }
    if (!passwordInput.trim()) {
      setError('Please enter your security password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await onSubmit(item.id, passwordInput, newTargetUrl);
      if (!res.success) {
        setError(res.error || 'Incorrect password.');
        return;
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update target URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="relative w-full max-w-lg bg-[#0d0e15] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden z-10 text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Edit Target URL</h3>
                  <p className="text-xs text-gray-400">Update destination for "{item.title}"</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Note alert */}
            <div className="mb-4 px-4 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-light leading-relaxed">
              <span className="font-semibold">Dynamic Redirect:</span> The physical QR code will stay exactly the same. Only the destination link will be updated.
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* New Target URL Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <LinkIcon size={13} className="text-emerald-400" />
                  <span>New Destination Target URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/new-page"
                  value={newTargetUrl}
                  onChange={(e) => setNewTargetUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  required
                />
              </div>

              {/* Security Password Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={13} className="text-amber-400" />
                  <span>Security Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter the password set for this QR"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-black bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Edit3 size={15} />
                      <span>Update Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
