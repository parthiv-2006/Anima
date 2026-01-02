import { User } from '../models/User.js';
import { SHOP_ITEMS, getShopItem, getShopItemsByCategory } from '../data/shopItems.js';

/**
 * Get all shop items
 */
export async function getShopItems(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Add ownership status to items
    const itemsWithOwnership = Object.values(SHOP_ITEMS).map(item => ({
      ...item,
      owned: item.category === 'background' 
        ? user.inventory.backgrounds.includes(item.id)
        : false
    }));

    return res.json({
      items: itemsWithOwnership,
      coins: user.coins,
      inventory: user.inventory
    });
  } catch (err) {
    console.error('Get shop items error:', err);
    return res.status(500).json({ message: 'Failed to get shop items' });
  }
}

/**
 * Purchase an item from the shop
 */
export async function purchaseItem(req, res) {
  try {
    const { itemId, quantity = 1 } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const item = getShopItem(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const totalCost = item.price * quantity;
    
    // Check if user has enough coins
    if (user.coins < totalCost) {
      return res.status(400).json({ 
        message: 'Not enough coins', 
        required: totalCost, 
        current: user.coins 
      });
    }

    // Handle purchase based on category
    if (item.category === 'background') {
      // Check if already owned
      if (user.inventory.backgrounds.includes(itemId)) {
        return res.status(400).json({ message: 'Background already owned' });
      }
      user.inventory.backgrounds.push(itemId);
    } else if (item.category === 'consumable') {
      // Add consumable to inventory
      if (itemId === 'healthPotion' || itemId === 'superHealthPotion') {
        user.inventory.healthPotions += quantity;
      } else if (itemId === 'freezeStreak') {
        user.inventory.freezeStreaks += quantity;
      }
    }

    // Deduct coins
    user.coins -= totalCost;
    await user.save();

    return res.json({
      message: `Purchased ${item.name}!`,
      coins: user.coins,
      inventory: user.inventory
    });
  } catch (err) {
    console.error('Purchase error:', err);
    return res.status(500).json({ message: 'Failed to purchase item' });
  }
}

/**
 * Use a consumable item
 */
export async function useItem(req, res) {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const item = getShopItem(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.category !== 'consumable') {
      return res.status(400).json({ message: 'This item cannot be used' });
    }

    // Check if user has the item
    if (itemId === 'healthPotion' || itemId === 'superHealthPotion') {
      if (user.inventory.healthPotions <= 0) {
        return res.status(400).json({ message: 'No health potions in inventory' });
      }

      // Apply healing effect
      const currentHp = user.pet.hp || 100;
      if (item.effect.type === 'heal') {
        user.pet.hp = Math.min(100, currentHp + item.effect.value);
      } else if (item.effect.type === 'fullHeal') {
        user.pet.hp = 100;
      }
      user.inventory.healthPotions -= 1;
      
    } else if (itemId === 'freezeStreak') {
      if (user.inventory.freezeStreaks <= 0) {
        return res.status(400).json({ message: 'No freeze streaks in inventory' });
      }

      // Set freeze protection (24 hours from now)
      user.freezeProtectionUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.inventory.freezeStreaks -= 1;
    }

    await user.save();

    return res.json({
      message: `Used ${item.name}!`,
      pet: user.pet,
      inventory: user.inventory,
      freezeProtectionUntil: user.freezeProtectionUntil
    });
  } catch (err) {
    console.error('Use item error:', err);
    return res.status(500).json({ message: 'Failed to use item' });
  }
}

/**
 * Set active background
 */
export async function setBackground(req, res) {
  try {
    const { backgroundId } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if user owns the background
    if (!user.inventory.backgrounds.includes(backgroundId)) {
      return res.status(400).json({ message: 'Background not owned' });
    }

    user.inventory.activeBackground = backgroundId;
    await user.save();

    return res.json({
      message: 'Background updated!',
      activeBackground: user.inventory.activeBackground
    });
  } catch (err) {
    console.error('Set background error:', err);
    return res.status(500).json({ message: 'Failed to set background' });
  }
}

/**
 * Get user inventory
 */
export async function getInventory(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      inventory: user.inventory,
      coins: user.coins,
      freezeProtectionUntil: user.freezeProtectionUntil
    });
  } catch (err) {
    console.error('Get inventory error:', err);
    return res.status(500).json({ message: 'Failed to get inventory' });
  }
}
