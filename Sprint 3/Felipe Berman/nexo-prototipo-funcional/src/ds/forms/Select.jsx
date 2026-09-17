import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Select({ label, hint, options = [], size = "md", id, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useMemo(() => id || "sel-" + Math.random().toString(36).slice(2, 8), [id]);
  const h = size === "lg" ? "var(--control-h-lg)" : size === "sm" ? "var(--control-h-sm)" : "var(--control-h)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label ? <label htmlFor={uid} style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-semibold)", color: "var(--text-heading)" }}>{label}</label> : null}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <select
          id={uid}
          {...rest}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            appearance: "none", width: "100%", height: h, padding: "0 38px 0 14px",
            font: "inherit", fontSize: "var(--fs-body)", color: "var(--text-heading)",
            background: rest.disabled ? "var(--surface-disabled)" : "var(--paper)",
            border: `1px solid ${focus ? "var(--green-500)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-sm)", outline: "none",
            boxShadow: focus ? "var(--ring-focus)" : "none",
            transition: "border-color var(--dur) var(--ease-out)",
          }}
        >
          {options.map((o) => {
            const v = typeof o === "string" ? o : o.value;
            const l = typeof o === "string" ? o : o.label;
            return <option key={v} value={v}>{l}</option>;
          })}
        </select>
        <span style={{ position: "absolute", right: 13, color: "var(--text-muted)", pointerEvents: "none", display: "inline-flex" }}>
          <Icon name="chevron-down" size={17} />
        </span>
      </div>
      {hint ? <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-muted)" }}>{hint}</span> : null}
    </div>
  );
}
