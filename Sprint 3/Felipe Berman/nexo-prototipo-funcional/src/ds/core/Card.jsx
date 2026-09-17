import React from "react";

export function Card({ children, tone = "light", interactive = false, padding = "var(--space-6)", style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    light: { background: "var(--surface-card)", border: "1px solid var(--border-default)", color: "var(--text-body)" },
    tint: { background: "var(--surface-card-alt)", border: "1px solid var(--green-100)", color: "var(--green-800)" },
    dark: { background: "var(--surface-inverse-alt)", border: "1px solid var(--border-inverse)", color: "var(--text-on-inverse-muted)" },
    accent: { background: "var(--green-500)", border: "1px solid var(--green-500)", color: "var(--paper)" },
  };
  return (
    <div
      {...rest}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: "var(--radius-lg)",
        padding,
        boxShadow: hover && interactive ? "var(--shadow-md)" : "var(--shadow-xs)",
        transform: hover && interactive ? "translateY(-2px)" : "none",
        transition: "box-shadow var(--dur) var(--ease-out), transform var(--dur) var(--ease-out), border-color var(--dur) var(--ease-out)",
        cursor: interactive ? "pointer" : undefined,
        ...tones[tone],
        ...(hover && interactive && tone === "light" ? { borderColor: "var(--green-300)" } : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
