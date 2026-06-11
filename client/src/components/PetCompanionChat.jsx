import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { ai } from '../services/api.js';

const SPECIES_META = {
  EMBER: { emoji: '🔥', label: 'Ember Spirit', accent: '#fb923c' },
  AQUA:  { emoji: '💧', label: 'Aqua Spirit',  accent: '#22d3ee' },
  TERRA: { emoji: '🌿', label: 'Terra Spirit', accent: '#34d399' }
};

const STAGE_EMOJI = { 1: '✨', 2: '⚡', 3: '👑' };

const STARTER_PROMPTS = [
  'What should I focus on today?',
  'Why is my SPI so low?',
  'How do I evolve faster?',
  'Rate my progress so far.'
];

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

export default function PetCompanionChat({ pet, habits }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const species = pet?.species || 'EMBER';
  const meta = SPECIES_META[species] || SPECIES_META.EMBER;
  const stageEmoji = STAGE_EMOJI[pet?.stage] || '✨';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg];
      const { reply } = await ai.chat(trimmed, history.slice(0, -1));
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'The spirits are restless... the connection was lost. Try again.'
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      {/* Header */}
      <div
        className="shrink-0 flex items-center gap-4 p-5 pb-4 border-b border-borderSubtle"
      >
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
            {meta.label} · Your AI Companion
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-none">
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-4"
            >
              {/* Welcome card */}
              <div
                className="rounded-2xl p-5 text-center"
                style={{ background: 'var(--sp-soft)', border: '1px solid var(--sp-border)' }}
              >
                <div className="text-4xl mb-3">{meta.emoji}</div>
                <p className="text-textPrimary font-cinzel font-bold text-lg mb-1">{pet?.nickname || 'Nova'} awaits</p>
                <p className="text-textMuted text-sm">Ask your companion anything — they know your stats, quests, and journey.</p>
              </div>

              {/* Starter chips */}
              <div>
                <p className="text-[10px] text-textMuted font-bold tracking-[2px] uppercase mb-3 text-center">Try asking...</p>
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
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2.5`}
          >
            {msg.role === 'assistant' && (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                style={{ background: 'var(--sp-soft)', border: '1px solid var(--sp-border)' }}
              >
                {meta.emoji}
              </div>
            )}
            <div
              data-testid={msg.role === 'assistant' ? 'pet-message' : undefined}
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accentAmber/15 border border-accentAmber/25 text-textPrimary rounded-tr-sm'
                  : 'bg-surfaceElevated border text-textPrimary rounded-tl-sm'
              }`}
              style={msg.role === 'assistant' ? { borderColor: 'var(--sp-border)', boxShadow: '0 0 12px var(--sp-soft)' } : {}}
            >
              {msg.content}
            </div>
          </motion.div>
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

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 p-4 pt-3 border-t border-borderSubtle">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${pet?.nickname || 'your companion'}...`}
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
        <p className="text-[10px] text-textMuted mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
