import { Request, Response, NextFunction } from "express";
import { HealthCheckResponse } from "@sui-ai-copilot/shared";

/**
 * Controller for health-related endpoints
 */
export class HealthController {
  /**
   * Health check endpoint
   */
  public static async healthCheck(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const healthData: HealthCheckResponse = {
        status: "ok",
        version: process.env.npm_package_version || "0.1.0",
        environment: process.env.NODE_ENV || "development",
        timestamp: Date.now(),
      };

      res.status(200).json({
        success: true,
        data: healthData,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default HealthController;
