/**
 * Yashoo ES Event Service
 * Encapsulates Supabase cloud data layer for projects, guests, settings, and subscribers.
 */

import { supabase } from '../../../lib/supabase';
import type { ProjectItem, GuestItem, SubscriberItem, EventSettings } from '../types';

export const DEFAULT_PROJECT_ID = '13975872-827c-4eea-81e2-0b9dc1ef5ba6';

/**
 * Projects CRUD
 */
export async function fetchProjects(): Promise<ProjectItem[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      localStorage.setItem('yashoo_es_cached_projects', JSON.stringify(data));
      return data as unknown as ProjectItem[];
    }
  } catch {
    // Fallback to cache
  }

  const cached = localStorage.getItem('yashoo_es_cached_projects');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignore JSON parse error
    }
  }
  return [];
}

export async function createProject(name: string): Promise<ProjectItem | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: name.trim() })
      .select()
      .single();

    if (!error && data) {
      return data as unknown as ProjectItem;
    }
  } catch (err) {
    console.warn('Failed to create project:', err);
  }
  return null;
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.warn('Failed to delete project:', err);
    return false;
  }
}

/**
 * Settings CRUD
 */
export async function fetchSettings(projectId: string): Promise<{ settings: EventSettings; adminPasscode: string; isMaintenanceMode: boolean }> {
  const defaultRes = {
    settings: {
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
    },
    adminPasscode: 'admin',
    isMaintenanceMode: true,
  };

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .eq('project_id', projectId);

    if (!error && data) {
      const map: Record<string, string> = {};
      data.forEach((item: { key: string; value: string }) => {
        map[item.key] = item.value;
      });

      localStorage.setItem(`yashoo_es_cached_settings_${projectId}`, JSON.stringify(map));

      return {
        settings: {
          eventName: map['event_name'] || 'Yashoo ES Main',
          eventAddress: map['event_address'] || '',
          eventDetails: map['event_details'] || '',
          eventLocationLink: map['event_location_link'] || '',
          eventDate: map['event_date'] || '',
          whatsappLink: map['whatsapp_link'] || '',
          sheetsId: map['sheets_id'] || '',
          smtpHost: map['smtp_host'] || '',
          smtpUser: map['smtp_user'] || '',
          smtpPass: map['smtp_pass'] || '',
        },
        adminPasscode: map['admin_passcode'] || 'admin',
        isMaintenanceMode: map['is_maintenance_mode'] !== 'false',
      };
    }
  } catch {
    // Fallback to cache
  }

  const cached = localStorage.getItem(`yashoo_es_cached_settings_${projectId}`);
  if (cached) {
    try {
      const map = JSON.parse(cached);
      return {
        settings: {
          ...defaultRes.settings,
          eventName: map['event_name'] || defaultRes.settings.eventName,
          eventAddress: map['event_address'] || '',
        },
        adminPasscode: map['admin_passcode'] || 'admin',
        isMaintenanceMode: map['is_maintenance_mode'] !== 'false',
      };
    } catch {
      // Ignore error
    }
  }

  return defaultRes;
}

export async function saveSettings(
  projectId: string,
  settings: EventSettings,
  adminPasscode: string,
  isMaintenanceMode: boolean
): Promise<boolean> {
  const payload = [
    { project_id: projectId, key: 'event_name', value: settings.eventName },
    { project_id: projectId, key: 'event_address', value: settings.eventAddress },
    { project_id: projectId, key: 'event_details', value: settings.eventDetails },
    { project_id: projectId, key: 'event_location_link', value: settings.eventLocationLink },
    { project_id: projectId, key: 'event_date', value: settings.eventDate },
    { project_id: projectId, key: 'whatsapp_link', value: settings.whatsappLink },
    { project_id: projectId, key: 'sheets_id', value: settings.sheetsId },
    { project_id: projectId, key: 'smtp_host', value: settings.smtpHost },
    { project_id: projectId, key: 'smtp_user', value: settings.smtpUser },
    { project_id: projectId, key: 'smtp_pass', value: settings.smtpPass },
    { project_id: projectId, key: 'admin_passcode', value: adminPasscode.trim() || 'admin' },
    { project_id: projectId, key: 'is_maintenance_mode', value: String(isMaintenanceMode) },
  ];

  try {
    const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'project_id,key' });
    return !error;
  } catch (err) {
    console.warn('Save settings error:', err);
    return false;
  }
}

/**
 * Guests CRUD & Check-in
 */
export async function fetchGuests(projectId: string): Promise<GuestItem[]> {
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      localStorage.setItem(`yashoo_es_cached_guests_${projectId}`, JSON.stringify(data));
      return data as unknown as GuestItem[];
    }
  } catch {
    // Cache fallback
  }

  const cached = localStorage.getItem(`yashoo_es_cached_guests_${projectId}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignore
    }
  }
  return [];
}

export async function addGuest(projectId: string, email: string, name = ''): Promise<GuestItem | null> {
  const generatedTicketId = `TK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  try {
    const { data, error } = await supabase
      .from('guests')
      .insert({
        project_id: projectId,
        name: name.trim() || 'Event Guest',
        email: email.trim().toLowerCase(),
        ticket_id: generatedTicketId,
        status: 'pending',
      })
      .select()
      .single();

    if (!error && data) {
      return data as unknown as GuestItem;
    }
  } catch (err) {
    console.warn('Failed adding guest:', err);
  }
  return null;
}

export async function deleteGuest(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('guests').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.warn('Failed deleting guest:', err);
    return false;
  }
}

export async function updateGuestStatus(id: string, status: 'pending' | 'checked-in'): Promise<boolean> {
  try {
    const { error } = await supabase.from('guests').update({ status }).eq('id', id);
    return !error;
  } catch (err) {
    console.warn('Failed updating guest status:', err);
    return false;
  }
}

/**
 * Maintenance Subscribers
 */
export async function fetchSubscribers(): Promise<SubscriberItem[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as unknown as SubscriberItem[];
    }
  } catch (err) {
    console.warn('Failed to fetch subscribers:', err);
  }
  return [];
}
