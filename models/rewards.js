const mongoose = require('mongoose');

const RewardBreakdownSchema = new mongoose.Schema({
  operatorAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  amountStETH: {
    type: String,
    required: true,
  },
  timestamps: [{ type: Number }],
});

const RewardSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  totalRewardsReceivedStETH: {
    type: String,
    required: true,
  },
  rewardsBreakdown: [RewardBreakdownSchema],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Remove explicit index
// RewardSchema.index({ walletAddress: 1 });

module.exports = mongoose.model('Reward', RewardSchema);