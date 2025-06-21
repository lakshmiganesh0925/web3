const Reward = require('../models/rewards');

exports.getRewardsByAddress = async (req, res) => {
  try {
    const { address } = req.params;
    const rewards = await Reward.findOne({ walletAddress: address.toLowerCase() }).lean();

    if (!rewards) {
      return res.status(404).json({ message: 'No rewards found for this address' });
    }
    res.status(200).json(rewards);
  } catch (err) {
    console.error('Error fetching rewards:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};