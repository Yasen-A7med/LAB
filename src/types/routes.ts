/**
 * Centralized Route & View Type Definitions for Yashoo LAB
 * Eliminates magic path strings across App, Dashboard, and Handlers.
 */

export type AppView = 
  | 'dashboard'
  | 'proxy'
  | 'thanawya'
  | 'qr'
  | 'yd'
  | 'whatsapp'
  | 'ca'
  | 'yashoo-es'
  | 'redirect';

export const ROUTES: Record<string, AppView> = {
  '/': 'dashboard',
  '/proxy': 'proxy',
  '/thanawya': 'thanawya',
  '/qr': 'qr',
  '/yd': 'yd',
  '/whatsapp': 'whatsapp',
  '/chat': 'whatsapp',
  '/ca': 'ca',
  '/certificate': 'ca',
  '/yashoo-es': 'yashoo-es',
  '/es': 'yashoo-es',
  '/yashoo-os': 'yashoo-es',
  '/os': 'yashoo-es',
} as const;

export function getViewFromPath(pathname: string): AppView {
  if (pathname.startsWith('/r/')) {
    return 'redirect';
  }
  return ROUTES[pathname] || 'dashboard';
}

export function getPathFromView(view: AppView): string {
  switch (view) {
    case 'proxy': return '/proxy';
    case 'thanawya': return '/thanawya';
    case 'qr': return '/qr';
    case 'yd': return '/yd';
    case 'whatsapp': return '/whatsapp';
    case 'ca': return '/ca';
    case 'yashoo-es': return '/yashoo-es';
    case 'redirect': return '/r';
    case 'dashboard':
    default:
      return '/';
  }
}
