const express = require('express');
const router = express.Router();
const { createPg } = require('../controllers/pgController');
const { ensureAuthenticated } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { pgSchema } = require('../validators/pgValidator');

router.post('/', ensureAuthenticated, validate(pgSchema), createPg);

module.exports = router;