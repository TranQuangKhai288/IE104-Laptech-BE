import mongoose from "mongoose";

const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        _id: false, // Remove the _id field
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        // Store basic product info to avoid constant population
        image: String,
        specifications: {
          color: String,
          size: String,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
cartSchema.index({ userId: 1, status: 1 });
cartSchema.index({ lastActive: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }); // Automatically delete after 7 days of inactivity

// Middleware to automatically update totalPrice
cartSchema.pre("save", function (next) {
  this.totalPrice = this.products.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  this.lastActive = new Date();
  next();
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
