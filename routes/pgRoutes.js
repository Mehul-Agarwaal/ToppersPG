const express = require('express');
const router = express.Router();
// Add getAllPgs to the import list
const { createPg, getPgDetail, getAllPgs } = require('../controllers/pgController');
const { ensureAuthenticated } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { pgSchema } = require('../validators/pgValidator');

// NEW ROUTE: GET /pgs (to list all PGs)
router.get('/', ensureAuthenticated, getAllPgs);

// POST /pgs (to create a new PG)
router.post('/', ensureAuthenticated, validate(pgSchema), createPg);

// GET /pgs/:id (to view a single PG's details)
router.get('/:id', ensureAuthenticated, getPgDetail);

module.exports = router;