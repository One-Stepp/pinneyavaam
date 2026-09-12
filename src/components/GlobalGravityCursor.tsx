import React, { useState, useEffect, useRef } from 'react';
import { Power, Sliders } from 'lucide-react';
import { useUselessStore } from '../store/useUselessStore';
import { sounds } from '../utils/sound';

interface Ripple {
  id: number;
  x: number;
  y: number;
  intensity: number;
}

export const GlobalGravityCursor: React.FC = () => {
  const { state, updateGravityCursor, addActivity, setApp } = useUselessStore();
  const config = state.gravityCursor;

  // Local state for smooth rendering
  const [physPos, setPhysPos] = useState({ x: 500, y: 350 });
  const [currentWeight, setCurrentWeight] = useState(config.currentWeight || 847);
  const [movementState, setMovementState] = useState<
    'LIGHT' | 'NORMAL' | 'HEAVY' | 'EXTREMELY HEAVY' | 'GRAVITATIONAL CRUSH'
  >('HEAVY');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const targetPosRef = useRef({ x: 500, y: 350 });
  const curPosRef = useRef({ x: 500, y: 350 });
  const lastMouseMoveTimeRef = useRef<number>(Date.now());
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastStoreUpdateRef = useRef<number>(Date.now());

  // Multipliers for gravitational resistance
  const strengthMultipliers: Record<string, number> = {
    low: 0.3,
    medium: 0.75,
    high: 1.25,
    extreme: 2.0,
  };
  const multiplier = strengthMultipliers[config.strength] || 0.75;

  // Global cursor hiding: ensure native PC cursor is completely hidden when Gravity Cursor is enabled
  useEffect(() => {
    if (config.enabled) {
      document.documentElement.classList.add('gravity-cursor-active');
      document.body.classList.add('gravity-cursor-active');
    } else {
      document.documentElement.classList.remove('gravity-cursor-active');
      document.body.classList.remove('gravity-cursor-active');
    }

    return () => {
      document.documentElement.classList.remove('gravity-cursor-active');
      document.body.classList.remove('gravity-cursor-active');
    };
  }, [config.enabled]);

  // Initialize mouse center on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetPosRef.current = { x: cx, y: cy };
      curPosRef.current = { x: cx, y: cy };
      setPhysPos({ x: cx, y: cy });
    }
  }, []);

  // Global Keyboard Shortcut: Alt+G or Ctrl+Shift+G to toggle Gravity Cursor anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && (e.key === 'g' || e.key === 'G')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'g' || e.key === 'G'))
      ) {
        e.preventDefault();
        const next = !config.enabled;
        updateGravityCursor({ enabled: next });
        if (next) {
          sounds.playGravityEngage();
          addActivity('Gravity Cursor', 'Global gravitational field engaged. Native cursor suppressed.', '🪐');
        } else {
          sounds.playClick();
          addActivity('Gravity Cursor', 'Antigravity stabilizer engaged. Native cursor restored.', '🪶');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.enabled, updateGravityCursor, addActivity]);

  // Track global mousemove
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosRef.current = { x: e.clientX, y: e.clientY };
      lastMouseMoveTimeRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track global mousedown / mouseup for tactile click feedback and acoustic shockwaves
  useEffect(() => {
    if (!config.enabled || state.currentApp === 'gravity-cursor') return;

    const handleMouseDown = () => {
      setIsMouseDown(true);
      const px = curPosRef.current.x;
      const py = curPosRef.current.y;
      const intensity = Math.min(2.2, Math.max(0.8, currentWeight / 750));

      // Play deep gravitational thud
      sounds.playThud(intensity * 0.9);

      // Spawn gravitational shockwave ripple
      const newRipple: Ripple = {
        id: Date.now() + Math.random(),
        x: px,
        y: py,
        intensity,
      };
      setRipples((prev) => [...prev.slice(-4), newRipple]);
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [config.enabled, state.currentApp, currentWeight]);

  // Click redirection: ensures that when native cursor is hidden, clicking activates the element at the gravity cursor's tip
  useEffect(() => {
    if (!config.enabled || state.currentApp === 'gravity-cursor') return;

    let isDispatched = false;

    const handleWindowClick = (e: MouseEvent) => {
      if (isDispatched) return;
      if ((e as unknown as { __gravitySynthetic?: boolean }).__gravitySynthetic) return;

      const tipX = curPosRef.current.x;
      const tipY = curPosRef.current.y;

      const targetEl = document.elementFromPoint(tipX, tipY);
      if (!targetEl) return;

      const clickedEl = e.target as HTMLElement | null;
      if (
        clickedEl &&
        (clickedEl === targetEl || clickedEl.contains(targetEl) || targetEl.contains(clickedEl))
      ) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();

      isDispatched = true;
      const syntheticClick = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        detail: e.detail,
        screenX: tipX,
        screenY: tipY,
        clientX: tipX,
        clientY: tipY,
        button: e.button,
        buttons: e.buttons,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
      });
      (syntheticClick as unknown as { __gravitySynthetic: boolean }).__gravitySynthetic = true;

      targetEl.dispatchEvent(syntheticClick);
      if (typeof (targetEl as HTMLElement).focus === 'function') {
        (targetEl as HTMLElement).focus();
      }
      isDispatched = false;
    };

    window.addEventListener('click', handleWindowClick, { capture: true });
    return () => window.removeEventListener('click', handleWindowClick, { capture: true });
  }, [config.enabled, state.currentApp]);

  // Clean up old ripples
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);
    return () => clearTimeout(timer);
  }, [ripples]);

  // Viewport Physics Loop: Gravitational inertia, depth-weight scaling & space-time drift
  useEffect(() => {
    if (!config.enabled || state.currentApp === 'gravity-cursor') {
      return;
    }

    const loop = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const height = typeof window !== 'undefined' ? window.innerHeight : 800;

      const targetX = targetPosRef.current.x;
      const targetY = targetPosRef.current.y;

      // Vertical position ratio across entire screen (0 top, 1 bottom)
      const vertRatio = Math.max(0, Math.min(1, targetY / (height || 800)));

      // Dynamic weight calculation based on vertical depth
      const dynamicWeight = Math.min(
        config.maxWeight,
        Math.round(200 + vertRatio * (config.maxWeight - 200) * multiplier)
      );
      setCurrentWeight(dynamicWeight);

      // Movement state classification
      if (dynamicWeight < 400) setMovementState('LIGHT');
      else if (dynamicWeight < 750) setMovementState('NORMAL');
      else if (dynamicWeight < 1400) setMovementState('HEAVY');
      else if (dynamicWeight < 2500) setMovementState('EXTREMELY HEAVY');
      else setMovementState('GRAVITATIONAL CRUSH');

      // Sluggishness and drag: heavier cursor moves slower
      const weightRatio = dynamicWeight / (config.maxWeight * 1.15);
      const sluggishness = Math.max(0.04, 1 - weightRatio);
      const lerpFactor = Math.min(0.26, sluggishness * 0.24);

      // Downward gravitational drift active while user is moving
      const timeSinceMove = Date.now() - lastMouseMoveTimeRef.current;
      const isActivelyMoving = timeSinceMove < 180;
      const moveFade = isActivelyMoving ? 1 : Math.max(0, 1 - (timeSinceMove - 180) / 200);
      const gravDrift = vertRatio * 3.2 * multiplier * moveFade;

      curPosRef.current.x += (targetX - curPosRef.current.x) * lerpFactor;
      curPosRef.current.y += (targetY - curPosRef.current.y) * lerpFactor + gravDrift;

      // Viewport safety clamping (ensures tip never escapes screen)
      curPosRef.current.x = Math.max(0, Math.min(width - 4, curPosRef.current.x));
      curPosRef.current.y = Math.max(0, Math.min(height - 4, curPosRef.current.y));

      setPhysPos({ x: curPosRef.current.x, y: curPosRef.current.y });

      // Throttle updating store currentWeight (once per 400ms)
      const now = Date.now();
      if (now - lastStoreUpdateRef.current > 400) {
        lastStoreUpdateRef.current = now;
        updateGravityCursor({ currentWeight: dynamicWeight });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [config.enabled, config.strength, config.maxWeight, multiplier, state.currentApp, updateGravityCursor]);

  // Space-Time Warping Canvas Grid
  useEffect(() => {
    if (!config.enabled || state.currentApp === 'gravity-cursor') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const renderGrid = () => {
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);

      ctx.clearRect(0, 0, w, h);

      const px = curPosRef.current.x;
      const py = curPosRef.current.y;
      const massScale = currentWeight / config.maxWeight;
      const warpRadius = 140 + massScale * 120;
      const warpForce = 18 + massScale * 45;

      ctx.strokeStyle = `rgba(56, 189, 248, ${0.02 + massScale * 0.05})`;
      ctx.lineWidth = 1;

      const step = 64;

      // Draw warped horizontal grid lines
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 24) {
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
        for (let y = 0; y <= h; y += 24) {
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

      animId = requestAnimationFrame(renderGrid);
    };

    animId = requestAnimationFrame(renderGrid);
    return () => cancelAnimationFrame(animId);
  }, [config.enabled, currentWeight, config.maxWeight, state.currentApp]);

  // If disabled or inside dedicated gravity-cursor app view, skip global overlay
  if (!config.enabled || state.currentApp === 'gravity-cursor') {
    return null;
  }

  return (
    <div
      id="global-gravity-cursor-container"
      className="fixed inset-0 pointer-events-none z-[99999] select-none"
    >
      {/* Space-time distortion grid canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Gravitational Shockwave Ripples from Clicks */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full border border-sky-400/50 pointer-events-none animate-ping"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: `${45 * ripple.intensity}px`,
            height: `${45 * ripple.intensity}px`,
            transform: 'translate(-50%, -50%)',
            animationDuration: '0.6s',
          }}
        />
      ))}

      {/* ONLY ONE CURSOR: Custom Futuristic Heavy Gravity Cursor with precision tip at (0, 0) */}
      <div
        className="fixed pointer-events-none z-20 transition-transform duration-75"
        style={{
          left: `${physPos.x}px`,
          top: `${physPos.y}px`,
          transform: isMouseDown ? 'scale(0.92)' : 'scale(1)',
          transformOrigin: '0 0',
        }}
      >
        {/* Gravitational Space-Time Aura Circle radiating around the active tip */}
        <div
          className="rounded-full bg-sky-500/10 border border-sky-400/30 pointer-events-none"
          style={{
            width: `${Math.min(120, 28 + currentWeight / 26)}px`,
            height: `${Math.min(120, 28 + currentWeight / 26)}px`,
            position: 'absolute',
            top: '0px',
            left: '0px',
            transform: 'translate(-50%, -50%)',
            boxShadow:
              movementState === 'GRAVITATIONAL CRUSH'
                ? '0 0 35px rgba(244, 63, 94, 0.45)'
                : '0 0 25px rgba(56, 189, 248, 0.3)',
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

          {/* Floating Simulated Mass Badge */}
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

      {/* Floating Bottom-Right Quick Control Badge (Interactive via pointer-events-auto) */}
      <div className="fixed bottom-10 right-4 z-30 pointer-events-auto hidden sm:flex items-center gap-2 bg-slate-950/85 backdrop-blur-xl border border-sky-500/30 p-1.5 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-1.5 px-2 text-[10px] font-mono text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
          <span className="font-bold text-sky-300">{currentWeight} kg</span>
          <span className="text-slate-400">({config.strength})</span>
        </div>

        <button
          onClick={() => {
            updateGravityCursor({ enabled: false });
            sounds.playClick();
            addActivity('Gravity Cursor', 'Gravity cursor toggled OFF. Native cursor restored.', '🪶');
          }}
          className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 text-[10px] font-mono font-bold transition-all cursor-pointer"
          title="Turn off gravity cursor (or press Alt+G)"
        >
          Disable
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setApp('gravity-cursor');
          }}
          className="p-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[10px] transition-all cursor-pointer"
          title="Open Full Gravity Lab & Sandbox"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
