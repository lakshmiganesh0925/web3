const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'EigenLayer Restaking API' });
});

module.exports = router;