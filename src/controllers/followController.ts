// src/controllers/followController.ts
import { Response } from "express";
import { followUser, unfollowUser, getFollowers, getFollowing } from "../services/followService";
import { AuthenticatedRequest } from "../types";
import logger from "../middleware/logger";

export const followUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const followerId = req.user!.id;
    const followingId = parseInt(req.params.userId);

    if (isNaN(followingId)) {
      logger.error(`Invalid user ID provided by user ${followerId} to follow: ${req.params.userId}`);
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const follow = await followUser(followerId, followingId);
    logger.info(`User ${followerId} followed user ${followingId} successfully.`);
    res.status(201).json({ message: "User followed successfully", follow });
  } catch (error: any) {
    logger.error(`Error following user: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

export const unfollowUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const followerId = req.user!.id;
    const followingId = parseInt(req.params.userId);

    if (isNaN(followingId)) {
      logger.error(`Invalid user ID provided by user ${followerId} to unfollow: ${req.params.userId}`);
      return res.status(400).json({ message: "Invalid user ID" });
    }

    await unfollowUser(followerId, followingId);
    logger.info(`User ${followerId} unfollowed user ${followingId} successfully.`);

    res.status(204).send();
  } catch (error: any) {
    logger.error(`Error unfollowing user: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

// --- PERBAIKAN DI SINI ---
export const getFollowersController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      logger.error(`Invalid user ID provided to get followers: ${req.params.userId}`);
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const followers = await getFollowers(userId);
    logger.info(`User ${userId} retrieved their followers successfully.`);
    res.json(followers);
  } catch (error: any) {
    logger.error(`Error getting followers: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// --- DAN DI SINI ---
export const getFollowingController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      logger.error(`Invalid user ID provided to get following: ${req.params.userId}`);
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const following = await getFollowing(userId);
    logger.info(`User ${userId} retrieved their following successfully.`);
    res.json(following);
  } catch (error: any) {
    logger.error(`Error getting following: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};
