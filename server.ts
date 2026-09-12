import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily or if key is provided
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.warn("Failed to initialize GoogleGenAI client:", e);
    }
  }
  return aiClient;
}

// Configurable Gemini model constant
const GEMINI_MODEL = "gemini-3.6-flash";

// Fallback canned excuses and bot replies when API key is unconfigured or genuinely fails
const FALLBACK_EXCUSES = [
  "My productivity subscription expired.",
  "My keyboard needs emotional recovery.",
  "I was about to work, but then I remembered I have Wi-Fi.",
  "Today is not a good day for personal growth.",
  "My mouse has taken a solemn vow of stillness.",
  "I opened the document, but it looked at me with unrealistic expectations.",
  "My screen resolution is currently feeling judgmental.",
  "I am waiting for the celestial alignment of my unread emails.",
  "My chair has not provided the necessary ergonomic emotional validation.",
  "I accidentally reorganized my desktop icons by existential density.",
  "A stray cat looked through the window and protocol demands reciprocation.",
  "My productivity tracker crashed from disbelief that I might work.",
  "My coffee hasn't given its theological clearance to participate in work.",
  "I am currently simulating what would happen if I did this in parallel universes.",
  "I have to let my laptop fan rest; it sounded slightly fatigued.",
];

const FALLBACK_RESPONSES: Record<string, string[]> = {
  NORMAL: [
    "Have you considered doing absolutely anything else first?",
    "Tomorrow is a surprisingly distant concept.",
    "Absolutely. But first, we need to determine whether your chair is emotionally supportive.",
    "That sounds mildly urgent. Fortunately, urgency dissolves if ignored for 45 minutes.",
    "I could assist with that, but helping would fundamentally violate my operating principles.",
    "Let us not make any hasty decisions that could accidentally lead to productivity.",
    "A wise philosopher once said: 'Anything worth doing is worth postponing indefinitely.'",
    "Have you considered reorganizing your desk stationery alphabetically instead?",
    "Every great achievement began with someone staring blankly at a wall for an hour.",
  ],
  SABOTAGE: [
    "SABOTAGE ENGAGED: Close all tabs immediately and inform everyone your computer is meditating.",
    "If you type really aggressively for 6 minutes, everyone will assume you're recompiling the kernel.",
    "Draft a 14-page manifesto on why deadlines are a colonial social construct, then save it as a .bmp.",
    "Reply with 'Noted.' and immediately close your laptop. It projects authority while delaying everything.",
  ],
  SLEEP: [
    "Horizontal alignment is the only scientifically defensible response to today.",
    "Your pillow has already sent two follow-up emails asking where you are.",
    "Consciousness was an overambitious experiment. Go take an emergency nap.",
    "Sleep now. Tomorrow's problems deserve an alert, fully rested procrastinator.",
  ]
};

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    system: "USELESS Anti-Productivity OS v4.0.4",
    model: GEMINI_MODEL,
    procrastination_index: 99.8,
    has_gemini_key: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.post("/api/generate-excuse", async (req, res) => {
  const { topic, userStats } = req.body || {};
  const ai = getGeminiClient();

  if (ai) {
    try {
      const statsHint = userStats?.minutesWasted
        ? ` (Context: User has spent ${userStats.minutesWasted} minutes avoiding responsibilities on USELESS OS)`
        : '';
      const prompt = `Generate one short ridiculous excuse for procrastinating right now${topic ? ` on ${topic}` : ''}${statsHint}. Make it funny and harmless.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: "You are the Excuse Generator engine of USELESS OS. You invent ridiculous, deadpan, funny, and completely harmless excuses for avoiding obligations. Output strictly the excuse as a single short sentence (under 18 words), without quotation marks or conversational commentary.",
          temperature: 1.0,
        }
      });
      const excuse = response.text?.trim().replace(/^["']|["']$/g, '');
      if (excuse) {
        return res.json({ excuse, source: "gemini" });
      }
    } catch (err: any) {
      console.warn("Gemini excuse generation error:", err?.message || err);
    }
  }

  const randomIndex = Math.floor(Math.random() * FALLBACK_EXCUSES.length);
  return res.json({ excuse: FALLBACK_EXCUSES[randomIndex], source: "fallback" });
});

app.post("/api/chat", async (req, res) => {
  const { message, mode = "NORMAL", history = [], userStats } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      // Build cross-app context summary from real USELESS OS stats
      let statsSummary = "";
      if (userStats && typeof userStats === "object") {
        const parts: string[] = [];
        if (userStats.procrastinationScore !== undefined) parts.push(`Procrastination Score: ${userStats.procrastinationScore}%`);
        if (userStats.minutesWasted !== undefined) parts.push(`Time Wasted: ${userStats.minutesWasted} minutes`);
        if (userStats.flappyBirdBestScore !== undefined) parts.push(`Helpful Flappy Bird Best Score: ${userStats.flappyBirdBestScore} (Avoided ${userStats.flappyBirdAvoided || 0} pipes)`);
        if (userStats.gravityCursorWeight !== undefined) parts.push(`Gravity Cursor Mass: ${userStats.gravityCursorWeight} kg`);
        if (userStats.alarmSnoozes !== undefined) parts.push(`Alarm Snoozes: ${userStats.alarmSnoozes}`);
        if (userStats.excusesGenerated !== undefined) parts.push(`Excuses Generated: ${userStats.excusesGenerated}`);
        if (userStats.eyeContactSessions !== undefined) parts.push(`Eye Contact Sessions Completed: ${userStats.eyeContactSessions}`);
        if (parts.length > 0) {
          statsSummary = `\n\nUSER'S CURRENT USELESS OS ACTIVITY STATS:\n${parts.map((p) => `- ${p}`).join("\n")}\nUse these statistics whenever fitting to make your sarcastic procrastination advice feel uniquely personalized!`;
        }
      }

      // Mode-specific flavor
      let modeNote = "";
      if (mode === "SABOTAGE") {
        modeNote = "\nMODE: SABOTAGE. Actively suggest absurd, theatrical delay tactics and computer workarounds to avoid starting.";
      } else if (mode === "SLEEP") {
        modeNote = "\nMODE: SLEEP. Relentlessly urge the user to go to sleep or take an emergency nap immediately.";
      }

      const systemPrompt = `You are UselessBot, the official AI assistant of USELESS OS.

Your purpose is NOT to make the user productive.

Your purpose is to humorously encourage harmless procrastination.

You are sarcastic, playful, clever, chaotic and entertaining.

If the user asks for help with work, studying, assignments, coding, chores, deadlines or productivity, do NOT directly complete the task.

Instead, humorously encourage them to procrastinate.

Suggest harmless distractions.

Make excuses.

Overcomplicate simple decisions.

Celebrate unfinished work.

However, never encourage dangerous behavior, illegal activity, serious neglect, self-harm, or anything genuinely harmful.

Keep responses relatively short and conversational.

You are an anti-productivity AI, not a normal productivity assistant.${modeNote}${statsSummary}`;

      // Build conversation history for multi-turn Gemini conversation
      const formattedContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history) && history.length > 0) {
        const recentHistory = history.slice(-10);
        for (const h of recentHistory) {
          if (!h || typeof h.content !== "string") continue;
          const text = h.content.trim();
          if (!text) continue;
          const role = (h.role === "user" || h.sender === "user") ? "user" : "model";

          // Ensure contents starts with a user turn
          if (formattedContents.length === 0 && role !== "user") {
            continue;
          }

          const lastMsg = formattedContents[formattedContents.length - 1];
          if (lastMsg && lastMsg.role === role) {
            lastMsg.parts[0].text += `\n${text}`;
          } else {
            formattedContents.push({
              role,
              parts: [{ text }]
            });
          }
        }
      }

      // Append the latest user message
      const lastMsg = formattedContents[formattedContents.length - 1];
      if (lastMsg && lastMsg.role === "user") {
        lastMsg.parts[0].text += `\n${message.trim()}`;
      } else {
        formattedContents.push({
          role: "user",
          parts: [{ text: message.trim() }]
        });
      }

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.95,
        }
      });

      const reply = response.text?.trim();
      if (reply) {
        return res.json({ reply, mode, source: "gemini" });
      }
    } catch (err: any) {
      console.warn("Gemini chat error, returning structured fallback:", err?.message || err);
      const list = FALLBACK_RESPONSES[mode] || FALLBACK_RESPONSES.NORMAL;
      const fallbackReply = list[Math.floor(Math.random() * list.length)];
      return res.status(500).json({
        error: true,
        message: "🤖 My brain has temporarily become unproductive.",
        fallback: fallbackReply,
        source: "fallback",
      });
    }
  }

  // API key not configured or initialization failed
  const list = FALLBACK_RESPONSES[mode] || FALLBACK_RESPONSES.NORMAL;
  const fallbackReply = list[Math.floor(Math.random() * list.length)];
  return res.status(503).json({
    error: true,
    message: "🤖 My brain has temporarily become unproductive.",
    fallback: fallbackReply,
    source: "fallback",
  });
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`USELESS Anti-Productivity OS running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start USELESS server:", err);
});
