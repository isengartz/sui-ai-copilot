import { TransactionExplanation } from "@sui-ai-copilot/shared";
import { OpenAI } from "openai";
import { GPTProvider } from "../GPTProvider";
import { PromptTemplate } from "../PromptTemplate";

// Mock the OpenAI client
jest.mock("openai", () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    summary: "Mock summary",
                    explanation: "Mock explanation",
                    riskLevel: "LOW",
                    risks: [],
                    confidence: 90,
                    impact: "Mock impact",
                    noteworthy: ["Mock note"],
                  }),
                },
              },
            ],
          }),
        },
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
    getGPTResponseFormat: jest.fn().mockReturnValue({ type: "json_object" }),
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

describe("GPTProvider", () => {
  let provider: GPTProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new GPTProvider({
      apiKey: "test-api-key",
      maxTokens: 100,
      temperature: 0.5,
      modelName: "gpt-4-test",
    });
  });

  describe("constructor", () => {
    it("should initialize with provided options", () => {
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: "test-api-key",
      });

      // Test that properties are set (indirectly through other methods)
      expect(provider.getName()).toBe("gpt");
    });

    it("should use environment variables if options are not provided", () => {
      process.env.OPENAI_API_KEY = "env-api-key";

      new GPTProvider();

      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: "env-api-key",
      });

      // Clean up
      delete process.env.OPENAI_API_KEY;
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

    it("should call OpenAI API with correct parameters", async () => {
      await provider.explainTransaction(transactionData, transactionEffects);

      const openaiInstance = (OpenAI as unknown as jest.Mock).mock.results[0]
        .value;
      const createMock = openaiInstance.chat.completions.create;

      expect(createMock).toHaveBeenCalledWith({
        model: "gpt-4-test",
        max_tokens: 100,
        temperature: 0.5,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "mock system prompt",
          },
          {
            role: "user",
            content: "mock user prompt",
          },
        ],
      });
    });

    it("should return parsed JSON from OpenAI response", async () => {
      const result = await provider.explainTransaction(
        transactionData,
        transactionEffects
      );

      expect(result).toEqual({
        summary: "Mock summary",
        explanation: "Mock explanation",
        riskLevel: "LOW",
        risks: [],
        confidence: 90,
        impact: "Mock impact",
        noteworthy: ["Mock note"],
      });
    });

    it("should handle API errors and return fallback explanation", async () => {
      // Setup OpenAI to throw an error
      const openaiInstance = (OpenAI as unknown as jest.Mock).mock.results[0]
        .value;
      openaiInstance.chat.completions.create.mockRejectedValueOnce(
        new Error("API error")
      );

      const result = await provider.explainTransaction(
        transactionData,
        transactionEffects
      );

      expect(PromptTemplate.createFallbackExplanation).toHaveBeenCalledWith(
        "Error generating explanation with GPT"
      );

      expect(result).toEqual({
        summary: "Mock fallback",
        explanation: "Mock fallback with Error generating explanation with GPT",
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
      expect(provider.getName()).toBe("gpt");
    });
  });
});
