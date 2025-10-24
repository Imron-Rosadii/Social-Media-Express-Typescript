// src/controllers/userController.ts
import { Request, Response } from "express";
import { registerUser, loginUser, getAllUsersPaginated, getUserById, updateUserRole, updateMyProfile, updateMyPassword, updateMyProfilePicture, getMyProfile } from "../services/userService";
import { generateToken } from "../utils/auth";
import logger from "../middleware/logger";
import { AuthenticatedRequest } from "../types/index";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);

    // Menambahkan logging tambahan
    logger.info(`User registered: ${user.username} (${user.email})`);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
    // Menambahkan informasi lebih dalam logging
    logger.error(`Registration error: ${error.message} at ${new Date().toISOString()}`);

    // Menggunakan status 409 untuk menunjukkan konflik data (user sudah ada)
    if (error.message === "Email or username already exists.") {
      logger.error("Email or username already exists.");
      return res.status(409).json({ message: error.message });
    }
    logger.error("Registration failed: " + error.message);
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password: plainPassword } = req.body;
    const user = await loginUser(email, plainPassword);
    const token = generateToken(user);

    // Hapus password dari response
    const { password, ...userWithoutPassword } = user;
    logger.info(`User logged in: ${user.username} (${user.email})`);
    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    logger.error("Login failed: " + error.message);
    res.status(401).json({ message: error.message });
  }
};

// get users

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = req.query.search as string | undefined;

    const result = await getAllUsersPaginated(page, limit, searchQuery);
    res.json(result);
  } catch (error: any) {
    logger.error("Error fetching users: " + error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await getUserById(userId);
    res.json(user);
  } catch (error: any) {
    logger.error("Error fetching user: " + error.message);
    res.status(404).json({ message: error.message });
  }
};

export const getMeController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await getMyProfile(userId);
    res.json(user);
  } catch (error: any) {
    logger.error("Error fetching user: " + error.message);
    res.status(404).json({ message: error.message });
  }
};

export const updateUserRoleController = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { roleName } = req.body;
    const result = await updateUserRole(userId, roleName);
    res.json(result);
  } catch (error: any) {
    logger.error("Error updating user role: " + error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateMyProfileController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const updatedUser = await updateMyProfile(userId, req.body);
    res.json(updatedUser);
  } catch (error: any) {
    logger.error("Error updating profile: " + error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateMyPasswordController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    const result = await updateMyPassword(userId, currentPassword, newPassword);
    res.json(result);
  } catch (error: any) {
    logger.error("Error updating password: " + error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateMyProfilePictureController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    // Middleware uploadProfilePicture sudah menyediakan req.file
    if (!req.file) {
      logger.error("Profile picture file is required");
      return res.status(400).json({ message: "Profile picture file is required" });
    }
    const imageUrl = req.file.path; // Cloudinary URL ada di sini
    const updatedUser = await updateMyProfilePicture(userId, imageUrl);
    res.json(updatedUser);
  } catch (error: any) {
    logger.error("Error updating profile picture: " + error.message);
    res.status(500).json({ message: error.message });
  }
};
