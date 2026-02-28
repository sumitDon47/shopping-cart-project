import express from "express";
import {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/khalti/initiate", initiateKhaltiPayment);
router.post("/khalti/verify",   verifyKhaltiPayment);

export default router;
