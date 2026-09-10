import React, { useState } from 'react';
import { QrCode, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import type { GuestItem } from '../types';
import { QRCameraScanner } from '../QRCameraScanner';

interface ScannerTabProps {
  guests: GuestItem[];
  onCheckin: (scannedText: string) => Promise<{ success: boolean; message: string }>;
}

export const ScannerTab: React.FC<ScannerTabProps> = ({ guests, onCheckin }) => {
  const [scanInput, setScanInput] = useState('');
  const [scanStatus, setScanStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [scannerActive, setScannerActive] = useState(true);

  const checkedInCount = guests.filter((g) => g.status === 'checked-in').length;
  const pendingCount = guests.length - checkedInCount;

  const handleManualSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = scanInput.trim();
    if (!val) return;

    const res = await onCheckin(val);
    setScanStatus(res);
    if (res.success) {
      setScanInput('');
    }
  };

  const handleCameraScan = async (decodedText: string) => {
    const res = await onCheckin(decodedText);
    setScanStatus(res);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0b0b14]/70 border border-white/10 rounded-2xl p-4 text-center">
          <span className="text-xs text-gray-400 block mb-1">Total Guests</span>
          <span className="text-2xl font-extrabold text-white">{guests.length}</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
          <span className="text-xs text-emerald-400 block mb-1">Checked In</span>
          <span className="text-2xl font-extrabold text-emerald-400">{checkedInCount}</span>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
          <span className="text-xs text-amber-400 block mb-1">Pending</span>
          <span className="text-2xl font-extrabold text-amber-400">{pendingCount}</span>
        </div>
      </div>

      {/* Camera Live Scanner Box */}
      <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode size={20} className="text-amber-400" />
            <h3 className="text-lg font-bold text-white">Live QR Camera Scanner</h3>
          </div>
          <button
            type="button"
            onClick={() => setScannerActive((prev) => !prev)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-gray-300 hover:text-white transition-colors"
          >
            {scannerActive ? 'Pause Camera' : 'Resume Camera'}
          </button>
        </div>

        <div className="w-full flex justify-center overflow-hidden rounded-xl bg-black/40">
          <QRCameraScanner
            isActive={scannerActive}
            onScanSuccess={handleCameraScan}
          />
        </div>
      </div>

      {/* Manual Search & Verification Box */}
      <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400" />
          <h3 className="text-base font-bold text-white">Manual Ticket or Email Check-in</h3>
        </div>

        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            placeholder="Enter Guest Email, Name, or Ticket ID..."
            className="flex-1 bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white outline-none"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shrink-0"
          >
            Verify & Check-in
          </button>
        </form>

        {scanStatus && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              scanStatus.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {scanStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{scanStatus.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
