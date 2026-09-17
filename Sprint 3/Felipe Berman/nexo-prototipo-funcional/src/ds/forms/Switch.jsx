import React from "react";

export function Switch({ label, checked, onChange, disabled, style, ...rest }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", ...style }}>
      <input type="checkbox" role="switch" checked={checked} onChange={onChange} disabled={disabled} {...rest}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
      <span style={{
        position: "relative", width: 42, height: 24, flex: "0 0 auto",
        borderRadius: "var(--radius-pill)",
        background: disabled ? "var(--surface-disabled)" : checked ? "var(--green-600)" : "var(--green-100)",
        transition: "background var(--dur) var(--ease-out)",
      }}>
        <span style={{
          position: "absolute", top: 3, left: checked ? 21 : 3,
          width: 18, height: 18, borderRadius: "var(--radius-pill)",
          background: "var(--paper)", boxShadow: "var(--shadow-xs)",
          transition: "left var(--dur) var(--ease-out)",
        }} />
      </span>
      {label ? <span style={{ fontSize: "var(--fs-body-sm)", fontWeight: "var(--fw-medium)", color: disabled ? "var(--text-disabled)" : "var(--text-heading)" }}>{label}</span> : null}
    </label>
  );
}
