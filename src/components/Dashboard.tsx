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
  Code2,
  ArrowRight
} from 'lucide-react';
import AnimatedLiquidBackground from './AnimatedLiquidBackground';

interface DashboardProps {
  onLaunch: (id: string) => void;
  swRegistered: boolean;
}

const projects = [
  {
    id: 'ultraproxy',
    title: 'UltraProxy Engine',
    desc: 'High-speed web emulator with XOR obfuscation. Access web resources freely without CORS restrictions or ISP blocking.',
    icon: Globe,
    accent: 'from-[#00f2ff] via-sky-500 to-indigo-600',
    topBorder: 'from-cyan-400 via-sky-500 to-blue-600',
    glowColor: 'rgba(0, 242, 255, 0.12)',
    tag: 'Network Emulator',
    tech: ['Service Worker', 'Wisp / Bare', 'XOR Engine'],
    gradientText: 'from-cyan-400 to-sky-400',
    btnBg: 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500',
    btnText: 'Launch UltraProxy',
    badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
  },
  {
    id: 'thanawya',
    title: 'نتيجة الثانوية العامة',
    desc: 'استعلم عن نتيجة الثانوية العامة 2026 بالاسم أو رقم الجلوس. محرك بحث ذكي وسريع باللغة العربية.',
    icon: GraduationCap,
    accent: 'from-violet-500 via-purple-500 to-fuchsia-600',
    topBorder: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glowColor: 'rgba(168, 85, 247, 0.12)',
    tag: 'Educational Portal',
    tech: ['الصف الثالث الثانوي 2026', 'Smart Search', 'RTL Engine'],
    gradientText: 'from-violet-400 to-fuchsia-400',
    btnBg: 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500',
    btnText: 'عرض نتيجتك الان',
    badgeColor: 'text-violet-400 bg-violet-400/10 border-violet-400/20'
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
      
      {/* Optimized Animated Liquid Background */}
      <AnimatedLiquidBackground />

      {/* Copy Notification Toast */}
      <AnimatePresence>
        {copiedItem && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0d0d14]/95 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-2xl"
          >
            <Check size={16} className="text-emerald-400 shrink-0" />
            <span>Copied {copiedItem} to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── Header ──────────────── */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-5 sm:pt-10 pb-3 sm:pb-4 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-default"
        >
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-fuchsia-500 p-[1px] shadow-lg shadow-sky-500/10">
            <div className="w-full h-full bg-[#06060b] rounded-[11px] flex items-center justify-center backdrop-blur-md">
              <Sparkles size={16} className="text-sky-400 sm:hidden" />
              <Sparkles size={18} className="text-sky-400 hidden sm:block" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-white leading-none">
              Yashoo <span className="gradient-text bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 font-black">LAB</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-500 font-semibold tracking-widest uppercase mt-0.5">Sandbox</span>
          </div>
        </motion.div>

        {/* Engine Status Badge */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 px-3 py-1.2 sm:px-3.5 sm:py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md"
        >
          <div className="relative flex items-center justify-center w-2 h-2">
            <span className={`absolute w-3.5 h-3.5 rounded-full ${swRegistered ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse-ring`} />
            <span className={`relative w-2 h-2 rounded-full ${swRegistered ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase text-gray-300">
            {swRegistered ? 'Engine Online' : 'Active'}
          </span>
        </motion.div>
      </header>

      {/* ──────────────── Hero Section ──────────────── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 sm:py-16 text-center">
        <div className="max-w-3xl w-full flex flex-col items-center gap-4 sm:gap-6">
          
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs font-medium text-gray-300 backdrop-blur-lg"
          >
            <Zap size={12} className="text-sky-400 animate-pulse" />
            <span>Project Ecosystem & Experiments</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[2.6rem] leading-[0.92] sm:text-6xl md:text-8xl font-black tracking-[-0.04em] sm:leading-[0.95]"
          >
            <span className="block text-white">Build.</span>
            <span className="block gradient-text bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 animate-shimmer">
              Experiment.
            </span>
            <span className="block text-white">Ship.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-sm sm:text-lg md:text-xl text-gray-400 font-light max-w-xl leading-relaxed px-1 sm:px-0"
          >
            A personal project sandbox by <span className="text-white font-medium">Yashoo</span> — curating high-performance web applications and standalone tools.
          </motion.p>
        </div>
      </section>

      {/* ──────────────── Projects Cards Section ──────────────── */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pb-14 sm:pb-24">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-5 sm:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Code2 size={16} className="text-sky-400" />
            <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Active Projects
            </h2>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-gray-400">
            2 Released
          </span>
        </motion.div>

        {/* Overhauled Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {projects.map((p, index) => {
            const IconComponent = p.icon;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onLaunch(p.id)}
                className="glow-card relative group rounded-3xl p-6 sm:p-8 cursor-pointer flex flex-col justify-between overflow-hidden border border-white/10 hover:border-white/20 transition-all shadow-xl bg-[#0b0b14]/75 backdrop-blur-xl"
              >
                {/* Top Border Gradient Accent */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${p.topBorder}`} />

                {/* Glow Backdrop on hover */}
                <div 
                  className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
                  style={{ background: p.glowColor }}
                />

                <div>
                  {/* Card Header Row */}
                  <div className="flex items-start justify-between mb-5 gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center shadow-lg text-white shrink-0`}>
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${p.badgeColor}`}>
                          {p.tag}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1 group-hover:text-white/95 transition-colors">
                          {p.title}
                        </h3>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all shrink-0">
                      <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Card Description */}
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light mb-6">
                    {p.desc}
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Tech Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {p.tech.map((t, idx) => (
                      <span key={idx} className="text-[10px] sm:text-[11px] font-medium text-gray-400 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Prominent Launch Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunch(p.id);
                    }}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl ${p.btnBg} text-white text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all min-h-[44px] active:scale-[0.97]`}
                  >
                    <span>{p.btnText}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ──────────────── Contact & Footer ──────────────── */}
      <footer className="relative z-10 w-full border-t border-white/[0.08] bg-[#020204]/90 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-sky-400" />
              <p className="text-sm font-bold text-white tracking-wide">Get In Touch</p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 text-xs sm:text-sm text-gray-400">
              
              {/* Phone Button (Copy) */}
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy('+201128209072', 'Phone number'); }}
                className="flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white/[0.03] active:bg-white/[0.08] hover:bg-white/[0.07] border border-white/10 text-gray-300 hover:text-white transition-all min-h-[44px] group w-full sm:w-auto"
                title="Click to copy phone number"
              >
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-sky-400 shrink-0" />
                  <span className="font-mono">+20 11 28209072</span>
                </div>
                <Copy size={13} className="text-gray-500 group-hover:text-white transition-colors shrink-0" />
              </button>

              {/* Email Button (Copy) */}
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy('ya3777250@gmail.com', 'Email address'); }}
                className="flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white/[0.03] active:bg-white/[0.08] hover:bg-white/[0.07] border border-white/10 text-gray-300 hover:text-white transition-all min-h-[44px] group w-full sm:w-auto"
                title="Click to copy email address"
              >
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-violet-400 shrink-0" />
                  <span>ya3777250@gmail.com</span>
                </div>
                <Copy size={13} className="text-gray-500 group-hover:text-white transition-colors shrink-0" />
              </button>

              {/* Linktree Link */}
              <a
                href="https://linktr.ee/Yashoo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white/[0.03] active:bg-white/[0.08] hover:bg-white/[0.07] border border-white/10 text-gray-300 hover:text-white transition-all min-h-[44px] group w-full sm:w-auto"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink size={14} className="text-fuchsia-400 shrink-0" />
                  <span>linktr.ee/Yashoo</span>
                </div>
                <ArrowUpRight size={13} className="text-gray-500 group-hover:text-white transition-colors shrink-0" />
              </a>

            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-0.5 text-xs text-gray-500 pt-2 border-t border-white/5 md:border-none w-full md:w-auto">
            <span className="font-semibold text-gray-400">Yashoo LAB Ecosystem</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Dashboard;
