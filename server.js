const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const cron = require('node-cron');
const connectDB = require('./config/database');
const Resident = require('./models/Resident');

// Load environment variables
dotenv.config();

// Passport configuration
require('./config/passport')(passport);

// Connect to MongoDB
connectDB();

const app = express();

// Middleware Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'a secret string for session',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
    res.locals.user = req.user || null;
    res.locals.error = req.flash('error');
    res.locals.success_msg = req.flash('success_msg');
    res.locals.formData = req.flash('formData')[0] || {};
    next();
});


// AUTOMATED PAYMENT STATUS UPDATER (CRON JOB)
// This task runs every day at midnight ('0 0 * * *').
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily check for overdue payments...');
    try {
        const today = new Date();
        // Find residents whose status is 'Paid' but their due date is in the past.
        const residentsToUpdate = await Resident.find({
            paymentStatus: 'Paid',
            paymentDueDate: { $lt: today }
        });

        if (residentsToUpdate.length > 0) {
            // Update their status to 'Due'
            for (const resident of residentsToUpdate) {
                resident.paymentStatus = 'Due';
                await resident.save();
            }
            console.log(`Updated ${residentsToUpdate.length} residents to 'Due' status.`);
        } else {
            console.log('No residents needed a payment status update.');
        }
    } catch (error) {
        console.error('Error in cron job while updating payment statuses:', error);
    }
});

// Import and use routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const pgRoutes = require('./routes/pgRoutes');
const roomRoutes = require('./routes/roomRoutes');
const residentRoutes = require('./routes/residentRoutes');

app.use('/auth', authRoutes);
app.use('/', dashboardRoutes);
app.use('/pgs', pgRoutes);
app.use('/rooms', roomRoutes);
app.use('/residents', residentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});