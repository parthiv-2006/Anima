import { useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import AnimatedPet from './AnimatedPet.jsx';
import PipBar from './PipBar.jsx';
import { getSpeciesTheme } from '../theme/speciesTheme.js';
import { useUiStore, deriveMood } from '../state/uiStore.js';

// Full habitat themes for purchasable backgrounds. When equipped, these
// override the species-tinted environment so the change is unmistakable:
// new gradient, new mote color, new ambient glow.
const BACKGROUND_THEMES = {
  dojo: {
    name: 'Dojo Arena',
    emoji: '🥋',
    from: 'rgba(127, 29, 29, 0.55)',
    to: 'rgba(24, 9, 5, 0.95)',
    particle: '#fca5a5',
    glow: 'rgba(248, 113, 113, 0.14)'
  },
  library: {
    name: 'Ancient Library',
    emoji: '📚',
    from: 'rgba(30, 58, 138, 0.5)',
    to: 'rgba(10, 10, 28, 0.95)',
    particle: '#a5b4fc',
    glow: 'rgba(129, 140, 248, 0.14)'
  },
  forest: {
    name: 'Mystic Forest',
    emoji: '🌲',
    from: 'rgba(20, 83, 45, 0.55)',
    to: 'rgba(5, 18, 10, 0.95)',
    particle: '#86efac',
    glow: 'rgba(74, 222, 128, 0.14)'
  },
  volcano: {
    name: 'Volcanic Lair',
    emoji: '🌋',
    from: 'rgba(154, 52, 18, 0.6)',
    to: 'rgba(28, 8, 3, 0.96)',
    particle: '#fdba74',
    glow: 'rgba(251, 146, 60, 0.18)'
  },
  ocean: {
    name: 'Ocean Depths',
    emoji: '🌊',
    from: 'rgba(22, 78, 99, 0.6)',
    to: 'rgba(4, 12, 28, 0.96)',
    particle: '#67e8f9',
    glow: 'rgba(34, 211, 238, 0.16)'
  },
  mountain: {
    name: 'Mountain Peak',
    emoji: '🏔️',
    from: 'rgba(68, 64, 60, 0.55)',
    to: 'rgba(12, 12, 14, 0.95)',
    particle: '#d6d3d1',
    glow: 'rgba(214, 211, 209, 0.1)'
  }
};

const TRICK_UNLOCK_KEY = 'anima-trick-unlocks';

/**
 * Helper function to generate pet dialogue based on stats and HP
 */
function getPetDialogue(petStats, currentHP) {
  if (currentHP < 30) {
    const sadMessages = [
      'I need rest...',
      "Don't give up on me...",
      'Please... help me recover...',
      "I'm not feeling so good...",
      'Need... energy...'
    ];
    return sadMessages[Math.floor(Math.random() * sadMessages.length)];
  }

  const stats = petStats || { str: 0, int: 0, spi: 0 };
  const statEntries = Object.entries(stats);
  const [dominantStat] = statEntries.sort((a, b) => b[1] - a[1])[0] || ['str', 0];

  switch (dominantStat) {
    case 'str': {
      const strMessages = [
        "I feel strong today! Let's crush that workout!",
        'My muscles are twitching... we need to move!',
        'Time to get stronger! No pain, no gain!',
        "Let's break some limits today!",
        "I'm ready to conquer any challenge!"
      ];
      return strMessages[Math.floor(Math.random() * strMessages.length)];
    }
    case 'int': {
      const intMessages = [
        'Your mind is clear. Great work on the meditation.',
        "Knowledge is power. Let's learn something new!",
        "I've been analyzing your progress... impressive!",
        'The path to wisdom requires discipline.',
        "Fascinating! Let's explore more today."
      ];
      return intMessages[Math.floor(Math.random() * intMessages.length)];
    }
    case 'spi': {
      const spiMessages = [
        'Your mind is clear. Great work on the meditation.',
        'Inner peace brings outer strength.',
        'Balance is the key to everything.',
        'I feel so calm and centered today.',
        "Let's find harmony in all we do."
      ];
      return spiMessages[Math.floor(Math.random() * spiMessages.length)];
    }
    default:
      return "Let's make today count!";
  }
}

function PetStage({ petType = 'EMBER', evolutionStage = 1, totalXp = 0, petState, background = 'default', hp = 100, petStats, potionCount = 0, onQuickHeal }) {
  const theme = getSpeciesTheme(petType);
  // Equipped background overrides the species environment
  const bgTheme = BACKGROUND_THEMES[background] || null;
  const habitatFrom = bgTheme?.from ?? theme.habitatFrom;
  const habitatTo = bgTheme?.to ?? theme.habitatTo;
  const moteColor = bgTheme?.particle ?? theme.particle;
  const ambientGlow = bgTheme?.glow ?? theme.soft;
  const pushToast = useUiStore((s) => s.pushToast);
  const recentCompletions = useUiStore((s) => s.recentCompletions);
  const mood = deriveMood(hp, recentCompletions);

  // ---------- Parallax (mouse-driven, spring-smoothed) ----------
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springCfg = { stiffness: 60, damping: 18 };
  const bgX = useSpring(useTransform(mx, [-1, 1], [10, -10]), springCfg);
  const bgY = useSpring(useTransform(my, [-1, 1], [6, -6]), springCfg);
  const fgX = useSpring(useTransform(mx, [-1, 1], [-16, 16]), springCfg);
  const fgY = useSpring(useTransform(my, [-1, 1], [-10, 10]), springCfg);
  const petX = useSpring(useTransform(mx, [-1, 1], [-5, 5]), springCfg);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };
  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  // ---------- "NEW TRICK UNLOCKED" toasts on first appearance ----------
  useEffect(() => {
    let seen;
    try {
      seen = JSON.parse(localStorage.getItem(TRICK_UNLOCK_KEY)) || {};
    } catch {
      seen = {};
    }
    let changed = false;
    if (evolutionStage >= 2 && !seen.spin) {
      pushToast({ type: 'achievement', title: 'New Trick Unlocked', message: `${theme.name} learned Spin! Watch for a full 360° flourish.` });
      seen.spin = true;
      changed = true;
    }
    if (evolutionStage >= 3 && !seen.jump) {
      pushToast({ type: 'achievement', title: 'New Trick Unlocked', message: `${theme.name} learned High Jump — and now roams the whole habitat!` });
      seen.jump = true;
      changed = true;
    }
    if (changed) localStorage.setItem(TRICK_UNLOCK_KEY, JSON.stringify(seen));
  }, [evolutionStage, pushToast, theme.name]);

  const nextThreshold = evolutionStage === 1 ? 100 : 500;
  const hpColor = hp > 60 ? '#22c55e' : hp > 30 ? '#eab308' : '#ef4444';

  const dialogue = useMemo(() => getPetDialogue(petStats, hp), [petStats, hp]);

  const ambientParticles = useMemo(
    () =>
      [...Array(7)].map((_, i) => ({
        left: 8 + ((i * 37) % 84),
        delay: i * 1.7,
        duration: 7 + (i % 3) * 2,
        size: i % 2 ? 4 : 3
      })),
    []
  );

  return (
    <div className="flex flex-col flex-1">
      <div
        className="relative border border-borderSubtle rounded-[14px] overflow-hidden flex-1 shadow-2xl"
        style={{ background: `linear-gradient(to bottom, ${habitatFrom}, ${habitatTo})` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* ===== Background parallax layer: sky glow + drifting motes ===== */}
        <motion.div className="absolute inset-[-24px] pointer-events-none" style={{ x: bgX, y: bgY }}>
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 50% 30%, ${ambientGlow} 0%, transparent 60%)` }}
          />
          {ambientParticles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${p.left}%`,
                bottom: '12%',
                width: p.size,
                height: p.size,
                background: moteColor,
                opacity: 0.5
              }}
              animate={{ y: [0, -120], opacity: [0, 0.55, 0] }}
              transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeOut' }}
            />
          ))}
        </motion.div>

        {/* Ground plate the pet stands on */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[88px] w-[78%] h-16 rounded-[50%] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at center, ${ambientGlow} 0%, transparent 70%)` }}
        />

        {/* Mood meter — visible at a glance */}
        <div
          className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border bg-black/30 backdrop-blur"
          style={{ borderColor: theme.border }}
          title={`Mood: ${mood.label}`}
        >
          <motion.span
            key={mood.emoji}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="text-lg leading-none"
          >
            {mood.emoji}
          </motion.span>
          <div className="flex flex-col">
            <span className="text-[8px] text-textMuted font-bold tracking-[1.5px] uppercase">Mood</span>
            <span className="text-[10px] font-bold" style={{ color: theme.accent }}>
              {mood.label}
            </span>
          </div>
        </div>

        {bgTheme && (
          <div className="absolute top-3 right-3 z-10 text-[10px] text-textPrimary/80 bg-black/30 backdrop-blur px-2 py-1 rounded-lg border" style={{ borderColor: bgTheme.particle + '55' }}>
            {bgTheme.emoji} {bgTheme.name}
          </div>
        )}

        <div className="relative flex flex-col h-full">
          {/* Speech bubble sits at the top */}
          <div className="relative flex items-start justify-center pt-12 px-6">
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1, duration: 0.4, ease: 'backOut' }}
              className="max-w-[300px] relative"
            >
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-surface" />
              <div
                className="relative bg-surface backdrop-blur border rounded-xl p-3"
                style={{ borderColor: theme.border, boxShadow: `0 0 10px ${theme.soft}` }}
              >
                <p className="text-textPrimary text-xs font-medium text-center leading-snug font-mono">"{dialogue}"</p>
              </div>
            </motion.div>
          </div>

          {/* Pet sprite — slight counter-parallax so it pops off the backdrop */}
          <motion.div className="flex-1 flex items-center justify-center pb-16" style={{ x: petX }}>
            <AnimatedPet species={petType} totalXp={totalXp} stage={evolutionStage} hp={hp} forcedState={petState} large />
          </motion.div>
        </div>

        {/* ===== Foreground parallax layer: vignette + close motes ===== */}
        <motion.div className="absolute inset-[-24px] pointer-events-none" style={{ x: fgX, y: fgY }}>
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 60%, transparent 55%, rgba(0,0,0,0.45) 100%)' }}
          />
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`fg-${i}`}
              className="absolute rounded-full blur-[1px]"
              style={{
                left: `${15 + i * 32}%`,
                top: `${30 + (i % 2) * 38}%`,
                width: 6,
                height: 6,
                background: moteColor,
                opacity: 0.35
              }}
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>

        {/* Quick-heal: use a potion straight from the habitat when HP is down */}
        {hp < 100 && potionCount > 0 && onQuickHeal && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onQuickHeal}
            title="Use a health potion"
            className="absolute bottom-[120px] right-5 z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-success/40 bg-black/40 backdrop-blur text-success text-xs font-bold shadow-[0_0_12px_rgba(34,197,94,0.25)]"
          >
            <motion.span
              animate={{ rotate: [0, -12, 12, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2 }}
              className="text-base leading-none"
            >
              🧪
            </motion.span>
            Heal ×{potionCount}
          </motion.button>
        )}

        {/* Segmented status gauges */}
        <div className="absolute bottom-5 left-6 right-6 space-y-3.5">
          <PipBar label="Health" value={hp} max={100} color={hpColor} dimColor={`${hpColor}88`} rightText={`${hp}/100`} />
          <PipBar
            label="Experience"
            value={Math.min(totalXp, nextThreshold)}
            max={nextThreshold}
            color={theme.accent}
            dimColor={theme.glow}
            rightText={`${totalXp}/${nextThreshold} XP`}
          />
        </div>
      </div>
    </div>
  );
}

export default PetStage;
