import React from 'react';
import { Globe, GraduationCap, ArrowUpRight, Mail, Phone } from 'lucide-react';

interface DashboardProps {
  onLaunch: (id: string) => void;
  swRegistered: boolean;
}

const projects = [
  {
    id: 'ultraproxy',
    title: 'UltraProxy',
    desc: 'Universal web proxy with XOR obfuscation. Bypass restrictions and stream without limits.',
    icon: Globe,
    accent: 'from-sky-400 to-indigo-500',
    accentShadow: 'hover:shadow-sky-500/20',
    tag: 'Proxy',
  },
  {
    id: 'thanawya',
    title: 'نتيجة الثانوية',
    desc: 'Thanaweya Amma exam results lookup by name or seat number — fast and accurate.',
    icon: GraduationCap,
    accent: 'from-violet-400 to-fuchsia-500',
    accentShadow: 'hover:shadow-violet-500/20',
    tag: 'Education',
  },
];

const Dashboard: React.FC<DashboardProps> = ({ onLaunch }) => {
  return (
    <div className="noise-overlay min-h-screen bg-[#060606] text-white flex flex-col">
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-sky-600/[0.06] blur-[100px] animate-float" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/[0.06] blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* ──────── Header ──────── */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 md:px-10 pt-8 pb-4 flex items-center justify-between fade-up">
        <span className="text-xl font-bold tracking-tight select-none">
          Yashoo<span className="text-gray-500 font-normal ml-1">LAB</span>
        </span>
        <a
          href="https://github.com/Yasen-A7med/LAB"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-white transition-colors duration-200 link-underline"
        >
          GitHub ↗
        </a>
      </header>

      {/* ──────── Hero ──────── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-3xl w-full text-center flex flex-col items-center gap-8">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-[-0.04em] leading-[0.95] fade-up fade-up-delay-1">
            <span className="block">Build.</span>
            <span className="block gradient-text bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400">Experiment.</span>
            <span className="block">Ship.</span>
          </h1>

          <p className="text-base md:text-lg text-gray-400 font-light max-w-lg leading-relaxed fade-up fade-up-delay-2">
            A personal project sandbox by <span className="text-white font-medium">Yashoo</span> — curating high-performance web tools and experiments.
          </p>
        </div>
      </section>

      {/* ──────── Projects ──────── */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-10 pb-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-8 fade-up fade-up-delay-3">
          Live Projects
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onLaunch(p.id)}
              className={`card-glow spring-hover group relative w-full text-left bg-white/[0.025] rounded-2xl p-7 md:p-9 border border-white/[0.06] backdrop-blur-sm cursor-pointer transition-shadow duration-500 shadow-xl shadow-transparent ${p.accentShadow} fade-up fade-up-delay-${i + 3}`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-6">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.accent} flex items-center justify-center shadow-lg`}>
                  <p.icon size={20} className="text-white" />
                </div>
                <ArrowUpRight
                  size={20}
                  className="text-gray-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                />
              </div>

              {/* Tag */}
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-3">
                {p.tag}
              </span>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3 group-hover:text-white/90 transition-colors">
                {p.title}
              </h2>

              {/* Desc */}
              <p className="text-sm text-gray-500 leading-relaxed font-light">
                {p.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ──────── Footer / Contact ──────── */}
      <footer className="relative z-10 w-full border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-white mb-2">Get in touch</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 text-sm text-gray-500">
              <a href="tel:+201128209072" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone size={14} />
                <span>+20 11 28209072</span>
              </a>
              <a href="mailto:ya3777250@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail size={14} />
                <span>ya3777250@gmail.com</span>
              </a>
              <a href="https://linktr.ee/Yashoo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors link-underline">
                linktr.ee/Yashoo
              </a>
            </div>
          </div>

          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Yashoo LAB
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
