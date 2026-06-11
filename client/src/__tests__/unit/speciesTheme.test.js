import { describe, it, expect } from 'vitest';
import { SPECIES_THEMES, getSpeciesTheme, speciesCssVars } from '../../theme/speciesTheme.js';

describe('getSpeciesTheme', () => {
  it('returns EMBER theme with correct accent color', () => {
    const t = getSpeciesTheme('EMBER');
    expect(t.accent).toBe('#fb923c');
    expect(t.name).toBe('Ember');
    expect(t.emoji).toBe('🔥');
  });

  it('returns AQUA theme with correct accent color', () => {
    const t = getSpeciesTheme('AQUA');
    expect(t.accent).toBe('#22d3ee');
    expect(t.name).toBe('Aqua');
  });

  it('returns TERRA theme with correct accent color', () => {
    const t = getSpeciesTheme('TERRA');
    expect(t.accent).toBe('#34d399');
    expect(t.name).toBe('Terra');
  });

  it('falls back to EMBER for unknown species', () => {
    const t = getSpeciesTheme('UNKNOWN');
    expect(t).toEqual(SPECIES_THEMES.EMBER);
  });

  it('falls back to EMBER when species is undefined', () => {
    const t = getSpeciesTheme(undefined);
    expect(t).toEqual(SPECIES_THEMES.EMBER);
  });
});

describe('speciesCssVars', () => {
  it('returns all 5 CSS custom property keys', () => {
    const vars = speciesCssVars('EMBER');
    expect(Object.keys(vars)).toEqual([
      '--sp-accent',
      '--sp-accent-dim',
      '--sp-soft',
      '--sp-border',
      '--sp-glow'
    ]);
  });

  it('EMBER values match theme accent', () => {
    const vars = speciesCssVars('EMBER');
    expect(vars['--sp-accent']).toBe('#fb923c');
  });

  it('AQUA values match theme accent', () => {
    const vars = speciesCssVars('AQUA');
    expect(vars['--sp-accent']).toBe('#22d3ee');
  });

  it('TERRA values match theme accent', () => {
    const vars = speciesCssVars('TERRA');
    expect(vars['--sp-accent']).toBe('#34d399');
  });
});
