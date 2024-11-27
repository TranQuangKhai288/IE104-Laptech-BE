import mongoose from "mongoose";
import Order from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js";

/**
 * Lấy doanh thu tổng hợp trong khoảng thời gian.
 * @param {Object} params - Tham số bao gồm startDate và endDate.
 * @returns {Object} Doanh thu tổng hợp.
 */
export const getRevenue = async ({ startDate, endDate }) => {
  try {
    const startDateCurrent = new Date(
      startDate || new Date(new Date().setMonth(new Date().getMonth() - 1))
    );
    const endDateCurrent = new Date(endDate || Date.now());

    const startDatePrevious = new Date(
      new Date(startDateCurrent).setMonth(startDateCurrent.getMonth() - 1)
    );
    const endDatePrevious = new Date(
      new Date(endDateCurrent).setMonth(endDateCurrent.getMonth() - 1)
    );

    // Lấy doanh thu cho khoảng thời gian hiện tại
    const currentRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDateCurrent,
            $lte: endDateCurrent,
          },
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

    // Lấy doanh thu cho khoảng thời gian trước đó
    const previousRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDatePrevious,
            $lte: endDatePrevious,
          },
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

    const current = currentRevenue[0] || {
      totalRevenue: 0,
      ordersCount: 0,
      averageOrderValue: 0,
    };
    const previous = previousRevenue[0] || {
      totalRevenue: 0,
      ordersCount: 0,
      averageOrderValue: 0,
    };

    return {
      current,
      previous,
      revenueDifference: {
        totalRevenue: current.totalRevenue - previous.totalRevenue,
        ordersCount: current.ordersCount - previous.ordersCount,
        averageOrderValue:
          current.averageOrderValue - previous.averageOrderValue,
      },
    };
  } catch (error) {
    throw new Error("Lỗi khi tính doanh thu: " + error.message);
  }
};

/**
 * Lấy doanh thu hàng ngày trong khoảng thời gian.
 * @param {Number} days - Số ngày muốn lấy dữ liệu (mặc định là 30).
 * @returns {Array} Doanh thu hàng ngày.
 */
export const getDailyRevenue = async (days = 30) => {
  try {
    const today = new Date();
    const startDateCurrent = new Date(today.setDate(today.getDate() - days));
    const endDateCurrent = new Date();

    const startDatePrevious = new Date(
      new Date(startDateCurrent).setDate(startDateCurrent.getDate() - days)
    );
    const endDatePrevious = new Date(
      new Date(endDateCurrent).setDate(endDateCurrent.getDate() - days)
    );

    // Lấy doanh thu cho khoảng thời gian hiện tại
    const dailyRevenueCurrent = await Order.aggregate([
      {
        $match: {
          status: { $in: ["delivered", "completed"] },
          createdAt: { $gte: startDateCurrent, $lte: endDateCurrent },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$total" },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Lấy doanh thu cho khoảng thời gian trước đó
    const dailyRevenuePrevious = await Order.aggregate([
      {
        $match: {
          status: { $in: ["delivered", "completed"] },
          createdAt: { $gte: startDatePrevious, $lte: endDatePrevious },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$total" },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      current: dailyRevenueCurrent,
      previous: dailyRevenuePrevious,
      revenueDifference: calculateRevenueDifference(
        dailyRevenueCurrent,
        dailyRevenuePrevious
      ),
    };
  } catch (error) {
    throw new Error("Lỗi khi tính doanh thu hàng ngày: " + error.message);
  }
};

const calculateRevenueDifference = (current, previous) => {
  const result = [];
  const currentMap = current.reduce((acc, item) => {
    acc[item._id] = item;
    return acc;
  }, {});

  previous.forEach((item) => {
    const currentItem = currentMap[item._id];
    const diff = {
      date: item._id,
      revenueDiff: currentItem
        ? currentItem.totalRevenue - item.totalRevenue
        : -item.totalRevenue,
      ordersCountDiff: currentItem
        ? currentItem.ordersCount - item.ordersCount
        : -item.ordersCount,
    };
    result.push(diff);
  });

  return result;
};

/**
 * Lấy doanh thu hàng tháng trong khoảng thời gian.
 * @param {Number} months - Số tháng muốn lấy dữ liệu (mặc định là 12).
 * @returns {Array} Doanh thu hàng tháng.
 */
export const getMonthlyRevenue = async (months = 12) => {
  try {
    const today = new Date();
    const startDateCurrent = new Date(
      today.setFullYear(today.getFullYear() - Math.floor(months / 12))
    );
    const endDateCurrent = new Date();

    const startDatePrevious = new Date(
      new Date(startDateCurrent).setMonth(startDateCurrent.getMonth() - months)
    );
    const endDatePrevious = new Date(
      new Date(endDateCurrent).setMonth(endDateCurrent.getMonth() - months)
    );

    // Lấy doanh thu cho khoảng thời gian hiện tại
    const monthlyRevenueCurrent = await Order.aggregate([
      {
        $match: {
          status: { $in: ["delivered", "completed"] },
          createdAt: { $gte: startDateCurrent, $lte: endDateCurrent },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalRevenue: { $sum: "$total" },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Lấy doanh thu cho khoảng thời gian trước đó
    const monthlyRevenuePrevious = await Order.aggregate([
      {
        $match: {
          status: { $in: ["delivered", "completed"] },
          createdAt: { $gte: startDatePrevious, $lte: endDatePrevious },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalRevenue: { $sum: "$total" },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      current: monthlyRevenueCurrent,
      previous: monthlyRevenuePrevious,
      revenueDifference: calculateRevenueDifference(
        monthlyRevenueCurrent,
        monthlyRevenuePrevious
      ),
    };
  } catch (error) {
    throw new Error("Lỗi khi tính doanh thu hàng tháng: " + error.message);
  }
};

/**
 * Lấy các sản phẩm bán chạy nhất.
 * @param {Object} params - Tham số bao gồm limit.
 * @returns {Array} Danh sách sản phẩm bán chạy nhất.
 */
export const getTopSellingProducts = async ({ limit = 10 }) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 1,
          name: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          productDetails: {
            name: 1,
            brand: 1,
            category: 1,
            price: 1,
            images: 1,
          },
        },
      },
    ]);

    return topProducts;
  } catch (error) {
    throw new Error("Lỗi lấy sản phẩm bán chạy: " + error.message);
  }
};

/**
 * Lấy các sản phẩm sắp hết hàng.
 * @param {Object} params - Tham số bao gồm threshold.
 * @returns {Array} Danh sách sản phẩm sắp hết hàng.
 */
export const getLowStockProducts = async ({ threshold = 10 }) => {
  try {
    const lowStockProducts = await Product.find({
      stock: { $lt: Number(threshold) },
    })
      .select("name brand stock category images price")
      .sort({ stock: 1 });

    return lowStockProducts;
  } catch (error) {
    throw new Error("Lỗi lấy sản phẩm sắp hết hàng: " + error.message);
  }
};

/**
 * Lấy phân phối danh mục sản phẩm.
 * @returns {Array} Phân phối danh mục sản phẩm.
 */
export const getProductCategoryDistribution = async () => {
  try {
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          totalValue: { $sum: { $multiply: ["$stock", "$price"] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return categoryDistribution;
  } catch (error) {
    throw new Error("Lỗi phân phối danh mục sản phẩm: " + error.message);
  }
};

/**
 * Lấy phân phối trạng thái đơn hàng.
 * @returns {Array} Phân phối trạng thái đơn hàng.
 */
export const getOrderStatusDistribution = async () => {
  try {
    const statusDistribution = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return statusDistribution;
  } catch (error) {
    throw new Error("Lỗi phân phối trạng thái đơn hàng: " + error.message);
  }
};

/**
 * Lấy phân phối phương thức thanh toán.
 * @returns {Array} Phân phối phương thức thanh toán.
 */
export const getPaymentMethodDistribution = async () => {
  try {
    const paymentDistribution = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return paymentDistribution;
  } catch (error) {
    throw new Error("Lỗi phân phối phương thức thanh toán: " + error.message);
  }
};

export const getAverageOrderValue = async () => {
  try {
    const averageOrderValue = await Order.aggregate([
      { $group: { _id: null, avgOrderValue: { $avg: "$total" } } },
    ]);
    return averageOrderValue[0]?.avgOrderValue || 0;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getNewCustomers = async () => {
  try {
    const past30Days = new Date();
    past30Days.setDate(past30Days.getDate() - 30);

    const newCustomersCount = await User.countDocuments({
      createdAt: { $gte: past30Days },
    });

    return newCustomersCount;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getTopBuyingCustomers = async () => {
  try {
    const topBuyingCustomers = await Order.aggregate([
      { $group: { _id: "$userId", totalSpent: { $sum: "$total" } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $project: {
          _id: 0,
          customerId: "$customer._id",
          name: "$customer.name",
          email: "$customer.email",
          avatar: "$customer.avatar",
          totalSpent: 1,
        },
      },
    ]);

    return topBuyingCustomers;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getCustomerLocationDistribution = async () => {
  try {
    const locationDistribution = await User.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $project: { _id: 0, location: "$_id", count: 1 } },
    ]);

    return locationDistribution;
  } catch (error) {
    throw new Error(error.message);
  }
};
