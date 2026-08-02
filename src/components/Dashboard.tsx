import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  GraduationCap, 
  QrCode,
  Cpu,
  ArrowUpRight, 
  Mail, 
  Phone, 
  ExternalLink,
  Check,
  ShieldCheck
} from 'lucide-react';
import AnimatedLiquidBackground from './AnimatedLiquidBackground';

interface DashboardProps {
  onLaunch: (id: string) => void;
  swRegistered: boolean;
}

interface ProjectCardData {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  tag: string;
  iconColor: string;
  iconBg: string;
  glowColor: string;
  btnText: string;
  badgeText?: string;
}

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const projects: ProjectCardData[] = [
  {
    id: 'yashoo-es',
    title: 'Yashoo ES',
    desc: 'Event Management Suite, Guest Invitations, QR Ticket Verification & Automated Certificate Issuance.',
    icon: Cpu,
    tag: 'Event Suite',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    glowColor: 'group-hover:shadow-amber-500/20 group-hover:border-amber-500/40',
    btnText: 'Open Yashoo ES',
    badgeText: 'Active Suite'
  },
  {
    id: 'qr',
    title: 'Dynamic QR',
    desc: 'Create smart dynamic QR codes with fixed redirect links. Update destination targets anytime using password protection without altering the QR image.',
    icon: QrCode,
    tag: 'Smart Tools',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    glowColor: 'group-hover:shadow-cyan-500/20 group-hover:border-cyan-500/40',
    btnText: 'Open Dynamic QR',
    badgeText: 'Smart QR'
  },
  {
    id: 'ultraproxy',
    title: 'Proxy',
    desc: 'High-speed web emulator with XOR obfuscation. Access web resources freely without CORS restrictions or ISP blocking.',
    icon: Globe,
    tag: 'Network Proxy',
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/10 border-sky-500/20',
    glowColor: 'group-hover:shadow-sky-500/20 group-hover:border-sky-500/40',
    btnText: 'Launch Proxy',
    badgeText: 'XOR Proxy'
  },
  {
    id: 'thanawya',
    title: 'Thanawya 2026',
    desc: 'Query Thanawya Amma 2026 examination results by student name or seat number. High-performance Arabic search engine.',
    icon: GraduationCap,
    tag: 'Educational Portal',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    glowColor: 'group-hover:shadow-violet-500/20 group-hover:border-violet-500/40',
    btnText: 'Check Results',
    badgeText: '2026 Engine'
  },
];

const Dashboard: React.FC<DashboardProps> = ({ onLaunch, swRegistered: _swRegistered }) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => {
      setCopiedItem(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#030308] text-white flex flex-col relative overflow-hidden select-none font-sans">
      
      {/* Soft Animated Fluid Liquid Background */}
      <AnimatedLiquidBackground />

      {/* Toast Notification */}
      <AnimatePresence>
        {copiedItem && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0c0c16]/95 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-2xl"
          >
            <Check size={16} className="text-emerald-400 shrink-0" />
            <span>Copied {copiedItem} to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── Top Header Bar ──────────────── */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-4 flex items-center justify-between">
        
        {/* Brand Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 cursor-default group"
        >
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white flex items-center gap-1.5">
            Yashoo <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 font-light">LAB</span>
          </span>
        </motion.div>

        {/* Header Right Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          {/* GitHub Repository Link Button */}
          <a
            href="https://github.com/Yasen-A7med/LAB"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all text-xs font-semibold backdrop-blur-xl group"
            title="View GitHub Repository"
          >
            <GithubIcon size={16} className="text-white group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">GitHub</span>
            <ArrowUpRight size={13} className="text-gray-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </a>
        </motion.div>
      </header>

      {/* ──────────────── Hero Section ──────────────── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-8 sm:py-12 text-center">
        <div className="max-w-3xl w-full flex flex-col items-center gap-4 sm:gap-5">
          
          {/* Hero Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight"
          >
            Yashoo <span className="text-amber-400">LAB</span>
          </motion.h1>

          {/* Hero Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl leading-relaxed font-medium"
          >
            Yasen Ahmed's personal laboratory and repository for all experiments and public projects.
          </motion.p>

        </div>
      </section>

      {/* ──────────────── Project Cards Section ──────────────── */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {projects.map((p, index) => {
            const IconComponent = p.icon;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onLaunch(p.id)}
                className={`group relative bg-[#0a0a14]/80 border border-white/[0.08] hover:border-white/20 shadow-2xl rounded-3xl p-6 cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-300 backdrop-blur-2xl ${p.glowColor}`}
              >
                {/* Subtle Card Ambient Glow Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] group-hover:bg-amber-500/5 rounded-full blur-3xl transition-all duration-500 pointer-events-none" />

                <div>
                  {/* Top Icon & Tag */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-2xl ${p.iconBg} border flex items-center justify-center ${p.iconColor} shrink-0 group-hover:scale-105 transition-transform`}>
                      <IconComponent size={22} />
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-400 transition-all shrink-0">
                      <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Tag Badge */}
                  <div className="mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                      {p.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white mb-2.5 group-hover:text-amber-400 transition-colors">
                    {p.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-400 leading-relaxed font-light mb-6 line-clamp-3">
                    {p.desc}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-300 group-hover:text-white transition-colors flex items-center gap-1">
                    <span>{p.btnText}</span>
                    <span className="text-amber-400">↗</span>
                  </span>
                  {p.badgeText && (
                    <span className="text-[10px] font-mono text-gray-500 group-hover:text-gray-400">
                      {p.badgeText}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ──────────────── Footer ──────────────── */}
      <footer className="relative z-10 w-full border-t border-white/[0.08] bg-[#020205]/90 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex items-center justify-between">
          
          {/* Left Contact & Links */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Contact & Verified Links
            </span>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 flex-wrap">
              
              {/* GitHub Link */}
              <a
                href="https://github.com/Yasen-A7med/LAB"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors py-1 text-white font-medium"
              >
                <GithubIcon size={15} className="text-amber-400" />
                <span>GitHub Repository</span>
                <ExternalLink size={12} className="text-gray-500" />
              </a>

              <span className="hidden sm:inline text-gray-700">•</span>

              <button
                onClick={(e) => { e.stopPropagation(); handleCopy('+201128209072', 'Phone number'); }}
                className="flex items-center gap-2 hover:text-white transition-colors py-1 cursor-pointer"
                title="Click to copy phone number"
              >
                <Phone size={14} className="text-gray-400" />
                <span className="font-mono">+20 11 28209072</span>
              </button>

              <span className="hidden sm:inline text-gray-700">•</span>

              <button
                onClick={(e) => { e.stopPropagation(); handleCopy('ya3777250@gmail.com', 'Email address'); }}
                className="flex items-center gap-2 hover:text-white transition-colors py-1 cursor-pointer"
                title="Click to copy email address"
              >
                <Mail size={14} className="text-gray-400" />
                <span>ya3777250@gmail.com</span>
              </button>

              <span className="hidden sm:inline text-gray-700">•</span>

              <a
                href="https://linktr.ee/Yashoo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors py-1"
              >
                <ExternalLink size={14} className="text-gray-400" />
                <span>linktr.ee/Yashoo</span>
              </a>

            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Dashboard;
