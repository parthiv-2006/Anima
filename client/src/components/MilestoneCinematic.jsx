import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '../state/uiStore.js';

// Full-screen cinematic for 7/30/100-day streak milestones:
// particle explosion, dramatic text reveal, confetti volley.
export default function MilestoneCinematic() {
  const milestone = useUiStore((s) => s.milestone);
  const setMilestone = useUiStore((s) => s.setMilestone);

  useEffect(() => {
    if (!milestone) return;
    import('canvas-confetti').then(({ default: confetti }) => {
      const fire = (delay, opts) => setTimeout(() => confetti(opts), delay);
      fire(300, { particleCount: 120, spread: 100, origin: { y: 0.6 } });
      fire(800, { particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
      fire(800, { particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
    });
    const t = setTimeout(() => setMilestone(null), 5000);
    return () => clearTimeout(t);
  }, [milestone, setMilestone]);

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMilestone(null)}
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/85 backdrop-blur-sm cursor-pointer"
        >
          {/* Radial particle explosion */}
          {[...Array(18)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              style={{ left: '50%', top: '50%' }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: Math.cos((i / 18) * Math.PI * 2) * (180 + (i % 3) * 90),
                y: Math.sin((i / 18) * Math.PI * 2) * (140 + (i % 3) * 70),
                opacity: 0,
                scale: [0, 1.6, 0.4],
                rotate: 200
              }}
              transition={{ duration: 1.6, delay: 0.25 + i * 0.03, ease: 'easeOut' }}
            >
              {i % 3 === 0 ? '🔥' : i % 3 === 1 ? '✦' : '⭐'}
            </motion.span>
          ))}

          <div className="text-center px-6">
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, letterSpacing: '0.5em' }}
              transition={{ delay: 0.15, duration: 0.8 }}
              className="text-[12px] font-bold uppercase text-yellow-200/70 mb-4"
            >
              Milestone Reached
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, scale: 2.6, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 20 }}
              className="font-cinzel font-black text-7xl text-yellow-300"
              style={{ textShadow: '0 0 40px rgba(250,204,21,0.7), 4px 4px 0 rgba(120,53,15,0.9)' }}
            >
              {milestone.days}-DAY STREAK
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mt-5 text-lg text-textPrimary font-medium"
            >
              "{milestone.habitName}" — {milestone.days >= 100 ? 'Legendary discipline.' : milestone.days >= 30 ? 'A true habit is forged.' : 'One week strong.'}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.6 }}
              className="mt-8 text-[10px] uppercase tracking-[3px] text-textMuted"
            >
              Click anywhere to continue
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
