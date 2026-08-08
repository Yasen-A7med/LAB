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
  Server, 
  RefreshCw,
  AlertCircle,
  Wrench,
  Bell,
  Unlock,
  Lock,
  Download,
  Eye,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  UserPlus,
  Users
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TicketPassModal } from './TicketPassModal';
import { QRCameraScanner } from './QRCameraScanner';
import { PublicEventLanding } from './PublicEventLanding';

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
  name?: string;
  email: string;
  ticket_id?: string;
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

  // Admin Lock state (Scoped to local browser session)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return (
      sessionStorage.getItem('yashoo_es_admin_unlocked') === 'true' ||
      localStorage.getItem('yashoo_es_admin_unlocked') === 'true'
    );
  });

  // Active view tab when unlocked in Admin Mode
  const [activeTab, setActiveTab] = useState<'projects' | 'settings' | 'scanner' | 'guests' | 'subscribers'>('guests');
  
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
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Guests state
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [addingGuest, setAddingGuest] = useState(false);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [guestFilterStatus, setGuestFilterStatus] = useState<'all' | 'pending' | 'checked-in'>('all');

  // Maintenance Subscribers state
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [subscriberSearch, setSubscriberSearch] = useState('');

  // Scanner / Checkin state
  const [scanInput, setScanInput] = useState('');
  const [scanStatus, setScanStatus] = useState<{ success: boolean; message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Active Ticket Pass Modal for specific guest
  const [selectedTicketGuest, setSelectedTicketGuest] = useState<GuestItem | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  // Unlock Admin handler
  const handleUnlockAdmin = () => {
    sessionStorage.setItem('yashoo_es_admin_unlocked', 'true');
    localStorage.setItem('yashoo_es_admin_unlocked', 'true');
    setIsUnlocked(true);
  };

  const handleLockAdmin = () => {
    sessionStorage.removeItem('yashoo_es_admin_unlocked');
    localStorage.removeItem('yashoo_es_admin_unlocked');
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
    if (!confirm('Are you sure you want to delete this project? All associated data will be removed.')) return;
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

        setEventName(map['event_name'] || 'Yashoo ES Conference');
        setEventAddress(map['event_address'] || '');
        setEventDetails(map['event_details'] || '');
        setEventLocationLink(map['event_location_link'] || '');
        setEventDate(map['event_date'] || '');
        setWhatsappLink(map['whatsapp_link'] || '');
        setSheetsId(map['sheets_id'] || '');
        setSmtpHost(map['smtp_host'] || '');
        setSmtpUser(map['smtp_user'] || '');
        setSmtpPass(map['smtp_pass'] || '');
        setIsMaintenanceMode(map['is_maintenance_mode'] === 'true');
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
      { project_id: selectedProjectId, key: 'is_maintenance_mode', value: String(isMaintenanceMode) },
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
    const generatedTicketId = `TK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      const { data, error } = await supabase
        .from('guests')
        .insert({
          project_id: selectedProjectId,
          name: newGuestName.trim() || 'Event Guest',
          email: newGuestEmail.trim().toLowerCase(),
          ticket_id: generatedTicketId,
          status: 'pending',
        })
        .select()
        .single();

      if (!error && data) {
        setGuests((prev) => [data as GuestItem, ...prev]);
        setNewGuestEmail('');
        setNewGuestName('');
      }
    } catch (e) {
      console.warn('Failed adding guest:', e);
    } finally {
      setAddingGuest(false);
    }
  };

  // Delete Guest
  const handleDeleteGuest = async (id: string) => {
    if (!confirm('Remove this guest from the event roster?')) return;
    try {
      const { error } = await supabase.from('guests').delete().eq('id', id);
      if (!error) {
        setGuests((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (e) {
      console.warn('Delete guest error:', e);
    }
  };

  // Handle Check-in / Verification (Accepts QR payload string, Ticket ID, or Email)
  const handleCheckin = async (scannedString: string) => {
    const raw = scannedString.trim();
    if (!raw) return;

    let targetEmailOrId = raw.toLowerCase();

    // Parse JSON payload from QR Pass if scanned
    try {
      if (raw.startsWith('{') && raw.endsWith('}')) {
        const parsed = JSON.parse(raw);
        if (parsed.tId) targetEmailOrId = parsed.tId.toLowerCase();
        else if (parsed.email) targetEmailOrId = parsed.email.toLowerCase();
        else if (parsed.gId) targetEmailOrId = parsed.gId.toLowerCase();
      }
    } catch {
      // Plain text search
    }

    try {
      // Find guest
      const match = guests.find(
        (g) =>
          g.email.toLowerCase() === targetEmailOrId ||
          (g.ticket_id && g.ticket_id.toLowerCase() === targetEmailOrId) ||
          g.id.toLowerCase() === targetEmailOrId
      );

      if (match) {
        if (match.status === 'checked-in') {
          setScanStatus({
            success: false,
            type: 'warning',
            message: `⚠️ ${match.name || match.email} has ALREADY checked in!`,
          });
          return;
        }

        // Update database
        const { error } = await supabase
          .from('guests')
          .update({ status: 'checked-in' })
          .eq('id', match.id);

        if (!error) {
          setGuests((prev) =>
            prev.map((g) => (g.id === match.id ? { ...g, status: 'checked-in' } : g))
          );
          setScanStatus({
            success: true,
            type: 'success',
            message: `✅ Check-in Success: ${match.name || match.email} (${match.ticket_id || match.id.slice(0, 8)})`,
          });
          setScanInput('');
        } else {
          setScanStatus({ success: false, type: 'error', message: 'Database update failed.' });
        }
      } else {
        // Fallback search in Supabase if not in local memory state
        const { data } = await supabase
          .from('guests')
          .select('*')
          .eq('project_id', selectedProjectId)
          .or(`email.eq.${targetEmailOrId},ticket_id.eq.${targetEmailOrId.toUpperCase()},id.eq.${targetEmailOrId}`)
          .maybeSingle();

        if (data) {
          if (data.status === 'checked-in') {
            setScanStatus({
              success: false,
              type: 'warning',
              message: `⚠️ ${data.name || data.email} has ALREADY checked in!`,
            });
            return;
          }

          await supabase.from('guests').update({ status: 'checked-in' }).eq('id', data.id);
          setGuests((prev) => [data as GuestItem, ...prev.filter((g) => g.id !== data.id)]);
          setScanStatus({
            success: true,
            type: 'success',
            message: `✅ Check-in Success: ${data.name || data.email}`,
          });
          setScanInput('');
        } else {
          setScanStatus({
            success: false,
            type: 'error',
            message: `❌ Invalid Ticket / Email: "${raw}" not found in roster.`,
          });
        }
      }
    } catch {
      setScanStatus({ success: false, type: 'error', message: 'Verification error occurred.' });
    }
  };

  // Undo Check-in
  const handleUndoCheckin = async (id: string) => {
    try {
      const { error } = await supabase.from('guests').update({ status: 'pending' }).eq('id', id);
      if (!error) {
        setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, status: 'pending' } : g)));
      }
    } catch (e) {
      console.warn('Undo checkin error:', e);
    }
  };

  // Export Guests to CSV File
  const exportGuestsCSV = () => {
    if (guests.length === 0) return;
    const headers = ['Guest ID', 'Name', 'Email', 'Ticket ID', 'Status', 'Created At'];
    const rows = guests.map((g) => [
      g.id,
      `"${(g.name || '').replace(/"/g, '""')}"`,
      g.email,
      g.ticket_id || '',
      g.status,
      g.created_at || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Yashoo_ES_Guests_${selectedProjectName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Subscribers to CSV File
  const exportSubscribersCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ['Subscriber ID', 'Email', 'Created At'];
    const rows = subscribers.map((s) => [s.id, s.email, s.created_at || '']);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Yashoo_ES_Subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  // 🔒 PUBLIC / GUEST EVENT LANDING PAGE (WHEN NOT UNLOCKED IN ADMIN)
  // ─────────────────────────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <PublicEventLanding
        onBack={onBack}
        selectedProjectId={selectedProjectId}
        onUnlockAdmin={handleUnlockAdmin}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 🔓 UNLOCKED FULL YASHOO ES ADMIN OPERATING SYSTEM
  // ─────────────────────────────────────────────────────────────
  const checkedInCount = guests.filter((g) => g.status === 'checked-in').length;
  const pendingCount = guests.length - checkedInCount;
  const checkinPercentage = guests.length > 0 ? Math.round((checkedInCount / guests.length) * 100) : 0;

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.email.toLowerCase().includes(guestSearchQuery.toLowerCase()) ||
      (g.name && g.name.toLowerCase().includes(guestSearchQuery.toLowerCase())) ||
      (g.ticket_id && g.ticket_id.toLowerCase().includes(guestSearchQuery.toLowerCase()));

    if (guestFilterStatus === 'all') return matchesSearch;
    return matchesSearch && g.status === guestFilterStatus;
  });

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  );

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
              </div>
              <span className="text-[11px] text-gray-400 font-medium block truncate max-w-[150px] sm:max-w-xs">
                Project: {selectedProjectName}
              </span>
            </div>
          </div>
        </div>

        {/* View Tabs & Lock Button */}
        <div className="flex items-center gap-2">
          
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] text-xs">
            <button
              onClick={() => setActiveTab('guests')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'guests' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Users size={14} />
              <span>Guests ({guests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'scanner' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-gray-300 hover:text-white'
              }`}
            >
              <QrCode size={14} />
              <span>QR Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'settings' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Wrench size={14} />
              <span>Control Panel</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'projects' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Cpu size={14} />
              <span>Projects</span>
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
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-red-500/20 border border-white/10 text-gray-400 hover:text-red-400 transition-all text-xs"
            title="Lock Admin & Switch to Public View"
          >
            <Lock size={15} />
          </button>
        </div>
      </header>

      {/* ──────────────── Main Content Area ──────────────── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        
        {/* ──── Tab 1: Guest Roster & Ticket Studio ──── */}
        {activeTab === 'guests' && (
          <div className="flex flex-col gap-6">
            
            {/* KPI Counter Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl p-4 flex flex-col">
                <span className="text-xs text-gray-400 font-medium">Total Attendees</span>
                <span className="text-2xl font-extrabold text-white mt-1">{guests.length}</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col">
                <span className="text-xs text-emerald-400 font-medium">Checked-In</span>
                <span className="text-2xl font-extrabold text-emerald-400 mt-1">{checkedInCount}</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col">
                <span className="text-xs text-amber-400 font-medium">Pending Access</span>
                <span className="text-2xl font-extrabold text-amber-400 mt-1">{pendingCount}</span>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 flex flex-col">
                <span className="text-xs text-purple-400 font-medium">Turnout Rate</span>
                <span className="text-2xl font-extrabold text-purple-300 mt-1">{checkinPercentage}%</span>
              </div>
            </div>

            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Search & Status Filters */}
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={guestSearchQuery}
                    onChange={(e) => setGuestSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or ticket ID..."
                    className="w-full bg-[#0b0b14]/80 border border-white/10 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  />
                </div>

                <select
                  value={guestFilterStatus}
                  onChange={(e) => setGuestFilterStatus(e.target.value as 'all' | 'pending' | 'checked-in')}
                  className="bg-[#0b0b14]/80 border border-white/10 text-xs sm:text-sm text-gray-200 rounded-xl px-3 py-2.5 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="checked-in">Checked-In</option>
                </select>
              </div>

              {/* Action Buttons: Export CSV + Add Guest */}
              <div className="flex items-center gap-2">
                <button
                  onClick={exportGuestsCSV}
                  disabled={guests.length === 0}
                  className="px-3.5 py-2.5 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
                >
                  <Download size={15} />
                  <span>Export CSV</span>
                </button>

                {/* Add Guest Form inline */}
                <form onSubmit={handleAddGuest} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="Guest Name..."
                    className="bg-[#0b0b14]/80 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none w-28 sm:w-36"
                  />
                  <input
                    type="email"
                    required
                    value={newGuestEmail}
                    onChange={(e) => setNewGuestEmail(e.target.value)}
                    placeholder="Email..."
                    className="bg-[#0b0b14]/80 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none w-32 sm:w-44"
                  />
                  <button
                    type="submit"
                    disabled={addingGuest}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1 shrink-0"
                  >
                    <UserPlus size={15} />
                    <span>Add</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Roster Table */}
            <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
              {loadingGuests ? (
                <div className="py-12 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin" /> Loading attendees...
                </div>
              ) : filteredGuests.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">No guests found in roster.</div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {filteredGuests.map((g) => (
                    <div key={g.id} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                      
                      {/* Name & Email & Ticket ID */}
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          g.status === 'checked-in' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.04] text-amber-400 border border-white/10'
                        }`}>
                          {g.name ? g.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-white block">{g.name || 'Event Attendee'}</span>
                          <span className="text-[11px] text-gray-400 font-mono block">{g.email}</span>
                        </div>
                      </div>

                      {/* Ticket Code */}
                      <div className="font-mono text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
                        {g.ticket_id || `TK-${g.id.slice(0, 6).toUpperCase()}`}
                      </div>

                      {/* Status & Action Buttons */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            g.status === 'checked-in'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}
                        >
                          {g.status}
                        </span>

                        {/* View Ticket QR Pass */}
                        <button
                          onClick={() => {
                            setSelectedTicketGuest(g);
                            setShowPassModal(true);
                          }}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>Pass</span>
                        </button>

                        {/* Check-in Toggle */}
                        {g.status === 'pending' ? (
                          <button
                            onClick={() => handleCheckin(g.email)}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <ShieldCheck size={13} />
                            <span>Check-in</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUndoCheckin(g.id)}
                            className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-gray-400 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Undo
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteGuest(g.id)}
                          className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                          title="Remove guest"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ──── Tab 2: Live QR Camera Scanner ──── */}
        {activeTab === 'scanner' && (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            
            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0b0b14]/70 border border-white/10 rounded-2xl p-4 text-center">
                <span className="text-xs text-gray-400 block mb-1">Roster</span>
                <span className="text-xl font-extrabold text-white">{guests.length}</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <span className="text-xs text-emerald-400 block mb-1">Checked In</span>
                <span className="text-xl font-extrabold text-emerald-400">{checkedInCount}</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
                <span className="text-xs text-amber-400 block mb-1">Pending</span>
                <span className="text-xl font-extrabold text-amber-400">{pendingCount}</span>
              </div>
            </div>

            {/* Live Camera Viewfinder */}
            <div className="bg-[#0b0b14]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-white font-extrabold text-base mb-1">
                <QrCode size={20} className="text-amber-400" />
                <span>Live Camera Ticket Scanner</span>
              </div>

              <QRCameraScanner
                isActive={activeTab === 'scanner'}
                onScanSuccess={(code) => handleCheckin(code)}
              />

              {/* Status Alert Toast */}
              {scanStatus && (
                <div
                  className={`mt-2 w-full p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border ${
                    scanStatus.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : scanStatus.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  {scanStatus.type === 'success' ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  <span>{scanStatus.message}</span>
                </div>
              )}
            </div>

            {/* Manual Verification Search Box */}
            <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Manual Email or Ticket ID Verification
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheckin(scanInput);
                  }}
                  placeholder="Enter guest email or TK-XXXXXX ticket ID..."
                  className="flex-1 bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                />
                <button
                  onClick={() => handleCheckin(scanInput)}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shrink-0"
                >
                  Verify & Check-in
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ──── Tab 3: Control Panel / Event Settings ──── */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-6 max-w-4xl mx-auto">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Event Control Panel</h2>
                <p className="text-xs text-gray-400">Configure public portal & maintenance parameters for {selectedProjectName}</p>
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

            {/* Maintenance Mode Toggle Card */}
            <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Wrench size={16} className="text-amber-400" />
                  <span>Maintenance Mode Status</span>
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  When enabled, public visitors see the &quot;System Under Maintenance&quot; page instead of the Live Event RSVP Portal.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMaintenanceMode((prev) => !prev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  isMaintenanceMode
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                }`}
              >
                {isMaintenanceMode ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                <span>{isMaintenanceMode ? 'Maintenance ENABLED' : 'Live Event RSVP OPEN'}</span>
              </button>
            </div>

            {/* Event Info Group */}
            <div className="bg-[#0b0b14]/70 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Calendar size={14} /> Event Metadata & Public Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Event Name</label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Yashoo Annual Tech Summit 2026"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Event Date & Time</label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="e.g. September 25, 2026 • 10:00 AM"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Event Address / Venue</label>
                <input
                  type="text"
                  value={eventAddress}
                  onChange={(e) => setEventAddress(e.target.value)}
                  placeholder="e.g. Cairo Grand Convention Center, Hall 4"
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Event Description & Public Instructions</label>
                <textarea
                  value={eventDetails}
                  onChange={(e) => setEventDetails(e.target.value)}
                  rows={3}
                  placeholder="Event schedule, dress code, speaker line-up, special announcements..."
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Google Maps Location Link</label>
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
                <Server size={14} /> Integrations & Email Credentials
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
                    placeholder="organizer@domain.com"
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
                <label className="text-xs text-gray-400 block mb-1">Google Sheets Document Sync ID</label>
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

        {/* ──── Tab 4: Projects Management ──── */}
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
                All Event Projects ({projects.length})
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
                            isSelected ? 'bg-amber-500 text-black font-bold' : 'bg-white/[0.04] text-gray-400'
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
                              Active
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

        {/* ──── Tab 5: Maintenance Subscribers Roster ──── */}
        {activeTab === 'subscribers' && (
          <div className="flex flex-col gap-6">
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">Maintenance Subscribers Roster</h2>
                <p className="text-xs text-gray-400">List of emails collected during maintenance mode notification signups.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportSubscribersCSV}
                  disabled={subscribers.length === 0}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={fetchSubscribers}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5"
                >
                  <RefreshCw size={14} className={loadingSubscribers ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
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

      {/* Ticket Pass Modal for Roster View */}
      {showPassModal && selectedTicketGuest && (
        <TicketPassModal
          isOpen={showPassModal}
          onClose={() => {
            setShowPassModal(false);
            setSelectedTicketGuest(null);
          }}
          guest={selectedTicketGuest}
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

export default YashooOSApp;
