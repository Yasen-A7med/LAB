import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PneumoVibeAppProps {
  onBack: () => void;
}

const PneumoVibeApp: React.FC<PneumoVibeAppProps> = ({ onBack }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: '#0b132b' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', background: 'rgba(11,19,43,0.95)', borderBottom: '1px solid rgba(0,240,255,0.25)', flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(0,240,255,0.08)', color: '#fff', border: '1px solid rgba(0,240,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.08em' }}
        >
          <ArrowLeft size={14} /> Back to LAB
        </button>
        <span style={{ color: 'rgba(0,240,255,0.9)', fontSize: 12, letterSpacing: '0.18em' }}>PNEUMOVIBE MISSION CONTROL</span>
      </div>
      <iframe
        src="/pneumovibe-app/index.html"
        title="PneumoVibe Mission Control"
        style={{ flex: 1, width: '100%', border: 'none' }}
      />
    </div>
  );
};

export default PneumoVibeApp;
