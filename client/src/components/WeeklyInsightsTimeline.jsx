import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { habits as habitsApi } from '../services/api.js';
import { CalendarRange, Flame, Activity, TrendingUp, Clock, Award, BarChart3 } from 'lucide-react';

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateRange(start, end) {
  const fmt = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} - ${fmt(end)}`;
}

function formatWeekLabel(start) {
  return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function startOfWeek(date) {
  const day = date.getDay();
  const diff = (day + 6) % 7; // Monday as start
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fraction(value, total) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

export default function WeeklyInsightsTimeline({ refreshKey = 0, userCreatedAt }) {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const createdAtDate = useMemo(() => {
    if (!userCreatedAt) return null;
    const d = new Date(userCreatedAt);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }, [userCreatedAt]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        // Pull a full year so the current week is always included
        const data = await habitsApi.getHistory(365);
        setHistoryData(data || []);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [refreshKey]);

  const { weeklyData, summary } = useMemo(() => {
    const weeks = new Map();
    const totals = { xp: 0, habits: 0, str: 0, int: 0, spi: 0, activeDays7: 0 };

    historyData.forEach((day, index) => {
      const date = parseLocalDate(day.date);
      if (createdAtDate && date < createdAtDate) return;
      const weekStart = startOfWeek(date);
      const weekKey = localDateKey(weekStart);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, {
          weekKey,
          weekStart,
          weekEnd,
          totalXp: 0,
          habitsCompleted: 0,
          strXp: 0,
          intXp: 0,
          spiXp: 0,
          activeDays: 0,
          bestDay: null
        });
      }

      const bucket = weeks.get(weekKey);
      bucket.totalXp += day.totalXp || 0;
      bucket.habitsCompleted += day.habitsCompleted || 0;
      bucket.strXp += day.strXp || 0;
      bucket.intXp += day.intXp || 0;
      bucket.spiXp += day.spiXp || 0;
      if ((day.habitsCompleted || 0) > 0) bucket.activeDays += 1;
      if (!bucket.bestDay || (day.totalXp || 0) > (bucket.bestDay.totalXp || 0)) {
        bucket.bestDay = { date: day.date, totalXp: day.totalXp || 0, habits: day.habitsCompleted || 0 };
      }

      totals.xp += day.totalXp || 0;
      totals.habits += day.habitsCompleted || 0;
      totals.str += day.strXp || 0;
      totals.int += day.intXp || 0;
      totals.spi += day.spiXp || 0;

      // Track last 7 days activity (history is sorted ascending from API)
      if (historyData.length - index <= 7 && (day.habitsCompleted || 0) > 0) {
        totals.activeDays7 += 1;
      }
    });

    // Ensure current week bucket exists even if no completions yet
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentWeekStart = startOfWeek(today);
    const currentWeekKey = localDateKey(currentWeekStart);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    const passesCreation = !createdAtDate || currentWeekStart >= startOfWeek(createdAtDate);
    if (passesCreation && !weeks.has(currentWeekKey)) {
      weeks.set(currentWeekKey, {
        weekKey: currentWeekKey,
        weekStart: currentWeekStart,
        weekEnd: currentWeekEnd,
        totalXp: 0,
        habitsCompleted: 0,
        strXp: 0,
        intXp: 0,
        spiXp: 0,
        activeDays: 0,
        bestDay: null
      });
    }

    // Filter out weeks before account creation (week start) if provided
    const creationWeekStart = createdAtDate ? startOfWeek(createdAtDate) : null;
    const weeklyDataArr = Array.from(weeks.values())
      .filter((wk) => !creationWeekStart || wk.weekStart >= creationWeekStart)
      .sort((a, b) => b.weekStart - a.weekStart);
    const bestWeek = weeklyDataArr.reduce((best, curr) => (curr.totalXp > (best?.totalXp || 0) ? curr : best), null);

    return {
      weeklyData: weeklyDataArr,
      summary: {
        totals,
        currentWeek: weeklyDataArr[0] || null,
        bestWeek,
        dominantStat: (() => {
          const entries = [
            ['Strength', totals.str],
            ['Intellect', totals.int],
            ['Spirit', totals.spi]
          ].sort((a, b) => b[1] - a[1]);
          return entries[0][0];
        })()
      }
    };
  }, [historyData, createdAtDate]);

  const maxWeeklyXp = weeklyData.reduce((max, wk) => Math.max(max, wk.totalXp), 0) || 1;

  const renderSummaryCard = (title, value, icon, accent) => (
    <div className="flex-1 min-w-[180px] bg-surfaceElevated border border-borderSubtle rounded-[14px] p-4 backdrop-blur relative overflow-hidden shadow-lg">
      <div className={`absolute inset-0 ${accent} opacity-10 blur-2xl`} />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-textMuted">{title}</p>
          <p className="text-2xl font-bold text-textPrimary mt-1 font-cinzel">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-surface text-accentAmber border border-borderSubtle">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
        <div className="h-24 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        <div className="h-60 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-200">
        {error}
      </div>
    );
  }

  if (weeklyData.length === 0) {
    return (
      <div className="bg-surfaceElevated border border-borderSubtle rounded-2xl p-6 text-center text-textMuted shadow-lg">
        <p className="text-lg font-bold text-textPrimary font-cinzel">No data yet</p>
        <p className="text-sm mt-2">Complete quests this week to unlock your insights timeline.</p>
      </div>
    );
  }

  const { currentWeek, bestWeek, totals, dominantStat } = summary;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-borderSubtle bg-surfaceElevated p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(232,160,32,0.05),transparent_35%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.05),transparent_30%)] pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accentAmber">Weekly Insights</p>
            <h2 className="text-2xl font-bold text-textPrimary mt-1 font-cinzel">Your past weeks at a glance</h2>
            <p className="text-sm text-textMuted mt-2 max-w-md">
              Highlights from your quests, XP gains, and stat focus for the last few months.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {renderSummaryCard(
              'This Week XP',
              currentWeek ? `${currentWeek.totalXp} XP` : '0 XP',
              <Flame className="w-5 h-5" />,
              'bg-accentAmber'
            )}
            {renderSummaryCard(
              'Habits Completed',
              currentWeek ? `${currentWeek.habitsCompleted}` : '0',
              <Activity className="w-5 h-5" />,
              'bg-statSPI'
            )}
            {renderSummaryCard(
              'Active Days (7d)',
              `${totals.activeDays7}/7`,
              <Clock className="w-5 h-5" />,
              'bg-statINT'
            )}
            {renderSummaryCard(
              'Dominant Stat',
              dominantStat,
              <Award className="w-5 h-5" />,
              'bg-accentRust'
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {weeklyData.slice(0, 12).map((week, idx) => {
          const xpPercent = fraction(week.totalXp, maxWeeklyXp);
          const totalStatXp = week.strXp + week.intXp + week.spiXp || 1;
          const strPct = fraction(week.strXp, totalStatXp);
          const intPct = fraction(week.intXp, totalStatXp);
          const spiPct = Math.max(0, 100 - strPct - intPct);
          return (
            <motion.div
              key={week.weekKey}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-surfaceElevated border border-borderSubtle rounded-[14px] p-5 backdrop-blur relative overflow-hidden shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-20 pointer-events-none" />
              <div className="relative flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-surface border border-borderSubtle text-accentAmber shadow-[0_0_8px_rgba(232,160,32,0.1)]">
                      <CalendarRange className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-textMuted">Week of {formatWeekLabel(week.weekStart)}</p>
                      <p className="text-sm font-bold text-textPrimary">{formatDateRange(week.weekStart, week.weekEnd)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-textMuted">XP</p>
                    <p className="text-lg font-bold text-accentAmber font-cinzel">{week.totalXp}</p>
                  </div>
                </div>

                {/* XP bar */}
                <div className="bg-surface border border-borderSubtle rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-accentAmber shadow-[0_0_8px_rgba(232,160,32,0.6)]"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>

                {/* Breakdown */}
                <div className="space-y-2 mt-1">
                  <div className="flex items-center justify-between text-xs text-textMuted font-bold">
                    <span className="flex items-center gap-2 uppercase tracking-wider"><BarChart3 className="w-4 h-4 text-textPrimary" /> Stat focus</span>
                    <span>{week.habitsCompleted} habits • {week.activeDays} active days</span>
                  </div>
                  <div className="bg-surface border border-borderSubtle rounded-full h-1.5 overflow-hidden flex">
                    <div className="bg-statSTR shadow-[0_0_4px_rgba(232,160,32,0.5)]" style={{ width: `${strPct}%` }} />
                    <div className="bg-statINT shadow-[0_0_4px_rgba(59,130,246,0.5)]" style={{ width: `${intPct}%` }} />
                    <div className="bg-statSPI shadow-[0_0_4px_rgba(34,197,94,0.5)]" style={{ width: `${spiPct}%` }} />
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-textMuted flex-wrap pt-1">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-statSTR" /> STR <span className="text-textPrimary">{week.strXp}</span></span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-statINT" /> INT <span className="text-textPrimary">{week.intXp}</span></span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-statSPI" /> SPI <span className="text-textPrimary">{week.spiXp}</span></span>
                    {week.bestDay && (
                      <span className="flex items-center gap-1 text-accentAmber ml-auto border border-accentAmber/20 bg-accentAmber/10 px-2 py-0.5 rounded-md">
                        <TrendingUp className="w-3 h-3" /> Best: {week.bestDay.totalXp} XP on {formatWeekLabel(parseLocalDate(week.bestDay.date))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
