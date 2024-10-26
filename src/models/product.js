import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["laptop", "pc", "phone", "accessory", "tablet", "other"],
      required: true,
    },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    images: [{ type: String, required: true }], // Array of image URLs
    specifications: {
      cpu: { type: String },
      ram: { type: String },
      storage: { type: String },
      screen: { type: String },
      gpu: { type: String },
      battery: { type: String },
      os: { type: String }, // Operating system
      weight: { type: String },
      dimensions: { type: String },
      color: { type: String },
      ports: { type: [String] }, // e.g., ["USB-C", "HDMI", "Ethernet"]
      additionalFeatures: { type: [String] }, // e.g., ["Fingerprint reader", "Backlit keyboard"]
    },
    reviews: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false }, // If the product is featured
  },
  { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", category: "text" }); // For search functionality

const Product = mongoose.model("Product", productSchema);

export default Product;
