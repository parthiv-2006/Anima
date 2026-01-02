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

function PetStage({ petType = 'EMBER', evolutionStage = 1, totalXp = 0, petState, background = 'default', hp = 100 }) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Pet Stage</p>
          <h2 className="text-2xl font-semibold">Stage {evolutionStage}</h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">XP to next: {Math.max(nextThreshold - totalXp, 0)}</span>
          {background !== 'default' && BACKGROUND_STYLES[background] && (
            <p className="text-xs text-slate-500">{BACKGROUND_STYLES[background].name}</p>
          )}
        </div>
      </div>

      <motion.div
        className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient()}`} />
        <div className="p-6 flex items-center justify-center relative">
          <AnimatedPet species={petType} totalXp={totalXp} stage={evolutionStage} forcedState={petState} />
        </div>
      </motion.div>

      {/* HP Bar */}
      <div>
        <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
          <span className="flex items-center gap-1">
            <span>❤️</span> HP
          </span>
          <span>{hp}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${hpColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${hp}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* XP Bar */}
      <div>
        <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
          <span className="flex items-center gap-1">
            <span>⭐</span> Experience
          </span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

export default PetStage;
