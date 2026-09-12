import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Camera,
  Shield,
  AlertTriangle,
  Bot,
  Sparkles,
  RefreshCw,
  Clock,
  Radio,
  Sliders,
  CheckCircle2,
  XCircle,
  Tv,
  Gift,
  Flame,
  Award
} from 'lucide-react';
import { useUselessStore } from '../../store/useUselessStore';
import { CameraView } from './EyeContact/CameraView';
import { DistractionTimer } from './EyeContact/DistractionTimer';
import { AttentionMetrics } from './EyeContact/AttentionDetector';
import { DopamineRewardModal } from './EyeContact/DopamineRewardModal';
import { sounds } from '../../utils/sound';
import { openSingleRewardLink } from '../../utils/windowManager';
import { selectRandomDopamine, DopamineCategory, DopamineItem } from '../../data/dopamineVault';

export const EyeContactMonitor: React.FC = () => {
  const {
    state,
    setApp,
    updateEyeContactState,
    triggerAttentionEmergency,
    dismissEmergency,
    addActivity,
    recordDopamineRelease,
    recordEyeContactSessionComplete,
    setDopamineMode,
    setDopamineRandomness,
    setSessionTargetDuration,
    updateEyeContactSession,
  } = useUselessStore();

  const { eyeContact } = state;

  // Real-time metrics from CameraView (MediaPipe or simulated)
  const [metrics, setMetrics] = useState<AttentionMetrics>({
    faceDetected: true,
    attentionStatus: 'LOCKED',
    eyeContact: 'MAINTAINED',
    yawOffset: 0,
    pitchOffset: 0,
    confidence: 90,
  });

  const [isSimulatedLookingAway, setIsSimulatedLookingAway] = useState(false);
  const [lookAwayDuration, setLookAwayDuration] = useState(0);
  const [continuousGaze, setContinuousGaze] = useState(0);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [rewardSessionSeconds, setRewardSessionSeconds] = useState(15);
  const [initialReward, setInitialReward] = useState<{
    category: DopamineCategory;
    item: DopamineItem;
    url: string;
  } | null>(null);

  // Active distraction flag: face missing OR head turned away OR manual simulation active
  const isLookingAway =
    isSimulatedLookingAway ||
    !metrics.faceDetected ||
    metrics.attentionStatus === 'DISTRACTED' ||
    metrics.eyeContact === 'LOST';

  // Store action refs to prevent stale closures
  const triggerEmergencyRef = useRef(triggerAttentionEmergency);
  triggerEmergencyRef.current = triggerAttentionEmergency;
  const emergencyTriggeredRef = useRef(eyeContact.emergencyTriggered);
  emergencyTriggeredRef.current = eyeContact.emergencyTriggered;
  const addActivityRef = useRef(addActivity);
  addActivityRef.current = addActivity;
  const updateEyeContactStateRef = useRef(updateEyeContactState);
  updateEyeContactStateRef.current = updateEyeContactState;
  const updateEyeContactSessionRef = useRef(updateEyeContactSession);
  updateEyeContactSessionRef.current = updateEyeContactSession;
  const sessionTargetDurationRef = useRef(eyeContact.sessionTargetDuration || 15);
  sessionTargetDurationRef.current = eyeContact.sessionTargetDuration || 15;
  const lookAwayDurationRef = useRef(0);
  const continuousGazeRef = useRef(0);
  const lastSessionCompleteTimeRef = useRef<number>(0);
  const lastRecoveryActivityTimeRef = useRef<number>(0);

  // Keep global store in sync
  useEffect(() => {
    updateEyeContactStateRef.current({
      faceDetected: metrics.faceDetected,
      eyeContactMaintained: !isLookingAway,
      attentionStatus: isLookingAway ? 'DISTRACTED' : 'LOCKED',
    });
  }, [isLookingAway, metrics.faceDetected]);

  // 10-Second Distraction Countdown Timer
  useEffect(() => {
    if (!isLookingAway) {
      if (lookAwayDurationRef.current > 0 && lookAwayDurationRef.current < 10) {
        const now = Date.now();
        // Rate-limit recovery activity notifications to at most 1 per 10 seconds
        if (now - lastRecoveryActivityTimeRef.current >= 10000) {
          lastRecoveryActivityTimeRef.current = now;
          sounds.playSavedChime();
          addActivityRef.current(
            'Eye Contact',
            `Gaze returned to screen after ${lookAwayDurationRef.current}s. Attention locked; emergency averted.`,
            '👁️'
          );
        }
      }
      lookAwayDurationRef.current = 0;
      emergencyTriggeredRef.current = false;
      setLookAwayDuration(0);
      return;
    }

    const interval = setInterval(() => {
      lookAwayDurationRef.current += 1;
      const current = lookAwayDurationRef.current;
      setLookAwayDuration(current);
      if (current >= 10 && !emergencyTriggeredRef.current) {
        emergencyTriggeredRef.current = true;
        triggerEmergencyRef.current();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isLookingAway]);

  const handleCompleteSession = useCallback((duration: number) => {
    const now = Date.now();
    // Limit completed achievements / reward triggers to at most 1 per 10 seconds
    if (now - lastSessionCompleteTimeRef.current < 10000) {
      continuousGazeRef.current = 0;
      setContinuousGaze(0);
      return;
    }
    lastSessionCompleteTimeRef.current = now;

    recordEyeContactSessionComplete(duration);
    setRewardSessionSeconds(duration);
    continuousGazeRef.current = 0;
    setContinuousGaze(0);

    if (eyeContact.dopamineMode) {
      setIsRewardModalOpen(true);
    }
  }, [recordEyeContactSessionComplete, eyeContact.dopamineMode]);

  const handleCompleteSessionRef = useRef(handleCompleteSession);
  handleCompleteSessionRef.current = handleCompleteSession;

  // Continuous Gaze Accumulator for Session Completion & Dopamine Release
  useEffect(() => {
    if (isLookingAway || isRewardModalOpen || eyeContact.emergencyTriggered) {
      continuousGazeRef.current = 0;
      setContinuousGaze(0);
      return;
    }

    const interval = setInterval(() => {
      continuousGazeRef.current += 1;
      const next = continuousGazeRef.current;
      setContinuousGaze(next);

      const target = sessionTargetDurationRef.current || 15;
      const progress = Math.min(100, Math.round((next / target) * 100));
      updateEyeContactSessionRef.current({ progress, continuousGaze: next });

      if (next >= target) {
        continuousGazeRef.current = 0;
        setContinuousGaze(0);
        handleCompleteSessionRef.current(target);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isLookingAway, isRewardModalOpen, eyeContact.emergencyTriggered]);

  const handleManualTriggerDopamine = () => {
    sounds.playClick();
    const duration = Math.max(5, continuousGaze || eyeContact.sessionTargetDuration || 15);
    recordEyeContactSessionComplete(duration);
    setRewardSessionSeconds(duration);
    setIsRewardModalOpen(true);
  };

  const handleMetricsUpdate = useCallback((newMetrics: AttentionMetrics) => {
    setMetrics((prev) => {
      if (
        prev.faceDetected === newMetrics.faceDetected &&
        prev.attentionStatus === newMetrics.attentionStatus &&
        prev.eyeContact === newMetrics.eyeContact &&
        prev.confidence === newMetrics.confidence &&
        Math.abs(prev.yawOffset - newMetrics.yawOffset) < 0.05
      ) {
        return prev;
      }
      return newMetrics;
    });
  }, []);

  const handleToggleSimulatedLookingAway = () => {
    sounds.playClick();
    const next = !isSimulatedLookingAway;
    setIsSimulatedLookingAway(next);
    if (next) {
      addActivity('Eye Contact', 'Gaze diversion simulated. Distraction countdown started.', '👀');
    }
  };

  const handleDismissEmergency = () => {
    sounds.playSavedChime();
    dismissEmergency();
    setIsSimulatedLookingAway(false);
    emergencyTriggeredRef.current = false;
    lookAwayDurationRef.current = 0;
    setLookAwayDuration(0);

    // Pick a high-dopamine YouTube counter-measure
    const reward = selectRandomDopamine(eyeContact.randomness);

    // Immediately open the YouTube link in the single reward window (user gesture click)
    openSingleRewardLink(reward.url);

    // Record the dopamine release (force notification since user clicked to restore inefficiency)
    recordDopamineRelease(reward.category, reward.item.title, true);

    // Show the Dopamine Reward modal in OS ready stage with the selected video
    setInitialReward(reward);
    setRewardSessionSeconds(30);
    setIsRewardModalOpen(true);
  };

  const handleConsultBot = () => {
    sounds.playClick();
    dismissEmergency();
    setIsSimulatedLookingAway(false);
    emergencyTriggeredRef.current = false;
    lookAwayDurationRef.current = 0;
    setLookAwayDuration(0);
    setApp('useless-bot');
  };

  const handleRewardClaimed = (category: string, title: string) => {
    recordDopamineRelease(category, title);
  };

  const sessionTarget = eyeContact.sessionTargetDuration || 15;
  const sessionPercent = Math.min(100, Math.round((continuousGaze / sessionTarget) * 100));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border-subtle)] gap-3">
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
              <span className="text-xl">👁️</span>
              <h2 className="text-lg sm:text-xl font-bold font-mono tracking-wider text-white uppercase">
                EYE CONTACT MONITOR
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                DOPAMINE ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Maintain eye contact to convert unwanted productivity into instant, randomized YouTube dopamine.
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Manual Dopamine Trigger */}
          <button
            onClick={handleManualTriggerDopamine}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-500/25 via-pink-500/25 to-purple-500/25 hover:from-red-500/35 hover:to-purple-500/35 text-pink-200 border border-pink-500/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-pink-950/40 active:scale-95"
            title="Release randomized dopamine reward now"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>[ TEST DOPAMINE REWARD ]</span>
          </button>

          {/* Simulate Look Away */}
          <button
            onClick={handleToggleSimulatedLookingAway}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border flex items-center gap-1.5 active:scale-95 cursor-pointer ${
              isSimulatedLookingAway
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-white/5 text-slate-300 hover:text-white border-white/10 hover:bg-white/10'
            }`}
            title="Simulate turning away to test the 10-second emergency trigger"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {isSimulatedLookingAway ? 'Reset Simulation' : 'Simulate Look Away'}
            </span>
            <span className="sm:hidden">Simulate</span>
          </button>
        </div>
      </div>

      {/* Dopamine Engine & Session Goal Progress Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#120d20] to-[#0c0915] border border-purple-500/30 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl text-purple-300 shrink-0">
              🍿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono uppercase text-white">
                  Active Eye Contact Session Target
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {sessionTarget}s Target
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isLookingAway
                  ? 'Gaze diverted. Look at camera to accumulate productivity reward.'
                  : `Focus locked! ${continuousGaze}s / ${sessionTarget}s to automatic dopamine release.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCompleteSession(sessionTarget)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-mono font-semibold transition-all cursor-pointer active:scale-95"
            >
              Claim Reward Now
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>CONTINUOUS GAZE PROGRESS</span>
            <span className="text-purple-300 font-bold">{sessionPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${sessionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dopamine Configuration & Global Stats Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] backdrop-blur-2xl border border-[var(--border-subtle)] grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Settings: Dopamine Mode & Randomness Level */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <div>
            <div className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>DOPAMINE REWARD SETTINGS</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              No URL input needed. 100% automated random curation.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mode Toggle */}
            <button
              onClick={() => setDopamineMode(!eyeContact.dopamineMode)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                eyeContact.dopamineMode
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}
            >
              MODE: {eyeContact.dopamineMode ? 'ON' : 'OFF'}
            </button>

            {/* Randomness Level */}
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
              {(['LOW', 'MEDIUM', 'CHAOTIC'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDopamineRandomness(lvl)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                    eyeContact.randomness === lvl
                      ? 'bg-pink-500/25 text-pink-300 border border-pink-500/40'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Stats: Dopamine Releases & Eye Contact Time */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase">Releases</div>
            <div className="text-base font-bold text-pink-400 mt-0.5">
              {state.dopamineReleases}
            </div>
            <div className="text-[9px] text-slate-500 truncate mt-0.5">
              {state.dopamineCategory || 'Random'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase">Sessions</div>
            <div className="text-base font-bold text-purple-400 mt-0.5">
              {state.eyeContactSessionsCompleted}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Completed</div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase">Gaze Time</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              {state.eyeContactTime}s
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Total Focus</div>
          </div>
        </div>
      </div>

      {/* 3 Live Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Status 1: FACE */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] backdrop-blur-2xl border border-[var(--border-subtle)]">
          <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
            <span>FACE</span>
            <span className="text-[9px] text-slate-500">BIOMETRICS</span>
          </div>
          <div
            className={`text-xl font-bold font-mono flex items-center gap-2 ${
              metrics.faceDetected ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {metrics.faceDetected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{metrics.faceDetected ? 'DETECTED' : 'NOT DETECTED'}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {metrics.faceDetected
              ? `Confidence: ${metrics.confidence}% in frame`
              : 'Face not detected in viewport'}
          </div>
        </div>

        {/* Status 2: ATTENTION */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] backdrop-blur-2xl border border-[var(--border-subtle)]">
          <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
            <span>ATTENTION</span>
            <span className="text-[9px] text-slate-500">HEAD POSE</span>
          </div>
          <div
            className={`text-xl font-bold font-mono flex items-center gap-2 ${
              !isLookingAway ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                !isLookingAway ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-rose-400 animate-ping'
              }`}
            />
            <span>{!isLookingAway ? 'LOCKED' : 'DISTRACTED'}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {!isLookingAway
              ? 'User facing screen / camera'
              : 'Head turned away from screen'}
          </div>
        </div>

        {/* Status 3: EYE CONTACT */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] backdrop-blur-2xl border border-[var(--border-subtle)]">
          <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
            <span>EYE CONTACT</span>
            <span className="text-[9px] text-slate-500">IRIS VECTOR</span>
          </div>
          <div
            className={`text-xl font-bold font-mono flex items-center gap-2 ${
              !isLookingAway ? 'text-emerald-400' : 'text-rose-400 animate-pulse'
            }`}
          >
            {!isLookingAway ? (
              <Eye className="w-4 h-4 text-emerald-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-rose-400" />
            )}
            <span>{!isLookingAway ? 'MAINTAINED' : 'LOST'}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {!isLookingAway
              ? `Gaze sustained (${continuousGaze}s)`
              : `Gaze averted (${lookAwayDuration}s / 10s)`}
          </div>
        </div>
      </div>

      {/* Main Webcam Feed with MediaPipe Computer Vision */}
      <CameraView
        onMetricsUpdate={handleMetricsUpdate}
        isSimulatedLookingAway={isSimulatedLookingAway}
        onToggleSimulatedLookingAway={handleToggleSimulatedLookingAway}
      />

      {/* Modular Distraction Countdown Timer (0s to 10s) */}
      <DistractionTimer
        seconds={lookAwayDuration}
        maxSeconds={10}
        isDistracted={isLookingAway}
      />

      {/* Architectural Explanatory Card */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] backdrop-blur-2xl border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono uppercase text-white">
              Private Computer Vision & Automated Rewards
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Processed entirely client-side using MediaPipe WebAssembly. No video frames leave your
              device. Dopamine rewards are curated across 10 entertainment categories with zero URL input required.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
            10 Categories
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
            Zero-URL Protocol
          </span>
        </div>
      </div>

      {/* DRAMATIC FULL-SCREEN ATTENTION EMERGENCY MODAL */}
      {eyeContact.emergencyTriggered && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative max-w-lg w-full p-8 rounded-3xl bg-gradient-to-b from-[#250d13] via-[#1a080d] to-[#0f0407] border-2 border-rose-500/70 shadow-2xl shadow-rose-950/90 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border border-rose-500/50 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-rose-900/50 animate-bounce">
              🚨
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-rose-400 uppercase font-bold">
                CRITICAL ANTI-PRODUCTIVITY INTERVENTION
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-mono text-white mt-1 tracking-tight">
                🚨 ATTENTION EMERGENCY
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                You have looked away from your screen for <strong>10 continuous seconds</strong>!
                Our surveillance algorithms suspect you may be engaging in real-world productivity,
                drafting reports, or tackling actual responsibilities.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-rose-200/95 font-mono text-left space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-white/10">
                <span>INCIDENT LOG</span>
                <span className="text-rose-400 font-bold">CRITICAL SEVERITY</span>
              </div>
              <div>• Attention Deficit Duration: 10s threshold reached</div>
              <div>• Procrastination Score Adjusted: +3% Inefficiency Boost</div>
              <div>• Counter-Measure Dispatched to UselessBot</div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                onClick={handleConsultBot}
                className="w-full py-3.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-purple-400" />
                <span>Consult UselessBot for Excuses</span>
              </button>

              <button
                onClick={handleDismissEmergency}
                className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-rose-500/25 active:scale-95 cursor-pointer"
              >
                Restore Inefficiency
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOPAMINE REWARD MODAL (3-2-1 Countdown, Category Roulette, and YouTube Launcher) */}
      <DopamineRewardModal
        isOpen={isRewardModalOpen}
        onClose={() => {
          setIsRewardModalOpen(false);
          setInitialReward(null);
        }}
        sessionDuration={rewardSessionSeconds}
        randomness={eyeContact.randomness}
        onRewardClaimed={handleRewardClaimed}
        initialReward={initialReward}
      />
    </div>
  );
};
