import { ClaudeProvider } from "../ClaudeProvider";
import { PromptTemplate } from "../PromptTemplate";

// Mock the Anthropic client
jest.mock("@anthropic-ai/sdk", () => {
  return {
    Anthropic: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [
            {
              text: JSON.stringify({
                summary: "Mock Claude summary",
                explanation: "Mock Claude explanation",
                riskLevel: "LOW",
                risks: [],
                confidence: 85,
                impact: "Mock Claude impact",
                noteworthy: ["Mock Claude note"],
              }),
            },
          ],
        }),
      },
    })),
  };
});

// Mock PromptTemplate methods
jest.mock("../PromptTemplate", () => ({
  PromptTemplate: {
    getTransactionExplanationSystemPrompt: jest
      .fn()
      .mockReturnValue("mock system prompt"),
    getTransactionExplanationUserPrompt: jest
      .fn()
      .mockReturnValue("mock user prompt"),
    createFallbackExplanation: jest.fn().mockImplementation((errorMessage) => ({
      summary: "Mock fallback",
      explanation: `Mock fallback with ${errorMessage}`,
      riskLevel: "UNKNOWN",
      risks: ["Mock risk"],
      confidence: 0,
      impact: "Mock impact",
      noteworthy: ["Mock note"],
    })),
  },
}));

// Mocking the logger to avoid test output noise
jest.mock("../../../utils/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("ClaudeProvider", () => {
  let provider: ClaudeProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new ClaudeProvider({
      apiKey: "test-api-key",
      maxTokens: 100,
      temperature: 0.5,
      modelName: "claude-test-model",
    });
  });

  describe("constructor", () => {
    it("should initialize with provided options", () => {
      const Anthropic = require("@anthropic-ai/sdk").Anthropic;
      expect(Anthropic).toHaveBeenCalledWith({
        apiKey: "test-api-key",
      });

      // Test that properties are set (indirectly through other methods)
      expect(provider.getName()).toBe("claude");
    });

    it("should use environment variables if options are not provided", () => {
      process.env.ANTHROPIC_API_KEY = "env-api-key";

      new ClaudeProvider();

      const Anthropic = require("@anthropic-ai/sdk").Anthropic;
      expect(Anthropic).toHaveBeenCalledWith({
        apiKey: "env-api-key",
      });

      // Clean up
      delete process.env.ANTHROPIC_API_KEY;
    });
  });

  describe("explainTransaction", () => {
    const transactionData = '{"txData": "sample data"}';
    const transactionEffects = '{"effects": "sample effects"}';

    it("should get prompts from PromptTemplate", async () => {
      await provider.explainTransaction(transactionData, transactionEffects);

      expect(
        PromptTemplate.getTransactionExplanationSystemPrompt
      ).toHaveBeenCalled();
      expect(
        PromptTemplate.getTransactionExplanationUserPrompt
      ).toHaveBeenCalledWith(transactionData, transactionEffects);
    });

    it("should call Anthropic API with correct parameters", async () => {
      await provider.explainTransaction(transactionData, transactionEffects);

      const Anthropic = require("@anthropic-ai/sdk").Anthropic;
      const anthropicInstance = Anthropic.mock.results[0].value;
      const createMock = anthropicInstance.messages.create;

      expect(createMock).toHaveBeenCalledWith({
        model: "claude-test-model",
        max_tokens: 100,
        temperature: 0.5,
        system: "mock system prompt",
        messages: [
          {
            role: "user",
            content: "mock user prompt",
          },
        ],
        response_format: { type: "json_object" },
      });
    });

    it("should return parsed JSON from Anthropic response", async () => {
      const result = await provider.explainTransaction(
        transactionData,
        transactionEffects
      );

      expect(result).toEqual({
        summary: "Mock Claude summary",
        explanation: "Mock Claude explanation",
        riskLevel: "LOW",
        risks: [],
        confidence: 85,
        impact: "Mock Claude impact",
        noteworthy: ["Mock Claude note"],
      });
    });

    it("should handle API errors and return fallback explanation", async () => {
      // Setup Anthropic to throw an error
      const Anthropic = require("@anthropic-ai/sdk").Anthropic;
      const anthropicInstance = Anthropic.mock.results[0].value;
      anthropicInstance.messages.create.mockRejectedValueOnce(
        new Error("API error")
      );

      const result = await provider.explainTransaction(
        transactionData,
        transactionEffects
      );

      expect(PromptTemplate.createFallbackExplanation).toHaveBeenCalledWith(
        "Error generating explanation with Claude"
      );

      expect(result).toEqual({
        summary: "Mock fallback",
        explanation:
          "Mock fallback with Error generating explanation with Claude",
        riskLevel: "UNKNOWN",
        risks: ["Mock risk"],
        confidence: 0,
        impact: "Mock impact",
        noteworthy: ["Mock note"],
      });
    });
  });

  describe("getName", () => {
    it("should return the provider name", () => {
      expect(provider.getName()).toBe("claude");
    });
  });
});
