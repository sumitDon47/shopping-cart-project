const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { otpEmailTemplate, welcomeEmailTemplate } = require('../utils/emailTemplates');

// @desc    Step 1: Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Check if user already exists and is verified
        const existingUser = await User.findOne({ email });
        
        if (existingUser && existingUser.isRegistrationComplete) {
            return res.status(400).json({
                success: false,
                message: 'User already exists. Please login.'
            });
        }

        let user;
        
        if (existingUser && !existingUser.isRegistrationComplete) {
            // User exists but not verified, update and resend OTP
            user = existingUser;
            user.name = name;
        } else {
            // Create new user (without password)
            user = new User({
                name,
                email,
                isRegistrationComplete: false
            });
        }

        // Generate OTP
        const otp = user.generateEmailOTP();

        // Save user
        await user.save({ validateBeforeSave: false });

        // Send OTP email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Email Verification - Shopping Cart',
                message: otpEmailTemplate(user.name, otp)
            });

            res.status(200).json({
                success: true,
                message: 'OTP sent to your email',
                data: {
                    email: user.email,
                    expiresIn: '10 minutes'
                }
            });
        } catch (error) {
            // If email fails, delete the unverified user
            user.emailVerificationOTP = undefined;
            user.emailVerificationOTPExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again.'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Step 2: Verify OTP and set password
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTPAndSetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        // Hash the OTP to compare
        const hashedOTP = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        // Find user with valid OTP
        const user = await User.findOne({
            email,
            emailVerificationOTP: hashedOTP,
            emailVerificationOTPExpire: { $gt: Date.now() }
        }).select('+emailVerificationOTP +emailVerificationOTPExpire');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Set password and mark as verified
        user.password = password;
        user.isEmailVerified = true;
        user.isRegistrationComplete = true;
        user.emailVerificationOTP = undefined;
        user.emailVerificationOTPExpire = undefined;

        await user.save();

        // Send welcome email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Welcome to Shopping Cart!',
                message: welcomeEmailTemplate(user.name)
            });
        } catch (error) {
            console.log('Welcome email failed, but user is registered');
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Find unverified user
        const user = await User.findOne({
            email,
            isRegistrationComplete: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found or already verified'
            });
        }

        // Generate new OTP
        const otp = user.generateEmailOTP();
        await user.save({ validateBeforeSave: false });

        // Send OTP email
        await sendEmail({
            email: user.email,
            subject: 'Email Verification - Shopping Cart',
            message: otpEmailTemplate(user.name, otp)
        });

        res.status(200).json({
            success: true,
            message: 'OTP resent to your email'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if registration is complete
        if (!user.isRegistrationComplete) {
            return res.status(400).json({
                success: false,
                message: 'Please complete your registration by verifying your email'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create admin user (Manual - by developer only)
// @route   POST /api/auth/create-admin
// @access  Private/Developer Only
exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password, secretKey } = req.body;

        // Secret key protection (set this in .env)
        const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'your-super-secret-admin-key';
        
        if (secretKey !== ADMIN_SECRET_KEY) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Invalid secret key'
            });
        }

        // Check if admin already exists
        const adminExists = await User.findOne({ email });

        if (adminExists) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this email already exists'
            });
        }

        // Create admin user
        const admin = await User.create({
            name,
            email,
            password,
            role: 'admin',
            isEmailVerified: true,
            isRegistrationComplete: true
        });

        // Generate token
        const token = generateToken(admin._id);

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            token,
            user: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;

            if (req.body.address) {
                user.address = {
                    ...user.address,
                    ...req.body.address
                };
            }

            // Don't allow email change through this endpoint
            // Don't allow password change through this endpoint (use separate endpoint)

            const updatedUser = await user.save();

            res.json({
                success: true,
                data: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                    role: updatedUser.role
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};