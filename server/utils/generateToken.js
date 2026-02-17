const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user authentication
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
    return jwt.sign(
        { id }, // Payload - the data we want to encode
        process.env.JWT_SECRET, // Secret key from .env
        {
            expiresIn: process.env.JWT_EXPIRE || '30d' // Token expires in 30 days
        }
    );
};

module.exports = generateToken;