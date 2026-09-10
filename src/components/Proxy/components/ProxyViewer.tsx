import React, { useRef } from 'react';
import { Bug, Settings, X } from 'lucide-react';

interface ProxyViewerProps {
  url: string;
  proxyUrl: string;
  onClose: () => void;
  onOpenDebug: () => void;
  onOpenSettings: () => void;
}

export const ProxyViewer: React.FC<ProxyViewerProps> = ({
  url,
  proxyUrl,
  onClose,
  onOpenDebug,
  onOpenSettings
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-50 flex flex-col">
      <div className="bg-[#0a0a0a] border-b border-[#00f2ff]/20 px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden min-w-0 flex-1">
          <span className="text-[#00f2ff] font-bold text-xs sm:text-sm truncate">
            {url}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={onOpenDebug}
            className="p-2.5 sm:p-2 hover:bg-yellow-500/10 active:bg-yellow-500/10 rounded-full transition-colors text-gray-400 hover:text-yellow-400 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            title="Diagnostics"
          >
            <Bug size={18} />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2.5 sm:p-2 hover:bg-white/10 active:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            title="Proxy Settings"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 sm:p-2 hover:bg-white/10 active:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            title="Close Proxy"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        src={proxyUrl}
        className="flex-1 w-full border-none bg-white"
        title="Proxy Content"
      />
    </div>
  );
};
