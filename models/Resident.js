const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    permanentAddress: { type: String, required: true },
    occupation: { type: String, required: true },
    workplaceOrCollege: { type: String, required: true },
    photo: { url: String, public_id: String },
    idProof: { url: String, public_id: String },
    pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    paymentStatus: { type: String, enum: ['Paid', 'Due', 'Overdue'], default: 'Due' },
    joiningDate: { type: Date, default: Date.now },
    paymentDueDate: { type: Date },
    // NEW FIELD: Link to the admin who owns this resident record
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Resident', residentSchema);