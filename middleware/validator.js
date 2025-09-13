const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        console.error("❌ Joi validation failed:", error.details);
        req.flash('formData', req.body);
        const errorMessages = error.details.map(detail => detail.message);
        req.flash('error', errorMessages);
        return res.redirect('back');
    }

    console.log("✅ Joi validation passed:", req.body);
    return next();
};

module.exports = validate;

