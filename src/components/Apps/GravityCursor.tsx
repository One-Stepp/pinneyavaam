import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MousePointer,
  Sliders,
  X,
  Settings as SettingsIcon,
  Power,
  RotateCcw,
  Zap,
  Shield,
  Activity,
  Maximize2
} from 'lucide-react';
import { useUselessStore } from '../../store/useUselessStore';
import { sounds } from '../../utils/sound';

interface GravityCursorProps {
  onExit?: () => void;
}

export const GravityCursor: React.FC<GravityCursorProps> = ({ onExit }) => {
  const { state, setApp, updateGravityCursor, addActivity } = useUselessStore();
  const config = state.gravityCursor;

  const [mousePos, setMousePos] = useState({ x: 400, y: 300 });
  const [physPos, setPhysPos] = useState({ x: 400, y: 300 });
  const [currentWeight, setCurrentWeight] = useState(config.currentWeight || 847);
  const [verticalPercent, setVerticalPercent] = useState(50);
  const [movementState, setMovementState] = useState<
    'LIGHT' | 'NORMAL' | 'HEAVY' | 'EXTREMELY HEAVY' | 'GRAVITATIONAL CRUSH'
  >('HEAVY');
  const [clickCount, setClickCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetPosRef = useRef({ x: 400, y: 300 });
  const curPosRef = useRef({ x: 400, y: 300 });
  const animFrameRef = useRef<number | null>(null);

  // Play sound on mount
  useEffect(() => {
    sounds.playGravityEngage();
    // Center cursor target
    if (typeof window !== 'undefined') {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetPosRef.current = { x: cx, y: cy };
      curPosRef.current = { x: cx, y: cy };
      setMousePos({ x: cx, y: cy });
      setPhysPos({ x: cx, y: cy });
    }
  }, []);

  // Strength multiplier
  const strengthMultipliers = {
    low: 0.3,
    medium: 0.75,
    high: 1.25,
    extreme: 2.0,
  };

  const currentMultiplier = strengthMultipliers[config.strength];

  // Full Viewport Physics & Gravitational Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      lastTime = time;

      const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const height = typeof window !== 'undefined' ? window.innerHeight : 800;

      const targetX = targetPosRef.current.x;
      const targetY = targetPosRef.current.y;

      // Vertical position ratio across the full screen (0 at top, 1 at bottom)
      const vertRatio = Math.max(0, Math.min(1, targetY / (height || 800)));
      const vPercent = Math.round(vertRatio * 100);
      setVerticalPercent(vPercent);

      // Cursor's simulated weight based on vertical position across the entire screen
      // Moving lower -> heavier & more resistance
      // Moving upward -> gradually reduces simulated weight
      let dynamicWeight = 200;
      if (config.enabled) {
        dynamicWeight = Math.min(
          config.maxWeight,
          Math.round(200 + vertRatio * (config.maxWeight - 200) * currentMultiplier)
        );
      }
      setCurrentWeight(dynamicWeight);

      // Status classification
      if (dynamicWeight < 400) setMovementState('LIGHT');
      else if (dynamicWeight < 750) setMovementState('NORMAL');
      else if (dynamicWeight < 1400) setMovementState('HEAVY');
      else if (dynamicWeight < 2500) setMovementState('EXTREMELY HEAVY');
      else setMovementState('GRAVITATIONAL CRUSH');

      if (config.enabled) {
        // High weight = lower lerp factor (sluggish response)
        const weightRatio = dynamicWeight / (config.maxWeight * 1.15);
        const sluggishness = Math.max(0.02, 1 - weightRatio);
        const lerpFactor = Math.min(0.25, sluggishness * 0.22);

        // Downward gravitational drift pulled by mass
        const gravDrift = vertRatio * 3.8 * currentMultiplier;

        curPosRef.current.x += (targetX - curPosRef.current.x) * lerpFactor;
        curPosRef.current.y += (targetY - curPosRef.current.y) * lerpFactor + gravDrift;

        // Keep inside viewport bounds
        curPosRef.current.x = Math.max(15, Math.min(width - 15, curPosRef.current.x));
        curPosRef.current.y = Math.max(15, Math.min(height - 15, curPosRef.current.y));
      } else {
        // Standard instantaneous tracking if disabled
        curPosRef.current.x = targetX;
        curPosRef.current.y = targetY;
      }

      setPhysPos({ x: curPosRef.current.x, y: curPosRef.current.y });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [config.enabled, config.strength, config.maxWeight, currentMultiplier]);

  // Global mouse movement listener across entire viewport
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      targetPosRef.current = { x: e.clientX, y: e.clientY };
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, []);

  // Keyboard shortcut: Escape exits
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Canvas Gravitational Distortion Grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const renderGrid = () => {
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);

      ctx.clearRect(0, 0, w, h);

      if (!config.enabled) {
        // Flat faint grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        const step = 48;
        for (let x = 0; x < w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        animId = requestAnimationFrame(renderGrid);
        return;
      }

      const px = curPosRef.current.x;
      const py = curPosRef.current.y;
      const massScale = currentWeight / config.maxWeight;
      const warpRadius = 180 + massScale * 140;
      const warpForce = 25 + massScale * 55;

      ctx.strokeStyle = `rgba(56, 189, 248, ${0.03 + massScale * 0.06})`;
      ctx.lineWidth = 1;

      const step = 56;

      // Draw warped horizontal grid lines
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 20) {
          const dx = x - px;
          const dy = y - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let offsetX = 0;
          let offsetY = 0;

          if (dist < warpRadius && dist > 1) {
            const pull = (1 - dist / warpRadius) * warpForce;
            offsetX = -(dx / dist) * pull;
            offsetY = -(dy / dist) * pull;
          }

          if (x === 0) {
            ctx.moveTo(x + offsetX, y + offsetY);
          } else {
            ctx.lineTo(x + offsetX, y + offsetY);
          }
        }
        ctx.stroke();
      }

      // Draw warped vertical grid lines
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        for (let y = 0; y <= h; y += 20) {
          const dx = x - px;
          const dy = y - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let offsetX = 0;
          let offsetY = 0;

          if (dist < warpRadius && dist > 1) {
            const pull = (1 - dist / warpRadius) * warpForce;
            offsetX = -(dx / dist) * pull;
            offsetY = -(dy / dist) * pull;
          }

          if (y === 0) {
            ctx.moveTo(x + offsetX, y + offsetY);
          } else {
            ctx.lineTo(x + offsetX, y + offsetY);
          }
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(renderGrid);
    };

    animId = requestAnimationFrame(renderGrid);
    return () => cancelAnimationFrame(animId);
  }, [config.enabled, currentWeight, config.maxWeight]);

  const handleInteractiveClick = () => {
    sounds.playThud(Math.min(2.5, currentWeight / 700));
    setClickCount((prev) => prev + 1);
    addActivity(
      'Gravity Cursor',
      `Full-screen lift: resisted ${currentWeight} kg gravitational pull.`,
      '🖱️'
    );
  };

  const handleAntigravityBoost = () => {
    sounds.playSavedChime();
    curPosRef.current = { x: window.innerWidth / 2, y: 120 };
    targetPosRef.current = { x: window.innerWidth / 2, y: 120 };
    setPhysPos({ x: window.innerWidth / 2, y: 120 });
    addActivity('Gravity Cursor', 'Antigravity thrusters engaged. Mass neutralized to 200 kg.', '🚀');
  };

  const handleExit = () => {
    sounds.playClick(450, 0.05);
    setIsExiting(true);
    setTimeout(() => {
      if (onExit) {
        onExit();
      } else {
        setApp('overview');
      }
    }, 280);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleInteractiveClick}
      className={`fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-gradient-to-b from-[#090c16] via-[#060810] to-[#020306] select-none transition-all duration-300 ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      } ${config.enabled ? 'cursor-none' : 'cursor-default'}`}
    >
      {/* Dynamic Space-Time Warping Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Atmospheric Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-sky-950/20 via-indigo-950/15 to-transparent rounded-full blur-[150px] pointer-events-none" />

      {/* Top Floating Header Controls */}
      <header className="relative z-40 w-full p-4 sm:p-6 flex items-center justify-between pointer-events-auto">
        {/* Left: App Title */}
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-xl">
          <span className="text-xl">🪐</span>
          <div>
            <h2 className="text-sm sm:text-base font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
              <span>GRAVITY CURSOR</span>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                  config.enabled
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {config.enabled ? 'FULL SCREEN SIMULATION' : 'STANDBY'}
              </span>
            </h2>
          </div>
        </div>

        {/* Right: Controls (Settings, ON/OFF Toggle, Exit) */}
        <div className="flex items-center gap-2.5">
          {/* Settings Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              setIsSettingsOpen(!isSettingsOpen);
            }}
            title="Gravity Settings"
            className={`p-2.5 rounded-2xl backdrop-blur-xl border transition-all active:scale-90 cursor-pointer shadow-lg ${
              isSettingsOpen
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                : 'bg-black/40 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          {/* ON/OFF Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateGravityCursor({ enabled: !config.enabled });
              sounds.playClick();
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all border backdrop-blur-xl flex items-center gap-2 active:scale-95 cursor-pointer shadow-lg ${
              config.enabled
                ? 'bg-sky-500/20 text-sky-200 border-sky-500/40 hover:bg-sky-500/30'
                : 'bg-black/40 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{config.enabled ? 'GRAVITY ON' : 'GRAVITY OFF'}</span>
          </button>

          {/* Exit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExit();
            }}
            title="Exit Full-Screen Gravity Mode (Esc)"
            className="p-2.5 rounded-2xl bg-black/40 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 transition-all backdrop-blur-xl active:scale-90 cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Center Subtle Helper Prompt */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none z-10 space-y-2 opacity-50 hover:opacity-90 transition-opacity">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          FULL SCREEN INTERACTIVE GRAVITATIONAL CHAMBER
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          Move cursor lower to increase mass • Move upward to lighten load • Click anywhere to lift
        </div>
      </div>

      {/* Floating CURSOR STATISTICS Panel (Bottom-Left) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-6 left-6 z-40 w-72 sm:w-80 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl shadow-black/80 pointer-events-auto space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-300"
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              CURSOR STATISTICS
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">REAL-TIME</span>
        </div>

        {/* Real-time telemetry items */}
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Weight:</span>
            <span className="text-sky-300 font-bold text-sm tracking-wide">
              {currentWeight} kg
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Gravity:</span>
            <span className="text-amber-400 font-bold">
              {Math.round(currentMultiplier * 60)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Position:</span>
            <span className="text-emerald-400 font-bold">{verticalPercent}%</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                movementState === 'LIGHT'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : movementState === 'NORMAL'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : movementState === 'HEAVY'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : movementState === 'EXTREMELY HEAVY'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse'
              }`}
            >
              {movementState}
            </span>
          </div>
        </div>

        {/* Dynamic Mass Gauge Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>200 kg (MIN)</span>
            <span>{config.maxWeight} kg (MAX)</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                movementState === 'GRAVITATIONAL CRUSH'
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : movementState === 'EXTREMELY HEAVY'
                  ? 'bg-orange-400'
                  : movementState === 'HEAVY'
                  ? 'bg-amber-400'
                  : 'bg-sky-400'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.round(((currentWeight - 200) / (config.maxWeight - 200)) * 100)
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
          <button
            onClick={handleInteractiveClick}
            className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 font-mono text-[10px] font-bold text-slate-200 border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>🏋️ Lift ({clickCount})</span>
          </button>

          <button
            onClick={handleAntigravityBoost}
            className="py-2 px-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 active:scale-95 font-mono text-[10px] font-bold text-sky-300 border border-sky-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Antigravity</span>
          </button>
        </div>
      </div>

      {/* Floating Settings Drawer / Modal */}
      {isSettingsOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-20 right-6 z-40 w-80 rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/15 p-5 shadow-2xl shadow-black space-y-4 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                GRAVITY SETTINGS
              </span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Strength Setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Strength:</span>
              <span className="text-sky-300 font-bold uppercase">{config.strength}</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(['low', 'medium', 'high', 'extreme'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    updateGravityCursor({ strength: lvl });
                    sounds.playClick();
                  }}
                  className={`py-1.5 rounded-xl text-[10px] font-mono font-semibold uppercase transition-all border ${
                    config.strength === lvl
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Max weight slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Max Weight:</span>
              <span className="text-sky-300 font-bold">{config.maxWeight} kg</span>
            </div>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={config.maxWeight}
              onChange={(e) => updateGravityCursor({ maxWeight: Number(e.target.value) })}
              className="w-full accent-sky-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Increase rate slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Increase Rate:</span>
              <span className="text-sky-300 font-bold">{config.increaseRate}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={config.increaseRate}
              onChange={(e) => updateGravityCursor({ increaseRate: Number(e.target.value) })}
              className="w-full accent-sky-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <p className="text-[10px] font-mono text-slate-500 pt-1 leading-relaxed">
            The lower your mouse descends toward the bottom bezel, the heavier the simulated physical mass becomes.
          </p>
        </div>
      )}

      {/* Custom Heavy Simulated Cursor */}
      {config.enabled && (
        <div
          className="fixed pointer-events-none z-30 transition-transform duration-75"
          style={{
            left: `${physPos.x}px`,
            top: `${physPos.y}px`,
            transform: 'translate(0, 0)',
          }}
        >
          {/* Gravitational space-time aura circle scaled by weight */}
          <div
            className="rounded-full bg-sky-500/10 border border-sky-400/30 animate-pulse pointer-events-none"
            style={{
              width: `${Math.min(130, 32 + currentWeight / 22)}px`,
              height: `${Math.min(130, 32 + currentWeight / 22)}px`,
              position: 'absolute',
              top: '0px',
              left: '0px',
              transform: 'translate(-50%, -50%)',
              boxShadow:
                movementState === 'GRAVITATIONAL CRUSH'
                  ? '0 0 45px rgba(244, 63, 94, 0.45)'
                  : '0 0 35px rgba(56, 189, 248, 0.3)',
            }}
          />

          {/* High-Precision Heavy Cursor Vector Pointer (Hotspot tip strictly at [0, 0]) */}
          <div className="relative">
            <svg
              width="28"
              height="32"
              viewBox="0 0 28 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            >
              {/* Outer high-contrast boundary */}
              <path
                d="M1 1L10.5 27.5L15.5 17.5L25.5 15L1 1Z"
                fill={movementState === 'GRAVITATIONAL CRUSH' ? '#881337' : '#0369a1'}
                stroke="#ffffff"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              {/* Inner dynamic gravitational core */}
              <path
                d="M3.5 4L10.8 23.5L14.5 16.2L22 14.2L3.5 4Z"
                fill={movementState === 'GRAVITATIONAL CRUSH' ? '#fb7185' : '#38bdf8'}
              />
            </svg>

            {/* Attached Weight Tag */}
            <div
              className={`absolute left-5 top-4 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold whitespace-nowrap shadow-2xl backdrop-blur-md transition-colors ${
                movementState === 'GRAVITATIONAL CRUSH'
                  ? 'bg-rose-950/95 border-rose-400/70 text-rose-200 shadow-rose-950/90'
                  : 'bg-slate-950/95 border-sky-400/60 text-sky-200 shadow-sky-950/90'
              }`}
            >
              {currentWeight} kg
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
