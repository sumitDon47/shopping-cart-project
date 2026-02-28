import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";

// Generate JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * POST /api/auth/send-otp
 * Send OTP to email for registration
 */
export const sendOTP = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Remove any previous OTP for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    const otp = generateOTP();

    await Otp.create({
      email: email.toLowerCase(),
      name: name.trim(),
      otp,
    });

    // In production, send via email (nodemailer, etc.)
    // For development, log it
    console.log(`\n📧 OTP for ${email}: ${otp}\n`);

    res.status(200).json({
      message: "OTP sent successfully",
      ...(process.env.NODE_ENV === "development" && { otp }), // expose in dev only
    });
  } catch (err) {
    console.error("sendOTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/**
 * POST /api/auth/resend-otp
 */
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if there's a pending OTP record
    const existing = await Otp.findOne({ email: email.toLowerCase() });
    if (!existing) {
      return res.status(400).json({ message: "No pending registration found. Please start over." });
    }

    // Remove old and create new
    await Otp.deleteMany({ email: email.toLowerCase() });
    const otp = generateOTP();
    await Otp.create({
      email: email.toLowerCase(),
      name: existing.name,
      otp,
    });

    console.log(`\n📧 Resent OTP for ${email}: ${otp}\n`);

    res.status(200).json({
      message: "OTP resent successfully",
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (err) {
    console.error("resendOTP error:", err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify OTP and create user account
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, OTP, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or not found. Please request a new one." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if user already exists (race condition guard)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await Otp.deleteMany({ email: email.toLowerCase() });
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name: otpRecord.name,
      email: email.toLowerCase(),
      password,
      isEmailVerified: true,
    });

    // Remove OTP
    await Otp.deleteMany({ email: email.toLowerCase() });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("verifyOTP error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/**
 * PUT /api/auth/profile
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, password } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (address) user.address = { ...user.address.toObject?.() || {}, ...address };
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      user.password = password;
    }

    await user.save();

    res.json({ data: user.toJSON() });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
