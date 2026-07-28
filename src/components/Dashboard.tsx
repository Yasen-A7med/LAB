import React from 'react';
import { 
  Globe, 
  Layers, 
  ChevronRight,
  BookOpen,
  GraduationCap
} from 'lucide-react';

interface DashboardProps {
  onLaunch: (id: string) => void;
  swRegistered: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ onLaunch, swRegistered }) => {
  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-cyan-500/30 relative overflow-hidden flex flex-col">
      {/* 
        Ultra-Premium Ambient Background 
        Subtle, slow-moving glowing orbs for a dynamic, alive feel without being distracting.
      */}
      <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[10%] right-[20%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />

      {/* Minimalist Header */}
      <header className="relative z-30 w-full px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 p-[1px] transition-transform duration-500 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <div className="w-full h-full bg-[#050505] rounded-2xl flex items-center justify-center backdrop-blur-xl">
              <Layers size={22} className="text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight text-white leading-none">
              Yashoo <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Lab.</span>
            </span>
            <span className="text-xs text-gray-500 font-medium tracking-widest uppercase mt-1">Project Sandbox</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Status Indicator */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
              {swRegistered ? (
                <>
                  <span className="absolute w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
                </>
              ) : (
                <span className="relative w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${swRegistered ? 'text-emerald-400' : 'text-amber-500'}`}>
              {swRegistered ? 'Engine Online' : 'Initializing'}
            </span>
          </div>

          <a 
            href="https://github.com/Yasen-A7med/LAB" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300 text-gray-400 hover:text-white"
            aria-label="GitHub Repository"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
        </div>
      </header>

      {/* Main Content - Centerpiece Project Showcase */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center relative z-20 pb-20">
        
        <div className="mb-10 text-center max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            Welcome to the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">Digital Frontline.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed">
            Discover our sandbox of high-performance tools, proxy servers, and interactive educational workspaces.
          </p>
        </div>

        {/* Projects Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
          
          {/* Card 1: DECI Task Hub */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-35 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative h-full bg-[#0a0a0d]/80 backdrop-blur-3xl border border-white/10 rounded-[1.8rem] p-8 overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between min-h-[300px]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-cyan-900/40 border border-indigo-500/20 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <BookOpen size={26} className="text-indigo-400" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] uppercase font-bold tracking-widest text-indigo-400">
                      Course Portal
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">DECI Task Hub</h3>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                  Interactive syllabus and task viewer. Displays classroom videos side-by-side with official HTML documentation and lecture notes.
                </p>
              </div>

              <button
                onClick={() => onLaunch('decitask')}
                className="group/btn relative w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl overflow-hidden transition-all duration-300 active:scale-95 shadow-[0_4px_20px_rgba(99,102,241,0.2)]"
              >
                <span>Launch Portal</span>
                <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Card 2: UltraProxy */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-35 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative h-full bg-[#0a0a0d]/80 backdrop-blur-3xl border border-white/10 rounded-[1.8rem] p-8 overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between min-h-[300px]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-900/40 to-violet-900/40 border border-white/10 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <Globe size={26} className="text-cyan-400" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] uppercase font-bold tracking-widest text-cyan-400">
                      Proxy Sandbox
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">UltraProxy</h3>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                  Advanced web proxy with XOR obfuscation. Access web resources freely without CORS issues or tracking, optimizing streaming performance.
                </p>
              </div>

              <button
                onClick={() => onLaunch('ultraproxy')}
                className="group/btn relative w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-gray-100 text-black font-bold text-sm rounded-xl overflow-hidden transition-all duration-300 active:scale-95"
              >
                <span>Launch Proxy</span>
                <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Card 3: Thanawya Results */}
          <div className="relative group md:col-span-2 lg:col-span-1">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-35 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative h-full bg-[#0a0a0d]/80 backdrop-blur-3xl border border-white/10 rounded-[1.8rem] p-8 overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between min-h-[300px]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/20 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <GraduationCap size={26} className="text-purple-400" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] uppercase font-bold tracking-widest text-purple-400">
                      Exam Results
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">نتيجة الثانوية</h3>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                  استعلم عن نتيجة الثانوية العامة 2026 بالاسم أو رقم الجلوس. بحث ذكي مع دعم كامل للغة العربية.
                </p>
              </div>

              <button
                onClick={() => onLaunch('thanawya')}
                className="group/btn relative w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm rounded-xl overflow-hidden transition-all duration-300 active:scale-95 shadow-[0_4px_20px_rgba(168,85,247,0.2)]"
              >
                <span>ابحث عن نتيجتك</span>
                <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default Dashboard;
