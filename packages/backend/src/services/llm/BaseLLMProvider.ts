import { TransactionExplanation } from "@sui-ai-copilot/shared";
import { ILLMProvider } from "./ILLMProvider";
import { PromptTemplate } from "./PromptTemplate";

/**
 * Base class for LLM providers with shared functionality
 */
export abstract class BaseLLMProvider implements ILLMProvider {
  /**
   * Each provider must implement this method to handle model-specific logic
   */
  public abstract explainTransaction(
    transactionData: string,
    transactionEffects: string
  ): Promise<TransactionExplanation>;

  /**
   * Each provider must implement this method to return its identifier
   */
  public abstract getName(): string;

  /**
   * Generate a fallback explanation when LLM services fail
   * Shared implementation for all providers
   */
  protected getFallbackExplanation(
    errorMessage: string
  ): TransactionExplanation {
    return PromptTemplate.createFallbackExplanation(errorMessage);
  }
}
