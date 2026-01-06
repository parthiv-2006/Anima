import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lottie from 'lottie-react';
import emberAdult from '../lotties/ember-adult.json';
import emberTeen from '../lotties/ember-teen.json';

const soundUrl = 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg';

// Map evolution media by species and stage
const EVOLUTION_MEDIA = {
  EMBER: {
    2: { type: 'lottie', data: emberTeen },
    3: { type: 'lottie', data: emberAdult }
  },
  AQUA: {
    2: { type: 'img', src: '/pets/aqua/teenAqua.png' }
  },
  TERRA: {
    2: { type: 'img', src: '/pets/terra/teenTerra.png' }
  }
};

function EvolutionEvent({ open, onClose, nextPet }) {
  useEffect(() => {
    if (open) {
      const audio = new Audio(soundUrl);
      audio.play().catch(() => undefined);
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
            className="relative bg-white/5 border border-white/10 rounded-3xl p-8 max-w-lg w-full overflow-hidden"
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: [1, 1.1, 1] }}
                transition={{ delay: 0.3, duration: 1 }}
                className="flex items-center justify-center"
              >
                {(() => {
                  const species = nextPet?.species || 'EMBER';
                  const stage = nextPet?.stage || 2;
                  const media = EVOLUTION_MEDIA[species]?.[stage];
                  if (!media) {
                    // Fallback to ember teen lottie
                    return <Lottie animationData={emberTeen} loop style={{ width: 240, height: 240 }} />;
                  }
                  if (media.type === 'img') {
                    return (
                      <img
                        src={media.src}
                        alt={`${species} stage ${stage}`}
                        style={{ width: 240, height: 240, objectFit: 'contain' }}
                      />
                    );
                  }
                  return <Lottie animationData={media.data} loop style={{ width: 240, height: 240 }} />;
                })()}
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
