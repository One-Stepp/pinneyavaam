export type VibeTheme = 'nebula' | 'amber' | 'tokyo' | 'emerald' | 'stealth';

export type AppId = 
  | 'overview' 
  | 'gravity-cursor' 
  | 'flappy-bird' 
  | 'anti-alarm' 
  | 'useless-bot' 
  | 'eye-contact' 
  | 'procrastination' 
  | 'settings';

export interface ActivityItem {
  id: string;
  source: 'UselessBot' | 'Helpful Flappy Bird' | 'Anti-Alarm' | 'Gravity Cursor' | 'Eye Contact' | 'System';
  icon: string;
  message: string;
  timestamp: number; // Unix timestamp
  highlight?: boolean;
}

export type UselessBotMode = 'NORMAL' | 'SABOTAGE' | 'SLEEP';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
  mode?: UselessBotMode;
}

export interface AlarmItem {
  timeStr: string; // "07:00 AM" or "12:30 PM"
  targetTimestamp: number;
  isActive: boolean;
  label: string;
}

export type DopamineRandomness = 'LOW' | 'MEDIUM' | 'CHAOTIC';

export interface UselessState {
  currentApp: AppId;
  vibeTheme: VibeTheme;
  procrastinationScore: number;
  tasksAvoided: number;
  minutesWasted: number;
  snoozesCount: number;
  excusesGenerated: number;
  dopamineReleases: number;
  dopamineCategory: string | null;
  eyeContactSessionsCompleted: number;
  eyeContactTime: number; // in seconds
  sessionStartTime: number;
  soundEnabled: boolean;
  
  // Feature states
  gravityCursor: {
    enabled: boolean;
    strength: 'low' | 'medium' | 'high' | 'extreme';
    maxWeight: number; // in kg
    increaseRate: number;
    weightRecovery: number;
    showOverlay: boolean;
    currentWeight: number;
  };
  
  flappyBird: {
    score: number;
    bestScore: number;
    pipesAvoided: number;
    gamesPlayed: number;
    secretHelpCount: number;
  };
  
  alarm: {
    nextAlarm: string;
    isRinging: boolean;
    snoozeCount: number;
    lastSnoozeMessage: string;
    targetTimestamp: number | null;
    totalDurationSeconds?: number;
    setTimestamp?: number;
  };
  
  uselessBot: {
    mode: UselessBotMode;
    messages: ChatMessage[];
    excusesList: string[];
  };
  
  eyeContact: {
    faceDetected: boolean;
    eyeContactMaintained: boolean;
    attentionStatus: 'LOCKED' | 'DISTRACTED';
    lookAwayDuration: number;
    emergencyTriggered: boolean;
    emergencyCount: number;
    dopamineMode: boolean;
    randomness: DopamineRandomness;
    sessionTargetDuration: number; // target seconds (e.g. 15s)
    sessionActive: boolean;
    sessionProgress: number; // 0 - 100
    continuousGazeDuration: number; // seconds of continuous gaze in current session
  };
  
  activities: ActivityItem[];
}
