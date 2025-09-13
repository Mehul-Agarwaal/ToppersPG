const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    // NEW FIELD: Link to the admin who owns this PG
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

module.exports = mongoose.model('PG', pgSchema);