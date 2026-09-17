import React from "react";
import { Icon } from "./Icon.jsx";

export function Badge({ children, tone = "neutral", icon, style, ...rest }) {
  const tones = {
    neutral: { background: "var(--green-50)", color: "var(--green-700)", border: "1px solid var(--green-100)" },
    accent: { background: "var(--green-600)", color: "var(--paper)", border: "1px solid var(--green-600)" },
    inverse: { background: "color-mix(in oklch, var(--green-50) 14%, transparent)", color: "var(--green-50)", border: "1px solid var(--border-inverse)" },
    success: { background: "var(--success-surface)", color: "var(--success)", border: "1px solid color-mix(in oklch, var(--success) 25%, transparent)" },
    warning: { background: "var(--warning-surface)", color: "var(--warning)", border: "1px solid color-mix(in oklch, var(--warning) 25%, transparent)" },
    danger: { background: "var(--danger-surface)", color: "var(--danger)", border: "1px solid color-mix(in oklch, var(--danger) 25%, transparent)" },
  };
  return (
    <span {...rest} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: "var(--radius-pill)",
      fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", lineHeight: "var(--lh-caption)",
      ...tones[tone], ...style,
    }}>
      {icon ? <Icon name={icon} size={13} /> : null}
      {children}
    </span>
  );
}
