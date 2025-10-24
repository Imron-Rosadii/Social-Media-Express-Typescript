// src/middleware/loggerMiddleware.ts
import { Request, Response, NextFunction } from "express";
import logger from "../middleware/logger";

const logRequest = (req: Request, res: Response, next: NextFunction): void => {
  // Log API request yang masuk
  logger.info(`API Call: ${req.method} ${req.originalUrl}`);

  // Lanjutkan eksekusi ke middleware berikutnya atau controller
  next();
};

export default logRequest;
