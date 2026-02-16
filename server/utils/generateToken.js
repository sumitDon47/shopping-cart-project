const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign(
        { id }, // Payload - data to encode in token
        process.env.JWT_SECRET, // Secret key
        {
            expiresIn: process.env.JWT_EXPIRE || '30d' // Token expires in 30 days
        }
    );
};

module.exports = generateToken;