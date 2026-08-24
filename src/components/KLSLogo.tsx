import React from 'react';

interface KLSLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const KLSLogo: React.FC<KLSLogoProps> = ({ size = 'md', showTagline = false, className = '' }) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10', text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-sm' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl', sub: 'text-base' },
  };

  const current = sizeMap[size];

  return (
    <div id="kls-brand-logo" className={`flex items-center gap-3 ${className}`}>
      {/* Shield + Camera/AI Concept Vector Icon */}
      <div className={`relative ${current.icon} flex-shrink-0 flex items-center justify-center`}>
        {/* Outer Shield Frame with glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-red-500/10 to-blue-600/20 rounded-xl blur-[2px]" />
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shield Boundary */}
          <path
            d="M50 8L88 22V52C88 74 72 90 50 96C28 90 12 74 12 52V22L50 8Z"
            fill="#090d16"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Security Core */}
          <path
            d="M50 16L78 27V50C78 68 66 81 50 86C34 81 22 68 22 50V27L50 16Z"
            fill="#0f172a"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.85"
          />
          {/* AI Neural Optical Lens / Camera Aperture */}
          <circle cx="50" cy="48" r="16" stroke="#38bdf8" strokeWidth="2.5" />
          <circle cx="50" cy="48" r="9" fill="#0284c7" />
          <circle cx="50" cy="48" r="4" fill="#ffffff" />
          {/* Crosshairs & Target Bounding Reticle */}
          <path d="M50 26V32M50 64V70M28 48H34M66 48H72" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          {/* Shield Accent Lines */}
          <path d="M42 40L38 36M58 40L62 36M42 56L38 60M58 56L62 60" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        {/* Short Badge Tag */}
        <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-red-600 to-amber-600 text-[8px] font-black tracking-widest text-white px-1 py-0.5 rounded shadow">
          KLS
        </span>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-wider text-slate-100 uppercase ${current.text}`}>
            KRISHNA <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-400 to-sky-400">LAB SOLUTIONS</span>
          </span>
        </div>
        {showTagline ? (
          <span className={`font-medium tracking-normal text-slate-400 ${current.sub}`}>
            Smart AI Surveillance for Safer Spaces
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Weapon Detection System
          </span>
        )}
      </div>
    </div>
  );
};
