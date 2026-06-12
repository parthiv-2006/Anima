import { lazy, Suspense, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedPet from './AnimatedPet.jsx';
import PipBar from './PipBar.jsx';
import { getSpeciesTheme } from '../theme/speciesTheme.js';
import { useUiStore, deriveMood } from '../state/uiStore.js';
import { habitatStateFromPet } from '../three/habitatState.js';

const HabitatScene = lazy(() => import('../three/HabitatScene.jsx'));

function WebGLFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
      <p className="text-textMuted text-xs">3D not supported — switch to Classic view</p>
    </div>
  );
}

function SceneLoader() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
        <p className="text-textMuted text-xs tracking-widest uppercase">Loading world…</p>
      </div>
    </div>
  );
}

export default function Habitat3DPanel({
  petType = 'EMBER',
  evolutionStage = 1,
  totalXp = 0,
  petState,
  hp = 100,
  petStats,
  potionCount = 0,
  onQuickHeal,
  onSwitchTo2D,
  habits = [],
  pet = {},
}) {
  const theme = getSpeciesTheme(petType);
  const recentCompletions = useUiStore((s) => s.recentCompletions);
  const mood = deriveMood(hp, recentCompletions);
  const [webglError, setWebglError] = useState(false);

  const habitatState = useMemo(
    () => habitatStateFromPet(pet, habits),
    [pet, habits]
  );

  const nextThreshold = evolutionStage === 1 ? 100 : 500;
  const hpColor = hp > 60 ? '#22c55e' : hp > 30 ? '#eab308' : '#ef4444';

  return (
    <div className="flex flex-col flex-1">
      <div className="relative border border-borderSubtle rounded-[14px] overflow-hidden flex-1 shadow-2xl">

        {/* ── 3D Canvas layer ── */}
        {webglError ? (
          <WebGLFallback />
        ) : (
          <div className="absolute inset-0">
            <Suspense fallback={<SceneLoader />}>
              <HabitatScene
                state={habitatState}
                onError={() => setWebglError(true)}
              />
            </Suspense>
          </div>
        )}

        {/* ── Mood meter overlay ── */}
        <div
          className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border bg-black/50 backdrop-blur-sm"
          style={{ borderColor: theme.border }}
        >
          <motion.span
            key={mood.emoji}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="text-lg leading-none"
          >
            {mood.emoji}
          </motion.span>
          <div className="flex flex-col">
            <span className="text-[8px] text-textMuted font-bold tracking-[1.5px] uppercase">Mood</span>
            <span className="text-[10px] font-bold" style={{ color: theme.accent }}>{mood.label}</span>
          </div>
        </div>

        {/* ── 3D badge + switch to 2D ── */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <div
            className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-lg border bg-black/50 backdrop-blur-sm"
            style={{ color: theme.accent, borderColor: theme.border }}
          >
            ✦ 3D Live
          </div>
          <button
            onClick={onSwitchTo2D}
            className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-lg border bg-black/50 backdrop-blur-sm text-textMuted hover:text-textPrimary transition border-white/10 hover:border-white/20"
            title="Switch to classic view"
          >
            2D
          </button>
        </div>

        {/* ── Pet sprite overlay (Paper Mario style — 2D sprite in 3D world) ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: '88px', paddingTop: '80px' }}>
          <AnimatedPet
            species={petType}
            totalXp={totalXp}
            stage={evolutionStage}
            hp={hp}
            forcedState={petState}
            large
          />
        </div>

        {/* ── Quick-heal button ── */}
        {hp < 100 && potionCount > 0 && onQuickHeal && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onQuickHeal}
            title="Use a health potion"
            className="absolute bottom-[120px] right-5 z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-success/40 bg-black/50 backdrop-blur-sm text-success text-xs font-bold shadow-[0_0_12px_rgba(34,197,94,0.25)]"
          >
            <motion.span
              animate={{ rotate: [0, -12, 12, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2 }}
              className="text-base leading-none"
            >
              🧪
            </motion.span>
            Heal ×{potionCount}
          </motion.button>
        )}

        {/* ── Status bars ── */}
        <div className="absolute bottom-5 left-6 right-6 z-10 space-y-3.5">
          <PipBar
            label="Health"
            value={hp}
            max={100}
            color={hpColor}
            dimColor={`${hpColor}88`}
            rightText={`${hp}/100`}
          />
          <PipBar
            label="Experience"
            value={Math.min(totalXp, nextThreshold)}
            max={nextThreshold}
            color={theme.accent}
            dimColor={theme.glow}
            rightText={`${totalXp}/${nextThreshold} XP`}
          />
        </div>
      </div>
    </div>
  );
}
