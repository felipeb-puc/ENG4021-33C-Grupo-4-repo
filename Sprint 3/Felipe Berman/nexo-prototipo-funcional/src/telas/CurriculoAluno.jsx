import { Link, useNavigate, useParams } from "react-router-dom";

import { Badge } from "../ds/core/Badge.jsx";
import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Icon } from "../ds/core/Icon.jsx";
import Curriculo from "../componentes/Curriculo.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { podeVerCurriculo } from "../regras/escopo.js";
import { formatarData } from "../regras/datas.js";
import { ROTULO_STATUS, TOM_STATUS } from "../dados/candidaturas.js";

/* Currículo de um aluno, visto por quem publica.

   A URL é adivinhável (/painel/aluno/1, /painel/aluno/2...), então a regra
   `podeVerCurriculo` é checada aqui e não só na listagem que leva até esta
   tela — senão bastaria trocar o número para ler o currículo de quem não
   consentiu (RNF03). Negado responde igual a inexistente. */

export default function CurriculoAluno() {
  const { id } = useParams();
  const { estado, usuario } = useEstado();
  const navegar = useNavigate();
  const membro = usuario.membro;
  const aluno = estado.alunos.find((a) => a.id === Number(id));

  if (!podeVerCurriculo(membro, aluno, estado)) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "80px 40px" }}>
        <Card tone="tint" padding={40} style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--fs-h2)", color: "var(--green-900)" }}>Currículo indisponível</h1>
          <p style={{ fontSize: 14.5, color: "var(--green-800)", marginTop: 10 }}>
            Este aluno não existe ou não compartilhou o currículo com a sua instituição.
          </p>
          <div style={{ marginTop: 22 }}>
            <Button variant="outline" size="sm" iconLeft="arrow-left" onClick={() => navegar(-1)}>Voltar</Button>
          </div>
        </Card>
      </main>
    );
  }

  const vagasDaInstituicao = new Set(
    estado.oportunidades.filter((o) => o.instituicaoId === membro.instituicaoId).map((o) => o.id),
  );
  const candidaturas = estado.candidaturas.filter((c) => c.alunoId === aluno.id && vagasDaInstituicao.has(c.oportunidadeId));

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px 80px" }}>
      <Link to="/painel/talentos" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14 }}>
        <Icon name="arrow-left" size={15} /> Voltar
      </Link>

      {candidaturas.length ? (
        <Card tone="tint" padding={18} style={{ marginTop: 18 }}>
          <strong style={{ fontSize: 14 }}>Candidaturas às suas oportunidades</strong>
          <ul style={{ listStyle: "none", padding: 0, marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {candidaturas.map((c) => {
              const o = estado.oportunidades.find((x) => x.id === c.oportunidadeId);
              return (
                <li key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 14 }}>
                  <Link to={`/painel/candidaturas?oportunidade=${o.id}`}>{o.titulo} · {formatarData(c.data)}</Link>
                  <Badge tone={TOM_STATUS[c.status]?.tom}>{ROTULO_STATUS[c.status]}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      <div style={{ marginTop: 18 }}>
        <Curriculo aluno={aluno} />
      </div>
    </main>
  );
}
