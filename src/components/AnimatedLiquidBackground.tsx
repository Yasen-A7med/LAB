import React from 'react';

export const AnimatedLiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030305]">
      {/* SVG Liquid Filter for Gooey / Liquid Blending */}
      <svg className="hidden">
        <defs>
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Fluid Liquid Orbs Container with SVG goo filter */}
      <div 
        className="absolute inset-0 w-full h-full opacity-65 sm:opacity-75"
        style={{ filter: 'url(#liquid-goo)' }}
      >
        {/* Liquid Blob 1 - Cyan / Sky */}
        <div className="absolute top-[10%] left-[15%] w-[65vw] sm:w-[45vw] h-[65vw] sm:h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-r from-cyan-500/40 via-sky-500/30 to-blue-600/30 blur-[40px] animate-liquid-blob-1" />

        {/* Liquid Blob 2 - Violet / Purple */}
        <div className="absolute bottom-[15%] right-[10%] w-[70vw] sm:w-[50vw] h-[70vw] sm:h-[50vw] max-w-[550px] max-h-[550px] rounded-full bg-gradient-to-r from-violet-600/40 via-purple-500/30 to-fuchsia-600/30 blur-[40px] animate-liquid-blob-2" />

        {/* Liquid Blob 3 - Indigo / Magenta */}
        <div className="absolute top-[40%] right-[30%] w-[55vw] sm:w-[35vw] h-[55vw] sm:h-[35vw] max-w-[400px] max-h-[400px] rounded-full bg-gradient-to-r from-indigo-500/35 via-fuchsia-500/25 to-pink-500/25 blur-[35px] animate-liquid-blob-3" />

        {/* Liquid Blob 4 - Deep Electric Cyan (Center Flow) */}
        <div className="absolute bottom-[30%] left-[20%] w-[50vw] sm:w-[30vw] h-[50vw] sm:h-[30vw] max-w-[350px] max-h-[350px] rounded-full bg-gradient-to-tr from-sky-400/30 to-emerald-500/20 blur-[35px] animate-liquid-blob-4" />
      </div>

      {/* Radial Vignette Overlay for Depth & Contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030305_90%)] pointer-events-none opacity-80" />
    </div>
  );
};

export default AnimatedLiquidBackground;
