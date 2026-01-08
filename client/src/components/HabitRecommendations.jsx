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

export default function HabitRecommendations({ onAddHabit, refreshKey = 0 }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
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
    loadRecommendations();
  }, [refreshKey]);

  const handleAddRecommendation = (rec) => {
    const habitData = {
      name: rec.name,
      statCategory: rec.statCategory,
      difficulty: rec.difficulty
    };
    onAddHabit(habitData);
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">AI Recommendations</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">AI Recommendations</h2>
        </div>
        <p className="text-slate-400 text-sm">
          {error ? `Error: ${error}` : 'Create a balanced habit portfolio to unlock recommendations!'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur space-y-4">
      <div className="flex items-center gap-3">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-bold text-white">AI Recommendations</h2>
      </div>

      <div className="space-y-3">
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
              className={`w-full p-4 rounded-lg border transition-all text-left ${
                rec.priority === 'high'
                  ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${statColors[rec.statCategory]} text-white`}>
                    {statIcons[rec.statCategory]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">{rec.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                        rec.difficulty === 1 ? 'bg-green-500/20 text-green-300' :
                        rec.difficulty === 2 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {rec.difficulty === 1 ? 'Easy' : rec.difficulty === 2 ? 'Medium' : 'Hard'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 truncate">{rec.message}</p>
                  </div>
                </div>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddRecommendation(rec);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-3 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition whitespace-nowrap"
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
                  className="mt-3 pt-3 border-t border-white/10"
                >
                  <p className="text-sm text-slate-300">
                    <strong>Why this habit:</strong> {rec.reason}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Boosting {statLabels[rec.statCategory]} will help balance your pet's overall stats.
                  </p>
                </motion.div>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-slate-500 text-center pt-2">
        💡 Recommendations update based on your stat balance
      </p>
    </div>
  );
}
