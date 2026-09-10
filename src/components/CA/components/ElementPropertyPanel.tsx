import React from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Trash2, 
  Copy, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Sliders, 
  Palette,
  Columns
} from 'lucide-react';
import type { CertificateElement, TextElement, ImageElement, SheetData } from '../types';
import { AVAILABLE_FONTS } from '../utils/arabicTextHelper';

interface ElementPropertyPanelProps {
  element: CertificateElement | null;
  sheetData: SheetData | null;
  onUpdateElement: (element: CertificateElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
}

const COLOR_PRESETS = [
  '#f59e0b', // Gold
  '#ffffff', // White
  '#000000', // Black
  '#0f172a', // Dark Navy
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#dc2626', // Red
  '#d97706', // Deep Gold
  '#94a3b8', // Silver Slate
];

export const ElementPropertyPanel: React.FC<ElementPropertyPanelProps> = ({
  element,
  sheetData,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
}) => {
  if (!element) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-900/80 border border-slate-800 rounded-2xl text-center text-slate-500">
        <Sliders size={32} className="mb-2 opacity-50" />
        <p className="text-sm font-medium text-slate-400">No element selected</p>
        <p className="text-xs mt-1 max-w-[200px]">
          Click on any text or image placeholder on the certificate to customize its styling and column mapping.
        </p>
      </div>
    );
  }

  const isText = element.type === 'text';
  const textEl = element as TextElement;
  const imgEl = element as ImageElement;

  return (
    <div className="h-full flex flex-col bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isText ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'
            }`}
          >
            {isText ? <Type size={16} /> : <ImageIcon size={16} />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {isText ? 'Text Placeholder' : 'Image Placeholder'}
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Mapped to Column: <strong className="text-amber-400">{element.columnLetter}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicateElement(element.id)}
            title="Duplicate element"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <Copy size={15} />
          </button>
          <button
            onClick={() => onDeleteElement(element.id)}
            title="Delete element"
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* 1. Sheet Column Assignment */}
        <div className="space-y-2">
          <label className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Columns size={14} className="text-amber-400" />
            <span>Sheet Column Mapping (English Letter)</span>
          </label>
          <p className="text-[11px] text-slate-400">
            Specify which column in your Google Sheet supplies this {isText ? 'text' : 'image URL'} (e.g. A, B, C...):
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              maxLength={3}
              value={element.columnLetter}
              onChange={(e) =>
                onUpdateElement({
                  ...element,
                  columnLetter: e.target.value.toUpperCase().trim(),
                })
              }
              placeholder="e.g. B"
              className="w-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono font-bold text-center text-sm text-amber-400 focus:outline-none focus:border-amber-400 transition-all uppercase"
            />

            {/* Quick dropdown if sheet columns are detected */}
            {sheetData && sheetData.columns.length > 0 && (
              <select
                value={element.columnLetter}
                onChange={(e) => {
                  const targetCol = sheetData.columns.find((c) => c.letter === e.target.value);
                  onUpdateElement({
                    ...element,
                    columnLetter: e.target.value,
                    label: targetCol ? targetCol.headerName : element.label,
                    ...(isText && targetCol?.sampleValues?.[0]
                      ? { sampleText: targetCol.sampleValues[0] }
                      : {}),
                    ...(!isText && targetCol?.sampleValues?.[0]
                      ? { sampleUrl: targetCol.sampleValues[0] }
                      : {}),
                  });
                }}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400"
              >
                {sheetData.columns.map((col) => (
                  <option key={col.letter} value={col.letter}>
                    Column {col.letter} — {col.headerName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 2. Text Specific Controls */}
        {isText && (
          <>
            {/* Font Family */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200">Typography / Font</label>
              <select
                value={textEl.fontFamily}
                onChange={(e) => onUpdateElement({ ...textEl, fontFamily: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font.family} value={font.family}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-200">Font Size</label>
                  <span className="text-slate-400 font-mono">{textEl.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="140"
                  value={textEl.fontSize}
                  onChange={(e) =>
                    onUpdateElement({ ...textEl, fontSize: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200">Font Weight</label>
                <select
                  value={textEl.fontWeight}
                  onChange={(e) =>
                    onUpdateElement({
                      ...textEl,
                      fontWeight: e.target.value as any,
                    })
                  }
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">SemiBold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">ExtraBold (800)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>
            </div>

            {/* Text Alignment & Direction */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200">Alignment</label>
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => onUpdateElement({ ...textEl, align: 'left' })}
                    className={`flex-1 py-1 flex items-center justify-center rounded-lg transition-all ${
                      textEl.align === 'left' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlignLeft size={14} />
                  </button>
                  <button
                    onClick={() => onUpdateElement({ ...textEl, align: 'center' })}
                    className={`flex-1 py-1 flex items-center justify-center rounded-lg transition-all ${
                      textEl.align === 'center' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlignCenter size={14} />
                  </button>
                  <button
                    onClick={() => onUpdateElement({ ...textEl, align: 'right' })}
                    className={`flex-1 py-1 flex items-center justify-center rounded-lg transition-all ${
                      textEl.align === 'right' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlignRight size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200">Text Direction</label>
                <select
                  value={textEl.direction}
                  onChange={(e) =>
                    onUpdateElement({ ...textEl, direction: e.target.value as any })
                  }
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="auto">Auto Detect (BiDi)</option>
                  <option value="rtl">Right-to-Left (RTL)</option>
                  <option value="ltr">Left-to-Right (LTR)</option>
                </select>
              </div>
            </div>

            {/* Color & Presets */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Palette size={14} />
                <span>Text Color</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textEl.color}
                  onChange={(e) => onUpdateElement({ ...textEl, color: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={textEl.color}
                  onChange={(e) => onUpdateElement({ ...textEl, color: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl font-mono text-xs text-slate-200 uppercase"
                />
              </div>

              <div className="flex gap-1.5 pt-1">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdateElement({ ...textEl, color })}
                    style={{ backgroundColor: color }}
                    className={`w-5 h-5 rounded-full border border-slate-700 transition-transform ${
                      textEl.color.toLowerCase() === color.toLowerCase() ? 'scale-125 ring-2 ring-amber-400' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Preview Sample Text */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200">Preview Sample Text</label>
              <input
                type="text"
                value={textEl.sampleText || ''}
                onChange={(e) => onUpdateElement({ ...textEl, sampleText: e.target.value })}
                placeholder="e.g. John Doe or Jane Smith"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </>
        )}

        {/* 3. Image Specific Controls */}
        {!isText && (
          <>
            {/* Object Fit */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200">Image Scaling (Fit)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateElement({ ...imgEl, objectFit: 'cover' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    imgEl.objectFit === 'cover'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Cover (Fill Frame)
                </button>
                <button
                  onClick={() => onUpdateElement({ ...imgEl, objectFit: 'contain' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    imgEl.objectFit === 'contain'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Contain (Letterbox)
                </button>
              </div>
            </div>

            {/* Border Radius (Shape) */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="font-semibold text-slate-200">Corner Shape</label>
                <span className="text-slate-400 font-mono">
                  {imgEl.borderRadius === 50
                    ? 'Circle'
                    : imgEl.borderRadius === 0
                    ? 'Square'
                    : `${imgEl.borderRadius}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={imgEl.borderRadius}
                onChange={(e) =>
                  onUpdateElement({ ...imgEl, borderRadius: Number(e.target.value) })
                }
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Square (0%)</span>
                <span>Rounded (20%)</span>
                <span>Circle (50%)</span>
              </div>
            </div>

            {/* Border Width & Color */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="font-semibold text-slate-200">Border Width</label>
                <span className="text-slate-400 font-mono">{imgEl.borderWidth}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={imgEl.borderWidth}
                onChange={(e) =>
                  onUpdateElement({ ...imgEl, borderWidth: Number(e.target.value) })
                }
                className="w-full accent-cyan-500"
              />
            </div>

            {imgEl.borderWidth > 0 && (
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200">Border Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={imgEl.borderColor}
                    onChange={(e) =>
                      onUpdateElement({ ...imgEl, borderColor: e.target.value })
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={imgEl.borderColor}
                    onChange={(e) =>
                      onUpdateElement({ ...imgEl, borderColor: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl font-mono text-xs text-slate-200 uppercase"
                  />
                </div>
              </div>
            )}

            {/* Sample Image URL */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200">Sample / Fallback Image URL</label>
              <input
                type="text"
                value={imgEl.sampleUrl || ''}
                onChange={(e) => onUpdateElement({ ...imgEl, sampleUrl: e.target.value })}
                placeholder="Google Drive link or direct image URL"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
