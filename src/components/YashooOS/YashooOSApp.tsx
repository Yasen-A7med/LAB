import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Unlock, 
  Wifi, 
  WifiOff, 
  Users, 
  Calendar, 
  QrCode, 
  Cpu, 
  Bell 
} from 'lucide-react';
import type { 
  ProjectItem, 
  GuestItem, 
  SubscriberItem, 
  EventSettings, 
  YashooOSTab 
} from './types';
import { 
  DEFAULT_PROJECT_ID, 
  fetchProjects, 
  createProject, 
  deleteProject, 
  fetchSettings, 
  saveSettings, 
  fetchGuests, 
  addGuest, 
  deleteGuest, 
  updateGuestStatus, 
  fetchSubscribers 
} from './services/eventService';
import { ProjectSelector } from './components/ProjectSelector';
import { EventSettingsForm } from './components/EventSettingsForm';
import { GuestManager } from './components/GuestManager';
import { SubscribersList } from './components/SubscribersList';
import { ScannerTab } from './components/ScannerTab';

interface YashooOSAppProps {
  onBack: () => void;
}

export const YashooOSApp: React.FC<YashooOSAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<YashooOSTab>('guests');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Projects state
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(DEFAULT_PROJECT_ID);
  const [selectedProjectName, setSelectedProjectName] = useState<string>('Yashoo ES Main');
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Event Settings state
  const [settings, setSettings] = useState<EventSettings>({
    eventName: 'Yashoo ES Main',
    eventAddress: '',
    eventDetails: '',
    eventLocationLink: '',
    eventDate: '',
    whatsappLink: '',
    sheetsId: '',
    smtpHost: '',
    smtpUser: '',
    smtpPass: '',
  });
  const [adminPasscode, setAdminPasscode] = useState('admin');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(true);

  // Guests state
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load Projects
  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    const data = await fetchProjects();
    setProjects(data);
    const current = data.find((p) => p.id === selectedProjectId);
    if (current) {
      setSelectedProjectName(current.name);
    } else if (data.length > 0) {
      setSelectedProjectId(data[0].id);
      setSelectedProjectName(data[0].name);
    }
    setLoadingProjects(false);
  }, [selectedProjectId]);

  // Load Settings & Guests for selected project
  const loadProjectDetails = useCallback(async (projId: string) => {
    const { settings: loadedSettings, adminPasscode: passcode, isMaintenanceMode: maintenance } = await fetchSettings(projId);
    setSettings(loadedSettings);
    setAdminPasscode(passcode);
    setIsMaintenanceMode(maintenance);

    setLoadingGuests(true);
    const loadedGuests = await fetchGuests(projId);
    setGuests(loadedGuests);
    setLoadingGuests(false);
  }, []);

  // Load Subscribers
  const loadSubscribers = useCallback(async () => {
    setLoadingSubscribers(true);
    const data = await fetchSubscribers();
    setSubscribers(data);
    setLoadingSubscribers(false);
  }, []);

  useEffect(() => {
    loadProjects();
    loadSubscribers();
  }, [loadProjects, loadSubscribers]);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);
    }
  }, [selectedProjectId, loadProjectDetails]);

  // Auto-sync polling every 5s for live multi-gate checkin
  useEffect(() => {
    if (!selectedProjectId || !autoRefresh) return;
    const interval = setInterval(async () => {
      const refreshed = await fetchGuests(selectedProjectId);
      setGuests(refreshed);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedProjectId, autoRefresh]);

  // Project Handlers
  const handleSelectProject = (p: ProjectItem) => {
    setSelectedProjectId(p.id);
    setSelectedProjectName(p.name);
  };

  const handleCreateProject = async (name: string) => {
    const p = await createProject(name);
    if (p) {
      setProjects((prev) => [p, ...prev]);
      setSelectedProjectId(p.id);
      setSelectedProjectName(p.name);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const ok = await deleteProject(id);
    if (ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProjectId === id && projects.length > 1) {
        const next = projects.find((p) => p.id !== id);
        if (next) {
          setSelectedProjectId(next.id);
          setSelectedProjectName(next.name);
        }
      }
    }
  };

  // Settings Handler
  const handleSaveSettings = async (newSettings: EventSettings, passcode: string, maintenanceMode: boolean) => {
    const ok = await saveSettings(selectedProjectId, newSettings, passcode, maintenanceMode);
    if (ok) {
      setSettings(newSettings);
      setAdminPasscode(passcode);
      setIsMaintenanceMode(maintenanceMode);
    }
    return ok;
  };

  // Guest Handlers
  const handleAddGuest = async (email: string, name: string) => {
    const newGuest = await addGuest(selectedProjectId, email, name);
    if (newGuest) {
      setGuests((prev) => [newGuest, ...prev]);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    const ok = await deleteGuest(id);
    if (ok) {
      setGuests((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleUndoCheckin = async (id: string) => {
    const ok = await updateGuestStatus(id, 'pending');
    if (ok) {
      setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, status: 'pending' } : g)));
    }
  };

  const handleCheckin = async (scannedText: string): Promise<{ success: boolean; message: string }> => {
    const raw = scannedText.trim();
    if (!raw) return { success: false, message: 'Empty ticket code.' };

    let target = raw.toLowerCase();
    try {
      if (raw.startsWith('{') && raw.endsWith('}')) {
        const parsed = JSON.parse(raw);
        if (parsed.tId) target = parsed.tId.toLowerCase();
        else if (parsed.email) target = parsed.email.toLowerCase();
        else if (parsed.gId) target = parsed.gId.toLowerCase();
      }
    } catch {
      // Plain text search
    }

    const match = guests.find(
      (g) =>
        g.email.toLowerCase() === target ||
        (g.ticket_id && g.ticket_id.toLowerCase() === target) ||
        g.id.toLowerCase() === target
    );

    if (match) {
      if (match.status === 'checked-in') {
        return { success: false, message: `⚠️ ${match.name || match.email} has ALREADY checked in!` };
      }
      await updateGuestStatus(match.id, 'checked-in');
      setGuests((prev) => prev.map((g) => (g.id === match.id ? { ...g, status: 'checked-in' } : g)));
      return { success: true, message: `✅ Checked in: ${match.name || match.email}` };
    }

    return { success: false, message: `❌ Ticket not found: "${raw}"` };
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#050509] text-white flex flex-col font-sans select-none">
      {/* ──────────────── Top Navigation Bar ──────────────── */}
      <header className="border-b border-white/[0.08] bg-[#08080e]/90 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-medium min-h-[38px]"
          >
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </button>

          <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400 font-extrabold text-sm shadow-md shrink-0">
              Y
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">Yashoo ES</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Unlock size={10} /> Admin OS
                </span>
                
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                  isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                }`}>
                  {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                  <span>{isOnline ? 'Live' : 'Offline'}</span>
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium block truncate max-w-[150px] sm:max-w-xs">
                Project: {selectedProjectName}
              </span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] text-xs">
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'guests' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users size={13} />
            <span>Guests ({guests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'scanner' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <QrCode size={13} />
            <span>Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar size={13} />
            <span>Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'projects' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Cpu size={13} />
            <span>Projects ({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'subscribers' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-amber-400 hover:text-white'
            }`}
          >
            <Bell size={13} />
            <span>Subscribers ({subscribers.length})</span>
          </button>
        </div>
      </header>

      {/* ──────────────── Main Content Area ──────────────── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {activeTab === 'guests' && (
          <GuestManager
            guests={guests}
            loading={loadingGuests}
            autoRefresh={autoRefresh}
            eventName={settings.eventName}
            eventDate={settings.eventDate}
            eventAddress={settings.eventAddress}
            onToggleAutoRefresh={() => setAutoRefresh((prev) => !prev)}
            onAddGuest={handleAddGuest}
            onDeleteGuest={handleDeleteGuest}
            onCheckin={handleCheckin}
            onUndoCheckin={handleUndoCheckin}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerTab
            guests={guests}
            onCheckin={handleCheckin}
          />
        )}

        {activeTab === 'settings' && (
          <EventSettingsForm
            projectName={selectedProjectName}
            initialSettings={settings}
            initialAdminPasscode={adminPasscode}
            initialMaintenanceMode={isMaintenanceMode}
            onSave={handleSaveSettings}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            loading={loadingProjects}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {activeTab === 'subscribers' && (
          <SubscribersList
            subscribers={subscribers}
            loading={loadingSubscribers}
            onRefresh={loadSubscribers}
          />
        )}
      </main>
    </div>
  );
};

export default YashooOSApp;
