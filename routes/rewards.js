const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');

router.get('/:address', rewardController.getRewardsByAddress);

module.exports = router;