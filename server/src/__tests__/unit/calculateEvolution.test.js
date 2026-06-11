import { calculateEvolution } from '../../controllers/petController.js';

function makePet(overrides = {}) {
  return {
    species: 'EMBER',
    stage: 1,
    totalXp: 0,
    evolutionPath: '',
    stats: { str: 0, int: 0, spi: 0 },
    ...overrides
  };
}

describe('calculateEvolution', () => {
  it('stays stage 1 when XP < 100', () => {
    const pet = makePet({ totalXp: 50 });
    calculateEvolution(pet);
    expect(pet.stage).toBe(1);
  });

  it('becomes stage 2 when XP >= 100', () => {
    const pet = makePet({ totalXp: 100, stats: { str: 10, int: 5, spi: 3 } });
    calculateEvolution(pet);
    expect(pet.stage).toBe(2);
    expect(pet.evolutionPath).toBe('EMBER_STR');
  });

  it('evolutionPath reflects dominant stat at stage 2', () => {
    const pet = makePet({ totalXp: 150, stats: { str: 2, int: 20, spi: 5 } });
    calculateEvolution(pet);
    expect(pet.evolutionPath).toBe('EMBER_INT');
  });

  it('becomes stage 3 when XP >= 500', () => {
    const pet = makePet({ totalXp: 500, stats: { str: 10, int: 10, spi: 10 } });
    calculateEvolution(pet);
    expect(pet.stage).toBe(3);
  });

  it('stage 3 PURE path when dominant stat >= 2× minimum', () => {
    // str=40, int=10, spi=10 → max(40)=40 >= 2×min(10)=20 → PURE
    const pet = makePet({ totalXp: 600, stats: { str: 40, int: 10, spi: 10 } });
    calculateEvolution(pet);
    expect(pet.evolutionPath).toBe('EMBER_STR_PURE');
  });

  it('stage 3 HYBRID path when stats are balanced', () => {
    // str=20, int=15, spi=15 → max(20) < 2×min(15)=30 → HYBRID
    const pet = makePet({ totalXp: 600, stats: { str: 20, int: 15, spi: 15 } });
    calculateEvolution(pet);
    expect(pet.evolutionPath).toBe('EMBER_HYBRID');
  });

  it('AQUA species uses correct prefix', () => {
    const pet = makePet({ species: 'AQUA', totalXp: 600, stats: { str: 5, int: 50, spi: 5 } });
    calculateEvolution(pet);
    expect(pet.evolutionPath).toBe('AQUA_INT_PURE');
  });
});
