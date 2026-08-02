import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  GraduationCap, 
  QrCode,
  ArrowUpRight, 
  Mail, 
  Phone, 
  ExternalLink,
  Check
} from 'lucide-react';
import AnimatedLiquidBackground from './AnimatedLiquidBackground';

interface DashboardProps {
  onLaunch: (id: string) => void;
  swRegistered: boolean;
}

const projects = [
  {
    id: 'qr',
    title: 'Dynamic QR Studio',
    desc: 'Create smart dynamic QR codes with fixed redirect links. Update destination targets anytime using password protection without altering the QR image.',
    icon: QrCode,
    tag: 'Smart Tools',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    btnText: 'Open Studio ↗'
  },
  {
    id: 'ultraproxy',
    title: 'UltraProxy Engine',
    desc: 'High-speed web emulator with XOR obfuscation. Access web resources freely without CORS restrictions or ISP blocking.',
    icon: Globe,
    tag: 'Network Proxy',
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/10 border-sky-500/20',
    btnText: 'Launch Engine ↗'
  },
  {
    id: 'thanawya',
    title: 'نتيجة الثانوية العامة',
    desc: 'استعلم عن نتيجة الثانوية العامة 2026 بالاسم أو رقم الجلوس. محرك بحث ذكي وسريع باللغة العربية.',
    icon: GraduationCap,
    tag: 'Educational Portal',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    btnText: 'عرض النتيجة ↗'
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
    <div className="min-h-screen min-h-[100dvh] bg-[#050508] text-white flex flex-col relative overflow-hidden select-none">
      
      {/* Soft Animated Liquid Ambient Lighting */}
      <AnimatedLiquidBackground />

      {/* Toast Notification */}
      <AnimatePresence>
        {copiedItem && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-[#0e0e16]/95 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-2xl"
          >
            <Check size={15} className="text-emerald-400 shrink-0" />
            <span>Copied {copiedItem} to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── Header ──────────────── */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-5 sm:px-8 pt-6 sm:pt-10 pb-4 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 cursor-default"
        >
          <span className="font-bold text-xl sm:text-2xl tracking-tight text-white">
            Yashoo <span className="text-gray-400 font-light ml-1">LAB</span>
          </span>
        </motion.div>

        {/* Engine Status Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md"
        >
          <div className="relative flex items-center justify-center w-2 h-2">
            <span className={`absolute w-3 h-3 rounded-full ${swRegistered ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse-ring`} />
            <span className={`relative w-2 h-2 rounded-full ${swRegistered ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
          <span className="text-[11px] font-medium tracking-wide uppercase text-gray-300">
            {swRegistered ? 'Engine Online' : 'Active'}
          </span>
        </motion.div>
      </header>

      {/* ──────────────── Hero Section ──────────────── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-12 sm:py-16 text-center">
        <div className="max-w-2xl w-full flex flex-col items-center gap-4 sm:gap-6">
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight"
          >
            Digital Frontline.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-base sm:text-lg text-gray-400 font-light leading-relaxed max-w-lg"
          >
            A minimalist sandbox by <span className="text-white font-medium">Yashoo</span> — curating high-performance web applications and tools.
          </motion.p>

        </div>
      </section>

      {/* ──────────────── Project Cards Section ──────────────── */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {projects.map((p, index) => {
            const IconComponent = p.icon;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onLaunch(p.id)}
                className="glow-card relative group rounded-3xl p-6 sm:p-7 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${p.iconBg} border flex items-center justify-center ${p.iconColor} shrink-0`}>
                        <IconComponent size={22} />
                      </div>
                      <span className="text-xs font-medium text-gray-400 tracking-wider uppercase">
                        {p.tag}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all shrink-0">
                      <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3 group-hover:text-white/90 transition-colors">
                    {p.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-light mb-8">
                    {p.desc}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-white transition-colors flex items-center gap-1.5">
                    <span>{p.btnText}</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ──────────────── Footer ──────────────── */}
      <footer className="relative z-10 w-full border-t border-white/[0.06] bg-[#030305]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs sm:text-sm text-gray-400 flex-wrap">
              
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy('+201128209072', 'Phone number'); }}
                className="flex items-center gap-2 hover:text-white transition-colors py-1 cursor-pointer"
                title="Click to copy phone number"
              >
                <Phone size={13} className="text-gray-400" />
                <span className="font-mono">+20 11 28209072</span>
              </button>

              <span className="hidden sm:inline text-gray-700">•</span>

              <button
                onClick={(e) => { e.stopPropagation(); handleCopy('ya3777250@gmail.com', 'Email address'); }}
                className="flex items-center gap-2 hover:text-white transition-colors py-1 cursor-pointer"
                title="Click to copy email address"
              >
                <Mail size={13} className="text-gray-400" />
                <span>ya3777250@gmail.com</span>
              </button>

              <span className="hidden sm:inline text-gray-700">•</span>

              <a
                href="https://linktr.ee/Yashoo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors py-1"
              >
                <ExternalLink size={13} className="text-gray-400" />
                <span>linktr.ee/Yashoo</span>
              </a>

            </div>
          </div>

          <div className="text-xs text-gray-600">
            © {new Date().getFullYear()} Yashoo LAB
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Dashboard;
