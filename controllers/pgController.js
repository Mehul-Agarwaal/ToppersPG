const PG = require('../models/PG');
const Room = require('../models/Room');

// NEW FUNCTION: To get and display all PGs for the logged-in admin
exports.getAllPgs = async (req, res) => {
    try {
        const pgs = await PG.find({ admin: req.user._id }).sort({ createdAt: -1 });
        res.render('pg-list', { pgs, page: 'pgs' });
    } catch (error) {
        console.error("Error fetching PGs:", error);
        req.flash('error', 'Could not fetch properties.');
        res.redirect('/');
    }
};

exports.createPg = async (req, res) => {
    try {
        const { name, location, address } = req.body;
        await PG.create({ name, location, address, admin: req.user._id });
        req.flash('success_msg', 'New PG added successfully!');
        res.redirect('/pgs'); // Redirect to the new PG list page
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error adding new PG.');
        res.redirect('/pgs');
    }
};

exports.getPgDetail = async (req, res) => {
    try {
        const adminId = req.user._id;
        const pg = await PG.findOne({ _id: req.params.id, admin: adminId });

        if (!pg) {
            req.flash('error', 'Property not found.');
            return res.redirect('/pgs');
        }

        const rooms = await Room.find({ pg: pg._id, admin: adminId })
            .populate('residents') // Populate the resident details for each room
            .sort({ roomNumber: 1 });

        res.render('pg-detail', { pg, rooms, page: 'pgs' });
    } catch (error) {
        console.error("Error fetching PG details:", error);
        req.flash('error', 'Could not fetch property details.');
        res.redirect('/pgs');
    }
};


exports.getPgEditForm = async (req, res) => {
    try {
        const pg = await PG.findOne({ _id: req.params.id, admin: req.user._id });
        if (!pg) {
            req.flash('error', 'Property not found.');
            return res.redirect('/pgs');
        }
        res.render('edit-pg', { pg, page: 'pgs' });
    } catch (error) {
        console.error("Error fetching PG for edit:", error);
        req.flash('error', 'Could not load the edit form.');
        res.redirect('/pgs');
    }
};

exports.updatePg = async (req, res) => {
    try {
        const { name, location, address } = req.body;
        await PG.findOneAndUpdate({ _id: req.params.id, admin: req.user._id }, { name, location, address });
        req.flash('success_msg', 'Property details updated successfully.');
        res.redirect('/pgs');
    } catch (error) {
        console.error("Error updating PG:", error);
        req.flash('error', 'Failed to update property details.');
        res.redirect('/pgs');
    }
};

exports.deletePg = async (req, res) => {
    try {
        const pgId = req.params.id;
        const adminId = req.user._id;

        const pg = await PG.findOne({ _id: pgId, admin: adminId });
        if (!pg) {
            req.flash('error', 'Property not found.');
            return res.redirect('/pgs');
        }

        const residentsToDelete = await Resident.find({ pg: pgId, admin: adminId });
        for (const resident of residentsToDelete) {
            if (resident.photo?.public_id) await cloudinary.uploader.destroy(resident.photo.public_id);
            if (resident.idProof?.public_id) await cloudinary.uploader.destroy(resident.idProof.public_id);
        }

        await Resident.deleteMany({ pg: pgId, admin: adminId });
        await Room.deleteMany({ pg: pgId, admin: adminId });
        await PG.findByIdAndDelete(pgId);

        req.flash('success_msg', 'Property and all associated data have been deleted.');
        res.redirect('/pgs');
    } catch (error) {
        console.error("Error deleting PG:", error);
        req.flash('error', 'An error occurred while deleting the property.');
        res.redirect('/pgs');
    }
};