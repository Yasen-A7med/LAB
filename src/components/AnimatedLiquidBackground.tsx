import React from 'react';

export const AnimatedLiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030305] select-none">
      {/* SVG Liquid Filter - Enabled on desktop only for performance */}
      <svg className="hidden md:block absolute w-0 h-0">
        <defs>
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="25" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Hardware-Accelerated Fluid Blobs Container */}
      <div className="absolute inset-0 w-full h-full opacity-40 sm:opacity-60 md:[filter:url(#liquid-goo)]">
        {/* Blob 1 - Cyan / Sky */}
        <div 
          className="absolute -top-[10%] -left-[10%] w-[80vw] sm:w-[50vw] h-[80vw] sm:h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-br from-cyan-500/35 via-sky-500/25 to-indigo-600/25 blur-[35px] sm:blur-[50px] animate-liquid-blob-1" 
        />

        {/* Blob 2 - Violet / Purple */}
        <div 
          className="absolute -bottom-[10%] -right-[10%] w-[85vw] sm:w-[55vw] h-[85vw] sm:h-[55vw] max-w-[550px] max-h-[550px] rounded-full bg-gradient-to-tl from-violet-600/35 via-purple-500/25 to-fuchsia-600/25 blur-[40px] sm:blur-[60px] animate-liquid-blob-2" 
        />

        {/* Blob 3 - Indigo Flow (Center-right) */}
        <div 
          className="absolute top-[35%] right-[15%] w-[60vw] sm:w-[35vw] h-[60vw] sm:h-[35vw] max-w-[400px] max-h-[400px] rounded-full bg-gradient-to-r from-indigo-500/30 to-fuchsia-500/20 blur-[30px] sm:blur-[45px] animate-liquid-blob-3" 
        />
      </div>

      {/* Soft Vignette Overlay for Crisp Contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030305_95%)] pointer-events-none opacity-90" />
    </div>
  );
};

export default AnimatedLiquidBackground;
