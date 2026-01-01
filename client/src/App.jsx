import { useEffect, useMemo, useState } from 'react';
import PetStage from './components/PetStage.jsx';
import QuestCard from './components/QuestCard.jsx';
import HabitForm from './components/HabitForm.jsx';
import EvolutionEvent from './components/EvolutionEvent.jsx';
import { HabitRadar } from './components/HabitRadar.jsx';
import AuthForm from './components/AuthForm.jsx';
import { usePetStore } from './state/petStore.js';
import { useAuthStore } from './state/authStore.js';
import { habits as habitsApi, pet as petApi } from './services/api.js';

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [showEvolution, setShowEvolution] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const pet = usePetStore((s) => s.pet);
  const setPet = usePetStore((s) => s.updatePet);

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return <AuthForm />;
  }

  // Fetch initial data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [habitsData, petData] = await Promise.all([
        habitsApi.getAll(),
        petApi.get()
      ]);
      setHabits(habitsData);
      setPet(petData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  const dominant = useMemo(() => {
    const stats = pet.stats;
    const entries = Object.entries(stats);
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] || 'str';
  }, [pet.stats]);

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

  // Group habits by category
  const habitsByCategory = useMemo(() => {
    return habits.reduce((acc, habit) => {
      if (!acc[habit.statCategory]) acc[habit.statCategory] = [];
      acc[habit.statCategory].push(habit);
      return acc;
    }, {});
  }, [habits]);

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
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Evo Habit</p>
            <h1 className="text-3xl font-bold mt-2">Tamagotchi for Productivity</h1>
            <p className="text-slate-400">Complete quests to evolve your pet.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-400">Dominant stat</p>
              <p className="text-lg font-semibold uppercase">{dominant}</p>
              <p className="text-xs text-slate-500">XP: {pet.totalXp}</p>
            </div>
            <button
              onClick={() => {
                clearAuth();
                localStorage.removeItem('token');
              }}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-semibold transition"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid lg:grid-cols-2 gap-6 items-start">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur">
            <PetStage petType={pet.species} evolutionStage={pet.stage} totalXp={pet.totalXp} />
          </div>

          <div className="space-y-4">
            {showHabitForm && (
              <HabitForm onSubmit={handleHabitCreate} onCancel={() => setShowHabitForm(false)} />
            )}

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Quest Board</h2>
                <button
                  onClick={() => setShowHabitForm(!showHabitForm)}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-sm text-amber-300 font-semibold transition"
                >
                  + New Quest
                </button>
              </div>

              {habits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-2">No quests yet!</p>
                  <p className="text-sm text-slate-500">Create your first habit to start your journey.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {['STR', 'INT', 'SPI'].map((category) => {
                    const categoryHabits = habitsByCategory[category] || [];
                    if (categoryHabits.length === 0) return null;

                    return (
                      <div key={category}>
                        <h3 className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">
                          {category === 'STR' && '⚔️ Strength Quests'}
                          {category === 'INT' && '📚 Intellect Quests'}
                          {category === 'SPI' && '🌿 Spirit Quests'}
                        </h3>
                        <div className="grid gap-3">
                          {categoryHabits.map((habit) => (
                            <QuestCard
                              key={habit._id}
                              habit={habit}
                              onComplete={handleHabitComplete}
                              onReset={handleHabitReset}
                              onDelete={handleHabitDelete}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur">
            <HabitRadar stats={pet.stats} />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur space-y-3">
            <h3 className="text-lg font-semibold">Evolution Logic</h3>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
              <li>Stage 2 after totalXp &gt; 100, dominant stat decides variant.</li>
              <li>Stage 3 after totalXp &gt; 500, pure vs hybrid build check.</li>
              <li>Decay: if last login &gt; 24h, reduce HP 10% and reset habits.</li>
            </ul>
          </div>
        </section>
      </div>

      <EvolutionEvent
        open={showEvolution}
        onClose={() => setShowEvolution(false)}
        nextPet={{
          species: pet.species,
          stage: pet.stage + 1,
          evolutionPath: `${pet.species}_${dominant.toUpperCase()}`
        }}
      />
    </div>
  );
}

export default App;
