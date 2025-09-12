const validate = (schema) => (req, res, next) => {
    // We only validate the body, not files from multer
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        // Store the original form data to re-populate the form
        req.flash('formData', req.body);

        // Map all validation error messages to a flash message array
        const errorMessages = error.details.map(detail => detail.message);
        req.flash('error', errorMessages);

        return res.redirect('back');
    }

    return next();
};

module.exports = validate;