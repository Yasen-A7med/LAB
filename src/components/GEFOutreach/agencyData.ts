import type { Agency } from './types';

export const OUTREACH_MESSAGE_PITCH = `Dear [Agency Name] Team,

Hope you're having a great day.

I am Yasen from the GEF team. On 7 November 2026, we are hosting the GEF International Fashion Show at JW Marriott Cairo under the auspices of the Prime Minister, showcasing 15 international designers.

We are looking to partner with a premier modeling agency in Egypt to supply professional runway models for the show (Fittings: Nov 5–6, Main Show: Nov 7) in exchange for global media coverage, runway photo/video assets, and international exposure.

Can we jump on a brief call today or tomorrow to align?

Best regards,
Yasen
+201128209072`;

export const OUTREACH_EMAIL_SUBJECT = 'Modeling Agency Partnership — GEF Fashion Show 2026 (JW Marriott Cairo)';

export const getEmailBody = (agencyName: string) => `Dear ${agencyName} Management,

I hope you are doing well.

I am Yasen from the GEF team. On 7 November 2026, we are hosting the GEF International Fashion Show at JW Marriott Cairo under the auspices of H.E. Prime Minister Dr. Mostafa Madbouly, featuring 15 international luxury designers from 12 countries.

We are looking to partner with a leading modeling agency in Egypt to supply professional runway models for the showcase (Fittings: Nov 5–6, Main Show: Nov 7).

In return, your agency and talent will receive premier international media exposure, full professional runway photo & video assets, and direct networking with global fashion houses.

Could we schedule a brief call today or tomorrow to discuss collaboration?

Best regards,
Yasen
GEF Team
Phone / WhatsApp: +201128209072
Email: ya3777250@gmail.com
Website: www.globalentrepreneurshipfestival.com`;

export const AGENCIES: Agency[] = [
  {
    id: 1,
    name: 'Pyramids International Group',
    category: 'Event & Fashion Organizer',
    contacts: ['Mohamed El-Sharif (Chairman)', 'Eslam El-Sharif (CEO)', 'Aya Mohamed (Manager)'],
    emails: ['info@pyramidsfair.com', 'nfo@pyramidsfaireg.com'],
    phones: ['+201010040800', '+20225243300', '+20224551177'],
    instagram: '',
    website: 'https://pyramidsfair.com',
    verifiedEmailSent: true
  },
  {
    id: 2,
    name: 'Maison Pyramide',
    category: 'PR & Showroom Management',
    contacts: ['Giulia Alvarez (Co-Founder)', 'Maria Sanchez (Global PR)', 'Laila El-Garem (Showroom)'],
    emails: ['contact@maisonpyramide.com', 'pr@maisonpyramide.com'],
    phones: ['+20227368080'],
    instagram: 'https://www.instagram.com/maisonpyramide/',
    website: 'https://maisonpyramide.com',
    verifiedEmailSent: true
  },
  {
    id: 3,
    name: 'Egyptian Fashion & Design Council (EFDC)',
    category: 'Fashion Council & Governing Body',
    contacts: ['Paul Antaki (President)', 'Marie-Louise Bishara (VP)', 'Susan Sabet (Director)'],
    emails: ['info@the-efdc.com'],
    phones: ['+20227354880'],
    instagram: 'https://www.instagram.com/theegyptianfashioncouncil/',
    website: 'https://the-efdc.com',
    verifiedEmailSent: true
  },
  {
    id: 4,
    name: 'SNAP14',
    category: 'Creative Production Agency',
    contacts: ['Production & Casting Coordination Team'],
    emails: ['hello@snap14.com'],
    phones: [],
    instagram: 'https://www.instagram.com/snapfourteen/',
    website: 'https://snap14.com',
    verifiedEmailSent: true
  },
  {
    id: 5,
    name: 'Tamar Network',
    category: 'International Event Operations',
    contacts: ['Tamar Zaki (Founder)', 'Malak El-Kashif (Partnerships)', 'Sherif Khedr (Operations)'],
    emails: ['info@tamarnetwork.com'],
    phones: [],
    instagram: 'https://www.instagram.com/tamarnetwork/',
    website: 'https://tamarnetwork.com',
    verifiedEmailSent: true
  },
  {
    id: 6,
    name: 'Temraza',
    category: 'Luxury Fashion House',
    contacts: ['Farida Temraz (Founder)', 'Nada El-Sherbini', 'Yara Hassan (PR Lead)'],
    emails: ['info@temraza.com'],
    phones: ['+201000055771'],
    instagram: 'https://www.instagram.com/temraza/',
    website: 'https://temraza.com',
    verifiedEmailSent: true
  },
  {
    id: 7,
    name: 'Kojak Studio',
    category: 'Avant-Garde Fashion House',
    contacts: ['Mohannad Kojak (Founder)', 'Nouran Kojak', 'Salma El-Akkad (PR Lead)'],
    emails: ['info@kojakstudio.com'],
    phones: ['+201002129901'],
    instagram: 'https://www.instagram.com/kojakstudio/',
    website: 'https://kojakstudio.com',
    verifiedEmailSent: true
  },
  {
    id: 8,
    name: 'Maison Yeya',
    category: 'Haute Couture Fashion House',
    contacts: ['Yasmine Yeya (Founder)', 'Karim Yeya (MD)', 'Ines Laroui (Showroom Lead)'],
    emails: ['contact@maisonyeya.com'],
    phones: ['+201222203302'],
    instagram: 'https://www.instagram.com/maisonyeya/',
    website: 'https://maisonyeya.com',
    verifiedEmailSent: true
  },
  {
    id: 9,
    name: 'UNN Model Management',
    category: 'Premier Model Management',
    contacts: ['Iman El Deeb (Founder & CEO)', 'Youssef Ezz El Dean (Regional Booking)', 'Yousra El Deeb (International)'],
    emails: ['booking@unnmodels.com', 'info@unnmodels.com'],
    phones: [],
    instagram: 'https://www.instagram.com/unnmodels/',
    website: 'https://www.unnmodels.com',
    highlight: 'Top Mother Agency in Egypt',
    verifiedEmailSent: true
  },
  {
    id: 10,
    name: 'Néon Model Management',
    category: 'Runway & Campaign Agency',
    contacts: ['Booking & Casting Department'],
    emails: [],
    phones: ['+201050779364'],
    instagram: 'https://www.instagram.com/neon.mngmt/',
    website: '',
    highlight: 'Active WhatsApp Booking Line'
  },
  {
    id: 11,
    name: 'Face to Face Modeling Agency (F2F)',
    category: 'Runway & Pageant Agency',
    contacts: ['Youssef Spahi (Founder & Director)'],
    emails: [],
    phones: ['+201221000326'],
    instagram: 'https://www.facebook.com/facetofaceagency/',
    website: '',
    highlight: 'Cairo Runway Specialist'
  },
  {
    id: 12,
    name: 'Angel Model Management',
    category: 'International & Local Runway',
    contacts: ['Kathrine (Head Booker - Cairo)'],
    emails: ['angelmgmt2021@gmail.com'],
    phones: ['+380950034621', '+380637174169'],
    instagram: 'https://www.instagram.com/angelmodelmanagement/',
    website: 'https://angel-management.com',
    verifiedEmailSent: true
  },
  {
    id: 13,
    name: 'CASTRIX Agency',
    category: 'Talent & Model Casting',
    contacts: ['Model Booking Team'],
    emails: ['info@castrix.agency'],
    phones: [],
    instagram: 'https://www.instagram.com/castrixagency/',
    website: 'https://castrix.agency',
    verifiedEmailSent: true
  },
  {
    id: 14,
    name: 'Maquette Agency',
    category: 'High-Fashion & Commercial',
    contacts: ['Model Booking Department'],
    emails: [],
    phones: [],
    instagram: 'https://www.instagram.com/maquetteagency/',
    website: 'https://itsmaquette.com',
    highlight: 'Direct Web Portal Booking'
  },
  {
    id: 15,
    name: 'Energy Casting & Modeling Agency',
    category: 'Modeling & Event Staffing',
    contacts: ['Casting & Ushering Team'],
    emails: [],
    phones: ['+201147006161', '+201066880111'],
    instagram: 'https://www.facebook.com/Energy.Casting/',
    website: '',
    highlight: 'Mohandeseen / Dokki Office'
  },
  {
    id: 16,
    name: 'Presenza Casting & Modeling',
    category: 'Model & Talent Management',
    contacts: ['Heliopolis Casting Team'],
    emails: [],
    phones: [],
    instagram: 'https://www.instagram.com/presenzaegypt/',
    website: ''
  },
  {
    id: 17,
    name: 'Wee Casting Agency',
    category: 'Commercial & Fashion Casting',
    contacts: ['Casting Direction'],
    emails: [],
    phones: [],
    instagram: 'https://www.instagram.com/weecasting/',
    website: ''
  },
  {
    id: 18,
    name: 'AURA Modeling Academy & Agency',
    category: 'Model Direction & Runway',
    contacts: ['Direction Team'],
    emails: [],
    phones: [],
    instagram: 'https://www.instagram.com/aura.eeg/',
    website: ''
  },
  {
    id: 19,
    name: 'MVSE Modeling Agency',
    category: 'Fresh Faces & High Fashion',
    contacts: ['Talent Scouts'],
    emails: [],
    phones: [],
    instagram: 'https://www.instagram.com/mvse_eg/',
    website: ''
  },
  {
    id: 20,
    name: 'LUJU Modeling Agency',
    category: 'International & Regional Models',
    contacts: ['Booking Desk'],
    emails: [],
    phones: [],
    instagram: 'https://www.instagram.com/lujumodels/',
    website: ''
  },
  {
    id: 21,
    name: 'ZJELL Modeling & Talent',
    category: 'Digital & International Talent',
    contacts: ['Global Partnerships'],
    emails: ['contact@zjell.com'],
    phones: [],
    instagram: 'https://www.instagram.com/zjell_official/',
    website: 'https://zjell.com',
    verifiedEmailSent: true
  }
];
