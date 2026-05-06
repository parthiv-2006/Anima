import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categoryConfig = {
  STR: { 
    gradient: 'from-statSTR/20 to-statSTR/5', 
    border: 'border-l-statSTR',
    accent: 'text-statSTR',
    glow: 'shadow-[0_0_8px_rgba(232,160,32,0.4)]'
  },
  INT: { 
    gradient: 'from-statINT/20 to-statINT/5', 
    border: 'border-l-statINT',
    accent: 'text-statINT',
    glow: 'shadow-[0_0_8px_rgba(59,130,246,0.4)]'
  },
  SPI: { 
    gradient: 'from-statSPI/20 to-statSPI/5', 
    border: 'border-l-statSPI',
    accent: 'text-statSPI',
    glow: 'shadow-[0_0_8px_rgba(34,197,94,0.4)]'
  }
};

async function triggerConfetti() {
  const confetti = (await import('canvas-confetti')).default;
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.7 }
  });
}

function QuestCard({ habit, onComplete, onReset, onDelete }) {
  const [floatKey, setFloatKey] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const handleComplete = async (e) => {
    e.stopPropagation();
    if (habit.isCompletedToday) return; // Already completed

    setFloatKey((k) => k + 1);
    onComplete?.(habit);
    await triggerConfetti();
  };

  const handleReset = (e) => {
    e.stopPropagation();
    onReset?.(habit);
    setShowMenu(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${habit.name}"?`)) {
      onDelete?.(habit);
    }
    setShowMenu(false);
  };

  // Calculate XP reward (10 * difficulty)
  const xpReward = 10 * habit.difficulty;
  const statReward = 5 * habit.difficulty;
  const config = categoryConfig[habit.statCategory] || categoryConfig.STR;

  return (
    <div className="relative group">
      <motion.button
        onClick={handleComplete}
        disabled={habit.isCompletedToday}
        whileHover={{ scale: habit.isCompletedToday ? 1 : 1.02, y: habit.isCompletedToday ? 0 : -2 }}
        whileTap={{ scale: habit.isCompletedToday ? 1 : 0.98 }}
        className={`relative w-full text-left bg-surfaceElevated backdrop-blur-sm border-l-[3px] ${config.border} rounded-[12px] p-4 overflow-hidden transition-all duration-300 ${
          habit.isCompletedToday
            ? 'opacity-50 cursor-not-allowed border-r border-t border-b border-success/30 line-through'
            : `border-r border-t border-b border-borderSubtle hover:border-borderSubtle hover:${config.glow}`
        }`}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-50`} />
        
        {/* Content */}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${config.accent}`}>
                {habit.statCategory}
              </span>
              {habit.streak > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-accentAmber bg-accentAmber/10 px-2 py-0.5 rounded-md border border-accentAmber/20">
                  <span>🔥</span> {habit.streak}
                </span>
              )}
            </div>
            <p className={`font-semibold text-textPrimary truncate ${habit.isCompletedToday ? 'text-textMuted' : ''}`}>{habit.name}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-accentAmber">
                {'★'.repeat(habit.difficulty)}<span className="text-textMuted">{'★'.repeat(3 - habit.difficulty)}</span>
              </span>
              <span className="text-xs text-accentAmber font-bold">+{xpReward} XP</span>
              <span className={`text-xs font-bold ${config.accent}`}>+{statReward} {habit.statCategory}</span>
            </div>
          </div>
          
          {/* Completion indicator */}
          {habit.isCompletedToday ? (
            <div className="flex-shrink-0 w-6 h-6 rounded-md bg-success/20 border border-success/30 flex items-center justify-center shadow-[0_0_8px_rgba(34,197,94,0.4)]">
              <span className="text-success text-sm font-bold">✓</span>
            </div>
          ) : (
            <div className="flex-shrink-0 w-6 h-6 rounded-md bg-transparent border border-borderSubtle flex items-center justify-center group-hover:bg-success/10 group-hover:border-success/30 transition-colors">
            </div>
          )}
        </div>

        {/* Float animation for completion */}
        <AnimatePresence>
          {!habit.isCompletedToday && floatKey > 0 && (
            <motion.span
              key={floatKey}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className={`absolute right-4 top-1/2 text-sm font-bold ${config.accent}`}
            >
              +{xpReward} XP
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Action Menu */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded hover:bg-surface transition text-textMuted hover:text-textPrimary"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 mt-1 bg-surface border border-borderSubtle rounded-lg shadow-xl overflow-hidden"
            >
              {habit.isCompletedToday && (
                <button
                  onClick={handleReset}
                  className="block w-full px-4 py-2 text-left text-sm text-textPrimary hover:bg-surfaceElevated transition"
                >
                  ↺ Reset
                </button>
              )}
              <button
                onClick={handleDelete}
                className="block w-full px-4 py-2 text-left text-sm text-accentRust hover:bg-accentRust/10 transition"
              >
                🗑 Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default QuestCard;
