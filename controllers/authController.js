const passport = require('passport');
const Admin = require('../Models/Admin');

exports.getLoginPage = (req, res) => {
    // The 'error' flash message is automatically populated by Passport's failureFlash
    res.render('login', { page: 'login' });
};

// Use passport.authenticate with failureFlash to enable connect-flash messages
exports.postLogin = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
});

exports.getRegisterPage = (req, res) => {
    res.render('register', { page: 'register' });
};

exports.postRegister = async (req, res) => {
    try {
        const { username, password } = req.body;
        // For security, only allow registration if there are no admins yet.
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            req.flash('error', 'Registration is closed. An admin account already exists.');
            return res.redirect('/auth/register');
        }
        const newAdmin = new Admin({ username, password });
        await newAdmin.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong during registration.');
        res.redirect('/auth/register');
    }
};

exports.logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success_msg', 'You have logged out');
        res.redirect('/auth/login');
    });
};