import { z } from "zod";

/**
 * Schema for transaction context
 */
export const transactionContextSchema = z
  .object({
    packageId: z.string().optional(),
    module: z.string().optional(),
    function: z.string().optional(),
    dAppName: z.string().optional(),
    dAppUrl: z.string().url().optional(),
  })
  .optional();

/**
 * Schema for explain transaction request
 */
export const explainTransactionSchema = z.object({
  body: z.object({
    // Accept either a string or an object for transactionBlock
    transactionBlock: z.union([
      z.string().min(1, "Transaction block is required"),
      z.record(z.any()),
    ]),
    // Sui address format, typically starts with 0x
    sender: z.string().regex(/^0x[a-fA-F0-9]+$/, "Invalid Sui address format"),
    // Optional transaction context
    context: transactionContextSchema,
  }),
  // Placeholders for query and params
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export default {
  explainTransactionSchema,
};
