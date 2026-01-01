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

function QuestCard({ habit, onComplete }) {
  const [isDone, setIsDone] = useState(false);
  const [floatKey, setFloatKey] = useState(0);

  const handleClick = async () => {
    setIsDone(true); // optimistic
    setFloatKey((k) => k + 1);
    onComplete?.(habit);
    await triggerConfetti();
    setTimeout(() => setIsDone(false), 1200);
  };

  return (
    <button
      onClick={handleClick}
      className={`relative w-full text-left bg-white/5 border border-white/10 rounded-2xl p-4 overflow-hidden transition hover:border-white/20 hover:shadow-lg hover:shadow-amber-500/10`}
    >
      <div className={`absolute inset-0 opacity-60 bg-gradient-to-r ${categoryColor[habit.statCategory]}`} />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-200">{habit.statCategory} Quest</p>
          <p className="text-lg font-semibold">{habit.name}</p>
          <p className="text-xs text-slate-100/80">Difficulty {habit.difficulty}</p>
        </div>
        <div className="text-right text-sm text-slate-100">
          <p>+{habit.reward.xp} XP</p>
          <p className="text-xs text-slate-200">Instant gain</p>
        </div>
      </div>

      <AnimatePresence>
        {isDone && (
          <motion.span
            key={floatKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: -18 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
            className="absolute right-4 bottom-2 text-sm font-semibold"
          >
            +{habit.reward[habit.statCategory.toLowerCase()] || 10} {habit.statCategory}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export default QuestCard;
