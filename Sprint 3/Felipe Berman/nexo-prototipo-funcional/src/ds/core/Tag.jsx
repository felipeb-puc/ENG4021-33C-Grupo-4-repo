import React from "react";
import { Icon } from "./Icon.jsx";

export function Tag({ children, selected = false, onRemove, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <span
      {...rest}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        height: 30, padding: "0 12px", borderRadius: "var(--radius-pill)",
        fontSize: "var(--fs-body-sm)", fontWeight: "var(--fw-medium)",
        cursor: rest.onClick ? "pointer" : "default",
        transition: "background var(--dur) var(--ease-out), color var(--dur) var(--ease-out), border-color var(--dur) var(--ease-out)",
        background: selected ? "var(--green-800)" : hover ? "var(--green-50)" : "transparent",
        color: selected ? "var(--green-50)" : "var(--green-700)",
        border: `1px solid ${selected ? "var(--green-800)" : "var(--border-strong)"}`,
        ...style,
      }}
    >
      {children}
      {onRemove ? (
        <span onClick={(e) => { e.stopPropagation(); onRemove(e); }} style={{ display: "inline-flex", cursor: "pointer", opacity: 0.7 }}>
          <Icon name="x" size={13} />
        </span>
      ) : null}
    </span>
  );
}
