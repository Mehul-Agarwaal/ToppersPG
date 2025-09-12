const express = require('express');
const router = express.Router();
const { createRoom } = require('../controllers/roomController');
const { ensureAuthenticated } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { roomSchema } = require('../validators/roomValidator');

router.post('/', ensureAuthenticated, validate(roomSchema), createRoom);

module.exports = router;
