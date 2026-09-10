import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  FileArchive,
  Clock,
  Gauge,
  Layers,
  StopCircle
} from 'lucide-react';
import type { CertificateTemplate, CertificateElement, SheetData, BatchProgress, ExportFormat } from '../types';
import { startBatchGeneration, type BatchController } from '../utils/batchProcessor';
import { ensureFontsLoaded } from '../utils/arabicTextHelper';

interface BatchGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: CertificateTemplate;
  elements: CertificateElement[];
  sheetData: SheetData;
}

export const BatchGenerationModal: React.FC<BatchGenerationModalProps> = ({
  isOpen,
  onClose,
  template,
  elements,
  sheetData,
}) => {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [nameColumn, setNameColumn] = useState<string>('A');
  const [chunkSize, setChunkSize] = useState<number>(6);

  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState<BatchProgress>({
    isGenerating: false,
    isPaused: false,
    total: sheetData.rows.length,
    current: 0,
    percentage: 0,
    speed: 0,
    etaSeconds: 0,
    currentPreviewUrl: null,
    errors: [],
    zipBlob: null,
    zipSize: 0,
  });

  const controllerRef = useRef<BatchController | null>(null);
  const templateImageRef = useRef<HTMLImageElement | null>(null);

  // Set default name column based on first text element or column A
  useEffect(() => {
    const textEl = elements.find((el) => el.type === 'text');
    if (textEl) {
      setNameColumn(textEl.columnLetter);
    }
  }, [elements]);

  // Load template image
  useEffect(() => {
    if (isOpen) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        templateImageRef.current = img;
      };
      img.src = template.src;
    }
  }, [isOpen, template.src]);

  if (!isOpen) return null;

  const handleStart = async () => {
    if (!templateImageRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res) => {
        img.onload = res;
        img.src = template.src;
      });
      templateImageRef.current = img;
    }

    // Preload web fonts
    const textFonts = elements
      .filter((el) => el.type === 'text')
      .map((el) => (el as any).fontFamily);
    await ensureFontsLoaded(textFonts);

    setHasStarted(true);

    const { controller, promise } = startBatchGeneration({
      templateImage: templateImageRef.current,
      elements,
      rows: sheetData.rows,
      nameColumnLetter: nameColumn,
      format,
      chunkSize,
      onProgress: (p) => setProgress({ ...p }),
    });

    controllerRef.current = controller;

    try {
      await promise;
    } catch (err: any) {
      if (!err.message.includes('cancelled')) {
        alert(`Generation stopped with error: ${err.message}`);
      }
    }
  };

  const handlePauseResume = () => {
    if (!controllerRef.current) return;
    if (progress.isPaused) {
      controllerRef.current.resume();
    } else {
      controllerRef.current.pause();
    }
  };

  const handleCancel = () => {
    if (controllerRef.current) {
      controllerRef.current.cancel();
    }
    setHasStarted(false);
    onClose();
  };

  const handleDownloadZip = () => {
    if (!progress.zipBlob) return;
    const url = URL.createObjectURL(progress.zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificates_${sheetData.rows.length}_Batch.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const isCompleted = !progress.isGenerating && progress.zipBlob !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileArchive size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Batch Certificate Generator</h3>
              <p className="text-xs text-slate-400">
                Mass generation for {sheetData.rows.length} certificates with instant ZIP archive
              </p>
            </div>
          </div>

          {!progress.isGenerating && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {!hasStarted ? (
            /* Pre-flight Settings */
            <div className="space-y-5">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Sparkles size={16} />
                  <span>Ready for High-Scale Batch Processing</span>
                </div>
                <p className="text-xs text-slate-300">
                  You are about to generate <strong className="text-white">{sheetData.rows.length}</strong> certificates. Memory chunking and streaming are enabled to prevent browser freezing.
                </p>
              </div>

              {/* Setting 1: File Naming Column */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  File Naming: Attendee Name Column
                </label>
                <select
                  value={nameColumn}
                  onChange={(e) => setNameColumn(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                >
                  {sheetData.columns.map((col) => (
                    <option key={col.letter} value={col.letter}>
                      Column {col.letter} — {col.headerName} (e.g. {col.sampleValues[0] || 'Name'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Files will be named: <span className="font-mono text-amber-400">Certificate_0001_John_Doe.png</span>
                </p>
              </div>

              {/* Setting 2: Export Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Export Image Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormat('png')}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      format === 'png'
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-white">PNG (Lossless Quality)</div>
                    <div className="text-[11px] opacity-80 mt-0.5">Highest crispness, best for printing</div>
                  </button>
                  <button
                    onClick={() => setFormat('jpeg')}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      format === 'jpeg'
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-white">JPEG (Compact Size)</div>
                    <div className="text-[11px] opacity-80 mt-0.5">Faster download, smaller ZIP archive</div>
                  </button>
                </div>
              </div>

              {/* Setting 3: Concurrency batching */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-200">Parallel Chunk Size</label>
                  <span className="font-mono text-amber-400">{chunkSize} certs / tick</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <p className="text-[10px] text-slate-500">
                  Recommended: 5 - 8 for smooth balance between maximum speed and low RAM consumption.
                </p>
              </div>
            </div>
          ) : (
            /* Live Progress & Stats HUD */
            <div className="space-y-6">
              {/* Progress Bar & Percentage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Layers size={14} className="text-amber-400" />
                    <span>Progress: {progress.current} / {progress.total} certificates</span>
                  </span>
                  <span className="font-mono font-bold text-base text-amber-400">
                    {progress.percentage}%
                  </span>
                </div>

                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    style={{ width: `${progress.percentage}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-200 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                    <Gauge size={13} />
                    <span>Throughput</span>
                  </div>
                  <div className="text-base font-mono font-bold text-white">
                    {progress.speed} <span className="text-xs font-normal text-slate-400">/sec</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                    <Clock size={13} />
                    <span>Time Left (ETA)</span>
                  </div>
                  <div className="text-base font-mono font-bold text-white">
                    {progress.etaSeconds > 0 ? `${progress.etaSeconds}s` : isCompleted ? '0s' : '--'}
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                    <FileArchive size={13} />
                    <span>Archive Size</span>
                  </div>
                  <div className="text-base font-mono font-bold text-emerald-400">
                    {progress.zipSize > 0 ? formatFileSize(progress.zipSize) : 'Streaming...'}
                  </div>
                </div>
              </div>

              {/* Live Thumbnail Preview */}
              {progress.currentPreviewUrl && (
                <div className="space-y-1.5 text-center">
                  <div className="text-[11px] text-slate-400">Currently Rendering Thumbnail</div>
                  <div className="relative max-h-36 overflow-hidden rounded-xl border border-slate-700/80 shadow-lg mx-auto inline-block">
                    <img
                      src={progress.currentPreviewUrl}
                      alt="Current Certificate"
                      className="max-h-36 w-auto object-contain mx-auto"
                    />
                  </div>
                </div>
              )}

              {/* Error Notice if any */}
              {progress.errors.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <AlertTriangle size={14} />
                    <span>{progress.errors.length} minor warnings (e.g. invalid photo link)</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Certificates were generated with fallback text/placeholder without aborting the batch.
                  </p>
                </div>
              )}

              {/* Completion Banner */}
              {isCompleted && (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-center space-y-2 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-base font-bold text-white">Batch Complete!</h4>
                  <p className="text-xs text-slate-300">
                    All <strong className="text-emerald-400">{progress.total}</strong> certificates were successfully created and packaged into a ZIP archive ({formatFileSize(progress.zipSize)}).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-950/50">
          {!hasStarted ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                <Play size={14} fill="currentColor" />
                <span>Start Batch Generation</span>
              </button>
            </>
          ) : isCompleted ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-all"
              >
                Close Window
              </button>
              <button
                onClick={handleDownloadZip}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition-all animate-pulse"
              >
                <Download size={16} />
                <span>Download {sheetData.rows.length} Certificates (ZIP)</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <StopCircle size={15} />
                <span>Abort Batch</span>
              </button>

              <button
                onClick={handlePauseResume}
                className="inline-flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-all"
              >
                {progress.isPaused ? (
                  <>
                    <Play size={14} fill="currentColor" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause size={14} />
                    <span>Pause</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
