// src/services/userService.ts
import { PrismaClient, User } from "../generated/prisma";
import { hashPassword, comparePassword } from "../utils/auth";
import logger from "../middleware/logger";
import { UserWithRoles } from "../types"; // Gunakan tipe yang sudah kita buat

const prisma = new PrismaClient();

// --- PERBAIKAN DI SINI ---
// Ubah tipe return menjadi Omit<UserWithRoles, 'passwordHash'>
type UserWithoutPassword = Omit<UserWithRoles, "password" | "passwordHash">;

export const registerUser = async (userData: { username: string; email: string; password: string; confirmPassword: string; fullName?: string }): Promise<UserWithoutPassword> => {
  const { username, email, password: plainPassword, confirmPassword, fullName } = userData;

  // Cek apakah password dan konfirmasi password cocok
  if (plainPassword !== confirmPassword) {
    console.error("Password and confirm password do not match.");
    throw new Error("Passwords do not match.");
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    console.error("Email or username already exists.");
    throw new Error("Email or username already exists.");
  }

  const hashedPassword = await hashPassword(plainPassword);

  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullName,
      },
    });

    const userRole = await tx.role.findUnique({ where: { name: "User" } });

    if (!userRole) {
      throw new Error("Default 'User' role not found. Please check your database.");
    }

    await tx.userRole.create({
      data: {
        userId: newUser.id,
        roleId: userRole.id,
      },
    });

    // Return the user object with userRoles, without password
    return {
      ...newUser,
      userRoles: [{ userId: newUser.id, roleId: userRole.id, role: userRole }],
    };
  });

  // Hapus password sebelum mengembalikan user
  const { password, ...userWithoutPassword } = result;
  logger.info(`New user registered: ${userWithoutPassword.username} (${userWithoutPassword.email})`);

  return userWithoutPassword;
};

export const loginUser = async (email: string, password: string) => {
  // Cari user berdasarkan email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    logger.error("User not found");
    throw new Error("Invalid email or password.");
  }

  // Bandingkan password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    logger.error("Invalid password");
    throw new Error("Invalid email or password.");
  }

  return user;
};

// get user

// src/services/userService.ts

export const getAllUsersPaginated = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      // 1. Hapus 'select', tapi tambahkan 'include' untuk data terkait
      include: {
        userRoles: {
          include: {
            role: true, // Sertakan data role untuk setiap user
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  // 2. Buat mapping untuk menghapus passwordHash dari setiap user
  const usersWithoutPassword = users.map((user) => {
    // Destructuring untuk memisahkan passwordHash
    const { password, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    users: usersWithoutPassword, // Kembalikan array yang sudah bersih
    totalPages,
    currentPage: page,
  };
};

export const getUserById = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      bio: true,
      profilePicture: true,
      createdAt: true,
    },
  });
  if (!user) {
    logger.error("User not found");
    throw new Error("User not found");
  }
  return user;
};

export const getMyProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      bio: true,
      profilePicture: true,
      createdAt: true,
    },
  });
  if (!user) {
    logger.error("User not found");
    throw new Error("User not found");
  }
  return user;
};

export const updateUserRole = async (userId: number, newRoleName: string) => {
  const role = await prisma.role.findUnique({ where: { name: newRoleName } });
  if (!role) {
    logger.error("Role not found");
    throw new Error("Role not found");
  }

  // Gunakan transaksi untuk memastikan operasi atomis
  await prisma.$transaction(async (tx) => {
    // Hapus role lama user
    await tx.userRole.deleteMany({
      where: { userId },
    });
    // Tambahkan role baru
    await tx.userRole.create({
      data: {
        userId,
        roleId: role.id,
      },
    });
  });
  logger.info(`Updated user ${userId} role to ${newRoleName}`);
  return { message: `User role updated to ${newRoleName}` };
};

export const updateMyProfile = async (userId: number, data: { username?: string; email?: string; bio?: string }) => {
  // Cek jika username atau email sudah digunakan oleh user lain
  if (data.username || data.email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
        NOT: { id: userId }, // Kecualikan user itu sendiri dari pengecekan
      },
    });
    if (existingUser) {
      logger.error("Username or email already taken.");
      throw new Error("Username or email already taken.");
    }
  }
  logger.info(`Updating profile for user ${userId}`);
  return await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      fullName: true,
      profilePicture: true,
    },
  });
};

export const updateMyPassword = async (userId: number, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
  if (!user) {
    logger.error("User not found");
    throw new Error("User not found");
  }

  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    logger.error("Current password is incorrect");
    throw new Error("Current password is incorrect");
  }

  const NewPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: NewPassword },
  });
  logger.info(`User ${userId} updated their password`);
  return { message: "Password updated successfully" };
};

export const updateMyProfilePicture = async (userId: number, imageUrl: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { profilePicture: imageUrl },
    select: {
      id: true,
      username: true,
      profilePicture: true,
    },
  });
};
