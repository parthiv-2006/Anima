import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  // Consumable items
  healthPotions: { type: Number, default: 0 },
  freezeStreaks: { type: Number, default: 0 },
  
  // Unlocked backgrounds (permanent)
  backgrounds: {
    type: [String],
    default: ['default'],
    enum: ['default', 'dojo', 'library', 'forest', 'volcano', 'ocean', 'mountain']
  },
  
  // Currently selected background
  activeBackground: { type: String, default: 'default' }
});

export default InventorySchema;
