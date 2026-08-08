import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw, AlertCircle, Volume2, VolumeX, Upload, Image as ImageIcon } from 'lucide-react';

interface QRCameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isActive: boolean;
}

export const QRCameraScanner: React.FC<QRCameraScannerProps> = ({ onScanSuccess, isActive }) => {
  const [mode, setMode] = useState<'camera' | 'file'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedText, setLastScannedText] = useState<string | null>(null);
  const [fileScanError, setFileScanError] = useState<string | null>(null);
  const [fileScanning, setFileScanning] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
      // Browser audio restriction handling
    }
  };

  const startScanner = async () => {
    if (mode !== 'camera') return;
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
          fps: 12,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (decodedText && decodedText !== lastScannedText) {
            setLastScannedText(decodedText);
            playBeep('success');
            onScanSuccess(decodedText);

            setTimeout(() => setLastScannedText(null), 3000);
          }
        },
        () => {
          // Frame scanner silent catch
        }
      );

      setIsScanning(true);
    } catch (err: unknown) {
      console.warn('Camera scan start failed:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(
        msg.includes('Permission')
          ? 'Camera permission denied. Please grant camera access in your browser settings.'
          : 'Unable to access camera hardware. Try uploading a QR image.'
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
    if (isActive && mode === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive, mode, facingMode]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Upload & Scan QR from image file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileScanError(null);
    setFileScanning(true);

    try {
      const html5Qrcode = scannerRef.current || new Html5Qrcode(scanRegionId);
      scannerRef.current = html5Qrcode;

      const result = await html5Qrcode.scanFile(file, true);
      if (result) {
        playBeep('success');
        onScanSuccess(result);
      } else {
        setFileScanError('No QR code detected in uploaded image.');
      }
    } catch (err) {
      console.warn('File scan error:', err);
      setFileScanError('Could not decode QR code from this image. Ensure clear visibility.');
    } finally {
      setFileScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs">
        <button
          onClick={() => setMode('camera')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            mode === 'camera' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Camera size={14} />
          <span>Live Camera</span>
        </button>

        <button
          onClick={() => {
            setMode('file');
            stopScanner();
          }}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            mode === 'file' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ImageIcon size={14} />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Mode 1: Live Camera Stream Viewport */}
      {mode === 'camera' && (
        <div className="relative w-full max-w-sm aspect-square bg-[#030307] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
          
          <div id={scanRegionId} className="w-full h-full object-cover" />

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
                <span>Align QR Ticket Code in Frame</span>
              </div>
            </div>
          )}

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
      )}

      {/* Mode 2: Upload Image Scanner */}
      {mode === 'file' && (
        <div className="w-full max-w-sm aspect-square bg-[#030307] border border-dashed border-amber-500/40 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative group hover:border-amber-400 transition-all">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />

          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg group-hover:scale-105 transition-transform">
            <Upload size={30} />
          </div>

          <h4 className="text-sm font-bold text-white mb-1">
            {fileScanning ? 'Scanning Image...' : 'Click to Upload QR Ticket Image'}
          </h4>
          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
            Upload a photo or screenshot of the guest&apos;s ticket QR code.
          </p>

          {fileScanError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>{fileScanError}</span>
            </div>
          )}
        </div>
      )}

      {/* Controls Bar for Camera Mode */}
      {mode === 'camera' && (
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
      )}

    </div>
  );
};
