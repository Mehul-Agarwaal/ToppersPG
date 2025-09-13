const Joi = require('joi');

const residentSchema = Joi.object({
    name: Joi.string().trim().min(3).required(),
    contactNumber: Joi.string().trim().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': `Contact number must be exactly 10 digits.`,
        'string.empty': 'Contact number is required.'
    }),
    email: Joi.string().trim().email({ tlds: { allow: false } }).allow('').optional(), // Allow empty email, but if provided, must be valid
    permanentAddress: Joi.string().trim().min(5).required(),
    occupation: Joi.string().trim().required(),
    workplaceOrCollege: Joi.string().trim().required(),
    pg: Joi.string().hex().length(24).required(),
    room: Joi.string().hex().length(24).required(),
    paymentStatus: Joi.string().valid('Paid', 'Due').required(),
    joiningDate: Joi.date().required(),
});

module.exports = { residentSchema };