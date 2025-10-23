// src/middleware/uploadProfilePicture.ts
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { storage } from "../config/cloudinary";

const upload = multer({ storage });

// Middleware ini menangani upload file tunggal dengan field 'profilePicture'
export const uploadProfilePicture = upload.single("profilePicture");
