import express from "express";
import TransactionController from "../controllers/transactionController";
import { validateRequest } from "../middleware/validator";
import { explainTransactionSchema } from "../schemas/transactionSchema";

// Create router
const router = express.Router();

/**
 * @route POST /api/transaction/explain
 * @description Explain a transaction with AI
 * @access Public
 */
router.post(
  "/explain",
  validateRequest(explainTransactionSchema),
  TransactionController.explainTransaction
);

export default router;
