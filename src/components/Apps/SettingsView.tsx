import React, { useState } from 'react';
import {
  ArrowLeft,
  Settings,
  Volume2,
  VolumeX,
  Palette,
  Check,
  Info,
  Sparkles,
  Sliders,
  Shield,
  RotateCcw,
  MousePointer
} from 'lucide-react';
import { useUselessStore } from '../../store/useUselessStore';
import { VibeTheme } from '../../types';
import { sounds } from '../../utils/sound';

interface ThemePreset {
  id: VibeTheme;
  name: string;
  dotColor: string;
  tagline: string;
  previewBg: string;
  accentBadge: string;
  chips: string[];
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'nebula',
    name: 'Nebula Obsidian',
    dotColor: 'bg-indigo-500 shadow-indigo-500/50',
    tagline: 'Deep dark violet-indigo void with electric cyan & magenta highlights',
    previewBg: 'from-indigo-950/60 via-slate-950 to-purple-950/60',
    accentBadge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    chips: ['Electric Violet', 'Cyan Frost', 'Frosted Obsidian'],
  },
  {
    id: 'amber',
    name: 'Cyberdeck Amber',
    dotColor: 'bg-amber-500 shadow-amber-500/50',
    tagline: 'Warm phosphor terminal CRT aesthetic with golden accents',
    previewBg: 'from-amber-950/60 via-[#0d0905] to-orange-950/60',
    accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    chips: ['Phosphor 590nm', 'Bronze Void', 'Terminal CRT'],
  },
  {
    id: 'tokyo',
    name: 'Tokyo Midnight',
    dotColor: 'bg-pink-500 shadow-pink-500/50',
    tagline: 'Cyberpunk synthwave magenta, electric aqua & night velvet',
    previewBg: 'from-pink-950/60 via-[#0b0514] to-cyan-950/60',
    accentBadge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    chips: ['Synthwave Pink', 'Neon Cyan', 'Velvet Purple'],
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    dotColor: 'bg-emerald-500 shadow-emerald-500/50',
    tagline: 'Bioluminescent jade & dark sci-fi HUD matrix',
    previewBg: 'from-emerald-950/60 via-[#040906] to-teal-950/60',
    accentBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    chips: ['Matrix Jade', 'Bioluminescent Mint', 'Dark HUD'],
  },
  {
    id: 'stealth',
    name: 'Titanium Stealth',
    dotColor: 'bg-zinc-300 shadow-zinc-300/50',
    tagline: 'High-contrast monochrome minimalist industrial aesthetic',
    previewBg: 'from-zinc-900/60 via-[#09090b] to-zinc-950/60',
    accentBadge: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
    chips: ['Titanium Stark', 'Slate Gray', 'Monochrome Glass'],
  },
];

export const SettingsView: React.FC = () => {
  const { state, setApp, setVibeTheme, toggleSound, resetSession, updateGravityCursor, addActivity } = useUselessStore();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [procrastinationFlavor, setProcrastinationFlavor] = useState('UNAPOLOGETIC');

  const handleReset = () => {
    sounds.playClick();
    resetSession();
    setResetConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setApp('overview')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5"
            title="Back to OS Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <h2 className="text-lg sm:text-xl font-bold font-mono tracking-wider text-white uppercase">
                SYSTEM CONFIGURATION
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                USELESS OS v4.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fine-tune colorscheme aesthetics and your engineered inefficiency.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="space-y-5">
        {/* Vibe & Colorscheme Theme Picker */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] backdrop-blur-3xl border border-[var(--border-subtle)] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono uppercase text-white tracking-wide">
                  Desktop Vibe & Color Scheme
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your desired ambient desktop aesthetic, frosted glass hue, and accent lighting.
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-block text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-slate-200 capitalize">
              Active: {state.vibeTheme}
            </span>
          </div>

          {/* Grid of Themes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {THEME_PRESETS.map((preset) => {
              const isSelected = state.vibeTheme === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setVibeTheme(preset.id)}
                  className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'bg-white/15 border-[var(--border-highlight)] shadow-xl shadow-black/40 scale-[1.02]'
                      : 'bg-white/[0.03] border-white/6 hover:bg-white/[0.07] hover:border-white/15'
                  }`}
                >
                  {/* Subtle theme background gradient preview */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${preset.previewBg} opacity-30 pointer-events-none`} />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${preset.dotColor} shrink-0 animate-pulse`} />
                        <span className="text-sm font-bold font-mono text-white tracking-wide">
                          {preset.name}
                        </span>
                      </div>
                      {isSelected ? (
                        <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Select
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {preset.tagline}
                    </p>
                  </div>

                  <div className="relative z-10 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                    {preset.chips.map((chip, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audio Toggle */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] backdrop-blur-3xl border border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
              {state.soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
            </div>
            <div>
              <div className="text-xs font-bold font-mono uppercase text-white">
                Web Audio Acoustic Feedback
              </div>
              <p className="text-xs text-slate-400">
                Synthesizes realistic haptic clicks, heavy thuds, and victory chimes via HTML5 Web Audio.
              </p>
            </div>
          </div>

          <button
            onClick={toggleSound}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all border ${
              state.soundEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            {state.soundEnabled ? 'ENABLED' : 'MUTED'}
          </button>
        </div>

        {/* Global Gravity Cursor Configuration */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] backdrop-blur-3xl border border-[var(--border-subtle)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <MousePointer className="w-5 h-5 fill-sky-400" />
              </div>
              <div>
                <div className="text-xs font-bold font-mono uppercase text-white flex items-center gap-2">
                  <span>Global Gravity Cursor System</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Alt + G
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Simulates intense gravitational pull, inertia, and space-time curvature throughout every application in USELESS OS.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const next = !state.gravityCursor.enabled;
                updateGravityCursor({ enabled: next });
                if (next) {
                  sounds.playGravityEngage();
                  addActivity('Gravity Cursor', 'Global gravitational field engaged across all OS apps.', '🪐');
                } else {
                  sounds.playClick();
                  addActivity('Gravity Cursor', 'Global cursor mass neutralized.', '🪶');
                }
              }}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer active:scale-95 shrink-0 ${
                state.gravityCursor.enabled
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-950/60'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}
            >
              {state.gravityCursor.enabled ? 'GRAVITY ON' : 'GRAVITY OFF'}
            </button>
          </div>

          {/* Strength Level Selector */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="text-[11px] font-mono font-bold text-slate-300 uppercase">
              Gravitational Field Intensity
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'low', label: 'Low (0.3x)', desc: 'Light cosmic drift' },
                { id: 'medium', label: 'Medium (0.75x)', desc: 'Standard planetary mass' },
                { id: 'high', label: 'High (1.25x)', desc: 'Dense Jovian pull' },
                { id: 'extreme', label: 'Extreme (2.0x)', desc: 'Neutron star event horizon' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => {
                    updateGravityCursor({ strength: tier.id as 'low' | 'medium' | 'high' | 'extreme' });
                    sounds.playClick();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    state.gravityCursor.strength === tier.id
                      ? 'bg-sky-500/20 border-sky-500/40 text-sky-200'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{tier.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sandbox shortcut */}
          <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
            <span>Need precision calibration & physics metrics?</span>
            <button
              onClick={() => {
                sounds.playClick();
                setApp('gravity-cursor');
              }}
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-sky-300 hover:text-sky-200 border border-white/10 font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Open Gravity Laboratory</span>
            </button>
          </div>
        </div>

        {/* Philosophy / Persona Mode */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] backdrop-blur-3xl border border-[var(--border-subtle)] space-y-3">
          <div>
            <div className="text-xs font-bold font-mono uppercase text-white">
              Anti-Productivity Philosophy Tone
            </div>
            <p className="text-xs text-slate-400">
              Adjust how aggressively the operating system validates your lack of ambition.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {[
              { id: 'SARCASM', label: 'Playful Sarcasm', desc: 'Witty jabs at societal productivity standards.' },
              { id: 'UNAPOLOGETIC', label: 'Unapologetic Laziness', desc: 'Complete, serene acceptance of the void.' },
              { id: 'CONSPIRACY', label: 'Productivity Skeptic', desc: 'Believes work was invented in 1994 by spreadsheets.' },
            ].map((flavor) => (
              <button
                key={flavor.id}
                onClick={() => setProcrastinationFlavor(flavor.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  procrastinationFlavor === flavor.id
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                <div className="text-xs font-bold font-mono text-slate-200 mb-1 flex items-center justify-between">
                  <span>{flavor.label}</span>
                  {procrastinationFlavor === flavor.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400">{flavor.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Manifesto & About */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] backdrop-blur-3xl border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-white uppercase">
              About USELESS OS
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Built for the <strong>TinkerHub Useless Projects Competition</strong>. 
            Traditional operating systems optimize for relentless output, calendar stacking, and hustle culture. 
            <strong> USELESS OS</strong> is the world’s premier anti-productivity environment, meticulously crafted with 
            futuristic desktop aesthetics, subtle physics cheats, gravity dampeners, and unyielding alarms designed specifically to keep you delightfully unproductive.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
            <span className="px-2 py-1 rounded bg-white/5">TinkerHub Hackathon</span>
            <span className="px-2 py-1 rounded bg-white/5">React + Vite</span>
            <span className="px-2 py-1 rounded bg-white/5">Tailwind CSS</span>
            <span className="px-2 py-1 rounded bg-white/5">HTML5 Web Audio</span>
            <span className="px-2 py-1 rounded bg-white/5">Zero Useful Utility</span>
          </div>
        </div>

        {/* Factory Reset */}
        <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold font-mono uppercase text-rose-300">
              Reset Inefficiency Records
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Clears saved session stats, pipe counters, and resets score to default 87%.
            </p>
          </div>

          {resetConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setResetConfirm(false)}
                className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-mono text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-mono font-bold"
              >
                Confirm Reset
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold transition-colors"
            >
              Restore Factory Incompetence
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
