import { Request, Response, NextFunction } from "express";
import HttpError from "../error/HttpError"; // Mengimpor kelas custom HttpError
import createError from "http-errors"; // Mengimpor http-errors

const errorHandler = (
  err: HttpError | createError.HttpError, // Error dari HttpError atau http-errors
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Jika error tidak memiliki statusCode, set default ke 500
  if (!err.statusCode) {
    err.statusCode = 500;
  }

  // Log error ke console (opsional, untuk debugging)
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // Kirim respon error dalam format JSON
  res.status(err.statusCode).json({
    message: err.message,
    status: err.statusCode,
  });
};

export default errorHandler;
