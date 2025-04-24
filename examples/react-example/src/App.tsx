import React, { useState, useEffect } from 'react';
import { CopilotWidget } from '@sui-ai-copilot/widget';
import { SuiAICopilot, SdkEvent, WidgetPosition, WidgetTheme } from '@sui-ai-copilot/sdk';
import { Transaction } from '@mysten/sui/transactions';

// Sample transaction for demo purposes
const createSampleTransaction = () => {
  const tx = new Transaction();
  tx.moveCall({
    target: '0x3::sui::transfer',
    arguments: [
      tx.object('0x6'),
      tx.pure('0x7e3fe74764f147a53a76e3b6ce55d8f6a0c952d9b3fc79874bf61bddef552d1b'),
    ],
  });
  return tx;
};

const App: React.FC = () => {
  const [sdk] = useState(() => 
    new SuiAICopilot({
      api: {
        apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
      },
      debug: true,
    })
  );
  
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<WidgetTheme>(WidgetTheme.LIGHT);
  const [position, setPosition] = useState<WidgetPosition>(WidgetPosition.BOTTOM_RIGHT);
  
  // Handle transaction explanation
  const handleExplainTransaction = async () => {
    setIsLoading(true);
    setIsWidgetVisible(true);
    
    try {
      const tx = createSampleTransaction();
      const sender = '0x7e3fe74764f147a53a76e3b6ce55d8f6a0c952d9b3fc79874bf61bddef552d1b';
      
      // This will trigger the widget to show the explanation via event
      await sdk.explainTransaction(tx, sender);
    } catch (error) {
      console.error('Error explaining transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme(theme === WidgetTheme.LIGHT ? WidgetTheme.DARK : WidgetTheme.LIGHT);
  };
  
  // Change widget position
  const changePosition = () => {
    const positions = [
      WidgetPosition.BOTTOM_RIGHT,
      WidgetPosition.BOTTOM_LEFT,
      WidgetPosition.TOP_RIGHT,
      WidgetPosition.TOP_LEFT,
      WidgetPosition.CENTER,
    ];
    
    const currentIndex = positions.indexOf(position);
    const nextIndex = (currentIndex + 1) % positions.length;
    setPosition(positions[nextIndex]);
  };
  
  return (
    <div className="app">
      <header className="header">
        <h1>Sui AI Copilot Demo</h1>
        <p>This example demonstrates how to integrate the AI Copilot widget into your dApp</p>
      </header>
      
      <main className="main">
        <div className="controls">
          <button 
            onClick={handleExplainTransaction} 
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Explain Transaction'}
          </button>
          
          <button onClick={toggleTheme}>
            Toggle Theme ({theme})
          </button>
          
          <button onClick={changePosition}>
            Change Position ({position})
          </button>
          
          <button onClick={() => setIsWidgetVisible(!isWidgetVisible)}>
            {isWidgetVisible ? 'Hide Widget' : 'Show Widget'}
          </button>
        </div>
        
        <div className="info">
          <h2>How it works</h2>
          <ol>
            <li>Click "Explain Transaction" to simulate a transaction analysis</li>
            <li>The widget will appear with an AI-generated explanation</li>
            <li>Try different themes and positions</li>
          </ol>
        </div>
      </main>
      
      {/* The Copilot Widget */}
      <CopilotWidget
        sdk={sdk}
        position={position}
        theme={theme}
        isVisible={isWidgetVisible}
        showRiskLevel={true}
        showConfidence={true}
        onClose={() => setIsWidgetVisible(false)}
      />
    </div>
  );
};

export default App; 