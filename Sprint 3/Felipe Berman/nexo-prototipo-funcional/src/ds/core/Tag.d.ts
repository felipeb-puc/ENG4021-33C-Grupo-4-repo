import * as React from "react";
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Filled green-800 state for an active filter. */
  selected?: boolean;
  onRemove?: (e: React.MouseEvent) => void;
}
export declare function Tag(props: TagProps): JSX.Element;
