import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "./generated/prisma";
import { Request, Response } from "express";
import logger from "./middleware/logger";

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

// Route sederhana untuk tes
app.get("/", (req, res) => {
  res.json({ message: "Social Media API is running!" });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
