import express from "express";
import dashboardController from "../controllers/dashboard.js";
import { authAdminMiddleWare } from "../middleware/authMiddleware.js";

const router = express.Router();

// Áp dụng middleware cho admin
router.use(authAdminMiddleWare);

// // Lấy báo cáo doanh thu trong khoảng thời gian
router.get("/revenue", dashboardController.getRevenue);
router.get("/revenue/daily", dashboardController.getDailyRevenue);
router.get("/revenue/monthly", dashboardController.getMonthlyRevenue);

router.get("/products/top-selling", dashboardController.getTopSellingProducts);
router.get("/products/low-stock", dashboardController.getLowStockProducts);
router.get(
  "/products/category-distribution",
  dashboardController.getProductCategoryDistribution
);

router.get("/orders/status", dashboardController.getOrderStatusDistribution);
router.get(
  "/orders/payment-methods",
  dashboardController.getPaymentMethodDistribution
);
router.get("/orders/average-value", dashboardController.getAverageOrderValue);

router.get("/customers/new", dashboardController.getNewCustomers);
router.get("/customers/top-buyers", dashboardController.getTopBuyingCustomers);
router.get(
  "/customers/location",
  dashboardController.getCustomerLocationDistribution
);

// router.get(
//   "/payments/success-rate",
//   dashboardController.getPaymentSuccessRate
// );
// router.get(
//   "/payments/refunds",
//   dashboardController.getRefundStatistics
// );
export default router;
