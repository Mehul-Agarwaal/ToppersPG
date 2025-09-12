
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Passport configuration
require('./config/passport')(passport);

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Middleware Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session Middleware (must be before Passport)
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'a secret string for session',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Message Middleware
app.use(flash());

// Global Variables for Views (must be after session and flash)
app.use(function (req, res, next) {
    res.locals.user = req.user || null;
    res.locals.error = req.flash('error'); // For Joi validation and passport errors
    res.locals.success_msg = req.flash('success_msg');
    res.locals.formData = req.flash('formData')[0] || {}; // For repopulating forms on validation error
    next();
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

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});