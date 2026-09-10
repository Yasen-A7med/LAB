import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import type { CertificateTemplate, SheetData } from '../types';
import { fetchGoogleSheetData, parseUploadedFile } from '../utils/googleSheetsParser';

interface TemplateAndSourceSetupProps {
  template: CertificateTemplate | null;
  sheetData: SheetData | null;
  onTemplateChange: (template: CertificateTemplate) => void;
  onSheetDataChange: (data: SheetData) => void;
  onProceed: () => void;
}

// High-resolution sample certificate template for instant 1-click test (100% English)
const DEMO_TEMPLATE_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%230f172a" />
      <stop offset="50%" stop-color="%231e293b" />
      <stop offset="100%" stop-color="%230a0f1d" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fbbf24" />
      <stop offset="50%" stop-color="%23f59e0b" />
      <stop offset="100%" stop-color="%23d97706" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(%23bg)" />
  <rect x="40" y="40" width="1840" height="1000" rx="16" fill="none" stroke="url(%23gold)" stroke-width="4" opacity="0.6" />
  <rect x="60" y="60" width="1800" height="960" rx="12" fill="none" stroke="%23ffffff" stroke-width="1" opacity="0.15" />
  <path d="M120,120 L200,120 L200,200" fill="none" stroke="url(%23gold)" stroke-width="6" />
  <path d="M1800,120 L1720,120 L1720,200" fill="none" stroke="url(%23gold)" stroke-width="6" />
  <path d="M120,960 L200,960 L200,880" fill="none" stroke="url(%23gold)" stroke-width="6" />
  <path d="M1800,960 L1720,960 L1720,880" fill="none" stroke="url(%23gold)" stroke-width="6" />
  <text x="960" y="240" font-family="sans-serif" font-size="26" font-weight="600" letter-spacing="8" fill="%23f59e0b" text-anchor="middle">CERTIFICATE OF RECOGNITION</text>
  <text x="960" y="310" font-family="sans-serif" font-size="52" font-weight="bold" fill="%23ffffff" text-anchor="middle">HONORARY AWARD</text>
  <line x1="720" y1="350" x2="1200" y2="350" stroke="url(%23gold)" stroke-width="2" />
  <text x="960" y="440" font-family="sans-serif" font-size="22" fill="%2394a3b8" text-anchor="middle">THIS CERTIFICATE IS PROUDLY CONFERRED UPON</text>
  <text x="960" y="730" font-family="sans-serif" font-size="22" fill="%2394a3b8" text-anchor="middle">FOR OUTSTANDING ACHIEVEMENT AND EXCEPTIONAL DEDICATION</text>
  <line x1="320" y1="920" x2="620" y2="920" stroke="%23475569" stroke-width="2" />
  <text x="470" y="960" font-family="sans-serif" font-size="18" fill="%2394a3b8" text-anchor="middle">OFFICIAL DATE</text>
  <line x1="1300" y1="920" x2="1600" y2="920" stroke="%23475569" stroke-width="2" />
  <text x="1450" y="960" font-family="sans-serif" font-size="18" fill="%2394a3b8" text-anchor="middle">AUTHORIZED SIGNATURE</text>
</svg>`;

export const TemplateAndSourceSetup: React.FC<TemplateAndSourceSetupProps> = ({
  template,
  sheetData,
  onTemplateChange,
  onSheetDataChange,
  onProceed,
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [sheetSuccess, setSheetSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Template Upload Handler
  const handleTemplateUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onTemplateChange({
          name: file.name,
          src,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Load Demo Template
  const handleLoadDemoTemplate = () => {
    const img = new Image();
    img.onload = () => {
      onTemplateChange({
        name: 'Royal_Gold_Template.svg',
        src: DEMO_TEMPLATE_DATA_URL,
        width: 1920,
        height: 1080,
        aspectRatio: 1920 / 1080,
      });
    };
    img.src = DEMO_TEMPLATE_DATA_URL;
  };

  // Google Sheet Link Fetcher
  const handleFetchSheet = async () => {
    if (!sheetUrl.trim()) return;
    setLoadingSheet(true);
    setSheetError(null);
    setSheetSuccess(false);

    try {
      const data = await fetchGoogleSheetData(sheetUrl.trim());
      onSheetDataChange(data);
      setSheetSuccess(true);
    } catch (err: any) {
      setSheetError(err?.message || 'Failed to connect to Google Sheet.');
    } finally {
      setLoadingSheet(false);
    }
  };

  // CSV / Local File Upload
  const handleCSVUpload = async (file: File) => {
    setLoadingSheet(true);
    setSheetError(null);
    try {
      const data = await parseUploadedFile(file);
      onSheetDataChange(data);
      setSheetSuccess(true);
    } catch (err: any) {
      setSheetError(err?.message || 'Failed to parse CSV file.');
    } finally {
      setLoadingSheet(false);
    }
  };

  // Demo Sheet Data generator
  const handleLoadDemoSheet = () => {
    const demoData: SheetData = {
      fileName: 'Sample_Attendees_100.csv',
      columns: [
        { letter: 'A', index: 0, headerName: 'Full Name', sampleValues: ['Alexander Wright', 'Sophia Carter', 'Daniel Chen'] },
        { letter: 'B', index: 1, headerName: 'Certificate Title', sampleValues: ['Lead Systems Architect', 'Excellence in AI Engineering', 'Senior Full Stack Engineer'] },
        { letter: 'C', index: 2, headerName: 'Photo (Google Drive / URL)', sampleValues: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'] },
        { letter: 'D', index: 3, headerName: 'Issue Date', sampleValues: ['2026-09-15', '2026-09-15', '2026-09-15'] },
        { letter: 'E', index: 4, headerName: 'Verification ID', sampleValues: ['LAB-CA-8831', 'LAB-CA-8832', 'LAB-CA-8833'] }
      ],
      rows: [
        { A: 'Alexander Wright', B: 'Lead Systems Architect', C: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', D: '2026-09-15', E: 'LAB-CA-8831' },
        { A: 'Sophia Carter', B: 'Excellence in AI Engineering', C: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', D: '2026-09-15', E: 'LAB-CA-8832' },
        { A: 'Daniel Chen', B: 'Senior Full Stack Engineer', C: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', D: '2026-09-15', E: 'LAB-CA-8833' },
        { A: 'Elena Rostova', B: 'Cloud Security Specialist', C: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400', D: '2026-09-15', E: 'LAB-CA-8834' },
        { A: 'Marcus Thorne', B: 'DevOps & CI/CD Maestro', C: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', D: '2026-09-15', E: 'LAB-CA-8835' },
      ],
      totalRows: 5,
    };
    onSheetDataChange(demoData);
    setSheetSuccess(true);
    setSheetError(null);
  };

  const isReadyToProceed = Boolean(template && sheetData && sheetData.rows.length > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Configure Certificate Template & Data Source
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Upload your certificate background design, then connect your Google Sheet or CSV data source with attendee records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Template Upload */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">1. Certificate Template</h3>
                  <p className="text-xs text-slate-400">High-resolution PNG, JPG, or SVG image</p>
                </div>
              </div>

              {template && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 size={13} />
                  Ready ({template.width}x{template.height}px)
                </span>
              )}
            </div>

            {/* Template Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleTemplateUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                template
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : 'border-slate-700 hover:border-amber-400/50 hover:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleTemplateUpload(e.target.files[0]);
                }}
              />

              {template ? (
                <div className="space-y-3 w-full">
                  <div className="relative max-h-40 overflow-hidden rounded-lg border border-slate-700 mx-auto shadow-md">
                    <img
                      src={template.src}
                      alt="Certificate Template"
                      className="w-full h-auto object-contain max-h-40 mx-auto"
                    />
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {template.name} ({template.width} × {template.height} px)
                  </div>
                  <p className="text-[11px] text-amber-400">Click to change template image</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Upload size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Drag and drop your certificate design here
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, WebP, SVG</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Don't have a template ready?</span>
            <button
              onClick={handleLoadDemoTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
            >
              <Sparkles size={14} />
              Use Sample Template
            </button>
          </div>
        </div>

        {/* Box 2: Google Sheet & Data Source */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">2. Google Sheet / CSV Data</h3>
                  <p className="text-xs text-slate-400">Connect attendee records (up to 1,000+ rows)</p>
                </div>
              </div>

              {sheetData && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 size={13} />
                  {sheetData.totalRows} Rows Loaded
                </span>
              )}
            </div>

            {/* Sheet URL Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">
                Google Sheets Public Link
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <LinkIcon size={16} />
                  </div>
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <button
                  onClick={handleFetchSheet}
                  disabled={loadingSheet || !sheetUrl.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950"
                >
                  {loadingSheet ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Connect
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Ensure sheet sharing is set to <strong className="text-slate-400">"Anyone with the link can view"</strong>.
              </p>
            </div>

            {/* Error or Success notification */}
            {sheetError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{sheetError}</span>
              </div>
            )}

            {sheetSuccess && sheetData && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    Connected: {sheetData.columns.length} columns detected
                  </span>
                  <span>{sheetData.totalRows} records</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {sheetData.columns.map((col) => (
                    <span
                      key={col.letter}
                      className="px-2 py-0.5 bg-slate-800 text-[10px] rounded border border-slate-700 text-slate-300"
                    >
                      <strong className="text-emerald-400">{col.letter}:</strong> {col.headerName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <div>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleCSVUpload(e.target.files[0]);
                }}
              />
              <button
                onClick={() => csvInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <FileText size={14} />
                Upload CSV File
              </button>
            </div>

            <button
              onClick={handleLoadDemoSheet}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
            >
              <Sparkles size={14} />
              Load Sample Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end pt-4">
        <button
          onClick={onProceed}
          disabled={!isReadyToProceed}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all"
        >
          <span>Next: Design Visual Placeholders</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
