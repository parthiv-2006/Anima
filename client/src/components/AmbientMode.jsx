import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import AnimatedPet from './AnimatedPet.jsx';
import MiniTimer from './MiniTimer.jsx';
import { usePetStore } from '../state/petStore.js';

// Background gradient styles (matching shop system)
const BACKGROUND_STYLES = {
  default: { gradient: 'from-slate-800/50 to-slate-900/50', name: 'Default' },
  dojo: { gradient: 'from-red-900/40 to-orange-900/40', name: 'Dojo Arena' },
  library: { gradient: 'from-blue-900/40 to-indigo-900/40', name: 'Ancient Library' },
  forest: { gradient: 'from-green-900/40 to-emerald-900/40', name: 'Mystic Forest' },
  volcano: { gradient: 'from-orange-900/40 to-red-950/40', name: 'Volcanic Lair' },
  ocean: { gradient: 'from-cyan-900/40 to-blue-950/40', name: 'Ocean Depths' },
  mountain: { gradient: 'from-stone-800/40 to-slate-900/40', name: 'Mountain Peak' }
};

const AmbientMode = ({ onExit, currentBackground = 'default', timerState = null }) => {
  const { pet } = usePetStore();
  const bgStyle = BACKGROUND_STYLES[currentBackground] || BACKGROUND_STYLES.default;

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[60] overflow-hidden"
      >
        {/* Full-screen dynamic background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${bgStyle.gradient}`}>
          {/* Ambient glow layers */}
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent animate-pulse" 
               style={{ animationDuration: '4s' }} />
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent animate-pulse" 
               style={{ animationDuration: '6s', animationDelay: '1s' }} />
          
          {/* Subtle starfield effect */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Centered pet display - scaled up and in sleep state */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="transform scale-[2.5]">
            <AnimatedPet 
              pet={pet} 
              forcedState="sleep"
              ambientMode={true}
            />
          </div>
        </div>

        {/* Exit button - top right corner */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={onExit}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-6 right-6 p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all duration-300 shadow-xl group"
        >
          <X className="w-5 h-5" />
          <span className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-xs text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Exit Ambient Mode (ESC)
          </span>
        </motion.button>

        {/* Background name indicator - fades out after 3 seconds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3, times: [0, 0.1, 0.8, 1] }}
          className="absolute top-6 left-6 px-4 py-2 bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-full"
        >
          <span className="text-sm text-slate-300 font-medium">
            🌙 {bgStyle.name}
          </span>
        </motion.div>

        {/* Mini Timer Widget */}
        <MiniTimer 
          isActive={timerState?.isActive || false}
          timeLeft={timerState?.timeLeft || 0}
          duration={timerState?.duration || 0}
          selectedStat={timerState?.selectedStat || 'INT'}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default AmbientMode;
