import * as React from "react";
/**
 * Surface container — 18px radius, hairline green border, whisper-soft shadow.
 * @startingPoint section="Core" subtitle="Card surfaces: light, tint, dark, accent" viewport="700x260"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "light" | "tint" | "dark" | "accent";
  /** Lifts and darkens the border on hover. */
  interactive?: boolean;
  padding?: string | number;
}
export declare function Card(props: CardProps): JSX.Element;
