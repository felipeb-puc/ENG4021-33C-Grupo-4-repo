import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "../ds/core/Badge.jsx";
import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Toast } from "../ds/feedback/Toast.jsx";
import { Input } from "../ds/forms/Input.jsx";
import AreaTexto from "../componentes/AreaTexto.jsx";
import CardOportunidade from "../componentes/CardOportunidade.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { oportunidadesVisiveisPara, PAPEL } from "../regras/escopo.js";
import {
  alunoPodeVerInstituicao,
  instituicaoParaFormulario,
  MOTIVO_NAO_VERIFICADO,
  podeEditarInstituicao,
} from "../regras/instituicao.js";
import { ORDENACAO, ordenar } from "../regras/filtros.js";
import { TIPO_INSTITUICAO } from "../dados/instituicoes.js";
import { STATUS_OPORTUNIDADE } from "../dados/oportunidades.js";
import logos from "../assets/logos.js";

/* Perfil da instituição (RF06).

   Para o aluno, as oportunidades listadas passam por
   `oportunidadesVisiveisPara` — o perfil da Visagio mostra à aluna da UERJ só
   os estágios publicados para a UERJ, não todos. E perfil de liga ou
   departamento de outra universidade nem abre, pela mesma regra da busca.

   Para o dono, a lista mostra as abertas dele e o botão de editar; para outros
   membros e para a administração, só o perfil. */

const ROTULO_TIPO_INSTITUICAO = {
  [TIPO_INSTITUICAO.FACULDADE]: "Universidade",
  [TIPO_INSTITUICAO.DEPARTAMENTO]: "Departamento",
  [TIPO_INSTITUICAO.LIGA_ACADEMICA]: "Liga acadêmica",
  [TIPO_INSTITUICAO.EQUIPE_COMPETICAO]: "Equipe de competição",
  [TIPO_INSTITUICAO.EMPRESA]: "Empresa",
};

export default function Instituicao() {
  const { id } = useParams();
  const { estado, usuario, salvarInstituicao } = useEstado();
  const navegar = useNavigate();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(null);
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);

  const inst = estado.instituicoes.find((i) => i.id === Number(id));
  const ehAluno = usuario.papel === PAPEL.ALUNO;
  const ehDono = Boolean(usuario.membro) && usuario.membro.instituicaoId === inst?.id;

  const oportunidades = useMemo(() => {
    if (!inst) return [];
    if (ehAluno) {
      return ordenar(
        oportunidadesVisiveisPara(usuario.aluno, estado.oportunidades, estado.instituicoes).filter((o) => o.instituicaoId === inst.id),
        ORDENACAO.ENCERRANDO,
      );
    }
    if (ehDono) {
      return estado.oportunidades.filter((o) => o.instituicaoId === inst.id && o.status === STATUS_OPORTUNIDADE.ABERTA);
    }
    return [];
  }, [inst, ehAluno, ehDono, usuario.aluno, estado.oportunidades, estado.instituicoes]);

  if (!inst || (ehAluno && !alunoPodeVerInstituicao(usuario.aluno, inst))) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "80px 40px" }}>
        <Card tone="tint" padding={40} style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--fs-h2)", color: "var(--green-900)" }}>Instituição não encontrada</h1>
          <p style={{ fontSize: 14.5, color: "var(--green-800)", marginTop: 10 }}>
            Ela não existe ou não faz parte da sua universidade.
          </p>
          <div style={{ marginTop: 22 }}>
            <Button variant="outline" size="sm" iconLeft="arrow-left" onClick={() => navegar(-1)}>Voltar</Button>
          </div>
        </Card>
      </main>
    );
  }

  const podeEditar = podeEditarInstituicao(usuario.membro, inst);
  const universidade = inst.universidadeVinculada ? estado.instituicoes.find((i) => i.id === inst.universidadeVinculada) : null;
  const mudar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const salvar = () => {
    const r = salvarInstituicao(inst.id, form);
    if (!r.ok) {
      setErros(r.erros);
      return;
    }
    setEditando(false);
    setAviso({ tom: "success", titulo: "Perfil atualizado", msg: "Os alunos já veem a nova versão." });
  };

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 40px 80px" }}>
      <header style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        {logos[inst.logo] ? (
          <img src={logos[inst.logo]} alt="" style={{ width: 80, height: 80, borderRadius: 999, objectFit: "contain", background: "var(--paper)", border: "1px solid var(--border-subtle)", padding: 6 }} />
        ) : null}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone="neutral">{ROTULO_TIPO_INSTITUICAO[inst.tipo]}</Badge>
            {universidade ? <Badge tone="neutral">{universidade.nome}</Badge> : null}
          </div>
          <h1 style={{ fontSize: "var(--fs-h1)", marginTop: 10 }}>{inst.nome}</h1>
          <p style={{ fontSize: 14.5, color: "var(--text-muted)", marginTop: 4 }}>
            {inst.cidade}
            {inst.site ? (
              <>
                {" · "}
                <a href={inst.site} target="_blank" rel="noopener noreferrer">{inst.site.replace(/^https?:\/\//, "")}</a>
              </>
            ) : null}
          </p>
        </div>
        {ehDono && !editando ? (
          <Button variant="outline" iconLeft="pencil" disabled={!podeEditar}
            onClick={() => { setForm(instituicaoParaFormulario(inst)); setErros({}); setEditando(true); }}>
            Editar perfil
          </Button>
        ) : null}
      </header>

      {ehDono && !podeEditar ? (
        <Card tone="tint" padding={16} style={{ marginTop: 18 }}>
          <p style={{ fontSize: 14, color: "var(--green-800)" }}>{MOTIVO_NAO_VERIFICADO}</p>
        </Card>
      ) : null}

      {editando ? (
        <Card padding={24} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
            Nome, tipo e universidade vinculada não são editáveis: definem quem pode publicar o quê e para quem.
          </p>
          {erros.geral ? <p style={{ color: "var(--danger)" }}>{erros.geral}</p> : null}
          <AreaTexto label="Descrição" linhas={5} maxLength={600} value={form.descricao} error={erros.descricao}
            hint={`${form.descricao.length}/600`} onChange={(v) => mudar("descricao", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <Input label="Site" placeholder="https://" value={form.site} error={erros.site} onChange={(e) => mudar("site", e.target.value)} />
            <Input label="Cidade" value={form.cidade} error={erros.cidade} onChange={(e) => mudar("cidade", e.target.value)} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="ghost" onClick={() => setEditando(false)}>Cancelar</Button>
            <Button onClick={salvar}>Salvar</Button>
          </div>
        </Card>
      ) : (
        <p style={{ fontSize: 15.5, lineHeight: 1.65, marginTop: 22, maxWidth: 760 }}>{inst.descricao}</p>
      )}

      {ehAluno || ehDono ? (
        <section style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: "var(--fs-h2)" }}>Oportunidades abertas</h2>
          {ehAluno ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 4 }}>
              Só as que estão disponíveis para a {usuario.instituicao?.nome}.
            </p>
          ) : null}
          {oportunidades.length === 0 ? (
            <Card tone="tint" padding={32} style={{ marginTop: 16, textAlign: "center" }}>
              <p style={{ fontSize: 14.5, color: "var(--green-800)" }}>Nenhuma oportunidade aberta agora.</p>
            </Card>
          ) : ehAluno ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginTop: 16 }}>
              {oportunidades.map((o) => (
                <CardOportunidade key={o.id} oportunidade={o} />
              ))}
            </div>
          ) : (
            <ul style={{ marginTop: 12, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {oportunidades.map((o) => (
                <li key={o.id} style={{ fontSize: 15 }}>{o.titulo}</li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {aviso ? (
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 60 }}>
          <Toast tone={aviso.tom} title={aviso.titulo} message={aviso.msg} onClose={() => setAviso(null)} />
        </div>
      ) : null}
    </main>
  );
}
