const express = require('express');
const router = express.Router();
const { createRoom, getRoomEditForm, updateRoom, deleteRoom } = require('../controllers/roomController');
const { ensureAuthenticated } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { roomSchema } = require('../validators/roomValidator');


router.post('/', ensureAuthenticated, validate(roomSchema), createRoom);


const roomUpdateValidator = validate(roomSchema.fork(['pg'], (field) => field.optional()));

router.get('/:id/edit', ensureAuthenticated, getRoomEditForm);


router.put('/:id', ensureAuthenticated, roomUpdateValidator, updateRoom);

router.delete('/:id', ensureAuthenticated, deleteRoom);

module.exports = router;

