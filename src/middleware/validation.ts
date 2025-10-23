// auth user
import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import logger from "./logger";

// Schema untuk registrasi
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  fullName: Joi.string().optional(),
});

// Schema untuk login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  logger.warn("API Call: " + req.method + " " + req.originalUrl);
  const { error } = registerSchema.validate(req.body);
  if (error) {
    logger.error("Validation error: " + error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  logger.warn("API Call: " + req.method + " " + req.originalUrl);
  const { error } = loginSchema.validate(req.body);
  if (error) {
    logger.error("Validation error: " + error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// get user

// Schema untuk pagination
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1), // Halaman harus angka positif, default 1
  limit: Joi.number().integer().min(1).max(100).default(10), // Limit harus angka positif dan maksimal 100
});

// Middleware validasi untuk pagination
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  logger.warn("API Call: " + req.method + " " + req.originalUrl);
  const { error } = paginationSchema.validate(req.query);
  if (error) {
    logger.error("Validation error: " + error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
