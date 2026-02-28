import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    mrp:         { type: Number, required: true, min: 0 },
    price:       { type: Number, required: true, min: 0 },
    image:       { type: String, default: "" },
    category:    { type: String, default: "General", trim: true },
    brand:       { type: String, default: "", trim: true },
    stock:       { type: Number, default: 50, min: 0 },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    numReviews:  { type: Number, default: 0 },
    reviews:     [reviewSchema],
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

export default mongoose.model("Product", productSchema);
