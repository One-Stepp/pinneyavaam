import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ShieldAlert, Cpu, Terminal, Radio, Disc3 } from 'lucide-react';
import { sounds } from '../utils/sound';

interface CoverScreenProps {
  onEnter: () => void;
}

const SYSTEM_MESSAGES = [
  'Initializing unnecessary systems...',
  'Removing productivity...',
  'Loading procrastination engine...',
  'Gravity engine ready...',
  'Useless intelligence online...',
  'System functioning incorrectly.',
];

const FLOATING_FRAGMENTS = [
  { text: '[PROC_ID: 0000_IDLE]', top: '15%', left: '8%', delay: '0s' },
  { text: '[EFFICIENCY_SUPPRESSION: 99.4%]', top: '22%', right: '10%', delay: '2s' },
  { text: '[GRAVITY_INERTIA: ARMED]', bottom: '25%', left: '12%', delay: '4s' },
  { text: '[TASK_AVOIDANCE: ACTIVE]', bottom: '18%', right: '14%', delay: '1s' },
  { text: '0xDEADBEEF // NOOP_LOOP', top: '70%', left: '20%', delay: '3s' },
];

export const CoverScreen: React.FC<CoverScreenProps> = ({ onEnter }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isEntering, setIsEntering] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background telemetry messages cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % SYSTEM_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut: Enter or Space to enter OS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !isEntering) {
        handleEnterOS();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEntering]);

  // Subtle interactive parallax tilt on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMouseOffset({ x, y });
  };

  // Canvas floating particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35 - 0.15,
      alpha: Math.random() * 0.6 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 64;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(165, 180, 252, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleEnterOS = () => {
    if (isEntering) return;
    setIsEntering(true);
    sounds.playStartup();
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 bg-[#07090f] text-slate-100 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden transition-all duration-700 ${
        isEntering ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Interactive Particles & Grid */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Atmospheric Radial Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-900/20 via-sky-900/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating System Fragments in the Background */}
      {FLOATING_FRAGMENTS.map((frag, idx) => (
        <div
          key={idx}
          className="absolute hidden md:block text-[10px] font-mono text-slate-500/40 tracking-wider pointer-events-none select-none transition-all duration-1000"
          style={{
            top: frag.top,
            bottom: frag.bottom,
            left: frag.left,
            right: frag.right,
            transform: `translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px)`,
          }}
        >
          {frag.text}
        </div>
      ))}

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="tracking-wider">RELEASE BUILD 2026.04 // STABLE_INEFFICIENCY</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="hidden sm:inline">KERNEL: PROCRASTINATE_V2</span>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
            HACKATHON EDITION
          </span>
        </div>
      </div>

      {/* Main Central Futuristic Card */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center my-auto transition-transform duration-200 ease-out py-8"
        style={{
          transform: `translate3d(${mouseOffset.x * -0.6}px, ${mouseOffset.y * -0.6}px, 0)`,
        }}
      >
        {/* Floating Icon with Glowing Pedestal */}
        <div className="relative group mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/30 to-sky-500/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-b from-[#161a29] to-[#0c0f18] border border-white/15 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl shadow-indigo-950/80">
            <span className="transform group-hover:rotate-12 transition-transform duration-300">
              🗑️
            </span>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight text-white uppercase drop-shadow-[0_0_35px_rgba(255,255,255,0.2)]">
          PINNEYAVAAM
        </h1>

        {/* Subtitle */}
        <h2 className="text-sm sm:text-base md:text-lg text-slate-300 font-sans font-medium tracking-wide mt-3 max-w-xl text-balance italic">
          &ldquo;pani undu, samayam undu, pinneyavaam&rdquo;
        </h2>

        {/* Productivity Metric Badge */}
        <div className="mt-7 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs sm:text-sm font-bold tracking-wider shadow-lg shadow-rose-950/40 animate-pulse">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>PRODUCTIVITY: -37%</span>
        </div>

        {/* Futuristic Divider */}
        <div className="my-8 w-64 sm:w-80 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* [ ENTER PINNEYAVAAM ] Button */}
        <button
          onClick={handleEnterOS}
          onMouseEnter={() => sounds.playClick(650, 0.02)}
          className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 rounded-2xl font-mono text-sm sm:text-base font-bold text-white tracking-wider transition-all duration-300 active:scale-95 cursor-pointer shadow-2xl shadow-indigo-950"
        >
          {/* Neon Border Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 group-hover:blur-md transition duration-300 animate-gradient" />
          {/* Button Surface */}
          <div className="relative flex items-center gap-3 px-8 sm:px-10 py-3.5 rounded-2xl bg-[#0e111d] group-hover:bg-[#131728] border border-white/20 transition-colors">
            <span>ENTER PINNEYAVAAM</span>
            <ArrowRight className="w-4 h-4 text-sky-400 transform group-hover:translate-x-1.5 transition-transform duration-200" />
          </div>
        </button>

        {/* System Status */}
        <div className="mt-8 flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-ping" />
          <span className="tracking-widest uppercase font-semibold text-slate-300">
            SYSTEM STATUS: UNPRODUCTIVE
          </span>
        </div>
      </div>

      {/* Subtle Animated Background Text / Telemetry Stream */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs font-mono border-t border-white/5 pt-4 gap-2">
        {/* Animated cycling background message */}
        <div className="flex items-center gap-2 text-slate-400/80">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span key={currentMessageIndex} className="transition-opacity duration-500">
            {SYSTEM_MESSAGES[currentMessageIndex]}
          </span>
        </div>

        <div className="text-slate-400/60 text-[11px]">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">Enter ↵</kbd> or click to begin
        </div>
      </div>
    </div>
  );
};
