import React, { useEffect, useState } from 'react';
import { 
  RiskLevel, 
  TransactionExplanation, 
  WidgetPosition,
  WidgetTheme
} from '@sui-ai-copilot/shared';
import { SuiAICopilot, SdkEvent } from '@sui-ai-copilot/sdk';
import RiskBadge from './RiskBadge';
import ExplanationDetails from './ExplanationDetails';
import './CopilotWidget.css';

export interface CopilotWidgetProps {
  /** SDK instance */
  sdk?: SuiAICopilot;
  /** Position of the widget */
  position?: WidgetPosition;
  /** Theme of the widget */
  theme?: WidgetTheme;
  /** Whether to show the widget (can be controlled externally) */
  isVisible?: boolean;
  /** Whether to show the risk level */
  showRiskLevel?: boolean;
  /** Whether to show the confidence score */
  showConfidence?: boolean;
  /** Called when the widget is closed */
  onClose?: () => void;
  /** Called when a transaction is explained */
  onExplained?: (explanation: TransactionExplanation) => void;
  /** Custom CSS class */
  className?: string;
}

/**
 * The main Copilot widget component that displays transaction explanations
 */
const CopilotWidget: React.FC<CopilotWidgetProps> = ({
  sdk,
  position = WidgetPosition.BOTTOM,
  theme = WidgetTheme.LIGHT,
  isVisible = false,
  showRiskLevel = true,
  showConfidence = true,
  onClose,
  onExplained,
  className = '',
}) => {
  const [visible, setVisible] = useState<boolean>(isVisible);
  const [explanation, setExplanation] = useState<TransactionExplanation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Apply the theme
  const themeClass = theme === WidgetTheme.DARK 
    ? 'dark' 
    : theme === WidgetTheme.SYSTEM 
      ? 'system-theme' 
      : 'light';

  // Handle SDK events
  useEffect(() => {
    if (!sdk) return;

    const handleExplanation = (data: any) => {
      setExplanation(data.explanation);
      setIsLoading(false);
      setError(null);
      onExplained?.(data.explanation);
    };

    const handleError = (data: any) => {
      setError(data.error);
      setIsLoading(false);
    };

    // Listen for SDK events
    sdk.on(SdkEvent.TRANSACTION_EXPLAINED, handleExplanation);
    sdk.on(SdkEvent.EXPLANATION_ERROR, handleError);

    return () => {
      // Clean up event listeners
      sdk.off(SdkEvent.TRANSACTION_EXPLAINED, handleExplanation);
      sdk.off(SdkEvent.EXPLANATION_ERROR, handleError);
    };
  }, [sdk, onExplained]);

  // Update visibility when prop changes
  useEffect(() => {
    setVisible(isVisible);
  }, [isVisible]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  // If not visible, don't render
  if (!visible) return null;

  return (
    <div 
      className={`sui-ai-copilot-widget ${position} ${themeClass} ${className}`}
      data-testid="copilot-widget"
    >
      <div className="widget-header">
        <div className="widget-title">
          <h3>Sui AI Copilot</h3>
          {showRiskLevel && explanation && (
            <RiskBadge level={explanation.riskLevel} />
          )}
        </div>
        <button 
          className="close-button" 
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="widget-content">
        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing transaction...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button className="retry-button">Retry</button>
          </div>
        )}

        {!isLoading && !error && explanation && (
          <ExplanationDetails 
            explanation={explanation} 
            showConfidence={showConfidence}
          />
        )}

        {!isLoading && !error && !explanation && (
          <div className="empty-state">
            <p>No transaction to explain yet.</p>
          </div>
        )}
      </div>

      <div className="widget-footer">
        <div className="branding">
          Powered by Sui AI Copilot
        </div>
      </div>
    </div>
  );
};

export default CopilotWidget; 