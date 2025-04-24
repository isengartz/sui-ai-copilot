import {
  SuiTransactionBlockResponse,
  SuiAddress,
  TransactionBlock,
} from "@mysten/sui.js";

/**
 * Risk level of a transaction
 */
export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
  UNKNOWN = "UNKNOWN",
}

/**
 * Transaction context providing additional information for explanation
 */
export interface TransactionContext {
  /** The package ID of the contract being called */
  packageId?: string;
  /** The module name within the package */
  module?: string;
  /** The function name being called */
  function?: string;
  /** The dApp name if available */
  dAppName?: string;
  /** The dApp URL for attribution */
  dAppUrl?: string;
}

/**
 * Explanation of a transaction from the AI
 */
export interface TransactionExplanation {
  /** Simple one-line summary of the transaction */
  summary: string;
  /** Detailed explanation in natural language */
  explanation: string;
  /** Assessed risk level */
  riskLevel: RiskLevel;
  /** Specific risks identified, if any */
  risks: string[];
  /** Confidence score of the explanation (0-100) */
  confidence: number;
  /** Potential impact on user's assets or permissions */
  impact: string;
  /** Details that might need user attention */
  noteworthy: string[];
}

/**
 * Request to explain a transaction
 */
export interface ExplainTransactionRequest {
  /** The transaction block to be executed */
  transactionBlock: TransactionBlock | string;
  /** The sender's address */
  sender: SuiAddress;
  /** Additional context about the transaction */
  context?: TransactionContext;
}

/**
 * Response from explaining a transaction
 */
export interface ExplainTransactionResponse {
  /** The ID of the transaction if available */
  transactionId?: string;
  /** The explanation of the transaction */
  explanation: TransactionExplanation;
  /** The simulated effects of the transaction */
  simulatedEffects?: SuiTransactionBlockResponse;
}
