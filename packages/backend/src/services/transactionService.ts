import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import {
  ExplainTransactionRequest,
  ExplainTransactionResponse,
  TransactionExplanation,
  TransactionContext,
  RiskLevel,
} from "@sui-ai-copilot/shared";
import { logger } from "../utils/logger";
import { cache } from "../utils/cache";
import { suiService } from "./suiService";
import { llmService } from "./llmService";
import { LLMProviderType } from "./llm/LLMProviderFactory";

/**
 * Transaction service options
 */
export interface TransactionServiceOptions {
  /** LLM provider to use */
  llmProviderType?: LLMProviderType;
  /** Whether to enable caching */
  enableCache?: boolean;
  /** Cache TTL in seconds */
  cacheTtl?: number;
}

/**
 * Service for transaction analysis and explanation
 */
export class TransactionService {
  private readonly llmProviderType: LLMProviderType;
  private readonly enableCache: boolean;
  private readonly cacheTtl: number;

  constructor(options: TransactionServiceOptions = {}) {
    this.llmProviderType = options.llmProviderType || LLMProviderType.CLAUDE;
    this.enableCache =
      options.enableCache !== undefined ? options.enableCache : true;
    this.cacheTtl = options.cacheTtl || 3600; // Default 1 hour
  }

  /**
   * Generate a cache key for the transaction
   */
  private getCacheKey(txBlock: string, sender: string): string {
    return `tx:${txBlock.substring(0, 64)}:${sender.substring(0, 20)}`;
  }

  /**
   * Explain a transaction using the AI
   */
  public async explainTransaction(
    request: ExplainTransactionRequest
  ): Promise<ExplainTransactionResponse> {
    try {
      const { transactionBlock, sender } = request;

      // Serialize transaction for consistent processing
      const serializedTx = this.serializeTransactionBlock(transactionBlock);

      // Check cache first if enabled
      if (this.enableCache) {
        const cacheKey = this.getCacheKey(serializedTx, sender);
        const cachedExplanation = await cache.get<ExplainTransactionResponse>(
          cacheKey
        );

        if (cachedExplanation) {
          logger.info("Found cached explanation", { sender });
          return cachedExplanation;
        }
      }

      logger.info("Simulating transaction", { sender });

      // Simulate transaction to get effects
      const simulatedEffects = await suiService.simulateTransaction(
        transactionBlock,
        sender
      );

      // Try to extract transaction context if not provided
      let context = request.context;
      if (!context && typeof transactionBlock !== "string") {
        context = this.extractTransactionContext(transactionBlock);
      }

      logger.info("Generating explanation", {
        sender,
        provider: this.llmProviderType,
      });

      // Generate explanation using LLM
      const explanation = await llmService.explainTransaction(
        serializedTx,
        simulatedEffects,
        this.llmProviderType
      );

      // Construct the response
      const response: ExplainTransactionResponse = {
        transactionId: simulatedEffects.digest,
        explanation,
        simulatedEffects,
      };

      // Cache the result if enabled
      if (this.enableCache) {
        const cacheKey = this.getCacheKey(serializedTx, sender);
        await cache.set(cacheKey, response, this.cacheTtl);
      }

      return response;
    } catch (error) {
      logger.error("Error explaining transaction", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Serializes a transaction block to a consistent format
   */
  private serializeTransactionBlock(
    transactionBlock: Transaction | string
  ): string {
    if (typeof transactionBlock === "string") {
      return transactionBlock;
    }

    // For Transaction objects, return serialized form
    return transactionBlock.serialize();
  }

  /**
   * Attempts to extract context from a transaction
   */
  private extractTransactionContext(
    transactionBlock: Transaction
  ): TransactionContext | undefined {
    try {
      // This is a simplified example - in a real implementation,
      // you would analyze the transaction to extract module, function, etc.
      return {
        // Extract context from transaction if possible
      };
    } catch (error) {
      logger.warn("Failed to extract transaction context", {
        error: (error as Error).message,
      });
      return undefined;
    }
  }
}

// Export default instance
export const transactionService = new TransactionService({
  llmProviderType:
    process.env.DEFAULT_LLM_PROVIDER === "gpt"
      ? LLMProviderType.GPT
      : LLMProviderType.CLAUDE,
  enableCache: process.env.ENABLE_CACHE !== "false",
  cacheTtl: parseInt(process.env.CACHE_TTL || "3600"),
});
