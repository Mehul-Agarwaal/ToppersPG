const Joi = require('joi');

const pgSchema = Joi.object({
    name: Joi.string().trim().min(3).required().messages({
        'string.empty': 'PG Name is required.',
        'string.min': 'PG Name must be at least 3 characters long.',
    }),
    location: Joi.string().trim().min(3).required().messages({
        'string.empty': 'Location is required.',
        'string.min': 'Location must be at least 3 characters long.',
    }),
    address: Joi.string().trim().min(10).required().messages({
        'string.empty': 'Address is required.',
        'string.min': 'Address must be at least 10 characters long.',
    }),
});

module.exports = { pgSchema };