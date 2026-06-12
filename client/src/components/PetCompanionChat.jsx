import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, CheckCircle, XCircle, Zap } from 'lucide-react';
import { ai } from '../services/api.js';

const SPECIES_META = {
  EMBER: { emoji: '🔥', label: 'Ember Spirit', accent: '#fb923c' },
  AQUA:  { emoji: '💧', label: 'Aqua Spirit',  accent: '#22d3ee' },
  TERRA: { emoji: '🌿', label: 'Terra Spirit', accent: '#34d399' }
};

const STAGE_EMOJI = { 1: '✨', 2: '⚡', 3: '👑' };

const STAT_COLORS = { STR: '#ef4444', INT: '#818cf8', SPI: '#34d399' };
const STAT_LABELS = { STR: '⚔ Strength', INT: '📚 Intellect', SPI: '🌿 Spirit' };
const DIFF_LABELS = { 1: 'Easy', 2: 'Moderate', 3: 'Legendary' };

const STARTER_PROMPTS = [
  'Create me a morning routine',
  'Add a workout habit for me',
  'What should I focus on today?',
  'How do I evolve faster?'
];

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--sp-accent)' }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

// ─── Tool confirmation card ───────────────────────────────────────────────────
function ConfirmationCard({ toolCall, onConfirm, onDeny, disabled }) {
  const { name, args } = toolCall;

  const isRoutine = name === 'suggest_morning_routine';
  const habits = isRoutine ? (args.habits || []) : [args];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: 'var(--sp-border)', background: 'var(--sp-soft)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: 'var(--sp-border)' }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--sp-accent)' }}
        >
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-textMuted">
            Action Required
          </div>
          <div className="text-sm font-bold text-textPrimary">
            {isRoutine ? `Create ${habits.length} habits` : 'Create a habit'}
          </div>
        </div>
      </div>

      {/* Habit list */}
      <div className="px-4 py-3 space-y-2">
        {habits.map((h, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: STAT_COLORS[h.statCategory] || '#888' }}
              />
              <span className="text-[13px] text-textPrimary font-medium truncate">{h.name}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                style={{ color: STAT_COLORS[h.statCategory], borderColor: STAT_COLORS[h.statCategory] + '40', background: STAT_COLORS[h.statCategory] + '15' }}
              >
                {STAT_LABELS[h.statCategory]?.split(' ')[0]}
              </span>
              <span className="text-[10px] text-textMuted font-semibold">
                {DIFF_LABELS[h.difficulty] || 'Easy'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onConfirm}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
          style={{ background: 'var(--sp-accent)' }}
        >
          <CheckCircle className="w-4 h-4" />
          Confirm
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onDeny}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-textMuted bg-surfaceElevated border border-borderSubtle transition hover:border-white/20 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          Cancel
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Chat message ─────────────────────────────────────────────────────────────
function ChatMessage({ msg, metaEmoji }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span
          className="text-[11px] font-semibold px-3 py-1 rounded-full border"
          style={{ color: 'var(--sp-accent)', borderColor: 'var(--sp-border)', background: 'var(--sp-soft)' }}
        >
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5`}
    >
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-0.5"
          style={{ background: 'var(--sp-soft)', border: '1px solid var(--sp-border)' }}
        >
          {metaEmoji}
        </div>
      )}
      <div
        data-testid={!isUser ? 'pet-message' : undefined}
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-accentAmber/15 border border-accentAmber/25 text-textPrimary rounded-tr-sm'
            : 'bg-surfaceElevated border text-textPrimary rounded-tl-sm'
        }`}
        style={!isUser ? { borderColor: 'var(--sp-border)', boxShadow: '0 0 12px var(--sp-soft)' } : {}}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PetCompanionChat({ pet, habits, onRefresh }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const species = pet?.species || 'EMBER';
  const meta = SPECIES_META[species] || SPECIES_META.EMBER;
  const stageEmoji = STAGE_EMOJI[pet?.stage] || '✨';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, pendingConfirmation]);

  // ── Send a user message through the agentic loop ──────────────────────────
  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await ai.agentChat({ message: trimmed, chatHistory: messages });

      if (response.type === 'pending_confirmation') {
        // Model wants to call a tool — show confirmation card
        if (response.assistantMessage) {
          setMessages(prev => [...prev, { role: 'assistant', content: response.assistantMessage }]);
        }
        setPendingConfirmation({
          toolCall: response.toolCall,
          chatHistory: updatedHistory
        });
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'The spirits are restless… the connection was lost. Try again.'
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  // ── User confirms the pending tool call ───────────────────────────────────
  async function handleConfirm() {
    if (!pendingConfirmation) return;
    const { toolCall, chatHistory } = pendingConfirmation;
    setPendingConfirmation(null);
    setLoading(true);

    try {
      const response = await ai.agentChat({
        message: '',
        chatHistory,
        confirmedToolCall: toolCall
      });

      if (response.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
      }

      if (response.sideEffect) {
        const { type, count } = response.sideEffect;
        const label =
          type === 'habit_created' ? '1 quest added to your board!' :
          type === 'habits_created' ? `${count} quests added to your board!` :
          'Quest board updated!';
        setMessages(prev => [...prev, { role: 'system', content: `✦ ${label}` }]);
        onRefresh?.();
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong while creating your habit. Try again.'
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  // ── User cancels the pending tool call ────────────────────────────────────
  function handleDeny() {
    setPendingConfirmation(null);
    setMessages(prev => [...prev, {
      role: 'system',
      content: 'Action cancelled — nothing was changed.'
    }]);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isEmpty = messages.length === 0 && !pendingConfirmation;

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 flex items-center gap-4 p-5 pb-4 border-b border-borderSubtle">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0"
          style={{ background: 'var(--sp-soft)', border: '1px solid var(--sp-border)', boxShadow: '0 0 20px var(--sp-glow)' }}
        >
          {meta.emoji}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-xl font-bold text-textPrimary font-cinzel">{pet?.nickname || 'Nova'}</h2>
            <span
              className="text-[10px] font-bold tracking-widest uppercase rounded-full px-2 py-0.5 border"
              style={{ color: 'var(--sp-accent)', background: 'var(--sp-soft)', borderColor: 'var(--sp-border)' }}
            >
              {stageEmoji} Stage {pet?.stage || 1}
            </span>
          </div>
          <div className="text-[11px] text-textMuted font-bold tracking-[1.5px] uppercase flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" style={{ color: 'var(--sp-accent)' }} />
            {meta.label} · Agentic Companion
          </div>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-none">
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-4"
            >
              <div
                className="rounded-2xl p-5 text-center"
                style={{ background: 'var(--sp-soft)', border: '1px solid var(--sp-border)' }}
              >
                <div className="text-4xl mb-3">{meta.emoji}</div>
                <p className="text-textPrimary font-cinzel font-bold text-lg mb-1">{pet?.nickname || 'Nova'} awaits</p>
                <p className="text-textMuted text-sm">Ask anything — or say "create me a morning routine" to watch the magic happen.</p>
                <div
                  className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border"
                  style={{ color: 'var(--sp-accent)', borderColor: 'var(--sp-border)', background: 'var(--sp-soft)' }}
                >
                  <Zap className="w-3 h-3" /> Agentic Mode — can create your habits
                </div>
              </div>
              <div>
                <p className="text-[10px] text-textMuted font-bold tracking-[2px] uppercase mb-3 text-center">Try asking…</p>
                <div className="grid grid-cols-2 gap-2">
                  {STARTER_PROMPTS.map(prompt => (
                    <motion.button
                      key={prompt}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-[12px] text-textPrimary bg-surfaceElevated border border-borderSubtle hover:border-[var(--sp-border)] rounded-xl px-3 py-2.5 transition-all leading-snug"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        {messages.map((msg, i) => (
          <ChatMessage key={i} msg={msg} metaEmoji={meta.emoji} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start gap-2.5"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'var(--sp-soft)', border: '1px solid var(--sp-border)' }}
            >
              {meta.emoji}
            </div>
            <div
              className="bg-surfaceElevated border rounded-2xl rounded-tl-sm"
              style={{ borderColor: 'var(--sp-border)' }}
            >
              <TypingDots />
            </div>
          </motion.div>
        )}

        {/* Confirmation card */}
        <AnimatePresence>
          {pendingConfirmation && (
            <ConfirmationCard
              toolCall={pendingConfirmation.toolCall}
              onConfirm={handleConfirm}
              onDeny={handleDeny}
              disabled={loading}
            />
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 p-4 pt-3 border-t border-borderSubtle">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${pet?.nickname || 'your companion'} or say "create me a habit"…`}
            rows={1}
            disabled={loading}
            className="flex-1 bg-surfaceElevated border border-borderSubtle hover:border-[var(--sp-border)] focus:border-[var(--sp-border)] rounded-xl px-4 py-3 text-sm text-textPrimary placeholder-textMuted resize-none outline-none transition-colors scrollbar-none disabled:opacity-50"
            style={{ maxHeight: '100px' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--sp-accent)', boxShadow: '0 0 14px var(--sp-glow)' }}
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
        <p className="text-[10px] text-textMuted mt-2 text-center">
          Enter to send · Shift+Enter for new line · Companion can create habits for you
        </p>
      </div>
    </div>
  );
}
