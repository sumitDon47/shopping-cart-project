import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

dotenv.config();
await connectDB();

/* ── Admin credentials (hardcoded by developer) ─────────── */
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@shopcart.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const ADMIN_NAME     = "ShopCart Admin";

const sample = [
  // Electronics
  { name: "Wireless Bluetooth Earbuds Pro", description: "Premium wireless earbuds with active noise cancellation, 30-hour battery life, and crystal-clear audio. IPX5 water resistant.", mrp: 129.99, price: 79.99, image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&q=80", category: "Electronics", brand: "SoundMax", stock: 50, rating: 4.5, numReviews: 128 },
  { name: "Smart Watch Ultra", description: "Advanced fitness tracker with AMOLED display, GPS, heart rate monitor, blood oxygen sensor, and 7-day battery life.", mrp: 349.99, price: 249.99, image: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&q=80", category: "Electronics", brand: "TechFit", stock: 30, rating: 4.7, numReviews: 256 },
  { name: "Portable Bluetooth Speaker", description: "Waterproof portable speaker with 360° sound, deep bass, and 20-hour playtime. Perfect for outdoor adventures.", mrp: 79.99, price: 49.99, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80", category: "Electronics", brand: "BoomBox", stock: 75, rating: 4.3, numReviews: 95 },
  // Laptops
  { name: 'MacBook Pro 14" M3', description: "Powerful laptop with M3 Pro chip, 18GB RAM, 512GB SSD, Liquid Retina XDR display, and all-day battery life.", mrp: 2499.99, price: 1999.99, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", category: "Laptops", brand: "Apple", stock: 15, rating: 4.9, numReviews: 512 },
  { name: "Gaming Laptop RTX 4060", description: "High-performance gaming laptop with RTX 4060, 16GB RAM, 144Hz display, RGB keyboard, and advanced cooling system.", mrp: 1699.99, price: 1299.99, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80", category: "Laptops", brand: "ASUS", stock: 20, rating: 4.6, numReviews: 189 },
  // Headphones
  { name: "Over-Ear Studio Headphones", description: "Professional studio-quality headphones with Hi-Res audio, memory foam cushions, and foldable design.", mrp: 199.99, price: 149.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", category: "Headphones", brand: "AudioPro", stock: 40, rating: 4.4, numReviews: 167 },
  { name: "Noise Cancelling Headphones", description: "Wireless ANC headphones with 40-hour battery, multi-device connect, and premium comfort for all-day wear.", mrp: 399.99, price: 299.99, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80", category: "Headphones", brand: "Sony", stock: 35, rating: 4.8, numReviews: 342 },
  // Accessories
  { name: "Mechanical Gaming Keyboard", description: "RGB mechanical keyboard with hot-swappable switches, aluminum frame, programmable macros, and N-key rollover.", mrp: 129.99, price: 89.99, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&q=80", category: "Accessories", brand: "KeyMaster", stock: 60, rating: 4.5, numReviews: 203 },
  { name: "Ergonomic Wireless Mouse", description: "Precision wireless mouse with 16000 DPI sensor, ergonomic design, customizable buttons, and long battery life.", mrp: 89.99, price: 59.99, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80", category: "Accessories", brand: "Logitech", stock: 80, rating: 4.3, numReviews: 156 },
  { name: "USB-C Hub 7-in-1", description: "Versatile USB-C hub with HDMI 4K, USB 3.0 ports, SD card reader, and 100W power delivery pass-through.", mrp: 59.99, price: 39.99, image: "https://images.unsplash.com/photo-1625842268584-8f3296236571?w=400&q=80", category: "Accessories", brand: "Anker", stock: 100, rating: 4.6, numReviews: 89 },
  // Home
  { name: "LED Desk Lamp with Wireless Charger", description: "Modern desk lamp with adjustable color temperature, brightness levels, and built-in Qi wireless charging pad.", mrp: 69.99, price: 44.99, image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&q=80", category: "Home", brand: "LumiTech", stock: 45, rating: 4.2, numReviews: 73 },
  { name: "Smart Home Security Camera", description: "1080p HD security camera with night vision, two-way audio, motion detection, and cloud storage integration.", mrp: 99.99, price: 69.99, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80", category: "Home", brand: "GuardPro", stock: 55, rating: 4.1, numReviews: 112 },
  // Books
  { name: "Clean Code: A Handbook", description: "The definitive guide to writing clean, maintainable, and efficient code. A must-read for every software developer.", mrp: 49.99, price: 34.99, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80", category: "Books", brand: "O'Reilly", stock: 200, rating: 4.7, numReviews: 1024 },
  { name: "JavaScript: The Good Parts", description: "Discover the elegant parts of JavaScript and learn to write robust, clean code. Essential for web developers.", mrp: 44.99, price: 29.99, image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80", category: "Books", brand: "O'Reilly", stock: 150, rating: 4.5, numReviews: 687 },
  // Sports
  { name: "Yoga Mat Premium Non-Slip", description: "Extra thick eco-friendly yoga mat with alignment lines, carrying strap, and superior grip for all yoga styles.", mrp: 54.99, price: 34.99, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80", category: "Sports", brand: "ZenFit", stock: 90, rating: 4.4, numReviews: 145 },
  { name: "Adjustable Dumbbell Set", description: "Space-saving adjustable dumbbells from 5-52.5 lbs with quick-change weight system. Perfect for home workouts.", mrp: 279.99, price: 199.99, image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80", category: "Sports", brand: "IronGrip", stock: 25, rating: 4.6, numReviews: 78 },
];

try {
  // Seed products
  await Product.deleteMany({});
  await Product.insertMany(sample);
  console.log(`✅ Seeded ${sample.length} products`);

  // Seed admin user (upsert — won't duplicate)
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (!existing) {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
      isEmailVerified: true,
    });
    console.log(`✅ Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
  }

  process.exit(0);
} catch (e) {
  console.error("❌ Seed failed:", e.message);
  process.exit(1);
}
