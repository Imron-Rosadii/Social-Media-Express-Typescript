// src/middleware/checkRole.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types"; // <-- IMPORT TIPE YANG SUDAH KITA BUAT
import logger from "./logger";
export const checkRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Log informasi tentang API call yang masuk
    logger.warn("API Call: " + req.method + " " + req.originalUrl);

    // Log informasi lengkap request yang masuk
    logger.info(`Request Method: ${req.method}, Request URL: ${req.originalUrl}`);
    logger.debug(`Request Headers: ${JSON.stringify(req.headers)}`);

    // Log body request jika ada (untuk POST/PUT)
    if (req.method === "POST" || req.method === "PUT") {
      logger.debug(`Request Body: ${JSON.stringify(req.body)}`);
    }

    // Ambil role pengguna dari req.user (yang sudah diisi oleh authenticateToken)
    const userRoles = req.user?.roles;
    logger.info("User Roles: " + JSON.stringify(userRoles));

    // Jika user tidak memiliki roles
    if (!userRoles || userRoles.length === 0) {
      return res.status(403).json({ message: "Forbidden: No roles assigned" });
    }

    // Cek apakah role yang dibutuhkan ada di dalam array roles user
    if (userRoles.includes(requiredRole)) {
      next(); // Izinkan akses
    } else {
      // Kembalikan response error jika role yang dibutuhkan tidak ada
      res.status(403).json({ message: `Forbidden: '${requiredRole}' role required` });
    }
  };
};
