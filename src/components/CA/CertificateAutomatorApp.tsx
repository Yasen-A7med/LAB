import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Award, 
  Layers, 
  Eye, 
  Sparkles, 
  Settings2
} from 'lucide-react';
import type { CertificateTemplate, CertificateElement, SheetData, TextElement, ImageElement } from './types';
import { TemplateAndSourceSetup } from './components/TemplateAndSourceSetup';
import { VisualCanvasEditor } from './components/VisualCanvasEditor';
import { ElementPropertyPanel } from './components/ElementPropertyPanel';
import { LiveSamplePreviewer } from './components/LiveSamplePreviewer';
import { BatchGenerationModal } from './components/BatchGenerationModal';

interface CertificateAutomatorAppProps {
  onBack: () => void;
}

export const CertificateAutomatorApp: React.FC<CertificateAutomatorAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'editor' | 'preview'>('setup');
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);

  // Active placeholders on the certificate
  const [elements, setElements] = useState<CertificateElement[]>([
    {
      id: 'el-name',
      type: 'text',
      columnLetter: 'A',
      label: 'Full Name',
      x: 20,
      y: 53,
      width: 60,
      height: 12,
      fontFamily: 'Cairo',
      fontSize: 56,
      fontWeight: '700',
      fontStyle: 'normal',
      color: '#fbbf24',
      align: 'center',
      direction: 'auto',
      lineHeight: 1.2,
      letterSpacing: 0,
      sampleText: 'Alexander Wright',
    },
    {
      id: 'el-title',
      type: 'text',
      columnLetter: 'B',
      label: 'Certificate Title / Grade',
      x: 25,
      y: 66,
      width: 50,
      height: 6,
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: '600',
      fontStyle: 'normal',
      color: '#e2e8f0',
      align: 'center',
      direction: 'auto',
      lineHeight: 1.2,
      letterSpacing: 0,
      sampleText: 'Master of Web Systems & Automation',
    },
  ]);

  const [selectedElementId, setSelectedElementId] = useState<string | null>('el-name');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Helper to determine next available column letter
  const getNextAvailableColumn = (): string => {
    if (!sheetData || sheetData.columns.length === 0) {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const used = new Set(elements.map((e) => e.columnLetter));
      return letters.find((l) => !used.has(l)) || 'C';
    }
    const usedLetters = new Set(elements.map((e) => e.columnLetter));
    const nextCol = sheetData.columns.find((c) => !usedLetters.has(c.letter));
    return nextCol ? nextCol.letter : 'C';
  };

  // Add Element Handler
  const handleAddElement = (type: 'text' | 'image') => {
    const nextCol = getNextAvailableColumn();
    const id = `el-${Date.now()}`;

    if (type === 'text') {
      const newEl: TextElement = {
        id,
        type: 'text',
        columnLetter: nextCol,
        label: `Text (${nextCol})`,
        x: 30,
        y: 45,
        width: 40,
        height: 8,
        fontFamily: 'Cairo',
        fontSize: 36,
        fontWeight: '700',
        fontStyle: 'normal',
        color: '#ffffff',
        align: 'center',
        direction: 'auto',
        lineHeight: 1.2,
        letterSpacing: 0,
        sampleText: `Sample Text ${nextCol}`,
      };
      setElements((prev) => [...prev, newEl]);
      setSelectedElementId(id);
    } else {
      const newEl: ImageElement = {
        id,
        type: 'image',
        columnLetter: nextCol,
        label: `Photo (${nextCol})`,
        x: 44,
        y: 34,
        width: 12,
        height: 16,
        objectFit: 'cover',
        borderRadius: 50, // Circle by default for portraits
        borderWidth: 3,
        borderColor: '#f59e0b',
        sampleUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      };
      setElements((prev) => [...prev, newEl]);
      setSelectedElementId(id);
    }
  };

  // Update Element
  const handleUpdateElement = (updated: CertificateElement) => {
    setElements((prev) => prev.map((el) => (el.id === updated.id ? updated : el)));
  };

  // Delete Element
  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  // Duplicate Element
  const handleDuplicateElement = (id: string) => {
    const target = elements.find((el) => el.id === id);
    if (!target) return;

    const dupId = `el-${Date.now()}`;
    const dup: CertificateElement = {
      ...target,
      id: dupId,
      x: Math.min(80, target.x + 4),
      y: Math.min(80, target.y + 4),
    };
    setElements((prev) => [...prev, dup]);
    setSelectedElementId(dupId);
  };

  const isReadyForBatch = Boolean(template && sheetData && sheetData.rows.length > 0 && elements.length > 0);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
          >
            <ArrowLeft size={16} />
            <span>LAB</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
              <Award size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-wide">
                  CA
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  Batch 1000+
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Navigation Tabs */}
        <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'setup'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 size={14} />
            <span>1. Template & Data</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            disabled={!template}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none ${
              activeTab === 'editor'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={14} />
            <span>2. Visual Designer</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            disabled={!template || !sheetData}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none ${
              activeTab === 'preview'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye size={14} />
            <span>3. Live Preview & Verify</span>
          </button>
        </div>

        {/* Action Button: Launch Batch Modal */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            disabled={!isReadyForBatch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all"
          >
            <Sparkles size={15} />
            <span className="hidden sm:inline">Start Batch Generation</span>
            <span className="sm:hidden">Generate</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
        {activeTab === 'setup' && (
          <TemplateAndSourceSetup
            template={template}
            sheetData={sheetData}
            onTemplateChange={(tpl) => setTemplate(tpl)}
            onSheetDataChange={(data) => setSheetData(data)}
            onProceed={() => setActiveTab('editor')}
          />
        )}

        {activeTab === 'editor' && template && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-130px)] min-h-[600px]">
            <div className="lg:col-span-3 h-full">
              <VisualCanvasEditor
                template={template}
                elements={elements}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onUpdateElement={handleUpdateElement}
                onAddElement={handleAddElement}
                onDeleteElement={handleDeleteElement}
                onDuplicateElement={handleDuplicateElement}
              />
            </div>

            <div className="h-full">
              <ElementPropertyPanel
                element={elements.find((el) => el.id === selectedElementId) || null}
                sheetData={sheetData}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                onDuplicateElement={handleDuplicateElement}
              />
            </div>
          </div>
        )}

        {activeTab === 'preview' && template && sheetData && (
          <LiveSamplePreviewer
            template={template}
            elements={elements}
            sheetData={sheetData}
            onLaunchBatch={() => setIsBatchModalOpen(true)}
          />
        )}
      </main>

      {/* Batch Generation Modal */}
      {template && sheetData && (
        <BatchGenerationModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          template={template}
          elements={elements}
          sheetData={sheetData}
        />
      )}
    </div>
  );
};
export default CertificateAutomatorApp;
