import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "./generated/prisma";
import { Request, Response } from "express";
import logger from "./middleware/logger";
import userRoutes from "./routes/userRoutes";
import logRequest from "./middleware/loggerMiddleware";
import followRoutes from "./routes/followRoutes";

dotenv.config();

// Inisialisasi Prisma Client
export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk logging request
app.use(logRequest);

app.use("/api/users", userRoutes);
app.use("/api/users", followRoutes);

app.use((req: Request, res: Response) => {
  logger.error("Route not found: " + req.method + " " + req.originalUrl);
  res.status(404).json({ message: "Route not found" });
});

// Start server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
    await prisma.$connect();

    logger.info("Database connection successful!");
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
