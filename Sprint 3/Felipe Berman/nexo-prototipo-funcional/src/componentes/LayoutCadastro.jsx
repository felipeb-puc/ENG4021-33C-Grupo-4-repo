import { Link } from "react-router-dom";

import { Icon } from "../ds/core/Icon.jsx";
import { Logo } from "../ds/brand/Logo.jsx";

/* Moldura das telas de cadastro: formulário à esquerda, faixa escura à direita
   com a foto do papel e os próximos passos. */

export default function LayoutCadastro({
  eyebrow,
  titulo,
  subtitulo,
  imagem,
  imagemAlt,
  passos = [],
  nota,
  notaIcone = "info",
  children,
}) {
  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "var(--colunas-cadastro)",
        minHeight: "calc(100vh - 74px)",
      }}
    >
      <div style={{ padding: "40px clamp(16px, 4vw, 48px) 72px" }}>
        <Link
          to="/criar-conta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13.5,
            color: "var(--text-muted)",
          }}
        >
          <Icon name="arrow-left" size={15} /> Trocar tipo de conta
        </Link>

        <span style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 24 }}>
          <span style={{ display: "flex" }}>
            <span
              style={{ width: 11, height: 11, borderRadius: 99, background: "var(--green-800)" }}
            />
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: 99,
                background: "var(--green-500)",
                marginLeft: -3,
              }}
            />
          </span>
          <span
            style={{
              fontSize: "var(--fs-eyebrow)",
              letterSpacing: "var(--tr-eyebrow)",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "var(--green-700)",
            }}
          >
            {eyebrow}
          </span>
        </span>

        <h1
          style={{
            fontSize: "var(--fs-display-3)",
            lineHeight: "var(--lh-display-3)",
            letterSpacing: "var(--tr-display-3)",
            marginTop: 16,
          }}
        >
          {titulo}
        </h1>
        <p
          style={{
            fontSize: "var(--fs-body)",
            lineHeight: "var(--lh-body)",
            color: "var(--text-muted)",
            marginTop: 10,
            maxWidth: 620,
          }}
        >
          {subtitulo}
        </p>

        {children}
      </div>

      <aside
        style={{
          background: "var(--green-900)",
          backgroundImage: "var(--hatch-dark)",
          padding: "40px clamp(16px, 4vw, 30px)",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <Logo size={20} inverse />

        {imagem ? (
          <img
            src={imagem}
            alt={imagemAlt}
            style={{
              width: "100%",
              height: 190,
              objectFit: "cover",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-inverse)",
              background: "var(--green-800)",
            }}
          />
        ) : null}

        <div>
          <h2 style={{ fontSize: "var(--fs-h4)", color: "var(--green-50)" }}>O que vem depois</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }}>
            {passos.map((passo, i) => (
              <div key={passo.titulo} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 99,
                    background: "color-mix(in oklch, var(--green-50) 14%, transparent)",
                    border: "1px solid var(--border-inverse)",
                    color: "var(--green-50)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    flex: "0 0 auto",
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--green-50)" }}>
                    {passo.titulo}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--green-200)",
                      marginTop: 3,
                    }}
                  >
                    {passo.texto}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {nota ? (
          <div
            style={{
              marginTop: "auto",
              background: "var(--green-800)",
              border: "1px solid var(--border-inverse)",
              borderRadius: "var(--radius-lg)",
              padding: 18,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <span style={{ color: "var(--green-300)", display: "inline-flex", marginTop: 1 }}>
              <Icon name={notaIcone} size={18} />
            </span>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--green-200)" }}>{nota}</p>
          </div>
        ) : null}
      </aside>
    </main>
  );
}
