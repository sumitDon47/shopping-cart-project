const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses connection string from environment variables
 */
const connectDB = async () => {
    try {
        // Mongoose connection options
        const options = {
            useNewUrlParser: true,      // Use new URL parser
            useUnifiedTopology: true,   // Use new Server Discovery and Monitoring engine
        };

        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI, options);

        console.log(`✅ MongoDB Connected Successfully`);
        console.log(`📍 Host: ${conn.connection.host}`);
        console.log(`📦 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Exit with failure
    }
};

module.exports = connectDB;