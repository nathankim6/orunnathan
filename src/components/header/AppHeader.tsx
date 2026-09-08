import React from 'react';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export const AppHeader = ({
  title = "New Veritas",
  subtitle = "ORUN English AI Quiz Maker",
}: AppHeaderProps) => {
  return (
    <header className="relative">
      {/* Main bar — clean enterprise admin style */}
      <div
        className="relative overflow-hidden rounded-lg border border-slate-700/50 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.25)]"
        style={{
          background:
            'linear-gradient(180deg, hsl(220 40% 13%) 0%, hsl(220 38% 10%) 100%)',
        }}
      >
        {/* Subtle grid texture */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Left indigo accent rail */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-400 via-indigo-500 to-violet-500" />

        {/* Top hairline */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between px-8 py-5">
          {/* LEFT — module label */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-300/70 uppercase">
                Module
              </span>
              <span className="text-[13px] font-semibold tracking-wide text-slate-200 uppercase">
                Quiz Maker · v.NEW
              </span>
            </div>
          </div>

          {/* CENTER — Logo + Title */}
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-md bg-white border border-white/15 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src="/lovable-uploads/352a49ca-b123-4f07-992a-cf59e4b7058a.png"
                alt="ORUN ACADEMY"
                className="relative w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-orbitron text-[0.65rem] tracking-[0.3em] text-indigo-200/70 mb-0.5 uppercase">
                Orun English AI Quiz Maker
              </span>
              <div
                className="inline-flex items-center px-4 py-1.5 rounded-xl border border-white/20 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_24px_-8px_rgba(99,102,241,0.45)] relative overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(165,180,252,0.10) 50%, rgba(255,255,255,0.06) 100%)',
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-60"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
                  }}
                />
                <h1
                  className="relative font-orbitron font-bold leading-none tracking-[0.16em] text-[clamp(1.6rem,2.2vw,2.1rem)]"
                  style={{
                    backgroundImage:
                      'linear-gradient(180deg, #ffffff 0%, #e0e7ff 60%, #a5b4fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {title}
                </h1>
              </div>
            </div>
          </div>

          {/* RIGHT — status cluster */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/60">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="text-[10px] font-mono tracking-wider text-slate-300 uppercase">
                Online
              </span>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Session
              </span>
              <span className="text-[11px] font-mono text-slate-300 tabular-nums">
                {new Date().toISOString().slice(0, 10)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom hairline */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
      </div>
    </header>
  );
};
