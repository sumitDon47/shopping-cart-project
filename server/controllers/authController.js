import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendRegistrationOTP, sendPasswordResetOTP } from "../utils/email.js";

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

    // Send OTP via email
    await sendRegistrationOTP(email.toLowerCase(), name.trim(), otp);
    console.log(`📧 OTP sent to ${email}`);

    res.status(200).json({
      message: "OTP sent successfully. Check your email.",
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

    // Resend OTP via email
    await sendRegistrationOTP(email.toLowerCase(), existing.name, otp);
    console.log(`📧 OTP resent to ${email}`);

    res.status(200).json({
      message: "OTP resent successfully. Check your email.",
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

/**
 * POST /api/auth/forgot-password
 * Send OTP for password reset
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists — return success either way
      return res.status(200).json({ message: "If this email is registered, you will receive a reset code" });
    }

    // Remove any previous reset OTP for this email
    await Otp.deleteMany({ email: email.toLowerCase(), purpose: "password-reset" });

    const otp = generateOTP();

    await Otp.create({
      email: email.toLowerCase(),
      otp,
      purpose: "password-reset",
    });

    // Send password reset OTP via email
    await sendPasswordResetOTP(email.toLowerCase(), otp);
    console.log(`🔑 Password reset OTP sent to ${email}`);

    res.status(200).json({
      message: "Reset code sent to your email",
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ message: "Failed to send reset code" });
  }
};

/**
 * POST /api/auth/reset-password
 * Verify OTP and set new password
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      purpose: "password-reset",
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Reset code expired or not found. Please request a new one." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;
    await user.save();

    // Clean up OTP
    await Otp.deleteMany({ email: email.toLowerCase(), purpose: "password-reset" });

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

/**
 * DELETE /api/auth/me
 * Delete the logged-in user's own account
 */
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.user._id);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("deleteAccount error:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
};
