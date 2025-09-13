const PG = require('../models/PG');
const Room = require('../models/Room');
const Resident = require('../models/Resident');

// This function now renders the original dashboard with stats
exports.getDashboard = async (req, res) => {
    try {
        const adminId = req.user._id;

        const pgs = await PG.find({ admin: adminId });
        const rooms = await Room.find({ admin: adminId }).populate('residents');
        const residents = await Resident.find({ admin: adminId });

        const stats = {
            totalPGs: pgs.length,
            totalRooms: rooms.length,
            totalResidents: residents.length,
            paymentsDue: residents.filter(r => r.paymentStatus === 'Due' || r.paymentStatus === 'Overdue').length,
            vacantSpots: rooms.reduce((acc, room) => {
                const capacity = room.occupancyType === 'single' ? 1 : 2;
                return acc + (capacity - room.residents.length);
            }, 0),
        };
        // Note: we pass 'pgs' to populate the "Add Room" form dropdown
        res.render('dashboard', { pgs, stats, page: 'dashboard' });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.render('dashboard', { pgs:[], stats: {}, error: "Could not fetch data.", page: 'dashboard' });
    }
};