export interface FallbackRule {
  keywords: string[];
  responses: string[];
}

export const RIDICULOUS_EXCUSES: string[] = [
  "My productivity subscription expired.",
  "My keyboard needs emotional recovery.",
  "I was about to work, but then I remembered I have Wi-Fi.",
  "Today is not a good day for personal growth.",
  "My mouse has taken a solemn vow of stillness.",
  "I opened the document, but it looked at me with unrealistic expectations.",
  "My screen resolution is currently feeling judgmental.",
  "I am waiting for the celestial alignment of my unread emails.",
  "My chair has not provided the necessary ergonomic emotional validation.",
  "I was going to type, but the alphabet felt aggressive.",
  "I accidentally reorganized my desktop icons by existential density.",
  "A dust mote drifted past in a very thought-provoking trajectory.",
  "My coffee hasn't given me official clearance to participate in capitalism.",
  "I have to let my laptop fan rest; it sounded slightly fatigued.",
  "I'm currently conducting an audit of my ceiling texture.",
  "I'm mentally preparing for the work I will postpone tomorrow.",
  "My brain has entered an unskippable 45-minute cutscene.",
  "I need to wash this solitary coffee mug before I can possibly draft an email.",
  "I suspect my Wi-Fi router is silently disapproving of my ambitions.",
  "I cannot begin until I find the exact right playlist of songs with no lyrics.",
];

export const SMART_FALLBACK_RULES: FallbackRule[] = [
  {
    keywords: ["study", "exam", "test", "revise", "school", "college", "class"],
    responses: [
      "Absolutely. But first, we need to determine whether your chair is emotionally supportive.",
      "Knowledge is great, but have you considered that ignorance requires zero flashcards?",
      "Studying now would be rash. What if the syllabus spontaneously reconsiders itself?",
      "I recommend reviewing your desk stationery for 90 minutes before opening any textbooks.",
    ],
  },
  {
    keywords: ["assignment", "due", "tomorrow", "deadline", "urgent", "submit", "paper"],
    responses: [
      "Tomorrow is a surprisingly distant concept.",
      "Deadlines are merely arbitrary milestones suggested by people with too much adrenaline.",
      "If you leave it until the last minute, it only takes a minute.",
      "A true visionary never finishes an assignment before the panic is fully ripe.",
    ],
  },
  {
    keywords: ["project", "finish", "complete", "help me", "start", "task"],
    responses: [
      "Have you considered doing absolutely anything else first?",
      "I would love to help, but helping you would fundamentally undermine my core values.",
      "Starting a project without pacing your room for 20 minutes is reckless.",
      "Let's break this project down into manageable steps: Step 1, close the laptop.",
    ],
  },
  {
    keywords: ["code", "bug", "program", "developer", "git", "commit", "javascript", "python"],
    responses: [
      "That bug has constitutional rights to exist. Do not disturb its habitat.",
      "Have you tried restarting your determination? It looks corrupted.",
      "A true 10x engineer solves problems by waiting until the requirements change.",
      "Stare deeply into the syntax error until it achieves enlightenment.",
    ],
  },
  {
    keywords: ["email", "slack", "message", "reply", "boss", "manager", "client"],
    responses: [
      "Replying immediately sets a dangerous precedent of responsiveness.",
      "Mark it as unread and let it marinate. Urgency is subjective.",
      "A vague 'Noted.' sent tomorrow morning carries far more executive mystique.",
      "Tell them your keyboard is undergoing spiritual calibration.",
    ],
  },
  {
    keywords: ["clean", "chore", "dishes", "laundry", "room", "cook", "gym", "workout"],
    responses: [
      "Dust is merely history settling down for a nap. Respect its rest.",
      "The dishes will still be there tomorrow, proving their admirable loyalty.",
      "Physical exertion is an interesting theory, but the couch is an established fact.",
      "Hydrate, sit down, and reconsider your reckless ambition.",
    ],
  },
  {
    keywords: ["tired", "sleep", "nap", "exhausted", "bed", "rest"],
    responses: [
      "Horizontal alignment is the only scientifically sound response to today.",
      "Your pillow filed an official missing person report. Go investigate.",
      "Consciousness was an overambitious experiment anyway. Take a nap.",
      "Sleep now. Tomorrow's problems deserve an alert, fully rested procrastinator.",
    ],
  },
];

export const GENERAL_FALLBACK_RETORTS: string[] = [
  "Have you considered doing absolutely anything else first?",
  "That sounds important. Therefore, we should ignore it immediately.",
  "I could assist, but I have a profound moral objection to productivity.",
  "Let's not make any hasty decisions that could lead to things getting done.",
  "A wise philosopher once said: 'Tomorrow is another opportunity to postpone.'",
  "Your dedication to almost working is truly inspiring.",
  "Let us pause and appreciate how peaceful not doing that task feels.",
  "I'm diagnosing this moment with an acute shortage of snacks.",
  "Every great achievement began with someone staring blankly at a wall for an hour.",
  "Why solve a problem today when you can stress about it all weekend?",
];

export function getSmartFallbackResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  // Match keyword rules
  for (const rule of SMART_FALLBACK_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      const responses = rule.responses;
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Exact matches for prompt examples
  if (lower.includes("need to study")) {
    return "Absolutely. But first, we need to determine whether your chair is emotionally supportive.";
  }
  if (lower.includes("assignment due tomorrow") || lower.includes("due tomorrow")) {
    return "Tomorrow is a surprisingly distant concept.";
  }
  if (lower.includes("help me finish") || lower.includes("finish this project")) {
    return "Have you considered doing absolutely anything else first?";
  }

  // Random general retort
  return GENERAL_FALLBACK_RETORTS[Math.floor(Math.random() * GENERAL_FALLBACK_RETORTS.length)];
}

export function getRandomExcuse(): string {
  return RIDICULOUS_EXCUSES[Math.floor(Math.random() * RIDICULOUS_EXCUSES.length)];
}
