import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const PET_IMAGES = {
  EMBER: '/pets/fire/babyfire-removebg-preview.png',
  AQUA: '/pets/aqua/babyAqua-removebg-preview.png',
  TERRA: '/pets/terra/babyTerra-removebg-preview.png'
};

const ANIMATION_STATES = {
  IDLE: 'idle',
  BOUNCE: 'bounce',
  SLEEP: 'sleep',
  WIGGLE: 'wiggle',
  FLOAT: 'float'
};

export default function AnimatedPet({ species, totalXp, stage }) {
  const [animationState, setAnimationState] = useState(ANIMATION_STATES.IDLE);
  const [isSleeping, setIsSleeping] = useState(false);
  const [showZzz, setShowZzz] = useState(false);

  useEffect(() => {
    const changeAnimation = () => {
      const animations = [
        { state: ANIMATION_STATES.IDLE, duration: 4000, weight: 40 },
        { state: ANIMATION_STATES.BOUNCE, duration: 2000, weight: 20 },
        { state: ANIMATION_STATES.SLEEP, duration: 6000, weight: 15 },
        { state: ANIMATION_STATES.WIGGLE, duration: 1500, weight: 15 },
        { state: ANIMATION_STATES.FLOAT, duration: 4000, weight: 10 }
      ];

      const totalWeight = animations.reduce((sum, anim) => sum + anim.weight, 0);
      let random = Math.random() * totalWeight;
      let selected = animations[0];

      for (const anim of animations) {
        random -= anim.weight;
        if (random <= 0) {
          selected = anim;
          break;
        }
      }

      setAnimationState(selected.state);
      setIsSleeping(selected.state === ANIMATION_STATES.SLEEP);
      setShowZzz(selected.state === ANIMATION_STATES.SLEEP);

      setTimeout(changeAnimation, selected.duration);
    };

    const timeout = setTimeout(changeAnimation, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const getAnimationVariants = () => {
    switch (animationState) {
      case ANIMATION_STATES.BOUNCE:
        return {
          animate: {
            y: [0, -30, 0, -15, 0],
            rotate: [0, -5, 0, 5, 0],
            transition: { duration: 1.2, repeat: 1, ease: 'easeOut' }
          }
        };

      case ANIMATION_STATES.SLEEP:
        return {
          animate: {
            y: [0, 5, 0],
            scale: [1, 0.98, 1],
            transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }
        };

      case ANIMATION_STATES.WIGGLE:
        return {
          animate: {
            rotate: [0, -10, 10, -8, 8, -5, 5, 0],
            x: [0, -5, 5, -3, 3, 0],
            transition: { duration: 0.8, ease: 'easeInOut' }
          }
        };

      case ANIMATION_STATES.FLOAT:
        return {
          animate: {
            y: [0, -20, 0],
            x: [0, 10, -10, 0],
            rotate: [0, 3, -3, 0],
            transition: { duration: 4, repeat: 1, ease: 'easeInOut' }
          }
        };

      default:
        return {
          animate: {
            y: [0, -8, 0],
            scale: [1, 1.02, 1],
            transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
          }
        };
    }
  };

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <AnimatePresence>
        {showZzz && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20, y: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: [20, 40, 60],
                  y: [0, -20, -40],
                  scale: [0.5, 1, 1.2]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
                className="absolute top-1/4 right-1/3 text-2xl pointer-events-none"
              >
                💤
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.div className="relative" variants={getAnimationVariants()} animate="animate">
        <motion.div
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black/20 rounded-full blur-md"
          animate={{
            scale: animationState === ANIMATION_STATES.BOUNCE ? [1, 0.8, 1, 0.9, 1] : [1, 0.95, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: animationState === ANIMATION_STATES.BOUNCE ? 1.2 : 2.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        <motion.div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl opacity-50"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:
                species === 'EMBER'
                  ? 'radial-gradient(circle, rgba(251, 146, 60, 0.5) 0%, transparent 70%)'
                  : species === 'AQUA'
                  ? 'radial-gradient(circle, rgba(56, 189, 248, 0.5) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(74, 222, 128, 0.5) 0%, transparent 70%)'
            }}
          />

          <motion.img
            src={PET_IMAGES[species]}
            alt={`${species} pet`}
            className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl"
            style={{
              filter: isSleeping ? 'brightness(0.7) grayscale(0.3)' : 'brightness(1)',
              imageRendering: 'crisp-edges'
            }}
          />

          {totalXp % 10 < 2 && totalXp > 0 && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1 }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-300 text-2xl"
                  initial={{ x: '50%', y: '50%', opacity: 1, scale: 0 }}
                  animate={{
                    x: `${50 + Math.cos((i / 8) * Math.PI * 2) * 100}%`,
                    y: `${50 + Math.sin((i / 8) * Math.PI * 2) * 100}%`,
                    opacity: 0,
                    scale: 1
                  }}
                  transition={{ duration: 1.5, delay: i * 0.1 }}
                >
                  ✨
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
