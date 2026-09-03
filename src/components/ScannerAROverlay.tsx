import { useState, useEffect } from 'react';
import { Target, Sun, Maximize2, ShieldCheck, Eye, Droplets, Activity } from 'lucide-react';

interface ScannerAROverlayProps {
  mode?: 'fish' | 'produce';
  active?: boolean;
  onToggle?: () => void;
}

export default function ScannerAROverlay({
  mode = 'fish',
  active = true,
}: ScannerAROverlayProps) {
  const [hudEnabled, setHudEnabled] = useState(true);
  const [pulse, setPulse] = useState(0);

  // Subtle animated radar scan effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 overflow-hidden select-none">
      {/* ── AR Framing Corner Brackets ────────────────────────────────────────── */}
      {hudEnabled && (
        <>
          {/* Top-Left Corner */}
          <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-neon opacity-80 shadow-[0_0_10px_#c3f400]" />
          {/* Top-Right Corner */}
          <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-neon opacity-80 shadow-[0_0_10px_#c3f400]" />
          {/* Bottom-Left Corner */}
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-neon opacity-80 shadow-[0_0_10px_#c3f400]" />
          {/* Bottom-Right Corner */}
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-neon opacity-80 shadow-[0_0_10px_#c3f400]" />
        </>
      )}

      {/* ── Top Environment Status Bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-neon/30 font-mono text-[0.65rem] text-neon">
          <Target className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="font-bold tracking-wider">
            {mode === 'fish' ? 'FISH BIOMARKER AR' : 'PRODUCE PICSET AR'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-white/20 font-mono text-[0.625rem] text-white">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>LIGHTING: OPTIMAL</span>
          </div>

          <button
            onClick={() => setHudEnabled(!hudEnabled)}
            className="bg-black/70 backdrop-blur-md text-white border border-white/30 px-2.5 py-1 rounded font-mono text-[0.625rem] tracking-wider hover:border-neon hover:text-neon transition-colors"
          >
            {hudEnabled ? 'HUD: ON' : 'HUD: OFF'}
          </button>
        </div>
      </div>

      {/* ── AR Targeting Reticles ────────────────────────────────────────────── */}
      {hudEnabled && (
        <div className="relative w-full h-full my-auto flex items-center justify-center">
          {/* Central Target Grid */}
          <div className="relative w-64 h-64 border border-neon/30 rounded-full flex items-center justify-center">
            {/* Pulsing ring */}
            <div
              className="absolute inset-0 border border-neon/40 rounded-full transition-all duration-75"
              style={{ transform: `scale(${1 + (pulse % 20) * 0.005})` }}
            />
            <div className="w-2 h-2 bg-neon rounded-full shadow-[0_0_8px_#c3f400]" />
            <div className="w-16 h-[1px] bg-neon/50 absolute" />
            <div className="h-16 w-[1px] bg-neon/50 absolute" />

            {/* Target Alignment Status */}
            <div className="absolute -bottom-8 bg-black/70 backdrop-blur-md px-3 py-1 rounded border border-secondary/40 text-secondary font-mono text-[0.6rem] tracking-widest uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              <span>SAMPLE CENTERED & ALIGNED</span>
            </div>
          </div>

          {/* Biomarker Specific Reticles (Fish Mode) */}
          {mode === 'fish' && (
            <>
              {/* Eye Clarity Target */}
              <div className="absolute top-[22%] left-[24%] flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 border border-neon/40 rounded text-[0.55rem] font-mono text-neon">
                <Eye className="w-3 h-3 text-secondary animate-pulse" />
                <span>EYE CLARITY NODE</span>
              </div>

              {/* Gill Saturation Target */}
              <div className="absolute top-[48%] left-[18%] flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 border border-secondary/40 rounded text-[0.55rem] font-mono text-secondary">
                <Droplets className="w-3 h-3 text-secondary animate-pulse" />
                <span>GILL SATURATION</span>
              </div>

              {/* Epidermal Tension Target */}
              <div className="absolute bottom-[28%] right-[22%] flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 border border-neon/40 rounded text-[0.55rem] font-mono text-neon">
                <Activity className="w-3 h-3 text-neon animate-pulse" />
                <span>EPIDERMAL TENSION</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Bottom AR Telemetry Bar ────────────────────────────────────────── */}
      {hudEnabled && (
        <div className="flex items-center justify-between bg-black/70 backdrop-blur-md px-3 py-1.5 rounded border border-white/20 font-mono text-[0.6rem] text-slate-300">
          <div className="flex items-center gap-3">
            <span>FOV: 78.4°</span>
            <span>FPS: 60</span>
            <span>DISTANCE: ~25cm</span>
          </div>
          <div className="flex items-center gap-1 text-neon font-bold">
            <Maximize2 className="w-3 h-3" />
            <span>AI READY</span>
          </div>
        </div>
      )}
    </div>
  );
}
