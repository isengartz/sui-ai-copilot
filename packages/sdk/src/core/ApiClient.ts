import {
  ApiEndpoint,
  ApiResponse,
  DEFAULT_API_URL,
  ExplainTransactionRequest,
  ExplainTransactionResponse,
  HealthCheckResponse,
} from "@sui-ai-copilot/shared";

/**
 * Options for the API client
 */
export interface ApiClientOptions {
  /** Base URL for the API */
  apiUrl?: string;
  /** Default timeout for requests (ms) */
  timeout?: number;
  /** API key for authentication */
  apiKey?: string;
}

/**
 * Client for communicating with the AI Copilot API
 */
export class ApiClient {
  private readonly apiUrl: string;
  private readonly timeout: number;
  private readonly apiKey?: string;

  constructor(options: ApiClientOptions = {}) {
    this.apiUrl = options.apiUrl || DEFAULT_API_URL;
    this.timeout = options.timeout || 10000;
    this.apiKey = options.apiKey;
  }

  /**
   * Request to explain a transaction
   */
  public async explainTransaction(
    request: ExplainTransactionRequest
  ): Promise<ApiResponse<ExplainTransactionResponse>> {
    return this.post<ExplainTransactionResponse>(
      ApiEndpoint.EXPLAIN_TRANSACTION,
      request
    );
  }

  /**
   * Get API health status
   */
  public async checkHealth(): Promise<ApiResponse<HealthCheckResponse>> {
    return this.get<HealthCheckResponse>(ApiEndpoint.HEALTH_CHECK);
  }

  /**
   * Make a GET request to the API
   */
  private async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: "GET",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.timeout),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Make a POST request to the API
   */
  private async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(this.timeout),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Handle a successful API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    return response.ok
      ? this.createSuccessResponse(response)
      : this.createErrorResponse(response);
  }

  /**
   * Parse successful response into appropriate format
   */
  private async createSuccessResponse<T>(
    response: Response
  ): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (isJson) {
      const data = await response.json();
      return { success: true, data };
    }

    return {
      success: false,
      error: {
        message: "Invalid response format",
        code: "INVALID_RESPONSE",
      },
    };
  }

  /**
   * Create error response from failed HTTP request
   */
  private async createErrorResponse<T>(
    response: Response
  ): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    const error = isJson
      ? await response.json()
      : { message: response.statusText };

    return {
      success: false,
      error: {
        message: error.message || "Unknown error",
        code: error.code || `HTTP_${response.status}`,
        requestId: error.requestId,
      },
    };
  }

  /**
   * Handle API request errors
   */
  private handleError<T>(error: any): ApiResponse<T> {
    return {
      success: false,
      error: {
        message: error.message || "Unknown error",
        code: "REQUEST_FAILED",
      },
    };
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }
}
