const express = require('express');
const router = express.Router();
// Add markAsPaid to the import list
const { getAllResidents, getNewResidentForm, createResident, deleteResident, getResidentDetail, markAsPaid } = require('../controllers/residentController');
const { upload } = require('../config/cloudinaryConfig');
const { ensureAuthenticated } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { residentSchema } = require('../validators/residentValidator');

router.get('/', ensureAuthenticated, getAllResidents);
router.get('/new', ensureAuthenticated, getNewResidentForm);
router.get('/:id', ensureAuthenticated, getResidentDetail);
router.post('/', ensureAuthenticated, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'idProof', maxCount: 1 }]), validate(residentSchema), createResident);
router.delete('/:id', ensureAuthenticated, deleteResident);

// NEW ROUTE for marking payment as paid
router.post('/:id/pay', ensureAuthenticated, markAsPaid);

module.exports = router;