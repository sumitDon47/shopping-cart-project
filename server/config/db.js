import mongoose from "mongoose";
import dns from "node:dns";

// Use Google DNS so SRV look-ups work even when the local
// router / ISP DNS can't resolve MongoDB Atlas SRV records.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing in .env");

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}
