import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Sparkles, 
  Eye, 
  FileCheck,
  RefreshCw
} from 'lucide-react';
import type { CertificateTemplate, CertificateElement, SheetData } from '../types';
import { drawCertificateToCanvas, renderCertificateToBlob } from '../utils/certificateRenderer';
import { ensureFontsLoaded } from '../utils/arabicTextHelper';

interface LiveSamplePreviewerProps {
  template: CertificateTemplate;
  elements: CertificateElement[];
  sheetData: SheetData;
  onLaunchBatch: () => void;
}

export const LiveSamplePreviewer: React.FC<LiveSamplePreviewerProps> = ({
  template,
  elements,
  sheetData,
  onLaunchBatch,
}) => {
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateImageRef = useRef<HTMLImageElement | null>(null);

  const totalRows = sheetData.rows.length;
  const currentRow = sheetData.rows[currentRowIndex] || {};

  // Load template image once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      templateImageRef.current = img;
      renderCurrentCertificate();
    };
    img.src = template.src;
  }, [template.src]);

  // Re-render certificate when row or elements change
  const renderCurrentCertificate = async () => {
    if (!canvasRef.current || !templateImageRef.current) return;
    setIsRendering(true);

    try {
      // Ensure fonts are loaded before drawing
      const textFonts = elements
        .filter((el) => el.type === 'text')
        .map((el) => (el as any).fontFamily);
      await ensureFontsLoaded(textFonts);

      await drawCertificateToCanvas(
        canvasRef.current,
        templateImageRef.current,
        elements,
        currentRow,
        { scale: 0.8 } // Scale slightly for smooth viewport rendering
      );
    } catch (err) {
      console.error('Failed to render preview certificate:', err);
    } finally {
      setIsRendering(false);
    }
  };

  useEffect(() => {
    if (templateImageRef.current) {
      renderCurrentCertificate();
    }
  }, [currentRowIndex, elements]);

  // Single Certificate Download
  const handleDownloadSingle = async () => {
    if (!templateImageRef.current) return;
    setIsDownloading(true);

    try {
      const blob = await renderCertificateToBlob(
        templateImageRef.current,
        elements,
        currentRow,
        { format: 'png', quality: 1, scale: 1 } // Full 100% native resolution
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const personName = currentRow['A'] || currentRow['B'] || `Record_${currentRowIndex + 1}`;
      a.download = `Certificate_${personName.replace(/[\\/:*?"<>|]/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download single certificate. See console for details.');
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Bar with Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Eye size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Live Data Preview & Verification</h3>
            <p className="text-xs text-slate-400">
              Inspect how real sheet data (names, titles, Google Drive images) look before running full batch.
            </p>
          </div>
        </div>

        {/* Record Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-1">
            <button
              onClick={() => setCurrentRowIndex((i) => Math.max(0, i - 1))}
              disabled={currentRowIndex === 0}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-slate-700 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-3 text-xs font-mono font-semibold text-amber-400">
              Row {currentRowIndex + 1} of {totalRows}
            </div>
            <button
              onClick={() => setCurrentRowIndex((i) => Math.min(totalRows - 1, i + 1))}
              disabled={currentRowIndex === totalRows - 1}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-slate-700 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={handleDownloadSingle}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-all"
          >
            {isDownloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            <span>Download Single (PNG)</span>
          </button>

          <button
            onClick={onLaunchBatch}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
          >
            <Sparkles size={16} />
            <span>Generate All {totalRows} Certificates</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Certificate Canvas Preview (3 cols) */}
        <div className="lg:col-span-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[500px] shadow-2xl relative overflow-hidden">
          {isRendering && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 text-xs font-semibold">
                <RefreshCw size={14} className="animate-spin" />
                Rendering certificate...
              </div>
            </div>
          )}

          <div className="max-w-full max-h-[560px] overflow-hidden rounded-xl shadow-2xl border border-slate-800">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[560px] object-contain rounded-xl block"
            />
          </div>
        </div>

        {/* Row Data Inspector (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white border-b border-slate-800 pb-3">
              <FileCheck size={16} className="text-amber-400" />
              <span>Current Record Fields</span>
            </div>

            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {sheetData.columns.map((col) => {
                const val = currentRow[col.letter] || '';
                const isLinked = elements.some((el) => el.columnLetter === col.letter);

                return (
                  <div
                    key={col.letter}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isLinked
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-slate-800/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-amber-400">
                        Column {col.letter}
                      </span>
                      <span className="text-slate-400 truncate max-w-[120px]">
                        {col.headerName}
                      </span>
                    </div>
                    <div className="text-xs text-white font-medium break-all select-all">
                      {val || <span className="text-slate-500 italic">Empty</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 text-center">
              Verified & ready to bulk generate <strong className="text-amber-400">{totalRows}</strong> certificates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
