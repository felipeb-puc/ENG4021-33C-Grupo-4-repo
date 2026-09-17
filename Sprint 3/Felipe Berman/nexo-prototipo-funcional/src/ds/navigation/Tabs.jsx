import React from "react";

export function Tabs({ items = [], value, onChange, variant = "underline", style }) {
  const [hover, setHover] = React.useState(null);
  if (variant === "pill") {
    return (
      <div style={{ display: "inline-flex", gap: 4, padding: 4, background: "var(--green-50)", borderRadius: "var(--radius-pill)", ...style }}>
        {items.map((it) => {
          const k = it.value || it;
          const active = k === value;
          return (
            <button key={k} onClick={() => onChange && onChange(k)} style={{
              border: "none", cursor: "pointer", height: 34, padding: "0 16px",
              borderRadius: "var(--radius-pill)", font: "inherit",
              fontSize: "var(--fs-body-sm)", fontWeight: "var(--fw-semibold)",
              background: active ? "var(--paper)" : "transparent",
              color: active ? "var(--green-800)" : "var(--green-600)",
              boxShadow: active ? "var(--shadow-xs)" : "none",
              transition: "background var(--dur) var(--ease-out), color var(--dur) var(--ease-out)",
            }}>{it.label || it}</button>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 28, borderBottom: "1px solid var(--border-subtle)", ...style }}>
      {items.map((it) => {
        const k = it.value || it;
        const active = k === value;
        return (
          <button key={k} onClick={() => onChange && onChange(k)}
            onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(null)}
            style={{
              border: "none", background: "transparent", cursor: "pointer",
              padding: "0 0 12px", font: "inherit",
              fontSize: "var(--fs-body)", fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)",
              color: active ? "var(--green-800)" : hover === k ? "var(--green-600)" : "var(--text-muted)",
              boxShadow: active ? "inset 0 -2px 0 0 var(--green-600)" : "none",
              transition: "color var(--dur) var(--ease-out)",
            }}>
            {it.label || it}
            {it.count != null ? <span style={{ marginLeft: 6, fontSize: "var(--fs-caption)", color: "var(--text-muted)" }}>{it.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
