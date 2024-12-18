// utils/validation.js

export const validateObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export const validateProductInput = (data, isUpdate = false) => {
  const { name, description, category, brand, price, stock, images } = data;
  const errors = {};

  if (!isUpdate) {
    if (!name) errors.name = "Name is required";
    if (!description) errors.description = "Description is required";
    if (!category) errors.category = "Category is required";
    if (!brand) errors.brand = "Brand is required";
    if (!price) errors.price = "Price is required";
    if (!stock) errors.stock = "Stock is required";
    if (!images) errors.images = "At least one image is required";
  }

  const validCategories = [
    "Laptop",
    "Pc",
    "Phone",
    "Accessory",
    "Tablet",
    "Other",
  ];
  if (category && !validCategories.includes(category)) {
    errors.category = `Category must be one of: ${validCategories.join(", ")}`;
  }

  if (price !== undefined && (price < 0 || !Number.isInteger(price))) {
    errors.price = "Price must be a positive integer";
  }

  if (stock !== undefined && (stock < 0 || !Number.isInteger(stock))) {
    errors.stock = "Stock must be a non-negative integer";
  }

  return Object.keys(errors).length
    ? { message: "Invalid input data", details: errors }
    : null;
};
