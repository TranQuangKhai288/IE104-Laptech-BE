import Order from "../models/order.js";
import Product from "../models/product.js";

export const createOrder = async (orderData, userId) => {
  try {
    const { items, shippingAddress, paymentMethod, notes, couponCode } =
      orderData;

    // Calculate prices
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingFee = 0; // TODO: Calculate based on address and weight
    const discount = 0; // TODO: Apply coupon logic
    const total = subtotal + shippingFee - discount;

    // Create order with calculated values
    const order = await Order.create({
      userId,
      items,
      shippingAddress,
      paymentMethod,
      notes,
      couponCode,
      subtotal,
      shippingFee,
      discount,
      total,
    });

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Error creating order");
  }
};

export const getUserOrders = async (userId, query = {}) => {
  try {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const findQuery = { userId };
    if (status) findQuery.status = status;

    const orders = await Order.find(findQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(findQuery);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error getting user orders:", error);
    throw new Error("Error getting user orders");
  }
};

export const getOrderById = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    return order;
  } catch (error) {
    console.error("Error getting order:", error);
    throw new Error("Error getting order");
  }
};

export const updateOrderStatus = async (orderId, { status, note }, userId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    await order.addStatusHistory(status, note, userId);

    // Additional actions based on status
    switch (status) {
      case "cancelled":
        order.cancelReason = note;
        order.cancelledAt = new Date();
        break;
      case "delivered":
        order.deliveredAt = new Date();
        break;
      case "paid":
        order.paymentStatus = "paid";
        order.paymentDetails.paymentTime = new Date();
        break;
    }

    await order.save();
    return order;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error("Error updating order status");
  }
};

export const getAllOrders = async (query = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      startDate,
      endDate,
      search,
    } = query;

    const findQuery = {};
    if (status) findQuery.status = status;
    if (paymentStatus) findQuery.paymentStatus = paymentStatus;
    if (startDate && endDate) {
      findQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (search) {
      findQuery.$or = [
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { trackingNumber: { $regex: search, $options: "i" } },
        { couponCode: { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(findQuery)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments(findQuery);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error getting all orders:", error);
    throw new Error("Error getting all orders");
  }
};

export const getOrderStats = async (startDate, endDate) => {
  try {
    const stats = await Promise.all([
      Order.getRevenue(new Date(startDate), new Date(endDate)),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
            total: { $sum: "$total" },
          },
        },
      ]),
    ]);

    return {
      revenue: stats[0][0],
      statusBreakdown: stats[1],
      paymentMethodBreakdown: stats[2],
    };
  } catch (error) {
    console.error("Error getting order stats:", error);
    throw new Error("Error getting order stats");
  }
};
