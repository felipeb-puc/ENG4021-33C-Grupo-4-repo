/* Regras do perfil/currículo do aluno (RF05).

   O que o aluno NÃO edita, de propósito:
   - universidade: é ela que define tudo que a pessoa enxerga; trocar por
     edição abriria as vagas de outra universidade para qualquer um;
   - curso e matrícula: vêm do cadastro institucional.

   O consentimento `visivelParaRecrutadores` é editável e desligá-lo tira o
   aluno do banco de talentos na hora — mas não de quem ele já se candidatou
   (RNF03, ver `podeVerCurriculo`). */

import { TIPO_EXPERIENCIA } from "./filtros.js";

export const LIMITE_RESUMO = 400;

/** Campos que a tela de perfil pode alterar. Qualquer outro campo recebido é
 *  descartado antes de gravar. */
export const CAMPOS_EDITAVEIS = [
  "resumo",
  "periodo",
  "cr",
  "areasInteresse",
  "habilidades",
  "experiencias",
  "visivelParaRecrutadores",
];

export function perfilParaFormulario(aluno) {
  return {
    resumo: aluno.resumo || "",
    periodo: String(aluno.periodo ?? ""),
    cr: aluno.cr == null ? "" : String(aluno.cr),
    areasInteresse: [...(aluno.areasInteresse || [])],
    habilidades: [...(aluno.habilidades || [])],
    experiencias: (aluno.experiencias || []).map((x) => ({ ...x, fim: x.fim || "" })),
    visivelParaRecrutadores: Boolean(aluno.visivelParaRecrutadores),
  };
}

export function experienciaEmBranco() {
  return { tipo: TIPO_EXPERIENCIA.PROFISSIONAL, titulo: "", organizacao: "", descricao: "", inicio: "", fim: "" };
}

/** Valida. Erros de experiência vêm como `experiencias.<índice>`. */
export function validarPerfil(f) {
  const e = {};

  if (f.resumo.length > LIMITE_RESUMO) e.resumo = `Resumo com no máximo ${LIMITE_RESUMO} caracteres.`;

  const periodo = Number(f.periodo);
  if (!(Number.isInteger(periodo) && periodo >= 1 && periodo <= 12)) e.periodo = "Período entre 1 e 12.";

  if (f.cr !== "") {
    const cr = Number(String(f.cr).replace(",", "."));
    if (!(cr >= 0 && cr <= 10)) e.cr = "CR na escala de 0 a 10.";
  }

  f.experiencias.forEach((x, i) => {
    if (!x.titulo.trim() || !x.organizacao.trim()) {
      e[`experiencias.${i}`] = "Informe título e organização.";
    } else if (!x.inicio) {
      e[`experiencias.${i}`] = "Informe a data de início.";
    } else if (x.fim && x.fim < x.inicio) {
      // ISO: comparar como texto é comparar cronologicamente.
      e[`experiencias.${i}`] = "O fim não pode ser antes do início.";
    }
  });

  return e;
}

/** Formulário -> mudanças a gravar, só com campos editáveis. */
export function normalizarPerfil(f) {
  const limpar = (lista) => [...new Set(lista.map((s) => s.trim()).filter(Boolean))];
  const mudancas = {
    resumo: f.resumo.trim(),
    periodo: Number(f.periodo),
    cr: f.cr === "" ? null : Math.round(Number(String(f.cr).replace(",", ".")) * 10) / 10,
    areasInteresse: limpar(f.areasInteresse),
    habilidades: limpar(f.habilidades),
    experiencias: f.experiencias.map((x) => ({
      tipo: x.tipo,
      titulo: x.titulo.trim(),
      organizacao: x.organizacao.trim(),
      descricao: (x.descricao || "").trim(),
      inicio: x.inicio,
      fim: x.fim || null,
    })),
    visivelParaRecrutadores: Boolean(f.visivelParaRecrutadores),
  };
  return Object.fromEntries(Object.entries(mudancas).filter(([k]) => CAMPOS_EDITAVEIS.includes(k)));
}
