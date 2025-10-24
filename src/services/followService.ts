// src/services/followService.ts
import { prisma } from "../index";
import logger from "../middleware/logger";

export const followUser = async (followerId: number, followingId: number) => {
  // Cegah user follow dirinya sendiri
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself.");
  }

  // Cek apakah user yang akan diikuti ada
  const userToFollow = await prisma.user.findUnique({
    where: { id: followingId },
  });

  if (!userToFollow) {
    logger.warn(`User ${followerId} tried to follow non-existent user ${followingId}.`);
    throw new Error("User to follow not found.");
  }

  // Cek apakah sudah follow
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        // Ini adalah primary key gabungan
        followerId,
        followingId,
      },
    },
  });

  if (existingFollow) {
    logger.warn(`User ${followerId} tried to follow user ${followingId} but is already following them.`);
    throw new Error("You are already following this user.");
  }

  // Buat hubungan follow baru
  const follow = await prisma.follow.create({
    data: {
      followerId,
      followingId,
    },
  });

  return follow;
};

export const unfollowUser = async (followerId: number, followingId: number) => {
  // Cek apakah hubungan follow ada
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (!follow) {
    logger.warn(`User ${followerId} tried to unfollow user ${followingId} but was not following them.`);
    throw new Error("You are not following this user.");
  }

  // Hapus hubungan follow
  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });
  logger.info(`User ${followerId} unfollowed user ${followingId} successfully.`);
  return { message: "User unfollowed successfully" };
};

export const getFollowers = async (userId: number) => {
  return await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: { id: true, username: true, fullName: true, profilePicture: true },
      },
    },
  });
};

export const getFollowing = async (userId: number) => {
  return await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: { id: true, username: true, fullName: true, profilePicture: true },
      },
    },
  });
};
