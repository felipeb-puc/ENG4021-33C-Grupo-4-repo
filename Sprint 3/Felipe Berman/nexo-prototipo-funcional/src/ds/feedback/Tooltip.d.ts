import * as React from "react";
export interface TooltipProps {
  label: string;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  style?: React.CSSProperties;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
