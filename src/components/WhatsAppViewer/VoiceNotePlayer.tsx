import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

interface VoiceNotePlayerProps {
  src?: string;
  fileName: string;
  isOutgoing?: boolean;
  theme?: 'dark' | 'light';
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  src,
  fileName,
  isOutgoing = false,
  theme = 'dark',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  // Generate pseudo-random bar heights from fileName for consistent waveform look
  const barHeights = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < fileName.length; i++) {
      hash = (hash << 5) - hash + fileName.charCodeAt(i);
      hash |= 0;
    }
    const bars: number[] = [];
    const barCount = 28;
    for (let i = 0; i < barCount; i++) {
      const pseudoVal = Math.abs(Math.sin((hash + i * 13) * 0.45));
      const height = Math.floor(6 + pseudoVal * 18); // 6px to 24px
      bars.push(height);
    }
    return bars;
  }, [fileName]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio play prevented:', e);
        setHasError(true);
      });
    }
  };

  const handleSpeedChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current || !duration || !audioRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-1 px-1 min-w-[240px] max-w-[320px] select-none">
      {src && (
        <audio ref={audioRef} src={src} preload="metadata" />
      )}

      {/* Mic Avatar with Indicator */}
      <div className="relative shrink-0">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
          isOutgoing
            ? theme === 'dark' ? 'bg-[#00a884]/20 text-[#00a884]' : 'bg-[#008069]/20 text-[#008069]'
            : theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'
        }`}>
          <Mic size={20} className={isPlaying ? 'animate-pulse text-[#00a884]' : ''} />
        </div>
        
        {/* Play/Pause overlay button */}
        <button
          type="button"
          onClick={togglePlay}
          disabled={hasError || !src}
          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md ${
            isOutgoing
              ? 'bg-[#00a884] text-white'
              : 'bg-[#00a884] text-white'
          }`}
          title={isPlaying ? 'Pause' : 'Play voice note'}
        >
          {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} className="ml-0.5" fill="currentColor" />}
        </button>
      </div>

      {/* Audio Waveform and Time Controller */}
      <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
        {/* Interactive Waveform */}
        <div
          ref={waveformRef}
          onClick={handleSeek}
          className="h-7 flex items-center gap-[2.5px] cursor-pointer relative py-1"
          title="Click to seek"
        >
          {barHeights.map((h, idx) => {
            const barProgress = (idx / barHeights.length) * 100;
            const isPlayed = barProgress <= progressPercent;

            return (
              <span
                key={idx}
                style={{ height: `${h}px` }}
                className={`w-[3px] rounded-full transition-colors ${
                  isPlayed
                    ? theme === 'dark' ? 'bg-[#00a884]' : 'bg-[#008069]'
                    : theme === 'dark' ? 'bg-gray-500/40' : 'bg-gray-400/40'
                }`}
              />
            );
          })}
        </div>

        {/* Time and Speed */}
        <div className="flex items-center justify-between text-[11px] font-medium leading-none px-0.5">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {hasError ? 'Audio unavailable' : isPlaying ? formatTime(currentTime) : (duration > 0 ? formatTime(duration) : 'Voice note')}
          </span>

          {src && !hasError && (
            <button
              type="button"
              onClick={handleSpeedChange}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                  : 'bg-black/10 hover:bg-black/20 text-gray-700'
              }`}
              title="Change playback speed"
            >
              {playbackRate}x
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
