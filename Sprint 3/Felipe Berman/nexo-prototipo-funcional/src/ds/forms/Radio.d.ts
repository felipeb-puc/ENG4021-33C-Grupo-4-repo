import * as React from "react";
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}
export declare function Radio(props: RadioProps): JSX.Element;
