const Validator = require('../models/validators');

exports.getValidators = async (req, res) => {
  try {
    const validators = await Validator.find({}).lean();
    res.status(200).json(validators);
  } catch (err) {
    console.error('Error fetching validators:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};