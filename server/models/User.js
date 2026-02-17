const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Defines the structure of user documents in MongoDB
 */
const userSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true, // No duplicate emails
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default in queries
    },
    
    // User Role
    role: {
        type: String,
        enum: ['user', 'admin'], // Only these values allowed
        default: 'user'
    },
    
    // Contact Information
    phone: {
        type: String,
        maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    
    // Address Information
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'USA'
        }
    },
    
    // Profile Picture
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    
    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

/**
 * Middleware: Encrypt password before saving
 * This runs automatically before a user document is saved
 */
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        next();
    }
    
    // Generate salt (random data for hashing)
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Method: Check if entered password matches hashed password
 * @param {string} enteredPassword - Plain text password from user
 * @returns {boolean} True if passwords match
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;