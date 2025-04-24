import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse } from "@sui-ai-copilot/shared";
import { logger } from "../utils/logger";

/**
 * Custom error class with status code
 */
export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "SERVER_ERROR"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Generate a unique request ID for tracking
  const requestId =
    req.headers["x-request-id"] || Math.random().toString(36).substring(2, 15);

  let statusCode = 500;
  let errorCode = "SERVER_ERROR";

  // Handle custom API errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorCode = err.code;
  }

  // Create error response object
  const errorResponse: ApiErrorResponse = {
    message: err.message || "Internal Server Error",
    code: errorCode,
    requestId: requestId as string,
  };

  // Log the error
  logger.error(`Error: ${err.message}`, {
    requestId,
    statusCode,
    path: req.path,
    method: req.method,
    errorCode,
    stack: err.stack,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: errorResponse,
  });
}
