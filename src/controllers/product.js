import * as ProductService from "../services/product.js";

const createProduct = async (req, res) => {
  try {
    // Validate required fields
    const { name, description, category, brand, price, stock, images } =
      req.body;

    if (
      !name ||
      !description ||
      !category ||
      !brand ||
      !price ||
      !stock ||
      !images
    ) {
      return res.status(400).json({
        status: "ERR",
        message: "Missing required fields",
        details: {
          name: !name ? "Name is required" : null,
          description: !description ? "Description is required" : null,
          category: !category ? "Category is required" : null,
          brand: !brand ? "Brand is required" : null,
          price: !price ? "Price is required" : null,
          stock: !stock ? "Stock is required" : null,
          images: !images ? "At least one image is required" : null,
        },
      });
    }

    // Validate category
    const validCategories = [
      "laptop",
      "pc",
      "phone",
      "accessory",
      "tablet",
      "other",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid category",
        details: `Category must be one of: ${validCategories.join(", ")}`,
      });
    }

    // Validate price and stock
    if (price < 0 || !Number.isInteger(price)) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid price",
        details: "Price must be a positive number",
      });
    }

    if (stock < 0 || !Number.isInteger(stock)) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid stock",
        details: "Stock must be a non-negative integer",
      });
    }

    const product = await ProductService.createProduct(req.body);

    if (typeof product === "string") {
      return res.status(400).json({
        status: "ERR",
        message: product,
      });
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

    const createdProducts = await ProductService.createBulkProducts(products);

    if (createdProducts instanceof Error) {
      return res.status(400).json({
        status: "ERR",
        message: createdProducts.message,
      });
    }

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
    // Add query parameters for filtering
    const { category, brand, minPrice, maxPrice, search } = req.query;
    const filters = {};

    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }
    if (search) filters.search = search;

    const products = await ProductService.getProducts(filters);
    return res.status(200).json({
      status: "OK",
      data: products,
      count: products.length,
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

    // if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    //   return res.status(400).json({
    //     status: "ERR",
    //     message: "Invalid product ID format",
    //   });
    // }

    const product = await ProductService.getProductById(id);

    if (typeof product === "string") {
      return res.status(404).json({
        status: "ERR",
        message: product,
      });
    }

    return res.status(200).json({
      status: "OK",
      data: product,
    });
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

    // if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    //   return res.status(400).json({
    //     status: "ERR",
    //     message: "Invalid product ID format",
    //   });
    // }

    // Validate update data
    const { price, stock } = req.body;
    if (price !== undefined && (price < 0 || !Number.isInteger(price))) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid price",
        details: "Price must be a positive number",
      });
    }

    if (stock !== undefined && (stock < 0 || !Number.isInteger(stock))) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid stock",
        details: "Stock must be a non-negative integer",
      });
    }

    const product = await ProductService.updateProduct(id, req.body);

    if (typeof product === "string") {
      return res.status(404).json({
        status: "ERR",
        message: product,
      });
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

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid product ID format",
      });
    }

    const result = await ProductService.deleteProduct(id);

    if (typeof result === "string") {
      return res.status(404).json({
        status: "ERR",
        message: result,
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "Product deleted successfully",
    });
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
  updateProduct,
  deleteProduct,
};
