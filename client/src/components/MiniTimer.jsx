import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';

const STAT_COLORS = {
  STR: { 
    gradient: 'from-red-500 to-orange-500', 
    text: 'text-red-400',
    startColor: '#ef4444',
    endColor: '#f97316'
  },
  INT: { 
    gradient: 'from-blue-500 to-cyan-500', 
    text: 'text-blue-400',
    startColor: '#3b82f6',
    endColor: '#06b6d4'
  },
  SPI: { 
    gradient: 'from-green-500 to-emerald-500', 
    text: 'text-green-400',
    startColor: '#22c55e',
    endColor: '#10b981'
  }
};

const MiniTimer = ({ isActive, timeLeft, duration, selectedStat = 'INT' }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!duration || !timeLeft) return 0;
    return ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  };

  const statColor = STAT_COLORS[selectedStat] || STAT_COLORS.INT;
  const circumference = 2 * Math.PI * 48; // radius = 48
  const progressOffset = circumference - (getProgress() / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="relative">
        {/* Glass container */}
        <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          {isActive ? (
            <>
              {/* Circular Progress Ring */}
              <div className="relative w-[120px] h-[120px]">
                <svg className="w-full h-full -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/10"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="url(#miniTimerGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    className="transition-all duration-1000 ease-linear"
                    style={{
                      filter: 'drop-shadow(0 0 8px currentColor)'
                    }}
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="miniTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={statColor.startColor} />
                      <stop offset="100%" stopColor={statColor.endColor} />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Time display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-white tracking-tight">
                    {formatTime(timeLeft)}
                  </div>
                  <div className={`text-xs font-medium mt-1 ${statColor.text}`}>
                    {selectedStat}
                  </div>
                </div>
              </div>

              {/* Pulsing glow effect */}
              <div 
                className={`absolute inset-0 rounded-2xl opacity-20 blur-xl bg-gradient-to-br ${statColor.gradient} animate-pulse`}
                style={{ animationDuration: '3s' }}
              />
            </>
          ) : (
            // Inactive state
            <div className="w-[120px] h-[120px] flex flex-col items-center justify-center">
              <Timer className="w-8 h-8 text-slate-400 mb-2" />
              <div className="text-xs text-slate-400 text-center">
                No active<br />session
              </div>
            </div>
          )}
        </div>

        {/* Subtle border glow when active */}
        {isActive && (
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className={`absolute -inset-1 rounded-2xl bg-gradient-to-br ${statColor.gradient} blur-md -z-10`}
          />
        )}
      </div>
    </motion.div>
  );
};

export default MiniTimer;
