import { useMemo, useState } from 'react';
import PetStage from './components/PetStage.jsx';
import QuestCard from './components/QuestCard.jsx';
import EvolutionEvent from './components/EvolutionEvent.jsx';
import { HabitRadar } from './components/HabitRadar.jsx';
import { usePetStore } from './state/petStore.js';

const sampleHabits = [
  { id: 'h1', name: 'Read 10 pages', statCategory: 'INT', difficulty: 2, reward: { xp: 15, int: 10 } },
  { id: 'h2', name: 'Gym Session', statCategory: 'STR', difficulty: 3, reward: { xp: 20, str: 12 } },
  { id: 'h3', name: 'Meditate 10m', statCategory: 'SPI', difficulty: 1, reward: { xp: 10, spi: 8 } }
];

function App() {
  const [showEvolution, setShowEvolution] = useState(false);
  const pet = usePetStore((s) => s.pet);
  const updatePet = usePetStore((s) => s.updatePet);

  const dominant = useMemo(() => {
    const stats = pet.stats;
    const entries = Object.entries(stats);
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] || 'str';
  }, [pet.stats]);

  const handleHabitComplete = (habit) => {
    updatePet({
      stats: {
        str: pet.stats.str + (habit.reward.str || 0),
        int: pet.stats.int + (habit.reward.int || 0),
        spi: pet.stats.spi + (habit.reward.spi || 0)
      },
      totalXp: pet.totalXp + habit.reward.xp
    });

    if (pet.totalXp + habit.reward.xp >= 120) {
      setShowEvolution(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-display">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Evo Habit</p>
            <h1 className="text-3xl font-bold mt-2">Tamagotchi for Productivity</h1>
            <p className="text-slate-400">Complete quests to evolve your pet.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Dominant stat</p>
            <p className="text-lg font-semibold uppercase">{dominant}</p>
            <p className="text-xs text-slate-500">XP: {pet.totalXp}</p>
          </div>
        </header>

        <section className="grid lg:grid-cols-2 gap-6 items-start">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur">
            <PetStage petType={pet.species} evolutionStage={pet.stage} totalXp={pet.totalXp} />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Quest Board</h2>
              <span className="text-xs text-slate-400">Optimistic UI demo</span>
            </div>
            <div className="grid gap-3">
              {sampleHabits.map((habit) => (
                <QuestCard key={habit.id} habit={habit} onComplete={handleHabitComplete} />
              ))}
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
