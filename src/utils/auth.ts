// src/utils/auth.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../generated/prisma";
import { prisma } from "../index"; // Import prisma instance dari index.ts
import { UserWithRoles } from "../types/index";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET!; // Gunakan '!' karena kita sudah pastikan ada di .env

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const generateToken = (user: UserWithRoles): string => {
  // 1. Ekstrak hanya NAMA role dari array userRoles
  const roles = user.userRoles.map((userRole) => userRole.role.name);

  // 2. Buat payload token yang berisi role
  const payload = {
    userId: user.id,
    username: user.username,
    roles: roles, // <-- INI KUNCI-NYA
  };

  // 3. Generate token
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

// Fungsi untuk memverifikasi token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
