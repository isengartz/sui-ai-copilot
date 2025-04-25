import { OpenAI } from "openai";
import { TransactionExplanation } from "@sui-ai-copilot/shared";
import { logger } from "../../utils/logger";
import { PromptTemplate } from "./PromptTemplate";
import { BaseLLMProvider } from "./BaseLLMProvider";

/**
 * GPT (OpenAI) LLM provider implementation
 */
export class GPTProvider extends BaseLLMProvider {
  private readonly client: OpenAI;
  private readonly maxTokens: number;
  private readonly temperature: number;
  private readonly modelName: string;

  constructor(
    options: {
      apiKey?: string;
      maxTokens?: number;
      temperature?: number;
      modelName?: string;
    } = {}
  ) {
    super();
    this.client = new OpenAI({
      apiKey: options.apiKey || process.env.OPENAI_API_KEY,
    });
    this.maxTokens = options.maxTokens || 1024;
    this.temperature = options.temperature || 0.2;
    this.modelName = options.modelName || "gpt-4-turbo";
  }

  /**
   * Generate a transaction explanation using GPT
   */
  public async explainTransaction(
    transactionData: string,
    transactionEffects: string
  ): Promise<TransactionExplanation> {
    try {
      // Get the standardized prompts from the template
      const systemPrompt =
        PromptTemplate.getTransactionExplanationSystemPrompt();
      const userPrompt = PromptTemplate.getTransactionExplanationUserPrompt(
        transactionData,
        transactionEffects
      );

      const response = await this.client.chat.completions.create({
        model: this.modelName,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

      // Parse the JSON response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from GPT");
      }

      return JSON.parse(content) as TransactionExplanation;
    } catch (error) {
      logger.error("GPT explanation error", {
        error: (error as Error).message,
        model: this.modelName,
      });
      return this.getFallbackExplanation(
        "Error generating explanation with GPT"
      );
    }
  }

  /**
   * Get provider name
   */
  public getName(): string {
    return "gpt";
  }
}
