import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import type { MediaAttachment } from './types';

interface MediaModalProps {
  media: MediaAttachment | null;
  onClose: () => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({ media, onClose }) => {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    // Reset zoom when media changes
    setScale(1);
    setRotation(0);
  }, [media]);

  if (!media) return null;

  const handleDownload = () => {
    if (!media.blobUrl) return;
    const a = document.createElement('a');
    a.href = media.blobUrl;
    a.download = media.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isImageOrSticker = media.mediaType === 'image' || media.mediaType === 'sticker';
  const isVideo = media.mediaType === 'video';
  const isAudio = media.mediaType === 'audio';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md select-none"
        onClick={onClose}
      >
        {/* Top bar controls */}
        <div 
          className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col">
            <span className="text-white text-sm font-semibold truncate max-w-xs sm:max-w-md">
              {media.fileName}
            </span>
            <span className="text-gray-400 text-xs uppercase tracking-wider">
              {media.mediaType} {media.size ? `• ${(media.size / 1024).toFixed(1)} KB` : ''}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isImageOrSticker && (
              <>
                <button
                  type="button"
                  onClick={() => setScale(s => Math.min(3, s + 0.25))}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors"
                  title="Rotate"
                >
                  <RotateCw size={18} />
                </button>
              </>
            )}

            {media.blobUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors"
                title="Download file"
              >
                <Download size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 text-gray-200 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Center content */}
        <div 
          className="flex-1 flex items-center justify-center p-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {isImageOrSticker && media.blobUrl && (
            <motion.img
              src={media.blobUrl}
              alt={media.fileName}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
          )}

          {isVideo && media.blobUrl && (
            <video
              src={media.blobUrl}
              controls
              autoPlay
              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl"
            />
          )}

          {isAudio && media.blobUrl && (
            <div className="bg-[#202c33] p-6 rounded-2xl flex flex-col items-center gap-4 max-w-md w-full shadow-2xl">
              <span className="text-white font-medium">{media.fileName}</span>
              <audio src={media.blobUrl} controls className="w-full" />
            </div>
          )}

          {media.mediaType === 'document' && (
            <div className="bg-[#202c33] p-8 rounded-2xl flex flex-col items-center gap-4 max-w-sm text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold uppercase">
                {media.fileName.split('.').pop()}
              </div>
              <span className="text-white font-medium break-all">{media.fileName}</span>
              {media.blobUrl && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold flex items-center gap-2 shadow-lg transition-colors"
                >
                  <Download size={18} />
                  <span>Download Document</span>
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
