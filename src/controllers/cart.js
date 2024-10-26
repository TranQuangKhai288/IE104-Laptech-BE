import * as CartService from "../services/cart.js"; // Thêm .js nếu cần thiết

const getCart = async (req, res) => {
  try {
    const userId = req.user._id; // Giả sử có middleware auth gán user vào req
    const cart = await CartService.getActiveCart(userId);

    return res.status(200).json({
      status: "OK",
      data: cart,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Failed to fetch cart",
      details: error.message,
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        status: "ERR",
        message: "ProductId and quantity are required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        status: "ERR",
        message: "Quantity must be at least 1",
      });
    }

    const result = await CartService.addToCart(userId, productId, quantity);

    if (typeof result === "string") {
      return res.status(400).json({
        status: "ERR",
        message: result,
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "Product added to cart successfully",
      data: result,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Failed to add product to cart",
      details: error.message,
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        status: "ERR",
        message: "ProductId and quantity are required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        status: "ERR",
        message: "Quantity must be at least 1",
      });
    }

    const result = await CartService.updateCartItem(
      userId,
      productId,
      quantity
    );

    if (typeof result === "string") {
      return res.status(400).json({
        status: "ERR",
        message: result,
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "Cart updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Failed to update cart",
      details: error.message,
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        status: "ERR",
        message: "ProductId is required",
      });
    }

    const result = await CartService.removeFromCart(userId, productId);

    if (typeof result === "string") {
      return res.status(400).json({
        status: "ERR",
        message: result,
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "Product removed from cart successfully",
      data: result,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Failed to remove product from cart",
      details: error.message,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await CartService.clearCart(userId);

    if (typeof result === "string") {
      return res.status(400).json({
        status: "ERR",
        message: result,
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Failed to clear cart",
      details: error.message,
    });
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
