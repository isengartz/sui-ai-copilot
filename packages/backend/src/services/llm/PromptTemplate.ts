import { TransactionExplanation, RiskLevel } from "@sui-ai-copilot/shared";

/**
 * Centralized place for LLM prompting templates and instructions
 * This ensures all providers receive consistent instructions regardless of implementation
 */
export class PromptTemplate {
  /**
   * Get the system prompt for transaction explanations
   * @returns System prompt content
   */
  public static getTransactionExplanationSystemPrompt(): string {
    return `You analyze blockchain transactions and explain them in simple terms, focusing on what they do and any risks.
Your task is to analyze transaction data and effects, then provide a clear, concise explanation.
Focus on what the transaction does, any assets involved, potential risks, and impact on the user.
Be specific about token amounts, NFTs, permissions, or any other important details.
Always rate the risk level (LOW, MEDIUM, HIGH, CRITICAL) based on potential impact.`;
  }

  /**
   * Get the user prompt for transaction explanations
   * @param transactionData The serialized transaction data
   * @param transactionEffects The transaction effects data
   * @returns Formatted user prompt content
   */
  public static getTransactionExplanationUserPrompt(
    transactionData: string,
    transactionEffects: string
  ): string {
    return `Please explain this Sui blockchain transaction in simple terms.

Transaction Data:
${transactionData}

Transaction Effects:
${transactionEffects}

Format your response as a JSON object with the following structure:
{
  "summary": "One-line summary of the transaction",
  "explanation": "Detailed explanation in simple language",
  "riskLevel": "LOW/MEDIUM/HIGH/CRITICAL",
  "risks": ["Risk 1", "Risk 2"],
  "impact": "How this affects the user's assets or permissions",
  "confidence": 85,
  "noteworthy": ["Important detail 1", "Important detail 2"]
}`;
  }

  /**
   * Create a fallback explanation when LLM services fail
   * @param errorMessage The error message to include
   * @returns Standard transaction explanation for error cases
   */
  public static createFallbackExplanation(
    errorMessage: string
  ): TransactionExplanation {
    return {
      summary: "Unable to analyze this transaction",
      explanation: `We couldn't generate a detailed explanation. ${errorMessage}. Please review the transaction carefully before approving.`,
      riskLevel: RiskLevel.UNKNOWN,
      risks: ["Unable to assess risks due to analysis failure"],
      confidence: 0,
      impact: "Unknown impact. Please verify the transaction manually.",
      noteworthy: ["This is a fallback explanation due to service error."],
    };
  }
}
