import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "../ds/core/Badge.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Tabs } from "../ds/navigation/Tabs.jsx";
import CardOportunidade from "../componentes/CardOportunidade.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { oportunidadesVisiveisPara } from "../regras/escopo.js";
import { formatarData } from "../regras/datas.js";
import { ROTULO_STATUS, STATUS_ENCERRADOS, TOM_STATUS } from "../dados/candidaturas.js";
import { ROTULO_TIPO } from "../dados/oportunidades.js";

/* Minhas oportunidades — Favoritos (RF13), Candidaturas ativas (RF14) e
   Histórico (RF15).

   Favoritos passam pelo escopo: se a vaga foi encerrada ou saiu do alcance da
   universidade, deixa de aparecer. Candidaturas não passam — são registro do
   que a pessoa fez, e somem do histórico seria perder a informação. */

const ABA = { FAVORITOS: "favoritos", ATIVAS: "ativas", HISTORICO: "historico" };

export default function MinhasOportunidades() {
  const { estado, usuario } = useEstado();
  const aluno = usuario.aluno;
  const [aba, setAba] = useState(ABA.ATIVAS);

  const favoritos = useMemo(() => {
    const ids = estado.favoritos.filter((f) => f.alunoId === aluno.id).map((f) => f.oportunidadeId);
    return oportunidadesVisiveisPara(aluno, estado.oportunidades, estado.instituicoes).filter((o) =>
      ids.includes(o.id),
    );
  }, [aluno, estado.favoritos, estado.oportunidades, estado.instituicoes]);

  const minhas = estado.candidaturas
    .filter((c) => c.alunoId === aluno.id)
    .sort((a, b) => b.data.localeCompare(a.data));
  const ativas = minhas.filter((c) => !STATUS_ENCERRADOS.includes(c.status));
  const historico = minhas.filter((c) => STATUS_ENCERRADOS.includes(c.status));

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px clamp(16px, 4vw, 40px) 80px" }}>
      <h1 style={{ fontSize: "var(--fs-h1)" }}>Minhas oportunidades</h1>

      <Tabs
        style={{ marginTop: 24 }}
        value={aba}
        onChange={setAba}
        items={[
          { value: ABA.ATIVAS, label: "Candidaturas ativas", count: ativas.length },
          { value: ABA.FAVORITOS, label: "Favoritos", count: favoritos.length },
          { value: ABA.HISTORICO, label: "Histórico", count: historico.length },
        ]}
      />

      <div style={{ marginTop: 24 }}>
        {aba === ABA.FAVORITOS ? (
          favoritos.length === 0 ? (
            <Vazio titulo="Nenhuma oportunidade salva" texto="Use o marcador nos cards para guardar o que quer ver depois." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))", gap: 20 }}>
              {favoritos.map((o) => (
                <CardOportunidade key={o.id} oportunidade={o} />
              ))}
            </div>
          )
        ) : (
          <ListaCandidaturas
            itens={aba === ABA.ATIVAS ? ativas : historico}
            vazio={
              aba === ABA.ATIVAS
                ? <Vazio titulo="Nenhuma candidatura em andamento" texto="Quando você se candidatar, o status aparece aqui." />
                : <Vazio titulo="Histórico vazio" texto="Processos aprovados, recusados ou desistidos ficam guardados aqui." />
            }
          />
        )}
      </div>
    </main>
  );
}

function ListaCandidaturas({ itens, vazio }) {
  const { estado } = useEstado();
  if (itens.length === 0) return vazio;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {itens.map((c) => {
        const o = estado.oportunidades.find((x) => x.id === c.oportunidadeId);
        const inst = estado.instituicoes.find((i) => i.id === o?.instituicaoId);
        const tom = TOM_STATUS[c.status] || {};
        return (
          <Card key={c.id} padding={18}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
              <div style={{ minWidth: 240, flex: 1 }}>
                <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  {o ? ROTULO_TIPO[o.tipo] : ""} · candidatura em {formatarData(c.data)}
                </span>
                <div style={{ marginTop: 4 }}>
                  {o ? (
                    <Link to={`/oportunidade/${o.id}`} style={{ fontSize: 16, fontWeight: 600 }}>
                      {o.titulo}
                    </Link>
                  ) : (
                    <span style={{ fontSize: 16, fontWeight: 600 }}>Oportunidade removida</span>
                  )}
                </div>
                <div style={{ fontSize: 14, color: "var(--green-600)", marginTop: 2 }}>{inst?.nome}</div>
                {c.observacoes ? (
                  <p style={{ fontSize: 13.5, color: "var(--text-body)", marginTop: 8 }}>{c.observacoes}</p>
                ) : null}
              </div>
              <Badge tone={tom.tom} icon={tom.icone}>
                {ROTULO_STATUS[c.status]}
              </Badge>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Vazio({ titulo, texto }) {
  return (
    <Card tone="tint" padding={40} style={{ textAlign: "center" }}>
      <h3 style={{ fontSize: "var(--fs-h3)", color: "var(--green-900)" }}>{titulo}</h3>
      <p style={{ fontSize: 14.5, color: "var(--green-800)", marginTop: 8 }}>{texto}</p>
    </Card>
  );
}
