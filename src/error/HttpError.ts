export default class HttpError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message); // Menentukan pesan error
    this.statusCode = statusCode;

    // Menetapkan nama error sebagai nama kelas
    this.name = this.constructor.name;

    // Mengatasi stack trace error (opsional)
    Error.captureStackTrace(this, this.constructor);
  }
}
