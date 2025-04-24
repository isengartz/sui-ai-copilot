import {
  JsonRpcProvider,
  SuiClient,
  TransactionBlock,
  SuiTransactionBlockResponse,
  DevInspectResults,
} from "@mysten/sui.js";
import { logger } from "../utils/logger";

/**
 * Options for the Sui service
 */
export interface SuiServiceOptions {
  /** RPC URL for Sui node */
  rpcUrl?: string;
}

/**
 * Service to interact with the Sui blockchain
 */
export class SuiService {
  private readonly client: JsonRpcProvider;

  constructor(options: SuiServiceOptions = {}) {
    this.client = new JsonRpcProvider({
      fullnode:
        options.rpcUrl ||
        process.env.SUI_RPC_URL ||
        "https://fullnode.mainnet.sui.io",
    });

    logger.info("Initialized Sui service", {
      rpcUrl:
        options.rpcUrl ||
        process.env.SUI_RPC_URL ||
        "https://fullnode.mainnet.sui.io",
    });
  }

  /**
   * Get the client instance
   */
  public getClient(): JsonRpcProvider {
    return this.client;
  }

  /**
   * Inspect a transaction without executing it
   */
  public async inspectTransaction(
    transactionBlock: TransactionBlock | string,
    sender: string
  ): Promise<DevInspectResults> {
    try {
      logger.info("Inspecting transaction", { sender });

      // Handle string transaction block by deserializing it
      let txBlock: TransactionBlock;
      if (typeof transactionBlock === "string") {
        txBlock = TransactionBlock.from(transactionBlock);
      } else {
        txBlock = transactionBlock;
      }

      // Ensure the transaction block is built
      if (!txBlock.blockData) {
        await txBlock.build({ provider: this.client });
      }

      return await this.client.devInspectTransactionBlock({
        transactionBlock: txBlock,
        sender,
      });
    } catch (error) {
      logger.error("Error inspecting transaction", {
        error: (error as Error).message,
        sender,
      });
      throw error;
    }
  }

  /**
   * Simulate a transaction to get its effects
   */
  public async simulateTransaction(
    transactionBlock: TransactionBlock | string,
    sender: string
  ): Promise<SuiTransactionBlockResponse> {
    try {
      logger.info("Simulating transaction", { sender });

      // Handle string transaction block by deserializing it
      let txBlock: TransactionBlock;
      if (typeof transactionBlock === "string") {
        txBlock = TransactionBlock.from(transactionBlock);
      } else {
        txBlock = transactionBlock;
      }

      // Ensure the transaction block is built
      if (!txBlock.blockData) {
        await txBlock.build({ provider: this.client });
      }

      return await this.client.executeTransactionBlock({
        transactionBlock: txBlock,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
          showInput: true,
          showBalanceChanges: true,
        },
        requestType: "DryRun",
      });
    } catch (error) {
      logger.error("Error simulating transaction", {
        error: (error as Error).message,
        sender,
      });
      throw error;
    }
  }

  /**
   * Get object data from the Sui blockchain
   */
  public async getObject(objectId: string) {
    try {
      logger.info("Getting object data", { objectId });

      return await this.client.getObject({
        id: objectId,
        options: {
          showContent: true,
          showOwner: true,
          showType: true,
        },
      });
    } catch (error) {
      logger.error("Error getting object", {
        error: (error as Error).message,
        objectId,
      });
      throw error;
    }
  }
}

// Export default instance
export const suiService = new SuiService();
