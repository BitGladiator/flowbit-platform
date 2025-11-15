const express = require('express');
const authenticateToken = require('../middleware/auth');
const { getScreensForCustomer } = require('../services/screenService');

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', (req, res) => {
  try {
    const { userId, email, customerId, role } = req.user;
    res.json({ userId, email, customerId, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/screens', (req, res) => {
  try {
    const screens = getScreensForCustomer(req.user.customerId);
    res.json(screens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
