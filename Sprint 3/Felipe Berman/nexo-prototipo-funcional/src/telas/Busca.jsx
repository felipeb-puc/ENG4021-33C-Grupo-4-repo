import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Tag } from "../ds/core/Tag.jsx";
import { Input } from "../ds/forms/Input.jsx";
import { Select } from "../ds/forms/Select.jsx";
import { Switch } from "../ds/forms/Switch.jsx";
import CardOportunidade from "../componentes/CardOportunidade.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { oportunidadesVisiveisPara } from "../regras/escopo.js";
import {
  aplicarFiltros,
  contarFiltrosAtivos,
  contarPorTipo,
  filtrosVazios,
  ORDENACAO,
  ROTULO_ORDENACAO,
} from "../regras/filtros.js";
import { MODALIDADE, ROTULO_MODALIDADE, ROTULO_TIPO, TIPO_OPORTUNIDADE } from "../dados/oportunidades.js";
import { cursosDaUniversidade } from "../dados/cursos.js";

/* Busca do estudante.

   O escopo vem antes de qualquer filtro: `oportunidadesVisiveisPara` recorta o
   que a universidade da pessoa alcança, e só então `aplicarFiltros` age. O
   título diz explicitamente qual universidade é essa — no protótipo o texto era
   fixo e não correspondia a filtro nenhum.

   A categoria mora na URL (?tipo=) porque os chips do início linkam para cá. */

const TIPOS = Object.values(TIPO_OPORTUNIDADE);
const PERIODOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function Busca() {
  const { estado, usuario } = useEstado();
  const aluno = usuario.aluno;
  const [params, setParams] = useSearchParams();

  const tipoDaUrl = params.get("tipo");
  const tipo = TIPOS.includes(tipoDaUrl) ? tipoDaUrl : null;

  const [filtros, setFiltros] = useState(filtrosVazios);
  const mudar = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: valor }));

  const escolherTipo = (novo) => {
    const p = new URLSearchParams(params);
    if (novo) p.set("tipo", novo);
    else p.delete("tipo");
    setParams(p, { replace: true });
  };

  const visiveis = useMemo(
    () => oportunidadesVisiveisPara(aluno, estado.oportunidades, estado.instituicoes),
    [aluno, estado.oportunidades, estado.instituicoes],
  );
  const porTipo = useMemo(() => contarPorTipo(visiveis), [visiveis]);
  const resultado = useMemo(
    () => aplicarFiltros(visiveis, { ...filtros, tipo }, estado.instituicoes),
    [visiveis, filtros, tipo, estado.instituicoes],
  );

  const cursos = cursosDaUniversidade(aluno.universidadeId);
  const nAtivos = contarFiltrosAtivos(filtros) + (tipo ? 1 : 0);

  const alternarModalidade = (m) =>
    mudar(
      "modalidades",
      filtros.modalidades.includes(m)
        ? filtros.modalidades.filter((x) => x !== m)
        : [...filtros.modalidades, m],
    );

  const limpar = () => {
    setFiltros({ ...filtrosVazios, texto: filtros.texto, ordenacao: filtros.ordenacao });
    escolherTipo(null);
  };

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px" }}>
      <h1 style={{ fontSize: "var(--fs-h1)" }}>
        Oportunidades abertas na {usuario.instituicao?.nome}
      </h1>
      <p style={{ fontSize: 14.5, color: "var(--text-muted)", marginTop: 6 }}>
        Você vê o que é da sua universidade e os estágios publicados para ela.
      </p>

      <div style={{ marginTop: 22, maxWidth: 640 }}>
        <Input
          icon="search"
          placeholder="Buscar por título, instituição, curso..."
          value={filtros.texto}
          onChange={(e) => mudar("texto", e.target.value)}
          aria-label="Buscar oportunidades"
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
        <Tag selected={!tipo} onClick={() => escolherTipo(null)}>
          Todas {visiveis.length}
        </Tag>
        {TIPOS.map((t) => (
          <Tag key={t} selected={tipo === t} onClick={() => escolherTipo(t)}>
            {ROTULO_TIPO[t]} {porTipo[t] || 0}
          </Tag>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 28,
          marginTop: 28,
          alignItems: "flex-start",
        }}
      >
        {/* ---------- filtros ---------- */}
        <Card padding={20} style={{ display: "flex", flexDirection: "column", gap: 18, flex: "1 1 260px", maxWidth: 320 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: 15 }}>Filtros{nAtivos ? ` (${nAtivos})` : ""}</strong>
            {nAtivos ? (
              <Button variant="ghost" size="sm" onClick={limpar}>
                Limpar
              </Button>
            ) : null}
          </div>

          <Select
            label="Curso"
            size="sm"
            value={filtros.cursoId ?? ""}
            onChange={(e) => mudar("cursoId", e.target.value ? Number(e.target.value) : null)}
            options={[{ value: "", label: "Qualquer curso" }, ...cursos.map((c) => ({ value: String(c.id), label: c.nome }))]}
          />

          <Select
            label="Estou no período"
            hint="Esconde o que exige período mais avançado."
            size="sm"
            value={filtros.periodo ?? ""}
            onChange={(e) => mudar("periodo", e.target.value ? Number(e.target.value) : null)}
            options={[{ value: "", label: "Qualquer período" }, ...PERIODOS.map((p) => ({ value: String(p), label: `${p}º período` }))]}
          />

          <div>
            <span style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-semibold)" }}>Modalidade</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {Object.values(MODALIDADE).map((m) => (
                <Tag key={m} selected={filtros.modalidades.includes(m)} onClick={() => alternarModalidade(m)}>
                  {ROTULO_MODALIDADE[m]}
                </Tag>
              ))}
            </div>
          </div>

          <Switch
            label="Só remuneradas"
            checked={filtros.somenteRemuneradas}
            onChange={(e) => mudar("somenteRemuneradas", e.target.checked)}
          />
          <Switch
            label="Só inscrições abertas"
            checked={filtros.somenteAbertas}
            onChange={(e) => mudar("somenteAbertas", e.target.checked)}
          />
        </Card>

        {/* ---------- resultados ---------- */}
        <section style={{ flex: "999 1 560px", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
              {resultado.length} {resultado.length === 1 ? "oportunidade" : "oportunidades"}
            </span>
            <Select
              size="sm"
              aria-label="Ordenar por"
              value={filtros.ordenacao}
              onChange={(e) => mudar("ordenacao", e.target.value)}
              options={Object.values(ORDENACAO).map((o) => ({ value: o, label: ROTULO_ORDENACAO[o] }))}
              style={{ minWidth: 180 }}
            />
          </div>

          {resultado.length === 0 ? (
            <Card tone="tint" padding={40} style={{ marginTop: 16, textAlign: "center" }}>
              <h3 style={{ fontSize: "var(--fs-h3)", color: "var(--green-900)" }}>
                Nada com esses filtros
              </h3>
              <p style={{ fontSize: 14.5, color: "var(--green-800)", marginTop: 8 }}>
                Tente tirar algum filtro ou mudar a busca.
              </p>
            </Card>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 20,
                marginTop: 16,
              }}
            >
              {resultado.map((o) => (
                <CardOportunidade key={o.id} oportunidade={o} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
