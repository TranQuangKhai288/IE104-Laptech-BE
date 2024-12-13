// controllers/review.js
import * as reviewService from "../services/review.js";

// Add a review
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;

    const response = await reviewService.addReview({
      userId,
      productId,
      rating,
      comment,
    });

    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all reviews for a product
export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await reviewService.getReviewsByProduct(productId);
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get reviews by a user
export const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await reviewService.getReviewsByUser(userId);
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const response = await reviewService.updateReview({
      reviewId,
      userId,
      rating,
      comment,
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const response = await reviewService.deleteReview({ reviewId, userId });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export default {
  addReview,
  getReviewsByProduct,
  getReviewsByUser,
  updateReview,
  deleteReview,
};
