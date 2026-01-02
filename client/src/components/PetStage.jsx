import { motion } from 'framer-motion';
import AnimatedPet from './AnimatedPet.jsx';

function PetStage({ petType = 'EMBER', evolutionStage = 1, totalXp = 0, petState }) {
  const getBackgroundColor = () => {
    switch (petType) {
      case 'EMBER':
        return 'from-orange-500/5 to-red-500/5';
      case 'AQUA':
        return 'from-blue-500/5 to-cyan-500/5';
      case 'TERRA':
        return 'from-green-500/5 to-emerald-500/5';
      default:
        return 'from-slate-500/5 to-slate-400/5';
    }
  };
  const nextThreshold = evolutionStage === 1 ? 100 : 500;
  const progress = Math.min((totalXp / nextThreshold) * 100, 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Pet Stage</p>
          <h2 className="text-2xl font-semibold">Stage {evolutionStage}</h2>
        </div>
        <span className="text-xs text-slate-400">XP to next: {Math.max(nextThreshold - totalXp, 0)}</span>
      </div>

      <motion.div
        className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundColor()}`} />
        <div className="p-6 flex items-center justify-center relative">
          <AnimatedPet species={petType} totalXp={totalXp} stage={evolutionStage} forcedState={petState} />
        </div>
      </motion.div>

      <div>
        <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
          <span>Experience</span>
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
