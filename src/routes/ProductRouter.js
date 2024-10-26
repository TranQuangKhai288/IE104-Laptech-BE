import express from "express";
import productController from "../controllers/product.js";

const router = express.Router();

// Create a new product
router.post("/", productController.createProduct);

// Create multiple products
router.post("/bulk", productController.createBulkProducts);

// Get all products
router.get("/", productController.getProducts);

// Get a product by ID
router.get("/:id", productController.getProductById);

// Update a product by ID
router.put("/:id", productController.updateProduct);

// Delete a product by ID
router.delete("/:id", productController.deleteProduct);

export default router;
