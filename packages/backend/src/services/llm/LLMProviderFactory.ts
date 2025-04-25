import { ILLMProvider } from "./ILLMProvider";
import { ClaudeProvider } from "./ClaudeProvider";
import { GPTProvider } from "./GPTProvider";
import { logger } from "../../utils/logger";

/**
 * Enum for supported LLM providers
 */
export enum LLMProviderType {
  CLAUDE = "claude",
  GPT = "gpt",
}

/**
 * Options for LLM provider creation
 */
export interface LLMProviderOptions {
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
  modelName?: string;
}

/**
 * Factory for creating LLM providers
 */
export class LLMProviderFactory {
  private static instance: LLMProviderFactory;
  private providerCache: Map<string, ILLMProvider> = new Map();

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of the factory
   */
  public static getInstance(): LLMProviderFactory {
    if (!LLMProviderFactory.instance) {
      LLMProviderFactory.instance = new LLMProviderFactory();
    }
    return LLMProviderFactory.instance;
  }

  /**
   * Create or retrieve a provider from cache
   */
  public getProvider(
    type: LLMProviderType,
    options: LLMProviderOptions = {}
  ): ILLMProvider {
    // Generate a cache key based on provider type and options
    const cacheKey = this.generateCacheKey(type, options);

    // Check if provider is cached
    if (this.providerCache.has(cacheKey)) {
      return this.providerCache.get(cacheKey)!;
    }

    // Create a new provider
    let provider: ILLMProvider;

    switch (type) {
      case LLMProviderType.CLAUDE:
        provider = new ClaudeProvider(options);
        break;
      case LLMProviderType.GPT:
        provider = new GPTProvider(options);
        break;
      default:
        logger.warn(`Unknown provider type: ${type}, falling back to Claude`);
        provider = new ClaudeProvider(options);
    }

    // Cache the provider
    this.providerCache.set(cacheKey, provider);

    return provider;
  }

  /**
   * Generate a unique cache key for provider type and options
   */
  private generateCacheKey(
    type: LLMProviderType,
    options: LLMProviderOptions
  ): string {
    return `${type}-${options.modelName || "default"}-${
      options.maxTokens || "default"
    }-${options.temperature || "default"}`;
  }

  /**
   * Clear the provider cache
   */
  public clearCache(): void {
    this.providerCache.clear();
  }
}
