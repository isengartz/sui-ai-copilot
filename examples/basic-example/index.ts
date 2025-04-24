import { SuiAICopilot } from "@sui-ai-copilot/sdk";
import { TransactionBlock } from "@mysten/sui.js";

// Initialize the copilot
const copilot = new SuiAICopilot({
  api: {
    apiUrl: process.env.API_URL || "http://localhost:3000",
    apiKey: process.env.API_KEY,
  },
  debug: true,
});

async function explainTransaction() {
  try {
    // Create a simple transaction
    const tx = new TransactionBlock();

    // Add some sample function calls
    // This is just a demonstration - in a real app you'd have actual calls
    tx.moveCall({
      target: "0x3::sui::transfer",
      arguments: [
        tx.object("0x6"),
        tx.pure(
          "0x7e3fe74764f147a53a76e3b6ce55d8f6a0c952d9b3fc79874bf61bddef552d1b"
        ),
      ],
    });

    // Get the sender address
    const sender =
      "0x7e3fe74764f147a53a76e3b6ce55d8f6a0c952d9b3fc79874bf61bddef552d1b";

    console.log("Explaining transaction...");

    // Explain the transaction
    const explanation = await copilot.explainTransaction(tx, sender);

    // Log the results
    console.log("\n------- Transaction Explanation -------");
    console.log(`Summary: ${explanation.explanation.summary}`);
    console.log(`Risk Level: ${explanation.explanation.riskLevel}`);
    console.log("\nDetailed Explanation:");
    console.log(explanation.explanation.explanation);

    if (explanation.explanation.risks.length > 0) {
      console.log("\nRisks:");
      explanation.explanation.risks.forEach((risk, i) => {
        console.log(`${i + 1}. ${risk}`);
      });
    }

    console.log("\nImpact:");
    console.log(explanation.explanation.impact);

    console.log("\nConfidence Score:", explanation.explanation.confidence);
  } catch (error) {
    console.error("Error explaining transaction:", error);
  }
}

// Run the example
explainTransaction();
