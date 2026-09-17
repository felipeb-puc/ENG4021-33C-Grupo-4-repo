import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Checkbox({ label, checked, onChange, disabled, description, style, ...rest }) {
  return (
    <label style={{ display: "inline-flex", gap: 10, alignItems: description ? "flex-start" : "center", cursor: disabled ? "not-allowed" : "pointer", ...style }}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} {...rest}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 19, height: 19, flex: "0 0 auto", marginTop: description ? 2 : 0,
        borderRadius: "var(--radius-xs)",
        background: disabled ? "var(--surface-disabled)" : checked ? "var(--green-600)" : "var(--paper)",
        border: `1px solid ${checked ? "var(--green-600)" : "var(--border-strong)"}`,
        color: "var(--paper)",
        transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
      }}>
        {checked ? <Icon name="check" size={13} /> : null}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: "var(--fs-body-sm)", color: disabled ? "var(--text-disabled)" : "var(--text-heading)", fontWeight: "var(--fw-medium)" }}>{label}</span>
        {description ? <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-muted)" }}>{description}</span> : null}
      </span>
    </label>
  );
}
