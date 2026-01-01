import { create } from 'zustand';

const basePet = {
  nickname: 'Nova',
  species: 'EMBER',
  stage: 1,
  stats: {
    str: 30,
    int: 25,
    spi: 20
  },
  totalXp: 90,
  evolutionPath: 'EMBER_BASE'
};

export const usePetStore = create((set) => ({
  pet: basePet,
  updatePet: (data) =>
    set((state) => ({
      pet: {
        ...state.pet,
        ...data,
        stats: {
          ...state.pet.stats,
          ...(data.stats || {})
        }
      }
    }))
}));
