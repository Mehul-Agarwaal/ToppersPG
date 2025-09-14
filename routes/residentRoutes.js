const express = require('express');
const router = express.Router();
const { 
    getAllResidents, 
    getNewResidentForm, 
    createResident, 
    deleteResident, 
    getResidentDetail, 
    markAsPaid,
    getResidentEditForm, 
    updateResident
} = require('../controllers/residentController');
const { upload } = require('../config/cloudinaryConfig');
const { ensureAuthenticated } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { residentSchema } = require('../validators/residentValidator');

router.get('/', ensureAuthenticated, getAllResidents);
router.get('/new', ensureAuthenticated, getNewResidentForm);
router.get('/:id/edit', ensureAuthenticated, getResidentEditForm);

const residentUpdateValidator = validate(residentSchema.fork(['pg', 'room', 'paymentStatus', 'joiningDate'], (field) => field.optional()));
router.put('/:id', ensureAuthenticated, residentUpdateValidator, updateResident);

router.get('/:id', ensureAuthenticated, getResidentDetail);
router.post('/', ensureAuthenticated, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'idProof', maxCount: 1 }]), validate(residentSchema), createResident);
router.delete('/:id', ensureAuthenticated, deleteResident);
router.post('/:id/pay', ensureAuthenticated, markAsPaid);

module.exports = router;