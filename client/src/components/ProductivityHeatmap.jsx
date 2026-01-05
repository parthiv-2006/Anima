import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { habits as habitsApi } from '../services/api.js';

// Color intensity levels (0-4 scale)
const COLOR_SCALES = {
  ALL: [
    'bg-slate-800/50', // 0 XP
    'bg-amber-900/30', // 1-29 XP
    'bg-amber-700/50', // 30-59 XP
    'bg-amber-500/70', // 60-99 XP
    'bg-amber-400'     // 100+ XP
  ],
  STR: [
    'bg-slate-800/50',
    'bg-red-900/30',
    'bg-red-700/50',
    'bg-red-500/70',
    'bg-red-400'
  ],
  INT: [
    'bg-slate-800/50',
    'bg-blue-900/30',
    'bg-blue-700/50',
    'bg-blue-500/70',
    'bg-blue-400'
  ],
  SPI: [
    'bg-slate-800/50',
    'bg-green-900/30',
    'bg-green-700/50',
    'bg-green-500/70',
    'bg-green-400'
  ]
};

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Activity', icon: '📊', color: 'text-amber-400' },
  { value: 'STR', label: 'Strength', icon: '💪', color: 'text-red-400' },
  { value: 'INT', label: 'Intellect', icon: '📚', color: 'text-blue-400' },
  { value: 'SPI', label: 'Spirit', icon: '🌿', color: 'text-green-400' }
];

function ProductivityHeatmap() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await habitsApi.getHistory(365);
      setHistoryData(data);
    } catch (err) {
      console.error('Failed to load habit history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate 365 day grid (53 weeks x 7 days)
  const gridData = useMemo(() => {
    const today = new Date();
    const grid = [];
    
    // Create data lookup map
    const dataMap = new Map();
    historyData.forEach(day => {
      dataMap.set(day.date, day);
    });

    // Generate 365 days working backwards from today
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayData = dataMap.get(dateKey) || {
        date: dateKey,
        totalXp: 0,
        strXp: 0,
        intXp: 0,
        spiXp: 0,
        habitsCompleted: 0
      };

      grid.push({
        date: dateKey,
        dateObj: date,
        dayOfWeek: date.getDay(), // 0 = Sunday
        ...dayData
      });
    }

    return grid;
  }, [historyData]);

  const getIntensityLevel = (xp) => {
    if (xp === 0) return 0;
    if (xp < 30) return 1;
    if (xp < 60) return 2;
    if (xp < 100) return 3;
    return 4;
  };

  const getDayColor = (day) => {
    let xp = 0;
    
    switch (filter) {
      case 'STR':
        xp = day.strXp;
        break;
      case 'INT':
        xp = day.intXp;
        break;
      case 'SPI':
        xp = day.spiXp;
        break;
      default:
        xp = day.totalXp;
    }

    const level = getIntensityLevel(xp);
    return COLOR_SCALES[filter][level];
  };

  const getDayValue = (day) => {
    switch (filter) {
      case 'STR': return day.strXp;
      case 'INT': return day.intXp;
      case 'SPI': return day.spiXp;
      default: return day.totalXp;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTrackingSinceDate = () => {
    if (historyData.length === 0) return new Date().toISOString().split('T')[0];
    const firstActivity = historyData.find(d => d.totalXp > 0);
    return firstActivity ? firstActivity.date : new Date().toISOString().split('T')[0];
  };

  // Group days by week
  const weeks = useMemo(() => {
    const weeksArray = [];
    let currentWeek = [];
    
    gridData.forEach((day, index) => {
      if (index === 0) {
        // Pad first week with empty cells if it doesn't start on Sunday
        for (let i = 0; i < day.dayOfWeek; i++) {
          currentWeek.push(null);
        }
      }
      
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Add remaining days
    if (currentWeek.length > 0) {
      // Pad last week with empty cells
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArray.push(currentWeek);
    }
    
    return weeksArray;
  }, [gridData]);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-white/10 rounded w-32 mb-4" />
          <div className="h-24 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          📊 Activity Heatmap
        </h3>
        <div className="text-[10px] text-slate-400">
          Tracking since {formatDate(getTrackingSinceDate())}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 bg-black/20 rounded-lg p-1">
        {FILTER_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`flex-1 px-2 py-1.5 rounded text-[10px] font-medium transition-all ${
              filter === option.value
                ? `bg-white/10 ${option.color}`
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="mr-1">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="relative">
        <div className="flex gap-[2px] overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px]">
              {week.map((day, dayIndex) => (
                <div key={`${weekIndex}-${dayIndex}`} className="relative">
                  {day ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: weekIndex * 0.01 + dayIndex * 0.001 }}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-[7px] h-[7px] rounded-sm ${getDayColor(day)} border border-white/5 cursor-pointer hover:border-white/30 transition-all`}
                      whileHover={{ scale: 1.5 }}
                    />
                  ) : (
                    <div className="w-[7px] h-[7px]" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Hover Tooltip */}
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 mt-2 px-3 py-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl text-xs z-10 whitespace-nowrap"
          >
            <div className="font-semibold text-white mb-1">{formatDate(hoveredDay.date)}</div>
            <div className="text-slate-300">
              {getDayValue(hoveredDay)} XP • {hoveredDay.habitsCompleted} habits
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-[10px] text-slate-400">
        <span>Less</span>
        <div className="flex gap-1">
          {COLOR_SCALES[filter].map((color, index) => (
            <div key={index} className={`w-3 h-3 rounded-sm ${color} border border-white/5`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

export default ProductivityHeatmap;
