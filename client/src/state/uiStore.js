import { create } from 'zustand';

// Combo window: completions within this many ms of each other chain together.
const COMBO_WINDOW_MS = 30_000;

const MULTIPLIERS = { 1: 1, 2: 1.5 }; // 3+ → 2x

let toastSeq = 0;

export const useUiStore = create((set, get) => ({
  // ---------- Toasts ----------
  toasts: [],
  pushToast: ({ type = 'success', title, message, duration }) => {
    const id = ++toastSeq;
    const ttl = duration ?? (type === 'achievement' ? 5000 : 3000);
    set((s) => ({ toasts: [...s.toasts, { id, type, title, message }] }));
    setTimeout(() => get().removeToast(id), ttl);
    return id;
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // ---------- Pet celebration (habit completed → pet performs) ----------
  celebrateKey: 0,
  triggerCelebrate: () => set((s) => ({ celebrateKey: s.celebrateKey + 1 })),

  // ---------- Combo chain ----------
  combo: { count: 0, multiplier: 1, lastAt: 0 },
  comboBannerKey: 0,
  shakeKey: 0,
  registerCompletion: () => {
    const now = Date.now();
    const prev = get().combo;
    const chained = now - prev.lastAt <= COMBO_WINDOW_MS;
    const count = chained ? prev.count + 1 : 1;
    const multiplier = MULTIPLIERS[count] ?? 2;
    const combo = { count, multiplier, lastAt: now };
    set((s) => ({
      combo,
      comboBannerKey: count > 1 ? s.comboBannerKey + 1 : s.comboBannerKey,
      shakeKey: count > 1 ? s.shakeKey + 1 : s.shakeKey
    }));
    return combo;
  },

  // ---------- Streak milestone cinematic ----------
  milestone: null, // { days, habitName } | null
  setMilestone: (milestone) => set({ milestone }),

  // ---------- Recent completions (feeds pet mood meter) ----------
  recentCompletions: [],
  noteCompletion: () =>
    set((s) => ({
      recentCompletions: [...s.recentCompletions, Date.now()].slice(-10)
    }))
}));

// Mood derived from HP plus a small boost from completions in the last 10 min.
export function deriveMood(hp, recentCompletions = []) {
  const tenMinAgo = Date.now() - 10 * 60 * 1000;
  const recent = recentCompletions.filter((t) => t > tenMinAgo).length;
  const score = Math.min(100, (hp ?? 100) + recent * 5);
  if (score >= 80) return { emoji: '😄', label: 'Radiant', level: 5 };
  if (score >= 60) return { emoji: '🙂', label: 'Content', level: 4 };
  if (score >= 40) return { emoji: '😐', label: 'Meh', level: 3 };
  if (score >= 20) return { emoji: '😟', label: 'Weary', level: 2 };
  return { emoji: '😢', label: 'Fading', level: 1 };
}
