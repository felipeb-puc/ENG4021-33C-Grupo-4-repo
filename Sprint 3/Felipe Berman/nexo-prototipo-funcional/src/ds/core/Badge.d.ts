import * as React from "react";
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "accent" | "inverse" | "success" | "warning" | "danger";
  /** Lucide icon name shown before the label. */
  icon?: string;
}
export declare function Badge(props: BadgeProps): JSX.Element;
