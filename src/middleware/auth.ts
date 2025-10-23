// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../index";
import { AuthenticatedRequest } from "../types/index";

// Perluas tipe Request untuk menambahkan properti 'user'
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        roles: string[];
      };
    }
  }
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    // Dekode token. Tipe payload sekarang harus mencakup `roles: string[]`
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      username: string;
      roles: string[];
    };

    // Isi req.user dengan data lengkap dari token
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      roles: decoded.roles, // <-- Role sekarang ada di sini
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
