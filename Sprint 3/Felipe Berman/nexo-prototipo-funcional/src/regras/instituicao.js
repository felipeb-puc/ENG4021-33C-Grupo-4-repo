/* Perfil de instituição (RF06) e verificação de conta (RF03).

   RF03 no protótipo era um botão "Simular aprovação" que a própria conta
   apertava — ou seja, verificação nenhuma. Aqui só o administrador aprova, e
   conta não verificada não publica nem mexe no perfil público da instituição:
   as duas ações que falam em nome da instituição para os alunos. Rascunho e
   leitura continuam liberados, para a pessoa já ir preparando o anúncio.

   A regra vale para recrutador e para representante acadêmico. O RF03 fala só
   em empresa, mas o cadastro dos dois nasce `verificado: false`, e um falso
   "professor" publicando monitoria é o mesmo risco. */

import { TIPO_INSTITUICAO, universidadeDa } from "../dados/instituicoes.js";

export const MOTIVO_NAO_VERIFICADO =
  "Sua conta ainda está em verificação pela equipe do NEXO. Você pode salvar rascunhos, mas só publica depois da aprovação.";

/** Publicar oportunidade exige conta verificada. */
export function podePublicar(membro) {
  return Boolean(membro?.verificado);
}

/** Editar o perfil público: membro verificado da própria instituição. */
export function podeEditarInstituicao(membro, instituicao) {
  return Boolean(membro?.verificado) && Boolean(instituicao) && membro.instituicaoId === instituicao.id;
}

/** Aluno abre o perfil de uma instituição?
 *  Empresa: sim, qualquer aluno. Faculdade, departamento, liga ou equipe: só
 *  quem é da mesma universidade — pelo mesmo motivo que a liga da PUC não
 *  aparece para aluno da UFRJ. */
export function alunoPodeVerInstituicao(aluno, instituicao) {
  if (!aluno || !instituicao) return false;
  if (instituicao.tipo === TIPO_INSTITUICAO.EMPRESA) return true;
  return universidadeDa(instituicao) === aluno.universidadeId;
}

/** O que o dono edita. Nome, tipo e universidade vinculada ficam de fora: o
 *  tipo define o papel de quem publica e a universidade define o escopo de
 *  tudo que a instituição publica — mudar isso é trocar de instituição, não
 *  editar perfil. */
export const CAMPOS_EDITAVEIS_INSTITUICAO = ["descricao", "site", "cidade"];

export function instituicaoParaFormulario(inst) {
  return { descricao: inst.descricao || "", site: inst.site || "", cidade: inst.cidade || "" };
}

export function validarInstituicao(f) {
  const e = {};
  if (f.descricao.trim().length < 20) e.descricao = "Descreva a instituição em pelo menos 20 caracteres.";
  if (f.descricao.length > 600) e.descricao = "Descrição com no máximo 600 caracteres.";
  if (f.site.trim() && !/^https?:\/\/\S+\.\S+/.test(f.site.trim())) e.site = "Informe o link completo, começando com https://";
  if (!f.cidade.trim()) e.cidade = "Informe a cidade.";
  return e;
}

export function normalizarInstituicao(f) {
  const m = { descricao: f.descricao.trim(), site: f.site.trim(), cidade: f.cidade.trim() };
  return Object.fromEntries(Object.entries(m).filter(([k]) => CAMPOS_EDITAVEIS_INSTITUICAO.includes(k)));
}

/** Contas aguardando aprovação, para a tela do administrador. */
export function membrosPendentes(membros) {
  return membros.filter((m) => !m.verificado);
}
