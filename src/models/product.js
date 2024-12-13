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
    price: { type: Number, required: true },
    starting_price: { type: Number },
    sale_percentage: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    images: [{ type: String, required: true }],
    colors: [
      {
        title: { type: String, required: true },
        hex: { type: String, required: true },
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
          ],
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    gift_value: { type: String, default: "" },
    averageRating: { type: Number, default: 0 }, // Điểm đánh giá trung bình
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", category: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
