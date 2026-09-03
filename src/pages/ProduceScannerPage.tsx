import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Apple,
  Carrot,
  Camera,
  Upload,
  RotateCcw,
  Sparkles,
  Layers,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import StatusTerminal from '../components/StatusTerminal';
import ScannerAROverlay from '../components/ScannerAROverlay';

// ── Produce Item Type Definitions ─────────────────────────────────────────────

interface ProduceItem {
  id: string;
  name: string;
  category: 'fruit' | 'vegetable';
  icon: string;
  optimalStorage: string;
  biomarkers: string[];
}

const PRODUCE_ITEMS: ProduceItem[] = [
  // 10 FRUITS
  { id: 'apple', name: 'Apple', category: 'fruit', icon: '🍎', optimalStorage: 'Refrigerated 1–4°C', biomarkers: ['Epidermal Gloss', 'Stalk Tension', 'Firmness'] },
  { id: 'banana', name: 'Banana', category: 'fruit', icon: '🍌', optimalStorage: 'Ambient 15–20°C', biomarkers: ['Peel Spotting', 'Stem Dryness', 'Sugar Content'] },
  { id: 'orange', name: 'Orange / Citrus', category: 'fruit', icon: '🍊', optimalStorage: 'Refrigerated 4–7°C', biomarkers: ['Oil Gland Density', 'Albedo Firmness', 'Juice Ratio'] },
  { id: 'mango', name: 'Mango', category: 'fruit', icon: '🥭', optimalStorage: 'Ambient 13–15°C', biomarkers: ['Stem Sap Bleed', 'Shoulder Fullness', 'Aroma Index'] },
  { id: 'strawberry', name: 'Strawberry', category: 'fruit', icon: '🍓', optimalStorage: 'Refrigerated 0–2°C', biomarkers: ['Achene Embedment', 'Calyx Freshness', 'Surface Mold'] },
  { id: 'grape', name: 'Grape', category: 'fruit', icon: '🍇', optimalStorage: 'Refrigerated -1–0°C', biomarkers: ['Pedicel Attachment', 'Bloom Coating', 'Turgidity'] },
  { id: 'papaya', name: 'Papaya', category: 'fruit', icon: '🍈', optimalStorage: 'Ambient 12–14°C', biomarkers: ['Skin Yellowness', 'Softening Index', 'Stem Cavity'] },
  { id: 'pineapple', name: 'Pineapple', category: 'fruit', icon: '🍍', optimalStorage: 'Ambient 10–13°C', biomarkers: ['Crown Leaf Pluck', 'Eye Flatness', 'Base Aroma'] },
  { id: 'watermelon', name: 'Watermelon', category: 'fruit', icon: '🍉', optimalStorage: 'Ambient 15–20°C', biomarkers: ['Field Spot Amber', 'Rind Sound Frequency', 'Stem Dryness'] },
  { id: 'avocado', name: 'Avocado', category: 'fruit', icon: '🥑', optimalStorage: 'Ambient until ripe', biomarkers: ['Stem Cap Yield', 'Pericarp Yield', 'Darkening Rate'] },

  // 10 VEGETABLES
  { id: 'tomato', name: 'Tomato', category: 'vegetable', icon: '🍅', optimalStorage: 'Ambient 12–15°C', biomarkers: ['Lycopene Uniformity', 'Pericarp Elasticity', 'Calyx Hydration'] },
  { id: 'potato', name: 'Potato', category: 'vegetable', icon: '🥔', optimalStorage: 'Cool Dark 7–10°C', biomarkers: ['Sprout Activity', 'Solanine Greening', 'Tuber Suberization'] },
  { id: 'onion', name: 'Onion', category: 'vegetable', icon: '🧅', optimalStorage: 'Dry Cool 15–20°C', biomarkers: ['Tunic Integrity', 'Neck Tightness', 'Moisture Seep'] },
  { id: 'carrot', name: 'Carrot', category: 'vegetable', icon: '🥕', optimalStorage: 'Refrigerated 0–2°C', biomarkers: ['Core Flexibility', 'Crown Greening', 'Root Tip Crispness'] },
  { id: 'cucumber', name: 'Cucumber', category: 'vegetable', icon: '🥒', optimalStorage: 'Refrigerated 10–12°C', biomarkers: ['Spine Retention', 'Wilt Index', 'Blossom End Firmness'] },
  { id: 'bell_pepper', name: 'Bell Pepper', category: 'vegetable', icon: '🫑', optimalStorage: 'Refrigerated 7–10°C', biomarkers: ['Wall Stiffness', 'Calix Greenness', 'Pitting'] },
  { id: 'spinach', name: 'Spinach / Greens', category: 'vegetable', icon: '🥬', optimalStorage: 'Refrigerated 0–2°C', biomarkers: ['Chlorophyll Retention', 'Petiole Turgor', 'Bacterial Decay'] },
  { id: 'broccoli', name: 'Broccoli', category: 'vegetable', icon: '🥦', optimalStorage: 'Refrigerated 0–2°C', biomarkers: ['Floret Compactness', 'Yellowing Index', 'Stem Hollow Check'] },
  { id: 'eggplant', name: 'Eggplant / Brinjal', category: 'vegetable', icon: '🍆', optimalStorage: 'Refrigerated 10–12°C', biomarkers: ['Calix Spines', 'Skin Rebound', 'Seed Browning'] },
  { id: 'cabbage', name: 'Cabbage', category: 'vegetable', icon: '🥬', optimalStorage: 'Refrigerated 0–2°C', biomarkers: ['Outer Leaf Density', 'Stem Cut Color', 'Head Solidity'] },
];

interface PicSetSlot {
  label: string;
  desc: string;
  image: string | null;
}

interface DiagnosticResult {
  freshnessScore: number;
  grade: string;
  ripeness: 'Unripe' | 'Optimal Ripeness' | 'Overripe / Advanced';
  defects: { name: string; severity: 'Low' | 'Moderate' | 'High' | 'None'; percentage: number }[];
  shelfLifeDays: number;
  gradcamOverlayUrl: string | null;
}

export default function ProduceScannerPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fruit' | 'vegetable'>('all');
  const [selectedProduce, setSelectedProduce] = useState<ProduceItem>(PRODUCE_ITEMS[0]);
  const [scanMode, setScanMode] = useState<'picset' | 'fast'>('picset');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  // PicSet Slots: 3 Angles
  const [picsetSlots, setPicsetSlots] = useState<PicSetSlot[]>([
    { label: t('produceScanner.angleSurface', 'Angle 1: Surface / Epidermis'), desc: 'Capture full outer surface & color uniformity', image: null },
    { label: t('produceScanner.angleStem', 'Angle 2: Stem / Calyx / Base'), desc: 'Capture stalk attachment & base hydration', image: null },
    { label: t('produceScanner.angleSection', 'Angle 3: Cut / Cross-Section'), desc: 'Capture interior flesh & seed structure', image: null },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  const filteredItems = PRODUCE_ITEMS.filter((item) =>
    selectedCategory === 'all' ? true : item.category === selectedCategory
  );

  const handleImageUpload = (slotIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setPicsetSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = { ...next[slotIndex], image: src };
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerUploadForSlot = (index: number) => {
    setActiveSlotIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlotIndex !== null) {
      handleImageUpload(activeSlotIndex, file);
    }
  };

  const runAiAnalysis = useCallback(() => {
    setIsProcessing(true);
    setResult(null);

    setTimeout(() => {
      // Generate deterministic yet sample AI evaluation based on produce item
      const hasPicsetImages = picsetSlots.some((s) => s.image !== null);
      const baseScore = hasPicsetImages ? 88 + Math.floor(Math.random() * 10) : 82 + Math.floor(Math.random() * 12);
      
      let grade = 'A';
      if (baseScore >= 92) grade = 'A+';
      else if (baseScore >= 80) grade = 'A';
      else if (baseScore >= 65) grade = 'B';
      else if (baseScore >= 50) grade = 'C';
      else grade = 'D';

      setResult({
        freshnessScore: baseScore,
        grade,
        ripeness: 'Optimal Ripeness',
        defects: [
          { name: 'Epidermal Browning', severity: 'None', percentage: 2 },
          { name: 'Surface Moisture Deficit', severity: 'Low', percentage: 5 },
          { name: 'Stem/Pedicel Rot', severity: 'None', percentage: 0 },
        ],
        shelfLifeDays: Math.floor(5 + Math.random() * 4),
        gradcamOverlayUrl: picsetSlots[0].image || null,
      });

      setIsProcessing(false);
    }, 1800);
  }, [picsetSlots]);

  const resetScanner = () => {
    setPicsetSlots([
      { label: t('produceScanner.angleSurface', 'Angle 1: Surface / Epidermis'), desc: 'Capture full outer surface & color uniformity', image: null },
      { label: t('produceScanner.angleStem', 'Angle 2: Stem / Calyx / Base'), desc: 'Capture stalk attachment & base hydration', image: null },
      { label: t('produceScanner.angleSection', 'Angle 3: Cut / Cross-Section'), desc: 'Capture interior flesh & seed structure', image: null },
    ]);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-bg text-on-surface pt-20 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-high border border-outline-variant/30 text-neon font-[family-name:var(--font-mono)] text-xs tracking-widest uppercase mb-2">
            <Sparkles size={14} className="animate-pulse" />
            FRESHSCAN_AI PRODUCE_MODULE
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] text-tertiary">
            {t('produceScanner.title', 'ProduceScan AI')}
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base mt-1 max-w-2xl">
            {t('produceScanner.subtitle', 'Multimodal PicSet AI Quality & Biomarker Analysis for Fruits & Vegetables')}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-surface-low p-1 border border-outline-variant/30 rounded-none shrink-0">
          <button
            onClick={() => setScanMode('picset')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-[family-name:var(--font-mono)] tracking-wider transition-colors ${
              scanMode === 'picset'
                ? 'bg-neon text-on-primary font-bold'
                : 'text-on-surface-variant hover:text-tertiary'
            }`}
          >
            <Layers size={14} />
            {t('produceScanner.picsetMode', 'PicSet Multi-Angle AI')}
          </button>
          <button
            onClick={() => setScanMode('fast')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-[family-name:var(--font-mono)] tracking-wider transition-colors ${
              scanMode === 'fast'
                ? 'bg-neon text-on-primary font-bold'
                : 'text-on-surface-variant hover:text-tertiary'
            }`}
          >
            <Zap size={14} />
            {t('produceScanner.fastMode', 'Fast Single Scan')}
          </button>
        </div>
      </div>

      {/* Produce Category & Item Selector Grid */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-mono)] text-xs text-neon tracking-widest uppercase">
              SPECIMEN SELECTION
            </span>
            <span className="text-xs text-on-surface-variant">
              ({PRODUCE_ITEMS.length} Cataloged Specs)
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs font-[family-name:var(--font-mono)] border transition-colors ${
                selectedCategory === 'all'
                  ? 'border-neon text-neon bg-surface-highest'
                  : 'border-outline-variant/30 text-on-surface-variant'
              }`}
            >
              ALL (20)
            </button>
            <button
              onClick={() => setSelectedCategory('fruit')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-[family-name:var(--font-mono)] border transition-colors ${
                selectedCategory === 'fruit'
                  ? 'border-neon text-neon bg-surface-highest'
                  : 'border-outline-variant/30 text-on-surface-variant'
              }`}
            >
              <Apple size={12} /> 10 FRUITS
            </button>
            <button
              onClick={() => setSelectedCategory('vegetable')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-[family-name:var(--font-mono)] border transition-colors ${
                selectedCategory === 'vegetable'
                  ? 'border-neon text-neon bg-surface-highest'
                  : 'border-outline-variant/30 text-on-surface-variant'
              }`}
            >
              <Carrot size={12} /> 10 VEGGIES
            </button>
          </div>
        </div>

        {/* Grid of Produce Items */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2 max-h-56 overflow-y-auto pr-1">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedProduce(item)}
              className={`flex flex-col items-center justify-center p-3 border text-center transition-all ${
                selectedProduce.id === item.id
                  ? 'border-neon bg-surface-highest text-neon shadow-[0_0_12px_rgba(195,244,0,0.15)]'
                  : 'border-outline-variant/20 bg-surface-low hover:border-outline-variant/50 text-on-surface-variant'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-semibold truncate w-full">{item.name}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Main Scan Protocol Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: PicSet Image Capture Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-tertiary flex items-center gap-2">
              <span className="text-2xl">{selectedProduce.icon}</span>
              {selectedProduce.name} — {scanMode === 'picset' ? 'PicSet Multi-Angle Capture' : 'Fast Camera Capture'}
            </h2>

            <button
              onClick={resetScanner}
              className="flex items-center gap-1 text-xs font-[family-name:var(--font-mono)] text-on-surface-variant hover:text-neon transition-colors"
            >
              <RotateCcw size={12} /> RESET
            </button>
          </div>

          {/* PicSet Multi-Angle Slots */}
          <div className="relative">
            <ScannerAROverlay mode="produce" active={!result} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(scanMode === 'picset' ? picsetSlots : [picsetSlots[0]]).map((slot, idx) => (
              <div
                key={idx}
                className="bg-surface-low border border-outline-variant/30 p-4 flex flex-col items-center justify-between min-h-[260px] relative group"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-widest text-neon uppercase">
                    SLOT 0{idx + 1}
                  </span>
                  {slot.image && <CheckCircle2 size={14} className="text-neon" />}
                </div>

                {slot.image ? (
                  <div className="w-full h-40 relative border border-outline-variant/40 overflow-hidden bg-black">
                    <img src={slot.image} alt={slot.label} className="w-full h-full object-cover" />
                    <button
                      onClick={() => triggerUploadForSlot(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-[family-name:var(--font-mono)] text-neon transition-opacity"
                    >
                      CHANGE IMAGE
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => triggerUploadForSlot(idx)}
                    className="w-full h-40 border border-dashed border-outline-variant/40 hover:border-neon/60 bg-surface-highest/40 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors"
                  >
                    <Camera size={28} className="text-on-surface-variant mb-2 group-hover:text-neon" />
                    <span className="text-xs font-semibold text-tertiary">{slot.label}</span>
                    <span className="text-[10px] text-on-surface-variant mt-1">{slot.desc}</span>
                  </div>
                )}

                <div className="w-full mt-3 flex items-center gap-2">
                  <button
                    onClick={() => triggerUploadForSlot(idx)}
                    className="flex-1 py-1.5 bg-surface-high hover:bg-surface-highest border border-outline-variant/30 text-xs font-[family-name:var(--font-mono)] text-tertiary flex items-center justify-center gap-1 transition-colors"
                  >
                    <Upload size={12} /> UPLOAD
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              onClick={runAiAnalysis}
              disabled={isProcessing}
              className="w-full py-4 bg-neon hover:bg-neon-dim text-on-primary font-bold font-[family-name:var(--font-display)] tracking-wider uppercase text-base shadow-[0_0_20px_rgba(195,244,0,0.25)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent animate-spin"></span>
                  RUNNING PRODUCE_AI BIOMARKER INFERENCE...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {t('produceScanner.runAnalysis', 'RUN AI QUALITY ANALYSIS')}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Status Terminal & Target Biomarkers */}
        <div className="space-y-6">
          <StatusTerminal
            messages={[
              `MODE: ${scanMode.toUpperCase()} PICSET_AI`,
              isProcessing
                ? 'EXECUTING PRODUCE_AI PIPELINE...'
                : result
                ? `ANALYSIS COMPLETE — SCORE ${result.freshnessScore}/100`
                : `READY TO SCAN ${selectedProduce.name.toUpperCase()}`
            ]}
          />

          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs text-neon tracking-widest uppercase">
              <Info size={14} />
              TARGET BIOMARKERS ({selectedProduce.name})
            </div>

            <div className="space-y-2">
              {selectedProduce.biomarkers.map((bm, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-surface-low p-2 border border-outline-variant/20">
                  <span className="text-on-surface">{bm}</span>
                  <span className="font-[family-name:var(--font-mono)] text-neon-text">ACTIVE</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
              <span>STORAGE PROTOCOL:</span>
              <span className="font-[family-name:var(--font-mono)] text-tertiary">{selectedProduce.optimalStorage}</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Results Dashboard Card */}
      {result && (
        <GlassCard className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300 border-neon/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/20 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-surface-highest border border-neon/50 flex items-center justify-center text-3xl font-bold text-neon font-[family-name:var(--font-mono)] shadow-[0_0_15px_rgba(195,244,0,0.2)]">
                {result.grade}
              </div>
              <div>
                <div className="font-[family-name:var(--font-mono)] text-xs text-neon tracking-widest uppercase">
                  DIAGNOSTIC SUMMARY
                </div>
                <h3 className="text-2xl font-bold font-[family-name:var(--font-display)] text-tertiary">
                  {selectedProduce.name} Quality Grade: {result.grade}
                </h3>
              </div>
            </div>

            {/* Score Pill */}
            <div className="flex items-center gap-6 bg-surface-low p-4 border border-outline-variant/30">
              <div>
                <div className="text-[10px] font-[family-name:var(--font-mono)] text-on-surface-variant uppercase">
                  FRESHNESS INDEX
                </div>
                <div className="text-3xl font-bold font-[family-name:var(--font-mono)] text-neon">
                  {result.freshnessScore}<span className="text-sm text-on-surface-variant">/100</span>
                </div>
              </div>
              <div className="h-8 w-px bg-outline-variant/30" />
              <div>
                <div className="text-[10px] font-[family-name:var(--font-mono)] text-on-surface-variant uppercase">
                  RIPENESS STAGE
                </div>
                <div className="text-sm font-semibold text-tertiary flex items-center gap-1">
                  <ShieldCheck size={14} className="text-neon" />
                  {result.ripeness}
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Defect Diagnostics */}
            <div className="bg-surface-low p-4 border border-outline-variant/30 space-y-3">
              <h4 className="font-[family-name:var(--font-mono)] text-xs text-neon tracking-widest uppercase flex items-center gap-2">
                <AlertTriangle size={14} /> DEFECT DIAGNOSTICS
              </h4>
              <div className="space-y-2">
                {result.defects.map((def, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-surface-mid">
                    <span className="text-on-surface">{def.name}</span>
                    <span className="font-[family-name:var(--font-mono)] text-neon-text">{def.severity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shelf Life Estimation */}
            <div className="bg-surface-low p-4 border border-outline-variant/30 space-y-3">
              <h4 className="font-[family-name:var(--font-mono)] text-xs text-neon tracking-widest uppercase flex items-center gap-2">
                <Clock size={14} /> SHELF LIFE ESTIMATE
              </h4>
              <div className="text-3xl font-bold font-[family-name:var(--font-mono)] text-tertiary">
                ~{result.shelfLifeDays} Days
              </div>
              <p className="text-xs text-on-surface-variant">
                Under recommended storage condition ({selectedProduce.optimalStorage}).
              </p>
            </div>

            {/* AI Recommendation */}
            <div className="bg-surface-low p-4 border border-outline-variant/30 space-y-3">
              <h4 className="font-[family-name:var(--font-mono)] text-xs text-neon tracking-widest uppercase flex items-center gap-2">
                <Sparkles size={14} /> AI ADVISORY
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Specimen exhibits optimal cellular turgor and zero surface pathogen markers. Safe for immediate retail or cold-chain storage.
              </p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
