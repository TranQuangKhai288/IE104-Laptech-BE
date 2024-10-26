import * as OrderService from "../services/order.js";

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate required fields
    if (!items?.length || !shippingAddress || !paymentMethod) {
      return res.status(400).json({
        status: "ERR",
        message: "Missing required fields",
      });
    }

    // Validate shipping address
    const requiredAddressFields = [
      "fullName",
      "phone",
      "street",
      "city",
      "state",
      "postalCode",
    ];
    const missingFields = requiredAddressFields.filter(
      (field) => !shippingAddress[field]
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "ERR",
        message: `Missing required address fields: ${missingFields.join(", ")}`,
      });
    }

    const order = await OrderService.createOrder(req.body, req.user._id);

    return res.status(201).json({
      status: "OK",
      message: "ORDER_CREATED_SUCCESSFULLY",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const result = await OrderService.getUserOrders(req.user._id, req.query);

    return res.status(200).json({
      status: "OK",
      message: "SUCCESS",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await OrderService.getOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        status: "ERR",
        message: "Order not found",
      });
    }

    // Check if user owns this order or is admin
    if (
      order.userId.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        status: "ERR",
        message: "You don't have permission to view this order",
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "SUCCESS",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        status: "ERR",
        message: "Status is required",
      });
    }

    const order = await OrderService.updateOrderStatus(
      req.params.orderId,
      { status, note },
      req.user._id
    );

    return res.status(200).json({
      status: "OK",
      message: "ORDER_STATUS_UPDATED",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const result = await OrderService.getAllOrders(req.query);

    return res.status(200).json({
      status: "OK",
      message: "SUCCESS",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "ERR",
        message: "Start date and end date are required",
      });
    }

    const stats = await OrderService.getOrderStats(startDate, endDate);

    return res.status(200).json({
      status: "OK",
      message: "SUCCESS",
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

export default {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getOrderStats,
};
