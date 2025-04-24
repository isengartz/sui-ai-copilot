// @ts-ignore - Ignore type errors with Anthropic SDK
import { Anthropic } from "@anthropic-ai/sdk";
import { OpenAI } from "openai";
import { TransactionExplanation, RiskLevel } from "@sui-ai-copilot/shared";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { logger } from "../utils/logger";

// Initialize LLM clients
// @ts-ignore - Ignore type errors with Anthropic SDK
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Types of supported LLM providers
 */
export enum LLMProvider {
  CLAUDE = "claude",
  GPT = "gpt",
}

/**
 * Options for the LLM service
 */
export interface LLMServiceOptions {
  /** Default LLM provider to use */
  defaultProvider?: LLMProvider;
  /** Whether to enable caching */
  enableCache?: boolean;
  /** Maximum token limit for generation */
  maxTokens?: number;
  /** Temperature for generation */
  temperature?: number;
}

/**
 * Service to interact with language models for explanations
 */
export class LLMService {
  private readonly defaultProvider: LLMProvider;
  private readonly enableCache: boolean;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(options: LLMServiceOptions = {}) {
    this.defaultProvider = options.defaultProvider || LLMProvider.CLAUDE;
    this.enableCache =
      options.enableCache !== undefined ? options.enableCache : true;
    this.maxTokens = options.maxTokens || 1024;
    this.temperature = options.temperature || 0.2;
  }

  /**
   * Generate a transaction explanation using Claude
   */
  private async explainWithClaude(
    transactionData: string,
    transactionEffects: string
  ): Promise<TransactionExplanation> {
    try {
      const prompt = `You are an AI assistant that explains Sui blockchain transactions to users.
Your task is to analyze transaction data and effects, then provide a clear, concise explanation.
Focus on what the transaction does, any assets involved, potential risks, and impact on the user.
Be specific about token amounts, NFTs, permissions, or any other important details.
Always rate the risk level (LOW, MEDIUM, HIGH, CRITICAL) based on potential impact.

Please explain this Sui transaction in simple terms.

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

      // @ts-ignore - Ignore type errors with Anthropic SDK
      const response = await (anthropic as any).messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system:
          "You analyze blockchain transactions and explain them in simple terms, focusing on what they do and any risks.",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      });

      // Parse the JSON response
      // @ts-ignore - Ignore type errors with Anthropic SDK response
      const content = response.content[0].text;
      return JSON.parse(content) as TransactionExplanation;
    } catch (error) {
      logger.error("Claude explanation error", {
        error: (error as Error).message,
      });
      return this.getFallbackExplanation(
        "Error generating explanation with Claude"
      );
    }
  }

  /**
   * Generate a transaction explanation using GPT-4
   */
  private async explainWithGPT(
    transactionData: string,
    transactionEffects: string
  ): Promise<TransactionExplanation> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that explains Sui blockchain transactions to users.
Your task is to analyze transaction data and effects, then provide a clear, concise explanation.
Focus on what the transaction does, any assets involved, potential risks, and impact on the user.
Be specific about token amounts, NFTs, permissions, or any other important details.
Always rate the risk level (LOW, MEDIUM, HIGH, CRITICAL) based on potential impact.`,
          },
          {
            role: "user",
            content: `Please explain this Sui transaction in simple terms.
            
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
}`,
          },
        ],
      });

      // Parse the JSON response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from GPT-4");
      }

      return JSON.parse(content) as TransactionExplanation;
    } catch (error) {
      logger.error("GPT explanation error", {
        error: (error as Error).message,
      });
      return this.getFallbackExplanation(
        "Error generating explanation with GPT-4"
      );
    }
  }

  /**
   * Generate a fallback explanation when LLM services fail
   */
  private getFallbackExplanation(errorMessage: string): TransactionExplanation {
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

  /**
   * Explain a transaction using the specified or default LLM provider
   */
  public async explainTransaction(
    transactionBlock: any,
    effects: SuiTransactionBlockResponse,
    provider?: LLMProvider
  ): Promise<TransactionExplanation> {
    const llmProvider = provider || this.defaultProvider;

    // Stringify the transaction data and effects for the LLM
    const transactionData = JSON.stringify(transactionBlock, null, 2);
    const transactionEffects = JSON.stringify(effects, null, 2);

    // Generate explanation based on provider
    if (llmProvider === LLMProvider.CLAUDE) {
      return await this.explainWithClaude(transactionData, transactionEffects);
    } else if (llmProvider === LLMProvider.GPT) {
      return await this.explainWithGPT(transactionData, transactionEffects);
    } else {
      logger.error("Unknown LLM provider", { provider: llmProvider });
      return this.getFallbackExplanation("Invalid LLM provider specified");
    }
  }
}

// Export default instance
export const llmService = new LLMService();
