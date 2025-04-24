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
import { llmService, LLMProvider } from "./llmService";

/**
 * Options for the transaction service
 */
export interface TransactionServiceOptions {
  /** LLM provider to use */
  llmProvider?: LLMProvider;
  /** Whether to enable caching */
  enableCache?: boolean;
  /** Cache TTL in seconds */
  cacheTtl?: number;
}

/**
 * Service to analyze transactions using Sui and LLM services
 */
export class TransactionService {
  private readonly llmProvider: LLMProvider;
  private readonly enableCache: boolean;
  private readonly cacheTtl: number;

  constructor(options: TransactionServiceOptions = {}) {
    this.llmProvider = options.llmProvider || LLMProvider.CLAUDE;
    this.enableCache =
      options.enableCache !== undefined ? options.enableCache : true;
    this.cacheTtl = options.cacheTtl || 3600; // 1 hour default
  }

  /**
   * Generate a cache key for a transaction
   */
  private getCacheKey(txBlock: string, sender: string): string {
    return `tx:${txBlock}:${sender}`;
  }

  /**
   * Explain a transaction with details about its effects
   */
  public async explainTransaction(
    request: ExplainTransactionRequest
  ): Promise<ExplainTransactionResponse> {
    const { transactionBlock, sender, context } = request;

    try {
      logger.info("Explaining transaction", { sender });

      // Convert TransactionBlock to string for caching if it's not already
      const txBlockString =
        typeof transactionBlock === "string"
          ? transactionBlock
          : Transaction.from(transactionBlock as Transaction).serialize();

      // Check cache if enabled
      if (this.enableCache) {
        const cacheKey = this.getCacheKey(txBlockString, sender);
        const cachedResult = await cache.get<ExplainTransactionResponse>(
          cacheKey
        );

        if (cachedResult) {
          logger.info("Using cached explanation", { sender });
          return cachedResult;
        }
      }

      // Simulate the transaction to get its effects
      const simulatedEffects = await suiService.simulateTransaction(
        transactionBlock,
        sender
      );

      // Extract transaction context if not provided
      let txContext = context;
      if (!txContext && typeof transactionBlock !== "string") {
        txContext = this.extractTransactionContext(transactionBlock);
      }

      // Generate explanation using LLM
      const explanation = await llmService.explainTransaction(
        transactionBlock,
        simulatedEffects,
        this.llmProvider
      );

      // Create response
      const response: ExplainTransactionResponse = {
        transactionId: simulatedEffects.digest,
        explanation,
        simulatedEffects,
      };

      // Cache the result if caching is enabled
      if (this.enableCache) {
        const cacheKey = this.getCacheKey(txBlockString, sender);
        await cache.set(cacheKey, response, this.cacheTtl);
      }

      return response;
    } catch (error) {
      logger.error("Error explaining transaction", {
        error: (error as Error).message,
        sender,
      });

      // Return a minimal response with error fallback
      const fallbackExplanation: TransactionExplanation = {
        summary: "Error analyzing transaction",
        explanation: `We encountered an error while analyzing this transaction: ${
          (error as Error).message
        }. Please review the transaction carefully before approving.`,
        riskLevel: RiskLevel.UNKNOWN,
        risks: ["Unable to analyze transaction due to an error"],
        confidence: 0,
        impact: "Unknown impact. Please verify the transaction manually.",
        noteworthy: ["This is a fallback explanation due to a service error."],
      };

      return {
        explanation: fallbackExplanation,
      };
    }
  }

  /**
   * Extract context from a transaction block
   */
  private extractTransactionContext(
    transactionBlock: Transaction
  ): TransactionContext | undefined {
    try {
      const tx = transactionBlock.blockData;
      if (!tx) return undefined;

      // Extract function calls from transaction
      const moveCalls = tx.transactions.filter(
        (t: any) => t.kind === "MoveCall"
      );

      if (moveCalls.length === 0) return undefined;

      const firstCall = moveCalls[0] as any;

      // Extract target information from the MoveCall
      const targetString = firstCall.target || "";
      const targetParts = targetString.split("::");

      // Extract target and function information
      return {
        packageId: targetParts[0] || "",
        module: targetParts[1] || "",
        function: targetParts[2] || "",
      };
    } catch (error) {
      logger.error("Error extracting transaction context", {
        error: (error as Error).message,
      });
      return undefined;
    }
  }
}

// Export default instance
export const transactionService = new TransactionService();
