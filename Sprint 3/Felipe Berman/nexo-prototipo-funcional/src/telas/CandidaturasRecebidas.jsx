import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Input } from "../ds/forms/Input.jsx";
import { Select } from "../ds/forms/Select.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { oportunidadesDoMembro, PAPEL } from "../regras/escopo.js";
import { aplicarFiltrosCandidato, filtrosCandidatoVazios } from "../regras/filtros.js";
import { candidaturasRecebidasPor } from "../regras/publicacao.js";
import { formatarData } from "../regras/datas.js";
import { ROTULO_STATUS, STATUS_CANDIDATURA } from "../dados/candidaturas.js";
import { cursos as todosCursos, cursosDaUniversidade, nomeDoCurso } from "../dados/cursos.js";
import { TIPO_INSTITUICAO } from "../dados/instituicoes.js";

/* Candidaturas recebidas.

   A lista nasce de `candidaturasRecebidasPor`: só vagas do próprio membro e,
   para representante acadêmico, só alunos da própria universidade. Os filtros
   de candidato reusam `aplicarFiltrosCandidato` — a mesma função que o banco de
   talentos usa.

   O filtro de universidade só aparece para recrutador de empresa. Para o
   representante ele teria uma opção só, e controle que não muda nada é
   decorativo. */

const PERIODOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function CandidaturasRecebidas() {
  const { estado, usuario, mudarStatusCandidatura } = useEstado();
  const membro = usuario.membro;
  const ehRecrutador = usuario.papel === PAPEL.RECRUTADOR;
  const [params, setParams] = useSearchParams();

  const oportunidadeId = Number(params.get("oportunidade")) || null;
  const [status, setStatus] = useState("");
  const [filtros, setFiltros] = useState(filtrosCandidatoVazios);
  const mudar = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: valor }));

  const minhasVagas = oportunidadesDoMembro(membro, estado.oportunidades).filter((o) => o.publicadaEm);
  const universidades = estado.instituicoes.filter((i) => i.tipo === TIPO_INSTITUICAO.FACULDADE);
  const cursos = ehRecrutador ? todosCursos : cursosDaUniversidade(usuario.universidadeId);

  const lista = useMemo(() => {
    let r = candidaturasRecebidasPor(membro, estado);
    if (oportunidadeId) r = r.filter((c) => c.oportunidadeId === oportunidadeId);
    if (status) r = r.filter((c) => c.status === status);

    const candidatos = r.map((c) => estado.alunos.find((a) => a.id === c.alunoId)).filter(Boolean);
    // aplicarFiltrosCandidato ordena por CR; a ordem dela é a que a tela usa.
    const filtrados = aplicarFiltrosCandidato(candidatos, filtros);
    const ordem = new Map(filtrados.map((a, i) => [a.id, i]));
    return r
      .filter((c) => ordem.has(c.alunoId))
      .sort((a, b) => ordem.get(a.alunoId) - ordem.get(b.alunoId) || b.data.localeCompare(a.data));
  }, [membro, estado, oportunidadeId, status, filtros]);

  const escolherVaga = (v) => {
    const p = new URLSearchParams(params);
    if (v) p.set("oportunidade", v);
    else p.delete("oportunidade");
    setParams(p, { replace: true });
  };

  const temFiltro =
    oportunidadeId || status || filtros.cursoId || filtros.periodoMinimo || filtros.crMinimo != null || filtros.universidadeId || filtros.texto;

  const limpar = () => {
    setFiltros(filtrosCandidatoVazios);
    setStatus("");
    escolherVaga(null);
  };

  const num = (v) => (v === "" ? null : Number(v));

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px clamp(16px, 4vw, 40px) 80px" }}>
      <h1 style={{ fontSize: "var(--fs-h1)" }}>Candidaturas recebidas</h1>
      <p style={{ fontSize: 14.5, color: "var(--text-muted)", marginTop: 6 }}>
        {ehRecrutador
          ? "Candidatos de todas as universidades para as quais você publicou."
          : `Candidatos da ${universidades.find((u) => u.id === usuario.universidadeId)?.nome} às suas oportunidades.`}
      </p>

      <Card padding={20} style={{ marginTop: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", gap: 14, alignItems: "end" }}>
          <Input size="sm" label="Nome ou habilidade" icon="search" value={filtros.texto} onChange={(e) => mudar("texto", e.target.value)} />
          <Select size="sm" label="Oportunidade" value={oportunidadeId ?? ""} onChange={(e) => escolherVaga(e.target.value)}
            options={[{ value: "", label: "Todas" }, ...minhasVagas.map((o) => ({ value: String(o.id), label: o.titulo }))]} />
          <Select size="sm" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}
            options={[{ value: "", label: "Todos" }, ...Object.values(STATUS_CANDIDATURA).map((s) => ({ value: s, label: ROTULO_STATUS[s] }))]} />
          {ehRecrutador ? (
            <Select size="sm" label="Universidade" value={filtros.universidadeId ?? ""} onChange={(e) => mudar("universidadeId", num(e.target.value))}
              options={[{ value: "", label: "Todas" }, ...universidades.map((u) => ({ value: String(u.id), label: u.nome }))]} />
          ) : null}
          <Select size="sm" label="Curso" value={filtros.cursoId ?? ""} onChange={(e) => mudar("cursoId", num(e.target.value))}
            options={[{ value: "", label: "Todos" }, ...cursos.map((c) => ({ value: String(c.id), label: c.nome }))]} />
          <Select size="sm" label="A partir do período" value={filtros.periodoMinimo ?? ""} onChange={(e) => mudar("periodoMinimo", num(e.target.value))}
            options={[{ value: "", label: "Qualquer" }, ...PERIODOS.map((p) => ({ value: String(p), label: `${p}º` }))]} />
          <Input size="sm" label="CR mínimo" type="number" step="0.1" min="0" max="10" value={filtros.crMinimo ?? ""} onChange={(e) => mudar("crMinimo", num(e.target.value))} />
          {temFiltro ? <Button size="sm" variant="ghost" onClick={limpar}>Limpar filtros</Button> : null}
        </div>
      </Card>

      <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 20 }}>
        {lista.length} {lista.length === 1 ? "candidatura" : "candidaturas"}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
        {lista.length === 0 ? (
          <Card tone="tint" padding={36} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14.5, color: "var(--green-800)" }}>Nenhuma candidatura com esses filtros.</p>
          </Card>
        ) : (
          lista.map((c) => {
            const a = estado.alunos.find((x) => x.id === c.alunoId);
            const o = estado.oportunidades.find((x) => x.id === c.oportunidadeId);
            const uni = universidades.find((u) => u.id === a.universidadeId);
            return (
              <Card key={c.id} padding={16}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }} data-candidatura={c.id}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <Link to={`/painel/aluno/${a.id}`} style={{ fontSize: 15.5, fontWeight: 600 }}>{a.nome}</Link>
                    <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                      {uni?.sigla || uni?.nome} · {nomeDoCurso(a.cursoId)} · {a.periodo}º período · CR {a.cr != null ? a.cr.toFixed(1) : "não informado"}
                    </div>
                    <div style={{ fontSize: 13.5, color: "var(--green-600)", marginTop: 4 }}>
                      {o?.titulo} · em {formatarData(c.data)}
                    </div>
                  </div>
                  <Select size="sm" aria-label={`Status de ${a.nome}`} value={c.status} style={{ minWidth: 190 }}
                    onChange={(e) => mudarStatusCandidatura(c.id, e.target.value)}
                    options={Object.values(STATUS_CANDIDATURA).map((s) => ({ value: s, label: ROTULO_STATUS[s] }))} />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
}
