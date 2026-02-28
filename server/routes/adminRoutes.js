import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getPaidOrders,
} from "../controllers/adminController.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/payments", getPaidOrders);

export default router;
