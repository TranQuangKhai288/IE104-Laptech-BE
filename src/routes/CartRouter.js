import express from "express";
import cartController from "../controllers/cart.js";
import { authUserMiddleWare } from "../middleware/authMiddleware.js"; // Assuming you have an authentication middleware

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authUserMiddleWare);

// Get the current user's cart
router.get("/", cartController.getCart);

// Add a product to the cart
router.post("/", cartController.addToCart);

// Update the quantity of a product in the cart
router.put("/", cartController.updateCartItem);

// Remove a product from the cart
router.delete("/:productId", cartController.removeFromCart);

// Clear the entire cart
router.delete("/clear", cartController.clearCart);

export default router;
