import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Layers, 
  Lock, 
  Activity, 
  ChevronRight,
  Terminal
} from 'lucide-react';

interface Experiment {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: 'active' | 'coming-soon';
  category: string;
}

interface DashboardProps {
  onLaunch: (id: string) => void;
  swRegistered: boolean;
}

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'system';
}

const EXPERIMENTS: Experiment[] = [
  {
    id: 'ultraproxy',
    title: 'UltraProxy',
    description: 'Universal Web Emulator. Bypass ISP blocks for YouTube, Facebook, and beyond using Ultraviolet.',
    tags: ['Web Proxy', 'XOR-Obfuscated', 'High-Speed'],
    status: 'active',
    category: 'Network'
  },
  {
    id: 'ai-sandbox',
    title: 'AI Playground',
    description: 'A playground to interact with web-native LLMs, text generation models, and AI utilities.',
    tags: ['Artificial Intelligence', 'On-device', 'LLM'],
    status: 'coming-soon',
    category: 'AI / ML'
  },
  {
    id: 'retro-console',
    title: 'Retro Games Emulator',
    description: 'An emulator hosting web-assembly ports of classic console games and utility tools.',
    tags: ['WebAssembly', 'Gaming', 'Emulator'],
    status: 'coming-soon',
    category: 'Games'
  },
  {
    id: 'sys-benchmark',
    title: 'Hardware Benchmark',
    description: 'Real-time client telemetry, network throughput testing, and browser performance monitoring.',
    tags: ['Telemetry', 'Performance', 'WASM'],
    status: 'coming-soon',
    category: 'Utility'
  }
];

const Dashboard: React.FC<DashboardProps> = ({ onLaunch, swRegistered }) => {
  const [filter, setFilter] = useState<string>('all');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([
    { text: 'YASHOO LAB [Version 1.0.0]', type: 'system' },
    { text: 'Type "help" to see available commands.', type: 'system' },
    { text: '', type: 'output' }
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    const newHistory: TerminalLine[] = [...terminalHistory, { text: `guest@yashoo-lab:~$ ${terminalInput}`, type: 'input' }];

    if (cmd === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    }

    if (cmd === 'help') {
      newHistory.push(
        { text: 'Available commands:', type: 'output' },
        { text: '  help              Show this help menu', type: 'output' },
        { text: '  list              List all experiments and their statuses', type: 'output' },
        { text: '  launch <name>     Launch an active experiment (e.g., launch ultraproxy)', type: 'output' },
        { text: '  neofetch          Display system parameters and cool info', type: 'output' },
        { text: '  clear             Clear the terminal console', type: 'output' }
      );
    } else if (cmd === 'list') {
      newHistory.push({ text: 'Active & Inactive Experiments:', type: 'output' });
      EXPERIMENTS.forEach(exp => {
        newHistory.push({ 
          text: `  - ${exp.title} [${exp.status.toUpperCase()}] - ${exp.description}`, 
          type: exp.status === 'active' ? 'output' : 'system' 
        });
      });
    } else if (cmd.startsWith('launch ')) {
      const target = cmd.substring(7).trim();
      if (target === 'ultraproxy') {
        newHistory.push({ text: 'Launching UltraProxy...', type: 'output' });
        setTimeout(() => onLaunch('ultraproxy'), 500);
      } else {
        newHistory.push({ text: `Experiment "${target}" is either locked or not found. Check 'list'.`, type: 'error' });
      }
    } else if (cmd === 'neofetch') {
      const browser = navigator.userAgent.split(' ').pop() || 'Unknown';
      newHistory.push(
        { text: '   __     __        _                   _          _      ', type: 'output' },
        { text: '   \\ \\   / /       | |                 | |        | |     ', type: 'output' },
        { text: '    \\ \\_/ /__ _ ___| |__   ___   ___   | |     __ _| |__  ', type: 'output' },
        { text: '     \\   / _ ` / __| \'_ \\ / _ \\ / _ \\  | |    / _` | \'_ \\ ', type: 'output' },
        { text: '      | | (_| \\__ \\ | | | (_) | (_) | | |___| (_| | |_) |', type: 'output' },
        { text: '      |_|\\__,_|___/_| |_|\\___/ \\___/  |______\\__,_|_.__/ ', type: 'output' },
        { text: '---------------------------------------------------------', type: 'output' },
        { text: `OS: ${navigator.platform || 'Web Browser OS'}`, type: 'output' },
        { text: `Host: Yashoo Sandbox Engine v1.0.0`, type: 'output' },
        { text: `Browser: ${browser}`, type: 'output' },
        { text: `Service Worker: ${swRegistered ? 'Active & Registered' : 'Inactive'}`, type: 'output' },
        { text: `Resolution: ${window.screen.width}x${window.screen.height}`, type: 'output' },
        { text: `Operational Experiments: 1 Active / 3 Pending`, type: 'output' }
      );
    } else {
      newHistory.push({ text: `Command not found: "${cmd}". Type "help" for a list of commands.`, type: 'error' });
    }

    setTerminalHistory(newHistory);
    setTerminalInput('');
  };

  const filteredExperiments = filter === 'all' 
    ? EXPERIMENTS 
    : EXPERIMENTS.filter(exp => exp.category.toLowerCase().includes(filter) || exp.status === filter);

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-[#00f2ff]/30 relative overflow-hidden pb-12">
      {/* Background neon blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00f2ff]/10 blur-[130px] rounded-full pointer-events-none animate-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#7000ff]/10 blur-[130px] rounded-full pointer-events-none animate-glow" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#030303]/70 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f2ff] to-[#7000ff] p-[1px]">
            <div className="w-full h-full bg-[#030303] rounded-xl flex items-center justify-center">
              <Layers size={18} className="text-[#00f2ff]" />
            </div>
          </div>
          <div>
            <span className="font-black text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-white">
              YASHOO<span className="text-[#7000ff] font-extrabold">.LAB</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${swRegistered ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-gray-400">Proxy SW:</span>
            <span className={swRegistered ? 'text-emerald-400' : 'text-amber-400'}>
              {swRegistered ? 'Operational' : 'Loading'}
            </span>
          </div>

          <a 
            href="https://github.com/Yasen-A7med/LAB" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 text-gray-400 hover:text-white"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-12 relative z-10 flex flex-col gap-16">
        
        {/* Hero Section */}
        <section className="text-center md:text-left md:flex md:items-center md:justify-between gap-12">
          <div className="max-w-2xl flex flex-col gap-6">
            <div className="inline-flex self-center md:self-start items-center gap-2 px-3 py-1 rounded-full bg-[#00f2ff]/5 border border-[#00f2ff]/20 text-xs text-[#00f2ff] font-mono">
              <Activity size={12} className="animate-pulse" />
              <span>System Core v1.0.0 Active</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              Experimental <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] via-[#b666ff] to-[#7000ff]">
                Project Sandbox
              </span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
              Explore custom-built web apps, network obfuscation utilities, and interactive experiments. Clean interfaces coupled with core performance engines.
            </p>
          </div>

          {/* Core Stats Dashboard Display */}
          <div className="mt-8 md:mt-0 grid grid-cols-2 gap-4 w-full md:max-w-md">
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col gap-2">
              <span className="text-gray-500 text-sm font-medium">Active Experiments</span>
              <span className="text-3xl font-black font-mono text-[#00f2ff]">1</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col gap-2">
              <span className="text-gray-500 text-sm font-medium">Bare proxy nodes</span>
              <span className="text-3xl font-black font-mono text-[#7000ff]">4</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col gap-2 col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm font-medium">Gateway Health</span>
                <span className="text-xs text-emerald-400 font-mono">100%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-gradient-to-r from-[#00f2ff] to-[#7000ff] w-[100%] rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Experiment Grid */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
            <h2 className="text-2xl font-black tracking-tight">Hosted Experiments</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {['all', 'active', 'coming-soon'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all duration-200 whitespace-nowrap ${
                    filter === cat 
                      ? 'bg-[#00f2ff]/10 border-[#00f2ff]/40 text-[#00f2ff]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredExperiments.map(exp => (
              <div 
                key={exp.id} 
                className={`bg-[#0a0a0a]/50 border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                  exp.status === 'active'
                    ? 'border-white/5 hover:border-[#00f2ff]/30 hover:bg-[#0a0a0a]/80 shadow-2xl hover:shadow-[#00f2ff]/5'
                    : 'border-white/5 opacity-60'
                }`}
              >
                {/* Background decorative glow on active card hover */}
                {exp.status === 'active' && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00f2ff]/5 to-transparent rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                )}

                <div>
                  {/* Card top tags & status */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      {exp.category}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${
                      exp.status === 'active' ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        exp.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
                      }`} />
                      {exp.status === 'active' ? 'Operational' : 'Coming Soon'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-white">
                    {exp.title}
                    {exp.status === 'active' ? (
                      <Globe size={18} className="text-[#00f2ff]" />
                    ) : (
                      <Lock size={16} className="text-gray-500" />
                    )}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {exp.description}
                  </p>
                </div>

                <div>
                  {/* Tech stack tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {exp.tags.map(tag => (
                      <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/5 text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {exp.status === 'active' ? (
                    <button
                      onClick={() => onLaunch(exp.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#00f2ff]/20 to-[#7000ff]/20 hover:from-[#00f2ff]/30 hover:to-[#7000ff]/30 border border-[#00f2ff]/30 hover:border-[#00f2ff]/50 rounded-2xl text-white font-bold transition-all duration-200 active:scale-[0.98] group/btn shadow-lg hover:shadow-[#00f2ff]/10"
                    >
                      <span>Launch Emulator</span>
                      <ChevronRight size={16} className="transform group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 bg-white/5 border border-white/5 rounded-2xl text-gray-600 font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Lock size={14} />
                      <span>Sandbox Locked</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Developer Console Simulator */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-gray-400 px-1">
            <Terminal size={18} className="text-[#00f2ff]" />
            <h2 className="font-bold text-sm tracking-widest uppercase">LAB CONSOLE TERMINAL</h2>
          </div>

          <div className="bg-[#050505] border border-white/5 rounded-3xl p-6 shadow-2xl font-mono text-sm h-72 overflow-y-auto flex flex-col gap-2 border-t-white/10">
            <div className="flex-1 flex flex-col gap-1.5">
              {terminalHistory.map((line, idx) => {
                let colorClass = 'text-gray-300';
                if (line.type === 'input') colorClass = 'text-white font-bold';
                if (line.type === 'error') colorClass = 'text-red-400';
                if (line.type === 'system') colorClass = 'text-gray-500 text-xs';
                if (line.type === 'output') colorClass = 'text-[#00f2ff]/90';
                
                return (
                  <div key={idx} className={`${colorClass} whitespace-pre-wrap`}>
                    {line.text}
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>

            <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 border-t border-white/5 pt-4 mt-2">
              <span className="text-[#00f2ff] font-bold">guest@yashoo-lab:~$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                placeholder="type 'help'..."
                className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-gray-700"
              />
            </form>
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-white/5 pt-8 text-center text-xs text-gray-600">
        <p>© 2026 Yashoo Lab. Built for sandbox testing and development.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
