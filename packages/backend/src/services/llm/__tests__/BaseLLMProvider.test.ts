import { TransactionExplanation } from "@sui-ai-copilot/shared";
import { BaseLLMProvider } from "../BaseLLMProvider";
import { PromptTemplate } from "../PromptTemplate";

// Mock PromptTemplate.createFallbackExplanation
jest.mock("../PromptTemplate", () => ({
  PromptTemplate: {
    createFallbackExplanation: jest.fn().mockImplementation((errorMessage) => ({
      summary: "Mock fallback",
      explanation: `Mock fallback with ${errorMessage}`,
      riskLevel: "UNKNOWN",
      risks: ["Mock risk"],
      confidence: 0,
      impact: "Mock impact",
      noteworthy: ["Mock note"],
    })),
    getTransactionExplanationSystemPrompt: jest.fn(),
    getTransactionExplanationUserPrompt: jest.fn(),
  },
}));

// Create a concrete implementation of BaseLLMProvider for testing
class MockLLMProvider extends BaseLLMProvider {
  public callGetFallbackExplanation(
    errorMessage: string
  ): TransactionExplanation {
    // Expose the protected method for testing
    return this.getFallbackExplanation(errorMessage);
  }

  // Implementation of abstract methods
  public async explainTransaction(): Promise<TransactionExplanation> {
    throw new Error("Not implemented for test");
  }

  public getName(): string {
    return "mock-provider";
  }
}

describe("BaseLLMProvider", () => {
  let mockProvider: MockLLMProvider;

  beforeEach(() => {
    mockProvider = new MockLLMProvider();
    jest.clearAllMocks();
  });

  describe("getFallbackExplanation", () => {
    it("should call PromptTemplate.createFallbackExplanation with the error message", () => {
      const errorMessage = "Test error";
      mockProvider.callGetFallbackExplanation(errorMessage);

      // Check that the PromptTemplate method was called with the correct argument
      expect(PromptTemplate.createFallbackExplanation).toHaveBeenCalledWith(
        errorMessage
      );
    });

    it("should return the result from PromptTemplate.createFallbackExplanation", () => {
      const errorMessage = "Test error";
      const result = mockProvider.callGetFallbackExplanation(errorMessage);

      // Check that the result matches what we mocked
      expect(result.summary).toBe("Mock fallback");
      expect(result.explanation).toBe(`Mock fallback with ${errorMessage}`);
      expect(result.riskLevel).toBe("UNKNOWN");
    });
  });
});
