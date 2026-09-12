import { useSyncExternalStore } from 'react';
import { UselessState, AppId, ActivityItem, UselessBotMode, VibeTheme, ChatMessage } from '../types';
import { sounds } from '../utils/sound';

const STORAGE_KEY = 'useless_os_state_v1';

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    source: 'UselessBot',
    icon: '🤖',
    message: 'You generated another excuse: "A stray cat looked through the window."',
    timestamp: Date.now() - 1000 * 60 * 2,
  },
  {
    id: 'act-2',
    source: 'Helpful Flappy Bird',
    icon: '🐦',
    message: 'You survived 47 pipes. Collision avoidance activated discreetly.',
    timestamp: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'act-3',
    source: 'Anti-Alarm',
    icon: '⏰',
    message: 'Snooze #7 recorded. Consciousness officially postponed.',
    timestamp: Date.now() - 1000 * 60 * 12,
  },
  {
    id: 'act-4',
    source: 'Gravity Cursor',
    icon: '🖱️',
    message: 'Cursor mass reached 1,847 kg. Heavy arm workout verified.',
    timestamp: Date.now() - 1000 * 60 * 18,
  },
  {
    id: 'act-5',
    source: 'Eye Contact',
    icon: '👁️',
    message: 'Attention lost for 12 seconds. Gaze successfully averted from responsibilities.',
    timestamp: Date.now() - 1000 * 60 * 24,
  },
];

const INITIAL_STATE: UselessState = {
  currentApp: 'overview',
  vibeTheme: 'nebula',
  procrastinationScore: 87,
  tasksAvoided: 14,
  minutesWasted: 126,
  snoozesCount: 8,
  excusesGenerated: 23,
  dopamineReleases: 4,
  dopamineCategory: 'Memes',
  eyeContactSessionsCompleted: 3,
  eyeContactTime: 45, // seconds
  sessionStartTime: Date.now(),
  soundEnabled: true,

  gravityCursor: {
    enabled: true,
    strength: 'medium',
    maxWeight: 1500,
    increaseRate: 35,
    weightRecovery: 15,
    showOverlay: true,
    currentWeight: 847,
  },

  flappyBird: {
    score: 0,
    bestScore: 54,
    pipesAvoided: 142,
    gamesPlayed: 6,
    secretHelpCount: 38,
  },

  alarm: {
    nextAlarm: '07:00 AM',
    isRinging: false,
    snoozeCount: 8,
    lastSnoozeMessage: 'Productivity successfully postponed.',
    targetTimestamp: null,
    totalDurationSeconds: 60,
    setTimestamp: Date.now(),
  },

  uselessBot: {
    mode: 'NORMAL',
    messages: [
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: 'Welcome back to USELESS OS. Whatever task is burning a hole in your schedule, I strongly recommend ignoring it.',
        timestamp: Date.now() - 1000 * 60 * 15,
        mode: 'NORMAL',
      },
    ],
    excusesList: [
      'My productivity subscription expired.',
      'My keyboard needs emotional recovery.',
      'I was about to work, but then I remembered I have Wi-Fi.',
      'Today is not a good day for personal growth.',
    ],
  },

  eyeContact: {
    faceDetected: false,
    eyeContactMaintained: true,
    attentionStatus: 'LOCKED',
    lookAwayDuration: 0,
    emergencyTriggered: false,
    emergencyCount: 1,
    dopamineMode: true,
    randomness: 'MEDIUM',
    sessionTargetDuration: 15,
    sessionActive: false,
    sessionProgress: 0,
    continuousGazeDuration: 0,
  },

  activities: INITIAL_ACTIVITIES,
};

function loadStoredState(): UselessState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);

      // Sanitize and deduplicate uselessBot messages so duplicate keys can never occur
      const rawMessages: ChatMessage[] = Array.isArray(parsed.uselessBot?.messages)
        ? parsed.uselessBot.messages
        : INITIAL_STATE.uselessBot.messages;
      const seenMsgIds = new Set<string>();
      const sanitizedMessages: ChatMessage[] = [];
      for (let i = 0; i < rawMessages.length; i++) {
        const msg = rawMessages[i];
        if (!msg) continue;
        let id = msg.id;
        if (!id || seenMsgIds.has(id)) {
          id = `${id || 'msg'}-${i}-${Math.random().toString(36).substring(2, 7)}`;
        }
        seenMsgIds.add(id);
        sanitizedMessages.push({ ...msg, id });
      }

      // Sanitize activities
      const rawActivities: ActivityItem[] = Array.isArray(parsed.activities)
        ? parsed.activities
        : INITIAL_ACTIVITIES;
      const seenActIds = new Set<string>();
      const sanitizedActivities: ActivityItem[] = [];
      for (let i = 0; i < rawActivities.length; i++) {
        const act = rawActivities[i];
        if (!act) continue;
        let id = act.id;
        if (!id || seenActIds.has(id)) {
          id = `${id || 'act'}-${i}-${Math.random().toString(36).substring(2, 7)}`;
        }
        seenActIds.add(id);
        sanitizedActivities.push({ ...act, id });
      }

      // Ensure activities and nested objects are intact
      return {
        ...INITIAL_STATE,
        ...parsed,
        dopamineReleases: typeof parsed.dopamineReleases === 'number' ? parsed.dopamineReleases : INITIAL_STATE.dopamineReleases,
        dopamineCategory: parsed.dopamineCategory || INITIAL_STATE.dopamineCategory,
        eyeContactSessionsCompleted: typeof parsed.eyeContactSessionsCompleted === 'number' ? parsed.eyeContactSessionsCompleted : INITIAL_STATE.eyeContactSessionsCompleted,
        eyeContactTime: typeof parsed.eyeContactTime === 'number' ? parsed.eyeContactTime : INITIAL_STATE.eyeContactTime,
        vibeTheme: parsed.vibeTheme || 'nebula',
        sessionStartTime: parsed.sessionStartTime || Date.now(),
        activities: sanitizedActivities.length ? sanitizedActivities : INITIAL_ACTIVITIES,
        eyeContact: {
          ...INITIAL_STATE.eyeContact,
          ...(parsed.eyeContact || {}),
        },
        uselessBot: {
          ...INITIAL_STATE.uselessBot,
          ...(parsed.uselessBot || {}),
          messages: sanitizedMessages.length ? sanitizedMessages : INITIAL_STATE.uselessBot.messages,
        }
      };
    }
  } catch (e) {
    console.warn('Failed to parse stored USELESS state:', e);
  }
  return INITIAL_STATE;
}

// Simple pub/sub store pattern with useSyncExternalStore so components stay synchronized without tears
let globalState: UselessState = loadStoredState();
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
    } catch {}
  }
  listeners.forEach((listener) => listener());
}

export function useUselessStore() {
  const state = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    () => globalState,
    () => INITIAL_STATE
  );

  // Actions
  const setApp = (appId: AppId) => {
    sounds.playClick(750, 0.03);
    globalState = {
      ...globalState,
      currentApp: appId,
    };
    emit();
  };

// Throttle tracking to limit notifications and achievements to at most 1 per 10 seconds
let lastDopamineNotificationTime = 0;
let lastSessionAchievementTime = 0;
let lastPopcornActivityTime = 0;

  const addActivity = (
    source: ActivityItem['source'],
    message: string,
    icon: string,
    highlight: boolean = false,
    forceNotify: boolean = false
  ) => {
    // Rate limit popcorn ('🍿') notifications and Eye Contact achievements to at most 1 per 10 seconds unless explicitly forced by user action
    const now = Date.now();
    if (!forceNotify && (icon === '🍿' || (source === 'Eye Contact' && icon === '🎉'))) {
      if (now - lastPopcornActivityTime < 10000) {
        return; // Suppress spam
      }
      lastPopcornActivityTime = now;
    } else if (forceNotify && (icon === '🍿' || (source === 'Eye Contact' && icon === '🎉'))) {
      lastPopcornActivityTime = now;
    }

    const newItem: ActivityItem = {
      id: 'act-' + Math.random().toString(36).substring(2, 9),
      source,
      icon,
      message,
      timestamp: Date.now(),
      highlight,
    };

    globalState = {
      ...globalState,
      activities: [newItem, ...globalState.activities.slice(0, 39)],
      // Slightly bump procrastination score
      procrastinationScore: Math.min(99, Math.round(globalState.procrastinationScore + 0.5)),
    };
    emit();
  };

  const avoidTask = () => {
    sounds.playSavedChime();
    const newCount = globalState.tasksAvoided + 1;
    const minutesAdded = Math.floor(Math.random() * 15) + 10;
    globalState = {
      ...globalState,
      tasksAvoided: newCount,
      minutesWasted: globalState.minutesWasted + minutesAdded,
      procrastinationScore: Math.min(99, globalState.procrastinationScore + 1),
    };
    addActivity('System', `Task avoided: ${newCount} total. Added ${minutesAdded}m to your glorious non-achievements.`, '🛡️', true);
  };

  const updateGravityCursor = (updates: Partial<UselessState['gravityCursor']>) => {
    globalState = {
      ...globalState,
      gravityCursor: {
        ...globalState.gravityCursor,
        ...updates,
      },
    };
    emit();
  };

  const setAlarmRinging = (ringing: boolean) => {
    globalState = {
      ...globalState,
      alarm: {
        ...globalState.alarm,
        isRinging: ringing,
      },
    };
    emit();
  };

  const snoozeAlarm = (message?: string) => {
    sounds.playSnooze();
    const defaultMessages = [
      'You chose poorly. Which is to say, wonderfully.',
      'Excellent. 5 more minutes of sweet denial achieved.',
      'Productivity successfully postponed to an unspecified future.',
      'Remarkable commitment to avoiding consciousness.',
      'The alarm has accepted defeat. Go back to sleep.',
    ];
    const chosenMsg = message || defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
    const newSnoozeCount = globalState.alarm.snoozeCount + 1;
    const snoozeSeconds = 300;
    const now = Date.now();
    const target = now + snoozeSeconds * 1000;
    const date = new Date(target);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    globalState = {
      ...globalState,
      snoozesCount: newSnoozeCount,
      minutesWasted: globalState.minutesWasted + 5,
      alarm: {
        ...globalState.alarm,
        isRinging: false,
        nextAlarm: `Snooze +5m (${timeStr})`,
        targetTimestamp: target,
        totalDurationSeconds: snoozeSeconds,
        setTimestamp: now,
        snoozeCount: newSnoozeCount,
        lastSnoozeMessage: chosenMsg,
      },
    };
    addActivity('Anti-Alarm', `Snooze #${newSnoozeCount} recorded: "${chosenMsg}"`, '⏰', true);
  };

  const setTargetAlarm = (label: string, secondsFromNow: number) => {
    const now = Date.now();
    const target = now + secondsFromNow * 1000;
    const date = new Date(target);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    globalState = {
      ...globalState,
      alarm: {
        ...globalState.alarm,
        nextAlarm: `${label} (${timeStr})`,
        targetTimestamp: target,
        totalDurationSeconds: secondsFromNow,
        setTimestamp: now,
      },
    };
    addActivity('Anti-Alarm', `New anti-alarm scheduled: ${label} (${timeStr}). Auditory Sabotage initiated!`, '⏰');
    emit();
  };

  const recordFlappyScore = (finalScore: number, savedCount: number) => {
    const isNewBest = finalScore > globalState.flappyBird.bestScore;
    globalState = {
      ...globalState,
      minutesWasted: globalState.minutesWasted + Math.max(1, Math.round(finalScore / 10)),
      flappyBird: {
        ...globalState.flappyBird,
        score: finalScore,
        bestScore: Math.max(globalState.flappyBird.bestScore, finalScore),
        pipesAvoided: globalState.flappyBird.pipesAvoided + finalScore,
        gamesPlayed: globalState.flappyBird.gamesPlayed + 1,
        secretHelpCount: globalState.flappyBird.secretHelpCount + savedCount,
      },
    };

    if (finalScore > 5) {
      addActivity(
        'Helpful Flappy Bird',
        `Flight concluded! You survived ${finalScore} pipes${isNewBest ? ' (NEW RECORD!)' : ''} with ${savedCount} discreet pipe displacements.`,
        '🐦',
        isNewBest
      );
    }
    emit();
  };

  const addBotMessage = (message: string, sender: 'user' | 'bot', mode?: UselessBotMode) => {
    const newMsg = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      sender,
      text: message,
      timestamp: Date.now(),
      mode,
    };

    globalState = {
      ...globalState,
      uselessBot: {
        ...globalState.uselessBot,
        messages: [...globalState.uselessBot.messages, newMsg],
      },
    };
    emit();
  };

  const recordExcuseGenerated = (excuseText: string) => {
    sounds.playSavedChime();
    const newCount = globalState.excusesGenerated + 1;
    globalState = {
      ...globalState,
      excusesGenerated: newCount,
      minutesWasted: globalState.minutesWasted + 3,
      uselessBot: {
        ...globalState.uselessBot,
        excusesList: [excuseText, ...globalState.uselessBot.excusesList.slice(0, 19)],
      },
    };
    addActivity('UselessBot', `Excuse generated: "${excuseText}"`, '🤖', true);
    emit();
  };

  const setBotMode = (mode: UselessBotMode) => {
    sounds.playClick(500, 0.05);
    globalState = {
      ...globalState,
      uselessBot: {
        ...globalState.uselessBot,
        mode,
      },
    };
    addActivity('UselessBot', `Mode switched to ${mode}. Procrastination directive re-calibrated.`, '🤖');
    emit();
  };

  const updateEyeContactState = (updates: Partial<UselessState['eyeContact']>) => {
    let hasChanged = false;
    const current = globalState.eyeContact;
    for (const key of Object.keys(updates) as Array<keyof UselessState['eyeContact']>) {
      if (current[key] !== updates[key]) {
        hasChanged = true;
        break;
      }
    }
    if (!hasChanged) return;

    globalState = {
      ...globalState,
      eyeContact: {
        ...globalState.eyeContact,
        ...updates,
      },
    };
    emit();
  };

  const triggerAttentionEmergency = () => {
    if (globalState.eyeContact.emergencyTriggered) {
      return;
    }
    sounds.playEmergency();
    const newEmergencyCount = globalState.eyeContact.emergencyCount + 1;
    const newProcrastinationScore = Math.min(100, globalState.procrastinationScore + 3);

    const botEmergencyMessage: ChatMessage = {
      id: `bot-emergency-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: 'bot',
      text: '🚨 ATTENTION EMERGENCY DETECTED! The human looked away from the anti-productivity monitor for 10 consecutive seconds. High probability of real work or productive thoughts detected. Generating emergency counter-distractions immediately!',
      timestamp: Date.now(),
      mode: 'SABOTAGE',
    };

    globalState = {
      ...globalState,
      procrastinationScore: newProcrastinationScore,
      tasksAvoided: globalState.tasksAvoided + 2,
      minutesWasted: globalState.minutesWasted + 6,
      uselessBot: {
        ...globalState.uselessBot,
        messages: [...globalState.uselessBot.messages, botEmergencyMessage],
      },
      eyeContact: {
        ...globalState.eyeContact,
        emergencyTriggered: true,
        emergencyCount: newEmergencyCount,
        lookAwayDuration: 10,
        attentionStatus: 'DISTRACTED',
      },
    };
    addActivity(
      'Eye Contact',
      `🚨 ATTENTION EMERGENCY DETECTED! Gaze diverted for 10s. Global procrastination score increased to ${newProcrastinationScore}%.`,
      '🚨',
      true
    );
    emit();
  };

  const dismissEmergency = () => {
    sounds.playClick();
    globalState = {
      ...globalState,
      eyeContact: {
        ...globalState.eyeContact,
        emergencyTriggered: false,
        lookAwayDuration: 0,
      },
    };
    emit();
  };

  const toggleSound = () => {
    const next = !globalState.soundEnabled;
    sounds.enabled = next;
    globalState = {
      ...globalState,
      soundEnabled: next,
    };
    emit();
  };

  const setVibeTheme = (theme: VibeTheme) => {
    sounds.playClick(680, 0.04);
    globalState = {
      ...globalState,
      vibeTheme: theme,
    };
    const vibeLabels: Record<VibeTheme, string> = {
      nebula: 'Nebula Obsidian (Electric Violet/Cyan)',
      amber: 'Cyberdeck Amber (Retro Phosphor CRT)',
      tokyo: 'Tokyo Midnight (Synthwave Neon)',
      emerald: 'Emerald Matrix (Cybernetic Jade)',
      stealth: 'Monochrome Stealth (Titanium Minimalist)',
    };
    addActivity('System', `Aesthetic vibe recalibrated: ${vibeLabels[theme]}.`, '🎨');
    emit();
  };

  const recordDopamineRelease = (category: string, videoTitle: string, forceNotify: boolean = false) => {
    const now = Date.now();
    const shouldNotify = forceNotify || ((now - lastDopamineNotificationTime) >= 10000);
    if (shouldNotify) {
      lastDopamineNotificationTime = now;
      sounds.playDopamineChime();
    }

    const newReleases = globalState.dopamineReleases + 1;
    const notifications = [
      '🍿 Productivity successfully converted into YouTube.',
      'Congratulations. Your reward is losing another 20 minutes.',
    ];
    const chosenNotification = notifications[newReleases % notifications.length];

    globalState = {
      ...globalState,
      dopamineReleases: newReleases,
      dopamineCategory: category,
      tasksAvoided: globalState.tasksAvoided + 1,
      minutesWasted: globalState.minutesWasted + 20,
      procrastinationScore: Math.min(100, globalState.procrastinationScore + 2),
      eyeContact: {
        ...globalState.eyeContact,
        sessionActive: false,
        sessionProgress: 0,
        continuousGazeDuration: 0,
      }
    };
    if (shouldNotify) {
      addActivity('Eye Contact', `${chosenNotification} [Category: ${category} - "${videoTitle}"]`, '🍿', true, forceNotify);
    }
    emit();
  };

  const recordEyeContactSessionComplete = (durationSeconds: number) => {
    const now = Date.now();
    const shouldNotify = (now - lastSessionAchievementTime) >= 10000;
    if (shouldNotify) {
      lastSessionAchievementTime = now;
      sounds.playSavedChime();
    }

    const newCount = globalState.eyeContactSessionsCompleted + 1;
    const newTotalTime = globalState.eyeContactTime + durationSeconds;

    globalState = {
      ...globalState,
      eyeContactSessionsCompleted: newCount,
      eyeContactTime: newTotalTime,
      minutesWasted: globalState.minutesWasted + Math.max(1, Math.round(durationSeconds / 60)),
      procrastinationScore: Math.min(100, globalState.procrastinationScore + 1),
      eyeContact: {
        ...globalState.eyeContact,
        sessionProgress: 100,
        continuousGazeDuration: durationSeconds,
      }
    };
    if (shouldNotify) {
      addActivity('Eye Contact', `🎉 Eye contact session complete (${durationSeconds}s). You survived being productive!`, '🎉', true);
    }
    emit();
  };

  const setDopamineMode = (enabled: boolean) => {
    sounds.playClick(600, 0.03);
    globalState = {
      ...globalState,
      eyeContact: {
        ...globalState.eyeContact,
        dopamineMode: enabled,
      }
    };
    addActivity('Eye Contact', `Dopamine Mode set to ${enabled ? 'ON' : 'OFF'}.`, '🍿');
    emit();
  };

  const setDopamineRandomness = (randomness: 'LOW' | 'MEDIUM' | 'CHAOTIC') => {
    sounds.playClick(650, 0.03);
    globalState = {
      ...globalState,
      eyeContact: {
        ...globalState.eyeContact,
        randomness,
      }
    };
    addActivity('Eye Contact', `Dopamine Randomness set to ${randomness}.`, '🎲');
    emit();
  };

  const setSessionTargetDuration = (targetSeconds: number) => {
    sounds.playClick(500, 0.03);
    globalState = {
      ...globalState,
      eyeContact: {
        ...globalState.eyeContact,
        sessionTargetDuration: targetSeconds,
      }
    };
    emit();
  };

  const updateEyeContactSession = (updates: { active?: boolean; progress?: number; continuousGaze?: number }) => {
    globalState = {
      ...globalState,
      eyeContact: {
        ...globalState.eyeContact,
        ...(updates.active !== undefined ? { sessionActive: updates.active } : {}),
        ...(updates.progress !== undefined ? { sessionProgress: updates.progress } : {}),
        ...(updates.continuousGaze !== undefined ? { continuousGazeDuration: updates.continuousGaze } : {}),
      }
    };
    emit();
  };

  const clearBotHistory = () => {
    sounds.playClick();
    globalState = {
      ...globalState,
      uselessBot: {
        ...globalState.uselessBot,
        messages: [
          {
            id: 'msg-fresh',
            sender: 'bot',
            text: 'History wiped. Whatever you were avoiding earlier has been safely forgotten.',
            timestamp: Date.now(),
            mode: globalState.uselessBot.mode,
          }
        ],
      }
    };
    emit();
  };

  const resetSession = () => {
    globalState = {
      ...INITIAL_STATE,
      sessionStartTime: Date.now(),
      activities: [
        {
          id: 'act-reset',
          source: 'System',
          icon: '🔄',
          message: 'System recalibrated. All previous un-achievements wiped clean.',
          timestamp: Date.now(),
        },
      ],
    };
    emit();
  };

  return {
    state,
    setApp,
    addActivity,
    avoidTask,
    updateGravityCursor,
    setAlarmRinging,
    snoozeAlarm,
    setTargetAlarm,
    recordFlappyScore,
    addBotMessage,
    recordExcuseGenerated,
    setBotMode,
    clearBotHistory,
    updateEyeContactState,
    triggerAttentionEmergency,
    dismissEmergency,
    recordDopamineRelease,
    recordEyeContactSessionComplete,
    setDopamineMode,
    setDopamineRandomness,
    setSessionTargetDuration,
    updateEyeContactSession,
    toggleSound,
    setVibeTheme,
    resetSession,
  };
}
