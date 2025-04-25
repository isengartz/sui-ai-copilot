import { TransactionExplanation } from "@sui-ai-copilot/shared";

/**
 * Interface for LLM providers
 * Any LLM provider must implement this interface to be used in the service
 */
export interface ILLMProvider {
  /**
   * Generate a transaction explanation from transaction data and effects
   * @param transactionData Serialized transaction data
   * @param transactionEffects Transaction effects data
   * @returns A structured explanation of the transaction
   */
  explainTransaction(
    transactionData: string,
    transactionEffects: string
  ): Promise<TransactionExplanation>;

  /**
   * Get the name of the LLM provider
   * @returns The name identifier for the provider
   */
  getName(): string;
}
