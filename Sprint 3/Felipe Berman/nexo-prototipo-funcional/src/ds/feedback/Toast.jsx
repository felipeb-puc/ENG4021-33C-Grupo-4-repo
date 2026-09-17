import React from "react";
import { Icon } from "../core/Icon.jsx";

const tones = {
  success: { icon: "check-circle", color: "var(--success)", surface: "var(--success-surface)" },
  info: { icon: "info", color: "var(--info)", surface: "var(--info-surface)" },
  warning: { icon: "alert-triangle", color: "var(--warning)", surface: "var(--warning-surface)" },
  danger: { icon: "alert-circle", color: "var(--danger)", surface: "var(--danger-surface)" },
};

export function Toast({ title, message, tone = "success", onClose, style }) {
  const t = tones[tone] || tones.success;
  return (
    <div role="status" style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      minWidth: 300, maxWidth: 420, padding: "14px 16px",
      background: "var(--paper)", border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)", ...style,
    }}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28, flex: "0 0 auto", borderRadius: "var(--radius-pill)",
        background: t.surface, color: t.color,
      }}><Icon name={t.icon} size={16} /></span>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: "var(--fs-body-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-heading)" }}>{title}</span>
        {message ? <span style={{ fontSize: "var(--fs-caption)", lineHeight: 1.5, color: "var(--text-muted)" }}>{message}</span> : null}
      </div>
      {onClose ? (
        <span onClick={onClose} style={{ cursor: "pointer", color: "var(--text-muted)", display: "inline-flex", marginTop: 2 }}>
          <Icon name="x" size={15} />
        </span>
      ) : null}
    </div>
  );
}
