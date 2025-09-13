const passport = require('passport');
const Admin = require('../models/Admin');

exports.getLoginPage = (req, res) => {
    res.render('login', { page: 'login' });
};

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
        
        // Check if username already exists
        const existingAdmin = await Admin.findOne({ username: username });
        if (existingAdmin) {
            req.flash('error', 'That username is already taken.');
            return res.redirect('/auth/register');
        }

        // REMOVED: The check that limited registration to one user.
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