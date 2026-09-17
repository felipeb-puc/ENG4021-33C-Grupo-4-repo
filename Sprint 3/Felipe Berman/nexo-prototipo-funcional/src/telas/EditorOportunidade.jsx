import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Tag } from "../ds/core/Tag.jsx";
import { Input } from "../ds/forms/Input.jsx";
import { Radio } from "../ds/forms/Radio.jsx";
import { Select } from "../ds/forms/Select.jsx";
import { Switch } from "../ds/forms/Switch.jsx";
import AreaTexto from "../componentes/AreaTexto.jsx";
import { MOTIVO_NAO_VERIFICADO, podePublicar } from "../regras/instituicao.js";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { PAPEL, podeEditarOportunidade, tiposQuePodePublicar } from "../regras/escopo.js";
import {
  errosDoPasso,
  oportunidadeEmBranco,
  oportunidadeParaFormulario,
  validarOportunidade,
} from "../regras/publicacao.js";
import { formatarData } from "../regras/datas.js";
import { cursos as todosCursos, cursosDaUniversidade, nomeDoCurso } from "../dados/cursos.js";
import { TIPO_INSTITUICAO } from "../dados/instituicoes.js";
import {
  FORMA_CANDIDATURA,
  MODALIDADE,
  ROTULO_MODALIDADE,
  ROTULO_TIPO,
  STATUS_OPORTUNIDADE,
  TIPO_OPORTUNIDADE,
} from "../dados/oportunidades.js";

/* Publicar e editar oportunidade — wizard de 3 passos.

   No protótipo o passo de universidades-alvo existia mas o valor não era
   gravado. Aqui cada passo valida os próprios campos antes de avançar (a
   mensagem aparece embaixo do campo, não num alerta genérico no fim), e o
   último mostra a revisão do anúncio como o aluno vai ler.

   A mesma tela edita: `/painel/oportunidade/:id/editar`. Quem não publicou a
   vaga é mandado de volta ao painel (RNF04). */

const PASSOS = ["O que é", "Condições", "Alcance e contato"];

export default function EditorOportunidade() {
  const { id } = useParams();
  const { estado, usuario, salvarOportunidade } = useEstado();
  const navegar = useNavigate();
  const membro = usuario.membro;

  const existente = id ? estado.oportunidades.find((o) => o.id === Number(id)) : null;
  const [form, setForm] = useState(() =>
    existente ? oportunidadeParaFormulario(existente) : oportunidadeEmBranco(membro, estado.instituicoes),
  );
  const [passo, setPasso] = useState(1);
  const [erros, setErros] = useState({});

  if (id && (!podeEditarOportunidade(membro, existente) || existente.status === STATUS_OPORTUNIDADE.ENCERRADA)) {
    return <Navigate to="/painel" replace />;
  }

  const ehRecrutador = usuario.papel === PAPEL.RECRUTADOR;
  const ehEstagio = form.tipo === TIPO_OPORTUNIDADE.ESTAGIO;
  const jaPublicada = existente?.status === STATUS_OPORTUNIDADE.ABERTA;
  const tipos = tiposQuePodePublicar(membro, estado.instituicoes);
  const universidades = estado.instituicoes.filter((i) => i.tipo === TIPO_INSTITUICAO.FACULDADE);

  // Curso-alvo só oferece cursos que existem onde a vaga vai aparecer.
  const cursosPossiveis = !ehEstagio
    ? cursosDaUniversidade(usuario.universidadeId)
    : form.universidadesAlvo.length
      ? todosCursos.filter((c) => c.universidades.some((u) => form.universidadesAlvo.includes(u)))
      : todosCursos;

  const mudar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };
  const alternar = (campo, valor) =>
    mudar(campo, form[campo].includes(valor) ? form[campo].filter((x) => x !== valor) : [...form[campo], valor]);

  const avancar = () => {
    const doPasso = errosDoPasso(validarOportunidade(form, membro, estado.instituicoes), passo);
    setErros(doPasso);
    if (Object.keys(doPasso).length === 0) setPasso(passo + 1);
  };

  const salvar = (publicar) => {
    const r = salvarOportunidade(existente?.id || null, form, { publicar });
    if (r.ok) {
      navegar("/painel");
      return;
    }
    setErros(r.erros);
    // Volta ao primeiro passo que tem erro, para a pessoa ver onde corrigir.
    const comErro = [1, 2, 3].find((p) => Object.keys(errosDoPasso(r.erros, p)).length);
    if (comErro) setPasso(comErro);
  };

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px clamp(16px, 4vw, 40px) 80px" }}>
      <h1 style={{ fontSize: "var(--fs-h1)" }}>{existente ? "Editar oportunidade" : "Publicar oportunidade"}</h1>
      <p style={{ fontSize: 14.5, color: "var(--text-muted)", marginTop: 6 }}>
        {ehRecrutador
          ? "Como empresa, você publica estágios e escolhe para quais universidades."
          : `Aparece só para alunos da ${universidades.find((u) => u.id === usuario.universidadeId)?.nome}.`}
      </p>

      <ol style={{ display: "flex", gap: 8, listStyle: "none", padding: 0, marginTop: 24, flexWrap: "wrap" }}>
        {PASSOS.map((nome, i) => (
          <li key={nome}>
            <Tag selected={passo === i + 1}>{i + 1}. {nome}</Tag>
          </li>
        ))}
      </ol>

      {!podePublicar(membro) ? (
        <Card tone="tint" padding={16} style={{ marginTop: 16 }}>
          <p role="status" style={{ fontSize: 14, color: "var(--green-800)" }}>{MOTIVO_NAO_VERIFICADO}</p>
        </Card>
      ) : null}

      {erros.geral ? <p style={{ color: "var(--danger)", marginTop: 16 }}>{erros.geral}</p> : null}

      <Card padding={28} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 18 }}>
        {passo === 1 ? (
          <>
            <Select
              label="Tipo"
              value={form.tipo}
              disabled={tipos.length === 1}
              hint={tipos.length === 1 ? "Empresa publica apenas estágio." : undefined}
              onChange={(e) => mudar("tipo", e.target.value)}
              options={tipos.map((t) => ({ value: t, label: ROTULO_TIPO[t] }))}
            />
            <Input label="Título" value={form.titulo} error={erros.titulo} onChange={(e) => mudar("titulo", e.target.value)} />
            <AreaTexto label="Descrição" value={form.descricao} error={erros.descricao} onChange={(v) => mudar("descricao", v)} linhas={5} />
            <AreaTexto label="Pré-requisitos" hint="Um por linha." value={form.requisitos} error={erros.requisitos} onChange={(v) => mudar("requisitos", v)} />
            <AreaTexto label="O que oferece (opcional)" hint="Um por linha." value={form.beneficios} onChange={(v) => mudar("beneficios", v)} />
          </>
        ) : null}

        {passo === 2 ? (
          <>
            <Grade>
              <Input label="Carga horária semanal (h)" type="number" min="1" value={form.cargaHorariaSemanal} error={erros.cargaHorariaSemanal} onChange={(e) => mudar("cargaHorariaSemanal", e.target.value)} />
              <Input label="Prazo de inscrição" type="date" value={form.prazoInscricao || ""} error={erros.prazoInscricao} onChange={(e) => mudar("prazoInscricao", e.target.value)} />
            </Grade>

            <Switch label="Remunerada (com bolsa)" checked={form.remunerada} onChange={(e) => mudar("remunerada", e.target.checked)} />
            {form.remunerada ? (
              <Input label="Valor da bolsa (R$ por mês)" type="number" min="1" value={form.valorBolsa} error={erros.valorBolsa} onChange={(e) => mudar("valorBolsa", e.target.value)} />
            ) : null}

            <div>
              <Rotulo>Modalidade</Rotulo>
              <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
                {Object.values(MODALIDADE).map((m) => (
                  <Radio key={m} name="modalidade" value={m} label={ROTULO_MODALIDADE[m]} checked={form.modalidade === m} onChange={() => mudar("modalidade", m)} />
                ))}
              </div>
            </div>

            <Grade>
              <Input label="Cidade" value={form.cidade} onChange={(e) => mudar("cidade", e.target.value)} />
              <Input label="Número de vagas" type="number" min="1" value={form.vagas} error={erros.vagas} onChange={(e) => mudar("vagas", e.target.value)} />
              <Input label="Período mínimo (opcional)" type="number" min="1" value={form.periodoMinimo} error={erros.periodoMinimo} onChange={(e) => mudar("periodoMinimo", e.target.value)} />
              <Input label="CR mínimo (opcional)" type="number" step="0.1" min="0" max="10" value={form.crMinimo} error={erros.crMinimo} onChange={(e) => mudar("crMinimo", e.target.value)} />
            </Grade>

            <div>
              <Rotulo>Cursos-alvo</Rotulo>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Nenhum marcado = aberta a qualquer curso.</p>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {cursosPossiveis.map((c) => (
                  <Tag key={c.id} selected={form.cursosAlvo.includes(c.id)} onClick={() => alternar("cursosAlvo", c.id)}>
                    {c.nome}
                  </Tag>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {passo === 3 ? (
          <>
            {ehEstagio ? (
              <div>
                <Rotulo>Universidades-alvo</Rotulo>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                  Só alunos destas universidades veem o estágio. Nenhuma marcada = todas.
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {universidades.map((u) => (
                    <Tag key={u.id} selected={form.universidadesAlvo.includes(u.id)} onClick={() => alternar("universidadesAlvo", u.id)}>
                      {u.nome}
                    </Tag>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <Rotulo>Como o aluno se candidata</Rotulo>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                <Radio name="forma" label="Pela plataforma" description="O aluno envia o currículo do perfil com um clique." checked={form.formaCandidatura === FORMA_CANDIDATURA.PLATAFORMA} onChange={() => mudar("formaCandidatura", FORMA_CANDIDATURA.PLATAFORMA)} />
                <Radio name="forma" label="Por link externo" description="Formulário ou site próprio. A candidatura fica registrada aqui também." checked={form.formaCandidatura === FORMA_CANDIDATURA.EXTERNA} onChange={() => mudar("formaCandidatura", FORMA_CANDIDATURA.EXTERNA)} />
              </div>
            </div>
            {form.formaCandidatura === FORMA_CANDIDATURA.EXTERNA ? (
              <Input label="Link da inscrição" placeholder="https://" value={form.linkExterno} error={erros.linkExterno} onChange={(e) => mudar("linkExterno", e.target.value)} />
            ) : null}

            <Grade>
              <Input label="Responsável pela vaga" value={form.responsavelNome} error={erros.responsavelNome} onChange={(e) => mudar("responsavelNome", e.target.value)} />
              <Input label="E-mail de contato" type="email" value={form.responsavelContato} error={erros.responsavelContato} onChange={(e) => mudar("responsavelContato", e.target.value)} />
            </Grade>

            <Revisao form={form} universidades={universidades} />
          </>
        ) : null}
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <Button variant="ghost" iconLeft="arrow-left" onClick={() => (passo === 1 ? navegar("/painel") : setPasso(passo - 1))}>
          {passo === 1 ? "Cancelar" : "Voltar"}
        </Button>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {!jaPublicada ? (
            <Button variant="outline" onClick={() => salvar(false)}>
              Salvar rascunho
            </Button>
          ) : null}
          {passo < 3 ? (
            <Button icon="arrow-right" onClick={avancar}>Próximo</Button>
          ) : (
            <Button disabled={!podePublicar(membro)} onClick={() => salvar(true)}>{jaPublicada ? "Salvar alterações" : "Publicar"}</Button>
          )}
        </div>
      </div>
    </main>
  );
}

function Revisao({ form, universidades }) {
  const ehEstagio = form.tipo === TIPO_OPORTUNIDADE.ESTAGIO;
  const itens = [
    ["Carga horária", form.cargaHorariaSemanal ? `${form.cargaHorariaSemanal}h por semana` : "—"],
    ["Bolsa", form.remunerada ? (form.valorBolsa ? `R$ ${Number(form.valorBolsa).toLocaleString("pt-BR")} por mês` : "—") : "Voluntária"],
    ["Modalidade", ROTULO_MODALIDADE[form.modalidade]],
    ["Prazo", form.prazoInscricao ? formatarData(form.prazoInscricao) : "—"],
    ["Cursos", form.cursosAlvo.length ? form.cursosAlvo.map(nomeDoCurso).join(", ") : "Qualquer curso"],
  ];
  if (ehEstagio) {
    itens.push(["Universidades", form.universidadesAlvo.length ? form.universidadesAlvo.map((id) => universidades.find((u) => u.id === id)?.nome).join(", ") : "Todas"]);
  }
  return (
    <Card tone="tint" padding={18}>
      <Rotulo>Como o aluno vai ver</Rotulo>
      <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>{form.titulo || "Sem título"}</div>
      <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 14px", marginTop: 10, fontSize: 14 }}>
        {itens.map(([k, v]) => (
          <div key={k} style={{ display: "contents" }}>
            <dt style={{ color: "var(--text-muted)" }}>{k}</dt>
            <dd style={{ margin: 0 }}>{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function Rotulo({ children }) {
  return <span style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-semibold)", color: "var(--text-heading)" }}>{children}</span>;
}

function Grade({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 16 }}>{children}</div>;
}
