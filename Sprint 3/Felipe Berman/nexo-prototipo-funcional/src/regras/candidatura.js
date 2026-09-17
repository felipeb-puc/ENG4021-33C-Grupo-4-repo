/* Regras de candidatura.

   No protótipo anterior, candidatar-se apenas inseria um item na lista: não
   checava prazo, status da vaga, período mínimo nem curso-alvo. Um aluno do 2º
   período conseguia se candidatar a uma vaga que exigia o 5º.

   Aqui cada motivo de recusa é explícito, porque a mensagem é o que o aluno
   lê — "você não pode" sem dizer por quê é o tipo de coisa que as entrevistas
   apontaram como frustrante. */

import { STATUS_OPORTUNIDADE } from "../dados/oportunidades.js";
import { estaVencida, formatarData } from "./datas.js";
import { alcancaUniversidade } from "./escopo.js";

/** Aberta de fato: publicada e dentro do prazo. */
export function estaAberta(oportunidade) {
  if (!oportunidade) return false;
  if (oportunidade.status !== STATUS_OPORTUNIDADE.ABERTA) return false;
  return !estaVencida(oportunidade.prazoInscricao);
}

export function jaSeCandidatou(aluno, oportunidade, candidaturas) {
  return candidaturas.some(
    (c) => c.alunoId === aluno?.id && c.oportunidadeId === oportunidade?.id,
  );
}

/** Pode se candidatar?
 *  Devolve { pode, motivo } — motivo em texto pronto para a tela. */
export function podeCandidatar(aluno, oportunidade, estado) {
  if (!aluno) {
    return { pode: false, motivo: "Entre com uma conta de estudante para se candidatar." };
  }
  if (!oportunidade) {
    return { pode: false, motivo: "Oportunidade não encontrada." };
  }

  if (!alcancaUniversidade(oportunidade, aluno.universidadeId, estado.instituicoes)) {
    return {
      pode: false,
      motivo: "Esta oportunidade não está disponível para a sua universidade.",
    };
  }

  if (oportunidade.status === STATUS_OPORTUNIDADE.RASCUNHO) {
    return { pode: false, motivo: "Esta oportunidade ainda não foi publicada." };
  }

  if (oportunidade.status === STATUS_OPORTUNIDADE.ENCERRADA) {
    return { pode: false, motivo: "Esta oportunidade foi encerrada por quem publicou." };
  }

  if (estaVencida(oportunidade.prazoInscricao)) {
    return {
      pode: false,
      motivo: `As inscrições encerraram em ${formatarData(oportunidade.prazoInscricao)}.`,
    };
  }

  if (jaSeCandidatou(aluno, oportunidade, estado.candidaturas)) {
    return {
      pode: false,
      motivo: "Você já se candidatou a esta oportunidade. Acompanhe em Minhas oportunidades.",
    };
  }

  if (oportunidade.periodoMinimo && aluno.periodo < oportunidade.periodoMinimo) {
    return {
      pode: false,
      motivo: `Esta oportunidade exige a partir do ${oportunidade.periodoMinimo}º período — você está no ${aluno.periodo}º.`,
    };
  }

  const cursos = oportunidade.cursosAlvo || [];
  if (cursos.length > 0 && !cursos.includes(aluno.cursoId)) {
    return {
      pode: false,
      motivo: "Esta oportunidade é destinada a outros cursos.",
    };
  }

  if (oportunidade.crMinimo != null) {
    if (aluno.cr == null) {
      return {
        pode: false,
        motivo: `Esta oportunidade exige CR mínimo de ${oportunidade.crMinimo.toFixed(1)}. Informe seu CR no perfil para se candidatar.`,
      };
    }
    if (aluno.cr < oportunidade.crMinimo) {
      return {
        pode: false,
        motivo: `Esta oportunidade exige CR mínimo de ${oportunidade.crMinimo.toFixed(1)} — o seu é ${aluno.cr.toFixed(1)}.`,
      };
    }
  }

  return { pode: true, motivo: "" };
}

/** Número de candidaturas de uma oportunidade (RF19). */
export function totalCandidaturas(oportunidadeId, candidaturas) {
  return candidaturas.filter((c) => c.oportunidadeId === oportunidadeId).length;
}
