import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";

dotenv.config();
await connectDB();

const sample = [
  { name: "Wireless Mouse", price: 19.99, image: "https://via.placeholder.com/240?text=Mouse", stock: 30 },
  { name: "Mechanical Keyboard", price: 59.99, image: "https://via.placeholder.com/240?text=Keyboard", stock: 20 },
  { name: "USB-C Cable", price: 9.99, image: "https://via.placeholder.com/240?text=Cable", stock: 100 },
  { name: "Bluetooth Headphones", price: 39.99, image: "https://via.placeholder.com/240?text=Headphones", stock: 25 },
  { name: "Laptop Stand", price: 24.99, image: "https://via.placeholder.com/240?text=Stand", stock: 40 },
];

try {
  await Product.deleteMany({});
  await Product.insertMany(sample);
  console.log("✅ Seed complete");
  process.exit(0);
} catch (e) {
  console.error("❌ Seed failed:", e.message);
  process.exit(1);
}
