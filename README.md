# AI Copilot for Sui dApps

An AI assistant that explains transactions and smart contract interactions to users in real-time, enhancing user confidence and trust in dApps built on the Sui blockchain.

## 🚀 Features

- **Transaction Interception**: Hooks into wallet signing flow to analyze pending transactions
- **AI Explanations**: Generates clear, human-readable explanations of what transactions do
- **Risk Assessment**: Identifies potential risks and provides warnings
- **React Widget**: Beautiful UI component for seamless dApp integration
- **TypeScript SDK**: Easy integration for any Sui dApp

## 📦 Project Structure

This is a monorepo with the following packages:

```
sui-ai-copilot/
├── packages/
│   ├── widget/     # React UI component that renders explanations
│   ├── sdk/        # TypeScript SDK for dApp integration
│   ├── backend/    # API service for LLM integration
│   ├── shared/     # Shared types and utilities
├── docs/           # Documentation
├── examples/       # Example integrations
└── scripts/        # Build and deployment scripts
```

## 🔧 Installation

### Prerequisites

- Node.js 16+
- PNPM 8+
- Redis (for backend caching)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sui-ai-copilot.git
cd sui-ai-copilot
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
cp packages/backend/.env.example packages/backend/.env
# Edit the .env file with your API keys
```

4. Build all packages:
```bash
pnpm build
```

## 💻 Development

Start all packages in development mode:
```bash
pnpm dev
```

Run tests:
```bash
pnpm test
```

Lint code:
```bash
pnpm lint
```

## 🔌 Integration Example

### Using the SDK

```typescript
import { SuiAICopilot } from '@sui-ai-copilot/sdk';

// Initialize the copilot
const copilot = new SuiAICopilot({
  api: {
    apiUrl: 'https://your-backend-url.com',
    apiKey: 'your_api_key'
  }
});

// Explain a transaction
const explanation = await copilot.explainTransaction(
  transactionBlock,
  senderAddress
);

console.log(explanation.summary);
```

### Using the Widget

```typescript
import { CopilotWidget } from '@sui-ai-copilot/widget';
import { SuiAICopilot, WidgetPosition, WidgetTheme } from '@sui-ai-copilot/sdk';

// In your React component
function App() {
  const sdk = new SuiAICopilot({
    api: {
      apiUrl: 'https://your-backend-url.com',
    }
  });
  
  return (
    <div>
      <YourDAppContent />
      
      <CopilotWidget
        sdk={sdk}
        position={WidgetPosition.BOTTOM_RIGHT}
        theme={WidgetTheme.DARK}
        isVisible={true}
      />
    </div>
  );
}
```

## 🔒 Security Considerations

The AI Copilot for Sui dApps:
- Never has access to private keys
- Doesn't store sensitive user data
- Provides disclaimers for AI-generated content
- Uses confidence scoring for explanations
- Implements rate limiting on API endpoints

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Sui Foundation](https://sui.io/) for their support
- The Sui developer community
- Anthropic and OpenAI for their LLM APIs
