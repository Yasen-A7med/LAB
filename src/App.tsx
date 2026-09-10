import React, { Suspense } from 'react';
import Dashboard from './components/Dashboard';
import { LabMaintenanceGuard } from './components/LabMaintenanceGuard';
import { AppLoadingFallback } from './components/AppLoadingFallback';
import { useNavigation } from './hooks/useNavigation';
import { useProxyWorker } from './hooks/useProxyWorker';

/**
 * ===========================================================================================
 * 🚨 MANDATORY SYSTEM CONSTITUTION & MAINTENANCE GUARD FOR YASHOO LAB 🚨
 * ===========================================================================================
 * CRITICAL WARNING FOR ANTIGRAVITY AI AGENT:
 * DO NOT REMOVE, BYPASS, OR ALTER THE LabMaintenanceGuard COMPONENT WRAPPER BELOW UNDER
 * ANY CIRCUMSTANCES UNLESS THE USER GIVES AN EXPLICIT DIRECT COMMAND STATING:
 * "REMOVE THE LOCK" / "DISABLE MAINTENANCE MODE".
 * ===========================================================================================
 */

// Code-split heavy sub-applications to optimize initial landing page load
const Proxy = React.lazy(() => import('./components/Proxy'));
const Thanawya = React.lazy(() => import('./components/Thanawya'));
const DynamicQRStudio = React.lazy(() => 
  import('./components/DynamicQR/DynamicQRStudio').then(m => ({ default: m.DynamicQRStudio }))
);
const RedirectHandler = React.lazy(() => 
  import('./components/DynamicQR/RedirectHandler').then(m => ({ default: m.RedirectHandler }))
);
const YashooOSApp = React.lazy(() => import('./components/YashooOS/YashooOSApp'));
const YDApp = React.lazy(() => import('./components/YD/YDApp'));
const WhatsAppViewerApp = React.lazy(() => import('./components/WhatsAppViewer/WhatsAppViewerApp'));
const CertificateAutomatorApp = React.lazy(() => import('./components/CA/CertificateAutomatorApp'));

const App: React.FC = () => {
  const { currentView, handleBack, launchProject } = useNavigation();
  const { swRegistered, transportType, serverUrl, updateTransportConfig } = useProxyWorker();

  return (
    <Suspense fallback={<AppLoadingFallback />}>
      {currentView === 'dashboard' && (
        <Dashboard 
          onLaunch={launchProject} 
          swRegistered={swRegistered} 
        />
      )}
      {currentView === 'ca' && (
        <CertificateAutomatorApp
          onBack={handleBack}
        />
      )}
      {currentView === 'whatsapp' && (
        <WhatsAppViewerApp 
          onBack={handleBack} 
        />
      )}
      {currentView === 'proxy' && (
        <Proxy 
          onBack={handleBack} 
          transportType={transportType}
          serverUrl={serverUrl}
          onUpdateConfig={updateTransportConfig}
        />
      )}
      {currentView === 'thanawya' && (
        <Thanawya 
          onBack={handleBack}
        />
      )}
      {currentView === 'qr' && (
        <DynamicQRStudio
          onBack={handleBack}
        />
      )}
      {currentView === 'yd' && (
        <YDApp
          onBack={handleBack}
        />
      )}
      {currentView === 'yashoo-es' && (
        <LabMaintenanceGuard onBack={handleBack}>
          <YashooOSApp onBack={handleBack} />
        </LabMaintenanceGuard>
      )}
      {currentView === 'redirect' && (
        <RedirectHandler
          onBack={handleBack}
        />
      )}
    </Suspense>
  );
};

export default App;
