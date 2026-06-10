import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '../state/uiStore.js';

// Big "COMBO x2!" punch-in banner shown when habits are chained back-to-back.
export default function ComboBanner() {
  const comboBannerKey = useUiStore((s) => s.comboBannerKey);
  const combo = useUiStore((s) => s.combo);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!comboBannerKey) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(t);
  }, [comboBannerKey]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={comboBannerKey}
          initial={{ opacity: 0, scale: 2.4, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          exit={{ opacity: 0, scale: 0.8, y: -30 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className="fixed top-[18%] left-1/2 -translate-x-1/2 z-[250] pointer-events-none"
        >
          <div className="relative px-8 py-3">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent blur-xl" />
            <p
              className="relative font-cinzel font-black text-5xl tracking-wider text-yellow-300"
              style={{ textShadow: '0 0 24px rgba(250,204,21,0.8), 3px 3px 0 rgba(180,83,9,0.9)' }}
            >
              COMBO x{combo.multiplier}!
            </p>
            <p className="relative text-center text-[11px] font-bold tracking-[3px] uppercase text-yellow-100/80 mt-1">
              {combo.count} quests chained
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
