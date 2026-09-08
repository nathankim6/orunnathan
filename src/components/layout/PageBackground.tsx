import React from 'react';

export const PageBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient - sophisticated and clean */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(220 20% 98%) 0%, hsl(226 30% 96%) 50%, hsl(220 20% 97%) 100%)'
        }}
      />
      
      {/* Subtle mesh gradient overlay */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse at 0% 0%, hsl(226 70% 95% / 0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 100% 0%, hsl(220 60% 96% / 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 100% 100%, hsl(226 50% 94% / 0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 0% 100%, hsl(220 40% 95% / 0.4) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Refined dot pattern */}
      <div 
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(226 30% 75% / 0.3) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Elegant grid lines */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(226 30% 70%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(226 30% 70%) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Floating gradient orbs */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-30"
          style={{
            background: 'radial-gradient(circle, hsl(226 70% 85%) 0%, transparent 70%)',
            animation: 'float-slow 20s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[80px] opacity-25"
          style={{
            background: 'radial-gradient(circle, hsl(220 60% 88%) 0%, transparent 70%)',
            animation: 'float-slow 25s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute top-[50%] right-[30%] w-[250px] h-[250px] rounded-full blur-[60px] opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(230 50% 85%) 0%, transparent 70%)',
            animation: 'float-slow 18s ease-in-out infinite 2s'
          }}
        />
      </div>
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(220 20% 97% / 0.4) 100%)'
        }}
      />
      
      {/* CSS Keyframes */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
      `}</style>
    </div>
  );
};
