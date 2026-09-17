import React from "react";
import { Icon } from "./Icon.jsx";

const sizes = {
  sm: { h: "var(--control-h-sm)", px: 16, fs: 13.5, gap: 6, icon: 15 },
  md: { h: "var(--control-h)", px: 22, fs: "var(--fs-button)", gap: 8, icon: 17 },
  lg: { h: "var(--control-h-lg)", px: 28, fs: 16, gap: 10, icon: 19 },
};

const variants = {
  primary: { background: "var(--green-600)", color: "var(--text-on-accent)", border: "1px solid var(--green-600)" },
  dark: { background: "var(--green-900)", color: "var(--text-on-inverse)", border: "1px solid var(--green-900)" },
  secondary: { background: "var(--green-50)", color: "var(--green-800)", border: "1px solid var(--green-100)" },
  outline: { background: "transparent", color: "var(--green-700)", border: "1px solid var(--border-strong)" },
  ghost: { background: "transparent", color: "var(--green-700)", border: "1px solid transparent" },
  inverse: { background: "var(--paper)", color: "var(--green-900)", border: "1px solid var(--paper)" },
};

const hovers = {
  primary: { background: "var(--green-700)", borderColor: "var(--green-700)" },
  dark: { background: "var(--green-800)", borderColor: "var(--green-800)" },
  secondary: { background: "var(--green-100)", borderColor: "var(--green-200)" },
  outline: { background: "var(--green-50)", borderColor: "var(--green-500)" },
  ghost: { background: "var(--green-50)" },
  inverse: { background: "var(--green-50)", borderColor: "var(--green-50)" },
};

export function Button({
  children, variant = "primary", size = "md", icon, iconLeft, block = false,
  disabled = false, as = "button", style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  const Tag = as;
  return (
    <Tag
      {...rest}
      disabled={as === "button" ? disabled : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: block ? "flex" : "inline-flex",
        width: block ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        height: s.h,
        padding: `0 ${s.px}px`,
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-sans)",
        fontSize: s.fs,
        fontWeight: "var(--fw-semibold)",
        letterSpacing: "var(--tr-button)",
        lineHeight: 1,
        cursor: disabled ? "not-allowed" : "pointer",
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition: "background var(--dur) var(--ease-out), border-color var(--dur) var(--ease-out), transform var(--dur-fast) var(--ease-out)",
        transform: press && !disabled ? "scale(0.975)" : "none",
        ...v,
        ...(hover && !disabled ? hovers[variant] : null),
        ...(disabled ? { background: "var(--surface-disabled)", color: "var(--text-disabled)", borderColor: "var(--border-subtle)" } : null),
        ...style,
      }}
    >
      {iconLeft ? <Icon name={iconLeft} size={s.icon} /> : null}
      {children}
      {icon ? <Icon name={icon} size={s.icon} /> : null}
    </Tag>
  );
}
