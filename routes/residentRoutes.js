const express = require('express');
const router = express.Router();
const { getAllResidents, getNewResidentForm, createResident, deleteResident } = require('../controllers/residentController');
const { upload } = require('../config/cloudinaryConfig');
const { ensureAuthenticated } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { residentSchema } = require('../validators/residentValidator');

router.get('/', ensureAuthenticated, getAllResidents);
router.get('/new', ensureAuthenticated, getNewResidentForm);
router.post('/', ensureAuthenticated, upload.fields([{ name: 'photo' }, { name: 'idProof' }]), validate(residentSchema), createResident);
router.delete('/:id', ensureAuthenticated, deleteResident);

module.exports = router;
