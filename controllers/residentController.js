const Resident = require('../models/Resident');
const Room = require('../models/Room');
const PG = require('../models/PG');
const { cloudinary } = require('../config/cloudinaryConfig');
const { differenceInCalendarMonths, addMonths } = require('date-fns');


exports.getAllResidents = async (req, res) => {
    try {
        const residents = await Resident.find().populate('pg').populate('room').sort({ createdAt: -1 });
        res.render('residents', { residents, error: null, page: 'residents' });
    } catch (error) {
        console.error("Error fetching residents:", error);
        res.render('residents', { residents: [], error: 'Could not fetch residents.', page: 'residents' });
    }
};

exports.getResidentDetail = async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id)
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
    console.log('\n--- Starting createResident process ---');
    const referrer = req.get('Referrer') || '/residents/new';
    
    try {
        // STEP 1: Log the received files from Multer
        console.log('STEP 1: Checking req.files...');
        console.log(req.files);

        if (!req.files || !req.files['photo'] || !req.files['idProof']) {
            console.error('FAIL: Files are missing.');
            req.flash('error', 'Both resident photo and ID proof are required.');
            req.flash('formData', req.body);
            return res.redirect(referrer);
        }
        console.log(' SUCCESS: Files are present.');

        // STEP 2: Find the room
        console.log('STEP 2: Finding room...');
        const { room: roomId } = req.body;
        const roomToUpdate = await Room.findById(roomId);

        if (!roomToUpdate) {
            console.error('FAIL: Room not found.');
            req.flash('error', 'Selected room could not be found.');
            req.flash('formData', req.body);
            return res.redirect(referrer);
        }
        console.log(` SUCCESS: Found room: ${roomToUpdate.roomNumber}`);

        // STEP 3: Check room capacity
        console.log('STEP 3: Checking room capacity...');
        const capacity = roomToUpdate.occupancyType === 'single' ? 1 : 2;
        if (roomToUpdate.residents.length >= capacity) {
            console.error('FAIL: Room is full.');
            req.flash('error', `Room ${roomToUpdate.roomNumber} is already full.`);
            req.flash('formData', req.body);
            return res.redirect(referrer);
        }
        console.log(' SUCCESS: Room has vacancy.');
        
        // STEP 4: Prepare and save the new resident
        console.log('STEP 4: Creating and saving new resident...');
        const newResident = new Resident(req.body);
        
        newResident.photo = { url: req.files['photo'][0].path, public_id: req.files['photo'][0].filename };
        newResident.idProof = { url: req.files['idProof'][0].path, public_id: req.files['idProof'][0].filename };
        
        newResident.paymentDueDate = new Date(newResident.joiningDate);
        if (newResident.paymentStatus === 'Paid') {
            newResident.paymentDueDate = addMonths(newResident.paymentDueDate, 1);
        }
        
        await newResident.save();
        console.log(` SUCCESS: Resident saved with ID: ${newResident._id}`);
        
        // STEP 5: Update the room
        console.log('STEP 5: Updating room with new resident...');
        roomToUpdate.residents.push(newResident._id);
        await roomToUpdate.save();
        console.log('SUCCESS: Room updated.');
        
        req.flash('success_msg', 'New resident added successfully!');
        res.redirect('/residents');

    } catch (error) {
        // THIS IS THE MOST IMPORTANT PART - IT WILL SHOW US THE HIDDEN ERROR
        console.error("\n CRITICAL ERROR CAUGHT  ");
        console.error(error); // Log the full error object
        console.error("END OF ERROR ");

        req.flash('error', 'A server error occurred. Please check the console for details.');
        req.flash('formData', req.body);
        res.redirect(referrer);
    }
};


// ... (markAsPaid and deleteResident are unchanged)
exports.markAsPaid = async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id);
        if (!resident) {
            req.flash('error', 'Resident not found.');
            return res.redirect('/residents');
        }

        const pendingMonths = differenceInCalendarMonths(new Date(), new Date(resident.paymentDueDate)) + 1;

        resident.paymentStatus = 'Paid';
        resident.paymentDueDate = addMonths(new Date(resident.paymentDueDate), pendingMonths);
        await resident.save();

        req.flash('success_msg', 'Payment marked as paid. Next due date has been updated.');
        res.redirect(`/residents/${req.params.id}`);
    } catch (error) {
        console.error("Error marking payment as paid:", error);
        req.flash('error', 'Failed to update payment status.');
        res.redirect(`/residents/${req.params.id}`);
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
    } catch (error) {
        console.error("Error deleting resident:", error);
        req.flash('error', 'Error deleting resident.');
        res.redirect('/residents');
    }
};

