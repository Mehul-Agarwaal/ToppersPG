const express = require('express');
const router = express.Router();
const { createPg, getPgDetail, getAllPgs, getPgEditForm, updatePg, deletePg } = require('../controllers/pgController');
const { ensureAuthenticated } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { pgSchema } = require('../validators/pgValidator');

router.get('/', ensureAuthenticated, getAllPgs);
router.post('/', ensureAuthenticated, validate(pgSchema), createPg);
router.get('/:id/edit', ensureAuthenticated, getPgEditForm);
router.put('/:id', ensureAuthenticated, validate(pgSchema), updatePg);
router.delete('/:id', ensureAuthenticated, deletePg);
router.get('/:id', ensureAuthenticated, getPgDetail);

module.exports = router;