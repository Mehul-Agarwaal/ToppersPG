const Resident = require('../models/Resident');
const Room = require('../models/Room');
const PG = require('../models/PG');
const { cloudinary } = require('../config/cloudinaryConfig');

exports.getAllResidents = async (req, res) => {
    try {
        const residents = await Resident.find().populate('pg').populate('room');
        res.render('residents', { residents, error: null, page: 'residents' });
    } catch (error) {
        console.error(error);
        res.render('residents', { residents: [], error: 'Could not fetch residents.', page: 'residents' });
    }
};

exports.getNewResidentForm = async (req, res) => {
    try {
        const pgs = await PG.find();
        const rooms = await Room.find().populate('pg').populate('residents');
        res.render('add-resident', { pgs, rooms, error: null, page: 'add-resident' });
    } catch (error) {
        console.error(error);
        res.redirect('/residents');
    }
};

exports.createResident = async (req, res) => {
    try {
        const { room: roomId } = req.body;
        const roomToUpdate = await Room.findById(roomId);
        if (!roomToUpdate) {
            req.flash('error', 'Selected room not found.');
            return res.redirect('back');
        }
        
        const newResidentData = { ...req.body };
        if (req.files['photo']) newResidentData.photo = { url: req.files['photo'][0].path, public_id: req.files['photo'][0].filename };
        if (req.files['idProof']) newResidentData.idProof = { url: req.files['idProof'][0].path, public_id: req.files['idProof'][0].filename };

        const newResident = await Resident.create(newResidentData);
        roomToUpdate.residents.push(newResident._id);
        await roomToUpdate.save();
        
        req.flash('success_msg', 'New resident added successfully!');
        res.redirect('/residents');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error adding new resident.');
        res.redirect('back');
    }
};

exports.deleteResident = async (req, res) => {
    try {
        const resident = await Resident.findByIdAndDelete(req.params.id);
        if (!resident) {
            req.flash('error', 'Resident not found.');
            return res.redirect('/residents');
        }

        await Room.findByIdAndUpdate(resident.room, { $pull: { residents: resident._id } });
        if (resident.photo?.public_id) await cloudinary.uploader.destroy(resident.photo.public_id);
        if (resident.idProof?.public_id) await cloudinary.uploader.destroy(resident.idProof.public_id);
        
        req.flash('success_msg', 'Resident deleted successfully.');
        res.redirect('/residents');
    } catch (error){
        console.error(error);
        req.flash('error', 'Error deleting resident.');
        res.redirect('/residents');
    }
};
