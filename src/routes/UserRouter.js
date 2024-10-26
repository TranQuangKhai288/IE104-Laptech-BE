import express from "express";
import userController from "../controllers/user.js";
import {
  authAdminMiddleWare,
  authUserMiddleWare,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/log-out", userController.logoutUser);

router.put("/", authUserMiddleWare, userController.updateUser);
router.delete("/:id", authAdminMiddleWare, userController.deleteUser);
router.get("/", authAdminMiddleWare, userController.getUsers);
router.get("/:id", authUserMiddleWare, userController.getDetailsUser);

router.post("/refresh-token", userController.refreshToken);

export default router;
