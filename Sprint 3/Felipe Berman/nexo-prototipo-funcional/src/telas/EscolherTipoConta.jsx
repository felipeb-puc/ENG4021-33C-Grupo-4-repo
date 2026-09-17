import { Link, useNavigate } from "react-router-dom";

import { Card } from "../ds/core/Card.jsx";
import { Icon } from "../ds/core/Icon.jsx";
import { Logo } from "../ds/brand/Logo.jsx";

/* Escolha do tipo de conta.

   São três, não dois. O documento de requisitos do grupo (RF02) ainda fala em
   "empresa ou aluno", mas a Ata de 31/08 decidiu três papéis — e é essa decisão
   que o produto implementa. O RF02 precisa ser atualizado. */

const TIPOS = [
  {
    rota: "/criar-conta/estudante",
    icone: "graduation-cap",
    titulo: "Sou estudante",
    texto:
      "Quero encontrar monitoria, iniciação científica, estágio, liga ou equipe de competição.",
    itens: [
      "Você escolhe sua universidade no cadastro",
      "Vê só o que a sua universidade alcança",
      "Currículo pronto para candidatura",
    ],
  },
  {
    rota: "/criar-conta/recrutador",
    icone: "building-2",
    titulo: "Sou recrutador",
    texto: "Represento uma empresa e quero publicar vagas de estágio.",
    itens: [
      "Publicação para uma ou várias universidades",
      "Busca de candidatos por curso, período e CR",
      "Gestão de candidaturas por status",
    ],
  },
  {
    rota: "/criar-conta/academico",
    icone: "landmark",
    titulo: "Sou representante acadêmico",
    texto: "Coordenação, departamento, laboratório, liga acadêmica ou equipe de competição.",
    itens: [
      "Monitoria, iniciação científica, liga e equipe",
      "Só alunos da sua universidade participam",
      "Triagem por curso, período e CR",
    ],
  },
];

export default function EscolherTipoConta() {
  const navegar = useNavigate();

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "48px clamp(16px, 4vw, 40px) 80px" }}>
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          fontSize: 13.5,
          color: "var(--text-muted)",
        }}
      >
        <Icon name="arrow-left" size={15} /> Voltar
      </Link>

      <div style={{ textAlign: "center", marginTop: 26 }}>
        <Logo size={26} style={{ justifyContent: "center" }} />
        <h1
          style={{
            fontSize: "var(--fs-display-3)",
            lineHeight: "var(--lh-display-3)",
            letterSpacing: "var(--tr-display-3)",
            marginTop: 24,
          }}
        >
          Como você vai usar o NEXO
        </h1>
        <p
          style={{
            fontSize: "var(--fs-body)",
            lineHeight: "var(--lh-body)",
            color: "var(--text-muted)",
            marginTop: 10,
          }}
        >
          Escolha o tipo de conta. Cada papel tem um painel diferente.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(290px, 100%), 1fr))",
          gap: 20,
          marginTop: 40,
        }}
      >
        {TIPOS.map((t) => (
          <Card
            key={t.rota}
            interactive
            padding={26}
            onClick={() => navegar(t.rota)}
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <span
              style={{
                width: 46,
                height: 46,
                borderRadius: 99,
                background: "var(--green-50)",
                color: "var(--green-700)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Icon name={t.icone} size={21} />
            </span>

            <h2 style={{ fontSize: "var(--fs-h3)" }}>{t.titulo}</h2>
            <p style={{ fontSize: "var(--fs-body-sm)", lineHeight: "var(--lh-body-sm)" }}>
              {t.texto}
            </p>

            <ul
              style={{
                color: "var(--green-300)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginTop: 2,
                paddingLeft: 19,
              }}
            >
              {t.itens.map((item) => (
                <li key={item}>
                  <span style={{ fontSize: 13.5, color: "var(--text-body)" }}>{item}</span>
                </li>
              ))}
            </ul>

            <span
              style={{
                marginTop: "auto",
                paddingTop: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--green-700)",
              }}
            >
              Continuar
              <Icon name="arrow-right" size={16} />
            </span>
          </Card>
        ))}
      </div>

      <p
        style={{
          textAlign: "center",
          fontSize: 13.5,
          color: "var(--text-muted)",
          marginTop: 32,
        }}
      >
        Já tem conta?{" "}
        <Link to="/entrar" style={{ fontWeight: 600 }}>
          Entrar
        </Link>
      </p>
    </main>
  );
}
