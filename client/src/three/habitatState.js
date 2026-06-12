/**
 * Pure function — no Three.js imports.
 * Derives a deterministic scene description from pet + habit state.
 * Every scene element (sky, fog, flora, crystals, particles) is a
 * function of game data, making it unit-testable and interview-friendly.
 */
export function habitatStateFromPet(pet = {}, habits = []) {
  const xp = pet.totalXp || 0;
  const hp = pet.hp ?? 100;
  const stats = pet.stats || { str: 0, int: 0, spi: 0 };
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const hpRatio = Math.max(0, Math.min(1, hp / 100));

  const biome =
    pet.species === 'AQUA' ? 'ocean'
    : pet.species === 'TERRA' ? 'forest'
    : 'volcanic';

  return {
    biome,

    // Sky: high HP = golden hour, low HP = dusk/overcast
    sunInclination: 0.06 + hpRatio * 0.40,
    skyTurbidity: 1.5 + (1 - hpRatio) * 9,
    skyRayleigh: 0.4 + hpRatio * 0.4,

    // Fog: thickens as HP drops — the world fades when your pet suffers
    fogNear: 7 + hpRatio * 13,
    fogFar: 16 + hpRatio * 22,

    // Flora: new plants/crystals/coral sprout as XP accumulates
    floraCount: Math.min(Math.floor(xp / 12), 28),

    // Stat crystals orbit the center — their scale mirrors stat ratios
    crystals: {
      str: Math.max(0.15, 0.2 + (stats.str / 140)),
      int: Math.max(0.15, 0.2 + (stats.int / 140)),
      spi: Math.max(0.15, 0.2 + (stats.spi / 140)),
    },

    // Particles: streaks summon more atmospheric magic
    particleCount: 18 + Math.min(maxStreak * 4, 62),
    particleSpeed: 0.25 + Math.min(maxStreak * 0.06, 1.4),
  };
}
