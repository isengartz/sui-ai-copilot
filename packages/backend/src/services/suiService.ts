import { SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
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
  private readonly client: SuiClient;

  constructor(options: SuiServiceOptions = {}) {
    this.client = new SuiClient({
      url:
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
  public getClient(): SuiClient {
    return this.client;
  }

  /**
   * Inspect a transaction without executing it
   */
  public async inspectTransaction(
    transactionBlock: Transaction | string,
    sender: string
  ): Promise<any> {
    try {
      logger.info("Inspecting transaction", { sender });

      // Handle string transaction block by deserializing it
      let txBlock: Transaction;
      if (typeof transactionBlock === "string") {
        txBlock = Transaction.from(transactionBlock);
      } else {
        txBlock = transactionBlock;
      }

      // Ensure the transaction block is built
      if (!txBlock.blockData) {
        await txBlock.build({ client: this.client });
      }

      // Use serialized form
      const serialized = txBlock.serialize();

      return await this.client.devInspectTransactionBlock({
        transactionBlock: serialized,
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
    transactionBlock: Transaction | string,
    sender: string
  ): Promise<SuiTransactionBlockResponse> {
    try {
      logger.info("Simulating transaction", { sender });

      // Handle string transaction block by deserializing it
      let txBlock: Transaction;
      if (typeof transactionBlock === "string") {
        txBlock = Transaction.from(transactionBlock);
      } else {
        txBlock = transactionBlock;
      }

      // Ensure the transaction block is built
      if (!txBlock.blockData) {
        await txBlock.build({ client: this.client });
      }

      // Execute as a dry run
      const serialized = txBlock.serialize();

      return await this.client.executeTransactionBlock({
        transactionBlock: serialized,
        signature: ["AA=="], // Dummy signature
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
          showInput: true,
          showBalanceChanges: true,
        },
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
