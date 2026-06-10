import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import { getLottie } from '../lotties/index.js';
import { useUiStore } from '../state/uiStore.js';
import { getSpeciesTheme } from '../theme/speciesTheme.js';

const PET_IMAGES = {
  EMBER: {
    1: '/pets/fire/babyfire-removebg-preview.png',
    2: '/pets/fire/teenFire.png',
    3: '/pets/fire/fire3rdEvol.png'
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

export const BEHAVIOR = {
  IDLE: 'idle',
  WANDER: 'wander',
  TRICK_SPIN: 'trick_spin',
  TRICK_JUMP: 'trick_jump',
  CELEBRATE: 'celebrate',
  SLEEP: 'sleep',
  REACT_HAPPY: 'react_happy',
  REACT_SAD: 'react_sad',
  TRAINING: 'training'
};

// One-shot behaviors return to IDLE after this many ms. Behaviors not listed
// (idle/sleep) loop until the next scheduler tick.
const ONE_SHOT_MS = {
  [BEHAVIOR.WANDER]: 6200,
  [BEHAVIOR.TRICK_SPIN]: 1400,
  [BEHAVIOR.TRICK_JUMP]: 1600,
  [BEHAVIOR.CELEBRATE]: 2000,
  [BEHAVIOR.REACT_HAPPY]: 1600,
  [BEHAVIOR.REACT_SAD]: 3500
};

// Stage gating: stage 2 unlocks the spin trick, stage 3 unlocks the jump.
// Wandering is allowed at every stage (babies toddle a short distance,
// adults roam the whole habitat) so the pet always feels alive.
function pickBehavior(hp, stage) {
  const mood = Math.max(0, Math.min(1, (hp ?? 100) / 100));
  const pool = [
    { b: BEHAVIOR.IDLE, w: 30 },
    { b: BEHAVIOR.WANDER, w: 10 + 25 * mood },
    { b: BEHAVIOR.REACT_HAPPY, w: 12 * mood },
    { b: BEHAVIOR.SLEEP, w: 40 * (1 - mood) },
    { b: BEHAVIOR.REACT_SAD, w: mood < 0.5 ? 30 * (1 - mood) : 0 },
    { b: BEHAVIOR.TRICK_SPIN, w: stage >= 2 ? 28 * mood : 0 },
    { b: BEHAVIOR.TRICK_JUMP, w: stage >= 3 ? 28 * mood : 0 }
  ].filter((e) => e.w > 0);

  const total = pool.reduce((sum, e) => sum + e.w, 0);
  let roll = Math.random() * total;
  for (const entry of pool) {
    roll -= entry.w;
    if (roll <= 0) return entry.b;
  }
  return BEHAVIOR.IDLE;
}

// Ambient mode thought messages
const AMBIENT_THOUGHTS = [
  "Don't forget to drink water! 💧",
  "You've been focused for a while... great work! 🎯",
  'Taking breaks helps focus! ☕',
  'Remember to stretch! 🧘',
  "You're doing amazing! Keep it up! ✨",
  'Hydration is key to productivity! 🚰',
  "Time flies when you're in the zone! ⏰",
  'Your dedication inspires me! 💪',
  'Rest is productive too! 😴',
  'Balance work with rest! ⚖️',
  "You've got this! 🌟",
  'Progress over perfection! 🎨'
];

// Per-behavior animation for the performer wrapper (y/rotate/scale/filter).
// Horizontal travel lives on the outer "roamer" wrapper.
function performerAnimation(behavior) {
  switch (behavior) {
    case BEHAVIOR.WANDER:
      return {
        y: [0, -7, 0, -7, 0, -7, 0],
        rotate: [0, -3, 0, 3, 0, -3, 0],
        transition: { duration: 6.2, ease: 'easeInOut' }
      };
    case BEHAVIOR.TRICK_SPIN:
      return {
        rotate: [0, 360],
        y: [0, -24, 0, -10, 0],
        filter: ['blur(0px)', 'blur(3px)', 'blur(0px)', 'blur(0px)', 'blur(0px)'],
        transition: { duration: 1.3, ease: [0.45, 0, 0.3, 1] }
      };
    case BEHAVIOR.TRICK_JUMP:
      return {
        y: [0, -110, 0, -18, 0],
        scaleY: [1, 1.1, 0.78, 1.05, 1],
        scaleX: [1, 0.94, 1.18, 0.97, 1],
        transition: { duration: 1.5, ease: 'easeOut', times: [0, 0.4, 0.62, 0.82, 1] }
      };
    case BEHAVIOR.CELEBRATE:
      return {
        y: [0, -34, 0, -34, 0, -12, 0],
        rotate: [0, -12, 0, 12, 0, -6, 0],
        scale: [1, 1.06, 1, 1.06, 1, 1.02, 1],
        transition: { duration: 1.9, ease: 'easeOut' }
      };
    case BEHAVIOR.SLEEP:
      return {
        y: [0, 6, 0],
        scale: [1, 0.97, 1],
        rotate: [0, 2, 0],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
      };
    case BEHAVIOR.REACT_HAPPY:
      return {
        y: [0, -18, 0, -18, 0],
        scale: [1, 1.08, 1, 1.08, 1],
        transition: { duration: 1.5, ease: 'easeOut' }
      };
    case BEHAVIOR.REACT_SAD:
      return {
        y: [0, 5, 0],
        rotate: [0, -4, -4, 0],
        scale: [1, 0.97, 0.97, 1],
        transition: { duration: 3.4, ease: 'easeInOut' }
      };
    case BEHAVIOR.TRAINING:
      return {
        y: [0, -10, 0],
        scale: [1, 1.04, 1],
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
      };
    default:
      // IDLE: gentle breathing bob
      return {
        y: [0, -8, 0],
        scale: [1, 1.02, 1],
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
      };
  }
}

function shadowAnimation(behavior) {
  switch (behavior) {
    case BEHAVIOR.TRICK_JUMP:
      return {
        scale: [1, 0.45, 1.2, 0.95, 1],
        opacity: [0.25, 0.1, 0.35, 0.25, 0.25],
        transition: { duration: 1.5, ease: 'easeOut' }
      };
    case BEHAVIOR.TRICK_SPIN:
    case BEHAVIOR.CELEBRATE:
      return {
        scale: [1, 0.8, 1, 0.8, 1],
        opacity: [0.25, 0.18, 0.3, 0.18, 0.25],
        transition: { duration: 1.6 }
      };
    case BEHAVIOR.SLEEP:
      return {
        scale: [1, 1.04, 1],
        opacity: [0.3, 0.34, 0.3],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
      };
    default:
      return {
        scale: [1, 0.95, 1],
        opacity: [0.2, 0.3, 0.2],
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
      };
  }
}

export default function AnimatedPet({
  species,
  totalXp,
  stage,
  hp = 100,
  forcedState,
  ambientMode = false,
  large = false
}) {
  const [behavior, setBehavior] = useState(BEHAVIOR.IDLE);
  const [showThought, setShowThought] = useState(false);
  const [currentThought, setCurrentThought] = useState('');
  const hpRef = useRef(hp);
  hpRef.current = hp;
  const celebrateKey = useUiStore((s) => s.celebrateKey);
  const mountedCelebrateKey = useRef(celebrateKey);

  const theme = getSpeciesTheme(species);
  const lottie = getLottie(species, stage);

  // Ambient mode thought bubble system
  useEffect(() => {
    if (!ambientMode) return;

    const showRandomThought = () => {
      setCurrentThought(AMBIENT_THOUGHTS[Math.floor(Math.random() * AMBIENT_THOUGHTS.length)]);
      setShowThought(true);
      setTimeout(() => setShowThought(false), 5000);
    };

    const initialDelay = setTimeout(showRandomThought, 30000);
    const timeouts = [];

    const scheduleNextThought = () => {
      const delay = Math.random() * 20 * 60 * 1000 + 20 * 60 * 1000; // 20-40 min
      const timeout = setTimeout(() => {
        showRandomThought();
        scheduleNextThought();
      }, delay);
      timeouts.push(timeout);
    };
    scheduleNextThought();

    return () => {
      clearTimeout(initialDelay);
      timeouts.forEach(clearTimeout);
    };
  }, [ambientMode]);

  // Autonomous behavior loop: every 8-15s pick a mood-weighted behavior.
  // High HP → more tricks. Low HP → sleep and sulking.
  useEffect(() => {
    if (forcedState) {
      setBehavior(forcedState === 'training' ? BEHAVIOR.TRAINING : forcedState);
      return;
    }
    setBehavior(BEHAVIOR.IDLE);

    let cancelled = false;
    const timers = [];
    const schedule = (delay) => {
      const t = setTimeout(() => {
        if (cancelled) return;
        const next = pickBehavior(hpRef.current, stage);
        setBehavior(next);
        const oneShot = ONE_SHOT_MS[next];
        if (oneShot) {
          timers.push(
            setTimeout(() => {
              if (!cancelled) setBehavior(BEHAVIOR.IDLE);
            }, oneShot)
          );
        }
        schedule(8000 + Math.random() * 7000);
      }, delay);
      timers.push(t);
    };
    schedule(4000 + Math.random() * 4000);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [forcedState, stage]);

  // Habit completed anywhere in the app → victory lap + confetti.
  useEffect(() => {
    if (celebrateKey === mountedCelebrateKey.current) return;
    mountedCelebrateKey.current = celebrateKey;
    setBehavior(BEHAVIOR.CELEBRATE);
    if (!ambientMode) {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 }, scalar: 0.9 });
      });
    }
    const t = setTimeout(() => setBehavior(BEHAVIOR.IDLE), ONE_SHOT_MS[BEHAVIOR.CELEBRATE]);
    return () => clearTimeout(t);
  }, [celebrateKey, ambientMode]);

  const isSleeping = behavior === BEHAVIOR.SLEEP;
  const isSad = behavior === BEHAVIOR.REACT_SAD;
  const isTraining = behavior === BEHAVIOR.TRAINING;

  // Wander range scales with evolution: babies toddle, adults roam wide.
  const wanderRange = (large ? 90 : 45) * (stage >= 3 ? 1.4 : stage === 2 ? 1 : 0.6);

  const petImage = (PET_IMAGES[species] || PET_IMAGES.EMBER)[stage] || (PET_IMAGES[species] || PET_IMAGES.EMBER)[1];

  return (
    <div
      className={`relative w-full flex items-center justify-center ${
        ambientMode ? 'h-auto' : large ? '' : 'h-80 rounded-2xl'
      }`}
    >
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
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-amber-500/50" />
            <div className="bg-slate-800/95 backdrop-blur-xl border-2 border-amber-500/50 rounded-xl p-4 shadow-2xl">
              <p className="text-amber-100 text-base font-medium text-center leading-relaxed">{currentThought}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zzz while sleeping */}
      <AnimatePresence>
        {isSleeping && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20, y: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 1, 0], x: [20, 40, 60], y: [0, -20, -40], scale: [0.5, 1, 1.2] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
                className="absolute top-1/4 right-1/3 text-2xl pointer-events-none z-20"
              >
                💤
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Roamer: horizontal travel across the habitat (WANDER) */}
      <motion.div
        animate={
          behavior === BEHAVIOR.WANDER
            ? { x: [0, -wanderRange, wanderRange * 0.7, 0], transition: { duration: 6.2, ease: 'easeInOut', times: [0, 0.38, 0.75, 1] } }
            : { x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
        }
        className="relative"
      >
        {/* Performer: tricks, jumps, breathing */}
        <motion.div className="relative" animate={performerAnimation(behavior)}>
          {/* Ground shadow — squashes on jumps, fades at the jump apex */}
          <motion.div
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-black/20 rounded-full blur-md"
            animate={shadowAnimation(behavior)}
          />

          <motion.div className="relative">
            {/* Elemental Lottie aura behind the sprite (see lotties/index.js) */}
            {lottie && !lottie.replacesSprite && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ filter: 'blur(22px)', opacity: isSleeping ? 0.18 : 0.4, mixBlendMode: 'screen' }}
              >
                <Lottie
                  animationData={lottie.data}
                  loop
                  autoplay
                  className={large ? 'w-72 h-72' : 'w-32 h-32'}
                />
              </div>
            )}

            {/* Glow halo */}
            <motion.div
              className="absolute inset-0 rounded-full blur-2xl"
              animate={{
                opacity: isTraining ? [0.4, 0.8, 0.4] : isSleeping ? [0.1, 0.2, 0.1] : [0.3, 0.6, 0.3],
                scale: isTraining ? [0.95, 1.15, 0.95] : [0.9, 1.1, 0.9]
              }}
              transition={{ duration: isTraining ? 1.5 : 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)` }}
            />

            {/* If a real character Lottie exists, render it as the pet itself;
                otherwise fall back to the PNG sprite + Framer Motion. */}
            {lottie?.replacesSprite ? (
              <Lottie
                animationData={lottie.data}
                loop
                autoplay
                className={`${large ? 'w-72 h-72' : 'w-32 h-32'} relative z-10`}
              />
            ) : (
              <motion.img
                src={petImage}
                alt={`${species} pet`}
                className={`${large ? 'w-72 h-72' : 'w-32 h-32'} object-contain relative z-10 drop-shadow-2xl`}
                style={{
                  filter: isSleeping
                    ? 'brightness(0.65) grayscale(0.4)'
                    : isSad
                    ? 'brightness(0.85) saturate(0.7)'
                    : 'brightness(1.1)',
                  imageRendering: 'pixelated'
                }}
              />
            )}

            {/* Happy hearts */}
            {behavior === BEHAVIOR.REACT_HAPPY && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {[...Array(4)].map((_, i) => (
                  <motion.span
                    key={`heart-${i}`}
                    className="absolute text-xl"
                    style={{ left: `${25 + i * 18}%`, top: '20%' }}
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 0], y: -46, scale: [0.5, 1.1, 0.8] }}
                    transition={{ duration: 1.3, delay: i * 0.15 }}
                  >
                    💖
                  </motion.span>
                ))}
              </div>
            )}

            {/* Sad sweat drop */}
            {isSad && (
              <motion.span
                className="absolute text-2xl z-20"
                style={{ right: '22%', top: '12%' }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: [0, 1, 1, 0], y: [0, 10, 20, 28] }}
                transition={{ duration: 2.6, ease: 'easeIn' }}
              >
                💧
              </motion.span>
            )}

            {/* Celebrate star burst */}
            {behavior === BEHAVIOR.CELEBRATE && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {[...Array(10)].map((_, i) => (
                  <motion.span
                    key={`burst-${i}`}
                    className="absolute text-xl"
                    style={{ left: '50%', top: '50%', color: theme.particle }}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                    animate={{
                      x: Math.cos((i / 10) * Math.PI * 2) * (large ? 130 : 70),
                      y: Math.sin((i / 10) * Math.PI * 2) * (large ? 130 : 70),
                      opacity: 0,
                      scale: [0, 1.3, 0.6],
                      rotate: 120
                    }}
                    transition={{ duration: 1.1, delay: i * 0.04, ease: 'easeOut' }}
                  >
                    {i % 2 ? '✦' : '⭐'}
                  </motion.span>
                ))}
              </div>
            )}

            {/* XP sparkles near a level-up boundary */}
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
            {isTraining && (
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
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                  >
                    💫
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
