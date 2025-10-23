// src/routes/userRoutes.ts
import { Router } from "express";
import { register, login } from "../controllers/userController";
import { validateRegister, validateLogin } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { checkRole } from "../middleware/checkRole";
import { getAllUsersController, getUserByIdController, updateUserRoleController, updateMyProfileController, updateMyPasswordController, updateMyProfilePictureController, getMeController } from "../controllers/userController";
import { uploadProfilePicture } from "../middleware/uploadProfilePicture";

const router = Router();

// Route publik (tidak perlu login)
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// Route Admin
router.get("/", authenticateToken, checkRole("Admin"), getAllUsersController);
router.patch("/:id/role", authenticateToken, checkRole("Admin"), updateUserRoleController);

// Route User (untuk diri sendiri)
router.get("/me", authenticateToken, getMeController);
router.patch("/me/profile", authenticateToken, updateMyProfileController);
router.patch("/me/password", authenticateToken, updateMyPasswordController);
router.patch("/me/picture", authenticateToken, uploadProfilePicture, updateMyProfilePictureController);

// Route Publik
router.get("/:id", getUserByIdController);

export default router;
