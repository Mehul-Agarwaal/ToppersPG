const Joi = require('joi');

const roomSchema = Joi.object({
    roomNumber: Joi.string().trim().required().messages({
        'string.empty': 'Room Number is required.',
    }),
    pg: Joi.string().hex().length(24).required().messages({
        'string.empty': 'You must select a PG.',
        'string.hex': 'Invalid PG selected.',
        'string.length': 'Invalid PG selected.',
    }),
    occupancyType: Joi.string().valid('single', 'double').required(),
    rent: Joi.number().min(0).required().messages({
        'number.base': 'Rent must be a number.',
        'number.min': 'Rent cannot be negative.',
    }),
});

module.exports = { roomSchema };