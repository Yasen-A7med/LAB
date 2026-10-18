export type OutreachStatus = 
  | 'To Contact' 
  | 'Contacted' 
  | 'In Discussion' 
  | 'Agreed' 
  | 'Declined';

export type TargetCategory = 
  | 'Catwalk Academy & Runway Training'
  | 'Boutique Modeling Agency'
  | 'Casting Agency & Talent Hub'
  | 'Industry Organizer & Council'
  | 'Designer Brand PR & Referral';

export interface TargetEntity {
  id: string;
  name: string;
  category: TargetCategory;
  contact_person: string;
  location: string;
  instagram: string;
  instagram_profile_url: string;
  instagram_dm_url: string;
  phone_raw: string;
  phone_clean: string;
  whatsapp_link: string;
  email: string;
  mailto_link: string;
  website: string;
  strategic_notes: string;
  template_a_dm_whatsapp: string;
  template_b_email_subject: string;
  template_b_email_body: string;
  status: OutreachStatus;
  date_contacted?: string;
  response_received?: string;
  follow_up_notes: string;
}

export type CategoryFilter = 'ALL' | TargetCategory;
