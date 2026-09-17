import * as React from "react";
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  /** Secondary line under the label. */
  description?: string;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
