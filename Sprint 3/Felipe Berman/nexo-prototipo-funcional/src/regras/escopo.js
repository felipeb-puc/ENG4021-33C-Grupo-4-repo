/* Escopo de visibilidade — a regra central do NEXO.

   É o que o protótipo anterior não tinha: lá a universidade escolhida ficava
   guardada no estado e nunca era usada para filtrar nada, então uma liga da PUC
   aparecia para qualquer pessoa.

   As quatro regras:

   1. Oportunidade acadêmica (monitoria, IC, liga, equipe) pertence a uma
      universidade e só é vista por alunos dela. A universidade vem da
      instituição que publicou — direto, se for a própria faculdade; via
      `universidadeVinculada`, se for departamento, liga ou equipe.

   2. Estágio de empresa é visto pelos alunos das universidades-alvo escolhidas
      por quem publicou. Lista vazia significa todas.

   3. Representante acadêmico enxerga apenas alunos da própria universidade.

   4. Recrutador de empresa enxerga alunos de qualquer universidade — mas só os
      que consentiram aparecer em busca (RNF03 + consentimento). */

import {
  TIPO_INSTITUICAO,
  acharInstituicao,
  universidadeDa,
} from "../dados/instituicoes.js";
import { STATUS_OPORTUNIDADE, TIPO_OPORTUNIDADE } from "../dados/oportunidades.js";

export const PAPEL = {
  ALUNO: "aluno",
  RECRUTADOR: "recrutador",
  REPRESENTANTE: "representante",
  // Equipe do NEXO: aprova contas (RF03). Não publica nem se candidata.
  ADMIN: "admin",
};

/* ------------------------------------------------------------------ */
/* Papel                                                               */
/* ------------------------------------------------------------------ */

/** O papel de quem publica não é um campo: é derivado do tipo da instituição.
 *  Empresa -> recrutador. Faculdade, departamento, liga ou equipe ->
 *  representante acadêmico. */
export function papelDoMembro(membro, instituicoes) {
  const inst = acharInstituicaoEm(instituicoes, membro?.instituicaoId);
  if (!inst) return null;
  return inst.tipo === TIPO_INSTITUICAO.EMPRESA
    ? PAPEL.RECRUTADOR
    : PAPEL.REPRESENTANTE;
}

/** Universidade a que um membro pertence. Para recrutador de empresa é nulo —
 *  empresa não pertence a universidade nenhuma. */
export function universidadeDoMembro(membro, instituicoes) {
  const inst = acharInstituicaoEm(instituicoes, membro?.instituicaoId);
  return universidadeDa(inst);
}

/** Tipos de oportunidade que um membro pode publicar.
 *  Empresa publica estágio; instituição de ensino publica o resto. */
export function tiposQuePodePublicar(membro, instituicoes) {
  return papelDoMembro(membro, instituicoes) === PAPEL.RECRUTADOR
    ? [TIPO_OPORTUNIDADE.ESTAGIO]
    : [
        TIPO_OPORTUNIDADE.MONITORIA,
        TIPO_OPORTUNIDADE.IC,
        TIPO_OPORTUNIDADE.LIGA_ACADEMICA,
        TIPO_OPORTUNIDADE.EQUIPE_COMPETICAO,
      ];
}

/* ------------------------------------------------------------------ */
/* Oportunidade x aluno                                                */
/* ------------------------------------------------------------------ */

/** Universidade que "alcança" uma oportunidade acadêmica. */
export function universidadeDaOportunidade(oportunidade, instituicoes) {
  const inst = acharInstituicaoEm(instituicoes, oportunidade?.instituicaoId);
  return universidadeDa(inst);
}

/** A regra 1 e 2 juntas: esta oportunidade alcança esta universidade? */
export function alcancaUniversidade(oportunidade, universidadeId, instituicoes) {
  const inst = acharInstituicaoEm(instituicoes, oportunidade.instituicaoId);
  if (!inst) return false;

  if (inst.tipo === TIPO_INSTITUICAO.EMPRESA) {
    const alvo = oportunidade.universidadesAlvo || [];
    return alvo.length === 0 || alvo.includes(universidadeId);
  }

  return universidadeDa(inst) === universidadeId;
}

/** Oportunidade publicada e dentro do escopo do aluno.
 *  Rascunho e encerrada nunca aparecem para aluno — só no painel de quem
 *  publicou. */
export function visivelParaAluno(oportunidade, aluno, instituicoes) {
  if (!aluno) return false;
  if (oportunidade.status !== STATUS_OPORTUNIDADE.ABERTA) return false;
  return alcancaUniversidade(oportunidade, aluno.universidadeId, instituicoes);
}

/** Todas as oportunidades que um aluno pode ver. Usar SEMPRE esta função como
 *  ponto de entrada de qualquer listagem para o aluno — busca, destaques,
 *  favoritos, similares. */
export function oportunidadesVisiveisPara(aluno, oportunidades, instituicoes) {
  if (!aluno) return [];
  return oportunidades.filter((o) => visivelParaAluno(o, aluno, instituicoes));
}

/** Pode abrir a página de detalhe? Mais largo que `visivelParaAluno` de
 *  propósito: oportunidade encerrada continua abrindo, porque o aluno chega nela
 *  pelo próprio histórico de candidaturas e precisa ver o que era. Fora do
 *  escopo da universidade ou em rascunho, não abre. */
export function alunoPodeAbrir(oportunidade, aluno, instituicoes) {
  if (!aluno || !oportunidade) return false;
  if (oportunidade.status === STATUS_OPORTUNIDADE.RASCUNHO) return false;
  return alcancaUniversidade(oportunidade, aluno.universidadeId, instituicoes);
}

/* ------------------------------------------------------------------ */
/* Alunos x quem publica                                               */
/* ------------------------------------------------------------------ */

/** Regras 3 e 4: quais alunos um membro pode enxergar no banco de talentos.
 *
 *  Representante acadêmico: só alunos da própria universidade.
 *  Recrutador de empresa: alunos de qualquer universidade.
 *
 *  Nos dois casos, só quem ligou o consentimento de visibilidade — o currículo
 *  completo de quem não consentiu continua restrito a instituições às quais a
 *  pessoa se candidatou (RNF03). */
export function alunosVisiveisPara(membro, alunos, instituicoes) {
  const papel = papelDoMembro(membro, instituicoes);
  if (!papel || papel === PAPEL.ALUNO) return [];

  const consentiram = alunos.filter((a) => a.visivelParaRecrutadores);

  if (papel === PAPEL.RECRUTADOR) return consentiram;

  const universidade = universidadeDoMembro(membro, instituicoes);
  return consentiram.filter((a) => a.universidadeId === universidade);
}

/** Um membro pode ver o currículo completo de um aluno se:
 *  - o aluno se candidatou a alguma vaga da instituição desse membro (RNF03), ou
 *  - o aluno consentiu aparecer em buscas E está no alcance do membro — mesma
 *    regra do banco de talentos. Sem essa segunda condição, um representante da
 *    PUC abriria pela URL o currículo de um aluno da UFRJ que só consentiu
 *    aparecer para recrutadores. */
export function podeVerCurriculo(membro, aluno, estado) {
  if (!membro || !aluno) return false;

  const minhasVagas = estado.oportunidades
    .filter((o) => o.instituicaoId === membro.instituicaoId)
    .map((o) => o.id);
  const candidatou = estado.candidaturas.some(
    (c) => c.alunoId === aluno.id && minhasVagas.includes(c.oportunidadeId),
  );
  if (candidatou) return true;

  return alunosVisiveisPara(membro, [aluno], estado.instituicoes).length === 1;
}

/** Oportunidades publicadas por um membro — o que aparece no painel dele.
 *  Inclui rascunho e encerrada, ao contrário da visão do aluno. */
export function oportunidadesDoMembro(membro, oportunidades) {
  if (!membro) return [];
  return oportunidades.filter((o) => o.instituicaoId === membro.instituicaoId);
}

/** RNF04: só quem criou a oportunidade pode editá-la ou encerrá-la. */
export function podeEditarOportunidade(membro, oportunidade) {
  return Boolean(membro) && oportunidade?.instituicaoId === membro.instituicaoId;
}

/* ------------------------------------------------------------------ */

function acharInstituicaoEm(instituicoes, id) {
  if (!id) return null;
  if (Array.isArray(instituicoes)) {
    return instituicoes.find((i) => i.id === id) || null;
  }
  return acharInstituicao(id);
}
