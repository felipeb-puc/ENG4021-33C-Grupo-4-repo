import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Icon } from "../ds/core/Icon.jsx";
import CardOportunidade from "../componentes/CardOportunidade.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { oportunidadesVisiveisPara } from "../regras/escopo.js";
import { contarPorTipo, ORDENACAO, ordenar } from "../regras/filtros.js";
import { ROTULO_TIPO, TIPO_OPORTUNIDADE } from "../dados/oportunidades.js";
import { STATUS_ENCERRADOS } from "../dados/candidaturas.js";
import { nomeDoCurso } from "../dados/cursos.js";
import imagemHome from "../assets/06-home-estudante-grupo-sorrindo.jpg";

/* Início do estudante.

   Duas coisas que mudam em relação ao protótipo:

   1. A saudação é pessoal e o subtítulo traz o curso e o período da pessoa —
      antes repetia a frase institucional da landing, que não faz sentido para
      quem já está logado.

   2. Tudo que aparece aqui passa por `oportunidadesVisiveisPara`. Um aluno da
      UFRJ não vê liga da PUC, e as contagens dos chips são as reais do escopo
      dele — não números fixos. */

const ORDEM_DOS_CHIPS = [
  TIPO_OPORTUNIDADE.MONITORIA,
  TIPO_OPORTUNIDADE.IC,
  TIPO_OPORTUNIDADE.LIGA_ACADEMICA,
  TIPO_OPORTUNIDADE.ESTAGIO,
  TIPO_OPORTUNIDADE.EQUIPE_COMPETICAO,
];

function completudeDoCurriculo(aluno) {
  const itens = [
    Boolean(aluno.resumo),
    (aluno.experiencias || []).length >= 2,
    (aluno.habilidades || []).length >= 3,
    (aluno.areasInteresse || []).length >= 1,
    aluno.cr != null,
  ];
  const feitos = itens.filter(Boolean).length;
  return Math.round((feitos / itens.length) * 100);
}

export default function Inicio() {
  const { estado, usuario } = useEstado();
  const navegar = useNavigate();
  const aluno = usuario.aluno;

  const visiveis = useMemo(
    () => oportunidadesVisiveisPara(aluno, estado.oportunidades, estado.instituicoes),
    [aluno, estado.oportunidades, estado.instituicoes],
  );

  const porTipo = useMemo(() => contarPorTipo(visiveis), [visiveis]);

  const destaques = useMemo(
    () => ordenar(visiveis, ORDENACAO.ENCERRANDO).slice(0, 4),
    [visiveis],
  );

  const nFavoritos = estado.favoritos.filter((f) => f.alunoId === aluno.id).length;
  const nAtivas = estado.candidaturas.filter(
    (c) => c.alunoId === aluno.id && !STATUS_ENCERRADOS.includes(c.status),
  ).length;

  const completude = completudeDoCurriculo(aluno);

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px" }}>
      {/* ---------- saudação ---------- */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "var(--fs-display-3)",
              lineHeight: "var(--lh-display-3)",
              letterSpacing: "var(--tr-display-3)",
            }}
          >
            Bem-vinda de volta, {aluno.nome.split(" ")[0]}
          </h1>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--text-muted)", marginTop: 8 }}>
            {nomeDoCurso(aluno.cursoId)} · {aluno.periodo}º período ·{" "}
            {usuario.instituicao?.sigla || usuario.instituicao?.nome}
          </p>

          <div style={{ display: "flex", gap: 36, marginTop: 24, flexWrap: "wrap" }}>
            <Numero valor={visiveis.length} rotulo="oportunidades abertas para você" />
            <Numero valor={nFavoritos} rotulo="salvas para depois" />
            <Numero valor={nAtivas} rotulo="candidaturas em andamento" />
          </div>

          {completude < 100 ? (
            <Card tone="tint" padding={18} style={{ marginTop: 24, maxWidth: 560 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ color: "var(--green-700)", display: "inline-flex" }}>
                  <Icon name="file-text" size={20} />
                </span>
                <p style={{ flex: 1, minWidth: 200, fontSize: 13.5, lineHeight: 1.6, color: "var(--green-800)" }}>
                  Seu currículo está {completude}% completo. Perfis completos aparecem melhor nas
                  buscas de recrutadores.
                </p>
                <Button size="sm" variant="outline" onClick={() => navegar("/perfil")}>
                  Completar perfil
                </Button>
              </div>
            </Card>
          ) : null}
        </div>

        <img
          src={imagemHome}
          alt="Estudantes conversando em uma sala de aula"
          style={{
            width: "100%",
            height: 260,
            objectFit: "cover",
            borderRadius: "var(--radius-lg)",
            background: "var(--green-50)",
            boxShadow: "var(--shadow-sm)",
          }}
        />
      </section>

      {/* ---------- chips de categoria ---------- */}
      <section style={{ marginTop: 40 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {ORDEM_DOS_CHIPS.map((tipo) => {
            const n = porTipo[tipo] || 0;
            return (
              <Link
                key={tipo}
                to={`/busca?tipo=${tipo}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "11px 20px",
                  borderRadius: 999,
                  border: "1px solid var(--border-default)",
                  background: "var(--paper)",
                  color: "var(--text-body)",
                  fontSize: 15,
                  textDecoration: "none",
                  opacity: n === 0 ? 0.55 : 1,
                }}
              >
                {ROTULO_TIPO[tipo]}
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>
                  {n}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- destaques ---------- */}
      <section style={{ marginTop: 36 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontSize: "var(--fs-h2)" }}>Encerrando primeiro</h2>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 4 }}>
              Oportunidades da {usuario.instituicao?.nome} com inscrição mais próxima do fim.
            </p>
          </div>
          <Link
            to="/busca"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}
          >
            Ver todas <Icon name="arrow-right" size={15} />
          </Link>
        </div>

        {destaques.length === 0 ? (
          <Card tone="tint" padding={40} style={{ marginTop: 20, textAlign: "center" }}>
            <h3 style={{ fontSize: "var(--fs-h3)", color: "var(--green-900)" }}>
              Nenhuma oportunidade aberta agora
            </h3>
            <p style={{ fontSize: 14.5, color: "var(--green-800)", marginTop: 8 }}>
              Assim que a sua universidade publicar algo novo, aparece aqui.
            </p>
          </Card>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
              marginTop: 20,
            }}
          >
            {destaques.map((o) => (
              <CardOportunidade key={o.id} oportunidade={o} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Numero({ valor, rotulo }) {
  return (
    <div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--green-800)",
          lineHeight: 1,
        }}
      >
        {valor}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>{rotulo}</div>
    </div>
  );
}
