import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Loader2, QrCode, AlertCircle, ArrowLeft } from 'lucide-react';
import { getQRCodeById, incrementScanCount } from '../../lib/supabase';
import type { QRCodeItem } from '../../types/qr';

interface RedirectHandlerProps {
  id?: string;
  onBack: () => void;
}

export const RedirectHandler: React.FC<RedirectHandlerProps> = ({ id, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const slug = id || window.location.pathname.replace(/^\/r\/?/, '');

    if (!slug) {
      setError('Invalid link parameter.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function handleRedirect() {
      try {
        const item: QRCodeItem | null = await getQRCodeById(slug);

        if (!isMounted) return;

        if (!item || !item.target_url) {
          setError('This Dynamic QR link does not exist or has been deleted.');
          setLoading(false);
          return;
        }

        setTargetUrl(item.target_url);

        // Increment scan count in background
        incrementScanCount(slug).catch(() => {});

        // Instant redirect execution
        window.location.replace(item.target_url);
      } catch (err) {
        if (isMounted) {
          setError('Failed to perform redirect.');
          setLoading(false);
        }
      }
    }

    handleRedirect();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#050508] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Lighting */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 via-black to-emerald-900/20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-[#0d0e15]/90 border border-white/10 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center gap-6 backdrop-blur-2xl"
      >
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
          <QrCode size={32} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-cyan-400" />
            <h3 className="text-xl font-bold tracking-tight">Redirecting...</h3>
            <p className="text-xs text-gray-400">Taking you to your target destination</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <h3 className="text-xl font-bold text-rose-400 tracking-tight">Link Not Found</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{error}</p>
            <button
              onClick={onBack}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to LAB</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-xl font-bold tracking-tight text-emerald-400">Opening Destination</h3>
            <p className="text-xs text-gray-400">If you are not redirected automatically, click below:</p>
            {targetUrl && (
              <a
                href={targetUrl}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black text-xs font-bold shadow-lg hover:brightness-110 transition-all"
              >
                <span>Continue to Destination</span>
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
