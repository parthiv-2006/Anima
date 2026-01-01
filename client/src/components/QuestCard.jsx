import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categoryColor = {
  STR: 'from-amber-500/80 to-red-500/70',
  INT: 'from-sky-500/80 to-blue-500/70',
  SPI: 'from-emerald-500/80 to-lime-500/70'
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

  return (
    <div className="relative">
      <button
        onClick={handleComplete}
        disabled={habit.isCompletedToday}
        className={`relative w-full text-left bg-white/5 border rounded-2xl p-4 overflow-hidden transition ${
          habit.isCompletedToday
            ? 'border-green-500/30 bg-green-500/5 opacity-75 cursor-not-allowed'
            : 'border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-amber-500/10'
        }`}
      >
        <div className={`absolute inset-0 opacity-60 bg-gradient-to-r ${categoryColor[habit.statCategory]}`} />
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-200">{habit.statCategory} Quest</p>
            <p className="text-lg font-semibold">{habit.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-slate-100/80">Difficulty {habit.difficulty}</p>
              {habit.streak > 0 && (
                <p className="text-xs text-amber-300">🔥 {habit.streak} day streak</p>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-slate-100">
            <p>+{xpReward} XP</p>
            <p className="text-xs text-slate-200">+{statReward} {habit.statCategory}</p>
          </div>
        </div>

        {habit.isCompletedToday && (
          <div className="absolute top-3 right-3 bg-green-500/20 border border-green-500/30 rounded-full px-2 py-1">
            <p className="text-xs text-green-300 font-semibold">✓ Done</p>
          </div>
        )}

        <AnimatePresence>
          {!habit.isCompletedToday && (
            <motion.span
              key={floatKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: -18 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="absolute right-4 bottom-2 text-sm font-semibold"
            >
              +{statReward} {habit.statCategory}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

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
