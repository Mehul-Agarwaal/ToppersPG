const mongoose = require('mongoose');

// Function to connect to MongoDB Atlas
const connectDB = async () => {
    try {
        // Attempt to connect to the database using the URI from environment variables
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    } catch (error) {
        // Log the error and exit the process if the connection fails
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;