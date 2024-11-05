import Product from "../models/product.js";

export const createProduct = async (productData) => {
  try {
    // Check if product with same name and brand already exists
    const existingProduct = await Product.findOne({
      name: productData.name,
      brand: productData.brand,
    });

    if (existingProduct) {
      return "A product with this name and brand already exists";
    }

    // Create new product
    const product = new Product(productData);
    return await product.save();
  } catch (error) {
    console.error("Service Error - Create Product:", error);
    if (error.name === "ValidationError") {
      return Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
    }
    throw error;
  }
};

export const createBulkProducts = async (products) => {
  try {
    // Map each product to a new instance of Product model and use createProduct function
    const createdProducts = await Promise.all(
      products.map((product) => createProduct(product))
    );

    return createdProducts;
  } catch (error) {
    console.error("Service Error - Create Bulk Products:", error);
    if (error.name === "ValidationError") {
      return Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
    }
    throw error;
  }
};

export const getProducts = async (filters = {}, page = 1, limit = 10) => {
  try {
    let query = {};

    // Apply filters
    if (filters.category) query.category = filters.category;
    if (filters.brand) query.brand = filters.brand;
    if (filters.sort) query.sort = filters.sort;

    // Handle text search
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { brand: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate({
        path: "reviews.userId",
        select: "name email", // Assuming these fields exist in User model
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);

    return { data: products, count: totalProducts, totalPages };
  } catch (error) {
    console.error("Service Error - Get Products:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const product = await Product.findById(id).populate({
      path: "reviews.userId",
      select: "name email",
    });

    if (!product) {
      return "Product not found";
    }

    return product;
  } catch (error) {
    console.error("Service Error - Get Product by ID:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return "Product not found";
    }

    // If name or brand is being updated, check for duplicates
    if (productData.name || productData.brand) {
      const duplicateProduct = await Product.findOne({
        _id: { $ne: id },
        name: productData.name || existingProduct.name,
        brand: productData.brand || existingProduct.brand,
      });

      if (duplicateProduct) {
        return "A product with this name and brand already exists";
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...productData },
      { new: true, runValidators: true }
    );

    return updatedProduct;
  } catch (error) {
    console.error("Service Error - Update Product:", error);
    if (error.name === "ValidationError") {
      return Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
    }
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const product = await Product.findById(id);

    if (!product) {
      return "Product not found";
    }

    // Check if product has any active orders or dependencies
    // Add your business logic here

    await Product.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error("Service Error - Delete Product:", error);
    throw error;
  }
};
