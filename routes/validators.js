const express = require('express');
const router = express.Router();
const validatorController = require('../controllers/validatorController');

router.get('/', validatorController.getValidators);

module.exports = router;