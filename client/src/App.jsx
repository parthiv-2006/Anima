import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PetStage from './components/PetStage.jsx';
import QuestCard from './components/QuestCard.jsx';
import HabitForm from './components/HabitForm.jsx';
import EvolutionEvent from './components/EvolutionEvent.jsx';
import FocusTimer from './components/FocusTimer.jsx';
import ItemShop from './components/ItemShop.jsx';
import { HabitRadar } from './components/HabitRadar.jsx';
import AuthForm from './components/AuthForm.jsx';
import OnboardingWizard from './components/OnboardingWizard.jsx';
import { usePetStore } from './state/petStore.js';
import { useAuthStore } from './state/authStore.js';
import { habits as habitsApi, pet as petApi, shop as shopApi } from './services/api.js';

// Navigation icons
const NavIcon = ({ icon, label, active, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className={`relative group p-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/20' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {label}
    </span>
  </motion.button>
);

// Info Modal for Evolution Logic
const InfoModal = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">📖 Evolution Guide</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition">✕</button>
          </div>
          <ul className="text-sm text-slate-300 space-y-3">
            <li className="flex gap-2"><span>🌟</span> Stage 2 unlocks after 100 XP. Your dominant stat determines variant.</li>
            <li className="flex gap-2"><span>⚡</span> Stage 3 unlocks after 500 XP. Pure vs hybrid build check.</li>
            <li className="flex gap-2"><span>💔</span> Decay: If you're away 24+ hours, HP drops 10% and habits reset.</li>
            <li className="flex gap-2"><span>🔥</span> Streaks give bonus coins! Max +7 coins per completion.</li>
          </ul>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

function App() {
  // ========== ALL HOOKS FIRST (unconditional) ==========
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [showEvolution, setShowEvolution] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [petState, setPetState] = useState(null);
  const [showShop, setShowShop] = useState(false);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState(null);
  const [activeBackground, setActiveBackground] = useState('default');
  
  const pet = usePetStore((s) => s.pet);
  const setPet = usePetStore((s) => s.updatePet);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, loading data...');
      loadData();
    }
  }, [isAuthenticated]);

  // Check if user needs onboarding
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user just registered (has no habits yet)
      const checkOnboarding = async () => {
        try {
          const userHabits = await habitsApi.getAll();
          setNeedsOnboarding(userHabits.length === 0);
        } catch (err) {
          console.error('Failed to check onboarding status:', err);
        }
      };
      checkOnboarding();
    }
  }, [isAuthenticated, user]);

  const dominant = useMemo(() => {
    const stats = pet.stats;
    const entries = Object.entries(stats);
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] || 'str';
  }, [pet.stats]);

  const habitsByCategory = useMemo(() => {
    return habits.reduce((acc, habit) => {
      if (!acc[habit.statCategory]) acc[habit.statCategory] = [];
      acc[habit.statCategory].push(habit);
      return acc;
    }, {});
  }, [habits]);

  console.log('🔄 App render - hydrated:', isHydrated, 'authenticated:', isAuthenticated, 'loading:', loading);

  // ========== CONDITIONAL RENDERING (after all hooks) ==========
  
  // Wait for hydration before rendering
  if (!isHydrated) {
    console.log('⏳ Waiting for hydration...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-display flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, showing AuthForm');
    return <AuthForm />;
  }

  // Show onboarding wizard if needed
  if (needsOnboarding) {
    console.log('🎮 Showing onboarding wizard');
    return (
      <OnboardingWizard
        onComplete={() => {
          setNeedsOnboarding(false);
          loadData();
        }}
      />
    );
  }

  console.log('✅ Authenticated, showing dashboard');

  // ========== ASYNC FUNCTIONS ==========
  async function loadData() {
    try {
      setLoading(true);
      const [habitsData, petData, inventoryData] = await Promise.all([
        habitsApi.getAll(),
        petApi.get(),
        shopApi.getInventory()
      ]);
      setHabits(habitsData);
      setPet(petData);
      setCoins(inventoryData.coins);
      setInventory(inventoryData.inventory);
      setActiveBackground(inventoryData.inventory?.activeBackground || 'default');
    } catch (err) {
      setError(err.message);
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleHabitCreate(habitData) {
    try {
      const updatedHabits = await habitsApi.create(habitData);
      setHabits(updatedHabits);
      setShowHabitForm(false);
    } catch (err) {
      alert(`Failed to create habit: ${err.message}`);
    }
  }

  async function handleHabitComplete(habit) {
    try {
      // Optimistic update
      setHabits((prev) =>
        prev.map((h) => (h._id === habit._id ? { ...h, isCompletedToday: true } : h))
      );

      const response = await habitsApi.complete(habit._id);
      setHabits(response.habits);
      setPet(response.pet);
      if (response.coins !== undefined) setCoins(response.coins);

      // Check for evolution
      if (response.pet.totalXp >= 100 && pet.stage === 1) {
        setShowEvolution(true);
      } else if (response.pet.totalXp >= 500 && pet.stage === 2) {
        setShowEvolution(true);
      }
    } catch (err) {
      // Revert optimistic update
      setHabits((prev) =>
        prev.map((h) => (h._id === habit._id ? { ...h, isCompletedToday: false } : h))
      );
      alert(`Failed to complete habit: ${err.message}`);
    }
  }

  async function handleHabitReset(habit) {
    try {
      const response = await habitsApi.reset(habit._id);
      setHabits(response.habits);
      setPet(response.pet);
      if (response.coins !== undefined) setCoins(response.coins);
    } catch (err) {
      alert(`Failed to reset habit: ${err.message}`);
    }
  }

  async function handleHabitDelete(habit) {
    try {
      const response = await habitsApi.delete(habit._id);
      setHabits(response.habits);
    } catch (err) {
      alert(`Failed to delete habit: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-display flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading your quest...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-display flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-slate-300">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-display">
      {/* Main 3-Column Grid Layout */}
      <div className="h-screen grid grid-cols-[72px_1fr_380px] gap-0">
        
        {/* ========== LEFT SIDEBAR - Glass Navigation Rail ========== */}
        <aside className="bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-6 gap-2">
          {/* User Level & Coins */}
          <div className="mb-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/30">
              {Math.floor(pet.totalXp / 100) + 1}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Level</p>
          </div>
          
          <motion.button
            onClick={() => setShowShop(true)}
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4"
          >
            <span className="text-lg">🪙</span>
            <span className="text-xs font-bold text-amber-400">{coins}</span>
          </motion.button>
          
          <div className="flex-1 flex flex-col gap-2">
            <NavIcon icon="🏠" label="Dashboard" active={!showFocusTimer} onClick={() => setShowFocusTimer(false)} />
            <NavIcon icon="🎒" label="Shop" onClick={() => setShowShop(true)} />
            <NavIcon icon="⏱️" label="Focus Timer" active={showFocusTimer} onClick={() => setShowFocusTimer(true)} />
            <NavIcon icon="📖" label="Guide" onClick={() => setShowInfoModal(true)} />
          </div>
          
          {/* Bottom Actions */}
          <div className="mt-auto flex flex-col gap-2">
            <NavIcon icon="⚙️" label="Settings" onClick={() => {}} />
            <motion.button
              onClick={() => {
                clearAuth();
                localStorage.removeItem('token');
              }}
              whileHover={{ scale: 1.1 }}
              className="p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
              title="Logout"
            >
              <span className="text-xl">🚪</span>
            </motion.button>
          </div>
        </aside>

        {/* ========== CENTER STAGE - The Habitat ========== */}
        <main className="p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {showFocusTimer ? (
              <motion.div
                key="focus-timer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full">
                  <FocusTimer 
                    onTimerStart={(state) => setPetState(state)} 
                    onTimerEnd={() => {
                      setPetState(null);
                      loadData();
                    }} 
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="habitat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm uppercase tracking-[0.3em] text-amber-500/80 font-semibold"
                    >
                      Welcome Back
                    </motion.p>
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-3xl font-bold text-white mt-1"
                    >
                      {user?.username || 'Adventurer'}'s Sanctuary
                    </motion.h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right px-4 py-2 bg-white/5 backdrop-blur border border-white/10 rounded-xl">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">Dominant</p>
                      <p className="text-lg font-bold text-amber-400 uppercase">{dominant}</p>
                    </div>
                    <div className="text-right px-4 py-2 bg-white/5 backdrop-blur border border-white/10 rounded-xl">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">Total XP</p>
                      <p className="text-lg font-bold text-white">{pet.totalXp}</p>
                    </div>
                  </div>
                </div>

                {/* Pet Habitat Container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative bg-gradient-to-b from-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/30"
                >
                  {/* Ambient glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="p-8">
                    <PetStage 
                      petType={pet.species} 
                      evolutionStage={pet.stage} 
                      totalXp={pet.totalXp} 
                      petState={petState}
                      background={activeBackground}
                      hp={pet.hp}
                      petStats={pet.stats}
                    />
                  </div>
                </motion.div>

                {/* Habit Form */}
                <AnimatePresence>
                  {showHabitForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <HabitForm onSubmit={handleHabitCreate} onCancel={() => setShowHabitForm(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ========== RIGHT PANEL - Quest Log ========== */}
        <aside className="bg-slate-900/30 backdrop-blur-xl border-l border-white/5 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Stats Radar - Compact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4"
            >
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <span>📊</span> Power Stats
              </h3>
              <div className="h-48">
                <HabitRadar stats={pet.stats} />
              </div>
            </motion.div>

            {/* Quest Board Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📜</span> Quest Log
              </h2>
              <motion.button
                onClick={() => setShowHabitForm(!showHabitForm)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-sm text-white font-semibold shadow-lg shadow-amber-500/25 transition"
              >
                + New Quest
              </motion.button>
            </div>

            {/* Quest Cards */}
            {habits.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white/5 backdrop-blur border border-white/10 rounded-2xl"
              >
                <p className="text-4xl mb-3">🗡️</p>
                <p className="text-slate-400 font-medium">No quests yet!</p>
                <p className="text-sm text-slate-500 mt-1">Begin your journey by creating a quest.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {['STR', 'INT', 'SPI'].map((category, categoryIndex) => {
                  const categoryHabits = habitsByCategory[category] || [];
                  if (categoryHabits.length === 0) return null;
                  
                  const categoryConfig = {
                    STR: { icon: '⚔️', label: 'Strength', accent: 'border-l-red-500', bg: 'from-red-500/10' },
                    INT: { icon: '📚', label: 'Intellect', accent: 'border-l-blue-500', bg: 'from-blue-500/10' },
                    SPI: { icon: '🌿', label: 'Spirit', accent: 'border-l-emerald-500', bg: 'from-emerald-500/10' }
                  };
                  const config = categoryConfig[category];

                  return (
                    <motion.div 
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * categoryIndex }}
                    >
                      <h4 className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                        <span>{config.icon}</span> {config.label} Quests
                      </h4>
                      <div className="space-y-2">
                        {categoryHabits.map((habit, habitIndex) => (
                          <motion.div
                            key={habit._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * categoryIndex + 0.05 * habitIndex }}
                          >
                            <QuestCard
                              habit={habit}
                              onComplete={handleHabitComplete}
                              onReset={handleHabitReset}
                              onDelete={handleHabitDelete}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modals */}
      <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />

      <EvolutionEvent
        open={showEvolution}
        onClose={() => setShowEvolution(false)}
        nextPet={{
          species: pet.species,
          stage: pet.stage + 1,
          evolutionPath: `${pet.species}_${dominant.toUpperCase()}`
        }}
      />

      <ItemShop
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        coins={coins}
        inventory={inventory}
        onPurchase={loadData}
        onUseItem={loadData}
        onSetBackground={(bg) => {
          setActiveBackground(bg);
          loadData();
        }}
      />
    </div>
  );
}

export default App;
