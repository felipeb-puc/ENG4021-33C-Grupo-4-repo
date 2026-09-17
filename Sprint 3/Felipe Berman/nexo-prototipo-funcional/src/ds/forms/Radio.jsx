import React from "react";

export function Radio({ label, description, checked, onChange, name, value, disabled, style, ...rest }) {
  return (
    <label style={{ display: "inline-flex", gap: 10, alignItems: description ? "flex-start" : "center", cursor: disabled ? "not-allowed" : "pointer", ...style }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} {...rest}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 19, height: 19, flex: "0 0 auto", marginTop: description ? 2 : 0,
        borderRadius: "var(--radius-pill)",
        background: disabled ? "var(--surface-disabled)" : "var(--paper)",
        border: `1px solid ${checked ? "var(--green-600)" : "var(--border-strong)"}`,
        transition: "border-color var(--dur-fast) var(--ease-out)",
      }}>
        <span style={{
          width: 9, height: 9, borderRadius: "var(--radius-pill)",
          background: checked ? "var(--green-600)" : "transparent",
          transform: checked ? "scale(1)" : "scale(0.4)",
          transition: "transform var(--dur-fast) var(--ease-out)",
        }} />
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: "var(--fs-body-sm)", color: disabled ? "var(--text-disabled)" : "var(--text-heading)", fontWeight: "var(--fw-medium)" }}>{label}</span>
        {description ? <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-muted)" }}>{description}</span> : null}
      </span>
    </label>
  );
}
