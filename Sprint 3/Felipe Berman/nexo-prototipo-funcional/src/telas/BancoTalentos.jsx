import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "../ds/core/Badge.jsx";
import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Tag } from "../ds/core/Tag.jsx";
import { Input } from "../ds/forms/Input.jsx";
import { Select } from "../ds/forms/Select.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { alunosVisiveisPara, PAPEL } from "../regras/escopo.js";
import {
  aplicarFiltrosCandidato,
  areasDisponiveis,
  filtrosCandidatoVazios,
  ROTULO_EXPERIENCIA,
  TIPO_EXPERIENCIA,
} from "../regras/filtros.js";
import { cursos as todosCursos, cursosDaUniversidade, nomeDoCurso } from "../dados/cursos.js";
import { TIPO_INSTITUICAO } from "../dados/instituicoes.js";

/* Banco de talentos.

   No protótipo os selects de Universidade e Área não tinham handler (defeito
   L3): o recrutador "filtrava" e nada mudava. Aqui todo controle passa por
   `aplicarFiltrosCandidato`, e a lista de partida é `alunosVisiveisPara` —
   que já tira quem não consentiu e, para representante acadêmico, quem é de
   outra universidade.

   As opções de área saem dos próprios alunos visíveis: opção que nunca casa
   com ninguém seria um filtro decorativo disfarçado. */

const PERIODOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// Formação fica de fora: todo aluno tem, então nunca reduziria a lista.
const TIPOS_FILTRAVEIS = [TIPO_EXPERIENCIA.PROFISSIONAL, TIPO_EXPERIENCIA.ACADEMICA];

export default function BancoTalentos() {
  const { estado, usuario } = useEstado();
  const ehRecrutador = usuario.papel === PAPEL.RECRUTADOR;
  const [filtros, setFiltros] = useState(filtrosCandidatoVazios);
  const mudar = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: valor }));
  const alternar = (campo, valor) =>
    mudar(campo, filtros[campo].includes(valor) ? filtros[campo].filter((x) => x !== valor) : [...filtros[campo], valor]);

  const visiveis = useMemo(
    () => alunosVisiveisPara(usuario.membro, estado.alunos, estado.instituicoes),
    [usuario.membro, estado.alunos, estado.instituicoes],
  );
  const resultado = useMemo(() => aplicarFiltrosCandidato(visiveis, filtros), [visiveis, filtros]);

  const universidades = estado.instituicoes.filter((i) => i.tipo === TIPO_INSTITUICAO.FACULDADE);
  const cursos = ehRecrutador ? todosCursos : cursosDaUniversidade(usuario.universidadeId);
  const areas = areasDisponiveis(visiveis);
  const num = (v) => (v === "" ? null : Number(v));

  const temFiltro =
    filtros.texto || filtros.universidadeId || filtros.cursoId || filtros.periodoMinimo || filtros.crMinimo != null || filtros.areas.length || filtros.tiposExperiencia.length;

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px clamp(16px, 4vw, 40px) 80px" }}>
      <h1 style={{ fontSize: "var(--fs-h1)" }}>{ehRecrutador ? "Buscar candidatos" : "Alunos da universidade"}</h1>
      <p style={{ fontSize: 14.5, color: "var(--text-muted)", marginTop: 6 }}>
        {ehRecrutador
          ? "Alunos de todas as universidades que optaram por aparecer em buscas."
          : `Alunos da ${universidades.find((u) => u.id === usuario.universidadeId)?.nome} que optaram por aparecer em buscas.`}
      </p>

      <Card padding={20} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", gap: 14, alignItems: "end" }}>
          <Input size="sm" label="Nome ou habilidade" icon="search" value={filtros.texto} onChange={(e) => mudar("texto", e.target.value)} />
          {ehRecrutador ? (
            <Select size="sm" label="Universidade" value={filtros.universidadeId ?? ""} onChange={(e) => mudar("universidadeId", num(e.target.value))}
              options={[{ value: "", label: "Todas" }, ...universidades.map((u) => ({ value: String(u.id), label: u.nome }))]} />
          ) : null}
          <Select size="sm" label="Curso" value={filtros.cursoId ?? ""} onChange={(e) => mudar("cursoId", num(e.target.value))}
            options={[{ value: "", label: "Todos" }, ...cursos.map((c) => ({ value: String(c.id), label: c.nome }))]} />
          <Select size="sm" label="A partir do período" value={filtros.periodoMinimo ?? ""} onChange={(e) => mudar("periodoMinimo", num(e.target.value))}
            options={[{ value: "", label: "Qualquer" }, ...PERIODOS.map((p) => ({ value: String(p), label: `${p}º` }))]} />
          <Input size="sm" label="CR mínimo" type="number" step="0.1" min="0" max="10" value={filtros.crMinimo ?? ""} onChange={(e) => mudar("crMinimo", num(e.target.value))} />
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <Rotulo>Área de interesse</Rotulo>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {areas.map((a) => (
                <Tag key={a} selected={filtros.areas.includes(a)} onClick={() => alternar("areas", a)}>{a}</Tag>
              ))}
            </div>
          </div>
          <div>
            <Rotulo>Já tem experiência</Rotulo>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {TIPOS_FILTRAVEIS.map((t) => (
                <Tag key={t} selected={filtros.tiposExperiencia.includes(t)} onClick={() => alternar("tiposExperiencia", t)}>
                  {ROTULO_EXPERIENCIA[t]}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        {temFiltro ? (
          <div>
            <Button size="sm" variant="ghost" onClick={() => setFiltros(filtrosCandidatoVazios)}>Limpar filtros</Button>
          </div>
        ) : null}
      </Card>

      <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 20 }}>
        {resultado.length} {resultado.length === 1 ? "aluno" : "alunos"} · ordenados por CR
      </p>

      {resultado.length === 0 ? (
        <Card tone="tint" padding={36} style={{ textAlign: "center", marginTop: 10 }}>
          <p style={{ fontSize: 14.5, color: "var(--green-800)" }}>Ninguém com esses filtros.</p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 16, marginTop: 10 }}>
          {resultado.map((a) => {
            const uni = universidades.find((u) => u.id === a.universidadeId);
            return (
              <Card key={a.id} padding={20} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{a.nome}</div>
                    <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                      {uni?.sigla || uni?.nome} · {nomeDoCurso(a.cursoId)} · {a.periodo}º
                    </div>
                  </div>
                  <Badge tone="accent">CR {a.cr != null ? a.cr.toFixed(1) : "—"}</Badge>
                </div>
                {(a.habilidades || []).length ? (
                  <p style={{ fontSize: 13.5, color: "var(--text-body)" }}>{a.habilidades.slice(0, 4).join(" · ")}</p>
                ) : null}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(a.areasInteresse || []).map((x) => (
                    <Badge key={x} tone="neutral">{x}</Badge>
                  ))}
                </div>
                <Link to={`/painel/aluno/${a.id}`} style={{ fontSize: 14, fontWeight: 600, marginTop: "auto" }}>
                  Ver currículo
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

function Rotulo({ children }) {
  return <span style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-semibold)" }}>{children}</span>;
}
