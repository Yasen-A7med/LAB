import React from 'react';
import type { TargetEntity, OutreachStatus } from '../types';
import { MessageSquare, Mail, Phone, MapPin, User, Copy, Check } from 'lucide-react';

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 13, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

interface GEFTargetCardProps {
  target: TargetEntity;
  onStatusChange: (id: string, newStatus: OutreachStatus) => void;
  onNotesChange: (id: string, notes: string) => void;
  onCopyText: (text: string, label: string) => void;
  copiedLabel: string | null;
}

export const GEFTargetCard: React.FC<GEFTargetCardProps> = ({
  target,
  onStatusChange,
  onNotesChange,
  onCopyText,
  copiedLabel,
}) => {
  const isAgreed = target.status === 'Agreed';

  // Category styles
  let badgeColor = 'bg-blue-500/10 border-blue-500/30 text-blue-400';
  if (target.category === 'Catwalk Academy & Runway Training') {
    badgeColor = 'bg-amber-500/10 border-amber-500/30 text-amber-300';
  } else if (target.category === 'Boutique Modeling Agency') {
    badgeColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  } else if (target.category === 'Industry Organizer & Council') {
    badgeColor = 'bg-purple-500/10 border-purple-500/30 text-purple-300';
  } else if (target.category === 'Designer Brand PR & Referral') {
    badgeColor = 'bg-pink-500/10 border-pink-500/30 text-pink-300';
  }

  // Status styles
  let statusBorder = 'border-white/10';
  if (target.status === 'Agreed') statusBorder = 'border-emerald-500/60 bg-emerald-950/20';
  else if (target.status === 'In Discussion') statusBorder = 'border-purple-500/40';
  else if (target.status === 'Contacted') statusBorder = 'border-blue-500/40';

  return (
    <div className={`flex flex-col justify-between rounded-2xl border ${statusBorder} bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-xl hover:shadow-black/50`}>
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${badgeColor}`}>
            {target.category}
          </span>

          <select
            value={target.status}
            onChange={(e) => onStatusChange(target.id, e.target.value as OutreachStatus)}
            aria-label="Change target outreach status"
            className={`px-2.5 py-1 rounded-md text-xs font-bold border bg-black/60 cursor-pointer focus:outline-none ${
              isAgreed
                ? 'border-emerald-500 text-emerald-300 bg-emerald-500/20'
                : target.status === 'In Discussion'
                ? 'border-purple-400 text-purple-300'
                : target.status === 'Contacted'
                ? 'border-blue-400 text-blue-300'
                : target.status === 'Declined'
                ? 'border-red-500 text-red-400'
                : 'border-white/20 text-gray-300'
            }`}
          >
            <option value="To Contact">To Contact</option>
            <option value="Contacted">Contacted</option>
            <option value="In Discussion">In Discussion</option>
            <option value="Agreed">🎉 Agreed (Partner)</option>
            <option value="Declined">Declined</option>
          </select>
        </div>

        {/* Agency Name */}
        <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
          {target.name}
        </h3>

        {/* Contact & Location */}
        <div className="mt-1.5 space-y-1">
          {target.contact_person && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-medium">
              <User size={13} />
              <span>{target.contact_person}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin size={13} />
            <span>{target.location}</span>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {target.instagram && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-pink-300">
              <InstagramIcon size={11} />
              <span>@{target.instagram}</span>
            </span>
          )}
          {target.phone_raw && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-emerald-300">
              <Phone size={11} />
              <span>{target.phone_raw}</span>
            </span>
          )}
          {target.email && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-blue-300">
              <Mail size={11} />
              <span>{target.email}</span>
            </span>
          )}
        </div>

        {/* Strategic Notes */}
        <p className="text-xs text-gray-300 bg-black/30 border-l-2 border-amber-400 p-2.5 rounded-r-md leading-relaxed my-3">
          {target.strategic_notes}
        </p>
      </div>

      {/* Action Row */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {target.whatsapp_link ? (
            <a
              href={target.whatsapp_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-black text-xs font-semibold border border-emerald-500/30 transition-all text-center"
            >
              <MessageSquare size={13} />
              <span>WhatsApp</span>
            </a>
          ) : (
            <div className="text-[11px] text-gray-600 flex items-center justify-center border border-white/5 rounded-lg py-1.5">No WA</div>
          )}

          {target.instagram ? (
            <a
              href={target.instagram_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-pink-500/15 hover:bg-pink-600 text-pink-300 hover:text-white text-xs font-semibold border border-pink-500/30 transition-all text-center"
            >
              <InstagramIcon size={13} />
              <span>Instagram</span>
            </a>
          ) : (
            <div className="text-[11px] text-gray-600 flex items-center justify-center border border-white/5 rounded-lg py-1.5">No IG</div>
          )}

          {target.mailto_link ? (
            <a
              href={target.mailto_link}
              className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-blue-500/15 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold border border-blue-500/30 transition-all text-center"
            >
              <Mail size={13} />
              <span>Email</span>
            </a>
          ) : (
            <div className="text-[11px] text-gray-600 flex items-center justify-center border border-white/5 rounded-lg py-1.5">No Email</div>
          )}
        </div>

        {/* Copy Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onCopyText(target.template_a_dm_whatsapp, `dm-${target.id}`)}
            className="inline-flex items-center justify-center gap-1 py-1 px-2 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[11px] border border-white/10 transition-colors"
          >
            {copiedLabel === `dm-${target.id}` ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span>Copy Template A</span>
          </button>

          <button
            onClick={() => onCopyText(target.template_b_email_body, `mail-${target.id}`)}
            className="inline-flex items-center justify-center gap-1 py-1 px-2 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[11px] border border-white/10 transition-colors"
          >
            {copiedLabel === `mail-${target.id}` ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span>Copy Template B</span>
          </button>
        </div>

        {/* Follow-up Notes */}
        <textarea
          value={target.follow_up_notes || ''}
          onChange={(e) => onNotesChange(target.id, e.target.value)}
          placeholder="Add custom notes (e.g. Call scheduled for tomorrow 3 PM)..."
          className="w-full text-xs p-2 rounded-lg bg-black/40 border border-white/10 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-amber-400 transition-colors resize-none h-14"
        />
      </div>
    </div>
  );
};
