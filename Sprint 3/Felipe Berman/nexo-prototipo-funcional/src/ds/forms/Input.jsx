import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Input({ label, hint, error, icon, size = "md", id, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useMemo(() => id || "in-" + Math.random().toString(36).slice(2, 8), [id]);
  const h = size === "lg" ? "var(--control-h-lg)" : size === "sm" ? "var(--control-h-sm)" : "var(--control-h)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label ? (
        <label htmlFor={uid} style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-semibold)", color: "var(--text-heading)" }}>{label}</label>
      ) : null}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, height: h,
        padding: "0 14px", background: rest.disabled ? "var(--surface-disabled)" : "var(--paper)",
        border: `1px solid ${error ? "var(--danger)" : focus ? "var(--green-500)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-sm)",
        boxShadow: focus ? "var(--ring-focus)" : "none",
        transition: "border-color var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)",
      }}>
        {icon ? <span style={{ color: "var(--text-muted)", display: "inline-flex" }}><Icon name={icon} size={17} /></span> : null}
        <input
          id={uid}
          {...rest}
          onFocus={(e) => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
          onBlur={(e) => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
          style={{
            // boxShadow: o anel de foco já é desenhado na caixa de fora; sem isto,
            // a regra global de :focus-visible desenha um segundo anel por dentro.
            flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", boxShadow: "none",
            font: "inherit", fontSize: "var(--fs-body)", color: "var(--text-heading)",
          }}
        />
      </div>
      {error || hint ? (
        <span style={{ fontSize: "var(--fs-caption)", color: error ? "var(--danger)" : "var(--text-muted)" }}>{error || hint}</span>
      ) : null}
    </div>
  );
}
