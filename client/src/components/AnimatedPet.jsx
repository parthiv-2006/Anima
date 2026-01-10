import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const PET_IMAGES = {
  EMBER: {
    1: '/pets/fire/babyfire-removebg-preview.png',
    2: '/pets/fire/teenFire.png',
    3: '/pets/fire/fire3rdEvol.png'
    // Future: 3+ can be added here (adult, legendary, etc.)
  },
  AQUA: {
    1: '/pets/aqua/babyAqua-removebg-preview.png',
    2: '/pets/aqua/teenAqua.png',
    3: '/pets/aqua/aqua3rdEvol.png'
  },
  TERRA: {
    1: '/pets/terra/babyTerra-removebg-preview.png',
    2: '/pets/terra/teenTerra.png',
    3: '/pets/terra/terra3rdEvol.png'
  }
};

const ANIMATION_STATES = {
  IDLE: 'idle',
  BOUNCE: 'bounce',
  SLEEP: 'sleep',
  WIGGLE: 'wiggle',
  FLOAT: 'float',
  TRAINING: 'training'
};

// Ambient mode thought messages
const AMBIENT_THOUGHTS = [
  "Don't forget to drink water! 💧",
  "You've been focused for a while... great work! 🎯",
  "Taking breaks helps focus! ☕",
  "Remember to stretch! 🧘",
  "You're doing amazing! Keep it up! ✨",
  "Hydration is key to productivity! 🚰",
  "Time flies when you're in the zone! ⏰",
  "Your dedication inspires me! 💪",
  "Rest is productive too! 😴",
  "Balance work with rest! ⚖️",
  "You've got this! 🌟",
  "Progress over perfection! 🎨"
];

export default function AnimatedPet({ species, totalXp, stage, forcedState, ambientMode = false }) {
  const [animationState, setAnimationState] = useState(ANIMATION_STATES.IDLE);
  const [isSleeping, setIsSleeping] = useState(false);
  const [showZzz, setShowZzz] = useState(false);
  const [showThought, setShowThought] = useState(false);
  const [currentThought, setCurrentThought] = useState('');

  // Ambient mode thought bubble system
  useEffect(() => {
    if (!ambientMode) return;

    const getRandomThought = () => {
      return AMBIENT_THOUGHTS[Math.floor(Math.random() * AMBIENT_THOUGHTS.length)];
    };

    const showRandomThought = () => {
      setCurrentThought(getRandomThought());
      setShowThought(true);

      // Hide thought after 5 seconds
      setTimeout(() => {
        setShowThought(false);
      }, 5000);
    };

    // Show first thought after 30 seconds
    const initialDelay = setTimeout(showRandomThought, 30000);

    // Then show thoughts every 20-40 minutes (randomized)
    const timeouts = [];
    
    const scheduleNextThought = () => {
      const minDelay = 20 * 60 * 1000; // 20 minutes
      const maxDelay = 40 * 60 * 1000; // 40 minutes
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      
      const timeout = setTimeout(() => {
        showRandomThought();
        scheduleNextThought();
      }, delay);
      
      timeouts.push(timeout);
      return timeout;
    };

    scheduleNextThought();

    return () => {
      clearTimeout(initialDelay);
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [ambientMode]);

  useEffect(() => {
    // If forced state (like training), use it and don't cycle
    if (forcedState) {
      setAnimationState(forcedState);
      setIsSleeping(false);
      setShowZzz(false);
      return;
    }

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
  }, [forcedState]);

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

  const getBackgroundGradient = () => {
    switch (species) {
      case 'EMBER':
        return 'bg-gradient-to-br from-orange-500/10 via-red-500/5 to-amber-500/10';
      case 'AQUA':
        return 'bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-sky-500/10';
      case 'TERRA':
        return 'bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-lime-500/10';
      default:
        return 'bg-gradient-to-br from-slate-500/10 via-slate-400/5 to-slate-500/10';
    }
  };

  const getPetImageByStage = () => {
    const bySpecies = PET_IMAGES[species] || PET_IMAGES.EMBER;
    // Prefer exact stage image; otherwise fallback to stage 1 (baby)
    return bySpecies[stage] || bySpecies[1];
  };

  return (
    <div className={`relative w-full flex items-center justify-center ${
      ambientMode ? 'h-auto' : 'h-80 rounded-2xl'
    } ${ambientMode ? '' : getBackgroundGradient()}`}>
      {/* Ambient Mode Thought Bubble */}
      <AnimatePresence>
        {showThought && ambientMode && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
            className="absolute top-2 left-1/2 -translate-x-1/2 max-w-[320px] z-20"
          >
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-amber-500/50" />
            
            {/* Speech bubble box */}
            <div className="bg-slate-800/95 backdrop-blur-xl border-2 border-amber-500/50 rounded-xl p-4 shadow-2xl">
              <p className="text-amber-100 text-base font-medium text-center leading-relaxed">
                {currentThought}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-black/20 rounded-full blur-md"
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
            animate={{ 
              opacity: animationState === ANIMATION_STATES.TRAINING ? [0.4, 0.8, 0.4] : [0.3, 0.6, 0.3], 
              scale: animationState === ANIMATION_STATES.TRAINING ? [0.95, 1.15, 0.95] : [0.9, 1.1, 0.9] 
            }}
            transition={{ 
              duration: animationState === ANIMATION_STATES.TRAINING ? 1.5 : 3, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
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
            src={getPetImageByStage()}
            alt={`${species} pet`}
            className="w-64 h-64 object-contain relative z-10 drop-shadow-2xl"
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

          {/* Training particles */}
          {animationState === ANIMATION_STATES.TRAINING && (
            <motion.div className="absolute inset-0 pointer-events-none overflow-visible">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`train-${i}`}
                  className="absolute text-2xl"
                  initial={{ x: '50%', y: '50%', opacity: 0 }}
                  animate={{
                    x: `${50 + Math.cos((i / 6) * Math.PI * 2) * 80}%`,
                    y: `${50 + Math.sin((i / 6) * Math.PI * 2) * 80}%`,
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeInOut'
                  }}
                >
                  💫
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
