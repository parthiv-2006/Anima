import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { Home, ShoppingBag, Timer, BookOpen, Settings, LogOut, Sparkles, Monitor, LineChart, Scroll } from 'lucide-react';
import PetStage from './components/PetStage.jsx';
import QuestCard from './components/QuestCard.jsx';
import HabitForm from './components/HabitForm.jsx';
import EvolutionEvent from './components/EvolutionEvent.jsx';
import FocusTimer from './components/FocusTimer.jsx';
import ItemShop from './components/ItemShop.jsx';
import SettingsForm from './components/SettingsForm.jsx';
import AmbientMode from './components/AmbientMode.jsx';
import ProductivityHeatmap from './components/ProductivityHeatmap.jsx';
import { HabitRadar } from './components/HabitRadar.jsx';
import HabitRecommendations from './components/HabitRecommendations.jsx';
import AuthForm from './components/AuthForm.jsx';
import OnboardingWizard from './components/OnboardingWizard.jsx';
import WeeklyInsightsTimeline from './components/WeeklyInsightsTimeline.jsx';
import AdventureLog from './components/AdventureLog.jsx';
import QuestCompletionModal from './components/QuestCompletionModal.jsx';
import MiniQuestLog from './components/MiniQuestLog.jsx';
import ToastHub from './components/ToastHub.jsx';
import ComboBanner from './components/ComboBanner.jsx';
import MilestoneCinematic from './components/MilestoneCinematic.jsx';
import { usePetStore } from './state/petStore.js';
import { useAuthStore } from './state/authStore.js';
import { useUiStore } from './state/uiStore.js';
import { speciesCssVars } from './theme/speciesTheme.js';
import { habits as habitsApi, pet as petApi, shop as shopApi } from './services/api.js';

// Avatar emoji mapping for display
const AVATAR_EMOJIS = {
  warrior: '⚔️',
  mage: '🧙',
  ranger: '🏹',
  healer: '💚',
  rogue: '🗡️',
  monk: '🧘',
  dragon: '🐉',
  phoenix: '🔥'
};

// Daily quotes for empty state
const DAILY_QUOTES = [
  { quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { quote: "Small habits lead to remarkable results.", author: "James Clear" },
  { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { quote: "Your habits shape your identity, and your identity shapes your habits.", author: "James Clear" },
  { quote: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Every day is a new beginning. Take a deep breath and start again.", author: "Unknown" }
];

// Navigation Item Component with Lucide Icons
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className={`relative group p-3 rounded-xl transition-all duration-300 ${active
      ? 'bg-accentAmber/10 text-accentAmber shadow-lg shadow-accentAmber/20'
      : 'text-textMuted hover:text-accentAmber hover:bg-accentAmber/5'
      }`}
  >
    <Icon className="w-5 h-5" />
    {/* Tooltip - positioned outside sidebar with high z-index */}
    <span className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-surfaceElevated text-[11px] font-bold tracking-wider uppercase text-textPrimary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] shadow-xl border border-borderSubtle">
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
          className="bg-surfaceElevated backdrop-blur-xl border border-borderSubtle rounded-[16px] p-6 max-w-md shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-textPrimary font-cinzel">📖 Evolution Guide</h3>
            <button onClick={onClose} className="text-textMuted hover:text-textPrimary transition">✕</button>
          </div>
          <ul className="text-[13px] text-textPrimary space-y-3 font-sans">
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

const TopBar = ({ title, user, dominant, totalXP, coins, onAvatarClick }) => (
  <div className="h-[56px] bg-topbar border-b border-borderSubtle flex items-center px-6 gap-4 shrink-0 backdrop-blur-[12px] relative z-10">
    <div className="flex-1">
      <div className="text-[9px] text-textMuted font-bold tracking-[2px] uppercase">Welcome Back</div>
      <div className="text-[17px] text-textPrimary font-cinzel font-bold tracking-wide">{title}</div>
    </div>
    <div className="flex gap-2 items-center">
      <div className="flex items-center gap-2 bg-[#1a2236]/80 border border-white/5 rounded-[10px] px-3.5 py-1.5">
        <div className="text-center">
          <div className="text-[8px] text-textMuted font-bold tracking-[1.5px] uppercase">Dominant</div>
          <div className="text-[14px] text-accentAmber font-bold font-cinzel">{dominant}</div>
        </div>
        <div className="w-[1px] h-6 bg-white/5" />
        <div className="text-center">
          <div className="text-[8px] text-textMuted font-bold tracking-[1.5px] uppercase">Total XP</div>
          <div className="text-[14px] text-textPrimary font-bold font-cinzel">{totalXP}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 bg-accentAmber/10 border border-accentAmber/20 rounded-[10px] px-3.5 py-1.5">
        <span className="text-[14px]">🪙</span>
        <span className="text-[14px] text-accentAmber font-bold">{coins}</span>
      </div>
      <button 
        onClick={onAvatarClick}
        className="w-[36px] h-[36px] rounded-[10px] bg-gradient-to-br from-accentRust to-accentAmber flex items-center justify-center text-base cursor-pointer shadow-[0_0_12px_rgba(232,160,32,0.25)] hover:scale-105 transition"
      >
        {AVATAR_EMOJIS[user?.avatar || 'warrior']}
      </button>
    </div>
  </div>
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
  const [silentRefreshing, setSilentRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [petState, setPetState] = useState(null);
  const [showShop, setShowShop] = useState(false);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'focus' | 'insights' | 'log'
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAmbientMode, setShowAmbientMode] = useState(false);
  const [timerState, setTimerState] = useState(null);
  const [heatmapRefreshKey, setHeatmapRefreshKey] = useState(0);
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState(null);
  const [freezeProtectionUntil, setFreezeProtectionUntil] = useState(null);
  const [activeBackground, setActiveBackground] = useState('default');
  const [completionModalData, setCompletionModalData] = useState(null); // { habit } or null

  const pet = usePetStore((s) => s.pet);
  const setPet = usePetStore((s) => s.updatePet);

  const pushToast = useUiStore((s) => s.pushToast);
  const triggerCelebrate = useUiStore((s) => s.triggerCelebrate);
  const registerCompletion = useUiStore((s) => s.registerCompletion);
  const noteCompletion = useUiStore((s) => s.noteCompletion);
  const setMilestone = useUiStore((s) => s.setMilestone);
  const shakeKey = useUiStore((s) => s.shakeKey);
  const shakeControls = useAnimationControls();

  // Screen shake on combo hits
  useEffect(() => {
    if (!shakeKey) return;
    shakeControls.start({
      x: [0, -10, 10, -7, 7, -3, 3, 0],
      transition: { duration: 0.45, ease: 'easeOut' }
    });
  }, [shakeKey, shakeControls]);

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

  // Daily Challenge: one habit per day becomes the Featured Quest (2x XP).
  // Deterministic pick seeded by the date so it survives reloads.
  const featuredHabitId = useMemo(() => {
    if (habits.length === 0) return null;
    const dateStr = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (const ch of dateStr) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    const sorted = [...habits].sort((a, b) => String(a._id).localeCompare(String(b._id)));
    return sorted[hash % sorted.length]?._id ?? null;
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
  async function loadData(silent = false) {
    try {
      if (silent) {
        setSilentRefreshing(true);
      } else {
        setLoading(true);
      }
      const [habitsData, petData, inventoryData] = await Promise.all([
        habitsApi.getAll(),
        petApi.get(),
        shopApi.getInventory()
      ]);
      setHabits(habitsData);
      setPet(petData);
      setCoins(inventoryData.coins);
      setInventory(inventoryData.inventory);
      setFreezeProtectionUntil(inventoryData.freezeProtectionUntil || null);
      setActiveBackground(inventoryData.inventory?.activeBackground || 'default');
    } catch (err) {
      if (!silent) setError(err.message);
      console.error('Failed to load data:', err);
    } finally {
      if (silent) {
        setSilentRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }

  async function handleHabitCreate(habitData) {
    try {
      const updatedHabits = await habitsApi.create(habitData);
      setHabits(updatedHabits);
      setShowHabitForm(false);
      pushToast({ type: 'success', title: 'Quest Added', message: `"${habitData.name}" joined your quest board.` });
    } catch (err) {
      pushToast({ type: 'error', title: 'Quest Failed', message: `Could not create habit: ${err.message}` });
    }
  }

  // Triggered when clicking a Quest Card
  function requestHabitCompletion(habit) {
    if (habit.isCompletedToday) return;
    setCompletionModalData({ habit });
  }

  // Actual completion logic (called from Modal)
  async function confirmHabitCompletion(habit, note) {
    try {
      // Optimistic update
      setHabits((prev) =>
        prev.map((h) => (h._id === habit._id ? { ...h, isCompletedToday: true } : h))
      );

      const response = await habitsApi.complete(habit._id, note);
      setHabits(response.habits);
      setPet(response.pet);
      if (response.coins !== undefined) setCoins(response.coins);

      // Refresh heatmap after completion
      setHeatmapRefreshKey(prev => prev + 1);
      setCompletionModalData(null); // Close modal

      // Gamification: combo chain, pet celebration, mood, streak milestones
      const combo = registerCompletion();
      noteCompletion();
      triggerCelebrate();

      const featured = habit._id === featuredHabitId;
      const baseXp = 10 * habit.difficulty * (featured ? 2 : 1);
      pushToast({
        type: 'success',
        title: featured ? 'Featured Quest Complete!' : 'Quest Complete',
        message: `+${Math.round(baseXp * combo.multiplier)} XP${combo.multiplier > 1 ? ` (combo x${combo.multiplier})` : ''}${featured ? ' · 2x featured bonus' : ''}`
      });

      const updatedHabit = response.habits.find((h) => h._id === habit._id);
      if (updatedHabit && [7, 30, 100].includes(updatedHabit.streak)) {
        setMilestone({ days: updatedHabit.streak, habitName: updatedHabit.name });
      }

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
      pushToast({ type: 'error', title: 'Completion Failed', message: err.message });
    }
  }

  // Heal from the habitat without opening the shop. Prefers regular potions,
  // falls back to a super potion when that's all that's left.
  async function handleQuickHeal() {
    const itemId = (inventory?.healthPotions || 0) > 0 ? 'healthPotion' : 'superHealthPotion';
    try {
      const result = await shopApi.useItem(itemId);
      const newHp = result?.pet?.hp;
      pushToast({
        type: 'success',
        title: 'Potion Used',
        message: newHp != null ? `Your companion recovered — HP is now ${newHp}/100.` : 'Your companion feels better!'
      });
      triggerCelebrate();
      loadData();
    } catch (err) {
      pushToast({ type: 'error', title: 'Cannot Use Potion', message: err.message });
    }
  }

  async function handleHabitReset(habit) {
    try {
      const response = await habitsApi.reset(habit._id);
      setHabits(response.habits);
      setPet(response.pet);
      if (response.coins !== undefined) setCoins(response.coins);
    } catch (err) {
      pushToast({ type: 'error', title: 'Reset Failed', message: err.message });
    }
  }

  async function handleHabitDelete(habit) {
    try {
      const response = await habitsApi.delete(habit._id);
      setHabits(response.habits);
      pushToast({ type: 'warning', title: 'Quest Abandoned', message: `"${habit.name}" was removed.` });
    } catch (err) {
      pushToast({ type: 'error', title: 'Delete Failed', message: err.message });
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
    <>
      <motion.div
        animate={shakeControls}
        style={speciesCssVars(pet.species)}
        className="flex h-screen w-screen overflow-hidden bg-background font-sans text-textPrimary"
      >
      {/* ========== LEFT SIDEBAR ========== */}
      <aside className="w-[60px] flex-shrink-0 relative z-50 bg-nav border-r border-borderSubtle flex flex-col items-center py-4 gap-1 overflow-visible">
          {/* Avatar mini */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-accentRust to-accentAmber flex items-center justify-center text-[17px] shadow-[0_0_14px_rgba(232,160,32,0.2)] mb-2 hover:scale-105 transition"
            aria-label="Open settings"
          >
            {AVATAR_EMOJIS[user?.avatar || 'warrior']}
          </button>
          
          {/* Level badge — tinted by active species */}
          <div
            className="text-[10px] font-bold rounded-md px-[7px] py-[2px] border mb-3"
            style={{
              color: 'var(--sp-accent)',
              background: 'var(--sp-soft)',
              borderColor: 'var(--sp-border)',
              boxShadow: '0 0 8px var(--sp-soft)'
            }}
          >
            Lv {Math.floor(pet.totalXp / 100) + 1}
          </div>

          <div className="flex-1 flex flex-col gap-1 overflow-visible">
            <NavItem icon={Home} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
            <NavItem icon={Scroll} label="Adventure Log" active={activeView === 'log'} onClick={() => setActiveView('log')} />
            <NavItem icon={ShoppingBag} label="Shop" onClick={() => setShowShop(true)} />
            <NavItem icon={Timer} label="Focus Timer" active={activeView === 'focus'} onClick={() => setActiveView('focus')} />
            <NavItem icon={LineChart} label="Insights" active={activeView === 'insights'} onClick={() => setActiveView('insights')} />
            <NavItem icon={Monitor} label="Ambient Mode" onClick={() => setShowAmbientMode(true)} />
            <NavItem icon={BookOpen} label="Guide" onClick={() => setShowInfoModal(true)} />
          </div>

          {/* Bottom Actions */}
          <div className="mt-auto flex flex-col gap-1 overflow-visible">
            <NavItem icon={Settings} label="Settings" onClick={() => setShowSettings(true)} />
            <motion.button
              onClick={() => {
                clearAuth();
                localStorage.removeItem('token');
              }}
              whileHover={{ scale: 1.1 }}
              className="relative group p-3 rounded-xl text-accentRust hover:bg-accentRust/10 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-surface text-xs text-textPrimary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] shadow-xl border border-borderSubtle">
                Logout
              </span>
            </motion.button>
          </div>
        </aside>

        {/* ========== MAIN AREA ========== */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <TopBar 
            title={activeView === 'dashboard' ? `${user?.username || 'Adventurer'}'s Sanctuary` : activeView === 'log' ? 'Adventure Log' : activeView === 'insights' ? 'Analytics' : 'Focus'}
            user={user}
            dominant={dominant}
            totalXP={pet.totalXp}
            coins={coins}
            onAvatarClick={() => setShowSettings(true)}
          />
          
          <div className="flex-1 flex overflow-hidden">
            {/* ========== CENTER STAGE ========== */}
            <main className="flex-1 overflow-y-auto p-5 screen-enter">
            <AnimatePresence mode="wait">
            {activeView === 'focus' ? (
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
                    onTimerStateChange={setTimerState}
                  />
                </div>
              </motion.div>
            ) : activeView === 'insights' ? (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <WeeklyInsightsTimeline refreshKey={heatmapRefreshKey} userCreatedAt={user?.createdAt} />
              </motion.div>
            ) : activeView === 'log' ? (
              <motion.div
                key="log"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <AdventureLog />
              </motion.div>
            ) : (
              <motion.div
                key="habitat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-5 h-full"
              >
                {/* Left: companion */}
                <div className="w-[380px] flex-shrink-0 flex flex-col">
                  <div className="flex-1 bg-surfaceElevated border border-borderSubtle rounded-[16px] relative overflow-hidden flex flex-col">
                    {/* Stage label */}
                    <div className="px-5 pt-4 flex justify-between items-center z-10 relative shrink-0">
                      <div>
                        <div className="text-[9px] tracking-[2px] text-textMuted font-bold uppercase mb-0.5">Your Companion</div>
                        <div className="text-2xl text-textPrimary font-cinzel font-bold">Stage {pet.stage}</div>
                      </div>
                      <div
                        className="text-[11px] border rounded-[20px] px-3 py-1 font-semibold tracking-wide"
                        style={{ color: 'var(--sp-accent)', background: 'var(--sp-soft)', borderColor: 'var(--sp-border)' }}
                      >
                        ✦ {Math.max((pet.stage === 1 ? 100 : 500) - pet.totalXp, 0)} XP to evolve
                      </div>
                    </div>

                    <PetStage
                      petType={pet.species}
                      evolutionStage={pet.stage}
                      totalXp={pet.totalXp}
                      petState={petState}
                      background={activeBackground}
                      hp={pet.hp}
                      petStats={pet.stats}
                      potionCount={(inventory?.healthPotions || 0) + (inventory?.superHealthPotions || 0)}
                      onQuickHeal={handleQuickHeal}
                    />
                  </div>
                </div>

                {/* Right: habits */}
                <div className="flex-1 flex flex-col overflow-y-auto pr-1 scrollbar-none">
                  {/* Header & Add Button */}
                  <div className="flex items-center justify-between mb-4 mt-1">
                    <div className="text-[11px] text-textMuted font-bold tracking-[1.5px] uppercase">
                      Today's Habits — {habits.filter(h => h.isCompletedToday).length}/{habits.length} done
                    </div>
                    <motion.button
                      onClick={() => setShowHabitForm(!showHabitForm)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-solid px-3.5 py-1.5 rounded-[8px] text-[10px] font-bold tracking-[1px] uppercase"
                    >
                      + New Quest
                    </motion.button>
                  </div>

                  {/* Habit Form */}
                  <AnimatePresence>
                    {showHabitForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                      >
                        <HabitForm onSubmit={handleHabitCreate} onCancel={() => setShowHabitForm(false)} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Quest Cards */}
                  {habits.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {/* Empty Quest State */}
                      <div className="text-center py-8 bg-surfaceElevated backdrop-blur border border-borderSubtle rounded-2xl shadow-lg">
                        <p className="text-4xl mb-3">🗡️</p>
                        <p className="text-textMuted font-medium">No quests yet!</p>
                        <p className="text-[11px] text-textMuted mt-1 uppercase font-bold tracking-widest">Begin your journey by creating a quest.</p>
                      </div>

                      {/* Daily Quote Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card-asym bg-surfaceElevated border border-accentAmber/20 p-4 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-accentAmber/10 to-transparent pointer-events-none" />
                        <div className="relative flex items-start gap-3 z-10">
                          <div className="w-10 h-10 rounded-xl bg-accentAmber/20 flex items-center justify-center flex-shrink-0 border border-accentAmber/30">
                            <Sparkles className="w-5 h-5 text-accentAmber" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[2px] text-accentAmber font-bold mb-1">Daily Wisdom</p>
                            <p className="text-textPrimary font-medium leading-relaxed italic text-sm">
                              "{DAILY_QUOTES[new Date().getDay()]?.quote}"
                            </p>
                            <p className="text-xs text-textMuted mt-2 font-semibold">
                              — {DAILY_QUOTES[new Date().getDay()]?.author}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Quick Start Tips */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-surfaceElevated border border-borderSubtle rounded-[12px] p-4"
                      >
                        <p className="text-[10px] uppercase tracking-[2px] text-textMuted font-bold mb-3">Quick Start Guide</p>
                        <ul className="space-y-2.5 text-xs text-textPrimary">
                          <li className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded bg-statSTR/20 text-statSTR flex items-center justify-center border border-statSTR/30">⚔️</span> 
                            <span>Add <span className="text-statSTR font-bold">STR</span> quests for physical activities</span>
                          </li>
                          <li className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded bg-statINT/20 text-statINT flex items-center justify-center border border-statINT/30">📚</span> 
                            <span>Add <span className="text-statINT font-bold">INT</span> quests for learning & focus</span>
                          </li>
                          <li className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded bg-statSPI/20 text-statSPI flex items-center justify-center border border-statSPI/30">🌿</span> 
                            <span>Add <span className="text-statSPI font-bold">SPI</span> quests for mindfulness</span>
                          </li>
                        </ul>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <div className="space-y-2.5">
                      {/* Quest board: scrolls animate in from the right, featured quest first */}
                      {[...habits]
                        .sort((a, b) => (b._id === featuredHabitId) - (a._id === featuredHabitId))
                        .map((habit, habitIndex) => (
                          <motion.div
                            key={habit._id}
                            initial={{ opacity: 0, x: 48, rotate: 0.6 }}
                            animate={{ opacity: 1, x: 0, rotate: 0 }}
                            transition={{ delay: 0.07 * habitIndex, type: 'spring', stiffness: 260, damping: 24 }}
                          >
                            <QuestCard
                              habit={habit}
                              featured={habit._id === featuredHabitId}
                              onComplete={requestHabitCompletion}
                              onReset={handleHabitReset}
                              onDelete={handleHabitDelete}
                            />
                          </motion.div>
                        ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            </AnimatePresence>
            </main>

            {/* ========== RIGHT SIDEBAR ========== */}
            <aside className="w-[260px] min-w-[260px] bg-sidebar border-l border-borderSubtle p-4 overflow-y-auto scrollbar-none">
              <div className="space-y-6">
                {/* Stats Radar - Compact */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card-notch bg-surfaceElevated border border-borderSubtle p-3.5"
                >
                  <div className="flex items-center gap-[7px] mb-3">
                    <span className="text-[13px] opacity-80">⚔</span>
                    <h3 className="text-[11px] font-bold text-textPrimary tracking-[1px] uppercase font-cinzel">Power Stats</h3>
                  </div>
                  <div className="h-48">
                    <HabitRadar stats={pet.stats} />
                  </div>
                </motion.div>

                {/* Habit Recommendations */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <HabitRecommendations
                    refreshKey={heatmapRefreshKey}
                    onAddHabit={handleHabitCreate}
                  />
                </motion.div>

                {/* Productivity Heatmap */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <ProductivityHeatmap refreshKey={heatmapRefreshKey} />
                </motion.div>

                {/* Mini Quest Log (Replacing the old Quest Cards here) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <MiniQuestLog habits={habits} />
                </motion.div>

              </div>
            </aside>
          </div>
        </div>
      </motion.div>

      {/* Global overlays */}
      <ToastHub />
      <ComboBanner />
      <MilestoneCinematic />

      {/* Modals */}
      <QuestCompletionModal
        habit={completionModalData?.habit}
        isOpen={!!completionModalData}
        onClose={() => setCompletionModalData(null)}
        onConfirm={confirmHabitCompletion}
      />

      <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />

      <SettingsForm
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        onUpdateUser={(updatedUser) => {
          // Update auth store with new user data
          useAuthStore.getState().setAuth(localStorage.getItem('token'), updatedUser);
        }}
      />

      <EvolutionEvent
        open={showEvolution}
        onClose={() => setShowEvolution(false)}
        nextPet={{
          species: pet.species,
          stage: pet.stage + 1,
          evolutionPath: `${pet.species}_${dominant.toUpperCase()}`
        }}
        prevPet={{
          species: pet.species,
          stage: pet.stage,
          nickname: pet.nickname
        }}
      />

      <ItemShop
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        coins={coins}
        inventory={inventory}
        freezeProtectionUntil={freezeProtectionUntil}
        onPurchase={() => loadData(true)}
        onUseItem={() => loadData(true)}
        onSetBackground={(bg) => {
          setActiveBackground(bg);
          loadData(true);
        }}
      />

      {/* Ambient Mode - Full Screen Overlay */}
      {showAmbientMode && (
        <AmbientMode
          onExit={() => setShowAmbientMode(false)}
          currentBackground={activeBackground}
          timerState={timerState}
        />
      )}
    </>
  );
}

export default App;
