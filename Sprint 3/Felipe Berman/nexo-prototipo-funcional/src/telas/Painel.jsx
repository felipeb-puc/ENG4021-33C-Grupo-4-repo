import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Badge } from "../ds/core/Badge.jsx";
import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Dialog } from "../ds/feedback/Dialog.jsx";
import { Toast } from "../ds/feedback/Toast.jsx";
import { Tabs } from "../ds/navigation/Tabs.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { oportunidadesDoMembro, PAPEL, tiposQuePodePublicar } from "../regras/escopo.js";
import { candidaturasRecebidasPor, podeEncerrar } from "../regras/publicacao.js";
import { MOTIVO_NAO_VERIFICADO, podePublicar } from "../regras/instituicao.js";
import { totalCandidaturas } from "../regras/candidatura.js";
import { estaVencida, formatarData, textoPrazo } from "../regras/datas.js";
import { ROTULO_TIPO, STATUS_OPORTUNIDADE } from "../dados/oportunidades.js";
import { STATUS_CANDIDATURA } from "../dados/candidaturas.js";

/* Painel de quem publica.

   O mesmo componente serve recrutador e representante acadêmico, mas o que
   muda entre eles vem das regras, não de um "if papel" espalhado: o tipo que
   cada um publica sai de `tiposQuePodePublicar` e as vagas listadas saem de
   `oportunidadesDoMembro` — um nunca vê a vaga do outro.

   Encerrar pede confirmação porque não tem volta: a vaga some da busca dos
   alunos na hora. */

const S = STATUS_OPORTUNIDADE;
const ROTULO_STATUS_OP = { [S.ABERTA]: "Aberta", [S.RASCUNHO]: "Rascunho", [S.ENCERRADA]: "Encerrada" };
const TOM_STATUS_OP = { [S.ABERTA]: "success", [S.RASCUNHO]: "neutral", [S.ENCERRADA]: "neutral" };

export default function Painel() {
  const { estado, usuario, encerrarOportunidade } = useEstado();
  const navegar = useNavigate();
  const membro = usuario.membro;
  const [aba, setAba] = useState(S.ABERTA);
  const [aEncerrar, setAEncerrar] = useState(null);
  const [aviso, setAviso] = useState(null);

  const minhas = useMemo(
    () =>
      oportunidadesDoMembro(membro, estado.oportunidades).sort((a, b) =>
        (b.publicadaEm || "9999").localeCompare(a.publicadaEm || "9999"),
      ),
    [membro, estado.oportunidades],
  );
  const recebidas = candidaturasRecebidasPor(membro, estado);
  const novas = recebidas.filter((c) => c.status === STATUS_CANDIDATURA.INSCRITA).length;
  const porStatus = (st) => minhas.filter((o) => o.status === st);
  const listadas = porStatus(aba);

  const tipos = tiposQuePodePublicar(membro, estado.instituicoes).map((t) => ROTULO_TIPO[t].toLowerCase());
  const ehRecrutador = usuario.papel === PAPEL.RECRUTADOR;

  const confirmarEncerrar = () => {
    const r = encerrarOportunidade(aEncerrar.id);
    setAviso(r.ok ? { tom: "success", titulo: "Oportunidade encerrada", msg: `"${aEncerrar.titulo}" saiu da busca dos alunos.` } : { tom: "danger", titulo: "Não foi possível encerrar", msg: r.erro });
    setAEncerrar(null);
  };

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px clamp(16px, 4vw, 40px) 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "var(--fs-h1)" }}>{usuario.instituicao?.nome}</h1>
          <p style={{ fontSize: 14.5, color: "var(--text-muted)", marginTop: 6 }}>
            {ehRecrutador
              ? "Você publica estágios e escolhe para quais universidades."
              : `Você publica ${tipos.slice(0, -1).join(", ")}${tipos.length > 1 ? " e " : ""}${tipos.at(-1)} para alunos da ${estado.instituicoes.find((i) => i.id === usuario.universidadeId)?.nome}.`}
          </p>
        </div>
        <Button icon="plus" onClick={() => navegar("/painel/nova-oportunidade")}>
          Publicar oportunidade
        </Button>
      </div>

      {!podePublicar(membro) ? (
        <Card tone="tint" padding={16} style={{ marginTop: 20 }}>
          <p role="status" style={{ fontSize: 14, color: "var(--green-800)" }}>{MOTIVO_NAO_VERIFICADO}</p>
        </Card>
      ) : null}

      <div style={{ display: "flex", gap: 36, marginTop: 28, flexWrap: "wrap" }}>
        <Numero valor={porStatus(S.ABERTA).length} rotulo="oportunidades abertas" />
        <Numero valor={recebidas.length} rotulo="candidaturas recebidas" />
        <Numero valor={novas} rotulo="aguardando primeira análise" />
      </div>

      <Tabs
        style={{ marginTop: 32 }}
        value={aba}
        onChange={setAba}
        items={[S.ABERTA, S.RASCUNHO, S.ENCERRADA].map((st) => ({
          value: st,
          label: st === S.ABERTA ? "Abertas" : st === S.RASCUNHO ? "Rascunhos" : "Encerradas",
          count: porStatus(st).length,
        }))}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
        {listadas.length === 0 ? (
          <Card tone="tint" padding={36} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14.5, color: "var(--green-800)" }}>Nada aqui por enquanto.</p>
          </Card>
        ) : (
          listadas.map((o) => {
            const n = totalCandidaturas(o.id, estado.candidaturas);
            const vencida = o.status === S.ABERTA && estaVencida(o.prazoInscricao);
            return (
              <Card key={o.id} padding={18}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge tone="neutral">{ROTULO_TIPO[o.tipo]}</Badge>
                      <Badge tone={TOM_STATUS_OP[o.status]}>{ROTULO_STATUS_OP[o.status]}</Badge>
                      {vencida ? <Badge tone="warning" icon="alert-triangle">Prazo vencido</Badge> : null}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>{o.titulo}</div>
                    <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 4 }}>
                      {o.prazoInscricao ? `${textoPrazo(o.prazoInscricao)} · ` : ""}
                      {o.publicadaEm ? `publicada em ${formatarData(o.publicadaEm)}` : "não publicada"}
                    </div>
                  </div>

                  {/* RF19 */}
                  <Link to={`/painel/candidaturas?oportunidade=${o.id}`} style={{ textAlign: "center", minWidth: 90 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--green-800)" }}>{n}</div>
                    <div style={{ fontSize: 12.5 }}>{n === 1 ? "inscrito" : "inscritos"}</div>
                  </Link>

                  <div style={{ display: "flex", gap: 8 }}>
                    {o.status !== S.ENCERRADA ? (
                      <Button size="sm" variant="outline" iconLeft="pencil" onClick={() => navegar(`/painel/oportunidade/${o.id}/editar`)}>
                        Editar
                      </Button>
                    ) : null}
                    {podeEncerrar(membro, o) ? (
                      <Button size="sm" variant="ghost" onClick={() => setAEncerrar(o)}>
                        Encerrar
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {aviso ? (
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 60 }}>
          <Toast tone={aviso.tom} title={aviso.titulo} message={aviso.msg} onClose={() => setAviso(null)} />
        </div>
      ) : null}

      {aEncerrar ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <Dialog
            title="Encerrar oportunidade?"
            description={`"${aEncerrar.titulo}" sai da busca dos alunos imediatamente e não pode ser reaberta. As ${totalCandidaturas(aEncerrar.id, estado.candidaturas)} candidaturas continuam visíveis para você.`}
            onClose={() => setAEncerrar(null)}
            footer={
              <>
                <Button variant="ghost" onClick={() => setAEncerrar(null)}>Cancelar</Button>
                <Button variant="dark" onClick={confirmarEncerrar}>Encerrar</Button>
              </>
            }
          />
        </div>
      ) : null}
    </main>
  );
}

function Numero({ valor, rotulo }) {
  return (
    <div>
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--green-800)", lineHeight: 1 }}>{valor}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>{rotulo}</div>
    </div>
  );
}
