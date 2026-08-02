import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Cpu, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  QrCode, 
  Search, 
  Calendar, 
  Mail, 
  Server, 
  RefreshCw,
  AlertCircle,
  Wrench,
  Bell,
  Lock,
  Unlock,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface YashooOSAppProps {
  onBack: () => void;
}

interface ProjectItem {
  id: string;
  name: string;
  created_at: string;
}

interface GuestItem {
  id: string;
  project_id: string;
  email: string;
  status: 'pending' | 'checked-in';
  created_at: string;
}

interface SubscriberItem {
  id: string;
  project_id: string;
  email: string;
  created_at: string;
}

export const YashooOSApp: React.FC<YashooOSAppProps> = ({ onBack }) => {
  const DEFAULT_PROJECT_ID = '13975872-827c-4eea-81e2-0b9dc1ef5ba6';

  // Maintenance & Admin Lock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('yashoo_es_unlocked') === 'true';
  });
  const [subscriberInput, setSubscriberInput] = useState('');
  const [submittingSubscriber, setSubmittingSubscriber] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Active view tab when unlocked
  const [activeTab, setActiveTab] = useState<'projects' | 'settings' | 'scanner' | 'guests' | 'subscribers'>('projects');
  
  // Projects state
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(DEFAULT_PROJECT_ID);
  const [selectedProjectName, setSelectedProjectName] = useState<string>('Yashoo ES Main');
  const [newProjectName, setNewProjectName] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);

  // Settings state for active project
  const [eventName, setEventName] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [eventLocationLink, setEventLocationLink] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [sheetsId, setSheetsId] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Guests state
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [addingGuest, setAddingGuest] = useState(false);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');

  // Maintenance Subscribers state
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [subscriberSearch, setSubscriberSearch] = useState('');

  // Scanner / Checkin state
  const [scanInput, setScanInput] = useState('');
  const [scanStatus, setScanStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Secret Admin Bypass or Email Registration
  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = subscriberInput.trim();
    if (!val) return;

    // Secret Admin Keyword Bypass
    if (val.toLowerCase() === 'admin') {
      localStorage.setItem('yashoo_es_unlocked', 'true');
      setIsUnlocked(true);
      setSubscriberInput('');
      return;
    }

    // Normal User Email Registration
    setSubmittingSubscriber(true);
    setSubscribeStatus(null);
    try {
      const { error } = await supabase
        .from('maintenance_subscribers')
        .insert({
          project_id: 'yashoo-es',
          email: val.toLowerCase(),
        });

      if (!error) {
        setSubscribeStatus({
          success: true,
          message: 'Your email has been subscribed! You will be notified once maintenance is complete. ✨',
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

  const handleLockAdmin = () => {
    localStorage.removeItem('yashoo_es_unlocked');
    setIsUnlocked(false);
  };

  // Fetch Projects from Supabase
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProjects(data);
        const match = data.find((p) => p.id === selectedProjectId);
        if (match) {
          setSelectedProjectName(match.name);
        } else if (data.length > 0) {
          setSelectedProjectId(data[0].id);
          setSelectedProjectName(data[0].name);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch projects:', e);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch Subscribers for Admin
  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSubscribers(data as SubscriberItem[]);
      }
    } catch (e) {
      console.warn('Failed to fetch subscribers:', e);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  // Create Project in Supabase
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreatingProject(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({ name: newProjectName.trim() })
        .select()
        .single();

      if (!error && data) {
        setProjects((prev) => [data, ...prev]);
        setSelectedProjectId(data.id);
        setSelectedProjectName(data.name);
        setNewProjectName('');
      }
    } catch (e) {
      console.warn('Create project failed:', e);
    } finally {
      setCreatingProject(false);
    }
  };

  // Delete Project from Supabase
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (!error) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (selectedProjectId === id && projects.length > 1) {
          const next = projects.find((p) => p.id !== id);
          if (next) {
            setSelectedProjectId(next.id);
            setSelectedProjectName(next.name);
          }
        }
      }
    } catch (e) {
      console.warn('Delete project error:', e);
    }
  };

  // Fetch Settings for Selected Project
  const fetchSettings = async (projId: string) => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .eq('project_id', projId);

      if (!error && data) {
        const map: Record<string, string> = {};
        data.forEach((item) => {
          map[item.key] = item.value;
        });

        setEventName(map['event_name'] || '');
        setEventAddress(map['event_address'] || '');
        setEventDetails(map['event_details'] || '');
        setEventLocationLink(map['event_location_link'] || '');
        setEventDate(map['event_date'] || '');
        setWhatsappLink(map['whatsapp_link'] || '');
        setSheetsId(map['sheets_id'] || '');
        setSmtpHost(map['smtp_host'] || '');
        setSmtpUser(map['smtp_user'] || '');
        setSmtpPass(map['smtp_pass'] || '');
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
  };

  // Save Settings to Supabase
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveSuccess(false);

    const payload = [
      { project_id: selectedProjectId, key: 'event_name', value: eventName },
      { project_id: selectedProjectId, key: 'event_address', value: eventAddress },
      { project_id: selectedProjectId, key: 'event_details', value: eventDetails },
      { project_id: selectedProjectId, key: 'event_location_link', value: eventLocationLink },
      { project_id: selectedProjectId, key: 'event_date', value: eventDate },
      { project_id: selectedProjectId, key: 'whatsapp_link', value: whatsappLink },
      { project_id: selectedProjectId, key: 'sheets_id', value: sheetsId },
      { project_id: selectedProjectId, key: 'smtp_host', value: smtpHost },
      { project_id: selectedProjectId, key: 'smtp_user', value: smtpUser },
      { project_id: selectedProjectId, key: 'smtp_pass', value: smtpPass },
    ];

    try {
      const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'project_id,key' });
      if (!error) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (e) {
      console.warn('Save settings error:', e);
    } finally {
      setSavingSettings(false);
    }
  };

  // Fetch Guests for Active Project
  const fetchGuests = async (projId: string) => {
    setLoadingGuests(true);
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('project_id', projId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setGuests(data as GuestItem[]);
      }
    } catch (e) {
      console.warn('Failed fetching guests:', e);
    } finally {
      setLoadingGuests(false);
    }
  };

  // Add Guest
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestEmail.trim()) return;

    setAddingGuest(true);
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert({
          project_id: selectedProjectId,
          email: newGuestEmail.trim().toLowerCase(),
          status: 'pending',
        })
        .select()
        .single();

      if (!error && data) {
        setGuests((prev) => [data as GuestItem, ...prev]);
        setNewGuestEmail('');
      }
    } catch (e) {
      console.warn('Failed adding guest:', e);
    } finally {
      setAddingGuest(false);
    }
  };

  // Handle Manual Check-in
  const handleCheckin = async (emailOrId: string) => {
    const target = emailOrId.trim().toLowerCase();
    if (!target) return;

    try {
      const { data, error } = await supabase
        .from('guests')
        .update({ status: 'checked-in' })
        .eq('project_id', selectedProjectId)
        .or(`id.eq.${target},email.eq.${target}`)
        .select();

      if (!error && data && data.length > 0) {
        setGuests((prev) =>
          prev.map((g) => (g.email === target || g.id === target ? { ...g, status: 'checked-in' } : g))
        );
        setScanStatus({ success: true, message: `Checked in successfully: ${target}` });
        setScanInput('');
      } else {
        setScanStatus({ success: false, message: `Guest not found: ${target}` });
      }
    } catch (e) {
      setScanStatus({ success: false, message: 'Check-in error.' });
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchProjects();
      fetchSubscribers();
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (isUnlocked && selectedProjectId) {
      fetchSettings(selectedProjectId);
      fetchGuests(selectedProjectId);
    }
  }, [isUnlocked, selectedProjectId]);

  // ─────────────────────────────────────────────────────────────
  // 🔒 MAINTENANCE MODE SCREEN (WHEN NOT UNLOCKED)
  // ─────────────────────────────────────────────────────────────
  if (!isUnlocked) {
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

        {/* Maintenance Card */}
        <div className="w-full max-w-lg bg-[#0a0a12]/90 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center relative z-10 my-auto">
          
          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 shadow-lg shadow-amber-500/5">
            <Wrench size={32} className="animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldAlert size={14} />
            <span>Under Maintenance</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            System Under Maintenance
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-8 max-w-md">
            We are currently upgrading and optimizing <strong className="text-white">Yashoo ES</strong> services to deliver the best experience. Enter your email to be notified as soon as maintenance is complete.
          </p>

          {/* Email Registration / Secret Unlock Form */}
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
  }

  // ─────────────────────────────────────────────────────────────
  // 🔓 UNLOCKED FULL YASHOO ES APPLICATION (ADMIN MODE)
  // ─────────────────────────────────────────────────────────────
  const checkedInCount = guests.filter((g) => g.status === 'checked-in').length;
  const pendingCount = guests.length - checkedInCount;

  const filteredGuests = guests.filter((g) =>
    g.email.toLowerCase().includes(guestSearchQuery.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#050509] text-white flex flex-col font-sans select-none">
      
      {/* ──────────────── Top Navigation Bar ──────────────── */}
      <header className="border-b border-white/[0.08] bg-[#08080e]/90 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-medium min-h-[40px]"
          >
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </button>

          <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl border border-white/15 overflow-hidden shadow-lg shrink-0 bg-black/40">
              <img src="/Logo.png" alt="Yashoo Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">Yashoo ES</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Unlock size={10} /> Admin
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium block truncate max-w-[150px] sm:max-w-xs">
                Active: {selectedProjectName}
              </span>
            </div>
          </div>
        </div>

        {/* View Tabs & Lock Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] text-xs">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'projects' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'settings' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Control Panel
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'scanner' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Scanner
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'guests' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Guests ({guests.length})
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

          <button
            onClick={handleLockAdmin}
            title="Lock Maintenance Mode 🔒"
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors text-xs font-semibold flex items-center gap-1"
          >
            <Lock size={15} />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </header>

      {/* ──────────────── Main Content Area ──────────────── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        
        {/* ──── Tab 1: Projects Management ──── */}
        {activeTab === 'projects' && (
          <div className="flex flex-col gap-6">
            
            {/* Create Project Card */}
            <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Create Event Project</h3>
                <p className="text-xs text-gray-400">Initialize a new project environment for attendance & certificate management.</p>
              </div>

              <form onSubmit={handleCreateProject} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project / Event Name..."
                  className="bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Plus size={16} />
                  <span>Create</span>
                </button>
              </form>
            </div>

            {/* Projects List */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                All Projects ({projects.length})
              </span>

              {loadingProjects ? (
                <div className="py-12 flex justify-center items-center text-gray-500 text-sm">
                  <RefreshCw size={18} className="animate-spin mr-2" />
                  Loading projects...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((p) => {
                    const isSelected = p.id === selectedProjectId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setSelectedProjectName(p.name);
                        }}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/40 text-white'
                            : 'bg-[#0b0b14]/50 border-white/10 hover:border-white/20 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-amber-500 text-black' : 'bg-white/[0.04] text-gray-400'
                          }`}>
                            <Cpu size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{p.name}</h4>
                            <span className="text-[11px] text-gray-400 font-mono block">ID: {p.id.slice(0, 8)}...</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-400 px-2.5 py-1 rounded-full border border-amber-400/30">
                              Selected
                            </span>
                          )}
                          {p.id !== DEFAULT_PROJECT_ID && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(p.id);
                              }}
                              className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                              title="Delete project"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ──── Tab 2: Control Panel / Settings ──── */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-6 max-w-4xl mx-auto">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Event Control Panel</h2>
                <p className="text-xs text-gray-400">Configure parameters for {selectedProjectName}</p>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg min-h-[40px]"
              >
                {savingSettings ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
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
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Yashoo Annual Conference 2026"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Event Date</label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="e.g. 2026-09-15"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Event Address / Location</label>
                <input
                  type="text"
                  value={eventAddress}
                  onChange={(e) => setEventAddress(e.target.value)}
                  placeholder="e.g. Cairo Grand Convention Center"
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Event Description & Notes</label>
                <textarea
                  value={eventDetails}
                  onChange={(e) => setEventDetails(e.target.value)}
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
                    value={eventLocationLink}
                    onChange={(e) => setEventLocationLink(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">WhatsApp Group Link</label>
                  <input
                    type="text"
                    value={whatsappLink}
                    onChange={(e) => setWhatsappLink(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  />
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
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">SMTP User / Email</label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">SMTP App Password</label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Google Sheets Sync ID</label>
                <input
                  type="text"
                  value={sheetsId}
                  onChange={(e) => setSheetsId(e.target.value)}
                  placeholder="Google Sheets Document ID..."
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                />
              </div>
            </div>

          </form>
        )}

        {/* ──── Tab 3: Attendance Scanner ──── */}
        {activeTab === 'scanner' && (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            
            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#0b0b14]/70 border border-white/10 rounded-2xl p-4 text-center">
                <span className="text-xs text-gray-400 block mb-1">Total Guests</span>
                <span className="text-2xl font-extrabold text-white">{guests.length}</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <span className="text-xs text-emerald-400 block mb-1">Checked In</span>
                <span className="text-2xl font-extrabold text-emerald-400">{checkedInCount}</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
                <span className="text-xs text-amber-400 block mb-1">Pending</span>
                <span className="text-2xl font-extrabold text-amber-400">{pendingCount}</span>
              </div>
            </div>

            {/* Checkin Input Box */}
            <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <QrCode size={20} className="text-amber-400" />
                <h3 className="text-lg font-bold text-white">QR & Email Ticket Verification</h3>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheckin(scanInput);
                  }}
                  placeholder="Enter Guest Email or Ticket ID..."
                  className="flex-1 bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
                <button
                  onClick={() => handleCheckin(scanInput)}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shrink-0"
                >
                  Verify & Check-in
                </button>
              </div>

              {scanStatus && (
                <div
                  className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    scanStatus.success
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}
                >
                  {scanStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{scanStatus.message}</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ──── Tab 4: Guests Management ──── */}
        {activeTab === 'guests' && (
          <div className="flex flex-col gap-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={guestSearchQuery}
                  onChange={(e) => setGuestSearchQuery(e.target.value)}
                  placeholder="Filter guests by email..."
                  className="w-full bg-[#0b0b14]/80 border border-white/10 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              {/* Add Guest Form */}
              <form onSubmit={handleAddGuest} className="flex items-center gap-2">
                <input
                  type="email"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className="bg-[#0b0b14]/80 border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={addingGuest}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1 shrink-0"
                >
                  <Plus size={16} />
                  <span>Add Guest</span>
                </button>
              </form>
            </div>

            {/* Guest List Table */}
            <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
              {loadingGuests ? (
                <div className="py-12 text-center text-gray-500 text-xs">Loading guest roster...</div>
              ) : filteredGuests.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">No guests found.</div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {filteredGuests.map((g) => (
                    <div key={g.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-gray-500" />
                        <div>
                          <span className="font-semibold text-xs sm:text-sm text-white block">{g.email}</span>
                          <span className="text-[10px] text-gray-500 font-mono">ID: {g.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            g.status === 'checked-in'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}
                        >
                          {g.status}
                        </span>

                        {g.status === 'pending' && (
                          <button
                            onClick={() => handleCheckin(g.email)}
                            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Check-in
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ──── Tab 5: Maintenance Subscribers (Admin Roster) ──── */}
        {activeTab === 'subscribers' && (
          <div className="flex flex-col gap-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Maintenance Subscribers</h2>
                <p className="text-xs text-gray-400">List of subscriber emails collected during maintenance mode.</p>
              </div>

              <button
                onClick={fetchSubscribers}
                className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={loadingSubscribers ? 'animate-spin' : ''} />
                <span>Refresh List</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                placeholder="Filter subscribers by email..."
                className="w-full bg-[#0b0b14]/80 border border-white/10 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none"
              />
            </div>

            {/* Subscribers Table */}
            <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
              {loadingSubscribers ? (
                <div className="py-12 text-center text-gray-500 text-xs">Loading subscribers...</div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">No subscribers registered yet.</div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {filteredSubscribers.map((s) => (
                    <div key={s.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <UserCheck size={18} className="text-amber-400" />
                        <div>
                          <span className="font-semibold text-xs sm:text-sm text-white block">{s.email}</span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Subscribed: {new Date(s.created_at).toLocaleString('en-US')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(s.email);
                          alert(`Copied email: ${s.email}`);
                        }}
                        className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Copy Email
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default YashooOSApp;
