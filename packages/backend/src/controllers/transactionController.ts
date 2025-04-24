import { Request, Response, NextFunction } from "express";
import { ExplainTransactionRequest } from "@sui-ai-copilot/shared";
import { transactionService } from "../services/transactionService";
import { createContextLogger } from "../utils/logger";

/**
 * Controller for transaction-related endpoints
 */
export class TransactionController {
  /**
   * Explain a transaction using AI
   */
  public static async explainTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const requestId = req.headers["x-request-id"] as string;
      const logger = createContextLogger(requestId);

      logger.info("Explaining transaction", { sender: req.body.sender });

      // Extract request data
      const request: ExplainTransactionRequest = {
        transactionBlock: req.body.transactionBlock,
        sender: req.body.sender,
        context: req.body.context,
      };

      // Process the request
      const explanation = await transactionService.explainTransaction(request);

      // Return the explanation
      res.status(200).json({
        success: true,
        data: explanation,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default TransactionController;
