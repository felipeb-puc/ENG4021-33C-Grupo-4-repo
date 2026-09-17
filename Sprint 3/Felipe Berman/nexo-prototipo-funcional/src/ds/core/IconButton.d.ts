import * as React from "react";
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide icon name. */
  name: string;
  /** Accessible label — required, the button has no text. */
  label: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
