import { useEffect, useRef, useState } from 'react';
import { AIClientManager } from '@/lib/ai/aiClientManager';

const AI_LOGOS = {
  gemini: {
    name: 'Gemini',
    logo: '/lovable-uploads/gemini-logo.png',
    color: '#4285F4',
    glowColor: 'rgba(66, 133, 244, 0.6)',
  },
  gpt: {
    name: 'GPT',
    logo: '/lovable-uploads/21d8d048-505b-4e56-ac5b-1c4cb56a5589.png',
    color: '#10A37F',
    glowColor: 'rgba(16, 163, 127, 0.6)',
  },
  claude: {
    name: 'Claude',
    logo: '/lovable-uploads/019bcf23-a283-4df7-9f86-ab394da9498e.png',
    color: '#D97706',
    glowColor: 'rgba(217, 119, 6, 0.6)',
  },
} as const;

type ProviderKey = keyof typeof AI_LOGOS;

const ALL_LOGOS = Object.values(AI_LOGOS);

export const AILogoSpiral = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [connected, setConnected] = useState<ProviderKey | null>(null);

  // Poll for API key changes (localStorage)
  useEffect(() => {
    const check = () => {
      const key = AIClientManager.getInstance().getAvailableAPI();
      setConnected((prev) => (prev === key ? prev : key));
    };
    check();
    const id = window.setInterval(check, 3000);
    window.addEventListener('storage', check);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('storage', check);
    };
  }, []);

  // Spiral animation (only when not connected)
  useEffect(() => {
    if (connected) return;
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    let rotation = 0;

    const animate = () => {
      rotation += 2.0;
      const items = container.querySelectorAll('.spiral-logo-item');
      items.forEach((item, index) => {
        const element = item as HTMLElement;
        const angle = (rotation + index * 120) * (Math.PI / 180);
        const radiusX = 70;
        const radiusY = 30;
        const verticalOffset = Math.sin(angle * 0.5) * 20;

        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY + verticalOffset;
        const z = Math.sin(angle) * 50;

        const scale = 0.7 + ((z + 50) / 100) * 0.6;
        const opacity = 0.5 + ((z + 50) / 100) * 0.5;
        const zIndex = Math.round(z + 50);

        element.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`;
        element.style.opacity = String(opacity);
        element.style.zIndex = String(zIndex);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [connected]);

  // ---------- CONNECTED STATE: Big bouncy hero logo ----------
  if (connected) {
    const ai = AI_LOGOS[connected];
    return (
      <div
        className="relative w-48 h-48 flex items-center justify-center"
        style={{ perspective: '800px' }}
      >
        {/* Outer pulse rings */}
        <div
          className="absolute w-40 h-40 rounded-full border-2 animate-ping-slow"
          style={{ borderColor: ai.color, opacity: 0.4 }}
        />
        <div
          className="absolute w-32 h-32 rounded-full border animate-ping-slower"
          style={{ borderColor: ai.color, opacity: 0.3 }}
        />

        {/* Radial glow */}
        <div
          className="absolute w-44 h-44 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: ai.glowColor }}
        />




        {/* Bouncing hero logo */}
        <div className="relative animate-bounce-pop" style={{ transformStyle: 'preserve-3d' }}>
          <div
            className="relative w-24 h-24 rounded-2xl bg-white flex items-center justify-center overflow-hidden border-2"
            style={{
              borderColor: `${ai.color}80`,
              boxShadow: `0 8px 32px ${ai.glowColor}, 0 0 60px ${ai.glowColor}, inset 0 0 20px rgba(255,255,255,0.6)`,
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: `linear-gradient(135deg, ${ai.color}60, transparent 60%)` }}
            />
            <img
              src={ai.logo}
              alt={ai.name}
              className="w-14 h-14 object-contain relative z-10 drop-shadow-md animate-wiggle"
            />
            {/* shimmer */}
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-tr from-transparent via-white/50 to-transparent" />
          </div>

          {/* Connected badge */}
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-white shadow-lg whitespace-nowrap flex items-center gap-1.5 animate-bounce-soft"
            style={{
              background: `linear-gradient(135deg, ${ai.color}, ${ai.color}dd)`,
              boxShadow: `0 4px 16px ${ai.glowColor}`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {ai.name.toUpperCase()} CONNECTED
          </div>
        </div>

        <style>{`
          @keyframes bounce-pop {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-6px) scale(1.02); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(-1.5deg); }
            50% { transform: rotate(1.5deg); }
          }
          @keyframes bounce-soft {
            0%, 100% { transform: translate(-50%, 0); }
            50% { transform: translate(-50%, -2px); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes ping-slow {
            0% { transform: scale(0.95); opacity: 0.4; }
            100% { transform: scale(1.3); opacity: 0; }
          }
          .animate-bounce-pop { animation: bounce-pop 1.2s ease-in-out infinite; }
          .animate-wiggle { animation: wiggle 1.5s ease-in-out infinite; }
          .animate-bounce-soft { animation: bounce-soft 1.0s ease-in-out infinite; }
          .animate-shimmer { animation: shimmer 2.5s ease-in-out infinite; }
          .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0,0,0.2,1) infinite; }
          .animate-ping-slower { animation: ping-slow 3.5s cubic-bezier(0,0,0.2,1) infinite 0.5s; }
        `}</style>

      </div>
    );
  }

  // ---------- NOT CONNECTED: Original spiral of all logos ----------
  return (
    <div className="relative w-48 h-48 flex items-center justify-center" style={{ perspective: '800px' }}>
      {/* Central glowing orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl animate-pulse" />
        <div className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 blur-lg animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Orbital rings */}
      <div className="absolute w-40 h-16 border border-indigo-500/20 rounded-full" style={{ transform: 'rotateX(70deg)' }} />
      <div className="absolute w-36 h-14 border border-purple-500/15 rounded-full animate-spin" style={{ transform: 'rotateX(70deg)', animationDuration: '2.5s' }} />

      {/* Logo container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {ALL_LOGOS.map((ai, index) => (
          <div
            key={ai.name}
            className="spiral-logo-item absolute flex items-center justify-center transition-shadow duration-300"
            style={{ width: '56px', height: '56px' }}
          >
            <div
              className="absolute inset-0 rounded-full blur-md animate-pulse"
              style={{ backgroundColor: ai.glowColor, animationDelay: `${index * 0.2}s` }}
            />
            <div
              className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-lg flex items-center justify-center overflow-hidden border border-white/50"
              style={{ boxShadow: `0 4px 20px ${ai.glowColor}, 0 0 40px ${ai.glowColor}` }}
            >
              <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${ai.color}40, transparent)` }} />
              <img src={ai.logo} alt={ai.name} className="w-8 h-8 object-contain relative z-10 drop-shadow-sm" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-60" />
            </div>
            <div
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: ai.color, opacity: 0.4, left: '-8px', animationDuration: '1s', animationDelay: `${index * 0.15}s` }}
            />
          </div>
        ))}
      </div>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" style={{ transform: 'rotateX(20deg)' }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4285F4" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#A855F7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <ellipse cx="50%" cy="50%" rx="35%" ry="15%" fill="none" stroke="url(#lineGradient)" strokeWidth="1" strokeDasharray="4 4" className="animate-spin" style={{ animationDuration: '3s', transformOrigin: 'center' }} />
      </svg>
    </div>
  );
};
