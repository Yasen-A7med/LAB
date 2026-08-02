import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import type { QRCodeItem } from '../../types/qr';

interface DeleteQRModalProps {
  isOpen: boolean;
  item: QRCodeItem | null;
  onClose: () => void;
  onSubmit: (id: string, passwordInput: string) => Promise<{ success: boolean; error?: string }>;
}

export const DeleteQRModal: React.FC<DeleteQRModalProps> = ({
  isOpen,
  item,
  onClose,
  onSubmit,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setError('Please enter your security password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await onSubmit(item.id, passwordInput);
      if (!res.success) {
        setError(res.error || 'Incorrect password.');
        return;
      }
      setPasswordInput('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete QR code.');
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
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-rose-400">Delete QR Code</h3>
                  <p className="text-xs text-gray-400">Permanently delete "{item.title}"</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Warning Alert */}
            <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2 font-light leading-relaxed">
              <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <span>
                <strong className="font-semibold">Warning:</strong> This action cannot be undone. Scans of this QR code will no longer redirect.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Security Password Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={13} className="text-amber-400" />
                  <span>Enter Password to Confirm</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter the password for this QR code"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all"
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      <span>Delete Permanently</span>
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
