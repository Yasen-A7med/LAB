import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  AlignCenterHorizontal, 
  AlignCenterVertical,
  Copy,
  Layers
} from 'lucide-react';
import type { CertificateTemplate, CertificateElement, TextElement, ImageElement } from '../types';
import { resolveTextDirection } from '../utils/arabicTextHelper';

interface VisualCanvasEditorProps {
  template: CertificateTemplate;
  elements: CertificateElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (element: CertificateElement) => void;
  onAddElement: (type: 'text' | 'image') => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
}

type DragMode = 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'e' | 'w' | 's' | 'n' | null;

export const VisualCanvasEditor: React.FC<VisualCanvasEditorProps> = ({
  template,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onAddElement,
  onDeleteElement,
  onDuplicateElement,
}) => {
  const [zoom, setZoom] = useState(1);
  const [snapX, setSnapX] = useState<number | null>(null);
  const [snapY, setSnapY] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  // Dragging & resizing state
  const dragInfo = useRef<{
    mode: DragMode;
    elementId: string;
    startX: number;
    startY: number;
    originalX: number;
    originalY: number;
    originalWidth: number;
    originalHeight: number;
  } | null>(null);

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  // Keyboard controls for deleting or nudging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElementId) return;

      // Avoid capturing keyboard shortcuts if typing in input/textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteElement(selectedElementId);
      } else if (selectedElement && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 1 : 0.2; // Shift for larger nudge
        let newX = selectedElement.x;
        let newY = selectedElement.y;

        if (e.key === 'ArrowUp') newY = Math.max(0, newY - step);
        if (e.key === 'ArrowDown') newY = Math.min(100 - selectedElement.height, newY + step);
        if (e.key === 'ArrowLeft') newX = Math.max(0, newX - step);
        if (e.key === 'ArrowRight') newX = Math.min(100 - selectedElement.width, newX + step);

        onUpdateElement({
          ...selectedElement,
          x: Number(newX.toFixed(2)),
          y: Number(newY.toFixed(2)),
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, selectedElement, onDeleteElement, onUpdateElement]);

  // Pointer drag & resize handling
  const startDrag = (
    e: React.PointerEvent,
    element: CertificateElement,
    mode: DragMode
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(element.id);

    dragInfo.current = {
      mode,
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      originalX: element.x,
      originalY: element.y,
      originalWidth: element.width,
      originalHeight: element.height,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragInfo.current || !canvasWrapperRef.current) return;
      const { mode, elementId, startX, startY, originalX, originalY, originalWidth, originalHeight } = dragInfo.current;

      const rect = canvasWrapperRef.current.getBoundingClientRect();
      const deltaXPercent = ((moveEvent.clientX - startX) / rect.width) * 100;
      const deltaYPercent = ((moveEvent.clientY - startY) / rect.height) * 100;

      const targetEl = elements.find((el) => el.id === elementId);
      if (!targetEl) return;

      let nextX = originalX;
      let nextY = originalY;
      let nextW = originalWidth;
      let nextH = originalHeight;

      if (mode === 'move') {
        nextX = Math.max(0, Math.min(100 - originalWidth, originalX + deltaXPercent));
        nextY = Math.max(0, Math.min(100 - originalHeight, originalY + deltaYPercent));

        // Snapping to center
        const elementCenterX = nextX + nextW / 2;
        if (Math.abs(elementCenterX - 50) < 1.5) {
          nextX = 50 - nextW / 2;
          setSnapX(50);
        } else {
          setSnapX(null);
        }

        const elementCenterY = nextY + nextH / 2;
        if (Math.abs(elementCenterY - 50) < 1.5) {
          nextY = 50 - nextH / 2;
          setSnapY(50);
        } else {
          setSnapY(null);
        }
      } else if (mode === 'se') {
        nextW = Math.max(3, Math.min(100 - originalX, originalWidth + deltaXPercent));
        nextH = Math.max(2, Math.min(100 - originalY, originalHeight + deltaYPercent));
      } else if (mode === 'sw') {
        const potentialW = originalWidth - deltaXPercent;
        if (potentialW > 3 && originalX + deltaXPercent >= 0) {
          nextX = originalX + deltaXPercent;
          nextW = potentialW;
        }
        nextH = Math.max(2, Math.min(100 - originalY, originalHeight + deltaYPercent));
      } else if (mode === 'ne') {
        nextW = Math.max(3, Math.min(100 - originalX, originalWidth + deltaXPercent));
        const potentialH = originalHeight - deltaYPercent;
        if (potentialH > 2 && originalY + deltaYPercent >= 0) {
          nextY = originalY + deltaYPercent;
          nextH = potentialH;
        }
      } else if (mode === 'nw') {
        const potentialW = originalWidth - deltaXPercent;
        const potentialH = originalHeight - deltaYPercent;
        if (potentialW > 3 && originalX + deltaXPercent >= 0) {
          nextX = originalX + deltaXPercent;
          nextW = potentialW;
        }
        if (potentialH > 2 && originalY + deltaYPercent >= 0) {
          nextY = originalY + deltaYPercent;
          nextH = potentialH;
        }
      }

      onUpdateElement({
        ...targetEl,
        x: Number(nextX.toFixed(2)),
        y: Number(nextY.toFixed(2)),
        width: Number(nextW.toFixed(2)),
        height: Number(nextH.toFixed(2)),
      });
    };

    const handlePointerUp = () => {
      dragInfo.current = null;
      setSnapX(null);
      setSnapY(null);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Center alignment helpers
  const handleCenterHorizontal = useCallback(() => {
    if (!selectedElement) return;
    onUpdateElement({
      ...selectedElement,
      x: Number((50 - selectedElement.width / 2).toFixed(2)),
    });
  }, [selectedElement, onUpdateElement]);

  const handleCenterVertical = useCallback(() => {
    if (!selectedElement) return;
    onUpdateElement({
      ...selectedElement,
      y: Number((50 - selectedElement.height / 2).toFixed(2)),
    });
  }, [selectedElement, onUpdateElement]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl shadow-lg">
        {/* Add Elements Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddElement('text')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Type size={16} />
            <span>+ Add Text Field</span>
          </button>
          <button
            onClick={() => onAddElement('image')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <ImageIcon size={16} />
            <span>+ Add Image Field</span>
          </button>
        </div>

        {/* Alignment & Element Actions Group */}
        {selectedElement && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800">
            <button
              onClick={handleCenterHorizontal}
              title="Center Horizontally"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <AlignCenterHorizontal size={16} />
            </button>
            <button
              onClick={handleCenterVertical}
              title="Center Vertically"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <AlignCenterVertical size={16} />
            </button>
            <button
              onClick={() => onDuplicateElement(selectedElement.id)}
              title="Duplicate (Copy)"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => onDeleteElement(selectedElement.id)}
              title="Delete Element"
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 pl-3 border-l border-slate-800 ml-auto">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
            title="Zoom Out"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-mono text-slate-400 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(1))))}
            title="Zoom In"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom(1)}
            title="Reset Zoom"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        onClick={() => onSelectElement(null)}
        className="relative flex-1 min-h-[500px] max-h-[720px] bg-slate-950/70 border border-slate-800 rounded-2xl overflow-auto flex items-center justify-center p-8 select-none"
      >
        <div
          ref={canvasWrapperRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            aspectRatio: `${template.aspectRatio}`,
          }}
          className="relative max-w-full max-h-[640px] w-auto h-auto shadow-2xl rounded-lg overflow-hidden border border-slate-700/60"
        >
          {/* Certificate Base Template Image */}
          <img
            src={template.src}
            alt="Certificate Preview"
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Snapping guidelines */}
          {snapX !== null && (
            <div
              style={{ left: `${snapX}%` }}
              className="absolute top-0 bottom-0 w-[1px] bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] pointer-events-none z-30"
            />
          )}
          {snapY !== null && (
            <div
              style={{ top: `${snapY}%` }}
              className="absolute left-0 right-0 h-[1px] bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] pointer-events-none z-30"
            />
          )}

          {/* Render All Elements */}
          {elements.map((element) => {
            const isSelected = element.id === selectedElementId;

            return (
              <div
                key={element.id}
                onPointerDown={(e) => startDrag(e, element, 'move')}
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  width: `${element.width}%`,
                  height: `${element.height}%`,
                }}
                className={`absolute cursor-move transition-shadow z-20 group ${
                  isSelected
                    ? 'ring-2 ring-amber-400 shadow-xl bg-amber-500/5'
                    : 'hover:ring-1 hover:ring-amber-400/50 hover:bg-slate-800/20'
                }`}
              >
                {/* Column Tag Badge */}
                <div
                  className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider flex items-center gap-1 transition-opacity ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 opacity-100 shadow-md'
                      : 'bg-slate-900/90 border border-slate-700 text-amber-400 opacity-70 group-hover:opacity-100'
                  }`}
                >
                  <Layers size={10} />
                  <span>Column {element.columnLetter}</span>
                  {element.label && <span className="font-normal text-slate-300">({element.label})</span>}
                </div>

                {/* Element Content Preview */}
                {element.type === 'text' ? (
                  <div
                    style={{
                      fontFamily: (element as TextElement).fontFamily,
                      fontSize: `clamp(12px, ${(element as TextElement).fontSize * 0.05}vw, 42px)`,
                      fontWeight: (element as TextElement).fontWeight,
                      fontStyle: (element as TextElement).fontStyle,
                      color: (element as TextElement).color,
                      textAlign: (element as TextElement).align,
                      direction: resolveTextDirection(
                        (element as TextElement).sampleText || '',
                        (element as TextElement).direction
                      ),
                      textShadow: (element as TextElement).shadowColor
                        ? `0 2px 4px ${(element as TextElement).shadowColor}`
                        : undefined,
                    }}
                    className="w-full h-full flex items-center justify-center p-1 leading-tight select-none overflow-hidden"
                  >
                    <span className="w-full truncate">
                      {(element as TextElement).sampleText || `[Col ${element.columnLetter}] Sample Text`}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      borderRadius: `${(element as ImageElement).borderRadius}%`,
                      borderWidth: `${(element as ImageElement).borderWidth}px`,
                      borderColor: (element as ImageElement).borderColor,
                    }}
                    className="w-full h-full overflow-hidden bg-slate-900/60 border border-dashed border-cyan-500/40 flex items-center justify-center"
                  >
                    {(element as ImageElement).sampleUrl ? (
                      <img
                        src={(element as ImageElement).sampleUrl}
                        alt="Placeholder Preview"
                        style={{ objectFit: (element as ImageElement).objectFit }}
                        className="w-full h-full pointer-events-none"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-cyan-400/80 p-2 text-center">
                        <ImageIcon size={24} />
                        <span className="text-[10px] font-mono mt-1 font-semibold">
                          [Col {element.columnLetter}] Image
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Resize Handles (Visible when selected) */}
                {isSelected && (
                  <>
                    <div
                      onPointerDown={(e) => startDrag(e, element, 'nw')}
                      className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-amber-400 border border-slate-950 rounded-sm cursor-nwse-resize z-30"
                    />
                    <div
                      onPointerDown={(e) => startDrag(e, element, 'ne')}
                      className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-400 border border-slate-950 rounded-sm cursor-nesw-resize z-30"
                    />
                    <div
                      onPointerDown={(e) => startDrag(e, element, 'se')}
                      className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-amber-400 border border-slate-950 rounded-sm cursor-nwse-resize z-30"
                    />
                    <div
                      onPointerDown={(e) => startDrag(e, element, 'sw')}
                      className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-amber-400 border border-slate-950 rounded-sm cursor-nesw-resize z-30"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
