import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function Logo({ size = 60, className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="relative shrink-0 flex items-center justify-center rounded-full overflow-hidden" 
        style={{ width: size, height: size }}
      >
        {/* Glow Effect behind the image */}
        <div 
          className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse"
          style={{ backgroundColor: "var(--color-gaming-accent)" }}
        />
        
        {/* The Original Logo Image - Masked to Circle */}
        <img 
          src="/logo.png" 
          alt="Console Zone Logo" 
          className="relative z-10 w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image isn't found yet
            e.currentTarget.src = "https://ui-avatars.com/api/?name=CZ&background=080112&color=B000FF";
          }}
        />
      </div>

      {showText && (
        <div className="flex items-center gap-2 font-black italic tracking-tighter text-3xl">
          <span className="text-white uppercase">CONSOLE</span>
          <span style={{ color: "var(--color-gaming-accent)" }} className="uppercase drop-shadow-[0_0_8px_var(--color-gaming-accent)]">ZONE</span>
        </div>
      )}
    </div>
  );
}
