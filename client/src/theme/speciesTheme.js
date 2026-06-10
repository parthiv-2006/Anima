// Species color themes that bleed into the UI when that species is active.
// Consumed two ways:
//  1. As CSS custom properties set on the app root (--sp-accent etc.)
//  2. Directly in components for inline styles (glows, particles, pips)
export const SPECIES_THEMES = {
  EMBER: {
    name: 'Ember',
    emoji: '🔥',
    accent: '#fb923c',
    accentDim: '#c2611f',
    soft: 'rgba(251, 146, 60, 0.12)',
    border: 'rgba(251, 146, 60, 0.35)',
    glow: 'rgba(251, 146, 60, 0.45)',
    particle: '#fdba74',
    habitatFrom: 'rgba(120, 53, 15, 0.35)',
    habitatTo: 'rgba(10, 10, 10, 0.9)'
  },
  AQUA: {
    name: 'Aqua',
    emoji: '💧',
    accent: '#22d3ee',
    accentDim: '#1591a8',
    soft: 'rgba(34, 211, 238, 0.12)',
    border: 'rgba(34, 211, 238, 0.35)',
    glow: 'rgba(34, 211, 238, 0.45)',
    particle: '#67e8f9',
    habitatFrom: 'rgba(8, 51, 68, 0.45)',
    habitatTo: 'rgba(5, 10, 20, 0.9)'
  },
  TERRA: {
    name: 'Terra',
    emoji: '🌿',
    accent: '#34d399',
    accentDim: '#1f8a64',
    soft: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.35)',
    glow: 'rgba(52, 211, 153, 0.45)',
    particle: '#6ee7b7',
    habitatFrom: 'rgba(6, 78, 59, 0.4)',
    habitatTo: 'rgba(5, 12, 8, 0.9)'
  }
};

export function getSpeciesTheme(species) {
  return SPECIES_THEMES[species] || SPECIES_THEMES.EMBER;
}

// Returns a style object of CSS variables for the app root so any element
// can reference the active species via var(--sp-accent) etc.
export function speciesCssVars(species) {
  const t = getSpeciesTheme(species);
  return {
    '--sp-accent': t.accent,
    '--sp-accent-dim': t.accentDim,
    '--sp-soft': t.soft,
    '--sp-border': t.border,
    '--sp-glow': t.glow
  };
}
