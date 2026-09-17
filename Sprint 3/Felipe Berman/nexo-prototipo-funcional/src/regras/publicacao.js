/* Regras de publicação — o lado de quem publica.

   Três coisas que o protótipo não fazia:

   1. RF07 era só um formulário: nada obrigava o anúncio a ter carga horária,
      bolsa, modalidade e prazo — justamente o que as entrevistas disseram que
      sempre falta. Aqui publicar sem esses campos é recusado com mensagem por
      campo.

   2. O wizard deixava escolher universidades-alvo e jogava o valor fora.

   3. Qualquer membro podia mudar status de candidatura de qualquer vaga.
      Aqui só quem publicou a vaga mexe nela (RNF04). */

import { FORMA_CANDIDATURA, MODALIDADE, STATUS_OPORTUNIDADE, TIPO_OPORTUNIDADE } from "../dados/oportunidades.js";
import { hojeISO } from "./datas.js";
import {
  PAPEL,
  papelDoMembro,
  podeEditarOportunidade,
  tiposQuePodePublicar,
  universidadeDoMembro,
} from "./escopo.js";

/** Formulário em branco para o wizard. Números ficam como texto enquanto são
 *  editados; `normalizarOportunidade` converte na hora de gravar. */
export function oportunidadeEmBranco(membro, instituicoes) {
  const tipos = tiposQuePodePublicar(membro, instituicoes);
  return {
    tipo: tipos[0],
    titulo: "",
    descricao: "",
    requisitos: "",
    beneficios: "",
    cursosAlvo: [],
    periodoMinimo: "",
    crMinimo: "",
    cargaHorariaSemanal: "",
    remunerada: true,
    valorBolsa: "",
    modalidade: MODALIDADE.PRESENCIAL,
    cidade: "Rio de Janeiro, RJ",
    prazoInscricao: "",
    responsavelNome: membro?.nome || "",
    responsavelContato: membro?.email || "",
    universidadesAlvo: [],
    formaCandidatura: FORMA_CANDIDATURA.PLATAFORMA,
    linkExterno: "",
    vagas: "1",
  };
}

/** Oportunidade gravada -> formulário editável. */
export function oportunidadeParaFormulario(o) {
  const txt = (v) => (v == null ? "" : String(v));
  return {
    ...o,
    requisitos: (o.requisitos || []).join("\n"),
    beneficios: (o.beneficios || []).join("\n"),
    periodoMinimo: txt(o.periodoMinimo),
    crMinimo: txt(o.crMinimo),
    cargaHorariaSemanal: txt(o.cargaHorariaSemanal),
    valorBolsa: txt(o.valorBolsa),
    vagas: txt(o.vagas),
  };
}

const linhas = (t) =>
  String(t || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const numero = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

/** Formulário -> formato do dado. */
export function normalizarOportunidade(f) {
  const ehEstagio = f.tipo === TIPO_OPORTUNIDADE.ESTAGIO;
  return {
    tipo: f.tipo,
    titulo: f.titulo.trim(),
    descricao: f.descricao.trim(),
    requisitos: linhas(f.requisitos),
    beneficios: linhas(f.beneficios),
    cursosAlvo: [...f.cursosAlvo],
    periodoMinimo: numero(f.periodoMinimo),
    crMinimo: numero(f.crMinimo),
    cargaHorariaSemanal: numero(f.cargaHorariaSemanal),
    remunerada: Boolean(f.remunerada),
    valorBolsa: f.remunerada ? numero(f.valorBolsa) : null,
    modalidade: f.modalidade,
    cidade: f.cidade.trim(),
    prazoInscricao: f.prazoInscricao || null,
    responsavelNome: f.responsavelNome.trim(),
    responsavelContato: f.responsavelContato.trim(),
    // Universidades-alvo só existem para estágio; acadêmica herda da instituição.
    universidadesAlvo: ehEstagio ? [...f.universidadesAlvo] : [],
    formaCandidatura: f.formaCandidatura,
    linkExterno: f.formaCandidatura === FORMA_CANDIDATURA.EXTERNA ? f.linkExterno.trim() : "",
    vagas: numero(f.vagas),
  };
}

/* Campos de cada passo do wizard — a validação é chamada por passo para que o
   erro apareça antes de a pessoa avançar, não só no fim. */
export const CAMPOS_DO_PASSO = {
  1: ["tipo", "titulo", "descricao", "requisitos"],
  2: ["cargaHorariaSemanal", "valorBolsa", "modalidade", "prazoInscricao", "periodoMinimo", "crMinimo", "vagas"],
  3: ["universidadesAlvo", "linkExterno", "responsavelNome", "responsavelContato"],
};

/** Valida para publicar. Devolve { campo: mensagem }; objeto vazio = ok.
 *  `hoje` é parâmetro para a verificação poder fixar a data. */
export function validarOportunidade(f, membro, instituicoes, hoje = hojeISO()) {
  const e = {};
  const o = normalizarOportunidade(f);

  if (!tiposQuePodePublicar(membro, instituicoes).includes(o.tipo)) {
    e.tipo =
      papelDoMembro(membro, instituicoes) === PAPEL.RECRUTADOR
        ? "Empresa publica apenas estágio."
        : "Instituição de ensino não publica estágio — isso é com as empresas.";
  }

  if (o.titulo.length < 5) e.titulo = "Dê um título com pelo menos 5 caracteres.";
  if (o.descricao.length < 30) e.descricao = "Descreva a oportunidade em pelo menos 30 caracteres.";
  if (o.requisitos.length === 0) e.requisitos = "Informe ao menos um pré-requisito, um por linha.";

  if (!(o.cargaHorariaSemanal > 0 && o.cargaHorariaSemanal <= 44)) {
    e.cargaHorariaSemanal = "Informe a carga horária semanal, entre 1 e 44 horas.";
  }
  if (o.remunerada && !(o.valorBolsa > 0)) {
    e.valorBolsa = "Informe o valor da bolsa, ou marque como voluntária.";
  }
  if (!Object.values(MODALIDADE).includes(o.modalidade)) e.modalidade = "Escolha a modalidade.";

  if (!o.prazoInscricao) e.prazoInscricao = "Informe o prazo de inscrição.";
  else if (o.prazoInscricao < hoje) e.prazoInscricao = "O prazo não pode estar no passado.";

  if (o.periodoMinimo != null && !(Number.isInteger(o.periodoMinimo) && o.periodoMinimo >= 1 && o.periodoMinimo <= 12)) {
    e.periodoMinimo = "Período mínimo entre 1 e 12.";
  }
  if (o.crMinimo != null && !(o.crMinimo >= 0 && o.crMinimo <= 10)) {
    e.crMinimo = "CR mínimo na escala de 0 a 10.";
  }
  if (!(Number.isInteger(o.vagas) && o.vagas >= 1)) e.vagas = "Informe quantas vagas, no mínimo 1.";

  if (o.formaCandidatura === FORMA_CANDIDATURA.EXTERNA && !/^https?:\/\/\S+\.\S+/.test(o.linkExterno)) {
    e.linkExterno = "Informe o link completo, começando com https://";
  }
  if (!o.responsavelNome) e.responsavelNome = "Informe quem responde pela vaga.";
  if (!o.responsavelContato.includes("@")) e.responsavelContato = "Informe um e-mail de contato.";

  return e;
}

/** Rascunho só precisa de título — o resto pode ser completado depois. */
export function validarRascunho(f) {
  return f.titulo.trim().length < 5 ? { titulo: "Dê um título com pelo menos 5 caracteres." } : {};
}

export function errosDoPasso(erros, passo) {
  return Object.fromEntries(Object.entries(erros).filter(([k]) => CAMPOS_DO_PASSO[passo].includes(k)));
}

/* ------------------------------------------------------------------ */
/* Candidaturas recebidas                                              */
/* ------------------------------------------------------------------ */

/** Candidaturas às vagas do membro. Para representante acadêmico, só alunos da
 *  própria universidade — pelo escopo isso já deveria ser sempre verdade, e o
 *  filtro garante que continue sendo se um dado inconsistente aparecer. */
export function candidaturasRecebidasPor(membro, estado) {
  if (!membro) return [];
  const minhas = new Set(
    estado.oportunidades.filter((o) => podeEditarOportunidade(membro, o)).map((o) => o.id),
  );
  let r = estado.candidaturas.filter((c) => minhas.has(c.oportunidadeId));

  if (papelDoMembro(membro, estado.instituicoes) === PAPEL.REPRESENTANTE) {
    const uni = universidadeDoMembro(membro, estado.instituicoes);
    const daUni = new Set(estado.alunos.filter((a) => a.universidadeId === uni).map((a) => a.id));
    r = r.filter((c) => daUni.has(c.alunoId));
  }
  return r;
}

/** RF09: pode encerrar se é dono e a vaga ainda não está encerrada. */
export function podeEncerrar(membro, oportunidade) {
  return podeEditarOportunidade(membro, oportunidade) && oportunidade.status !== STATUS_OPORTUNIDADE.ENCERRADA;
}
