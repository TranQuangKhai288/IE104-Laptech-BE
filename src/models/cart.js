import mongoose from "mongoose";
import Product from "./product.js";
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
cartSchema.pre("save", async function (next) {
  try {
    // Lấy danh sách các productId từ giỏ hàng
    const productIds = this.products.map((item) => item.productId);

    // Truy vấn tất cả các sản phẩm trong giỏ hàng một lần
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "price"
    );

    // Tạo một map để nhanh chóng tìm giá của từng sản phẩm
    const productPriceMap = new Map(
      products.map((product) => [product._id.toString(), product.price])
    );

    // Tính tổng giá dựa trên map
    this.totalPrice = this.products.reduce((total, item) => {
      const price = productPriceMap.get(item.productId.toString());
      if (!price) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      return total + price * item.quantity;
    }, 0);

    this.lastActive = new Date(); // Cập nhật thời gian hoạt động gần nhất
    next();
  } catch (error) {
    next(error); // Gửi lỗi tới middleware tiếp theo
  }
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
