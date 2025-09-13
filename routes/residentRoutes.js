const express = require('express');
const router = express.Router();
const { getAllResidents, getNewResidentForm, createResident, deleteResident, getResidentDetail } = require('../controllers/residentController');
const { upload } = require('../config/cloudinaryConfig');
const { ensureAuthenticated } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { residentSchema } = require('../validators/residentValidator');

router.get('/', ensureAuthenticated, getAllResidents);
router.get('/new', ensureAuthenticated, getNewResidentForm);

router.get('/:id', ensureAuthenticated, getResidentDetail);

// @route POST /residents
// Updated this line to be more specific with maxCount
router.post(
  '/',
  ensureAuthenticated,
  (req, res, next) => {
    upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'idProof', maxCount: 1 }])(req, res, function (err) {
      if (err) {
        console.error("❌ Multer/Cloudinary upload failed:", err);
        req.flash('error', 'File upload failed. Please try again.');
        return res.redirect('back');
      }
      next();
    });
  },
  validate(residentSchema),
  createResident
);

router.delete('/:id', ensureAuthenticated, deleteResident);

module.exports = router;

