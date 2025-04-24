import React from 'react';
import { RiskLevel } from '@sui-ai-copilot/shared';
import './RiskBadge.css';

export interface RiskBadgeProps {
  /** The risk level to display */
  level: RiskLevel;
  /** Optional custom class name */
  className?: string;
}

/**
 * Component to display a transaction's risk level
 */
const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = '' }) => {
  // Map risk levels to colors and labels
  const riskInfo = {
    [RiskLevel.LOW]: {
      color: 'bg-success-500',
      label: 'Low Risk',
    },
    [RiskLevel.MEDIUM]: {
      color: 'bg-warning-500',
      label: 'Medium Risk',
    },
    [RiskLevel.HIGH]: {
      color: 'bg-danger-500',
      label: 'High Risk',
    },
    [RiskLevel.CRITICAL]: {
      color: 'bg-danger-600',
      label: 'Critical Risk',
    },
    [RiskLevel.UNKNOWN]: {
      color: 'bg-gray-500',
      label: 'Unknown Risk',
    },
  };

  const { color, label } = riskInfo[level];

  return (
    <div 
      className={`risk-badge ${color} ${className}`}
      data-testid="risk-badge"
      data-risk-level={level}
    >
      {label}
    </div>
  );
};

export default RiskBadge; 