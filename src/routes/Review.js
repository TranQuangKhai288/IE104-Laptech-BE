// routes/review.js
import express from "express";
import reviewController from "../controllers/review.js";
import { authUserMiddleWare } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add a review for a product
router.post("/", authUserMiddleWare, reviewController.addReview);

// Get all reviews for a product
router.get("/product/:productId", reviewController.getReviewsByProduct);

// Get reviews by a specific user
router.get(
  "/user/:userId",
  authUserMiddleWare,
  reviewController.getReviewsByUser
);

// Update a review
router.put("/:reviewId", authUserMiddleWare, reviewController.updateReview);

// Delete a review
router.delete("/:reviewId", authUserMiddleWare, reviewController.deleteReview);

export default router;
