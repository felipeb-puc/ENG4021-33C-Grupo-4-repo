function Logo({ size = 24, inverse = false, mark = false, title = "NEXO", style, ...rest }) {
  const rings = inverse
    ? ["var(--green-500)", "var(--green-300)", "var(--green-100)"]
    : ["var(--green-800)", "var(--green-500)", "var(--green-300)"];
  const d = Math.round(size * 0.73);
  const sw = d * 0.18;
  const step = d * 0.48;
  const w = d + step * 2;
  const r = (d - sw) / 2;
  const svg = (
    <svg width={w} height={d} viewBox={`0 0 ${w} ${d}`} aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      {rings.map((c, i) => (
        <circle key={i} cx={d / 2 + step * i} cy={d / 2} r={r} fill="none" stroke={c} strokeWidth={sw} />
      ))}
    </svg>
  );
  if (mark) return <span role="img" aria-label={title} style={{ display: "inline-flex", ...style }} {...rest}>{svg}</span>;
  return (
    <span role="img" aria-label={title} style={{ display: "inline-flex", alignItems: "center", ...style }} {...rest}>
      <span style={{
        fontFamily: "var(--font-sans)", fontSize: size, fontWeight: 700, lineHeight: 1,
        letterSpacing: "-0.035em", color: inverse ? "var(--green-50)" : "var(--neutral-900)",
      }}>NEX</span>
      <span style={{ display: "inline-flex", marginLeft: size * 0.02, transform: `translateY(${-size * 0.015}px)` }}>{svg}</span>
    </span>
  );
}
export { Logo };
