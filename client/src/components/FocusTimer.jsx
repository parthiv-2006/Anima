import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { habits as habitsApi } from '../services/api.js';
import confetti from 'canvas-confetti';

const PRESET_TIMES = [
  { label: '5 min', minutes: 5, emoji: '☕' },
  { label: '15 min', minutes: 15, emoji: '📖' },
  { label: '25 min', minutes: 25, emoji: '🔥' },
  { label: '45 min', minutes: 45, emoji: '💪' },
  { label: '60 min', minutes: 60, emoji: '🎯' }
];

const STAT_OPTIONS = [
  { value: 'INT', label: 'Intellect', emoji: '📚', color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
  { value: 'SPI', label: 'Spirit', emoji: '🌿', color: 'text-green-400', gradient: 'from-green-500 to-emerald-500' }
];

const TIMER_STORAGE_KEY = 'focusTimerSession';

export default function FocusTimer({ onTimerStart, onTimerEnd, onTimerStateChange }) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [selectedStat, setSelectedStat] = useState('INT');
  const [showSetup, setShowSetup] = useState(false);
  const [wasResumed, setWasResumed] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Expose timer state to parent component
  useEffect(() => {
    if (onTimerStateChange) {
      onTimerStateChange({
        isActive: isActive && !isPaused,
        timeLeft,
        duration,
        selectedStat
      });
    }
  }, [isActive, isPaused, timeLeft, duration, selectedStat, onTimerStateChange]);

  // Handle timer completion
  const handleTimerComplete = useCallback(async () => {
    setIsActive(false);
    setTimeLeft(0);
    
    // Clear localStorage session
    localStorage.removeItem(TIMER_STORAGE_KEY);
    
    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: selectedStat === 'INT' ? ['#3b82f6', '#06b6d4'] : ['#10b981', '#34d399']
    });

    try {
      // Create a temporary "Focus Session" habit to award XP
      const habitData = {
        name: `Focus Session (${duration} min)`,
        statCategory: selectedStat,
        difficulty: Math.min(3, Math.ceil(duration / 20))
      };
      
      const habit = await habitsApi.create(habitData);
      await habitsApi.complete(habit._id);
      await habitsApi.delete(habit._id);
      
      onTimerEnd?.();
    } catch (err) {
      console.error('Failed to award focus session XP:', err);
      onTimerEnd?.();
    }
    
    // Reset for next session
    setTimeLeft(duration * 60);
  }, [duration, selectedStat, onTimerEnd]);

  // Restore timer from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(TIMER_STORAGE_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const now = Date.now();
        const remaining = Math.floor((session.targetEndTime - now) / 1000);
        
        if (remaining > 0) {
          // Timer is still active - resume it
          setDuration(session.duration);
          setSelectedStat(session.selectedStat);
          setTimeLeft(remaining);
          setIsActive(true);
          setIsPaused(session.isPaused || false);
          setWasResumed(true);
          onTimerStart?.('training');
        } else {
          // Timer has completed while away - handle completion
          setDuration(session.duration);
          setSelectedStat(session.selectedStat);
          handleTimerComplete();
        }
      } catch (err) {
        console.error('Failed to restore timer session:', err);
        localStorage.removeItem(TIMER_STORAGE_KEY);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (isActive && !isPaused) {
      const targetEndTime = Date.now() + (timeLeft * 1000);
      const session = {
        targetEndTime,
        duration,
        selectedStat,
        isPaused: false
      };
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(session));
    } else if (isActive && isPaused) {
      // Save paused state with current timeLeft
      const session = {
        targetEndTime: Date.now() + (timeLeft * 1000),
        duration,
        selectedStat,
        isPaused: true
      };
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(session));
    }
  }, [isActive, isPaused, timeLeft, duration, selectedStat]);

  // Timer countdown effect
  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, timeLeft, handleTimerComplete]);

  const startTimer = () => {
    const targetEndTime = Date.now() + (duration * 60 * 1000);
    const session = {
      targetEndTime,
      duration,
      selectedStat,
      isPaused: false
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(session));
    
    setTimeLeft(duration * 60);
    setIsActive(true);
    setIsPaused(false);
    setShowSetup(false);
    setWasResumed(false);
    onTimerStart?.('training');
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const stopTimer = () => {
    localStorage.removeItem(TIMER_STORAGE_KEY);
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(duration * 60);
    setWasResumed(false);
    onTimerEnd?.();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  };

  const selectPreset = (minutes) => {
    if (!isActive) {
      setDuration(minutes);
      setTimeLeft(minutes * 60);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">⏱️ Focus Timer</h2>
        {!isActive && (
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition"
          >
            {showSetup ? 'Close' : 'Setup'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSetup && !isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="space-y-4 pt-2">
              {/* Preset Times */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duration
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_TIMES.map((preset) => (
                    <button
                      key={preset.minutes}
                      onClick={() => selectPreset(preset.minutes)}
                      className={`p-2 rounded-lg border transition text-center ${
                        duration === preset.minutes
                          ? 'bg-amber-500/20 border-amber-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-lg mb-1">{preset.emoji}</div>
                      <div className="text-xs font-semibold">{preset.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stat Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Focus Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {STAT_OPTIONS.map((stat) => (
                    <button
                      key={stat.value}
                      onClick={() => setSelectedStat(stat.value)}
                      className={`p-3 rounded-lg border transition ${
                        selectedStat === stat.value
                          ? 'bg-white/10 border-white/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{stat.emoji}</span>
                        <span className={`font-semibold ${stat.color}`}>{stat.label}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {stat.value === 'INT' ? 'Deep work, study, coding' : 'Meditation, mindfulness, reflection'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Display */}
      <div className="relative">
        {/* Circular Progress Ring */}
        <div className="relative w-full aspect-square max-w-xs mx-auto mb-6">
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-white/10"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: getProgress() / 100 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                pathLength: getProgress() / 100,
                strokeDasharray: '1 1'
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={selectedStat === 'INT' ? '#3b82f6' : '#10b981'} />
                <stop offset="100%" stopColor={selectedStat === 'INT' ? '#06b6d4' : '#34d399'} />
              </linearGradient>
            </defs>
          </svg>

          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={timeLeft}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold tabular-nums"
            >
              {formatTime(timeLeft)}
            </motion.div>
            <p className="text-sm text-slate-400 mt-2">
              {isActive && !isPaused ? '🎯 Stay focused!' : isActive && isPaused ? 'Paused' : wasResumed ? '⏳ Session resumed!' : 'Ready to focus?'}
            </p>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedStat === 'INT' 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-green-500/20 text-green-300'
                }`}
              >
                {selectedStat === 'INT' ? '📚 Intellect' : '🌿 Spirit'} Training
              </motion.div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!isActive ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startTimer}
              className={`flex-1 max-w-xs py-3 rounded-lg font-semibold bg-gradient-to-r ${
                STAT_OPTIONS.find(s => s.value === selectedStat)?.gradient
              } text-white transition`}
            >
              Start Focus Session
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={pauseTimer}
                className="flex-1 py-3 rounded-lg font-semibold bg-white/10 hover:bg-white/20 border border-white/20 transition"
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopTimer}
                className="flex-1 py-3 rounded-lg font-semibold bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 transition"
              >
                ⏹️ Stop
              </motion.button>
            </>
          )}
        </div>

        {/* XP Preview */}
        {!isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-slate-400"
          >
            Complete this session for <span className="text-amber-400 font-semibold">+{Math.floor(duration * 2)} XP</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
