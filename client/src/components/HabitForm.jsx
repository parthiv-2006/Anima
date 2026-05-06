import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STAT_CATEGORIES = [
  { value: 'STR', label: 'Strength', color: 'bg-statSTR', description: 'Physical & discipline' },
  { value: 'INT', label: 'Intellect', color: 'bg-statINT', description: 'Learning & creativity' },
  { value: 'SPI', label: 'Spirit', color: 'bg-statSPI', description: 'Wellness & mindfulness' }
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
      className="bg-surfaceElevated border border-borderSubtle rounded-2xl p-6 backdrop-blur shadow-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <div className="relative flex items-center justify-between mb-6 border-b border-borderSubtle pb-4">
        <h3 className="text-lg font-bold text-textPrimary font-cinzel">Create New Habit</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-[10px] uppercase font-bold tracking-widest text-textMuted hover:text-textPrimary transition"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative space-y-5">
        {/* Habit Name */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-textMuted mb-2 drop-shadow-sm">
            Habit Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Read 10 pages, Gym session, Meditate 10m"
            className="w-full px-4 py-3 bg-surface border border-borderSubtle rounded-[10px] text-textPrimary placeholder-textMuted/50 focus:outline-none focus:border-accentAmber focus:ring-1 focus:ring-accentAmber/30 transition shadow-inner font-sans text-sm"
          />
          {error && <p className="text-accentRust text-[10px] uppercase tracking-wider font-bold mt-1.5">{error}</p>}
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-textMuted mb-2 drop-shadow-sm">
            Quest Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {STAT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, statCategory: cat.value })}
                className={`relative p-3 rounded-[10px] border transition shadow-md overflow-hidden ${
                  formData.statCategory === cat.value
                    ? 'border-accentAmber/50 bg-surface text-textPrimary'
                    : 'border-borderSubtle bg-surface hover:bg-surfaceElevated text-textMuted'
                }`}
              >
                <div className={`absolute inset-0 ${cat.color} opacity-20`} />
                {formData.statCategory === cat.value && (
                  <div className={`absolute inset-0 bg-gradient-to-t from-${cat.color.replace('bg-', '')}/30 to-transparent pointer-events-none`} />
                )}
                <div className="relative z-10">
                  <p className="font-bold text-xs uppercase tracking-wider">{cat.label}</p>
                  <p className="text-[9px] mt-1 opacity-80">{cat.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-textMuted mb-2 drop-shadow-sm">
            Difficulty
          </label>
          <div className="flex gap-2">
            {DIFFICULTY_LEVELS.map((diff) => (
              <button
                key={diff.value}
                type="button"
                onClick={() => setFormData({ ...formData, difficulty: diff.value })}
                className={`flex-1 px-4 py-2.5 rounded-[10px] border transition shadow-sm ${
                  formData.difficulty === diff.value
                    ? 'border-accentAmber bg-accentAmber/10 text-accentAmber shadow-[0_0_8px_rgba(232,160,32,0.2)]'
                    : 'border-borderSubtle bg-surface hover:bg-surfaceElevated text-textMuted'
                }`}
              >
                <p className="font-bold text-xs uppercase tracking-wider">{diff.label}</p>
                <p className="text-[10px] opacity-70 font-bold">+{diff.xp} XP</p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-4 px-4 py-3.5 bg-gradient-to-r from-accentRust to-accentAmber hover:from-accentAmber hover:to-accentRust rounded-[10px] font-bold text-xs uppercase tracking-widest text-background shadow-[0_0_15px_rgba(232,160,32,0.3)] hover:shadow-[0_0_20px_rgba(232,160,32,0.5)] transition-all transform hover:-translate-y-0.5"
        >
          Add Habit Quest
        </button>
      </form>
    </motion.div>
  );
}
