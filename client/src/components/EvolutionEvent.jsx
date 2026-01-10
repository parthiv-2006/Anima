import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lottie from 'lottie-react';
import emberAdult from '../lotties/ember-adult.json';
import emberTeen from '../lotties/ember-teen.json';
import emberBaby from '../lotties/ember-baby.json';
import aquaBaby from '../lotties/aqua-baby.json';
import terraBaby from '../lotties/terra-baby.json';

const soundUrl = 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg';

// Map evolution media by species and stage
const EVOLUTION_MEDIA = {
  EMBER: {
    1: { type: 'lottie', data: emberBaby },
    2: { type: 'lottie', data: emberTeen },
    3: { type: 'lottie', data: emberAdult }
  },
  AQUA: {
    1: { type: 'lottie', data: aquaBaby },
    2: { type: 'img', src: '/pets/aqua/teenAqua.png' },
    3: { type: 'img', src: '/pets/aqua/aqua3rdEvol.png' }
  },
  TERRA: {
    1: { type: 'lottie', data: terraBaby },
    2: { type: 'img', src: '/pets/terra/teenTerra.png' },
    3: { type: 'img', src: '/pets/terra/terra3rdEvol.png' }
  }
};

const STAGE_LABEL = { 1: 'Baby', 2: 'Teen', 3: 'Adult' };

function EvolutionEvent({ open, onClose, nextPet, prevPet }) {
  const [phase, setPhase] = useState('intro'); // intro -> charge -> transform

  // Derived labels
  const species = nextPet?.species || prevPet?.species || 'EMBER';
  const nextStage = nextPet?.stage || ((prevPet?.stage || 1) + 1);
  const prevStage = prevPet?.stage || (nextStage - 1);
  const nickname = prevPet?.nickname || 'Your Companion';

  const mediaPrev = useMemo(() => EVOLUTION_MEDIA[species]?.[prevStage], [species, prevStage]);
  const mediaNext = useMemo(() => EVOLUTION_MEDIA[species]?.[nextStage] || EVOLUTION_MEDIA[species]?.[2], [species, nextStage]);

  useEffect(() => {
    if (open) {
      const audio = new Audio(soundUrl);
      audio.play().catch(() => undefined);
      setPhase('intro');
      const t1 = setTimeout(() => setPhase('charge'), 900);
      const t2 = setTimeout(() => setPhase('transform'), 2200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white/5 border border-white/10 rounded-3xl p-8 max-w-xl w-full overflow-hidden"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1, rotate: [0, -1, 1, 0] }}
            transition={{ type: 'spring', stiffness: 120, damping: 10 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/10 to-amber-500/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            />
            <div className="relative space-y-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Evolution Event</p>
              <h3 className="text-2xl font-semibold">{nextPet?.evolutionPath}</h3>

              {/* Evolved-from info */}
              <p className="text-sm text-slate-300">
                Evolved from <span className="font-semibold text-white">{nickname}</span> — {species} {STAGE_LABEL[prevStage]}
              </p>

              {/* Cinematic rings / particles */}
              <div className="absolute -inset-10 pointer-events-none">
                <AnimatePresence>
                  {phase !== 'intro' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.15),transparent_60%)]" />
                      <motion.div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400/40"
                        initial={{ width: 0, height: 0, opacity: 0 }}
                        animate={{ width: 280, height: 280, opacity: 1 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                      <motion.div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-500/30"
                        initial={{ width: 0, height: 0, opacity: 0 }}
                        animate={{ width: 360, height: 360, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dual preview: previous then transform to next */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center min-h-[260px]"
              >
                {phase !== 'transform' ? (
                  // Previous form - grayscale/pulse
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0.8 }}
                    animate={{ scale: [0.95, 1, 0.98], opacity: 0.85 }}
                    transition={{ duration: 0.8, repeat: phase === 'charge' ? Infinity : 0, repeatType: 'reverse' }}
                    className="saturate-0 opacity-80"
                  >
                    {mediaPrev?.type === 'img' ? (
                      <img src={mediaPrev.src} alt="Previous form" style={{ width: 240, height: 240, objectFit: 'contain' }} />
                    ) : (
                      <Lottie animationData={mediaPrev?.data || emberBaby} loop style={{ width: 240, height: 240 }} />
                    )}
                  </motion.div>
                ) : (
                  // Next form - burst in
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'backOut' }}
                  >
                    {mediaNext?.type === 'img' ? (
                      <img src={mediaNext.src} alt="Next form" style={{ width: 240, height: 240, objectFit: 'contain' }} />
                    ) : (
                      <Lottie animationData={mediaNext?.data || emberTeen} loop style={{ width: 240, height: 240 }} />
                    )}
                  </motion.div>
                )}
              </motion.div>

              <button
                onClick={onClose}
                className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm hover:bg-white/20"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EvolutionEvent;
