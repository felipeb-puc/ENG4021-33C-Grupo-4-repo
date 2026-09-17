import React from "react";
import { Icon } from "./Icon.jsx";

const dims = { sm: 32, md: 40, lg: 48 };

export function IconButton({ name, variant = "secondary", size = "md", label, disabled, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const d = dims[size] || dims.md;
  const looks = {
    secondary: { background: "var(--green-50)", color: "var(--green-800)", border: "1px solid var(--green-100)" },
    primary: { background: "var(--green-600)", color: "var(--paper)", border: "1px solid var(--green-600)" },
    outline: { background: "transparent", color: "var(--green-700)", border: "1px solid var(--border-strong)" },
    ghost: { background: "transparent", color: "var(--text-muted)", border: "1px solid transparent" },
    inverse: { background: "color-mix(in oklch, var(--green-50) 12%, transparent)", color: "var(--green-50)", border: "1px solid var(--border-inverse)" },
  };
  const hoverLook = {
    secondary: { background: "var(--green-100)" },
    primary: { background: "var(--green-700)" },
    outline: { background: "var(--green-50)", borderColor: "var(--green-500)" },
    ghost: { background: "var(--green-50)", color: "var(--green-800)" },
    inverse: { background: "color-mix(in oklch, var(--green-50) 22%, transparent)" },
  };
  return (
    <button
      {...rest}
      aria-label={label}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: d, height: d, borderRadius: "var(--radius-pill)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background var(--dur) var(--ease-out), color var(--dur) var(--ease-out)",
        ...looks[variant], ...(hover && !disabled ? hoverLook[variant] : null),
        ...(disabled ? { background: "var(--surface-disabled)", color: "var(--text-disabled)", borderColor: "var(--border-subtle)" } : null),
        ...style,
      }}
    >
      <Icon name={name} size={Math.round(d * 0.45)} />
    </button>
  );
}
