import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
  Zap,
  Moon,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  HelpCircle,
  Coffee,
  Lightbulb
} from 'lucide-react';
import { useUselessStore } from '../../store/useUselessStore';
import { UselessBotMode } from '../../types';
import { sounds } from '../../utils/sound';
import { getSmartFallbackResponse, getRandomExcuse, RIDICULOUS_EXCUSES } from '../../data/uselessBotData';

export const UselessBot: React.FC = () => {
  const {
    state,
    setApp,
    addBotMessage,
    setBotMode,
    recordExcuseGenerated,
    clearBotHistory,
  } = useUselessStore();
  const { uselessBot } = state;

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState<string | null>(null);
  const [typingMsgId, setTypingMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGeneratingExcuse, setIsGeneratingExcuse] = useState(false);
  const [lastGeneratedExcuse, setLastGeneratedExcuse] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [uselessBot.messages, typingText, isLoading]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  // Character-by-character typewriter animation for bot responses
  const streamBotMessage = (fullText: string, mode?: UselessBotMode) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    setTypingText('');
    setIsLoading(false);

    let charIndex = 0;
    const speed = Math.max(12, Math.min(30, Math.floor(1200 / fullText.length)));

    typingTimerRef.current = setInterval(() => {
      charIndex += 1;
      setTypingText(fullText.slice(0, charIndex));

      // Occasional soft keystroke audio
      if (charIndex % 4 === 0) {
        sounds.playClick(1000 + Math.random() * 200, 0.015);
      }

      if (charIndex >= fullText.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setTypingText(null);
        addBotMessage(fullText, 'bot', mode);
        sounds.playSavedChime();
      }
    }, speed);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading || typingText !== null) return;

    sounds.playClick();
    addBotMessage(text, 'user');
    if (!textToSend) setInputVal('');
    setIsLoading(true);

    try {
      // 15-second timeout for Gemini generation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Package real-time USELESS OS activity context
      const userStats = {
        procrastinationScore: state.procrastinationScore,
        minutesWasted: state.minutesWasted,
        flappyBirdBestScore: state.flappyBird.bestScore,
        flappyBirdAvoided: state.flappyBird.pipesAvoided,
        gravityCursorWeight: state.gravityCursor.currentWeight,
        alarmSnoozes: state.alarm.snoozeCount,
        excusesGenerated: state.excusesGenerated,
        eyeContactSessions: state.eyeContactSessionsCompleted,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode: uselessBot.mode,
          history: uselessBot.messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          })),
          userStats,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      if (res.ok && data.reply) {
        streamBotMessage(data.reply, uselessBot.mode);
      } else {
        // Structured error or quota/fallback
        const fallback = data.fallback || getSmartFallbackResponse(text);
        const replyText = `🤖 My brain has temporarily become unproductive.\n\n${fallback}`;
        streamBotMessage(replyText, uselessBot.mode);
      }
    } catch {
      // API error / network / timeout fallback
      const fallbackReply = getSmartFallbackResponse(text);
      const replyText = `🤖 My brain has temporarily become unproductive.\n\n${fallbackReply}`;
      streamBotMessage(replyText, uselessBot.mode);
    }
  };

  // Dedicated Excuse Generator powered by Gemini API
  const handleGenerateExcuse = async () => {
    sounds.playClick();
    setIsGeneratingExcuse(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/generate-excuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'work, studying, assignments, and life obligations',
          userStats: {
            minutesWasted: state.minutesWasted,
            flappyBirdBestScore: state.flappyBird.bestScore,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let excuse = '';
      if (res.ok) {
        const data = await res.json();
        excuse = data.excuse?.trim() || getRandomExcuse();
      } else {
        excuse = getRandomExcuse();
      }

      setLastGeneratedExcuse(excuse);
      recordExcuseGenerated(excuse);

      // Add directly to bot conversation with typing effect
      streamBotMessage(`Excuse ready: "${excuse}"`, uselessBot.mode);
    } catch {
      const fallback = getRandomExcuse();
      setLastGeneratedExcuse(fallback);
      recordExcuseGenerated(fallback);
      streamBotMessage(`Excuse ready: "${fallback}"`, uselessBot.mode);
    } finally {
      setIsGeneratingExcuse(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    sounds.playClick(900, 0.03);
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sample prompts directly showcasing the requested personality
  const promptScenarios = [
    { label: 'I need to study.', query: 'I need to study.' },
    { label: 'Assignment due tomorrow.', query: 'I have an assignment due tomorrow.' },
    { label: 'Help me finish this project.', query: 'Help me finish this project.' },
    { label: 'My boss just emailed me.', query: 'My boss just emailed me asking for an update.' },
    { label: 'I should clean my room.', query: 'I should clean my room and do dishes.' },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12 select-none">
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
              <span className="text-xl">🤖</span>
              <h2 className="text-lg sm:text-xl font-bold font-mono tracking-wider text-white uppercase">
                USELESSBOT
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                ANTI-PRODUCTIVITY AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sarcastic, playful, and strictly dedicated to helping you postpone everything.
            </p>
          </div>
        </div>

        {/* Action Controls: Excuse Button & Mode Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main [GENERATE EXCUSE] Button */}
          <button
            id="btn-generate-excuse"
            onClick={handleGenerateExcuse}
            disabled={isGeneratingExcuse || typingText !== null}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/25 to-pink-500/25 hover:from-purple-500/35 hover:to-pink-500/35 active:scale-95 text-purple-100 border border-purple-500/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-950/40 disabled:opacity-50"
            title="Generate a ridiculous excuse to get out of work"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>[ GENERATE EXCUSE ]</span>
          </button>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
            {(['NORMAL', 'SABOTAGE', 'SLEEP'] as UselessBotMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setBotMode(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  uselessBot.mode === m
                    ? m === 'SABOTAGE'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : m === 'SLEEP'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {m === 'SABOTAGE' && '⚡ '}
                {m === 'SLEEP' && '🌙 '}
                {m}
              </button>
            ))}
          </div>

          {/* Clear History */}
          <button
            onClick={clearBotHistory}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-300 border border-white/5 transition-colors"
            title="Clear conversation history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Inefficiency Card with Latest Excuse Spotlight */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
              <span>Procrastination Engine Status</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {lastGeneratedExcuse ? `Latest excuse: "${lastGeneratedExcuse}"` : 'Ready to dismiss any obligation with surgical precision.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-[11px] font-mono text-slate-400">
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
            {state.excusesGenerated} excuses drafted
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
            {uselessBot.messages.length} messages
          </span>
        </div>
      </div>

      {/* Main Glass Chat Box */}
      <div className="rounded-3xl bg-[#0d101a]/90 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 flex flex-col h-[480px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {uselessBot.messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id ? `${msg.id}-${idx}` : `msg-${idx}`}
                className={`flex gap-3 max-w-[88%] sm:max-w-[78%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs border ${
                    isUser
                      ? 'bg-white/10 border-white/20 text-white shadow-sm'
                      : 'bg-purple-500/20 border-purple-500/30 text-purple-300 shadow-sm'
                  }`}
                >
                  {isUser ? '👤' : '🤖'}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
                    isUser
                      ? 'bg-gradient-to-br from-indigo-600/80 to-purple-600/80 border-indigo-400/30 text-white rounded-tr-sm shadow-md'
                      : 'bg-[#141829]/95 border-white/10 text-slate-200 rounded-tl-sm shadow-lg'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="text-purple-300/80">Inefficiency Guaranteed</span>
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Active Typing Stream Animation */}
          {typingText !== null && (
            <div className="flex gap-3 max-w-[88%] sm:max-w-[78%] mr-auto">
              <div className="w-8 h-8 rounded-xl shrink-0 bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center text-xs shadow-sm">
                🤖
              </div>
              <div className="relative p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed bg-[#141829]/95 border border-purple-500/30 text-slate-100 rounded-tl-sm shadow-lg">
                <p className="whitespace-pre-wrap font-sans">
                  {typingText}
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-purple-400 animate-pulse align-middle" />
                </p>
                <div className="mt-2 text-[10px] text-purple-400 font-mono">
                  UselessBot is typing...
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator when awaiting response */}
          {isLoading && typingText === null && (
            <div className="flex gap-3 max-w-[75%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl shrink-0 bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center text-xs shadow-sm">
                🤖
              </div>
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#141829]/95 border border-purple-500/20 text-xs text-slate-200 flex items-center gap-2 shadow-md">
                <span className="font-mono text-xs text-purple-300 font-medium">
                  UselessBot is thinking...
                </span>
                <span className="flex items-center gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Scenario Chips */}
        <div className="px-4 py-2 bg-black/30 border-t border-white/6 flex items-center gap-2 overflow-x-auto text-[11px] font-mono scrollbar-none">
          <span className="text-slate-400 text-[10px] shrink-0 font-bold uppercase tracking-wider">
            Test:
          </span>
          {promptScenarios.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.query)}
              disabled={isLoading || typingText !== null}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white transition-all border border-white/5 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-black/40 border-t border-white/6 flex items-end gap-2">
          <textarea
            rows={1}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tell UselessBot what you're supposed to be doing... (Enter to send, Shift+Enter for new line)"
            disabled={isLoading || typingText !== null}
            className="flex-1 bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-purple-400 transition-colors font-sans disabled:opacity-50 resize-none min-h-[42px] max-h-28"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputVal.trim() || isLoading || typingText !== null}
            className="px-4 py-2.5 h-[42px] rounded-xl bg-purple-500/25 hover:bg-purple-500/35 disabled:opacity-40 active:scale-95 text-purple-200 border border-purple-500/40 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
