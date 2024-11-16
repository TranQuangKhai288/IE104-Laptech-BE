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
    subCategory: {
      type: String,
      enum: [
        "gaming",
        "office",
        "ultra-thin",
        "2-in-1",
        "workstation",
        "budget",
        "student",
        "business",
      ],
      required: function () {
        return this.category === "laptop";
      },
    },
    brand: { type: String, required: true },
    price: { type: Number, required: true }, // Original or base price
    starting_price: { type: String }, // Price after sale, as string for format flexibility
    sale_percentage: { type: Number, default: 0 }, // Sale discount percentage
    stock: { type: Number, required: true },
    images: [{ type: String, required: true }], // Array of image URLs
    colors: [
      {
        title: { type: String, required: true }, // Color name
        hex: { type: String, required: true }, // Hex code for the color
      },
    ],
    specifications: [
      {
        type: {
          type: String,
          required: true,
          enum: [
            "CPU",
            "RAM",
            "Storage",
            "Display",
            "Battery",
            "Camera",
            "OS",
            "GPU",
            "Connectivity",
            "Ports",
            "Audio",
            "Sensors",
            "Features",
          ],
        }, // e.g., "CPU", "RAM", etc.
        title: { type: String, required: true }, // Display title for the spec
        description: { type: String, required: true }, // Details of the spec
      },
    ],
    gift_value: { type: String, default: "" }, // Gift value if applicable
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

// For search functionality
productSchema.index({ name: "text", brand: "text", category: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
