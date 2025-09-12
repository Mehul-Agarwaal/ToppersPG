const express = require('express');
const router = express.Router();
const { getLoginPage, postLogin, getRegisterPage, postRegister, logout } = require('../controllers/authController');
const { ensureGuest } = require('../middleware/auth');

router.get('/login', ensureGuest, getLoginPage);
router.post('/login', ensureGuest, postLogin);
router.get('/register', ensureGuest, getRegisterPage);
router.post('/register', ensureGuest, postRegister);
router.get('/logout', logout);

module.exports = router;