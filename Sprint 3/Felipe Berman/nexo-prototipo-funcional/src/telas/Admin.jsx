import { Link } from "react-router-dom";

import { Badge } from "../ds/core/Badge.jsx";
import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { papelDoMembro, PAPEL } from "../regras/escopo.js";
import { membrosPendentes } from "../regras/instituicao.js";

/* Verificação de contas (RF03) — a tela do administrador.

   Substitui o "Simular aprovação" do protótipo, em que a própria conta se
   aprovava. Modo simples de propósito: aprovar e ver quem já foi aprovado.
   Recusar e pedir documentação ficam para quando existir fluxo real de
   verificação (ver pendências no CLAUDE.md). */

export default function Admin() {
  const { estado, aprovarMembro } = useEstado();
  const pendentes = membrosPendentes(estado.membros);
  const verificados = estado.membros.filter((m) => m.verificado);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px clamp(16px, 4vw, 40px) 80px" }}>
      <h1 style={{ fontSize: "var(--fs-h1)" }}>Verificação de contas</h1>
      <p style={{ fontSize: 14.5, color: "var(--text-muted)", marginTop: 6 }}>
        Conta não verificada salva rascunhos, mas não publica nem edita o perfil da instituição.
      </p>

      <h2 style={{ fontSize: "var(--fs-h3)", marginTop: 32 }}>Aguardando aprovação ({pendentes.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {pendentes.length === 0 ? (
          <Card tone="tint" padding={28} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14.5, color: "var(--green-800)" }}>Nenhuma conta pendente.</p>
          </Card>
        ) : (
          pendentes.map((m) => <LinhaMembro key={m.id} membro={m} acao={<Button size="sm" onClick={() => aprovarMembro(m.id)}>Aprovar</Button>} />)
        )}
      </div>

      <h2 style={{ fontSize: "var(--fs-h3)", marginTop: 32 }}>Verificadas ({verificados.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {verificados.map((m) => (
          <LinhaMembro key={m.id} membro={m} acao={<Badge tone="success" icon="check-circle">Verificada</Badge>} />
        ))}
      </div>
    </main>
  );
}

function LinhaMembro({ membro, acao }) {
  const { estado } = useEstado();
  const inst = estado.instituicoes.find((i) => i.id === membro.instituicaoId);
  const papel = papelDoMembro(membro, estado.instituicoes);
  return (
    <Card padding={16}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }} data-membro={membro.id}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600 }}>{membro.nome}</div>
          <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
            {membro.cargo ? `${membro.cargo} · ` : ""}{membro.email}
          </div>
          <div style={{ fontSize: 13.5, marginTop: 4 }}>
            <Link to={`/instituicao/${inst?.id}`}>{inst?.nome}</Link>
            {" · "}
            {papel === PAPEL.RECRUTADOR ? "Recrutador" : "Representante acadêmico"}
          </div>
        </div>
        {acao}
      </div>
    </Card>
  );
}
