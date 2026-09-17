/* Campo de texto de várias linhas.

   O design system NEXO não tem textarea. Este segue os tokens do Input (borda,
   raio, erro embaixo do campo) para não destoar. Fica em componentes/ e não em
   ds/ porque ds/ é cópia do design system do Claude Design — acrescentar lá
   faria as duas cópias divergirem sem ninguém saber. */

export default function AreaTexto({ label, hint, error, value, onChange, linhas = 3, maxLength }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label ? (
        <span style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-semibold)", color: "var(--text-heading)" }}>{label}</span>
      ) : null}
      <textarea
        rows={linhas}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={{
          font: "inherit",
          fontSize: "var(--fs-body)",
          padding: "10px 14px",
          borderRadius: "var(--radius-sm)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border-default)"}`,
          resize: "vertical",
          color: "var(--text-heading)",
          background: "var(--paper)",
        }}
      />
      {error ? (
        <span style={{ fontSize: "var(--fs-caption)", color: "var(--danger)" }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-muted)" }}>{hint}</span>
      ) : null}
    </label>
  );
}
