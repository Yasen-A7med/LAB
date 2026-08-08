import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw, AlertCircle, Volume2, VolumeX } from 'lucide-react';

interface QRCameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isActive: boolean;
}

export const QRCameraScanner: React.FC<QRCameraScannerProps> = ({ onScanSuccess, isActive }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedText, setLastScannedText] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanRegionId = 'yashoo-es-qr-reader';

  // Beep Audio Feedback via Web Audio API
  const playBeep = (type: 'success' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      const html5Qrcode = new Html5Qrcode(scanRegionId);
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: facingMode },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (decodedText && decodedText !== lastScannedText) {
            setLastScannedText(decodedText);
            playBeep('success');
            onScanSuccess(decodedText);

            // Reset scan cooldown so the same QR code isn't re-scanned 100 times per second
            setTimeout(() => setLastScannedText(null), 3000);
          }
        },
        () => {
          // Frame scan failure - silent catch
        }
      );

      setIsScanning(true);
    } catch (err: unknown) {
      console.warn('Camera scan start failed:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(
        msg.includes('Permission')
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : 'Unable to access camera device.'
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn('Camera stop warning:', e);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isActive) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive, facingMode]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      
      {/* Camera Viewport Container */}
      <div className="relative w-full max-w-sm aspect-square bg-[#030307] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
        
        {/* HTML5 QR Scanner DOM Target */}
        <div id={scanRegionId} className="w-full h-full object-cover" />

        {/* Viewfinder Overlay Frame */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-60 h-60 border-2 border-dashed border-amber-400 rounded-2xl animate-pulse relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 -mt-1 -ml-1 rounded-tl-sm" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 -mt-1 -mr-1 rounded-tr-sm" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 -mb-1 -ml-1 rounded-bl-sm" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 -mb-1 -mr-1 rounded-br-sm" />
            </div>
            <div className="absolute bottom-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-semibold text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Align QR Code in Scanner Frame</span>
            </div>
          </div>
        )}

        {/* Error / Stopped Overlay */}
        {cameraError && (
          <div className="absolute inset-0 bg-[#08080f]/95 p-6 flex flex-col items-center justify-center text-center z-10">
            <AlertCircle size={36} className="text-red-400 mb-3" />
            <p className="text-xs text-red-300 leading-relaxed mb-4 max-w-xs">{cameraError}</p>
            <button
              onClick={startScanner}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCw size={14} /> Retry Camera
            </button>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={isScanning ? stopScanner : startScanner}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            isScanning
              ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          {isScanning ? <CameraOff size={15} /> : <Camera size={15} />}
          <span>{isScanning ? 'Stop Camera' : 'Start Camera'}</span>
        </button>

        <button
          onClick={toggleCameraFacing}
          disabled={!isScanning}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-medium disabled:opacity-40"
          title="Flip Camera (Front/Back)"
        >
          <RefreshCw size={15} />
        </button>

        <button
          onClick={() => setSoundEnabled((prev) => !prev)}
          className={`p-2 rounded-xl border text-xs font-medium transition-all ${
            soundEnabled
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-white/[0.04] border-white/10 text-gray-500'
          }`}
          title={soundEnabled ? 'Beep Audio Enabled' : 'Beep Muted'}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
      </div>

    </div>
  );
};
