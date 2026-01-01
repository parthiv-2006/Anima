import mongoose from 'mongoose';

const PetSchema = new mongoose.Schema({
  nickname: { type: String, default: 'Nova' },
  species: { type: String, enum: ['EMBER', 'AQUA', 'TERRA'], required: true },
  stage: { type: Number, default: 1 },
  stats: {
    str: { type: Number, default: 0 },
    int: { type: Number, default: 0 },
    spi: { type: Number, default: 0 }
  },
  totalXp: { type: Number, default: 0 },
  evolutionPath: { type: String, default: 'EMBER_BASE' }
});

export default PetSchema;
