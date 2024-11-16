import * as ProductService from "../services/product.js";
import { validateProductInput, validateObjectId } from "../utils/validation.js";

const createProduct = async (req, res) => {
  try {
    // Validate required fields including subCategory for laptops
    const validationError = validateProductInput(req.body);
    if (validationError) {
      return res.status(400).json({
        status: "ERR",
        message: validationError.message,
        details: validationError.details,
      });
    }

    // Additional validation for subCategory
    if (req.body.category === "laptop" && !req.body.subCategory) {
      return res.status(400).json({
        status: "ERR",
        message: "Validation error",
        details: "subCategory is required for laptop category",
      });
    }

    const product = await ProductService.createProduct(req.body);

    if (typeof product === "string") {
      return res.status(400).json({ status: "ERR", message: product });
    }

    return res.status(201).json({
      status: "OK",
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Internal server error",
      details: error.message,
    });
  }
};

const createBulkProducts = async (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid request body",
        details: "Request body must be an array of products",
      });
    }

    // Validate subCategory for all laptop products in the array
    const validationErrors = products
      .map((product, index) => {
        if (product.category === "laptop" && !product.subCategory) {
          return `Product at index ${index}: subCategory is required for laptop category`;
        }
        return null;
      })
      .filter((error) => error !== null);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "ERR",
        message: "Validation error",
        details: validationErrors,
      });
    }

    const createdProducts = await ProductService.createBulkProducts(products);
    return res.status(201).json({
      status: "OK",
      message: "Products created successfully",
      data: createdProducts,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Internal server error",
      details: error.message,
    });
  }
};
const getProducts = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      isFeatured,
      brand,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {};

    if (category) filters.category = category;
    if (subCategory) filters.subCategory = subCategory;
    if (brand) filters.brand = brand;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }
    if (search) filters.search = search;
    if (sort) filters.sort = sort;
    if (isFeatured) filters.isFeatured = isFeatured;

    const products = await ProductService.getProducts(filters, page, limit);
    return res.status(200).json({
      status: "OK",
      data: products.data,
      count: products.count,
      totalPages: products.totalPages,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Failed to fetch products",
      details: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Invalid product ID format" });
    }

    const product = await ProductService.getProductById(id);

    if (typeof product === "string") {
      return res.status(404).json({ status: "ERR", message: product });
    }

    return res.status(200).json({ status: "OK", data: product });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Failed to fetch product",
      details: error.message,
    });
  }
};

const getAllCategory = async (req, res) => {
  try {
    const categories = await ProductService.getAllCategory();
    return res.status(200).json({ status: "OK", data: categories });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Failed to fetch product",
      details: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Invalid product ID format" });
    }

    const validationError = validateProductInput(req.body, true); // 'true' for update mode (allows partial data)
    if (validationError) {
      return res.status(400).json({
        status: "ERR",
        message: validationError.message,
        details: validationError.details,
      });
    }

    const product = await ProductService.updateProduct(id, req.body);

    if (typeof product === "string") {
      return res.status(404).json({ status: "ERR", message: product });
    }

    return res.status(200).json({
      status: "OK",
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Failed to update product",
      details: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Invalid product ID format" });
    }

    const result = await ProductService.deleteProduct(id);

    if (typeof result === "string") {
      return res.status(404).json({ status: "ERR", message: result });
    }

    return res
      .status(200)
      .json({ status: "OK", message: "Product deleted successfully" });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Failed to delete product",
      details: error.message,
    });
  }
};

export default {
  createProduct,
  createBulkProducts,
  getProducts,
  getProductById,
  getAllCategory,
  updateProduct,
  deleteProduct,
};
