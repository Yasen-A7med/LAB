import { useState, useEffect, useCallback } from 'react';
import { type AppView, getViewFromPath, getPathFromView } from '../types/routes';

interface UseNavigationReturn {
  currentView: AppView;
  navigate: (view: AppView, newTab?: boolean) => void;
  handleBack: () => void;
  launchProject: (id: string) => void;
}

export function useNavigation(): UseNavigationReturn {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    return getViewFromPath(window.location.pathname);
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getViewFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((view: AppView, newTab = false) => {
    const path = getPathFromView(view);
    if (newTab) {
      window.open(path, '_blank');
      return;
    }
    window.history.pushState({}, '', path);
    setCurrentView(view);
  }, []);

  const handleBack = useCallback(() => {
    window.history.pushState({}, '', '/');
    setCurrentView('dashboard');
  }, []);

  const launchProject = useCallback((id: string) => {
    if (id === 'proxy') {
      window.open('/proxy', '_blank');
    } else if (id === 'thanawya') {
      window.open('/thanawya', '_blank');
    } else if (id === 'qr') {
      navigate('qr');
    } else if (id === 'yd') {
      navigate('yd');
    } else if (id === 'whatsapp') {
      navigate('whatsapp');
    } else if (id === 'ca') {
      navigate('ca');
    } else if (id === 'yashoo-es') {
      navigate('yashoo-es');
    }
  }, [navigate]);

  return {
    currentView,
    navigate,
    handleBack,
    launchProject,
  };
}
