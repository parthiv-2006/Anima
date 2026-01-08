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
  STR: 'from-red-500 to-orange-500',
  INT: 'from-blue-500 to-cyan-500',
  SPI: 'from-purple-500 to-pink-500'
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
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">AI Recommendations</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">AI Recommendations</h2>
        </div>
        <p className="text-slate-400 text-xs">
          {error}
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">AI Recommendations</h2>
        </div>
        <p className="text-slate-400 text-xs">
          Loading recommendations...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur space-y-3 relative">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <h2 className="text-base font-bold text-white">AI Recommendations</h2>
      </div>

      {/* Success Toast */}
      {successToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-green-500/30 flex items-center gap-2 whitespace-nowrap">
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
            <button
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              className={`w-full p-3 rounded-lg border transition-all text-left ${
                rec.priority === 'high'
                  ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${statColors[rec.statCategory]} text-white flex-shrink-0`}>
                    {statIcons[rec.statCategory]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white text-sm">{rec.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                        rec.difficulty === 1 ? 'bg-green-500/20 text-green-300' :
                        rec.difficulty === 2 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {rec.difficulty === 1 ? 'Easy' : rec.difficulty === 2 ? 'Med' : 'Hard'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{rec.message}</p>
                  </div>
                </div>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddRecommendation(rec);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition whitespace-nowrap flex-shrink-0"
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
                  className="mt-2 pt-2 border-t border-white/10"
                >
                  <p className="text-xs text-slate-300">
                    <strong>Why:</strong> {rec.reason}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Boosts {statLabels[rec.statCategory]}.
                  </p>
                </motion.div>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-slate-500 text-center pt-1">
        💡 Tailored to your weakest stats
      </p>
    </div>
  );
}
