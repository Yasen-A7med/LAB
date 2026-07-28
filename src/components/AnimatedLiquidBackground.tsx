import React from 'react';

export const AnimatedLiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050508] select-none">
      {/* Soft Ambient Fluid Lighting - Ultra subtle, non-distracting */}
      <div className="absolute inset-0 w-full h-full opacity-30 sm:opacity-40">
        {/* Soft Blue/Cyan Ambient Aura */}
        <div 
          className="absolute -top-[20%] left-[20%] w-[60vw] sm:w-[40vw] h-[60vw] sm:h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-600/15 blur-[80px] sm:blur-[120px] animate-liquid-blob-1" 
        />

        {/* Soft Purple/Violet Ambient Aura */}
        <div 
          className="absolute -bottom-[20%] right-[15%] w-[65vw] sm:w-[45vw] h-[65vw] sm:h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-gradient-to-tl from-violet-600/20 to-fuchsia-600/15 blur-[90px] sm:blur-[130px] animate-liquid-blob-2" 
        />
      </div>

      {/* Subtle Radial Gradient Vignette for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050508_90%)] pointer-events-none opacity-90" />
    </div>
  );
};

export default AnimatedLiquidBackground;
