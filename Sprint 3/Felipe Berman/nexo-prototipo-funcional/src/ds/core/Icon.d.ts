import * as React from "react";
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Lucide icon name in kebab-case, e.g. "arrow-right", "briefcase". */
  name: string;
  /** Square size in px. Default 20. */
  size?: number;
}
export declare function Icon(props: IconProps): JSX.Element;
