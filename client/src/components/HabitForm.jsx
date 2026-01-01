import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STAT_CATEGORIES = [
  { value: 'STR', label: 'Strength', color: 'from-amber-500 to-red-500', description: 'Physical & discipline' },
  { value: 'INT', label: 'Intellect', color: 'from-sky-500 to-blue-500', description: 'Learning & creativity' },
  { value: 'SPI', label: 'Spirit', color: 'from-emerald-500 to-lime-500', description: 'Wellness & mindfulness' }
];

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Easy', xp: 10 },
  { value: 2, label: 'Medium', xp: 20 },
  { value: 3, label: 'Hard', xp: 30 }
];

export default function HabitForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    statCategory: 'STR',
    difficulty: 2
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Habit name is required');
      return;
    }
    onSubmit(formData);
    setFormData({ name: '', statCategory: 'STR', difficulty: 2 });
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Create New Habit</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Habit Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Habit Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Read 10 pages, Gym session, Meditate 10m"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-white/30"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Quest Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {STAT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, statCategory: cat.value })}
                className={`relative p-3 rounded-lg border transition ${
                  formData.statCategory === cat.value
                    ? 'border-white/30 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${cat.color} opacity-20`} />
                <div className="relative">
                  <p className="font-semibold text-sm">{cat.label}</p>
                  <p className="text-xs text-slate-400">{cat.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Difficulty
          </label>
          <div className="flex gap-2">
            {DIFFICULTY_LEVELS.map((diff) => (
              <button
                key={diff.value}
                type="button"
                onClick={() => setFormData({ ...formData, difficulty: diff.value })}
                className={`flex-1 px-4 py-2 rounded-lg border transition ${
                  formData.difficulty === diff.value
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <p className="font-semibold text-sm">{diff.label}</p>
                <p className="text-xs opacity-70">+{diff.xp} XP</p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg font-semibold text-white transition"
        >
          Add Habit Quest
        </button>
      </form>
    </motion.div>
  );
}
