import winston from "winston";

// Define custom log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define custom colors for log levels
const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Add colors to winston
winston.addColors(logColors);

// Create winston logger
const logger = winston.createLogger({
  levels: logLevels,
  format: winston.format.combine(
    winston.format.colorize(), // Add color to logs in console
    winston.format.timestamp(), // Add timestamp to logs
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`; // Format log message
    })
  ),
  transports: [
    // Log to console with color and simple format
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorize the logs for the console
        winston.format.simple() // Use a simple format in the console
      ),
    }),
    // Log to file with JSON format
    new winston.transports.File({
      filename: "logs/app.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Store logs in JSON format for easier processing
      ),
    }),
  ],
});

// Set default log level
logger.level = "info"; // Default level is 'info'

export default logger;
