import { Badge } from "../ds/core/Badge.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Tag } from "../ds/core/Tag.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { nomeDoCurso } from "../dados/cursos.js";
import { ROTULO_EXPERIENCIA } from "../regras/filtros.js";
import { periodoTexto } from "../regras/datas.js";

/* Currículo em modo leitura.

   Uma implementação só para as duas pontas: o aluno vê no perfil exatamente o
   que o recrutador vai ver. Se as duas telas desenhassem o currículo cada uma
   do seu jeito, o "como os outros me veem" seria uma promessa sem garantia. */

export default function Curriculo({ aluno }) {
  const { estado } = useEstado();
  const uni = estado.instituicoes.find((i) => i.id === aluno.universidadeId);
  const experiencias = [...(aluno.experiencias || [])].sort((a, b) => (b.inicio || "").localeCompare(a.inicio || ""));

  return (
    <Card padding={28} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <header>
        <h2 style={{ fontSize: "var(--fs-h2)" }}>{aluno.nome}</h2>
        <p style={{ fontSize: 15, color: "var(--green-600)", marginTop: 4 }}>
          {nomeDoCurso(aluno.cursoId)} · {aluno.periodo}º período · {uni?.nome}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <Badge tone="accent">CR {aluno.cr != null ? aluno.cr.toFixed(1) : "não informado"}</Badge>
          <Badge tone="neutral" icon="mail">{aluno.email}</Badge>
        </div>
        {aluno.resumo ? <p style={{ fontSize: 15, lineHeight: 1.65, marginTop: 14 }}>{aluno.resumo}</p> : null}
      </header>

      <Secao titulo="Áreas de interesse" vazio="Nenhuma área informada." itens={aluno.areasInteresse} />
      <Secao titulo="Habilidades" vazio="Nenhuma habilidade informada." itens={aluno.habilidades} />

      <section>
        <h3 style={{ fontSize: "var(--fs-h3)" }}>Experiências e formação</h3>
        {experiencias.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>Nenhuma experiência informada.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, marginTop: 10, display: "flex", flexDirection: "column", gap: 14 }}>
            {experiencias.map((x, i) => (
              <li key={i} style={{ borderLeft: "2px solid var(--green-100)", paddingLeft: 14 }}>
                <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  {ROTULO_EXPERIENCIA[x.tipo]} · {periodoTexto(x.inicio, x.fim)}
                </span>
                <div style={{ fontSize: 15.5, fontWeight: 600, marginTop: 2 }}>{x.titulo}</div>
                <div style={{ fontSize: 14, color: "var(--green-600)" }}>{x.organizacao}</div>
                {x.descricao ? <p style={{ fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{x.descricao}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </Card>
  );
}

function Secao({ titulo, itens = [], vazio }) {
  return (
    <section>
      <h3 style={{ fontSize: "var(--fs-h3)" }}>{titulo}</h3>
      {itens.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>{vazio}</p>
      ) : (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {itens.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      )}
    </section>
  );
}
