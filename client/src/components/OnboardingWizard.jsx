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
    gradient: 'from-orange-500/20 to-red-500/20',
    glow: 'rgba(251,146,60,0.4)',
    ring: 'ring-orange-500/60',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    stat: 'STR',
  },
  {
    species: 'AQUA',
    name: 'Aqua Wisp',
    emoji: '💧',
    image: '/pets/aqua/babyAqua-removebg-preview.png',
    description: 'For the calm strategist. Flows with wisdom and adaptability.',
    gradient: 'from-sky-500/20 to-blue-500/20',
    glow: 'rgba(56,189,248,0.4)',
    ring: 'ring-sky-500/60',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    stat: 'INT',
  },
  {
    species: 'TERRA',
    name: 'Terra Golem',
    emoji: '🌿',
    image: '/pets/terra/babyTerra-removebg-preview.png',
    description: 'For the steady grower. Rooted in resilience and natural strength.',
    gradient: 'from-emerald-500/20 to-lime-500/20',
    glow: 'rgba(74,222,128,0.4)',
    ring: 'ring-emerald-500/60',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    stat: 'SPI',
  },
];

const QUEST_CATEGORIES = [
  { value: 'STR', label: 'Strength', emoji: '⚔️', color: 'text-accentAmber', activeBg: 'bg-accentAmber/15 border-accentAmber/50' },
  { value: 'INT', label: 'Intellect', emoji: '📚', color: 'text-statINT',    activeBg: 'bg-statINT/15 border-statINT/50'       },
  { value: 'SPI', label: 'Spirit',   emoji: '🌿', color: 'text-statSPI',    activeBg: 'bg-statSPI/15 border-statSPI/50'        },
];

const labelClass = 'block text-[10px] font-bold tracking-[1.5px] uppercase text-textMuted mb-2';
const inputClass =
  'w-full px-4 py-3 bg-surfaceElevated border border-borderSubtle rounded-xl text-textPrimary placeholder-textMuted focus:outline-none focus:border-accentAmber/50 focus:ring-1 focus:ring-accentAmber/50 transition text-sm';

const pageVariants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -60 },
};

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep]               = useState(1);
  const [selectedPet, setSelectedPet] = useState(null);
  const [quests, setQuests]           = useState([]);
  const [questInput, setQuestInput]   = useState({ name: '', category: 'STR', difficulty: 1 });
  const [isInitializing, setIsInitializing] = useState(false);
  const user = useAuthStore((s) => s.user);

  const handleAddQuest = () => {
    if (questInput.name.trim() && quests.length < 5) {
      setQuests([...quests, { ...questInput, id: Date.now() }]);
      setQuestInput({ name: '', category: 'STR', difficulty: 1 });
    }
  };

  const handleRemoveQuest = (id) => setQuests(quests.filter((q) => q.id !== id));

  const handleFinish = async () => {
    setIsInitializing(true);
    await new Promise((r) => setTimeout(r, 2500));
    try {
      await petApi.update({ species: selectedPet });
      for (const quest of quests) {
        await habitsApi.create({ name: quest.name, statCategory: quest.category, difficulty: quest.difficulty });
      }
    } catch (err) {
      console.error('Failed to initialize:', err);
    }
    onComplete?.();
  };

  const STEPS = ['Choose Companion', 'Set Quests', 'Begin'];

  return (
    <div className="min-h-screen bg-background font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-accentAmber/4 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-accentRust/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl relative">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-accentRust to-accentAmber shadow-[0_0_24px_rgba(232,160,32,0.3)] mb-4"
          >
            <span className="text-2xl">✦</span>
          </motion.div>
          <motion.h1
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl text-textPrimary font-cinzel font-bold tracking-wide mb-1"
          >
            {user?.username ? `Welcome, ${user.username}` : 'Welcome, Adventurer'}
          </motion.h1>
          <motion.p
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-textMuted text-sm tracking-wide"
          >
            Your journey begins here
          </motion.p>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {STEPS.map((label, i) => {
            const s = i + 1;
            const done    = step > s;
            const current = step === s;
            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    animate={{ scale: current ? 1.1 : 1 }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition ${
                      done    ? 'bg-accentAmber border-accentAmber text-background' :
                      current ? 'bg-accentAmber/15 border-accentAmber text-accentAmber shadow-[0_0_12px_rgba(232,160,32,0.3)]' :
                                'bg-surfaceElevated border-borderSubtle text-textMuted'
                    }`}
                  >
                    {done ? '✓' : s}
                  </motion.div>
                  <span className={`text-[9px] font-bold tracking-[1px] uppercase ${current ? 'text-accentAmber' : 'text-textMuted'}`}>
                    {label}
                  </span>
                </div>
                {s < 3 && (
                  <div className={`w-20 h-[2px] mx-3 mb-4 rounded transition-colors ${step > s ? 'bg-accentAmber' : 'bg-borderSubtle'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">

          {/* ── Step 1: Pet Selection ── */}
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
                <h2 className="text-3xl font-bold text-textPrimary font-cinzel mb-2">Choose Your Companion</h2>
                <p className="text-textMuted text-sm">Your companion evolves as you complete your daily quests</p>
              </div>

              <div className="grid md:grid-cols-3 gap-5 mb-8">
                {STARTER_PETS.map((pet, i) => {
                  const isSelected = selectedPet === pet.species;
                  return (
                    <motion.div
                      key={pet.species}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      whileHover={{ y: -6 }}
                      onClick={() => setSelectedPet(pet.species)}
                      className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? `ring-4 ${pet.ring} border-transparent`
                          : 'border-borderSubtle hover:border-accentAmber/30'
                      }`}
                    >
                      <div className="bg-surfaceElevated p-6">
                        {/* Gradient tint */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${pet.gradient} pointer-events-none transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40'}`} />
                        
                        {/* Glow when selected */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: `radial-gradient(circle at center, ${pet.glow} 0%, transparent 65%)` }}
                          />
                        )}

                        <div className="relative">
                          {/* Pet image */}
                          <motion.div
                            className="w-full h-48 flex items-center justify-center mb-5"
                            animate={{ scale: isSelected ? 1.08 : 1 }}
                            transition={{ type: 'spring', stiffness: 280 }}
                          >
                            <img
                              src={pet.image}
                              alt={pet.name}
                              className="w-40 h-40 object-contain drop-shadow-2xl"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </motion.div>

                          {/* Info */}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-textPrimary font-cinzel">{pet.name}</h3>
                            </div>
                            <span className={`inline-block text-[10px] font-bold tracking-[1px] uppercase px-2.5 py-0.5 rounded-full border mb-2 ${pet.badge}`}>
                              {pet.emoji} {pet.stat} Build
                            </span>
                            <p className="text-xs text-textMuted leading-relaxed">{pet.description}</p>
                          </div>

                          {/* Selected checkmark */}
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-0 right-0 bg-accentAmber rounded-full p-1.5 shadow-[0_0_10px_rgba(232,160,32,0.5)]"
                            >
                              <svg className="w-4 h-4 text-background" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectedPet && setStep(2)}
                  disabled={!selectedPet}
                  className={`px-8 py-3 rounded-xl font-bold text-sm tracking-[1px] uppercase transition ${
                    selectedPet
                      ? 'bg-gradient-to-r from-accentRust to-accentAmber text-background shadow-[0_0_20px_rgba(232,160,32,0.3)]'
                      : 'bg-surfaceElevated text-textMuted cursor-not-allowed border border-borderSubtle'
                  }`}
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Quest Setup ── */}
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
                <h2 className="text-3xl font-bold text-textPrimary font-cinzel mb-2">Define Your First Quests</h2>
                <p className="text-textMuted text-sm">Set up to 5 daily objectives to begin your adventure</p>
              </div>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-surfaceElevated border border-borderSubtle rounded-2xl p-7 mb-5"
              >
                {/* Quest input */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className={labelClass}>Quest Name</label>
                    <input
                      type="text"
                      value={questInput.name}
                      onChange={(e) => setQuestInput({ ...questInput, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQuest())}
                      placeholder="e.g., Read 10 pages, Morning run, Meditate 10 min…"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label className={labelClass}>Category</label>
                      <div className="flex gap-2">
                        {QUEST_CATEGORIES.map((cat) => {
                          const active = questInput.category === cat.value;
                          return (
                            <button
                              key={cat.value}
                              onClick={() => setQuestInput({ ...questInput, category: cat.value })}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition ${
                                active
                                  ? `${cat.activeBg} ${cat.color}`
                                  : 'bg-surface border-borderSubtle text-textMuted hover:border-accentAmber/20'
                              }`}
                            >
                              <span className="block text-base mb-0.5">{cat.emoji}</span>
                              <span className="font-cinzel tracking-wide">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label className={labelClass}>Difficulty</label>
                      <div className="flex gap-2">
                        {[
                          { diff: 1, label: 'Easy',   stars: '⭐' },
                          { diff: 2, label: 'Medium',  stars: '⭐⭐' },
                          { diff: 3, label: 'Hard',    stars: '⭐⭐⭐' },
                        ].map(({ diff, label, stars }) => (
                          <button
                            key={diff}
                            onClick={() => setQuestInput({ ...questInput, difficulty: diff })}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition ${
                              questInput.difficulty === diff
                                ? 'bg-accentAmber/15 border-accentAmber/50 text-accentAmber'
                                : 'bg-surface border-borderSubtle text-textMuted hover:border-accentAmber/20'
                            }`}
                          >
                            <span className="block text-sm mb-0.5">{diff === 1 ? '⭐' : diff === 2 ? '⭐⭐' : '⭐⭐⭐'}</span>
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddQuest}
                    disabled={!questInput.name.trim() || quests.length >= 5}
                    className="w-full py-3 bg-accentAmber/10 hover:bg-accentAmber/20 border border-accentAmber/30 rounded-xl font-bold text-accentAmber text-sm tracking-[1px] uppercase transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    + Add Quest ({quests.length}/5)
                  </motion.button>
                </div>

                {/* Quest list */}
                <AnimatePresence>
                  {quests.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-textMuted mb-3 flex items-center gap-2">
                        <div className="flex-1 h-px bg-borderSubtle" />
                        Your Quests
                        <div className="flex-1 h-px bg-borderSubtle" />
                      </div>
                      <div className="space-y-2">
                        <AnimatePresence>
                          {quests.map((quest) => {
                            const cat = QUEST_CATEGORIES.find((c) => c.value === quest.category);
                            return (
                              <motion.div
                                key={quest.id}
                                initial={{ x: -16, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 16, opacity: 0 }}
                                className="flex items-center justify-between px-4 py-3 bg-surface border border-borderSubtle rounded-xl"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">{cat?.emoji}</span>
                                  <div>
                                    <p className="text-textPrimary text-sm font-semibold">{quest.name}</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-wide ${cat?.color}`}>
                                      {cat?.label} · {quest.difficulty === 1 ? 'Easy' : quest.difficulty === 2 ? 'Medium' : 'Hard'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveQuest(quest.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/15 text-textMuted hover:text-red-400 transition"
                                >
                                  ✕
                                </button>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(1)}
                  className="px-7 py-3 rounded-xl font-bold text-sm tracking-wide text-textMuted bg-surfaceElevated border border-borderSubtle hover:border-accentAmber/30 transition"
                >
                  ← Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => quests.length > 0 && setStep(3)}
                  disabled={quests.length === 0}
                  className={`px-8 py-3 rounded-xl font-bold text-sm tracking-[1px] uppercase transition ${
                    quests.length > 0
                      ? 'bg-gradient-to-r from-accentRust to-accentAmber text-background shadow-[0_0_20px_rgba(232,160,32,0.3)]'
                      : 'bg-surfaceElevated text-textMuted cursor-not-allowed border border-borderSubtle'
                  }`}
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Summoning ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-center py-16"
            >
              {/* Pet hero */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative w-56 h-56 mx-auto mb-8"
              >
                {/* Glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    background: `radial-gradient(circle, ${STARTER_PETS.find((p) => p.species === selectedPet)?.glow || 'rgba(232,160,32,0.4)'} 0%, transparent 70%)`
                  }}
                />
                <img
                  src={STARTER_PETS.find((p) => p.species === selectedPet)?.image}
                  alt="Your companion"
                  className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                  style={{ imageRendering: 'pixelated' }}
                />
              </motion.div>

              <motion.h2
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-textPrimary font-cinzel mb-3"
              >
                Summoning Your Companion...
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-textMuted text-sm mb-8 tracking-wide"
              >
                Binding your spirit to the sanctuary
              </motion.p>

              {/* Animated dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-2 mb-10"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 bg-accentAmber rounded-full"
                    animate={{ y: [0, -16, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>

              {/* Summary card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="inline-flex flex-col items-center bg-surfaceElevated border border-borderSubtle rounded-2xl px-8 py-5 mb-8 text-left max-w-xs w-full"
              >
                <p className="text-[9px] font-bold tracking-[2px] uppercase text-textMuted mb-3 self-start">Adventure Summary</p>
                <div className="flex items-center gap-3 mb-3 self-start">
                  <span className="text-2xl">{STARTER_PETS.find((p) => p.species === selectedPet)?.emoji}</span>
                  <div>
                    <p className="text-textPrimary font-bold font-cinzel text-sm">{STARTER_PETS.find((p) => p.species === selectedPet)?.name}</p>
                    <p className="text-textMuted text-[10px]">Your Companion</p>
                  </div>
                </div>
                <div className="w-full h-px bg-borderSubtle mb-3" />
                <p className="text-textMuted text-[10px] font-bold tracking-wide uppercase self-start mb-2">Initial Quests ({quests.length})</p>
                {quests.map((q) => {
                  const cat = QUEST_CATEGORIES.find((c) => c.value === q.category);
                  return (
                    <div key={q.id} className={`flex items-center gap-2 text-xs mb-1 self-start ${cat?.color}`}>
                      <span>{cat?.emoji}</span>
                      <span className="text-textPrimary">{q.name}</span>
                    </div>
                  );
                })}
              </motion.div>

              {!isInitializing && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinish}
                  className="px-10 py-3.5 rounded-xl font-bold text-sm tracking-[1px] uppercase bg-gradient-to-r from-accentRust to-accentAmber text-background shadow-[0_0_24px_rgba(232,160,32,0.35)] transition"
                >
                  ✦ Begin Your Journey
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
