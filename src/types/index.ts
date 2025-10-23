// src/types/index.ts
import { Request } from "express";
import { User } from "../generated/prisma";

// Tipe untuk request yang sudah melalui middleware authenticateToken
// Middleware akan menambahkan properti 'user' ke objek Request
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    roles: string[];
  };
}

// Tipe untuk objek User dari database yang sudah include relasi userRoles dan role
// Ini adalah hasil dari query Prisma dengan 'include'
export interface UserWithRoles extends User {
  userRoles: {
    role: {
      id: number;
      name: string;
    };
  }[];
}
