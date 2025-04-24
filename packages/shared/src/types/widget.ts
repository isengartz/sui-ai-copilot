/**
 * Position of the widget in the dApp
 */
export enum WidgetPosition {
  TOP = "top",
  BOTTOM = "bottom",
  LEFT = "left",
  RIGHT = "right",
  CENTER = "center",
  TOP_LEFT = "top-left",
  TOP_RIGHT = "top-right",
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_RIGHT = "bottom-right",
}

/**
 * Theme of the widget
 */
export enum WidgetTheme {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

/**
 * Widget configuration options
 */
export interface WidgetConfig {
  /** Position of the widget */
  position?: WidgetPosition;
  /** Theme of the widget */
  theme?: WidgetTheme;
  /** Whether to show risk level */
  showRiskLevel?: boolean;
  /** Whether to show confidence score */
  showConfidence?: boolean;
  /** Whether to automatically show for all transactions */
  autoShow?: boolean;
  /** Custom CSS class to apply to the widget */
  customClass?: string;
  /** Base URL for the backend API */
  apiUrl?: string;
  /** Show debug information */
  debug?: boolean;
}
