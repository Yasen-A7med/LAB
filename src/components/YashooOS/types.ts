export interface ProjectItem {
  id: string;
  name: string;
  created_at: string;
}

export interface GuestItem {
  id: string;
  project_id: string;
  name?: string;
  email: string;
  ticket_id?: string;
  status: 'pending' | 'checked-in';
  created_at: string;
}

export interface SubscriberItem {
  id: string;
  project_id: string;
  email: string;
  created_at: string;
}

export interface EventSettings {
  eventName: string;
  eventAddress: string;
  eventDetails: string;
  eventLocationLink: string;
  eventDate: string;
  whatsappLink: string;
  sheetsId: string;
  smtpHost: string;
  smtpUser: string;
  smtpPass: string;
}

export type YashooOSTab = 'projects' | 'settings' | 'scanner' | 'guests' | 'subscribers';
