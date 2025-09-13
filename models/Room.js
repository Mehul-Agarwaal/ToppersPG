const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
    occupancyType: { type: String, enum: ['single', 'double'], required: true },
    rent: { type: Number, required: true },
    residents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resident' }],
    // NEW FIELD: Link to the admin who owns this room
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);