// src/routes/followRoutes.ts
import { Router } from "express";
import { followUserController, unfollowUserController, getFollowersController, getFollowingController } from "../controllers/followController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Semua route di bawah memerlukan autentikasi
router.use(authenticateToken);

// Route untuk follow/unfollow user lain
router.post("/:userId/follow", followUserController);
router.delete("/:userId/follow", unfollowUserController);

// Route publik untuk melihat follower/following (bisa diakses siapa saja)
router.get("/:userId/followers", getFollowersController);
router.get("/:userId/following", getFollowingController);

export default router;
