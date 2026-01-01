import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import emberBaby from '../lotties/ember-baby.json';
import emberTeen from '../lotties/ember-teen.json';
import emberAdult from '../lotties/ember-adult.json';
import aquaBaby from '../lotties/aqua-baby.json';
import terraBaby from '../lotties/terra-baby.json';

const petAnimations = {
  EMBER: {
    1: emberBaby,
    2: emberTeen,
    3: emberAdult
  },
  AQUA: {
    1: aquaBaby,
    2: aquaBaby,
    3: aquaBaby
  },
  TERRA: {
    1: terraBaby,
    2: terraBaby,
    3: terraBaby
  }
};

function PetStage({ petType = 'EMBER', evolutionStage = 1, totalXp = 0 }) {
  const animationData = petAnimations[petType]?.[evolutionStage] || petAnimations.EMBER[1];
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
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="p-6 flex items-center justify-center">
          <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ width: 240, height: 240 }}
          />
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
