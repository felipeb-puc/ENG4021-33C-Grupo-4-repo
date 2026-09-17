import * as React from "react";
export interface ToastProps {
  title: string;
  message?: string;
  tone?: "success" | "info" | "warning" | "danger";
  onClose?: () => void;
  style?: React.CSSProperties;
}
export declare function Toast(props: ToastProps): JSX.Element;
