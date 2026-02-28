import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  name:  { type: String },
  otp:   { type: String, required: true },
  purpose: { type: String, enum: ['registration', 'password-reset'], default: 'registration' },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 min
  },
});

// Auto-delete expired OTPs via TTL index
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Ensure one OTP per email
otpSchema.index({ email: 1 });

export default mongoose.model("Otp", otpSchema);
