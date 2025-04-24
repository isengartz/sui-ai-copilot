import {
  JsonRpcProvider,
  TransactionBlock,
  SuiTransactionBlockResponse,
  SuiClient,
  DevInspectResults,
} from "@mysten/sui.js";
import { TransactionContext } from "@sui-ai-copilot/shared";

/**
 * Options for the transaction analyzer
 */
export interface TransactionAnalyzerOptions {
  /** RPC URL for Sui node */
  rpcUrl?: string;
  /** Custom Sui client */
  client?: SuiClient | JsonRpcProvider;
}

/**
 * Analyzes Sui transactions to provide enriched data for explanations
 */
export class TransactionAnalyzer {
  private readonly client: SuiClient | JsonRpcProvider;

  constructor(options: TransactionAnalyzerOptions = {}) {
    if (options.client) {
      this.client = options.client;
    } else {
      this.client = new JsonRpcProvider({
        fullnode: options.rpcUrl || "https://fullnode.mainnet.sui.io",
      });
    }
  }

  /**
   * Inspect a transaction without executing it
   */
  public async inspectTransaction(
    transactionBlock: TransactionBlock,
    sender: string
  ): Promise<DevInspectResults> {
    // Ensure the transaction block is built
    if (!transactionBlock.blockData) {
      await transactionBlock.build({ provider: this.client });
    }

    return await this.client.devInspectTransactionBlock({
      transactionBlock,
      sender,
    });
  }

  /**
   * Extracts module and function information from a transaction
   */
  public extractTransactionContext(
    transactionBlock: TransactionBlock
  ): TransactionContext | undefined {
    try {
      // This is a simplified implementation.
      // In a real implementation, we would need to parse the transaction data
      // to extract these details more accurately.
      const tx = transactionBlock.blockData;
      if (!tx) return undefined;

      // Extract function calls from transaction (simplified)
      const moveCalls = tx.transactions.filter(
        (t: any) => t.kind === "MoveCall"
      );

      if (moveCalls.length === 0) return undefined;

      const firstCall = moveCalls[0];

      // Extract target and function information
      return {
        packageId: firstCall.target.split("::")[0],
        module: firstCall.target.split("::")[1],
        function: firstCall.target.split("::")[2],
      };
    } catch (error) {
      console.error("Error extracting transaction context:", error);
      return undefined;
    }
  }

  /**
   * Simulate a transaction to get its effects
   */
  public async simulateTransaction(
    transactionBlock: TransactionBlock,
    sender: string
  ): Promise<SuiTransactionBlockResponse> {
    // Ensure the transaction block is built
    if (!transactionBlock.blockData) {
      await transactionBlock.build({ provider: this.client });
    }

    return await this.client.executeTransactionBlock({
      transactionBlock,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showInput: true,
        showBalanceChanges: true,
      },
      requestType: "DryRun",
    });
  }
}
