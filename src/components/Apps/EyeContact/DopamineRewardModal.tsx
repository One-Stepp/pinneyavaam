import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ExternalLink,
  Play,
  RotateCcw,
  X,
  Volume2,
  Tv,
  CheckCircle2,
  Shuffle
} from 'lucide-react';
import { sounds } from '../../../utils/sound';
import { openSingleRewardLink } from '../../../utils/windowManager';
import {
  selectRandomDopamine,
  DopamineCategory,
  DopamineItem,
  DOPAMINE_CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
} from '../../../data/dopamineVault';

interface DopamineRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionDuration: number;
  randomness: 'LOW' | 'MEDIUM' | 'CHAOTIC';
  onRewardClaimed: (category: string, title: string) => void;
  initialReward?: {
    category: DopamineCategory;
    item: DopamineItem;
    url: string;
  } | null;
}

type Stage = 'congrats' | 'countdown' | 'roulette' | 'ready';

export const DopamineRewardModal: React.FC<DopamineRewardModalProps> = ({
  isOpen,
  onClose,
  sessionDuration,
  randomness,
  onRewardClaimed,
  initialReward,
}) => {
  const [stage, setStage] = useState<Stage>('congrats');
  const [countdown, setCountdown] = useState<number>(3);
  const [rouletteIndex, setRouletteIndex] = useState<number>(0);
  const [selectedReward, setSelectedReward] = useState<{
    category: DopamineCategory;
    item: DopamineItem;
    url: string;
  } | null>(null);
  const [popupBlocked, setPopupBlocked] = useState<boolean>(false);
  const [showInlinePlayer, setShowInlinePlayer] = useState<boolean>(false);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rouletteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoOpenedRef = useRef<boolean>(false);

  // Initialize reward flow when modal opens
  useEffect(() => {
    if (!isOpen) {
      setStage('congrats');
      setCountdown(3);
      setSelectedReward(null);
      setPopupBlocked(false);
      setShowInlinePlayer(false);
      hasAutoOpenedRef.current = false;
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (rouletteTimerRef.current) clearInterval(rouletteTimerRef.current);
      return;
    }

    sounds.playSavedChime();

    // If initial reward was pre-selected (e.g. from Restoring Inefficiency click), display ready immediately
    if (initialReward) {
      setSelectedReward(initialReward);
      setStage('ready');
      hasAutoOpenedRef.current = true;
      return;
    }

    setStage('congrats');
    hasAutoOpenedRef.current = false;

    // Auto advance to countdown after 1.8s
    const timer = setTimeout(() => {
      startCountdown();
    }, 1800);

    return () => {
      clearTimeout(timer);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (rouletteTimerRef.current) clearInterval(rouletteTimerRef.current);
    };
  }, [isOpen, initialReward]);

  const startCountdown = () => {
    setStage('countdown');
    setCountdown(3);
    sounds.playCountdownTick(440);

    let current = 3;
    countdownTimerRef.current = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
        sounds.playCountdownTick(440 + (4 - current) * 110);
      } else {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        startRoulette();
      }
    }, 1000);
  };

  const startRoulette = () => {
    setStage('roulette');
    const pick = selectRandomDopamine(randomness);
    setSelectedReward(pick);

    let iterations = 0;
    const maxIterations = 16;
    rouletteTimerRef.current = setInterval(() => {
      iterations += 1;
      setRouletteIndex((prev) => (prev + 1) % DOPAMINE_CATEGORIES.length);
      sounds.playClick(800 + Math.random() * 300, 0.015);

      if (iterations >= maxIterations) {
        if (rouletteTimerRef.current) clearInterval(rouletteTimerRef.current);
        finishReward(pick);
      }
    }, 85);
  };

  const finishReward = (reward: { category: DopamineCategory; item: DopamineItem; url: string }) => {
    sounds.playDopamineChime();
    onRewardClaimed(reward.category, reward.item.title);
    setStage('ready');

    // Attempt automatic popup open (strictly 1 window at a time)
    if (!hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      const success = openSingleRewardLink(reward.url);
      setPopupBlocked(!success);
    }
  };

  const handleManualOpen = () => {
    if (!selectedReward) return;
    sounds.playClick();
    const success = openSingleRewardLink(selectedReward.url);
    setPopupBlocked(!success);
  };

  const handleReroll = () => {
    sounds.playClick();
    hasAutoOpenedRef.current = false;
    startRoulette();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="relative max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#181328] via-[#100d1e] to-[#0a0714] border-2 border-purple-500/50 shadow-2xl shadow-purple-950/90 text-center overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-500/30 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5 cursor-pointer"
          title="Dismiss Dopamine Reward"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STAGE 1: Congrats Productivity Detected */}
        {stage === 'congrats' && (
          <div className="space-y-5 py-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-amber-950/50">
              🎉
            </div>
            <div>
              <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                PRODUCTIVITY DETECTED
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                Eye Contact Session Complete
              </h3>
              <p className="text-sm text-slate-300 mt-2 italic">
                &ldquo;You survived being productive.&rdquo;
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                <span>Gaze Maintained:</span>
                <span className="text-emerald-400 font-bold">{sessionDuration}s</span>
              </div>
            </div>
            <button
              onClick={startCountdown}
              className="px-6 py-2.5 rounded-xl bg-purple-500/30 hover:bg-purple-500/40 border border-purple-500/50 text-purple-200 font-mono text-xs font-bold transition-all cursor-pointer"
            >
              Skip to Dopamine Release →
            </button>
          </div>
        )}

        {/* STAGE 2: 3-Second Dramatic Countdown */}
        {stage === 'countdown' && (
          <div className="space-y-6 py-6 animate-in zoom-in-95 duration-200">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-purple-400 uppercase font-bold animate-pulse">
                INITIALIZING NEURAL DETOUR
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                RELEASING DOPAMINE...
              </h3>
            </div>

            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/40 animate-ping opacity-60" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-400 flex items-center justify-center shadow-xl shadow-purple-900/60">
                <span className="text-5xl font-black font-mono text-white tracking-tighter">
                  {countdown}
                </span>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-400">
              Randomizing reward across 10 un-productivity categories...
            </p>
          </div>
        )}

        {/* STAGE 3: Category Roulette Animation */}
        {stage === 'roulette' && (
          <div className="space-y-6 py-6 animate-in zoom-in-95 duration-150">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-pink-400 uppercase font-bold">
                RANDOM PROTOCOL ACTIVE
              </span>
              <h3 className="text-xl font-bold font-mono text-white mt-1">
                Selecting Dopamine Frequency...
              </h3>
            </div>

            {/* Spinning category card */}
            <div className="p-6 rounded-2xl bg-white/5 border border-purple-500/40 max-w-sm mx-auto shadow-xl">
              <div className="text-5xl mb-2">
                {CATEGORY_ICONS[DOPAMINE_CATEGORIES[rouletteIndex]]}
              </div>
              <div className="text-lg font-mono font-bold text-purple-200 uppercase tracking-wider">
                {DOPAMINE_CATEGORIES[rouletteIndex]}
              </div>
            </div>

            <p className="text-xs font-mono text-slate-400">
              Calibrating maximum distraction payload...
            </p>
          </div>
        )}

        {/* STAGE 4: Dopamine Ready (Launcher / Fallback / Inline Theater) */}
        {stage === 'ready' && selectedReward && (
          <div className="space-y-5 py-2 animate-in zoom-in-95 duration-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-mono font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>POPUP BLOCKED OR READY</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-mono text-white">
                🍿 DOPAMINE READY
              </h3>
              <p className="text-xs text-slate-300 mt-1 italic">
                &ldquo;Your browser is protecting you from having fun.&rdquo;
              </p>
            </div>

            {/* Video Target Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {CATEGORY_ICONS[selectedReward.category]} {selectedReward.category}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {selectedReward.item.duration || 'Short'}
                </span>
              </div>
              <div className="text-sm font-bold text-white leading-snug">
                {selectedReward.item.title}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">
                {selectedReward.item.description}
              </p>
            </div>

            {/* Inline Embedded Player option if preferred or blocked */}
            {showInlinePlayer ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-purple-500/40 shadow-2xl bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedReward.item.youtubeId}?autoplay=1`}
                  title={selectedReward.item.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 max-w-md mx-auto">
              {/* Primary: External YouTube Tab */}
              <button
                id="btn-release-dopamine"
                onClick={handleManualOpen}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-xl shadow-red-950/50 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>[ RELEASE DOPAMINE ] Open YouTube</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Secondary: Inline Theater Mode */}
                <button
                  onClick={() => setShowInlinePlayer(!showInlinePlayer)}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-mono text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Tv className="w-3.5 h-3.5 text-purple-400" />
                  <span>{showInlinePlayer ? 'Hide Player' : 'Watch Inline'}</span>
                </button>

                {/* Re-roll reward */}
                <button
                  onClick={handleReroll}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-mono text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5 text-pink-400" />
                  <span>Shuffle Reward</span>
                </button>
              </div>

              {/* Dismiss / Return to OS */}
              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-slate-200 font-mono text-[11px] transition-colors cursor-pointer"
              >
                Done Wasting Time (Return to OS)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
