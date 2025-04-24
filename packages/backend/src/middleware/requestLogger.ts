import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Middleware to log incoming requests
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate a unique request ID if not present
  const requestId =
    req.headers["x-request-id"] || Math.random().toString(36).substring(2, 15);

  // Set the request ID on the response headers for tracking
  res.setHeader("X-Request-ID", requestId);

  // Log the request
  logger.info(`Incoming request: ${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Measure response time
  const startTime = Date.now();

  // Log response on completion
  res.on("finish", () => {
    const responseTime = Date.now() - startTime;

    logger.info(`Request completed: ${req.method} ${req.path}`, {
      requestId,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
    });
  });

  next();
}
