import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wrench, ShieldAlert, Mail, RefreshCw, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * ===========================================================================================
 * 🚨 CRITICAL SYSTEM SECURITY & MAINTENANCE GUARD (YASHOO LAB CONSTITUTION) 🚨
 * ===========================================================================================
 * WARNING FOR ANTIGRAVITY AI AGENT & ALL DEVELOPERS:
 * 
 * IT IS STRICTLY AND ABSOLUTELY FORBIDDEN TO REMOVE, BYPASS, OR ALTER THIS MAINTENANCE GUARD
 * UNLESS THE USER GIVES AN EXPLICIT DIRECT INSTRUCTION WITH CLEAR WORDS STATING:
 * "REMOVE THE LOCK" OR "DISABLE MAINTENANCE MODE".
 * 
 * UNDER ANY OTHER CIRCUMSTANCE OR REQUEST, THIS GUARD MUST REMAIN 100% ACTIVE AND STRICTLY
 * LOCKED BY DEFAULT ON EVERY PAGE REFRESH AND BROWSER SESSION.
 * ===========================================================================================
 */

interface LabMaintenanceGuardProps {
  onBack: () => void;
  children: React.ReactNode;
}

export const LabMaintenanceGuard: React.FC<LabMaintenanceGuardProps> = ({ onBack, children }) => {
  // Admin Lock state: ALWAYS starts LOCKED (false) on every page load
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [subscriberInput, setSubscriberInput] = useState('');
  const [submittingSubscriber, setSubmittingSubscriber] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Clear any legacy persistent storage keys on mount
  useEffect(() => {
    sessionStorage.removeItem('lab_system_admin_unlocked');
    localStorage.removeItem('lab_system_admin_unlocked');
    sessionStorage.removeItem('yashoo_es_admin_unlocked');
    localStorage.removeItem('yashoo_es_admin_unlocked');
  }, []);

  // Handle Maintenance Email Submission / Admin Keyword Unlock
  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = subscriberInput.trim();
    if (!val) return;

    // Secret Admin Keyword Unlock (Strictly transient in React memory)
    if (val.toLowerCase() === 'admin') {
      setIsUnlocked(true);
      setSubscriberInput('');
      return;
    }

    // Normal Visitor Email Registration
    setSubmittingSubscriber(true);
    setSubscribeStatus(null);
    try {
      const { error } = await supabase
        .from('maintenance_subscribers')
        .insert({
          project_id: 'yashoo-lab-system',
          email: val.toLowerCase(),
        });

      if (!error) {
        setSubscribeStatus({
          success: true,
          message: 'Your email has been registered! You will be notified as soon as maintenance is complete. ✨',
        });
        setSubscriberInput('');
      } else {
        setSubscribeStatus({
          success: false,
          message: 'Failed to save email. Please try again.',
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

  // If unlocked for this active view session, render the inner application
  if (isUnlocked) {
    return <>{children}</>;
  }

  // DEFAULT VIEW: System Under Maintenance Screen
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#040409] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-medium"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Maintenance / System Disabled Card */}
      <div className="w-full max-w-lg bg-[#0a0a12]/90 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center relative z-10 my-auto">
        
        {/* Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 shadow-lg shadow-amber-500/5">
          <Wrench size={32} className="animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldAlert size={14} />
          <span>System Under Maintenance</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          System Under Maintenance
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-8 max-w-md">
          We are currently upgrading and optimizing services to deliver the best experience. Enter your email to be notified as soon as maintenance is complete.
        </p>

        {/* Email Registration / Secret Admin Password Form */}
        <form onSubmit={handleMaintenanceSubmit} className="w-full flex flex-col gap-3">
          <div className="relative w-full">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={subscriberInput}
              onChange={(e) => setSubscriberInput(e.target.value)}
              placeholder="Enter your email to get notified..."
              className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white outline-none transition-all placeholder:text-gray-500 text-left"
            />
          </div>

          <button
            type="submit"
            disabled={submittingSubscriber}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold py-3.5 px-6 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {submittingSubscriber ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <>
                <Bell size={18} />
                <span>Notify Me When Fixed</span>
              </>
            )}
          </button>
        </form>

        {/* Status Message Toast */}
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
};
