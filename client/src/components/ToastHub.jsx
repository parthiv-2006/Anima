import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '../state/uiStore.js';

const TYPE_STYLES = {
  success: {
    border: 'border-success/40',
    bg: 'bg-[#0f1a14]',
    icon: '✓',
    iconBox: 'bg-success/15 text-success border-success/30',
    glow: '0 0 16px rgba(34,197,94,0.25)'
  },
  warning: {
    border: 'border-accentAmber/40',
    bg: 'bg-[#1a160d]',
    icon: '⚠',
    iconBox: 'bg-accentAmber/15 text-accentAmber border-accentAmber/30',
    glow: '0 0 16px rgba(232,160,32,0.25)'
  },
  error: {
    border: 'border-accentRust/50',
    bg: 'bg-[#1a0f0d]',
    icon: '✕',
    iconBox: 'bg-accentRust/15 text-accentRust border-accentRust/30',
    glow: '0 0 16px rgba(196,79,42,0.3)'
  },
  achievement: {
    border: 'border-yellow-400/60',
    bg: 'bg-gradient-to-br from-[#1a160d] to-[#241a08]',
    icon: '🏆',
    iconBox: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/40',
    glow: '0 0 24px rgba(250,204,21,0.35)'
  }
};

function Sparkles() {
  // Tiny ✦ particles that pop around achievement toasts
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-yellow-300 text-[10px]"
          style={{ left: `${10 + i * 16}%`, top: i % 2 ? '-6px' : 'calc(100% - 4px)' }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.4, 0], y: i % 2 ? -10 : 10 }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
}

export default function ToastHub() {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-5 right-5 z-[300] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = TYPE_STYLES[toast.type] || TYPE_STYLES.success;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={() => removeToast(toast.id)}
              className={`relative pointer-events-auto cursor-pointer max-w-[320px] ${style.bg} border ${style.border} rounded-[10px] px-3.5 py-2.5 flex items-start gap-2.5`}
              style={{ boxShadow: style.glow }}
            >
              {toast.type === 'achievement' && <Sparkles />}
              <div className={`w-7 h-7 rounded-md border flex items-center justify-center text-sm shrink-0 ${style.iconBox}`}>
                {style.icon}
              </div>
              <div className="min-w-0">
                {toast.title && (
                  <p className={`text-[11px] font-bold tracking-[1px] uppercase ${toast.type === 'achievement' ? 'text-yellow-300' : 'text-textPrimary'}`}>
                    {toast.title}
                  </p>
                )}
                {toast.message && (
                  <p className="text-xs text-textPrimary/80 leading-snug">{toast.message}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
