import winston from "winston";

// Define custom log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Add custom colors to winston
winston.addColors(logColors);

// Create winston logger
const logger = winston.createLogger({
  levels: logLevels,
  // Tidak perlu format di sini jika akan didefinisikan per transport
  transports: [
    // Log ke file dalam format JSON
    new winston.transports.File({
      filename: "logs/app.log",
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    // Log ke console dengan format yang diinginkan
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }), // Colorize semua level
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => {
          // Format yang Anda inginkan
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
  ],
});

// Set default log level to 'info'
logger.level = "info";

export default logger;
