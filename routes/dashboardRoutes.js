const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, getDashboard);

module.exports = router;