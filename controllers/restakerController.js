const Restaker = require('../models/restakers');

exports.getRestakers = async (req, res) => {
  try {
    const restakers = await Restaker.find({}).lean();
    res.status(200).json(restakers);
  } catch (err) {
    console.error('Error fetching restakers:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};