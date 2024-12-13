// services/review.js
import Review from "../models/review.js";
import Product from "../models/product.js";

// Add a review
export const addReview = async ({ userId, productId, rating, comment }) => {
  const review = new Review({ userId, productId, rating, comment });
  await review.save();

  // Update product's average rating
  const reviews = await Review.find({ productId });
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await Product.findByIdAndUpdate(productId, { averageRating });
  return review;
};

// Get all reviews for a product
export const getReviewsByProduct = async (productId) => {
  return Review.find({ productId }).populate("userId", "name avatar");
};

// Get reviews by a user
export const getReviewsByUser = async (userId) => {
  return Review.find({ userId }).populate("productId", "name");
};

// Update a review
export const updateReview = async ({ reviewId, userId, rating, comment }) => {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId },
    { rating, comment },
    { new: true }
  );
  return review;
};

// Delete a review
export const deleteReview = async ({ reviewId, userId }) => {
  const review = await Review.findOneAndDelete({ _id: reviewId, userId });
  return review;
};
