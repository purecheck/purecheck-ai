import { useState } from 'react';
import { Thermometer, Snowflake, ShieldAlert, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';

interface ShelfLifePredictorProps {
  freshnessIndex: number;
  grade?: string;
  itemType?: string;
  className?: string;
}

export default function ShelfLifePredictor({
  freshnessIndex,
  grade = 'A',
  itemType = 'Specimen',
  className = '',
}: ShelfLifePredictorProps) {
  const [activeTab, setActiveTab] = useState<'ambient' | 'chilled' | 'frozen'>('chilled');

  // Dynamic calculations based on freshness score (0 - 100)
  const scoreFactor = Math.max(0.1, freshnessIndex / 100);

  // 1. Ambient (28°C) -> 2 to 16 hours
  const ambientHours = Math.max(2, Math.round(scoreFactor * 16));
  
  // 2. Chilled (2°C) -> 12 to 120 hours (0.5 to 5 days)
  const chilledHours = Math.max(12, Math.round(scoreFactor * 120));
  const chilledDays = (chilledHours / 24).toFixed(1);

  // 3. Frozen (-18°C) -> 14 to 120 days
  const frozenDays = Math.max(14, Math.round(scoreFactor * 120));

  // Preservation Guidelines based on grade/freshness
  const getPreservationGuide = () => {
    if (freshnessIndex >= 85) {
      return {
        status: 'PEAK FRESHNESS',
        statusColor: 'text-secondary border-secondary/30 bg-secondary/10',
        recommendation: 'Optimal for raw consumption, fine culinary preparation, or high-value sales.',
        steps: [
          'Store on crushed ice bed with proper drain tray',
          'Keep surface moisture balanced using food-grade parchment',
          'Freeze below -18°C if holding beyond 48 hours',
        ],
      };
    } else if (freshnessIndex >= 70) {
      return {
        status: 'MODERATE FRESHNESS',
        statusColor: 'text-neon border-neon/30 bg-neon/10',
        recommendation: 'Best cooked thoroughly within 24 hours. Ensure continuous cold chain.',
        steps: [
          'Rinse gently in chilled 2% saline brine solution',
          'Store in vacuum-sealed container at 0°C to 2°C',
          'Avoid direct contact with melted tap water ice',
        ],
      };
    } else {
      return {
        status: 'ELEVATED SPOILAGE RISK',
        statusColor: 'text-error border-error/30 bg-error/10',
        recommendation: 'Consume immediately after deep thermal cooking. Do not store raw.',
        steps: [
          'Cook at internal temperature above 75°C immediately',
          'Do not refreeze or keep in ambient environment',
          'Inspect for off-odors before culinary processing',
        ],
      };
    }
  };

  const guide = getPreservationGuide();

  return (
    <GlassCard className={`p-5 relative overflow-hidden ${className}`} variant="tonal">
      {/* Glow accent */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-neon/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-neon" />
          <h3 className="font-display font-bold text-sm tracking-wide text-on-surface uppercase">
            AI Shelf-Life & Spoilage Predictor
          </h3>
        </div>
        <span className={`text-[0.625rem] font-mono tracking-widest px-2 py-0.5 border ${guide.statusColor}`}>
          {guide.status}
        </span>
      </div>

      {/* Temperature Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <button
          onClick={() => setActiveTab('ambient')}
          className={`py-2 px-2 flex flex-col items-center justify-center rounded border transition-all text-xs font-mono ${
            activeTab === 'ambient'
              ? 'border-neon bg-neon/10 text-neon shadow-[0_0_10px_rgba(195,244,0,0.15)]'
              : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant'
          }`}
        >
          <Thermometer className="w-4 h-4 mb-1" />
          <span className="font-bold text-[0.6875rem]">Ambient</span>
          <span className="text-[0.6rem] opacity-70">28°C</span>
        </button>

        <button
          onClick={() => setActiveTab('chilled')}
          className={`py-2 px-2 flex flex-col items-center justify-center rounded border transition-all text-xs font-mono ${
            activeTab === 'chilled'
              ? 'border-neon bg-neon/10 text-neon shadow-[0_0_10px_rgba(195,244,0,0.15)]'
              : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant'
          }`}
        >
          <Snowflake className="w-4 h-4 mb-1" />
          <span className="font-bold text-[0.6875rem]">Refrigerated</span>
          <span className="text-[0.6rem] opacity-70">0°C - 4°C</span>
        </button>

        <button
          onClick={() => setActiveTab('frozen')}
          className={`py-2 px-2 flex flex-col items-center justify-center rounded border transition-all text-xs font-mono ${
            activeTab === 'frozen'
              ? 'border-neon bg-neon/10 text-neon shadow-[0_0_10px_rgba(195,244,0,0.15)]'
              : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-1" />
          <span className="font-bold text-[0.6875rem]">Deep Freeze</span>
          <span className="text-[0.6rem] opacity-70">-18°C</span>
        </button>
      </div>

      {/* Main Countdown Display */}
      <div className="bg-surface-lowest/60 border border-outline-variant/20 p-4 rounded mb-5 flex items-center justify-between">
        <div>
          <span className="text-[0.625rem] font-mono tracking-widest text-on-surface-variant uppercase block mb-1">
            ESTIMATED SAFE STORAGE DURATION
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-neon tracking-tight">
              {activeTab === 'ambient' && `${ambientHours} Hours`}
              {activeTab === 'chilled' && `${chilledDays} Days (${chilledHours}h)`}
              {activeTab === 'frozen' && `${frozenDays} Days`}
            </span>
            <span className="text-xs font-mono text-on-surface-variant">
              at {activeTab === 'ambient' ? '28°C' : activeTab === 'chilled' ? '2°C' : '-18°C'}
            </span>
          </div>
        </div>

        {/* Dynamic score ring meter */}
        <div className="text-right font-mono">
          <div className="text-[0.5625rem] tracking-wider text-on-surface-variant uppercase">
            Freshness Score
          </div>
          <div className="text-xl font-bold text-on-surface">{freshnessIndex}/100</div>
          <div className="text-[0.6rem] text-secondary font-semibold">{grade} Grade</div>
        </div>
      </div>

      {/* Preservation Guidelines */}
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-start gap-2 text-on-surface">
          <ShieldAlert className="w-4 h-4 text-neon shrink-0 mt-0.5" />
          <p className="text-[0.75rem] leading-relaxed">{guide.recommendation}</p>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-outline-variant/20">
          <span className="text-[0.625rem] tracking-widest text-on-surface-variant uppercase block">
            PRESERVATION PROTOCOL FOR {itemType.toUpperCase()}
          </span>
          {guide.steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[0.7rem] text-on-surface-variant">
              <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
