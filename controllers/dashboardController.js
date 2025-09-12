const PG = require('../models/PG');
const Room = require('../models/Room');
const Resident = require('../models/Resident');

exports.getDashboard = async (req, res) => {
    try {
        const pgs = await PG.find();
        const rooms = await Room.find().populate('pg').populate('residents');
        const residents = await Resident.find().populate('pg').populate('room');

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
        res.render('dashboard', { pgs, rooms, residents, stats, error: null, page: 'dashboard' });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.render('dashboard', { pgs: [], rooms: [], residents: [], stats: {}, error: "Could not fetch dashboard data.", page: 'dashboard' });
    }
};