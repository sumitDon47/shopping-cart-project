import express from "express";
import {
  sendOTP,
  resendOTP,
  verifyOTP,
  login,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/send-otp",   sendOTP);
router.post("/resend-otp",  resendOTP);
router.post("/verify-otp",  verifyOTP);
router.post("/login",       login);

// Protected
router.get("/me",       protect, getMe);
router.put("/profile",  protect, updateProfile);

export default router;
