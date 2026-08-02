import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Copy,
  Check,
  Download,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  Globe,
  QrCode as QrIcon,
} from 'lucide-react';
import type { QRCodeItem } from '../../types/qr';

interface QRCardProps {
  item: QRCodeItem;
  onEdit: (item: QRCodeItem) => void;
  onDelete: (item: QRCodeItem) => void;
  onCopyToast: (text: string) => void;
}

export const QRCard: React.FC<QRCardProps> = ({
  item,
  onEdit,
  onDelete,
  onCopyToast,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const redirectUrl = `${window.location.origin}/r/${item.id}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, redirectUrl, {
        width: 220,
        margin: 1.5,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).catch((err) => console.error('Failed generating QR code:', err));
    }
  }, [redirectUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(redirectUrl);
    setCopied(true);
    onCopyToast('Link');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${item.id}.png`;
    a.click();
    onCopyToast('QR Code PNG');
  };

  const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="glow-card relative rounded-3xl p-6 bg-[#0e0f18]/80 border border-white/10 flex flex-col justify-between overflow-hidden shadow-xl"
    >
      <div>
        {/* Top Info Bar */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <QrIcon size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-lg font-bold tracking-tight text-white truncate" title={item.title}>
                {item.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-0.5">
                <span>/r/{item.id}</span>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1 text-[11px] text-gray-500 font-sans">
                  <Calendar size={11} /> {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Scan counter badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold shrink-0">
            <Eye size={13} />
            <span>{item.scans || 0} scans</span>
          </div>
        </div>

        {/* QR Canvas Display & Target URL */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-black/40 border border-white/5 mb-5">
          {/* QR Canvas Container */}
          <div className="bg-white p-2.5 rounded-xl shadow-md shrink-0">
            <canvas ref={canvasRef} className="w-28 h-28 sm:w-32 sm:h-32 block" />
          </div>

          {/* Details Column */}
          <div className="flex flex-col gap-3 min-w-0 w-full">
            {/* Short Redirect Link */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Permanent Short Link
              </span>
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-xs text-cyan-300 overflow-hidden">
                <span className="truncate">{redirectUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copy Short Link"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Current Target Destination URL */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Globe size={11} className="text-emerald-400" />
                Target Destination
              </span>
              <a
                href={item.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 hover:underline truncate"
                title={item.target_url}
              >
                <span className="truncate">{item.target_url}</span>
                <ExternalLink size={12} className="shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Download QR PNG Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>Download PNG</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Target URL Button */}
          <button
            onClick={() => onEdit(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/20 transition-colors cursor-pointer"
            title="Edit Target URL (Password required)"
          >
            <Edit3 size={13} />
            <span>Edit Target</span>
          </button>

          {/* Delete QR Button */}
          <button
            onClick={() => onDelete(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors cursor-pointer"
            title="Delete QR (Password required)"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
