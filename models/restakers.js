const mongoose = require('mongoose');

const RestakerSchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  amountRestakedStETH: {
    type: String,
    required: true,
  },
  targetAVSOperatorAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Remove explicit index
// RestakerSchema.index({ userAddress: 1 });

module.exports = mongoose.model('Restaker', RestakerSchema);