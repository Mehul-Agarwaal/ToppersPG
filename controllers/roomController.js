const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
    // Get the PG's ID from the form body
    const { roomNumber, pg, occupancyType, rent } = req.body;
    try {
        await Room.create({ roomNumber, pg, occupancyType, rent, admin: req.user._id });
        req.flash('success_msg', 'New room added successfully!');
        // Redirect back to the PG's detail page
        res.redirect(`/pgs/${pg}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error adding new room.');
        // Redirect back to the PG's detail page on error
        res.redirect(`/pgs/${pg}`);
    }
};

exports.getRoomEditForm = async (req, res) => {
    try {
        const room = await Room.findOne({ _id: req.params.id, admin: req.user._id }).populate('pg');
        if (!room) {
            req.flash('error', 'Room not found.');
            return res.redirect('/');
        }
        res.render('edit-room', { room, page: 'pgs' });
    } catch (error) {
        console.error("Error fetching room for edit:", error);
        req.flash('error', 'Could not load the edit form.');
        res.redirect('/');
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const { roomNumber, rent, occupancyType } = req.body;
        const room = await Room.findOne({ _id: req.params.id, admin: req.user._id });

        if (!room) {
            req.flash('error', 'Room not found.');
            return res.redirect('/');
        }
        
        await room.updateOne({ roomNumber, rent, occupancyType });
        req.flash('success_msg', 'Room details updated successfully.');
        res.redirect(`/pgs/${room.pg}`);
    } catch (error) {
        console.error("Error updating room:", error);
        req.flash('error', 'Failed to update room details.');
        res.redirect('/');
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findOne({ _id: req.params.id, admin: req.user._id });
        if (!room) {
            req.flash('error', 'Room not found.');
            return res.redirect('/');
        }

        if (room.residents && room.residents.length > 0) {
            req.flash('error', 'Cannot delete a room that is currently occupied.');
            return res.redirect(`/pgs/${room.pg}`);
        }

        await room.deleteOne();
        req.flash('success_msg', 'Room deleted successfully.');
        res.redirect(`/pgs/${room.pg}`);
    } catch (error) {
        console.error("Error deleting room:", error);
        req.flash('error', 'An error occurred while deleting the room.');
        res.redirect('/');
    }
};