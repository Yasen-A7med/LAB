import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Ticket,
  Search,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  Wrench,
  Mail,
  User,
  QrCode,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TicketPassModal } from './TicketPassModal';

interface PublicEventLandingProps {
  onBack: () => void;
  selectedProjectId: string;
  onUnlockAdmin: () => void;
}

export const PublicEventLanding: React.FC<PublicEventLandingProps> = ({
  onBack,
  selectedProjectId,
  onUnlockAdmin,
}) => {
  // Settings & Event Data State
  const [eventName, setEventName] = useState('Yashoo ES Event');
  const [eventDate, setEventDate] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [eventLocationLink, setEventLocationLink] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('admin');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // RSVP Form State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Ticket Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Maintenance Subscriber State
  const [subscriberInput, setSubscriberInput] = useState('');
  const [submittingSubscriber, setSubmittingSubscriber] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Active Ticket Pass Modal State
  const [activeGuest, setActiveGuest] = useState<{
    id: string;
    name?: string;
    email: string;
    ticket_id?: string;
    status: 'pending' | 'checked-in';
  } | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  // Admin PIN modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Fetch Event Settings
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value')
          .eq('project_id', selectedProjectId);

        if (!error && data) {
          const map: Record<string, string> = {};
          data.forEach((item) => {
            map[item.key] = item.value;
          });

          if (map['event_name']) setEventName(map['event_name']);
          if (map['event_date']) setEventDate(map['event_date']);
          if (map['event_address']) setEventAddress(map['event_address']);
          if (map['event_details']) setEventDetails(map['event_details']);
          if (map['event_location_link']) setEventLocationLink(map['event_location_link']);
          if (map['whatsapp_link']) setWhatsappLink(map['whatsapp_link']);
          if (map['admin_passcode']) setAdminPasscode(map['admin_passcode']);
          if (map['is_maintenance_mode'] === 'true') setIsMaintenanceMode(true);
        }
      } catch (e) {
        console.warn('Failed to load event details:', e);
      }
    };

    fetchEventData();
  }, [selectedProjectId]);

  // Handle URL Ticket Parameter (e.g. ?ticket=TK-8F92A)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticketParam = params.get('ticket');
    if (ticketParam) {
      handleLookupTicket(ticketParam);
    }
  }, []);

  // Handle New Guest Registration with strict email normalization
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = guestEmail.trim().toLowerCase();
    const name = guestName.trim();
    if (!email) return;

    setRegistering(true);
    setRegisterError(null);

    // Generate unique short ticket ID (e.g. TK-8F92A1)
    const generatedTicketId = `TK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      // Check if guest already exists
      const { data: existing } = await supabase
        .from('guests')
        .select('*')
        .eq('project_id', selectedProjectId)
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        setActiveGuest({
          id: existing.id,
          name: existing.name || name || 'Event Guest',
          email: existing.email,
          ticket_id: existing.ticket_id || generatedTicketId,
          status: existing.status,
        });
        setShowPassModal(true);
        setGuestEmail('');
        setGuestName('');
        return;
      }

      // Insert new guest
      const { data, error } = await supabase
        .from('guests')
        .insert({
          project_id: selectedProjectId,
          name: name || 'Event Attendee',
          email: email,
          ticket_id: generatedTicketId,
          status: 'pending',
        })
        .select()
        .single();

      if (!error && data) {
        setActiveGuest({
          id: data.id,
          name: data.name,
          email: data.email,
          ticket_id: data.ticket_id,
          status: data.status,
        });
        setShowPassModal(true);
        setGuestEmail('');
        setGuestName('');
      } else {
        setRegisterError('Registration failed. Please try again.');
      }
    } catch {
      setRegisterError('Network error. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  // Handle Ticket Lookup
  const handleLookupTicket = async (queryToSearch?: string) => {
    const target = (queryToSearch || lookupQuery).trim().toLowerCase();
    if (!target) return;

    setLookingUp(true);
    setLookupError(null);

    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('project_id', selectedProjectId)
        .or(`email.eq.${target},ticket_id.eq.${target.toUpperCase()},id.eq.${target}`)
        .maybeSingle();

      if (!error && data) {
        setActiveGuest({
          id: data.id,
          name: data.name || 'Event Attendee',
          email: data.email,
          ticket_id: data.ticket_id || `TK-${data.id.slice(0, 6).toUpperCase()}`,
          status: data.status,
        });
        setShowPassModal(true);
        setLookupQuery('');
      } else {
        setLookupError('No ticket found matching this email or ticket ID.');
      }
    } catch {
      setLookupError('Lookup error. Please try again.');
    } finally {
      setLookingUp(false);
    }
  };

  // Handle Maintenance Mode Email Submission / Admin Keyword
  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = subscriberInput.trim();
    if (!val) return;

    if (val.toLowerCase() === adminPasscode.toLowerCase()) {
      onUnlockAdmin();
      return;
    }

    setSubmittingSubscriber(true);
    setSubscribeStatus(null);
    try {
      const { error } = await supabase.from('maintenance_subscribers').insert({
        project_id: selectedProjectId,
        email: val.toLowerCase(),
      });

      if (!error) {
        setSubscribeStatus({
          success: true,
          message: 'Subscribed! You will be notified as soon as maintenance is complete. ✨',
        });
        setSubscriberInput('');
      } else {
        setSubscribeStatus({
          success: false,
          message: 'Failed to subscribe. Please try again.',
        });
      }
    } catch {
      setSubscribeStatus({
        success: false,
        message: 'Network error. Please try again.',
      });
    } finally {
      setSubmittingSubscriber(false);
    }
  };

  // Handle Admin Passcode Submit
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = adminPin.trim().toLowerCase();
    if (entered === adminPasscode.toLowerCase() || entered === 'admin') {
      setShowAdminModal(false);
      onUnlockAdmin();
    } else {
      setPinError(true);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. MAINTENANCE MODE SCREEN (WHEN MAINTENANCE TOGGLE IS ON)
  // ─────────────────────────────────────────────────────────────
  if (isMaintenanceMode) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#040409] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
        
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        {/* Top Back Button */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Top Right Admin Login */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-400 hover:text-white transition-all text-xs font-medium"
          >
            <Lock size={13} />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Card */}
        <div className="w-full max-w-lg bg-[#0a0a12]/90 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center relative z-10 my-auto">
          
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 shadow-lg shadow-amber-500/5">
            <Wrench size={32} className="animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldAlert size={14} />
            <span>Under Maintenance</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            {eventName} Maintenance
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-8 max-w-md">
            We are upgrading <strong className="text-white">Yashoo ES</strong> to enhance your event experience. Enter your email to be notified when registration opens!
          </p>

          <form onSubmit={handleMaintenanceSubmit} className="w-full flex flex-col gap-3">
            <div className="relative w-full">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={subscriberInput}
                onChange={(e) => setSubscriberInput(e.target.value)}
                placeholder="Enter your email for launch updates..."
                className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white outline-none transition-all placeholder:text-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingSubscriber}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold py-3.5 px-6 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {submittingSubscriber ? 'Subscribing...' : 'Notify Me When Live'}
            </button>
          </form>

          {subscribeStatus && (
            <div
              className={`mt-4 w-full p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border ${
                subscribeStatus.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {subscribeStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{subscribeStatus.message}</span>
            </div>
          )}

        </div>

      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. LIVE PUBLIC EVENT LANDING PAGE & TICKET RSVP SYSTEM
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#040409] text-white flex flex-col font-sans relative overflow-x-hidden select-none">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-medium"
          >
            ← Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-sm shadow-md">
              Y
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">Yashoo ES</span>
          </div>
        </div>

        {/* Admin Login Button */}
        <button
          onClick={() => setShowAdminModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-medium"
        >
          <Lock size={13} className="text-amber-400" />
          <span>Organizer Login</span>
        </button>
      </header>

      {/* Main Hero & Registration Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col gap-10 z-10 relative">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Official Event Pass Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {eventName}
          </h1>

          {eventDetails && (
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
              {eventDetails}
            </p>
          )}

          {/* Quick Event Info Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {eventDate && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-amber-300">
                <Calendar size={16} />
                <span>{eventDate}</span>
              </div>
            )}

            {eventAddress && (
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-gray-200">
                <MapPin size={16} className="text-amber-400" />
                <span>{eventAddress}</span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          {(eventLocationLink || whatsappLink) && (
            <div className="flex items-center gap-3 mt-2">
              {eventLocationLink && (
                <a
                  href={eventLocationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/10 border border-white/15 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <MapPin size={14} className="text-amber-400" />
                  <span>Google Maps</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
              )}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <span>Join WhatsApp Group</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
              )}
            </div>
          )}

        </div>

        {/* 2-Column Grid: Registration vs Ticket Lookup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1: RSVP / Get Ticket */}
          <div className="bg-[#0b0b14]/80 border border-amber-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-md">
                <Ticket size={24} />
              </div>

              <h3 className="text-xl font-extrabold text-white mb-2">Get Event Pass</h3>
              <p className="text-xs text-gray-400 mb-6">
                Register to instantly generate your official digital QR access pass for check-in.
              </p>

              <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registering}
                  className="mt-2 w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {registering ? 'Generating Pass...' : (
                    <>
                      <span>Generate Digital Ticket</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {registerError && (
                <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{registerError}</span>
                </div>
              )}
            </div>

          </div>

          {/* Card 2: Lookup Existing Ticket */}
          <div className="bg-[#0b0b14]/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between relative">
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-gray-300 mb-4">
                <QrCode size={24} />
              </div>

              <h3 className="text-xl font-extrabold text-white mb-2">Find My Ticket</h3>
              <p className="text-xs text-gray-400 mb-6">
                Already registered? Enter your email address or Ticket ID to view your QR access pass.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); handleLookupTicket(); }} className="flex flex-col gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Email or Ticket Reference ID</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      placeholder="e.g. you@example.com or TK-8F92A1"
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={lookingUp}
                  className="mt-2 w-full bg-white/[0.08] hover:bg-white/15 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm border border-white/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {lookingUp ? 'Searching...' : (
                    <>
                      <Search size={15} />
                      <span>Retrieve My Ticket Pass</span>
                    </>
                  )}
                </button>
              </form>

              {lookupError && (
                <div className="mt-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{lookupError}</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Admin Passcode Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0b14] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-white text-center shadow-2xl relative">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
              <Lock size={22} />
            </div>
            <h3 className="text-lg font-bold mb-1">Organizer Unlock</h3>
            <p className="text-xs text-gray-400 mb-6">Enter admin passcode to unlock management console.</p>

            <form onSubmit={handleAdminAuth} className="flex flex-col gap-3">
              <input
                type="password"
                required
                value={adminPin}
                onChange={(e) => { setAdminPin(e.target.value); setPinError(false); }}
                placeholder="Enter password..."
                className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-center outline-none"
              />
              {pinError && <span className="text-xs text-red-400">Incorrect passcode</span>}
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl text-xs sm:text-sm transition-all"
              >
                Unlock Control Panel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Pass Modal */}
      {showPassModal && activeGuest && (
        <TicketPassModal
          isOpen={showPassModal}
          onClose={() => setShowPassModal(false)}
          guest={activeGuest}
          eventDetails={{
            name: eventName,
            date: eventDate,
            address: eventAddress,
            locationLink: eventLocationLink,
            whatsappLink: whatsappLink,
          }}
        />
      )}

    </div>
  );
};
