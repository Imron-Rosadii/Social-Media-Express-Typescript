import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request } from "express";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Konfigurasi Multer untuk Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req: Request, file: Express.Multer.File) => {
    return {
      folder: "SocialMedia",
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: "user_" + req.user?.id,
    };
  },
});

export { cloudinary, storage };
