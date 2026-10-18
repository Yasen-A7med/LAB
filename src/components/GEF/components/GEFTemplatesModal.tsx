import React from 'react';
import { X, Copy, Check, Sparkles } from 'lucide-react';

interface GEFTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyText: (text: string, label: string) => void;
  copiedLabel: string | null;
}

const TEMPLATE_A = `Dear [Agency Name] Team, Hope this message finds you well. I am Yassin from the Global Entrepreneurship Festival (GEF) 2026 organizing team. On 7 November 2026, we are hosting the GEF International Fashion Show at the JW Marriott Hotel Cairo, under the auspices of H.E. Dr. Mostafa Madbouly, Prime Minister of Egypt, featuring 15 international designers from 12 countries. We are looking to partner with a premier modeling agency in Egypt to supply professional male and female runway models (Fittings & Rehearsals: Nov 5–6, Show Day: Nov 7) in exchange for high-level global visibility, international media coverage, and full runway photography/videography. Could we arrange a brief call today or tomorrow to coordinate the next steps? Best regards, Yassin`;

const TEMPLATE_B_SUBJECT = `Official Modeling Agency Partnership — GEF International Fashion Show 2026 (JW Marriott Cairo)`;

const TEMPLATE_B_BODY = `Dear [Contact Name / Agency Management],

Hope this email finds you well.

I am Yassin, reaching out from the organizing team of the GEF International Fashion Show 2026, a headline event of the Global Entrepreneurship Festival (GEF) taking place on 7 November 2026 at the JW Marriott Hotel, Cairo, Egypt, under the distinguished auspices of H.E. Dr. Mostafa Madbouly, Prime Minister of the Arab Republic of Egypt.

The show brings together 15 international luxury designers from 12 countries across 5 continents before an audience of over 1,000 decision-makers, buyers, investors, diplomats, celebrities, and international media executives from 70+ countries.

We are seeking an official Modeling Agency Partner in Egypt to supply professional male and female runway models for our designers (targeting up to 60 models: 40 female and 20 male).

Production & Runway Schedule (JW Marriott Cairo):
5 November 2026: Model Fittings & Styling Sessions
5–6 November 2026: Stage Rehearsals & Runway Choreography Run-throughs
7 November 2026: Main International Fashion Show Day

Partner Benefits:
• High-impact brand visibility and global media exposure across festival channels, press, and broadcast networks.
• Full access to professional runway photography and 4K event videography featuring your models.
• Official Agency Partner recognition and direct connection with 15 international fashion houses and global industry leaders.

As we are finalizing our agency partnership confirmation by Sunday, please let us know your availability for a brief call today or tomorrow to coordinate the next steps.

Best regards,
Yassin
Global Entrepreneurship Festival (GEF) 2026
Website: www.globalentrepreneurshipfestival.com`;

export const GEFTemplatesModal: React.FC<GEFTemplatesModalProps> = ({
  isOpen,
  onClose,
  onCopyText,
  copiedLabel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-500/30 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 text-amber-400 mb-1">
          <Sparkles size={16} />
          <h2 className="text-xl font-bold">Approved Outreach Templates</h2>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Official copy approved by the GEF 2026 Organizing Committee. Use strictly without altering tone or terms.
        </p>

        {/* Template A */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Template A: Instagram DM & WhatsApp Message
            </span>
            <button
              onClick={() => onCopyText(TEMPLATE_A, 'modal-a')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all"
            >
              {copiedLabel === 'modal-a' ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy Template A</span>
            </button>
          </div>
          <div className="rounded-xl bg-black/50 border border-white/10 p-4 text-xs text-gray-200 leading-relaxed font-mono whitespace-pre-wrap select-all">
            {TEMPLATE_A}
          </div>
        </div>

        {/* Template B */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Template B: Official Email
            </span>
            <button
              onClick={() => onCopyText(TEMPLATE_B_BODY, 'modal-b')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/30 transition-all"
            >
              {copiedLabel === 'modal-b' ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy Email Body</span>
            </button>
          </div>
          <div className="text-xs font-semibold text-amber-300 mb-1">
            Subject: {TEMPLATE_B_SUBJECT}
          </div>
          <div className="rounded-xl bg-black/50 border border-white/10 p-4 text-xs text-gray-200 leading-relaxed font-mono whitespace-pre-wrap select-all max-h-60 overflow-y-auto">
            {TEMPLATE_B_BODY}
          </div>
        </div>
      </div>
    </div>
  );
};
