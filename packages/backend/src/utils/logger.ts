import winston from "winston";

// Define log format
const logFormat = winston.format.printf(
  ({ level, message, timestamp, ...metadata }) => {
    const metaString = Object.keys(metadata).length
      ? JSON.stringify(metadata, null, 2)
      : "";

    return `${timestamp} [${level}]: ${message} ${metaString}`;
  }
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      dirname: "logs",
    }),
    new winston.transports.File({
      filename: "combined.log",
      dirname: "logs",
    }),
  ],
});

// Add request context logger
export function createContextLogger(requestId: string) {
  return {
    info: (message: string, meta = {}) => {
      logger.info(message, { requestId, ...meta });
    },
    error: (message: string, meta = {}) => {
      logger.error(message, { requestId, ...meta });
    },
    warn: (message: string, meta = {}) => {
      logger.warn(message, { requestId, ...meta });
    },
    debug: (message: string, meta = {}) => {
      logger.debug(message, { requestId, ...meta });
    },
  };
}
