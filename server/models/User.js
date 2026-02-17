const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    
    // User Role
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    
    // Email Verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationOTP: {
        type: String,
        select: false
    },
    emailVerificationOTPExpire: {
        type: Date,
        select: false
    },
    
    // Registration Status
    isRegistrationComplete: {
        type: Boolean,
        default: false
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
    timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
    // Only hash password if it has been modified
    if (!this.isModified('password')) {
        next();
    }
    
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to check if password matches
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate OTP
userSchema.methods.generateEmailOTP = function() {
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP before saving
    this.emailVerificationOTP = require('crypto')
        .createHash('sha256')
        .update(otp)
        .digest('hex');
    
    // Set expire time (10 minutes)
    this.emailVerificationOTPExpire = Date.now() + 10 * 60 * 1000;
    
    return otp;
};

const User = mongoose.model('User', userSchema);

module.exports = User;