import { useNavigate } from "react-router-dom";

import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Icon } from "../ds/core/Icon.jsx";
import hero from "../assets/01-hero-landing-estudantes-campus.jpg";

const PUBLICOS = [
  {
    icone: "graduation-cap",
    titulo: "Estudantes",
    texto: "Buscam, salvam e se candidatam com o currículo do NEXO.",
  },
  {
    icone: "building-2",
    titulo: "Contratantes",
    texto: "Publicam estágio, buscam candidatos e acompanham candidaturas.",
  },
  {
    icone: "landmark",
    titulo: "Universidades",
    texto: "Publicam monitoria, IC, liga acadêmica e equipe de competição.",
  },
];

const CAMPOS_OBRIGATORIOS = [
  "Descrição",
  "Pré-requisitos",
  "Carga horária",
  "Remuneração ou bolsa",
  "Modalidade",
  "Prazo de inscrição",
  "Curso-alvo",
];

function Eyebrow({ children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <span style={{ display: "flex" }}>
        <span
          style={{
            width: 11,
            height: 11,
            borderRadius: 99,
            background: "var(--green-500)",
          }}
        />
        <span
          style={{
            width: 11,
            height: 11,
            borderRadius: 99,
            background: "var(--green-300)",
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
        {children}
      </span>
    </span>
  );
}

export default function Landing() {
  const navegar = useNavigate();

  return (
    <main>
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "72px clamp(16px, 4vw, 40px) 64px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))",
          gap: 56,
          alignItems: "center",
        }}
      >
        <div>
          <Eyebrow>Estudantes, universidades e contratantes</Eyebrow>

          <h1
            style={{
              fontSize: "var(--fs-display-1)",
              lineHeight: "var(--lh-display-1)",
              letterSpacing: "var(--tr-display-1)",
              marginTop: 20,
            }}
          >
            Toda oportunidade da sua universidade em um lugar só
          </h1>

          <p
            style={{
              fontSize: "var(--fs-body-lg)",
              lineHeight: "var(--lh-body-lg)",
              marginTop: 22,
              maxWidth: 520,
            }}
          >
            Monitoria, iniciação científica, estágio, liga acadêmica e equipe de
            competição — com carga horária, bolsa, modalidade e prazo declarados
            em todo anúncio.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <Button size="lg" icon="arrow-right" onClick={() => navegar("/criar-conta")}>
              Criar minha conta
            </Button>
            <Button size="lg" variant="outline" onClick={() => navegar("/entrar")}>
              Já tenho conta
            </Button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(230px, 100%), 1fr))",
              gap: 14,
              marginTop: 44,
            }}
          >
            {PUBLICOS.map((p) => (
              <Card key={p.titulo} padding={18}>
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 99,
                    background: "var(--green-50)",
                    color: "var(--green-700)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon name={p.icone} size={18} />
                </span>
                <h3 style={{ fontSize: "var(--fs-h4)", marginTop: 12 }}>{p.titulo}</h3>
                <p
                  style={{
                    fontSize: "var(--fs-body-sm)",
                    lineHeight: "var(--lh-body-sm)",
                    marginTop: 5,
                  }}
                >
                  {p.texto}
                </p>
              </Card>
            ))}
          </div>
        </div>

        <img
          src={hero}
          alt="Estudantes universitários caminhando pelo campus"
          style={{
            width: "100%",
            height: "min(560px, 60vh)",
            objectFit: "cover",
            borderRadius: "var(--radius-lg)",
            background: "var(--green-50)",
            boxShadow: "var(--shadow-md)",
          }}
        />
      </section>

      <section
        style={{
          background: "var(--green-900)",
          backgroundImage: "var(--hatch-dark)",
          padding: "64px clamp(16px, 4vw, 40px)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "var(--fs-display-3)",
                lineHeight: "var(--lh-display-3)",
                letterSpacing: "var(--tr-display-3)",
                color: "var(--green-50)",
              }}
            >
              Anúncio completo, sempre
            </h2>
            <p
              style={{
                fontSize: "var(--fs-body)",
                lineHeight: 1.7,
                color: "var(--green-200)",
                marginTop: 14,
                maxWidth: 420,
              }}
            >
              Nada de vaga no story sem carga horária. Quem publica no NEXO
              preenche os sete campos obrigatórios antes de a oportunidade ir ao
              ar.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(160px, 100%), 1fr))",
              gap: 12,
            }}
          >
            {CAMPOS_OBRIGATORIOS.map((campo) => (
              <div
                key={campo}
                style={{
                  background: "var(--green-800)",
                  border: "1px solid var(--border-inverse)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ color: "var(--green-300)", display: "inline-flex" }}>
                  <Icon name="check" size={15} />
                </span>
                <span style={{ fontSize: 13.5, color: "var(--green-50)", fontWeight: 500 }}>
                  {campo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
