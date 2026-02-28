import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes    from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes    from "./routes/cartRoutes.js";
import orderRoutes   from "./routes/orderRoutes.js";
import adminRoutes   from "./routes/adminRoutes.js";
import errorHandler, { notFound } from "./middleware/errorMiddleware.js";

dotenv.config();
await connectDB();

const app = express();

// ── Security & parsing ─────────────────────────────────────
app.use(express.json({ limit: "10kb" }));           // limit body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Basic security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Simple rate-limiter (per IP, in-memory — use redis in production)
const rateMap = new Map();
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const maxRequests = 100;

  if (!rateMap.has(ip)) rateMap.set(ip, []);
  const timestamps = rateMap.get(ip).filter((t) => now - t < windowMs);
  timestamps.push(now);
  rateMap.set(ip, timestamps);

  if (timestamps.length > maxRequests) {
    return res.status(429).json({ message: "Too many requests — slow down" });
  }
  next();
});

// ── Health Check ───────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ── Routes ─────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/admin",    adminRoutes);

// ── Error Handling ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
