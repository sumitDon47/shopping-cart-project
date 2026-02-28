import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  payOrder,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All order routes require authentication
router.use(protect);

router.post("/",        createOrder);
router.get("/myorders", getMyOrders);
router.get("/:id",      getOrderById);

// Admin
router.get("/",               authorize("admin"), getAllOrders);
router.put("/:id/status",     authorize("admin"), updateOrderStatus);
router.put("/:id/pay",        payOrder);

export default router;
