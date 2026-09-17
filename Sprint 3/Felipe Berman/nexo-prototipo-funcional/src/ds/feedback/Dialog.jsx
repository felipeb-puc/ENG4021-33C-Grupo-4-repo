import React from "react";
import { IconButton } from "../core/IconButton.jsx";

export function Dialog({ open = true, title, description, children, footer, onClose, width = 480, style }) {
  if (!open) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, display: "grid", placeItems: "center",
      background: "var(--overlay-scrim)", backdropFilter: "blur(2px)", padding: "var(--space-6)", zIndex: 50,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: width, background: "var(--paper)",
        border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)", padding: "var(--space-6)",
        animation: "none", ...style,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            {title ? <h3 style={{ margin: 0, fontSize: "var(--fs-h3)", lineHeight: "var(--lh-h3)", color: "var(--text-heading)" }}>{title}</h3> : null}
            {description ? <p style={{ margin: 0, fontSize: "var(--fs-body-sm)", color: "var(--text-body)" }}>{description}</p> : null}
          </div>
          {onClose ? <IconButton name="x" label="Fechar" variant="ghost" size="sm" onClick={onClose} /> : null}
        </div>
        {children ? <div style={{ marginTop: "var(--space-5)" }}>{children}</div> : null}
        {footer ? <div style={{ marginTop: "var(--space-6)", display: "flex", justifyContent: "flex-end", gap: 8 }}>{footer}</div> : null}
      </div>
    </div>
  );
}
