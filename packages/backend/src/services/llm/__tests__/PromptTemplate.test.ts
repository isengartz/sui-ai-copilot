import { RiskLevel } from "@sui-ai-copilot/shared";
import { PromptTemplate } from "../PromptTemplate";

describe("PromptTemplate", () => {
  describe("getTransactionExplanationSystemPrompt", () => {
    it("should return a system prompt for transaction explanation", () => {
      const prompt = PromptTemplate.getTransactionExplanationSystemPrompt();

      // Check that the prompt contains key instructions
      expect(prompt).toContain("analyze blockchain transactions");
      expect(prompt).toContain("explain them in simple terms");
      expect(prompt).toContain("rate the risk level");
    });
  });

  describe("getTransactionExplanationUserPrompt", () => {
    it("should include transaction data and effects in the prompt", () => {
      const transactionData = '{"txData": "sample data"}';
      const transactionEffects = '{"effects": "sample effects"}';

      const prompt = PromptTemplate.getTransactionExplanationUserPrompt(
        transactionData,
        transactionEffects
      );

      // Check that the prompt includes the transaction data and effects
      expect(prompt).toContain(transactionData);
      expect(prompt).toContain(transactionEffects);

      // Check that it contains instructions for response formatting
      expect(prompt).toContain("Format your response as a JSON object");
      expect(prompt).toContain('"summary":');
      expect(prompt).toContain('"explanation":');
      expect(prompt).toContain('"riskLevel":');
      expect(prompt).toContain('"risks":');
    });
  });

  describe("createFallbackExplanation", () => {
    it("should create a fallback explanation with the error message", () => {
      const errorMessage = "Service unavailable";
      const fallback = PromptTemplate.createFallbackExplanation(errorMessage);

      // Check the structure of the fallback explanation
      expect(fallback.summary).toBe("Unable to analyze this transaction");
      expect(fallback.explanation).toContain(errorMessage);
      expect(fallback.riskLevel).toBe(RiskLevel.UNKNOWN);
      expect(Array.isArray(fallback.risks)).toBe(true);
      expect(fallback.confidence).toBe(0);
      expect(typeof fallback.impact).toBe("string");
      expect(Array.isArray(fallback.noteworthy)).toBe(true);
    });
  });
});
