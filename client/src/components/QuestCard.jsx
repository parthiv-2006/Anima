import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categoryConfig = {
  STR: { 
    gradient: 'from-red-500/20 to-orange-500/10', 
    border: 'border-l-red-500',
    accent: 'text-red-400',
    glow: 'shadow-red-500/20'
  },
  INT: { 
    gradient: 'from-blue-500/20 to-cyan-500/10', 
    border: 'border-l-blue-500',
    accent: 'text-blue-400',
    glow: 'shadow-blue-500/20'
  },
  SPI: { 
    gradient: 'from-emerald-500/20 to-green-500/10', 
    border: 'border-l-emerald-500',
    accent: 'text-emerald-400',
    glow: 'shadow-emerald-500/20'
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
        className={`relative w-full text-left bg-slate-800/50 backdrop-blur-sm border-l-4 ${config.border} rounded-xl p-4 overflow-hidden transition-all duration-300 ${
          habit.isCompletedToday
            ? 'opacity-60 cursor-not-allowed border-r border-t border-b border-green-500/30'
            : `border-r border-t border-b border-white/5 hover:border-white/10 hover:shadow-lg ${config.glow}`
        }`}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-50`} />
        
        {/* Content */}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${config.accent}`}>
                {habit.statCategory}
              </span>
              {habit.streak > 0 && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                  <span>🔥</span> {habit.streak}
                </span>
              )}
            </div>
            <p className="font-semibold text-white truncate">{habit.name}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-400">
                {'★'.repeat(habit.difficulty)}{'☆'.repeat(3 - habit.difficulty)}
              </span>
              <span className="text-xs text-slate-400">+{xpReward} XP</span>
              <span className={`text-xs ${config.accent}`}>+{statReward} {habit.statCategory}</span>
            </div>
          </div>
          
          {/* Completion indicator */}
          {habit.isCompletedToday ? (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <span className="text-green-400 text-sm">✓</span>
            </div>
          ) : (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-colors">
              <span className="text-slate-400 group-hover:text-amber-400 text-sm transition-colors">▶</span>
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
          className="p-1 rounded hover:bg-white/10 transition text-slate-400 hover:text-slate-200"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden"
            >
              {habit.isCompletedToday && (
                <button
                  onClick={handleReset}
                  className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/10 transition"
                >
                  ↺ Reset
                </button>
              )}
              <button
                onClick={handleDelete}
                className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition"
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
