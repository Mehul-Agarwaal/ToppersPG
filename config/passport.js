const LocalStrategy = require('passport-local').Strategy;
const Admin = require('../models/Admin');

module.exports = function(passport) {
    // Use the LocalStrategy for username/password authentication
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
            try {
                // Find an admin with the provided username
                const admin = await Admin.findOne({ username: username });
                if (!admin) {
                    // If no admin is found, return with a message
                    return done(null, false, { message: 'That username is not registered' });
                }

                // Check if the provided password matches the stored hash
                const isMatch = await admin.matchPassword(password);
                if (isMatch) {
                    // If passwords match, authentication is successful
                    return done(null, admin);
                } else {
                    // If passwords don't match, return with a message
                    return done(null, false, { message: 'Password incorrect' });
                }
            } catch (err) {
                // Handle any server errors
                return done(err);
            }
        })
    );

    // Store the user ID in the session
    passport.serializeUser((admin, done) => {
        done(null, admin.id);
    });

    // Retrieve the user from the database using the ID from the session
    passport.deserializeUser(async (id, done) => {
        try {
          const admin = await Admin.findById(id);
          done(null, admin);
        } catch (err) {
          done(err, null);
        }
    });
};