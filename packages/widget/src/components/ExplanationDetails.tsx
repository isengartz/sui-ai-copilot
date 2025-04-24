import React, { useState } from 'react';
import { TransactionExplanation } from '@sui-ai-copilot/shared';
import './ExplanationDetails.css';

export interface ExplanationDetailsProps {
  /** The transaction explanation to display */
  explanation: TransactionExplanation;
  /** Whether to show the confidence score */
  showConfidence?: boolean;
  /** Optional custom class name */
  className?: string;
}

/**
 * Component to display detailed transaction explanations
 */
const ExplanationDetails: React.FC<ExplanationDetailsProps> = ({
  explanation,
  showConfidence = true,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'risks'>('summary');

  // Render confidence score as a progress bar
  const renderConfidenceScore = () => {
    const { confidence } = explanation;
    const confidenceClass = 
      confidence > 80 ? 'high-confidence' :
      confidence > 50 ? 'medium-confidence' :
      'low-confidence';

    return (
      <div className="confidence-score">
        <div className="confidence-label">AI Confidence</div>
        <div className="confidence-bar-container">
          <div 
            className={`confidence-bar ${confidenceClass}`} 
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
        <div className="confidence-value">{confidence}%</div>
      </div>
    );
  };

  return (
    <div className={`explanation-details ${className}`} data-testid="explanation-details">
      {/* Summary at the top */}
      <div className="explanation-summary">
        <h4>{explanation.summary}</h4>
      </div>

      {/* Confidence score */}
      {showConfidence && renderConfidenceScore()}

      {/* Tabs for different sections */}
      <div className="explanation-tabs">
        <button 
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button 
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button 
          className={`tab ${activeTab === 'risks' ? 'active' : ''}`}
          onClick={() => setActiveTab('risks')}
        >
          Risks {explanation.risks.length > 0 && `(${explanation.risks.length})`}
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'summary' && (
          <div className="summary-tab">
            <p>{explanation.explanation}</p>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="details-tab">
            <div className="impact-section">
              <h5>Impact</h5>
              <p>{explanation.impact}</p>
            </div>
            
            {explanation.noteworthy.length > 0 && (
              <div className="noteworthy-section">
                <h5>Worth Noting</h5>
                <ul>
                  {explanation.noteworthy.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="risks-tab">
            {explanation.risks.length > 0 ? (
              <ul className="risks-list">
                {explanation.risks.map((risk, index) => (
                  <li key={index} className="risk-item">
                    {risk}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-risks">No specific risks identified.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplanationDetails; 