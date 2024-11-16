import express from "express";
import orderController from "../controllers/order.js";
import {
  authAdminMiddleWare,
  authUserMiddleWare,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/", authUserMiddleWare, orderController.createOrder);
router.get("/my-orders", authUserMiddleWare, orderController.getUserOrders);
router.get("/:orderId", authUserMiddleWare, orderController.getOrderById);

// Admin routes
router.get(
  "/",
  //  authAdminMiddleWare,
  orderController.getAllOrders
);
router.get("/status", authAdminMiddleWare, orderController.getOrderStats);
//Cập nhật trạng thái đơn hàng
router.patch(
  "/:orderId/status",
  authAdminMiddleWare,
  orderController.updateOrderStatus
);

export default router;
