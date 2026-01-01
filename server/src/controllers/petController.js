import { User } from '../models/User.js';

function calculateEvolution(pet) {
  if (pet.totalXp > 500) {
    const values = [pet.stats.str, pet.stats.int, pet.stats.spi];
    const max = Math.max(...values);
    const min = Math.min(...values);
    const dominant = Object.entries(pet.stats).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    const isPure = max >= 2 * min;
    pet.stage = 3;
    pet.evolutionPath = isPure ? `${pet.species}_${dominant.toUpperCase()}_PURE` : `${pet.species}_HYBRID`;
  } else if (pet.totalXp > 100) {
    const dominant = Object.entries(pet.stats).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    pet.stage = 2;
    pet.evolutionPath = `${pet.species}_${dominant.toUpperCase()}`;
  }
}

export async function getPet(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(user.pet);
}

export async function updatePet(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { stats = {}, totalXp } = req.body;
    user.pet.stats = { ...user.pet.stats, ...stats };
    if (typeof totalXp === 'number') user.pet.totalXp = totalXp;

    calculateEvolution(user.pet);
    await user.save();
    return res.json(user.pet);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not update pet' });
  }
}

export async function applyDecay(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const last = user.lastLogin || new Date();
  const hours = (Date.now() - last.getTime()) / (1000 * 60 * 60);
  if (hours > 24) {
    user.pet.hp = Math.max(0, Math.round((user.pet.hp || 100) * 0.9));
    user.habits = user.habits.map((h) => ({ ...h.toObject(), isCompletedToday: false }));
  }
  user.lastLogin = new Date();
  await user.save();
  return res.json({ pet: user.pet, habits: user.habits });
}
