import Cart from "../models/cart.js";
import Product from "../models/product.js";

export const getActiveCart = async (userId) => {
  try {
    let cart = await Cart.findOne({
      userId,
      status: "active",
    }).populate("products.productId", "name price stock images");

    if (!cart) {
      cart = await Cart.create({
        userId,
        products: [],
        totalPrice: 0,
        status: "active",
      });
    }

    return cart;
  } catch (error) {
    console.error("Service Error - Get Active Cart:", error);
    throw error;
  }
};

export const addToCart = async (userId, productId, quantity) => {
  try {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return "Product not found";
    }

    // Check stock quantity
    if (product.stock < quantity) {
      return `Only ${product.stock} items available`;
    }

    let cart = await Cart.findOne({ userId, status: "active" });

    if (!cart) {
      // Create a new cart if none exists
      cart = new Cart({
        userId,
        products: [],
        totalPrice: 0,
        status: "active",
      });
    }

    // Check if the product already exists in the cart
    const existingProductIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId //Kiểm tra sản phẩm có trong card hay không
    );

    if (existingProductIndex > -1) {
      // Update quantity if the product is already in the cart
      const newQuantity =
        cart.products[existingProductIndex].quantity + quantity;

      if (newQuantity > product.stock) {
        return `Cannot add more items. Only ${product.stock} items available`;
      }

      cart.products[existingProductIndex].quantity = newQuantity;
      cart.products[existingProductIndex].subtotal =
        newQuantity * product.price;
    } else {
      // Add a new product to the cart
      cart.products.push({
        productId: product._id,
        name: product.name,
        quantity,
        price: product.price,
        subtotal: quantity * product.price,
      });
    }

    // Automatically update totalPrice through middleware
    await cart.save();
    const populatedCart = await cart.populate("products.productId");

    return populatedCart;
  } catch (error) {
    console.error("Service Error - Add to Cart:", error);
    throw error;
  }
};

export const updateCartItem = async (userId, productId, quantity) => {
  try {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return "Product not found";
    }

    // Check stock quantity
    if (product.stock < quantity) {
      return `Only ${product.stock} items available`;
    }

    const cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      return "Cart not found";
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return "Product not found in cart";
    }

    // Update quantity and subtotal
    cart.products[productIndex].quantity = quantity;
    cart.products[productIndex].price = product.price; // Update to the latest price
    cart.products[productIndex].subtotal = quantity * product.price;

    // Automatically update totalPrice through middleware
    await cart.save();
    return cart;
  } catch (error) {
    console.error("Service Error - Update Cart Item:", error);
    throw error;
  }
};

export const removeFromCart = async (userId, productId) => {
  try {
    const cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      return "Cart not found";
    }

    const productIndex = cart.products.findIndex((item) => {
      return item.productId.toString() === productId.toString();
    });

    if (productIndex === -1) {
      return "Product not found in cart";
    }

    cart.products.splice(productIndex, 1);

    // Automatically update totalPrice through middleware
    await cart.save();
    const populatedCart = await cart.populate("products.productId");

    return populatedCart;
  } catch (error) {
    console.error("Service Error - Remove From Cart:", error);
    throw error;
  }
};

export const clearCart = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      return "Cart not found";
    }

    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();
    return true;
  } catch (error) {
    console.error("Service Error - Clear Cart:", error);
    throw error;
  }
};
