import mongoose from "mongoose";

const { Schema } = mongoose;

// Schema for each product in the order
const orderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: String,
  // Store product specifications at the time of order
  specifications: {
    cpu: String,
    ram: String,
    storage: String,
    color: String,
  },
});

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: [
        "pending", // Waiting for confirmation
        "confirmed", // Confirmed
        "processing", // Processing
        "shipping", // Shipping
        "delivered", // Delivered
        "cancelled", // Cancelled
        "refunded", // Refunded
      ],
      default: "pending",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: "Vietnam" },
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "banking", "credit_card", "momo", "zalopay"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentDetails: {
      transactionId: String,
      paymentTime: Date,
      bank: String,
      cardLastFour: String,
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    couponCode: String,
    notes: String,
    trackingNumber: String,
    cancelReason: String,
    cancelledAt: Date,
    deliveredAt: Date,
    // Store status change history
    statusHistory: [
      {
        status: String,
        date: Date,
        note: String,
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for optimizing queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "items.productId": 1 });

// Middleware to update product quantity after placing an order
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Only run when creating a new order
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const Product = mongoose.model("Product");

      // Update stock for each product
      for (const item of this.items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        product.stock -= item.quantity;
        await product.save({ session });
      }

      await session.commitTransaction();
      next();
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  } else {
    next();
  }
});

// Static method to calculate revenue
orderSchema.statics.getRevenue = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ["delivered", "completed"] },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" },
        ordersCount: { $sum: 1 },
        averageOrderValue: { $avg: "$total" },
      },
    },
  ]);
};

// Instance method to add status to history
orderSchema.methods.addStatusHistory = function (status, note, userId) {
  this.statusHistory.push({
    status,
    date: new Date(),
    note,
    updatedBy: userId,
  });
  this.status = status;
  return this.save();
};

const Order = mongoose.model("Order", orderSchema);
export default Order;
