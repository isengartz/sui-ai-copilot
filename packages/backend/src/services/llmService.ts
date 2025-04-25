import { TransactionExplanation, RiskLevel } from "@sui-ai-copilot/shared";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { logger } from "../utils/logger";
import { ILLMProvider } from "./llm/ILLMProvider";
import {
  LLMProviderFactory,
  LLMProviderType,
  LLMProviderOptions,
} from "./llm/LLMProviderFactory";

/**
 * Options for the LLM service
 */
export interface LLMServiceOptions {
  /** Default LLM provider to use */
  defaultProviderType?: LLMProviderType;
  /** Provider-specific options */
  providerOptions?: LLMProviderOptions;
  /** Whether to enable caching */
  enableCache?: boolean;
}

/**
 * Service to interact with language models for explanations
 */
export class LLMService {
  private readonly defaultProviderType: LLMProviderType;
  private readonly providerOptions: LLMProviderOptions;
  private readonly enableCache: boolean;
  private readonly providerFactory: LLMProviderFactory;

  constructor(options: LLMServiceOptions = {}) {
    this.defaultProviderType =
      options.defaultProviderType || LLMProviderType.CLAUDE;
    this.providerOptions = options.providerOptions || {};
    this.enableCache =
      options.enableCache !== undefined ? options.enableCache : true;
    this.providerFactory = LLMProviderFactory.getInstance();

    logger.info(
      `LLM Service initialized with default provider: ${this.defaultProviderType}`
    );
  }

  /**
   * Explain a transaction using the specified or default LLM provider
   */
  public async explainTransaction(
    transactionBlock: any,
    effects: SuiTransactionBlockResponse,
    providerType?: LLMProviderType
  ): Promise<TransactionExplanation> {
    try {
      // Use specified provider or fall back to default
      const type = providerType || this.defaultProviderType;

      // Get the provider instance
      const provider = this.providerFactory.getProvider(
        type,
        this.providerOptions
      );

      logger.info(
        `Explaining transaction with provider: ${provider.getName()}`
      );

      // Convert transaction data to string formats for the provider
      const transactionData = JSON.stringify(transactionBlock, null, 2);
      const transactionEffects = JSON.stringify(effects, null, 2);

      // Get explanation from the provider
      return await provider.explainTransaction(
        transactionData,
        transactionEffects
      );
    } catch (error) {
      logger.error("Error in LLM explanation", {
        error: (error as Error).message,
        provider: providerType || this.defaultProviderType,
      });

      // Get any provider for the fallback
      const fallbackProvider = this.providerFactory.getProvider(
        this.defaultProviderType
      );
      return {
        summary: "Unable to analyze this transaction",
        explanation:
          "We couldn't generate a detailed explanation due to a service error. Please review the transaction carefully before approving.",
        riskLevel: RiskLevel.UNKNOWN,
        risks: ["Unable to assess risks due to service error"],
        confidence: 0,
        impact: "Unknown impact. Please verify the transaction manually.",
        noteworthy: ["This is a fallback explanation due to service error."],
      };
    }
  }
}

// Export default instance
export const llmService = new LLMService({
  defaultProviderType:
    process.env.DEFAULT_LLM_PROVIDER === "gpt"
      ? LLMProviderType.GPT
      : LLMProviderType.CLAUDE,
  providerOptions: {
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "1024"),
    temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.2"),
  },
});
