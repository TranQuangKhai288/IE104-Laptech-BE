import Order from "../models/order.js";
import Product from "../models/product.js";
import Cart from "../models/cart.js";

export const createOrder = async (orderData, userId) => {
  // Thêm userId parameter
  try {
    // Validate và lấy thông tin products
    const productPromises = orderData.items.map(async (item) => {
      const product = await Product.findById(item.productId._id).lean();
      if (!product) {
        throw new Error(`Product not found with id: ${item.productId}`);
      }
      return {
        product,
        quantity: item.quantity,
      };
    });

    const productsWithQuantity = await Promise.all(productPromises);

    // Tính toán subtotal và total
    const subtotal = productsWithQuantity.reduce(
      (sum, { product, quantity }) => {
        return sum + product.price * quantity;
      },
      0
    );

    // Tính total (có thể thêm logic xử lý mã giảm giá và phí vận chuyển ở đây)
    let total = subtotal;

    // Nếu có coupon, xử lý giảm giá
    if (orderData.couponCode) {
      // Thêm logic xử lý coupon ở đây
      // Ví dụ: total = subtotal * (1 - discountPercentage);
    }

    // Tạo order mới với đầy đủ thông tin
    const order = new Order({
      userId: userId, // Từ parameter
      items: productsWithQuantity.map(({ product, quantity }) => ({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        images: product.images,
        specifications: {
          cpu:
            product.specifications.find((spec) => spec.type === "CPU")
              ?.description || "",
          ram:
            product.specifications.find((spec) => spec.type === "RAM")
              ?.description || "",
          storage:
            product.specifications.find((spec) => spec.type === "Storage")
              ?.description || "",
          color: "", // Có thể thêm logic để lấy màu từ product
        },
      })),
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
      couponCode: orderData.couponCode,
      subtotal: subtotal,
      total: total,
      status: "pending", // Thêm status mặc định nếu cần
    });

    //sau khi tạo order, trừ số lượng sản phẩm trong kho và xoá giỏ hàng
    //tìm tất cả sản phẩm trong giỏ hàng của user này
    await Cart.findOneAndUpdate(
      { userId, status: "active" },
      {
        products: [],
      }
    );
    //clear giỏ hàng

    return await order.save();
  } catch (error) {
    console.error("Service Error - Create Order:", error);
    throw error;
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

    console.log("Updating order status:", status, note, userId);

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
      .populate("userId", "_id avatar name email phone")
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
