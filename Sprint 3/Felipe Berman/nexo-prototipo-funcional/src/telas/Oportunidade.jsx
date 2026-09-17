import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Badge } from "../ds/core/Badge.jsx";
import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Icon } from "../ds/core/Icon.jsx";
import { Toast } from "../ds/feedback/Toast.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { alunoPodeAbrir } from "../regras/escopo.js";
import { podeCandidatar } from "../regras/candidatura.js";
import { formatarData, textoPrazo } from "../regras/datas.js";
import { FORMA_CANDIDATURA, ROTULO_MODALIDADE, ROTULO_TIPO } from "../dados/oportunidades.js";
import { nomeDoCurso } from "../dados/cursos.js";
import logos from "../assets/logos.js";

/* Detalhe da oportunidade.

   Os sete campos obrigatórios (RF07) ficam em destaque porque "o anúncio não
   dizia o essencial" foi a segunda dor mais votada da pesquisa.

   Quando a candidatura não é permitida, o botão fica desabilitado E o motivo
   aparece ao lado. Botão cinza sem explicação era exatamente a frustração
   relatada nas entrevistas. */

export default function Oportunidade() {
  const { id } = useParams();
  const { estado, usuario, candidatar, ehFavorito, alternarFavorito } = useEstado();
  const aluno = usuario.aluno;
  const [aviso, setAviso] = useState(null);
  const navegar = useNavigate();

  const o = estado.oportunidades.find((x) => x.id === Number(id));

  // Fora do escopo responde igual a inexistente: não confirma que a vaga existe.
  if (!alunoPodeAbrir(o, aluno, estado.instituicoes)) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "80px clamp(16px, 4vw, 40px)" }}>
        <Card tone="tint" padding={40} style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--fs-h2)", color: "var(--green-900)" }}>
            Oportunidade não encontrada
          </h1>
          <p style={{ fontSize: 14.5, color: "var(--green-800)", marginTop: 10 }}>
            Ela não existe ou não está disponível para a sua universidade.
          </p>
          <div style={{ marginTop: 22 }}>
            <Button onClick={() => navegar("/busca")} variant="outline" size="sm" iconLeft="arrow-left">
              Voltar para a busca
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  const instituicao = estado.instituicoes.find((i) => i.id === o.instituicaoId);
  const veredito = podeCandidatar(aluno, o, estado);
  const favorito = ehFavorito(o.id);
  const externa = o.formaCandidatura === FORMA_CANDIDATURA.EXTERNA;

  const cursos = (o.cursosAlvo || []).length
    ? o.cursosAlvo.map(nomeDoCurso).join(", ")
    : "Qualquer curso";

  const campos = [
    { icone: "clock", rotulo: "Carga horária", valor: `${o.cargaHorariaSemanal}h por semana` },
    {
      icone: "wallet",
      rotulo: "Bolsa",
      valor: o.remunerada ? `R$ ${o.valorBolsa.toLocaleString("pt-BR")} por mês` : "Voluntária, sem bolsa",
    },
    { icone: "building-2", rotulo: "Modalidade", valor: `${ROTULO_MODALIDADE[o.modalidade]}${o.cidade ? ` · ${o.cidade}` : ""}` },
    { icone: "calendar", rotulo: "Prazo de inscrição", valor: o.prazoInscricao ? formatarData(o.prazoInscricao) : "Sem prazo", extra: textoPrazo(o.prazoInscricao) },
    { icone: "graduation-cap", rotulo: "Curso-alvo", valor: cursos },
    {
      icone: "list-checks",
      rotulo: "Exigências",
      valor: [
        o.periodoMinimo ? `A partir do ${o.periodoMinimo}º período` : "Qualquer período",
        o.crMinimo != null ? `CR mínimo ${o.crMinimo.toFixed(1)}` : null,
      ].filter(Boolean).join(" · "),
    },
  ];

  const aoCandidatar = () => {
    const r = candidatar(o.id);
    if (!r.ok) {
      setAviso({ tom: "danger", titulo: "Não foi possível se candidatar", msg: r.erro });
      return;
    }
    if (externa && o.linkExterno) window.open(o.linkExterno, "_blank", "noopener");
    setAviso({
      tom: "success",
      titulo: "Candidatura registrada",
      msg: externa
        ? "Conclua a inscrição no site de quem publicou. Acompanhe o status em Minhas oportunidades."
        : "Seu currículo foi enviado. Acompanhe o status em Minhas oportunidades.",
    });
  };

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px clamp(16px, 4vw, 40px) 80px" }}>
      <Link to="/busca" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14 }}>
        <Icon name="arrow-left" size={15} /> Voltar para a busca
      </Link>

      <header style={{ marginTop: 20, display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {logos[instituicao?.logo] ? (
          <img
            src={logos[instituicao.logo]}
            alt=""
            style={{ width: 56, height: 56, borderRadius: 999, objectFit: "contain", background: "var(--paper)", border: "1px solid var(--border-subtle)", padding: 4 }}
          />
        ) : null}
        <div style={{ flex: 1, minWidth: 260 }}>
          <Badge tone="neutral">{ROTULO_TIPO[o.tipo]}</Badge>
          <h1 style={{ fontSize: "var(--fs-h1)", marginTop: 10 }}>{o.titulo}</h1>
          <Link to={`/instituicao/${o.instituicaoId}`} style={{ display: "inline-block", fontSize: 15.5, marginTop: 6 }}>{instituicao?.nome}</Link>
        </div>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 28, marginTop: 28, alignItems: "flex-start" }}>
        <div style={{ flex: "999 1 480px", minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))", gap: 12 }}>
            {campos.map((c) => (
              <Card key={c.rotulo} tone="tint" padding={16}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "var(--green-700)" }}>
                  <Icon name={c.icone} size={14} /> {c.rotulo}
                </span>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--green-900)", marginTop: 6 }}>{c.valor}</div>
                {c.extra ? <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{c.extra}</div> : null}
              </Card>
            ))}
          </div>

          <section>
            <h2 style={{ fontSize: "var(--fs-h3)" }}>Descrição</h2>
            <p style={{ fontSize: 15, lineHeight: 1.65, marginTop: 8 }}>{o.descricao}</p>
          </section>

          <section>
            <h2 style={{ fontSize: "var(--fs-h3)" }}>Pré-requisitos</h2>
            <Lista itens={o.requisitos} icone="check" />
          </section>

          {(o.beneficios || []).length ? (
            <section>
              <h2 style={{ fontSize: "var(--fs-h3)" }}>O que oferece</h2>
              <Lista itens={o.beneficios} icone="sparkles" />
            </section>
          ) : null}
        </div>

        <aside style={{ flex: "1 1 300px", maxWidth: 380, display: "flex", flexDirection: "column", gap: 16 }}>
          <Card padding={20}>
            <Button block disabled={!veredito.pode} onClick={aoCandidatar} icon={externa ? "external-link" : undefined}>
              {externa ? "Candidatar-se no site externo" : "Candidatar-se"}
            </Button>

            {!veredito.pode ? (
              <p role="status" style={{ display: "flex", gap: 8, fontSize: 13.5, lineHeight: 1.5, color: "var(--green-800)", marginTop: 12 }}>
                <span style={{ color: "var(--warning)", display: "inline-flex", paddingTop: 2 }}>
                  <Icon name="info" size={15} />
                </span>
                {veredito.motivo}
              </p>
            ) : null}

            <Button
              block
              variant="outline"
              iconLeft={favorito ? "bookmark-check" : "bookmark"}
              onClick={() => alternarFavorito(o.id)}
              style={{ marginTop: 12 }}
            >
              {favorito ? "Salva nos favoritos" : "Salvar para depois"}
            </Button>

            {o.vagas ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12, textAlign: "center" }}>
                {o.vagas} {o.vagas === 1 ? "vaga" : "vagas"}
              </p>
            ) : null}
          </Card>

          <Card padding={20}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--green-700)" }}>Responsável pela vaga</span>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>{o.responsavelNome}</div>
            {o.responsavelContato ? (
              <a href={`mailto:${o.responsavelContato}`} style={{ fontSize: 14, display: "inline-block", marginTop: 4 }}>
                {o.responsavelContato}
              </a>
            ) : null}
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>
              Publicada em {formatarData(o.publicadaEm)}
            </div>
          </Card>

          {aviso ? (
            <Toast tone={aviso.tom} title={aviso.titulo} message={aviso.msg} onClose={() => setAviso(null)} style={{ minWidth: 0 }} />
          ) : null}
        </aside>
      </div>
    </main>
  );
}

function Lista({ itens = [], icone }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      {itens.map((t) => (
        <li key={t} style={{ display: "flex", gap: 10, fontSize: 15, lineHeight: 1.5 }}>
          <span style={{ color: "var(--green-500)", display: "inline-flex", paddingTop: 3 }}>
            <Icon name={icone} size={15} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}
