import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../state/authStore.js';
import { habits as habitsApi, pet as petApi } from '../services/api.js';

const STARTER_PETS = [
  {
    species: 'EMBER',
    name: 'Ember Spirit',
    emoji: '🔥',
    image: '/pets/fire/babyfire-removebg-preview.png',
    description: 'For the ambitious warrior. Burns bright with determination and raw power.',
    color: 'from-amber-500 to-red-500',
    glow: 'rgba(251, 146, 60, 0.5)',
    border: 'border-amber-500'
  },
  {
    species: 'AQUA',
    name: 'Aqua Wisp',
    emoji: '💧',
    image: '/pets/aqua/babyAqua-removebg-preview.png',
    description: 'For the calm strategist. Flows with wisdom and adaptability.',
    color: 'from-sky-500 to-blue-500',
    glow: 'rgba(56, 189, 248, 0.5)',
    border: 'border-sky-500'
  },
  {
    species: 'TERRA',
    name: 'Terra Golem',
    emoji: '🌿',
    image: '/pets/terra/babyTerra-removebg-preview.png',
    description: 'For the steady grower. Rooted in resilience and natural strength.',
    color: 'from-emerald-500 to-lime-500',
    glow: 'rgba(74, 222, 128, 0.5)',
    border: 'border-emerald-500'
  }
];

const QUEST_CATEGORIES = [
  { value: 'STR', label: 'Strength', emoji: '⚔️', color: 'text-red-400' },
  { value: 'INT', label: 'Intellect', emoji: '📚', color: 'text-blue-400' },
  { value: 'SPI', label: 'Spirit', emoji: '🌿', color: 'text-green-400' }
];

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedPet, setSelectedPet] = useState(null);
  const [quests, setQuests] = useState([]);
  const [questInput, setQuestInput] = useState({ name: '', category: 'STR', difficulty: 1 });
  const [isInitializing, setIsInitializing] = useState(false);
  const user = useAuthStore((s) => s.user);

  const handlePetSelect = (species) => {
    setSelectedPet(species);
  };

  const handleAddQuest = () => {
    if (questInput.name.trim() && quests.length < 5) {
      setQuests([...quests, { ...questInput, id: Date.now() }]);
      setQuestInput({ name: '', category: 'STR', difficulty: 1 });
    }
  };

  const handleRemoveQuest = (id) => {
    setQuests(quests.filter(q => q.id !== id));
  };

  const handleFinish = async () => {
    setIsInitializing(true);
    
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    try {
      // Update pet species first
      await petApi.update({ species: selectedPet });
      
      // Create initial quests
      for (const quest of quests) {
        await habitsApi.create({
          name: quest.name,
          statCategory: quest.category,
          difficulty: quest.difficulty
        });
      }
    } catch (err) {
      console.error('Failed to initialize:', err);
    }
    
    onComplete?.();
  };

  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-display flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                    step >= s
                      ? 'bg-amber-500 border-amber-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-500'
                  }`}
                  animate={{ scale: step === s ? 1.1 : 1 }}
                >
                  {s}
                </motion.div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded ${
                      step > s ? 'bg-amber-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Pet Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <motion.h1
                  className="text-4xl font-bold mb-3"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Choose Your Companion
                </motion.h1>
                <motion.p
                  className="text-slate-400 text-lg"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Your companion will grow as you complete your quests
                </motion.p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {STARTER_PETS.map((pet, index) => (
                  <motion.div
                    key={pet.species}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ y: -8 }}
                    onClick={() => handlePetSelect(pet.species)}
                    className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all ${
                      selectedPet === pet.species
                        ? `ring-4 ${pet.border} ring-opacity-50`
                        : 'ring-2 ring-white/10'
                    }`}
                  >
                    <div className="bg-white/5 backdrop-blur p-6 border border-white/10">
                      {/* Background gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${pet.color} opacity-5`} />
                      {/* Glow effect when selected */}
                      {selectedPet === pet.species && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{
                            background: `radial-gradient(circle at center, ${pet.glow} 0%, transparent 70%)`
                          }}
                        />
                      )}

                      <div className="relative">
                        {/* Pet Image */}
                        <motion.div
                          className="w-full h-56 flex items-center justify-center mb-4"
                          animate={{
                            scale: selectedPet === pet.species ? 1.1 : 1
                          }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <img
                            src={pet.image}
                            alt={pet.name}
                            className="w-48 h-48 object-contain drop-shadow-2xl"
                            style={{ imageRendering: 'crisp-edges' }}
                          />
                        </motion.div>

                        {/* Pet Info */}
                        <div className="text-center">
                          <h3 className="text-2xl font-bold mb-1">
                            {pet.emoji} {pet.name}
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {pet.description}
                          </p>
                        </div>

                        {/* Selected indicator */}
                        {selectedPet === pet.species && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 bg-amber-500 rounded-full p-2"
                          >
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectedPet && setStep(2)}
                  disabled={!selectedPet}
                  className={`px-8 py-3 rounded-lg font-semibold text-lg transition ${
                    selectedPet
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Quest Setup */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <motion.h1
                  className="text-4xl font-bold mb-3"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Define Your First Quests
                </motion.h1>
                <motion.p
                  className="text-slate-400 text-lg"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Set up to 5 initial objectives to start your journey
                </motion.p>
              </div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur mb-6"
              >
                {/* Quest Input */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Quest Name
                    </label>
                    <input
                      type="text"
                      value={questInput.name}
                      onChange={(e) => setQuestInput({ ...questInput, name: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddQuest()}
                      placeholder="e.g., Read 10 pages, Drink 8 glasses of water"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Category
                      </label>
                      <div className="flex gap-2">
                        {QUEST_CATEGORIES.map((cat) => (
                          <button
                            key={cat.value}
                            onClick={() => setQuestInput({ ...questInput, category: cat.value })}
                            className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                              questInput.category === cat.value
                                ? 'bg-white/20 border-2 border-white/30'
                                : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <span className={cat.color}>{cat.emoji} {cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Difficulty
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setQuestInput({ ...questInput, difficulty: diff })}
                            className={`flex-1 py-2 rounded-lg font-semibold transition ${
                              questInput.difficulty === diff
                                ? 'bg-amber-500/20 border-2 border-amber-500/50'
                                : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {'⭐'.repeat(diff)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleAddQuest}
                    disabled={!questInput.name.trim() || quests.length >= 5}
                    className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg font-semibold text-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Add Quest ({quests.length}/5)
                  </button>
                </div>

                {/* Quest List */}
                {quests.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">Your Quests</h3>
                    <AnimatePresence>
                      {quests.map((quest) => (
                        <motion.div
                          key={quest.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 20, opacity: 0 }}
                          className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {QUEST_CATEGORIES.find(c => c.value === quest.category)?.emoji}
                            </span>
                            <div>
                              <p className="font-semibold">{quest.name}</p>
                              <p className="text-xs text-slate-400">
                                {QUEST_CATEGORIES.find(c => c.value === quest.category)?.label} • 
                                {' '}{quest.difficulty === 1 ? 'Easy' : quest.difficulty === 2 ? 'Medium' : 'Hard'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveQuest(quest.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                          >
                            ✕
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>

              <div className="flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(1)}
                  className="px-8 py-3 rounded-lg font-semibold text-lg bg-white/5 hover:bg-white/10 transition"
                >
                  ← Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => quests.length > 0 && setStep(3)}
                  disabled={quests.length === 0}
                  className={`px-8 py-3 rounded-lg font-semibold text-lg transition ${
                    quests.length > 0
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Initialization */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="w-48 h-48 mx-auto mb-8"
              >
                <img
                  src={STARTER_PETS.find(p => p.species === selectedPet)?.image}
                  alt="Your companion"
                  className="w-full h-full object-contain drop-shadow-2xl"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold mb-4"
              >
                Summoning Your Companion...
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-2 mb-8"
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-amber-500 rounded-full"
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-slate-400 text-lg"
              >
                Preparing your adventure...
              </motion.p>

              {!isInitializing && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinish}
                  className="mt-8 px-8 py-3 rounded-lg font-semibold text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  Begin Your Journey
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
