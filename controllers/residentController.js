const Resident = require('../models/Resident');
const Room = require('../models/Room');
const PG = require('../models/PG');
const { cloudinary } = require('../config/cloudinaryConfig');

exports.getAllResidents = async (req, res) => {
    try {
        const residents = await Resident.find().populate('pg').populate('room').sort({ createdAt: -1 });
        res.render('residents', { residents, error: null, page: 'residents' });
    } catch (error) {
        console.error("Error fetching residents:", error);
        res.render('residents', { residents: [], error: 'Could not fetch residents.', page: 'residents' });
    }
};

exports.getNewResidentForm = async (req, res) => {
    try {
        const pgs = await PG.find();
        const rooms = await Room.find().populate('pg').populate('residents');
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
        // ===================================================================
        // NEW: File Validation Check
        // ===================================================================
        if (!req.files || !req.files['photo'] || !req.files['idProof']) {
            req.flash('error', 'Both resident photo and ID proof are required.');
            req.flash('formData', req.body); // Repopulate form fields
            return res.redirect(referrer);
        }

        const { room: roomId } = req.body;
        const roomToUpdate = await Room.findById(roomId);

        if (!roomToUpdate) {
            req.flash('error', 'Selected room could not be found.');
            return res.redirect(referrer);
        }

        const capacity = roomToUpdate.occupancyType === 'single' ? 1 : 2;
        if (roomToUpdate.residents.length >= capacity) {
            req.flash('error', `Room ${roomToUpdate.roomNumber} is already full.`);
            return res.redirect(referrer);
        }
        
        const newResidentData = { ...req.body };
        
        // Add file data to the object for saving
        newResidentData.photo = { url: req.files['photo'][0].path, public_id: req.files['photo'][0].filename };
        newResidentData.idProof = { url: req.files['idProof'][0].path, public_id: req.files['idProof'][0].filename };

        const newResident = new Resident(newResidentData);
        await newResident.save();
        
        roomToUpdate.residents.push(newResident._id);
        await roomToUpdate.save();
        
        req.flash('success_msg', 'New resident added successfully!');
        res.redirect('/residents');
    } catch (error) {
        console.error("Error creating resident:", error);
        req.flash('error', 'Error adding new resident. Please check your inputs and try again.');
        res.redirect(referrer);
    }
};

exports.deleteResident = async (req, res) => {
    try {
        const resident = await Resident.findByIdAndDelete(req.params.id);
        if (!resident) {
            req.flash('error', 'Resident not found.');
            return res.redirect('/residents');
        }

        // Remove the resident's ID from their assigned room
        await Room.findByIdAndUpdate(resident.room, { $pull: { residents: resident._id } });

        // Delete images from Cloudinary
        if (resident.photo && resident.photo.public_id) {
            await cloudinary.uploader.destroy(resident.photo.public_id);
        }
        if (resident.idProof && resident.idProof.public_id) {
            await cloudinary.uploader.destroy(resident.idProof.public_id);
        }
        
        req.flash('success_msg', 'Resident deleted successfully.');
        res.redirect('/residents');
    } catch (error) {
        console.error("Error deleting resident:", error);
        req.flash('error', 'Error deleting resident.');
        res.redirect('/residents');
    }
};

