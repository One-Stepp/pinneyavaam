import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Trophy, ShieldCheck, RotateCcw, Sparkles, Gauge, Zap } from 'lucide-react';
import { useUselessStore } from '../../store/useUselessStore';
import { sounds } from '../../utils/sound';

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
  assisted: boolean;
  targetTopHeight: number;
  targetBottomY: number;
  originalTopHeight: number;
  originalBottomY: number;
}

const HUMOROUS_MESSAGES = [
  "Quantum micro-draft politely accommodated your wings.",
  "Spacetime warp: Pipe shifted 24mm northward to keep you victorious.",
  "TinkerHub courtesy protocol: Obstacle slid smoothly out of flightpath.",
  "Ground-effect thermal cushion repelled the floor.",
  "The pipe apologized and stepped aside for your glory.",
  "A mysterious laminar updraft blessed your wingtips.",
  "Statistically impossible dodge executed with effortless swagger.",
  "Subtle gravitational anomaly preserved your unbroken record.",
  "Pipe lip gracefully retracted. You're basically an esports athlete.",
];

export const HelpfulFlappyBird: React.FC = () => {
  const { state, setApp, recordFlappyScore } = useUselessStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(state.flappyBird.bestScore || 0);
  const [secretHelps, setSecretHelps] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(5.0);
  const [humorousFeedback, setHumorousFeedback] = useState("Tap, Click, or press Space to fly. You literally cannot lose.");
  const [scorePulse, setScorePulse] = useState(false);

  // Time guard to prevent double-flap on mobile/touch & synthetic click
  const lastInputTimeRef = useRef(0);
  const lastSoundRescueTimeRef = useRef(0);

  // High-performance game state ref for 60+ FPS delta-time RAF loop
  const gameStateRef = useRef({
    birdY: 180,
    birdVelocity: -2,
    birdAngle: 0,
    wingPhase: 0,
    wingVelocity: 0,
    screenShake: 0,
    pipes: [] as Pipe[],
    score: 0,
    helpsApplied: 0,
    lastPipeSpawnDistance: 0,
    isPlaying: false,
    baseSpeed: 5.0,
    currentSpeed: 5.0,
    gravity: 0.50,
    flapStrength: -9.2,
    width: 760,
    height: 400,
  });

  // Calculate dynamic game speed based on score (5.0 -> 7.0)
  const getGameSpeed = (score: number) => {
    if (score < 10) return 5.0;
    if (score < 20) return 5.5;
    if (score < 30) return 6.0;
    if (score < 40) return 6.5;
    return 7.0;
  };

  // Immediate, responsive flap handler
  const jump = useCallback(() => {
    const now = performance.now();
    if (now - lastInputTimeRef.current < 65) {
      return; // Deduplicate rapid synthetic events
    }
    lastInputTimeRef.current = now;

    const g = gameStateRef.current;
    if (!g.isPlaying) {
      startGame();
      return;
    }

    // Immediate upward velocity response
    sounds.playFlap();
    g.birdVelocity = g.flapStrength;
    g.wingVelocity = 1.0;
    g.screenShake = 1.8; // subtle tactile impulse
  }, []);

  const startGame = useCallback(() => {
    sounds.playClick(600, 0.05);
    sounds.playFlap();
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 760;
    const h = canvas ? canvas.height : 400;

    gameStateRef.current = {
      birdY: 180,
      birdVelocity: -9.0,
      birdAngle: -0.38,
      wingPhase: 0,
      wingVelocity: 1.2,
      screenShake: 1.8,
      pipes: [],
      score: 0,
      helpsApplied: 0,
      lastPipeSpawnDistance: 0,
      isPlaying: true,
      baseSpeed: 5.0,
      currentSpeed: 5.0,
      gravity: 0.48,
      flapStrength: -9.0,
      width: w,
      height: h,
    };

    setCurrentScore(0);
    setSecretHelps(0);
    setSpeedMultiplier(5.0);
    setIsPlaying(true);
    setHumorousFeedback("High-speed protocol engaged. Physics is 100% legitimate.");
  }, []);

  // Keyboard controls with scroll prevention
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (!e.repeat) {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Main Canvas Render & Delta-time 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    // Background star dust positions (scrolling for speed sensation)
    const stars = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height - 50),
      size: Math.random() * 2 + 1,
      speedFactor: Math.random() * 0.5 + 0.3,
    }));

    const gameLoop = (currentTime: number) => {
      // Calculate delta time normalized to 60fps (1.0 at 60fps)
      const deltaSeconds = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;
      const dt = deltaSeconds * 60; // scale factor

      const g = gameStateRef.current;
      const birdX = 120;
      const birdRadius = 14;
      const pipeWidth = 54;
      const pipeGap = 136; // Generous height gap

      // Clear & Background
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Camera shake transformation
      ctx.save();
      if (g.screenShake > 0.05) {
        const shakeY = (Math.random() - 0.5) * g.screenShake;
        ctx.translate(0, shakeY);
        g.screenShake *= Math.pow(0.84, dt);
      } else {
        g.screenShake = 0;
      }

      // Parallax speed stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      stars.forEach((star) => {
        if (g.isPlaying) {
          star.x -= g.currentSpeed * star.speedFactor * dt;
          if (star.x < -10) star.x = canvas.width + 10;
        }
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Subtle horizontal speed lines
      if (g.isPlaying && g.currentSpeed >= 5.5) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.04)';
        for (let i = 0; i < 3; i++) {
          const y = (i * 120 + ((currentTime * 0.2) % 400)) % (canvas.height - 40);
          ctx.fillRect(0, y, canvas.width, 1.5);
        }
      }

      // Ground line with texture
      ctx.fillStyle = '#141926';
      ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, canvas.height - 24, canvas.width, 2);

      if (g.isPlaying) {
        // 1. Dynamic Speed Scaling
        const targetSpeed = getGameSpeed(g.score);
        g.currentSpeed += (targetSpeed - g.currentSpeed) * (0.05 * dt);

        // 2. Bird Physics: Gravity with Delta Time
        g.birdVelocity += g.gravity * dt;
        // Cap terminal falling velocity so bird remains controllable
        if (g.birdVelocity > 10.5) g.birdVelocity = 10.5;
        g.birdY += g.birdVelocity * dt;

        // 3. Wing Animation & Rotation
        g.wingPhase += (g.wingVelocity * 0.4 + 0.15) * dt;
        g.wingVelocity *= Math.pow(0.92, dt);

        const targetAngle = g.birdVelocity < 0
          ? Math.max(-0.45, g.birdVelocity * 0.06)
          : Math.min(1.1, g.birdVelocity * 0.09);
        g.birdAngle += (targetAngle - g.birdAngle) * (0.26 * dt);

        // 4. Polite Floor / Ceiling Cushion Guarantee
        if (g.birdY > canvas.height - 42) {
          g.birdY = canvas.height - 42;
          g.birdVelocity = -7.6; // Updraft bounce
          g.helpsApplied++;
          setSecretHelps(g.helpsApplied);

          const nowMs = performance.now();
          if (nowMs - lastSoundRescueTimeRef.current > 500) {
            sounds.playSavedChime();
            lastSoundRescueTimeRef.current = nowMs;
            setHumorousFeedback(HUMOROUS_MESSAGES[Math.floor(Math.random() * HUMOROUS_MESSAGES.length)]);
          }
        }
        if (g.birdY < 22) {
          g.birdY = 22;
          g.birdVelocity = Math.max(1.5, g.birdVelocity);
        }

        // 5. Pipe Spawning based on horizontal distance traveled (keeps rhythm consistent at any speed)
        g.lastPipeSpawnDistance += g.currentSpeed * dt;
        const pipeSpacing = 285; // Pixels between pipes
        if (g.lastPipeSpawnDistance >= pipeSpacing) {
          g.lastPipeSpawnDistance = 0;
          const minTop = 45;
          const maxTop = canvas.height - pipeGap - 75;
          const initialTop = Math.floor(Math.random() * (maxTop - minTop)) + minTop;

          g.pipes.push({
            x: canvas.width + 20,
            topHeight: initialTop,
            bottomY: initialTop + pipeGap,
            passed: false,
            assisted: false,
            targetTopHeight: initialTop,
            targetBottomY: initialTop + pipeGap,
            originalTopHeight: initialTop,
            originalBottomY: initialTop + pipeGap,
          });
        }

        // 6. Update Pipes: Duck ONLY if bird crash is imminent (no premature ducking)
        for (let i = g.pipes.length - 1; i >= 0; i--) {
          const pipe = g.pipes[i];
          pipe.x -= g.currentSpeed * dt;

          const distToPipeEntrance = pipe.x - (birdX + birdRadius);
          const isHorizontallyAtPipe = (distToPipeEntrance <= 38) && (pipe.x + pipeWidth >= birdX - birdRadius);

          let isTopCrashImminent = false;
          let isBottomCrashImminent = false;

          if (isHorizontallyAtPipe) {
            // Imminent horizon: only 1-3 frames before direct impact
            const framesAhead = Math.max(1, Math.min(3.5, Math.max(0, distToPipeEntrance) / Math.max(1, g.currentSpeed)));
            const trajectoryY = g.birdY + (g.birdVelocity * framesAhead) + (0.5 * g.gravity * framesAhead * framesAhead);
            
            const birdTop = g.birdY - birdRadius;
            const birdBottom = g.birdY + birdRadius;
            const trajTop = trajectoryY - birdRadius;
            const trajBottom = trajectoryY + birdRadius;

            // Only consider crash imminent if the bird or its immediate trajectory clips the pipe lip
            isTopCrashImminent = (birdTop <= pipe.topHeight + 6) || (trajTop <= pipe.topHeight + 6);
            isBottomCrashImminent = (birdBottom >= pipe.bottomY - 6) || (trajBottom >= pipe.bottomY - 6);

            if (isTopCrashImminent) {
              // Pipe ducks upward at the last instant
              pipe.targetTopHeight = Math.max(10, Math.min(birdTop, trajTop) - 22);

              if (!pipe.assisted) {
                pipe.assisted = true;
                g.helpsApplied++;
                setSecretHelps(g.helpsApplied);
                const nowMs = performance.now();
                if (nowMs - lastSoundRescueTimeRef.current > 500) {
                  sounds.playSavedChime();
                  lastSoundRescueTimeRef.current = nowMs;
                  setHumorousFeedback(HUMOROUS_MESSAGES[Math.floor(Math.random() * HUMOROUS_MESSAGES.length)]);
                }
              }
            }

            if (isBottomCrashImminent) {
              // Pipe ducks downward at the last instant
              pipe.targetBottomY = Math.min(canvas.height - 28, Math.max(birdBottom, trajBottom) + 22);

              if (!pipe.assisted) {
                pipe.assisted = true;
                g.helpsApplied++;
                setSecretHelps(g.helpsApplied);
                const nowMs = performance.now();
                if (nowMs - lastSoundRescueTimeRef.current > 500) {
                  sounds.playSavedChime();
                  lastSoundRescueTimeRef.current = nowMs;
                  setHumorousFeedback(HUMOROUS_MESSAGES[Math.floor(Math.random() * HUMOROUS_MESSAGES.length)]);
                }
              }
            }
          } else {
            // Not at the pipe yet or already past: stay at natural height (no premature ducking)
            if (!pipe.assisted) {
              pipe.targetTopHeight = pipe.originalTopHeight;
              pipe.targetBottomY = pipe.originalBottomY;
            }
          }

          // Hard fail-safe if the bird is directly inside the horizontal footprint of the pipe
          const isInsideHorizontalFootprint = (pipe.x < birdX + birdRadius + 2) && (pipe.x + pipeWidth > birdX - birdRadius - 2);
          if (isInsideHorizontalFootprint) {
            const birdTop = g.birdY - birdRadius;
            const birdBottom = g.birdY + birdRadius;
            if (pipe.topHeight >= birdTop - 2) {
              pipe.topHeight = Math.max(10, birdTop - 18);
              pipe.targetTopHeight = pipe.topHeight;
            }
            if (pipe.bottomY <= birdBottom + 2) {
              pipe.bottomY = Math.min(canvas.height - 28, birdBottom + 18);
              pipe.targetBottomY = pipe.bottomY;
            }
          }

          // Ensure minimum safe passage gap is maintained
          if (pipe.targetBottomY - pipe.targetTopHeight < pipeGap - 10) {
            pipe.targetBottomY = pipe.targetTopHeight + pipeGap;
          }

          // When crash is imminent, pipe ducks swiftly and snappily at the last second
          const isImminent = isTopCrashImminent || isBottomCrashImminent;
          const duckSpeed = isImminent ? Math.max(22, g.currentSpeed * 4.2) : (g.currentSpeed * 1.5);
          const moveStep = duckSpeed * dt;

          if (pipe.topHeight > pipe.targetTopHeight) {
            pipe.topHeight = Math.max(pipe.targetTopHeight, pipe.topHeight - moveStep);
          } else if (pipe.topHeight < pipe.targetTopHeight) {
            pipe.topHeight = Math.min(pipe.targetTopHeight, pipe.topHeight + moveStep);
          }

          if (pipe.bottomY < pipe.targetBottomY) {
            pipe.bottomY = Math.min(pipe.targetBottomY, pipe.bottomY + moveStep);
          } else if (pipe.bottomY > pipe.targetBottomY) {
            pipe.bottomY = Math.max(pipe.targetBottomY, pipe.bottomY - moveStep);
          }

          // Scoring
          if (!pipe.passed && pipe.x + pipeWidth < birdX) {
            pipe.passed = true;
            g.score += 1;
            setCurrentScore(g.score);
            setSpeedMultiplier(Number(g.currentSpeed.toFixed(1)));
            sounds.playClick(900, 0.035);

            setScorePulse(true);
            setTimeout(() => setScorePulse(false), 200);

            if (g.score > bestScore) {
              setBestScore(g.score);
            }
          }

          // Remove offscreen pipes
          if (pipe.x < -80) {
            g.pipes.splice(i, 1);
          }
        }
      }

      // 7. Render Pipes with Metallic Gradients and Assist Glow
      g.pipes.forEach((pipe) => {
        // Glowing aura if pipe was assisted
        if (pipe.assisted) {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
          ctx.lineWidth = 4;
          ctx.strokeRect(pipe.x - 2, 0, pipeWidth + 4, pipe.topHeight);
          ctx.strokeRect(pipe.x - 2, pipe.bottomY, pipeWidth + 4, canvas.height - pipe.bottomY - 24);
        }

        // Top Pipe
        const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        topGrad.addColorStop(0, '#10b981');
        topGrad.addColorStop(0.3, '#34d399');
        topGrad.addColorStop(0.7, '#059669');
        topGrad.addColorStop(1, '#047857');

        ctx.fillStyle = topGrad;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

        // Top Pipe Lip
        ctx.fillStyle = '#065f46';
        ctx.fillRect(pipe.x - 3, pipe.topHeight - 14, pipeWidth + 6, 14);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(pipe.x - 2, pipe.topHeight - 14, pipeWidth + 4, 2);

        // Bottom Pipe
        const botGrad = ctx.createLinearGradient(pipe.x, pipe.bottomY, pipe.x + pipeWidth, pipe.bottomY);
        botGrad.addColorStop(0, '#10b981');
        botGrad.addColorStop(0.3, '#34d399');
        botGrad.addColorStop(0.7, '#059669');
        botGrad.addColorStop(1, '#047857');

        ctx.fillStyle = botGrad;
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY - 24);

        // Bottom Pipe Lip
        ctx.fillStyle = '#065f46';
        ctx.fillRect(pipe.x - 3, pipe.bottomY, pipeWidth + 6, 14);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(pipe.x - 2, pipe.bottomY + 12, pipeWidth + 4, 2);
      });

      // 8. Render Bird with Dynamic Wing Flap & Smooth Tilt
      const birdY = g.birdY;

      ctx.save();
      ctx.translate(birdX, birdY);
      ctx.rotate(g.birdAngle);

      // Subtle speed trail when moving fast
      if (g.isPlaying && g.currentSpeed >= 5.5) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.beginPath();
        ctx.ellipse(-14, 0, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Golden Bird Body
      const birdGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 14);
      birdGrad.addColorStop(0, '#fef08a');
      birdGrad.addColorStop(0.5, '#f59e0b');
      birdGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = birdGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Wing with Flap Animation
      const wingYOffset = Math.sin(g.wingPhase) * 4;
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(-4, 2 + wingYOffset, 7, 5, -g.birdAngle * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, -4, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(7.5, -4, 2.2, 0, Math.PI * 2);
      ctx.fill();
      // Eye highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6.5, -5.2, 1, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(11, -2);
      ctx.lineTo(20, 1);
      ctx.lineTo(11, 4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      ctx.restore(); // Restore camera shake

      // 9. Start Screen Overlay when not playing
      if (!g.isPlaying) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HELPFUL FLAPPY BIRD: TURBO', canvas.width / 2, canvas.height / 2 - 25);

        ctx.fillStyle = '#34d399';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText('HIGH-SPEED PREDICTIVE DISPLACEMENT • 100% SURVIVAL GUARANTEE', canvas.width / 2, canvas.height / 2);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Click, tap, or press Space to take flight immediately.', canvas.width / 2, canvas.height / 2 + 30);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [bestScore]);

  const handleEndFlight = () => {
    const finalScore = gameStateRef.current.score;
    const helps = gameStateRef.current.helpsApplied;
    recordFlappyScore(finalScore, helps);
    gameStateRef.current.isPlaying = false;
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isPlaying) handleEndFlight();
              setApp('overview');
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5 cursor-pointer"
            title="Back to OS Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🐦</span>
              <h2 className="text-lg sm:text-xl font-bold font-mono tracking-wider text-white uppercase">
                HELPFUL FLAPPY BIRD
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>TURBO ENGINE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Blazing fast flight. The predictive spacetime algorithms won't let you fail.
            </p>
          </div>
        </div>

        {isPlaying && (
          <button
            onClick={handleEndFlight}
            className="px-3.5 py-1.5 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer active:scale-95 transition-all"
          >
            Conclude Flight
          </button>
        )}
      </div>

      {/* Stats Readout Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#121522]/80 backdrop-blur-xl border border-white/6 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Current Score</div>
            <div className={`text-2xl font-bold font-mono text-emerald-400 transition-transform ${scorePulse ? 'scale-110 text-emerald-300' : ''}`}>
              {currentScore}
            </div>
          </div>
          <span className="text-lg">🎯</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#121522]/80 backdrop-blur-xl border border-white/6 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Best Score</div>
            <div className="text-2xl font-bold font-mono text-white">{bestScore}</div>
          </div>
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>

        <div className="p-3.5 rounded-2xl bg-[#121522]/80 backdrop-blur-xl border border-white/6 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Flight Velocity</div>
            <div className="text-2xl font-bold font-mono text-sky-400 flex items-center gap-1">
              <span>{speedMultiplier.toFixed(1)}</span>
              <span className="text-xs text-sky-400/70">px/f</span>
            </div>
          </div>
          <Gauge className="w-5 h-5 text-sky-400" />
        </div>

        <div className="p-3.5 rounded-2xl bg-[#121522]/80 backdrop-blur-xl border border-white/6 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Discreet Rescues</div>
            <div className="text-2xl font-bold font-mono text-purple-400">{secretHelps}</div>
          </div>
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      {/* Game Canvas Container */}
      <div
        onMouseDown={jump}
        onTouchStart={(e) => {
          e.preventDefault();
          jump();
        }}
        className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/80 cursor-pointer group bg-black active:scale-[0.998] transition-transform"
      >
        <canvas
          ref={canvasRef}
          width={760}
          height={400}
          className="w-full h-80 sm:h-[400px] block"
        />

        {/* Live HUD over canvas */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300">
              Score: <strong className="text-white text-sm">{currentScore}</strong>
            </div>
            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-sky-300 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-sky-400" />
              <span>{speedMultiplier.toFixed(1)}x SPEED</span>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Predictive Assist: ACTIVE
          </div>
        </div>

        {/* Instructions & Humorous Live Log Bottom */}
        <div className="absolute bottom-3 left-4 right-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 flex items-center justify-between text-xs text-slate-300 pointer-events-none">
          <span>Controls: <strong>Spacebar</strong>, <strong>Click</strong>, or <strong>Touch</strong></span>
          <span className="italic text-purple-300 text-[11px] truncate max-w-md hidden sm:inline">{humorousFeedback}</span>
        </div>
      </div>

      {/* Humorous Explainer Card */}
      <div className="p-5 rounded-2xl bg-[#121522]/80 backdrop-blur-xl border border-white/6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono tracking-wide text-white uppercase flex items-center gap-2">
              <span>Predictive Spacetime Evasion Protocol</span>
              <span className="text-[10px] text-purple-400 font-normal">v2.4 Turbo</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculating future trajectory 0.5s ahead. Pipes smoothly glide out of your flightpath with zero teleportation. Experience maximum velocity and unearned pride.
            </p>
          </div>
        </div>

        <button
          onClick={startGame}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold border border-white/10 transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Game</span>
        </button>
      </div>
    </div>
  );
};

