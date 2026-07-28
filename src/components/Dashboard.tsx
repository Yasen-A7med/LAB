import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  GraduationCap, 
  ArrowUpRight, 
  Mail, 
  Phone, 
  ExternalLink,
  Copy,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Code2
} from 'lucide-react';

interface DashboardProps {
  onLaunch: (id: string) => void;
  swRegistered: boolean;
}

const projects = [
  {
    id: 'ultraproxy',
    title: 'UltraProxy',
    desc: 'High-performance web proxy with XOR obfuscation. Bypass ISP restrictions and stream without limits.',
    icon: Globe,
    accent: 'from-[#00f2ff] via-sky-500 to-indigo-600',
    glowColor: 'rgba(0, 242, 255, 0.15)',
    tag: 'Network Proxy',
    tech: ['Service Worker', 'Wisp / Bare', 'XOR Engine'],
    gradientText: 'from-cyan-400 to-sky-500'
  },
  {
    id: 'thanawya',
    title: 'نتيجة الثانوية العامة',
    desc: 'استعلم عن نتيجة الثانوية العامة 2026 بالاسم أو رقم الجلوس. محرك بحث ذكي وسريع باللغة العربية.',
    icon: GraduationCap,
    accent: 'from-violet-500 via-purple-500 to-fuchsia-600',
    glowColor: 'rgba(168, 85, 247, 0.15)',
    tag: 'Educational',
    tech: ['الثانوية العامة 2026', 'Smart Search', 'RTL Engine'],
    gradientText: 'from-violet-400 to-fuchsia-400'
  },
];

const Dashboard: React.FC<DashboardProps> = ({ onLaunch, swRegistered }) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => {
      setCopiedItem(null);
    }, 2000);
  };

  return (
    <div className="noise-overlay bg-dot-grid min-h-screen min-h-[100dvh] bg-[#030305] text-white flex flex-col relative overflow-hidden select-none">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[70vw] sm:w-[50vw] h-[70vw] sm:h-[50vw] rounded-full bg-sky-500/[0.07] blur-[120px] animate-ambient-float" 
        />
        <div 
          className="absolute -bottom-[20%] -right-[10%] w-[70vw] sm:w-[50vw] h-[70vw] sm:h-[50vw] rounded-full bg-violet-600/[0.07] blur-[140px] animate-ambient-float" 
          style={{ animationDelay: '5s' }} 
        />
        <div 
          className="absolute top-[40%] left-[35%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-600/[0.04] blur-[150px] animate-ambient-float" 
          style={{ animationDelay: '9s' }} 
        />
      </div>

      {/* Copy Notification Toast */}
      <AnimatePresence>
        {copiedItem && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0d0d14]/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-2xl backdrop-blur-xl"
          >
            <Check size={14} className="text-emerald-400" />
            <span>Copied {copiedItem} to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── Header ──────────────── */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-10 pb-4 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 cursor-default"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-fuchsia-500 p-[1px] shadow-lg shadow-sky-500/10">
            <div className="w-full h-full bg-[#06060b] rounded-[11px] flex items-center justify-center backdrop-blur-md">
              <Sparkles size={18} className="text-sky-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white leading-none">
              Yashoo <span className="gradient-text bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 font-black">LAB</span>
            </span>
            <span className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase mt-0.5">Sandbox</span>
          </div>
        </motion.div>

        {/* Engine Status Badge */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md"
        >
          <div className="relative flex items-center justify-center w-2 h-2">
            <span className={`absolute w-3.5 h-3.5 rounded-full ${swRegistered ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse-ring`} />
            <span className={`relative w-2 h-2 rounded-full ${swRegistered ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
          <span className="text-[11px] font-semibold tracking-wide uppercase text-gray-300">
            {swRegistered ? 'Engine Online' : 'Active'}
          </span>
        </motion.div>
      </header>

      {/* ──────────────── Hero Section ──────────────── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-12 sm:py-20 text-center">
        <div className="max-w-3xl w-full flex flex-col items-center gap-6 sm:gap-8">
          
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-gray-300 backdrop-blur-lg"
          >
            <Zap size={13} className="text-sky-400 animate-pulse" />
            <span>Project Ecosystem & Experiments</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[2.8rem] leading-[0.92] sm:text-6xl md:text-8xl font-black tracking-[-0.04em] sm:leading-[0.95]"
          >
            <span className="block text-white">Build.</span>
            <span className="block gradient-text bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 animate-shimmer">
              Experiment.
            </span>
            <span className="block text-white">Ship.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-gray-400 font-light max-w-xl leading-relaxed px-2 sm:px-0"
          >
            A personal project sandbox by <span className="text-white font-medium">Yashoo</span> — curating high-performance web applications and standalone tools.
          </motion.p>
        </div>
      </section>

      {/* ──────────────── Projects Grid ──────────────── */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
        
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2.5">
            <Code2 size={16} className="text-sky-400" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Active Projects
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-gray-400">
            2 Released
          </span>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {projects.map((p, index) => {
            const IconComponent = p.icon;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onLaunch(p.id)}
                className="glow-card relative group rounded-3xl p-7 sm:p-9 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Glow Backdrop */}
                <div 
                  className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
                  style={{ background: p.glowColor }}
                />

                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center shadow-lg shadow-black/40 text-white shrink-0`}>
                      <IconComponent size={24} />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all duration-300">
                      <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Tag */}
                  <div className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-semibold text-gray-300 mb-3">
                    {p.tag}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3 group-hover:text-white/95 transition-colors">
                    {p.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-light mb-6">
                    {p.desc}
                  </p>
                </div>

                {/* Tech Chips & Launch Action */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.tech.map((t, idx) => (
                      <span key={idx} className="text-[11px] font-medium text-gray-400 px-2.5 py-0.5 rounded-md bg-white/[0.03]">
                        {t}
                      </span>
                    ))}
                  </div>

                  <span className={`text-xs font-bold gradient-text bg-gradient-to-r ${p.gradientText} flex items-center gap-1 group-hover:underline`}>
                    Launch Project ↗
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ──────────────── Contact & Footer ──────────────── */}
      <footer className="relative z-10 w-full border-t border-white/[0.08] bg-[#020204]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-sky-400" />
              <p className="text-sm font-bold text-white tracking-wide">Get In Touch</p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-gray-400 flex-wrap">
              
              {/* Phone Button (Copy) */}
              <button
                onClick={() => handleCopy('+201128209072', 'Phone number')}
                className="flex items-center justify-between sm:justify-start gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-gray-300 hover:text-white transition-all min-h-[44px] group"
                title="Click to copy phone number"
              >
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-sky-400" />
                  <span>+20 11 28209072</span>
                </div>
                <Copy size={13} className="text-gray-500 group-hover:text-white transition-colors" />
              </button>

              {/* Email Button (Copy) */}
              <button
                onClick={() => handleCopy('ya3777250@gmail.com', 'Email address')}
                className="flex items-center justify-between sm:justify-start gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-gray-300 hover:text-white transition-all min-h-[44px] group"
                title="Click to copy email address"
              >
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-violet-400" />
                  <span>ya3777250@gmail.com</span>
                </div>
                <Copy size={13} className="text-gray-500 group-hover:text-white transition-colors" />
              </button>

              {/* Linktree Link */}
              <a
                href="https://linktr.ee/Yashoo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between sm:justify-start gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-gray-300 hover:text-white transition-all min-h-[44px] group"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink size={15} className="text-fuchsia-400" />
                  <span>linktr.ee/Yashoo</span>
                </div>
                <ArrowUpRight size={13} className="text-gray-500 group-hover:text-white transition-colors" />
              </a>

            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1 text-xs text-gray-500">
            <span className="font-semibold text-gray-400">Yashoo LAB Ecosystem</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Dashboard;
