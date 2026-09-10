export const COMPANION_URL = 'http://localhost:8765';

export const isValidYouTubeUrl = (url: string): boolean => {
  return /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url.trim());
};

export const extractYouTubeVideoId = (url: string): string | null => {
  const match = url.trim().match(/(?:v=|\/shorts\/|\/embed\/|youtu\.be\/|\/v\/|\/e\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

export const triggerNativeDownload = (url: string): void => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 120000);
};
