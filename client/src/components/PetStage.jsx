import { motion } from 'framer-motion';
import AnimatedPet from './AnimatedPet.jsx';

const BACKGROUND_STYLES = {
  default: { gradient: 'from-slate-800/50 to-slate-900/50', name: 'Default' },
  dojo: { gradient: 'from-red-900/40 to-orange-900/40', name: 'Dojo Arena' },
  library: { gradient: 'from-blue-900/40 to-indigo-900/40', name: 'Ancient Library' },
  forest: { gradient: 'from-green-900/40 to-emerald-900/40', name: 'Mystic Forest' },
  volcano: { gradient: 'from-orange-900/40 to-red-950/40', name: 'Volcanic Lair' },
  ocean: { gradient: 'from-cyan-900/40 to-blue-950/40', name: 'Ocean Depths' },
  mountain: { gradient: 'from-stone-800/40 to-slate-900/40', name: 'Mountain Peak' }
};

/**
 * Helper function to generate pet dialogue based on stats and HP
 */
function getPetDialogue(petStats, currentHP) {
  // Critical HP messages (highest priority)
  if (currentHP < 30) {
    const sadMessages = [
      "I need rest...",
      "Don't give up on me...",
      "Please... help me recover...",
      "I'm not feeling so good...",
      "Need... energy..."
    ];
    return sadMessages[Math.floor(Math.random() * sadMessages.length)];
  }

  // Find dominant stat
  const stats = petStats || { str: 0, int: 0, spi: 0 };
  const statEntries = Object.entries(stats);
  const [dominantStat] = statEntries.sort((a, b) => b[1] - a[1])[0] || ['str', 0];

  // Return messages based on dominant stat
  switch (dominantStat) {
    case 'str':
      const strMessages = [
        "I feel strong today! Let's crush that workout!",
        "My muscles are twitching... we need to move!",
        "Time to get stronger! No pain, no gain!",
        "Let's break some limits today!",
        "I'm ready to conquer any challenge!"
      ];
      return strMessages[Math.floor(Math.random() * strMessages.length)];
    
    case 'int':
      const intMessages = [
        "Your mind is clear. Great work on the meditation.",
        "Knowledge is power. Let's learn something new!",
        "I've been analyzing your progress... impressive!",
        "The path to wisdom requires discipline.",
        "Fascinating! Let's explore more today."
      ];
      return intMessages[Math.floor(Math.random() * intMessages.length)];
    
    case 'spi':
      const spiMessages = [
        "Your mind is clear. Great work on the meditation.",
        "Inner peace brings outer strength.",
        "Balance is the key to everything.",
        "I feel so calm and centered today.",
        "Let's find harmony in all we do."
      ];
      return spiMessages[Math.floor(Math.random() * spiMessages.length)];
    
    default:
      return "Let's make today count!";
  }
}

function PetStage({ petType = 'EMBER', evolutionStage = 1, totalXp = 0, petState, background = 'default', hp = 100, petStats }) {
  const getBackgroundGradient = () => {
    // If custom background is set, use it
    if (background && background !== 'default' && BACKGROUND_STYLES[background]) {
      return BACKGROUND_STYLES[background].gradient;
    }
    // Otherwise use species-based color
    switch (petType) {
      case 'EMBER':
        return 'from-orange-500/10 to-red-500/10';
      case 'AQUA':
        return 'from-blue-500/10 to-cyan-500/10';
      case 'TERRA':
        return 'from-green-500/10 to-emerald-500/10';
      default:
        return 'from-slate-500/10 to-slate-400/10';
    }
  };

  const nextThreshold = evolutionStage === 1 ? 100 : 500;
  const progress = Math.min((totalXp / nextThreshold) * 100, 100);
  const hpColor = hp > 60 ? 'from-green-400 to-emerald-500' : hp > 30 ? 'from-yellow-400 to-orange-500' : 'from-red-400 to-red-600';
  
  // Get dialogue for the pet
  const dialogue = getPetDialogue(petStats, hp);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-500/80 font-semibold">Your Companion</p>
          <h2 className="text-2xl font-bold text-white">Stage {evolutionStage}</h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
            {Math.max(nextThreshold - totalXp, 0)} XP to evolve
          </span>
          {background !== 'default' && BACKGROUND_STYLES[background] && (
            <p className="text-xs text-amber-400/70 mt-1">📍 {BACKGROUND_STYLES[background].name}</p>
          )}
        </div>
      </div>

      <motion.div
        className="relative bg-gradient-to-b from-slate-800/50 to-[#0a0a0a] border border-borderSubtle rounded-[14px] overflow-hidden min-h-[420px] shadow-2xl"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,160,32,0.1)_0%,transparent_60%)] pointer-events-none`} />
        
        <div className="relative h-full min-h-[380px] flex items-center justify-center pt-28 pb-56 px-10">
          {/* Significantly scaled up pet display */}
          <div className="transform scale-150 md:scale-[1.75]" style={{ animation: 'particle-float 4s infinite alternate ease-in-out' }}>
            <AnimatedPet species={petType} totalXp={totalXp} stage={evolutionStage} forcedState={petState} />
          </div>
          
          {/* Speech Bubble with Dialogue */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1, duration: 0.4, ease: 'backOut' }}
            className="absolute top-8 left-1/2 -translate-x-1/2 max-w-[340px] z-10"
          >
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-surface" />
            
            {/* Speech bubble box - RPG style */}
            <div className="relative bg-surface backdrop-blur border border-accentAmber rounded-xl p-4 shadow-[0_0_8px_rgba(232,160,32,0.2)]">
              <p className="text-textPrimary text-sm font-medium text-center leading-tight font-mono">
                "{dialogue}"
              </p>
            </div>
          </motion.div>
        </div>

        {/* Game-style Status Bars - Inside the habitat */}
        <div className="absolute bottom-6 left-6 right-6 space-y-4">
          {/* HP Bar */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-textMuted mb-1 font-bold tracking-widest uppercase">
              <span>Health</span>
              <span>{hp}/100</span>
            </div>
            <div className="h-2 rounded-full bg-surfaceElevated overflow-hidden border border-borderSubtle">
              <div
                className="h-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                style={{ width: `${hp}%`, animation: 'bar-fill 1.2s ease forwards' }}
              />
            </div>
          </div>

          {/* XP Bar */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-textMuted mb-1 font-bold tracking-widest uppercase">
              <span>Experience</span>
              <span>{totalXp}/{nextThreshold} XP</span>
            </div>
            <div className="h-2 rounded-full bg-surfaceElevated overflow-hidden border border-borderSubtle">
              <div
                className="h-full bg-accentAmber shadow-[0_0_8px_rgba(232,160,32,0.6)]"
                style={{ width: `${progress}%`, animation: 'bar-fill 1.2s ease forwards' }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PetStage;
