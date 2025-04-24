import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "./errorHandler";

/**
 * Middleware to validate requests against a Zod schema
 */
export function validateRequest(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format the validation errors
        const errorMessages = error.errors.map((err) => {
          const field = err.path.join(".");
          return `${field}: ${err.message}`;
        });

        next(
          new ApiError(
            `Validation error: ${errorMessages.join(", ")}`,
            400,
            "VALIDATION_ERROR"
          )
        );
      } else {
        next(error);
      }
    }
  };
}
