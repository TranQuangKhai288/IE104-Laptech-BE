import * as dashboardService from "../services/dashboard.js";

const getRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const revenueData = await dashboardService.getRevenue({
      startDate,
      endDate,
    });

    return res.status(200).json({
      status: "OK",
      data: revenueData,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

/**
 * Lấy doanh thu hàng ngày.
 */
const getDailyRevenue = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dailyRevenue = await dashboardService.getDailyRevenue(Number(days));

    return res.status(200).json({
      status: "OK",
      data: dailyRevenue,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

/**
 * Lấy doanh thu hàng tháng.
 */
const getMonthlyRevenue = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const monthlyRevenue = await dashboardService.getMonthlyRevenue(
      Number(months)
    );

    return res.status(200).json({
      status: "OK",
      data: monthlyRevenue,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

/**
 * Lấy sản phẩm bán chạy nhất.
 */
const getTopSellingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topProducts = await dashboardService.getTopSellingProducts({
      limit: Number(limit),
    });

    return res.status(200).json({
      status: "OK",
      data: topProducts,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

/**
 * Lấy sản phẩm sắp hết hàng.
 */
const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const lowStockProducts = await dashboardService.getLowStockProducts({
      threshold: Number(threshold),
    });

    return res.status(200).json({
      status: "OK",
      data: lowStockProducts,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

/**
 * Lấy phân phối danh mục sản phẩm.
 */
const getProductCategoryDistribution = async (req, res) => {
  try {
    const categoryDistribution =
      await dashboardService.getProductCategoryDistribution();

    return res.status(200).json({
      status: "OK",
      data: categoryDistribution,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

/**
 * Lấy phân phối trạng thái đơn hàng.
 */
const getOrderStatusDistribution = async (req, res) => {
  try {
    const statusDistribution =
      await dashboardService.getOrderStatusDistribution();

    return res.status(200).json({
      status: "OK",
      data: statusDistribution,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

/**
 * Lấy phân phối phương thức thanh toán.
 */
const getPaymentMethodDistribution = async (req, res) => {
  try {
    const paymentDistribution =
      await dashboardService.getPaymentMethodDistribution();

    return res.status(200).json({
      status: "OK",
      data: paymentDistribution,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

const getAverageOrderValue = async (req, res) => {
  // try {
  //   const averageOrderValue = await Order.aggregate([
  //     {
  //       $match: {
  //         status: { $in: ["delivered", "completed"] },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         averageValue: { $avg: "$total" },
  //         maxValue: { $max: "$total" },
  //         minValue: { $min: "$total" },
  //       },
  //     },
  //   ]);

  //   return res.status(200).json({
  //     status: "OK",
  //     data: averageOrderValue[0],
  //   });
  // } catch (error) {
  //   return res.status(500).json({
  //     status: "ERR",
  //     message: "Lỗi tính giá trị trung bình đơn hàng",
  //     details: error.message,
  //   });
  // }

  try {
    const averageOrderValue = await dashboardService.getAverageOrderValue();
    res.status(200).json({
      status: "success",
      data: {
        averageOrderValue,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getNewCustomers = async (req, res) => {
  // try {
  //   const { days = 30 } = req.query;
  //   const newCustomers = await User.aggregate([
  //     {
  //       $match: {
  //         createdAt: {
  //           $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
  //         },
  //         isAdmin: false,
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "orders",
  //         localField: "_id",
  //         foreignField: "userId",
  //         as: "orders",
  //       },
  //     },
  //     {
  //       $addFields: {
  //         totalOrders: { $size: "$orders" },
  //         totalSpent: { $sum: "$orders.total" },
  //       },
  //     },
  //     {
  //       $project: {
  //         name: 1,
  //         email: 1,
  //         createdAt: 1,
  //         totalOrders: 1,
  //         totalSpent: 1,
  //       },
  //     },
  //   ]);

  //   return res.status(200).json({
  //     status: "OK",
  //     data: newCustomers,
  //   });
  // } catch (error) {
  //   return res.status(500).json({
  //     status: "ERR",
  //     message: "Lỗi lấy khách hàng mới",
  //     details: error.message,
  //   });
  // }

  try {
    const newCustomers = await dashboardService.getNewCustomers();
    res.status(200).json({
      status: "success",
      data: {
        newCustomers,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getTopBuyingCustomers = async (req, res) => {
  // try {
  //   const { limit = 10 } = req.query;
  //   const topCustomers = await Order.aggregate([
  //     {
  //       $group: {
  //         _id: "$userId",
  //         totalOrders: { $sum: 1 },
  //         totalSpent: { $sum: "$total" },
  //       },
  //     },
  //     { $sort: { totalSpent: -1 } },
  //     { $limit: Number(limit) },
  //     {
  //       $lookup: {
  //         from: "users",
  //         localField: "_id",
  //         foreignField: "_id",
  //         as: "userDetails",
  //       },
  //     },
  //     { $unwind: "$userDetails" },
  //   ]);

  //   return res.status(200).json({
  //     status: "OK",
  //     data: topCustomers,
  //   });
  // } catch (error) {
  //   return res.status(500).json({
  //     status: "ERR",
  //     message: "Lỗi lấy khách hàng mua nhiều nhất",
  //     details: error.message,
  //   });
  // }

  try {
    const topBuyingCustomers = await dashboardService.getTopBuyingCustomers();
    res.status(200).json({
      status: "success",
      data: topBuyingCustomers,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getCustomerLocationDistribution = async (req, res) => {
  // try {
  //   const locationDistribution = await User.aggregate([
  //     {
  //       $group: {
  //         _id: "$addresses.state",
  //         count: { $sum: 1 },
  //       },
  //     },
  //   ]);

  //   return res.status(200).json({
  //     status: "OK",
  //     data: locationDistribution,
  //   });
  // } catch (error) {
  //   return res.status(500).json({
  //     status: "ERR",
  //     message: "Lỗi phân phối địa lý khách hàng",
  //     details: error.message,
  //   });
  // }

  try {
    const locationDistribution =
      await dashboardService.getCustomerLocationDistribution();
    res.status(200).json({
      status: "success",
      data: locationDistribution,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export default {
  getRevenue,
  getDailyRevenue,
  getMonthlyRevenue,

  getTopSellingProducts,
  getLowStockProducts,
  getProductCategoryDistribution,
  getOrderStatusDistribution,
  getPaymentMethodDistribution,

  getAverageOrderValue,
  getNewCustomers,
  getTopBuyingCustomers,
  getCustomerLocationDistribution,
};
