const mongoose = require('mongoose');

const SlashHistorySchema = new mongoose.Schema({
  timestamp: {
    type: Number,
    required: true,
  },
  amountStETH: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    default: null,
  },
});

const ValidatorSchema = new mongoose.Schema({
  operatorAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  totalDelegatedStakeStETH: {
    type: String,
    required: true,
  },
  slashHistory: [SlashHistorySchema],
  status: {
    type: String,
    enum: ['active', 'jailed', 'slashed'],
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Remove explicit index
// ValidatorSchema.index({ operatorAddress: 1 });

module.exports = mongoose.model('Validator', ValidatorSchema);