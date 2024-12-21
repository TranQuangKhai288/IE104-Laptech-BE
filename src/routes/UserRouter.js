import express from "express";
import userController from "../controllers/user.js";
import {
  authAdminMiddleWare,
  authUserMiddleWare,
} from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/verify-email", userController.verifyEmail);
router.post("/refresh-token", userController.refreshToken);
// router.post("/forgot-password", userController.forgotPassword);

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/log-out", userController.logoutUser);

router.put("/", authUserMiddleWare, userController.updateUser);
router.delete("/:id", authAdminMiddleWare, userController.deleteUser);
router.get("/all", authAdminMiddleWare, userController.getUsers);
router.get("/", authUserMiddleWare, userController.getDetailsUser);

export default router;
