// Export the main widget component
export { default as CopilotWidget } from "./components/CopilotWidget";
export type { CopilotWidgetProps } from "./components/CopilotWidget";

// Export sub-components
export { default as RiskBadge } from "./components/RiskBadge";
export type { RiskBadgeProps } from "./components/RiskBadge";

export { default as ExplanationDetails } from "./components/ExplanationDetails";
export type { ExplanationDetailsProps } from "./components/ExplanationDetails";

// Re-export shared types for convenience
export * from "@sui-ai-copilot/shared";
