import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { habits as habitsApi } from '../services/api.js';

// Color intensity levels (0-4 scale)
const COLOR_SCALES = {
  ALL: [
    'bg-surface', 
    'bg-accentAmber/30', 
    'bg-accentAmber/60', 
    'bg-accentAmber/80', 
    'bg-accentAmber'
  ],
  STR: [
    'bg-surface',
    'bg-accentRust/30',
    'bg-accentRust/60',
    'bg-accentRust/80',
    'bg-accentRust'
  ],
  INT: [
    'bg-surface',
    'bg-statINT/30',
    'bg-statINT/60',
    'bg-statINT/80',
    'bg-statINT'
  ],
  SPI: [
    'bg-surface',
    'bg-statSPI/30',
    'bg-statSPI/60',
    'bg-statSPI/80',
    'bg-statSPI'
  ]
};

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'All', color: 'text-accentAmber' },
  { value: 'STR', label: 'STR', color: 'text-statSTR' },
  { value: 'INT', label: 'INT', color: 'text-statINT' },
  { value: 'SPI', label: 'SPI', color: 'text-statSPI' }
];

function ProductivityHeatmap({ refreshKey = 0 }) {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [refreshKey]);

  const loadHistory = async () => {
    try {
      // Fetch 10 weeks (70 days)
      const data = await habitsApi.getHistory(70);
      setHistoryData(data);
    } catch (err) {
      console.error('Failed to load habit history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate grid for last 70 days
  const gridData = useMemo(() => {
    const grid = [];
    const getLocalDateKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Create data lookup map
    const dataMap = new Map();
    historyData.forEach(day => {
      dataMap.set(day.date, day);
    });

    // Generate last 70 days
    const today = new Date();
    for (let i = 69; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = getLocalDateKey(date);
      
      const dayData = dataMap.get(dateKey) || {
        date: dateKey,
        totalXp: 0,
        strXp: 0,
        intXp: 0,
        spiXp: 0,
        habitsCompleted: 0,
        strCount: 0,
        intCount: 0,
        spiCount: 0
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
      case 'STR': xp = day.strXp; break;
      case 'INT': xp = day.intXp; break;
      case 'SPI': xp = day.spiXp; break;
      default: xp = day.totalXp;
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

  const getDayHabitsCount = (day) => {
    switch (filter) {
      case 'STR': return day.strCount || 0;
      case 'INT': return day.intCount || 0;
      case 'SPI': return day.spiCount || 0;
      default: return day.habitsCompleted || 0;
    }
  };

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Group days by week (10 columns, 7 rows)
  const weeks = useMemo(() => {
    const weeksArray = [];
    let currentWeek = [];
    
    gridData.forEach((day, index) => {
      if (index === 0) {
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
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArray.push(currentWeek);
    }
    
    // Ensure we only show exactly 10 weeks if possible, or up to 11 if offset requires it
    // Actually we will just render what we generated
    return weeksArray.slice(-10);
  }, [gridData]);

  if (loading) {
    return (
      <div className="bg-surfaceElevated border border-borderSubtle rounded-[12px] p-3.5 mb-2.5">
        <div className="animate-pulse">
          <div className="h-4 bg-borderSubtle rounded w-32 mb-4" />
          <div className="h-24 bg-borderSubtle rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surfaceElevated border border-borderSubtle rounded-[12px] p-3.5 mb-2.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-[7px]">
          <span className="text-[13px] opacity-80">📊</span>
          <h3 className="text-[11px] font-bold text-textPrimary tracking-[1px] uppercase font-cinzel">
            Activity Heatmap
          </h3>
        </div>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="p-1 text-textMuted hover:text-textPrimary transition disabled:opacity-50"
          title="Refresh heatmap"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 bg-surface rounded-lg p-1">
        {FILTER_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider ${
              filter === option.value
                ? `bg-surfaceElevated ${option.color} border border-borderSubtle`
                : 'text-textMuted hover:text-textPrimary border border-transparent'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="relative flex justify-center">
        <div className="flex gap-[3px] overflow-hidden">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) => (
                <div key={`${weekIndex}-${dayIndex}`} className="relative">
                  {day ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: weekIndex * 0.02 + dayIndex * 0.01 }}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-[14px] h-[14px] rounded-[3px] ${getDayColor(day)} transition-colors cursor-pointer`}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                    />
                  ) : (
                    <div className="w-[14px] h-[14px]" />
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
            className="absolute top-full mt-2 px-3 py-2 bg-surface backdrop-blur-xl border border-borderSubtle rounded-lg shadow-2xl text-xs z-20 whitespace-nowrap"
          >
            <div className="font-bold text-textPrimary mb-1 font-cinzel">{formatDate(hoveredDay.date)}</div>
            <div className="text-textMuted">
              <span className="text-accentAmber font-bold">{getDayValue(hoveredDay)} XP</span> • {getDayHabitsCount(hoveredDay)} habits
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-[10px] text-textMuted uppercase font-bold tracking-wider">
        <span>Less</span>
        <div className="flex gap-[3px]">
          {COLOR_SCALES[filter].map((color, index) => (
            <div key={index} className={`w-[14px] h-[14px] rounded-[3px] ${color}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

export default ProductivityHeatmap;
