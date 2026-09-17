import React from "react";

export function Tooltip({ label, children, placement = "top", style }) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: { bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
    bottom: { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
    left: { right: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
    right: { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
  }[placement];
  return (
    <span style={{ position: "relative", display: "inline-flex", ...style }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <span style={{
        position: "absolute", ...pos, zIndex: 40,
        padding: "6px 10px", borderRadius: "var(--radius-xs)",
        background: "var(--green-900)", color: "var(--green-50)",
        fontSize: "var(--fs-caption)", fontWeight: "var(--fw-medium)", whiteSpace: "nowrap",
        opacity: show ? 1 : 0, pointerEvents: "none",
        transition: "opacity var(--dur-fast) var(--ease-out)",
      }}>{label}</span>
    </span>
  );
}
