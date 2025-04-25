// @ts-ignore - Ignore type errors with Anthropic SDK
import { Anthropic } from "@anthropic-ai/sdk";
import { TransactionExplanation } from "@sui-ai-copilot/shared";
import { logger } from "../../utils/logger";
import { PromptTemplate } from "./PromptTemplate";
import { BaseLLMProvider } from "./BaseLLMProvider";

/**
 * Claude LLM provider implementation
 */
export class ClaudeProvider extends BaseLLMProvider {
  private readonly client: Anthropic;
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
    this.client = new Anthropic({
      apiKey: options.apiKey || process.env.ANTHROPIC_API_KEY || "",
    });
    this.maxTokens = options.maxTokens || 1024;
    this.temperature = options.temperature || 0.2;
    this.modelName = options.modelName || "claude-3-sonnet-20240229";
  }

  /**
   * Generate a transaction explanation using Claude
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

      // @ts-ignore - Ignore type errors with Anthropic SDK
      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
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
        model: this.modelName,
      });
      return this.getFallbackExplanation(
        "Error generating explanation with Claude"
      );
    }
  }

  /**
   * Get provider name
   */
  public getName(): string {
    return "claude";
  }
}
