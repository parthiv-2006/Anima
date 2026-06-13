import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain, Heart, Lightbulb } from 'lucide-react';
import { habits as habitsApi } from '../services/api.js';

const statIcons = {
  STR: <Zap className="w-5 h-5" />,
  INT: <Brain className="w-5 h-5" />,
  SPI: <Heart className="w-5 h-5" />
};

const statLabels = {
  STR: 'Strength',
  INT: 'Intellect',
  SPI: 'Spirit'
};

const statColors = {
  STR: 'from-statSTR/80 to-statSTR',
  INT: 'from-statINT/80 to-statINT',
  SPI: 'from-statSPI/80 to-statSPI'
};

export default function HabitRecommendations({ onAddHabit, onAddHabitCallback, refreshKey = 0 }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await habitsApi.getRecommendations();
      setRecommendations(data.recommendations || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [refreshKey]);

  const handleAddRecommendation = async (rec) => {
    const habitData = {
      name: rec.name,
      statCategory: rec.statCategory,
      difficulty: rec.difficulty
    };
    
    // Show success toast
    setSuccessToast({ name: rec.name, statCategory: rec.statCategory });
    setTimeout(() => setSuccessToast(null), 2500);
    
    // Call parent handler and refresh recommendations
    onAddHabit(habitData);
    
    // Refresh recommendations after a brief delay to show the toast
    setTimeout(() => {
      loadRecommendations();
    }, 300);
  };

  if (loading) {
    return (
      <div className="bg-surface border border-borderSubtle rounded-2xl p-4 backdrop-blur shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-accentAmber drop-shadow-[0_0_8px_rgba(232,160,32,0.4)]" />
          <h2 className="text-base font-bold text-textPrimary font-cinzel tracking-wide">AI Recommendations</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-surfaceElevated rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-borderSubtle rounded-2xl p-4 backdrop-blur shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-accentAmber drop-shadow-[0_0_8px_rgba(232,160,32,0.4)]" />
          <h2 className="text-base font-bold text-textPrimary font-cinzel tracking-wide">AI Recommendations</h2>
        </div>
        <p className="text-accentRust text-xs font-bold">
          {error}
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-surfaceElevated border border-borderSubtle rounded-[12px] p-3.5 mb-2.5">
        <div className="flex items-center gap-[7px] mb-3">
          <span className="text-[13px] opacity-80">💡</span>
          <h2 className="text-[11px] font-bold text-textPrimary tracking-[1px] uppercase font-cinzel">AI Recommendations</h2>
        </div>
        <p className="text-textMuted text-xs font-bold uppercase tracking-wider">
          Loading recommendations...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surfaceElevated border border-borderSubtle rounded-[12px] p-3.5 mb-2.5 space-y-3 relative">
      <div className="flex items-center gap-[7px]">
        <span className="text-[13px] opacity-80">💡</span>
        <h2 className="text-[11px] font-bold text-textPrimary tracking-[1px] uppercase font-cinzel">AI Recommendations</h2>
      </div>

      {/* Success Toast */}
      {successToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-success text-background px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center gap-2 whitespace-nowrap">
            <span>✓</span>
            <span>{successToast.name} added!</span>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative"
          >
            {/* div, not button: the Add control nested inside must stay a real <button> */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setExpandedIndex(expandedIndex === idx ? null : idx);
                }
              }}
              className={`w-full p-3 rounded-lg border transition-all text-left cursor-pointer ${
                rec.priority === 'high'
                  ? 'bg-accentRust/10 border-accentRust/30 hover:border-accentRust/50'
                  : 'bg-surfaceElevated border-borderSubtle hover:border-accentAmber/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${statColors[rec.statCategory]} text-background flex-shrink-0 shadow-md`}>
                    {statIcons[rec.statCategory]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-textPrimary text-sm">{rec.name}</h3>
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                        rec.difficulty === 1 ? 'bg-success/20 text-success' :
                        rec.difficulty === 2 ? 'bg-accentAmber/20 text-accentAmber' :
                        'bg-accentRust/20 text-accentRust'
                      }`}>
                        {rec.difficulty === 1 ? 'Easy' : rec.difficulty === 2 ? 'Med' : 'Hard'}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-textMuted mt-1">{rec.message}</p>
                  </div>
                </div>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddRecommendation(rec);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 bg-accentAmber text-background rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-opacity-90 transition whitespace-nowrap flex-shrink-0 shadow-[0_0_8px_rgba(232,160,32,0.3)]"
                >
                  Add
                </motion.button>
              </div>

              {/* Expanded details */}
              {expandedIndex === idx && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 pt-2 border-t border-borderSubtle"
                >
                  <p className="text-xs text-textPrimary">
                    <strong className="text-accentAmber">Why:</strong> {rec.reason}
                  </p>
                  <p className="text-[10px] text-textMuted uppercase font-bold tracking-widest mt-1.5">
                    Boosts {statLabels[rec.statCategory]}.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest text-textMuted text-center pt-1 drop-shadow-sm">
        💡 Tailored to your weakest stats
      </p>
    </div>
  );
}
