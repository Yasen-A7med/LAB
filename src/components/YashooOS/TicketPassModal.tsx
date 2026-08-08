import React, { useEffect, useState, useRef } from 'react';
import { X, Download, Printer, Copy, Check, MapPin, Calendar, QrCode, ShieldCheck, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';

interface TicketPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: {
    id: string;
    name?: string;
    email: string;
    ticket_id?: string;
    status: 'pending' | 'checked-in';
    created_at?: string;
  };
  eventDetails: {
    name: string;
    date?: string;
    address?: string;
    locationLink?: string;
    whatsappLink?: string;
  };
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  isOpen,
  onClose,
  guest,
  eventDetails,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const ticketCode = guest.ticket_id || `TK-${guest.id.slice(0, 8).toUpperCase()}`;

  useEffect(() => {
    if (!isOpen) return;

    // Generate QR payload containing ticket details for fast scanning
    const qrPayload = JSON.stringify({
      tId: ticketCode,
      email: guest.email,
      gId: guest.id,
    });

    QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#ffffff',
        light: '#0a0a14',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation failed:', err));
  }, [isOpen, guest, ticketCode]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/yashoo-es?ticket=${ticketCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Ticket_${ticketCode}_${guest.email}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-[#0b0b14] border border-white/15 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden my-auto">
        
        {/* Glow ambient background effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/15 rounded-full blur-[70px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all z-10"
        >
          <X size={18} />
        </button>

        {/* Printable Ticket Area */}
        <div ref={ticketRef} className="flex flex-col items-center text-center relative z-10">
          
          {/* Top Brand Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-xs">
              Y
            </div>
            <span className="font-bold tracking-wider text-xs uppercase text-gray-400">
              Yashoo ES • Official Pass
            </span>
          </div>

          {/* Event Title */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-1">
            {eventDetails.name || 'Yashoo ES Event'}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-amber-400/90 font-medium mb-6">
            {eventDetails.date && (
              <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                <Calendar size={13} /> {eventDetails.date}
              </span>
            )}
            {eventDetails.address && (
              <span className="flex items-center gap-1 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-full text-gray-300">
                <MapPin size={13} /> {eventDetails.address}
              </span>
            )}
          </div>

          {/* QR Code Pass Card */}
          <div className="w-full bg-[#050509] border border-amber-500/30 rounded-2xl p-5 flex flex-col items-center shadow-inner relative group mb-6">
            
            {/* Corner Decorative Accents */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/60 rounded-tl" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400/60 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400/60 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/60 rounded-br" />

            {/* QR Code Image */}
            <div className="p-3 bg-[#0a0a14] rounded-xl border border-white/10 shadow-lg mb-3">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Ticket QR Code" className="w-48 h-48 rounded-lg object-contain" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-gray-500 text-xs">
                  <QrCode size={36} className="animate-spin text-amber-400" />
                </div>
              )}
            </div>

            {/* Ticket Code */}
            <div className="font-mono text-base font-extrabold tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3.5 py-1 rounded-lg">
              {ticketCode}
            </div>

            {/* Status Badge */}
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              {guest.status === 'checked-in' ? (
                <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck size={14} /> Checked-In
                </span>
              ) : (
                <span className="text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <QrCode size={14} /> Valid Access Pass
                </span>
              )}
            </div>

          </div>

          {/* Guest Information */}
          <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-left mb-6 text-xs flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Attendee Name:</span>
              <span className="font-bold text-white text-sm">{guest.name || 'Event Attendee'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Email Address:</span>
              <span className="font-mono text-gray-200">{guest.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Ticket Reference:</span>
              <span className="font-mono text-amber-400 font-semibold">{ticketCode}</span>
            </div>
          </div>

          {/* Location / WhatsApp Links */}
          {(eventDetails.locationLink || eventDetails.whatsappLink) && (
            <div className="w-full flex items-center gap-2 mb-6">
              {eventDetails.locationLink && (
                <a
                  href={eventDetails.locationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <MapPin size={14} className="text-amber-400" />
                  <span>Google Maps</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
              )}
              {eventDetails.whatsappLink && (
                <a
                  href={eventDetails.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>WhatsApp Group</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
              )}
            </div>
          )}

        </div>

        {/* Action Toolbar */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 relative z-10">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 px-3 rounded-xl text-xs transition-all shadow-md active:scale-95"
          >
            <Download size={14} />
            <span>QR PNG</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 bg-white/[0.06] hover:bg-white/10 text-white font-semibold py-2.5 px-3 rounded-xl text-xs border border-white/10 transition-all active:scale-95"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 bg-white/[0.06] hover:bg-white/10 text-white font-semibold py-2.5 px-3 rounded-xl text-xs border border-white/10 transition-all active:scale-95"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Pass Link'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
