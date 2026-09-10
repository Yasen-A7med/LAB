/**
 * Client & User-Agent Device Metadata Detection
 * Provides unified device categorization (Desktop, Mobile, Tablet) and browser/OS identification.
 */

export interface DeviceMetadata {
  device_type: 'Mobile' | 'Desktop' | 'Tablet';
  browser: string;
  os: string;
  isMobile: boolean;
}

/**
 * Multi-vector detection for mobile devices (User-Agent, client hints, touch screen, viewport).
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
  const mobileUaRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|fennec|minimo|symbian|psp|smartphone/i;
  const isUaMobile = mobileUaRegex.test(ua);
  const isUaDataMobile = (navigator as unknown as { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile === true;
  const isSmallScreen = window.innerWidth < 768;
  const hasCoarseTouchOnly = 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
    window.matchMedia('(pointer: coarse)').matches;
  const isMobileTouchScreen = navigator.maxTouchPoints > 0 && (window.innerWidth < 1024 && window.innerHeight > window.innerWidth);

  return isUaMobile || isUaDataMobile || (isSmallScreen && hasCoarseTouchOnly) || isMobileTouchScreen;
}

/**
 * Parses raw user-agent string into structured device metadata.
 */
export function parseUserAgentString(uaString = ''): DeviceMetadata {
  let device_type: 'Mobile' | 'Desktop' | 'Tablet' = 'Desktop';
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(uaString)) {
    device_type = 'Tablet';
  } else if (/Mobile|iPhone|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(uaString)) {
    device_type = 'Mobile';
  }

  let browser = 'Chrome';
  if (/Edg|Edge/i.test(uaString)) browser = 'Edge';
  else if (/Firefox/i.test(uaString)) browser = 'Firefox';
  else if (/SamsungBrowser/i.test(uaString)) browser = 'Samsung';
  else if (/OPR|Opera/i.test(uaString)) browser = 'Opera';
  else if (/Chrome|CriOS/i.test(uaString)) browser = 'Chrome';
  else if (/Safari/i.test(uaString)) browser = 'Safari';

  let os = 'Windows';
  if (/Win/i.test(uaString)) os = 'Windows';
  else if (/Mac/i.test(uaString)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(uaString)) os = 'iOS';
  else if (/Android/i.test(uaString)) os = 'Android';
  else if (/Linux/i.test(uaString)) os = 'Linux';

  const isMobile = device_type === 'Mobile' || isMobileDevice();

  return { device_type, browser, os, isMobile };
}

/**
 * Detects current browser device metadata using window.navigator.
 */
export function detectDevice(): DeviceMetadata {
  if (typeof window === 'undefined' || !navigator) {
    return { device_type: 'Desktop', browser: 'Chrome', os: 'Windows', isMobile: false };
  }
  return parseUserAgentString(navigator.userAgent);
}

