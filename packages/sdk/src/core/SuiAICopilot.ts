import { Transaction } from "@mysten/sui/transactions";
import {
  ExplainTransactionRequest,
  ExplainTransactionResponse,
  TransactionContext,
  WidgetConfig,
  SDK_VERSION,
} from "@sui-ai-copilot/shared";
import { ApiClient, ApiClientOptions } from "./ApiClient";

/**
 * Events emitted by the SDK
 */
export enum SdkEvent {
  TRANSACTION_EXPLAINED = "transaction_explained",
  EXPLANATION_ERROR = "explanation_error",
  WIDGET_READY = "widget_ready",
  WIDGET_CLOSED = "widget_closed",
}

/**
 * Options for the SDK
 */
export interface SuiAICopilotOptions {
  /** API client options */
  api?: ApiClientOptions;

  /** Widget configuration */
  widget?: WidgetConfig;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Main SDK class for the Sui AI Copilot
 */
export class SuiAICopilot {
  private readonly apiClient: ApiClient;
  private readonly widgetConfig: WidgetConfig;
  private readonly debug: boolean;

  /** The SDK version */
  public readonly version = SDK_VERSION;

  /** Event listeners */
  private readonly eventListeners: Record<string, Function[]> = {};

  constructor(options: SuiAICopilotOptions = {}) {
    // Initialize API client
    this.apiClient = new ApiClient(options.api);

    // Initialize widget config
    this.widgetConfig = options.widget || {};

    // Debug mode
    this.debug = options.debug || false;

    // Initialize event listeners
    this.eventListeners = {
      [SdkEvent.TRANSACTION_EXPLAINED]: [],
      [SdkEvent.EXPLANATION_ERROR]: [],
      [SdkEvent.WIDGET_READY]: [],
      [SdkEvent.WIDGET_CLOSED]: [],
    };

    this.log("SDK initialized with options:", options);
  }

  /**
   * Explain a transaction using the AI copilot
   */
  public async explainTransaction(
    transactionBlock: Transaction,
    sender: string,
    context?: TransactionContext
  ): Promise<ExplainTransactionResponse> {
    this.log("Explaining transaction:", { sender });

    try {
      // Create request
      const request: ExplainTransactionRequest = {
        transactionBlock,
        sender,
      };

      // Get explanation from API
      const response = await this.apiClient.explainTransaction(request);

      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message || "Failed to explain transaction"
        );
      }

      // Emit event
      this.emit(SdkEvent.TRANSACTION_EXPLAINED, response.data);

      return response.data;
    } catch (error: any) {
      this.log("Error explaining transaction:", error);
      this.emit(SdkEvent.EXPLANATION_ERROR, { error: error.message });
      throw error;
    }
  }

  /**
   * Initialize the widget in the dApp
   */
  public initWidget(container?: string | HTMLElement): void {
    this.log("Initializing widget with config:", this.widgetConfig);

    // This is a placeholder. In a real implementation, we would dynamically
    // create and inject the widget into the page, or communicate with an
    // existing widget instance.

    // Example implementation:
    if (typeof window !== "undefined") {
      // Define global namespace for the widget
      (window as any).SuiAICopilot = {
        ...((window as any).SuiAICopilot || {}),
        sdk: this,
        config: this.widgetConfig,
        version: this.version,
      };

      // Emit ready event when widget is loaded
      this.emit(SdkEvent.WIDGET_READY, { container });
    }
  }

  /**
   * Add event listener
   */
  public on(event: SdkEvent, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   */
  public off(event: SdkEvent, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        (listener) => listener !== callback
      );
    }
  }

  /**
   * Emit event
   */
  private emit(event: SdkEvent, data: any): void {
    if (this.eventListeners[event]) {
      for (const listener of this.eventListeners[event]) {
        try {
          listener(data);
        } catch (error) {
          this.log("Error in event listener:", error);
        }
      }
    }
  }

  /**
   * Log debug messages
   */
  private log(...args: any[]): void {
    if (this.debug) {
      console.log("[SuiAICopilot]", ...args);
    }
  }
}
