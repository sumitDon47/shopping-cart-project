import express from "express";
import {
  getProducts,
  getTopProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",           getProducts);
router.get("/top",        getTopProducts);
router.get("/categories", getCategories);
router.get("/:id",        getProductById);

// Admin only
router.post("/",          protect, authorize("admin"), createProduct);
router.put("/:id",        protect, authorize("admin"), updateProduct);
router.delete("/:id",     protect, authorize("admin"), deleteProduct);

// Authenticated users
router.post("/:id/reviews", protect, addReview);

export default router;
