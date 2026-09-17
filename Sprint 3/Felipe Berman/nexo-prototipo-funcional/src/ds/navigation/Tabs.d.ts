import * as React from "react";
export interface TabItem { value: string; label: string; count?: number }
export interface TabsProps {
  items: Array<string | TabItem>;
  value: string;
  onChange?: (value: string) => void;
  /** "underline" for page-level sections, "pill" for compact in-card switching. */
  variant?: "underline" | "pill";
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;
