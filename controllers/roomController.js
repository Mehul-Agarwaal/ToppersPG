
const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
    try {
        const { roomNumber, pg, occupancyType, rent } = req.body;
        await Room.create({ roomNumber, pg, occupancyType, rent });
        req.flash('success_msg', 'New room added successfully!');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error adding new room.');
        res.redirect('/');
    }
};