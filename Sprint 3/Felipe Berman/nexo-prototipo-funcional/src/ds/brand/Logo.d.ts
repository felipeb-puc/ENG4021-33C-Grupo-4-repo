import * as React from "react";
/**
 * NEXO logo lockup: the letters NEX followed by three overlapping rings
 * (green-800 / green-500 / green-300) that read as the O. Never redraw,
 * recolour or reorder the rings.
 */
export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Cap height of the lockup in px — the rings scale from it. Default 24. */
  size?: number;
  /** Light-on-dark version, for green-900 surfaces. */
  inverse?: boolean;
  /** Rings only, without the NEX letters — favicon, avatar, tight nav. */
  mark?: boolean;
  /** Accessible label. Default "NEXO". */
  title?: string;
}
export declare function Logo(props: LogoProps): JSX.Element;
