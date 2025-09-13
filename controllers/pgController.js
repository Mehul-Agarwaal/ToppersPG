const PG = require('../models/PG');

exports.createPg = async (req, res) => {
    try {
        const { name, location, address } = req.body;
        // UPDATED: Add the admin's ID when creating a new PG
        await PG.create({ name, location, address, admin: req.user._id });
        req.flash('success_msg', 'New PG added successfully!');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error adding new PG.');
        res.redirect('/');
    }
};