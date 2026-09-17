import * as React from "react";
/**
 * Pill-shaped action button — the brand's primary call to action.
 * @startingPoint section="Core" subtitle="Pill buttons in every brand variant" viewport="700x220"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "dark" | "secondary" | "outline" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
  /** Lucide icon name rendered after the label — usually "arrow-right". */
  icon?: string;
  /** Lucide icon name rendered before the label. */
  iconLeft?: string;
  block?: boolean;
  /** Render as another element, e.g. "a". */
  as?: "button" | "a";
}
export declare function Button(props: ButtonProps): JSX.Element;
