import React, { useState, useEffect } from 'react';
import { Calendar, Server, KeyRound, ShieldAlert, CheckCircle2, Save, RefreshCw } from 'lucide-react';
import type { EventSettings } from '../types';

interface EventSettingsFormProps {
  projectName: string;
  initialSettings: EventSettings;
  initialAdminPasscode: string;
  initialMaintenanceMode: boolean;
  onSave: (settings: EventSettings, passcode: string, maintenanceMode: boolean) => Promise<boolean>;
}

export const EventSettingsForm: React.FC<EventSettingsFormProps> = ({
  projectName,
  initialSettings,
  initialAdminPasscode,
  initialMaintenanceMode,
  onSave,
}) => {
  const [settings, setSettings] = useState<EventSettings>(initialSettings);
  const [adminPasscode, setAdminPasscode] = useState(initialAdminPasscode);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(initialMaintenanceMode);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
    setAdminPasscode(initialAdminPasscode);
    setIsMaintenanceMode(initialMaintenanceMode);
  }, [initialSettings, initialAdminPasscode, initialMaintenanceMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const ok = await onSave(settings, adminPasscode, isMaintenanceMode);
    setSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const updateField = (field: keyof EventSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Event Control Panel</h2>
          <p className="text-xs text-gray-400">Configure parameters for {projectName}</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg min-h-[40px] disabled:opacity-50"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{saveSuccess ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Event settings saved successfully!</span>
        </div>
      )}

      {/* Event Info Group */}
      <div className="bg-[#0b0b14]/70 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Calendar size={14} /> Event Details
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Event Name</label>
            <input
              type="text"
              value={settings.eventName}
              onChange={(e) => updateField('eventName', e.target.value)}
              placeholder="e.g. Yashoo Annual Conference 2026"
              className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Event Date</label>
            <input
              type="text"
              value={settings.eventDate}
              onChange={(e) => updateField('eventDate', e.target.value)}
              placeholder="e.g. 2026-09-15"
              className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Event Address / Location</label>
          <input
            type="text"
            value={settings.eventAddress}
            onChange={(e) => updateField('eventAddress', e.target.value)}
            placeholder="e.g. Cairo Grand Convention Center"
            className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Event Description & Notes</label>
          <textarea
            value={settings.eventDetails}
            onChange={(e) => updateField('eventDetails', e.target.value)}
            rows={3}
            placeholder="Event instructions, dress code, schedule..."
            className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Location Map Link</label>
            <input
              type="text"
              value={settings.eventLocationLink}
              onChange={(e) => updateField('eventLocationLink', e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">WhatsApp Group Link</label>
            <input
              type="text"
              value={settings.whatsappLink}
              onChange={(e) => updateField('whatsappLink', e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Security & Maintenance Mode Control */}
      <div className="bg-[#0b0b14]/70 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <KeyRound size={14} /> Security & System Gates
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Admin Passcode Bypass</label>
            <input
              type="text"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              placeholder="admin"
              className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none font-mono"
            />
          </div>

          <div className="flex flex-col justify-between">
            <label className="text-xs text-gray-400 block mb-1">Public Event Registration Mode</label>
            <button
              type="button"
              onClick={() => setIsMaintenanceMode((prev) => !prev)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                isMaintenanceMode
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldAlert size={15} />
                <span>{isMaintenanceMode ? 'Maintenance Lock Active' : 'Public Access Open'}</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider">
                {isMaintenanceMode ? 'Locked' : 'Open'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Integration Group */}
      <div className="bg-[#0b0b14]/70 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Server size={14} /> Integrations & SMTP Config
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">SMTP Host</label>
            <input
              type="text"
              value={settings.smtpHost}
              onChange={(e) => updateField('smtpHost', e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">SMTP User / Email</label>
            <input
              type="text"
              value={settings.smtpUser}
              onChange={(e) => updateField('smtpUser', e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">SMTP App Password</label>
            <input
              type="password"
              value={settings.smtpPass}
              onChange={(e) => updateField('smtpPass', e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Google Sheets Sync ID</label>
          <input
            type="text"
            value={settings.sheetsId}
            onChange={(e) => updateField('sheetsId', e.target.value)}
            placeholder="Google Sheets Document ID..."
            className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
          />
        </div>
      </div>
    </form>
  );
};
