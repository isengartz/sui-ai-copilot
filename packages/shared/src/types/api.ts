import {
  ExplainTransactionRequest,
  ExplainTransactionResponse,
} from "./transaction.js";

/**
 * API endpoints for the backend service
 */
export enum ApiEndpoint {
  EXPLAIN_TRANSACTION = "/api/transaction/explain",
  HEALTH_CHECK = "/api/health",
}

/**
 * Base API error response
 */
export interface ApiErrorResponse {
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** Request ID for debugging */
  requestId?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data if successful */
  data?: T;
  /** Error details if unsuccessful */
  error?: ApiErrorResponse;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  /** Service status */
  status: "ok" | "degraded" | "error";
  /** API version */
  version: string;
  /** Environment (production, staging, etc.) */
  environment: string;
  /** Timestamp of the response */
  timestamp: number;
}

// Type aliases for specific API requests/responses
export type ExplainTransactionApiRequest = ExplainTransactionRequest;
export type ExplainTransactionApiResponse =
  ApiResponse<ExplainTransactionResponse>;
export type HealthCheckApiResponse = ApiResponse<HealthCheckResponse>;
