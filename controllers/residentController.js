const Resident = require('../models/Resident');
const Room = require('../models/Room');
const PG = require('../models/PG');
const { cloudinary } = require('../config/cloudinaryConfig');
const { differenceInCalendarMonths, addMonths } = require('date-fns');

exports.getAllResidents = async (req, res) => {
    try {
        // UPDATED: Filter residents by the logged-in admin
        const residents = await Resident.find({ admin: req.user._id }).populate('pg').populate('room').sort({ createdAt: -1 });
        res.render('residents', { residents, error: null, page: 'residents' });
    } catch (error) {
        console.error("Error fetching residents:", error);
        res.render('residents', { residents: [], error: 'Could not fetch residents.', page: 'residents' });
    }
};

exports.getResidentDetail = async (req, res) => {
    try {
        // UPDATED: SECURITY - Find by ID *and* ensure the resident belongs to the current admin
        const resident = await Resident.findOne({ _id: req.params.id, admin: req.user._id })
            .populate('pg')
            .populate({ path: 'room', populate: { path: 'pg' } });

        if (!resident) {
            req.flash('error', 'Resident not found.');
            return res.redirect('/residents');
        }

        let totalPendingAmount = 0;
        let pendingMonths = 0;
        if (resident.paymentStatus === 'Due' || resident.paymentStatus === 'Overdue') {
            pendingMonths = differenceInCalendarMonths(new Date(), new Date(resident.paymentDueDate)) + 1;
            totalPendingAmount = pendingMonths * resident.room.rent;
        }

        res.render('resident-detail', { 
            resident, 
            totalPendingAmount,
            pendingMonths,
            page: 'residents' 
        });
    } catch (error) {
        console.error("Error fetching resident details:", error);
        req.flash('error', 'Could not fetch resident details.');
        res.redirect('/residents');
    }
};

exports.getNewResidentForm = async (req, res) => {
    try {
        // UPDATED: Filter PGs and Rooms by the logged-in admin
        const adminId = req.user._id;
        const pgs = await PG.find({ admin: adminId });
        const rooms = await Room.find({ admin: adminId }).populate('pg').populate('residents');
        res.render('add-resident', { pgs, rooms, error: null, page: 'add-resident' });
    } catch (error) {
        console.error("Error fetching data for new resident form:", error);
        req.flash('error', 'Could not load the form, please try again.');
        res.redirect('/residents');
    }
};

exports.createResident = async (req, res) => {
    const referrer = req.get('Referrer') || '/residents/new';
    try {
        const adminId = req.user._id;
        // ... (validation checks for files, room, capacity) ...

        const newResident = new Resident({
            ...req.body,
            admin: adminId, // UPDATED: Assign the admin's ID
        });
        
        newResident.photo = { url: req.files['photo'][0].path, public_id: req.files['photo'][0].filename };
        newResident.idProof = { url: req.files['idProof'][0].path, public_id: req.files['idProof'][0].filename };
        
        newResident.paymentDueDate = new Date(newResident.joiningDate);
        if (newResident.paymentStatus === 'Paid') {
            newResident.paymentDueDate = addMonths(newResident.paymentDueDate, 1);
        }
        
        await newResident.save();
        
        const roomToUpdate = await Room.findOne({ _id: req.body.room, admin: adminId }); // Ensure admin owns the room
        roomToUpdate.residents.push(newResident._id);
        await roomToUpdate.save();
        
        req.flash('success_msg', 'New resident added successfully!');
        res.redirect('/residents');
    } catch (error) {
        console.error("Critical error during resident creation:", error);
        req.flash('error', 'A server error occurred. Please try again.');
        req.flash('formData', req.body);
        res.redirect(referrer);
    }
};

exports.markAsPaid = async (req, res) => {
    try {
        // UPDATED: SECURITY - Ensure the resident belongs to the current admin
        const resident = await Resident.findOne({ _id: req.params.id, admin: req.user._id });
        if (!resident) {
            req.flash('error', 'Resident not found.');
            return res.redirect('/residents');
        }

        const pendingMonths = differenceInCalendarMonths(new Date(), new Date(resident.paymentDueDate)) + 1;
        resident.paymentStatus = 'Paid';
        resident.paymentDueDate = addMonths(new Date(resident.paymentDueDate), pendingMonths);
        await resident.save();

        req.flash('success_msg', 'Payment marked as paid.');
        res.redirect(`/residents/${req.params.id}`);
    } catch (error) {
        console.error("Error marking payment as paid:", error);
        req.flash('error', 'Failed to update payment status.');
        res.redirect(`/residents/${req.params.id}`);
    }
};

exports.deleteResident = async (req, res) => {
    try {
        // UPDATED: SECURITY - Ensure admin can only delete their own residents
        const resident = await Resident.findOneAndDelete({ _id: req.params.id, admin: req.user._id });
        if (!resident) {
            req.flash('error', 'Resident not found.');
            return res.redirect('/residents');
        }
        await Room.findByIdAndUpdate(resident.room, { $pull: { residents: resident._id } });
        if (resident.photo?.public_id) await cloudinary.uploader.destroy(resident.photo.public_id);
        if (resident.idProof?.public_id) await cloudinary.uploader.destroy(resident.idProof.public_id);
        req.flash('success_msg', 'Resident deleted successfully.');
        res.redirect('/residents');
    } catch (error) {
        console.error("Error deleting resident:", error);
        req.flash('error', 'Error deleting resident.');
        res.redirect('/residents');
    }
};