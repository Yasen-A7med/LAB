import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Mail, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Info, 
  Calendar, 
  MapPin, 
  Users, 
  Award,
  Globe
} from 'lucide-react';
import { AGENCIES, OUTREACH_MESSAGE_PITCH, OUTREACH_EMAIL_SUBJECT, getEmailBody } from './agencyData';
import type { AgencyStatus } from './types';

interface GEFOutreachAppProps {
  onBack: () => void;
}

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const WhatsAppIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const STATUS_LABELS: Record<AgencyStatus, { label: string; color: string }> = {
  not_contacted: { label: 'Pending', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
  emailed: { label: 'Emailed ✓', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  whatsapp_sent: { label: 'WhatsApp Sent', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  interested: { label: 'Interested ⭐', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  confirmed: { label: 'Confirmed Partner 🎉', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
};

export const GEFOutreachApp: React.FC<GEFOutreachAppProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Agency statuses tracked in LocalStorage
  const [agencyStatuses, setAgencyStatuses] = useState<Record<number, AgencyStatus>>(() => {
    try {
      const saved = localStorage.getItem('gef_agency_statuses_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    // Initialize default: if verifiedEmailSent is true, default to 'emailed'
    const initial: Record<number, AgencyStatus> = {};
    AGENCIES.forEach(a => {
      initial[a.id] = a.verifiedEmailSent ? 'emailed' : 'not_contacted';
    });
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('gef_agency_statuses_v1', JSON.stringify(agencyStatuses));
  }, [agencyStatuses]);

  const updateStatus = (id: number, status: AgencyStatus) => {
    setAgencyStatuses(prev => ({ ...prev, [id]: status }));
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(OUTREACH_MESSAGE_PITCH);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    AGENCIES.forEach(a => set.add(a.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredAgencies = useMemo(() => {
    return AGENCIES.filter(agency => {
      const matchesSearch = 
        agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.contacts.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
        agency.emails.some(e => e.toLowerCase().includes(searchTerm.toLowerCase())) ||
        agency.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || agency.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const stats = useMemo(() => {
    const total = AGENCIES.length;
    const emailed = Object.values(agencyStatuses).filter(s => s === 'emailed').length;
    const whatsapp = Object.values(agencyStatuses).filter(s => s === 'whatsapp_sent').length;
    const interested = Object.values(agencyStatuses).filter(s => s === 'interested').length;
    const confirmed = Object.values(agencyStatuses).filter(s => s === 'confirmed').length;
    return { total, emailed, whatsapp, interested, confirmed };
  }, [agencyStatuses]);

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col font-sans selection:bg-blue-500/30">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#070b14]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors border border-white/5"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  GEF Runway Outreach
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold uppercase tracking-wider">
                    2026
                  </span>
                </h1>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Global Entrepreneurship Festival • JW Marriott Cairo • 7 Nov 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBriefModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 transition-colors"
            >
              <Info size={14} className="text-blue-400" />
              <span>Event Brief</span>
            </button>
            <button
              onClick={handleCopyPitch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-all"
            >
              {copiedPitch ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedPitch ? 'Copied!' : 'Copy Pitch'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 flex flex-col gap-6">
        {/* KPI Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 backdrop-blur-md">
            <span className="text-xs text-zinc-500 font-medium">Total Directory</span>
            <div className="text-xl font-bold text-white mt-0.5">{stats.total}</div>
          </div>
          <div className="bg-zinc-900/60 border border-blue-500/20 rounded-xl p-3 backdrop-blur-md">
            <span className="text-xs text-blue-400 font-medium">Emailed via SMTP</span>
            <div className="text-xl font-bold text-blue-400 mt-0.5">{stats.emailed}</div>
          </div>
          <div className="bg-zinc-900/60 border border-emerald-500/20 rounded-xl p-3 backdrop-blur-md">
            <span className="text-xs text-emerald-400 font-medium">WhatsApp Sent</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{stats.whatsapp}</div>
          </div>
          <div className="bg-zinc-900/60 border border-amber-500/20 rounded-xl p-3 backdrop-blur-md">
            <span className="text-xs text-amber-400 font-medium">Interested</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{stats.interested}</div>
          </div>
          <div className="bg-zinc-900/60 border border-purple-500/20 rounded-xl p-3 backdrop-blur-md col-span-2 sm:col-span-1">
            <span className="text-xs text-purple-400 font-medium">Confirmed Partner</span>
            <div className="text-xl font-bold text-purple-400 mt-0.5">{stats.confirmed}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by agency, contact, or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap capitalize font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/5'
                }`}
              >
                {cat === 'all' ? 'All Agencies' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Agencies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgencies.map(agency => {
            const currentStatus = agencyStatuses[agency.id] || 'not_contacted';
            const statusConfig = STATUS_LABELS[currentStatus];
            const primaryPhone = agency.phones[0];
            const cleanPhone = primaryPhone ? primaryPhone.replace(/[^0-9]/g, '') : null;
            const waLink = cleanPhone 
              ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(OUTREACH_MESSAGE_PITCH.replace('[Agency Name]', agency.name))}`
              : null;
            const primaryEmail = agency.emails[0];
            const mailtoLink = primaryEmail
              ? `mailto:${primaryEmail}?subject=${encodeURIComponent(OUTREACH_EMAIL_SUBJECT)}&body=${encodeURIComponent(getEmailBody(agency.name))}`
              : null;

            return (
              <motion.div
                key={agency.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-white/10 hover:border-white/20 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-black/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-blue-400/90 tracking-wide uppercase">
                      {agency.category}
                    </span>
                    
                    {/* Status Dropdown */}
                    <select
                      value={currentStatus}
                      onChange={e => updateStatus(agency.id, e.target.value as AgencyStatus)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${statusConfig.color}`}
                    >
                      <option value="not_contacted" className="bg-zinc-900 text-zinc-300">Pending</option>
                      <option value="emailed" className="bg-zinc-900 text-blue-400">Emailed ✓</option>
                      <option value="whatsapp_sent" className="bg-zinc-900 text-emerald-400">WhatsApp Sent</option>
                      <option value="interested" className="bg-zinc-900 text-amber-400">Interested ⭐</option>
                      <option value="confirmed" className="bg-zinc-900 text-purple-400">Confirmed 🎉</option>
                    </select>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {agency.name}
                  </h3>

                  {agency.highlight && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
                      <Sparkles size={12} />
                      <span>{agency.highlight}</span>
                    </div>
                  )}

                  {/* Contacts */}
                  <div className="mt-3 text-xs text-zinc-400 leading-relaxed">
                    <span className="text-zinc-500 font-medium">Key Contacts: </span>
                    {agency.contacts.join(', ')}
                  </div>

                  {/* Emails & Phones */}
                  <div className="mt-2 flex flex-col gap-1 text-xs">
                    {agency.emails.length > 0 && (
                      <div className="text-zinc-400 truncate">
                        <span className="text-zinc-500 font-medium">Email: </span>
                        {agency.emails.join(', ')}
                      </div>
                    )}
                    {agency.phones.length > 0 && (
                      <div className="text-zinc-400">
                        <span className="text-zinc-500 font-medium">Phone: </span>
                        {agency.phones.join(' / ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Strip */}
                <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => updateStatus(agency.id, 'whatsapp_sent')}
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all flex items-center gap-1.5 text-xs font-semibold"
                        title="Send Direct WhatsApp"
                      >
                        <WhatsAppIcon size={15} />
                        <span>Chat</span>
                      </a>
                    )}
                    {mailtoLink && (
                      <a
                        href={mailtoLink}
                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all flex items-center gap-1.5 text-xs font-semibold"
                        title="Open Email Client"
                      >
                        <Mail size={14} />
                        <span>Email</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {agency.instagram && (
                      <a
                        href={agency.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-pink-500/20 text-zinc-400 hover:text-pink-400 border border-white/5 transition-all"
                        title="Instagram Profile"
                      >
                        <InstagramIcon size={14} />
                      </a>
                    )}
                    {agency.website && (
                      <a
                        href={agency.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition-all"
                        title="Official Website"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Event Brief Modal */}
      <AnimatePresence>
        {showBriefModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-white/15 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-blue-400" />
                  <h3 className="font-bold text-base">GEF 2026 International Fashion Show Brief</h3>
                </div>
                <button
                  onClick={() => setShowBriefModal(false)}
                  className="text-zinc-400 hover:text-white text-sm px-2 py-1 rounded bg-white/5"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-zinc-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <Calendar size={15} className="text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Runway Timeline:</strong> Fittings on Nov 5–6, 2026. Main International Fashion Show Day on <strong>7 November 2026</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Venue:</strong> JW Marriott Hotel, Cairo, Egypt (under the distinguished auspices of H.E. Prime Minister Dr. Mostafa Madbouly).
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Users size={15} className="text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Runway Scope:</strong> 15 International luxury designers from 12 countries across 5 continents requiring professional runway talent.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Globe size={15} className="text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Partnership Value Proposition:</strong> Official modeling partner visibility, international press and TV coverage, full 4K runway photography/videography, and direct representation before global fashion houses.
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setShowBriefModal(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
                >
                  Close Brief
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GEFOutreachApp;
