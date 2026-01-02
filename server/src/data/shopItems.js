/**
 * Shop item definitions with prices and effects
 */
export const SHOP_ITEMS = {
  // Consumables
  healthPotion: {
    id: 'healthPotion',
    name: 'Health Potion',
    description: 'Restores 25 HP to your pet. Use when decay has weakened your companion.',
    category: 'consumable',
    price: 50,
    emoji: '🧪',
    effect: { type: 'heal', value: 25 }
  },
  superHealthPotion: {
    id: 'superHealthPotion',
    name: 'Super Health Potion',
    description: 'Fully restores your pet\'s HP to 100%. For emergency recovery!',
    category: 'consumable',
    price: 150,
    emoji: '💖',
    effect: { type: 'fullHeal', value: 100 }
  },
  freezeStreak: {
    id: 'freezeStreak',
    name: 'Freeze Streak',
    description: 'Protects your streaks for 24 hours. Use before you know you\'ll miss a day!',
    category: 'consumable',
    price: 100,
    emoji: '❄️',
    effect: { type: 'protection', duration: 24 }
  },
  
  // Backgrounds
  dojo: {
    id: 'dojo',
    name: 'Dojo Arena',
    description: 'A traditional training dojo. Perfect for strength-focused pets.',
    category: 'background',
    price: 200,
    emoji: '🥋',
    preview: '/backgrounds/dojo.png',
    theme: 'STR'
  },
  library: {
    id: 'library',
    name: 'Ancient Library',
    description: 'Towering shelves of knowledge. Ideal for intellect-focused pets.',
    category: 'background',
    price: 200,
    emoji: '📚',
    preview: '/backgrounds/library.png',
    theme: 'INT'
  },
  forest: {
    id: 'forest',
    name: 'Mystic Forest',
    description: 'A serene woodland clearing. Perfect for spirit-focused pets.',
    category: 'background',
    price: 200,
    emoji: '🌲',
    preview: '/backgrounds/forest.png',
    theme: 'SPI'
  },
  volcano: {
    id: 'volcano',
    name: 'Volcanic Lair',
    description: 'A fiery volcanic cave. Ember pets feel right at home here.',
    category: 'background',
    price: 300,
    emoji: '🌋',
    preview: '/backgrounds/volcano.png',
    theme: 'EMBER'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'A beautiful underwater paradise. Aqua pets thrive here.',
    category: 'background',
    price: 300,
    emoji: '🌊',
    preview: '/backgrounds/ocean.png',
    theme: 'AQUA'
  },
  mountain: {
    id: 'mountain',
    name: 'Mountain Peak',
    description: 'A majestic rocky summit. Terra pets love the solid ground.',
    category: 'background',
    price: 300,
    emoji: '🏔️',
    preview: '/backgrounds/mountain.png',
    theme: 'TERRA'
  }
};

export const getShopItemsByCategory = (category) => {
  return Object.values(SHOP_ITEMS).filter(item => item.category === category);
};

export const getShopItem = (itemId) => {
  return SHOP_ITEMS[itemId] || null;
};
