import * as React from "react";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  /** Error message — also turns the border red. */
  error?: string;
  /** Lucide icon name rendered inside, on the left. */
  icon?: string;
  size?: "sm" | "md" | "lg";
}
export declare function Input(props: InputProps): JSX.Element;
