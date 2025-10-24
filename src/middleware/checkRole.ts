// src/middleware/checkRole.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types"; // <-- IMPORT TIPE YANG SUDAH KITA BUAT
import logger from "./logger";
export const checkRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Log informasi lengkap request yang masuk
    logger.debug(`Request Headers: ${JSON.stringify(req.headers)}`);
    // Log body request jika ada (untuk POST/PUT)
    if (req.method === "POST" || req.method === "PUT") {
      logger.debug(`Request Body: ${JSON.stringify(req.body)}`);
    }
    // Ambil role pengguna dari req.user (yang sudah diisi oleh authenticateToken)
    const userRoles = req.user?.roles;
    // Jika user tidak memiliki roles
    if (!userRoles || userRoles.length === 0) {
      logger.error("Forbidden: No roles assigned");
      return res.status(403).json({ message: "Forbidden: No roles assigned" });
    }

    // Cek apakah role yang dibutuhkan ada di dalam array roles user
    if (userRoles.includes(requiredRole)) {
      next(); // Izinkan akses
    } else {
      // Kembalikan response error jika role yang dibutuhkan tidak ada
      logger.error(`Forbidden: '${requiredRole}' role required`);
      res.status(403).json({ message: `Forbidden: '${requiredRole}' role required` });
    }
  };
};
