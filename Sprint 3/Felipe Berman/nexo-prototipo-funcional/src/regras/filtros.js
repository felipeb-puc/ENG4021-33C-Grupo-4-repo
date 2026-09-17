/* Filtros e ordenação.

   Dois bugs do protótipo anterior morrem aqui:

   L1 — a ordenação "Encerrando" comparava as datas como texto no formato
        DD/MM/AAAA, o que compara o dia primeiro: 05/10 vinha antes de 30/09.
        Agora o prazo é ISO, onde ordem alfabética é ordem cronológica.

   L2 — "Maior bolsa" só separava pago de não-pago, porque o valor era a string
        "Bolsa de R$ 600 por mês". Agora `valorBolsa` é número e a ordenação é
        por valor mesmo.

   Regra geral: todo controle que aparece na tela filtra de verdade. Se um
   filtro não estiver ligado aqui, ele não deve existir na interface. */

import { acharCurso } from "../dados/cursos.js";
import { ROTULO_MODALIDADE, ROTULO_TIPO } from "../dados/oportunidades.js";
import { estaVencida } from "./datas.js";

export const ORDENACAO = {
  RECENTES: "recentes",
  ENCERRANDO: "encerrando",
  MAIOR_BOLSA: "maior_bolsa",
};

export const ROTULO_ORDENACAO = {
  [ORDENACAO.RECENTES]: "Recentes",
  [ORDENACAO.ENCERRANDO]: "Encerrando",
  [ORDENACAO.MAIOR_BOLSA]: "Maior bolsa",
};

export const filtrosVazios = {
  texto: "",
  tipo: null,
  cursoId: null,
  periodo: null,
  modalidades: [],
  somenteAbertas: true,
  somenteRemuneradas: false,
  ordenacao: ORDENACAO.RECENTES,
};

/** Quantos filtros o usuário mexeu — alimenta o contador ao lado de "Filtros".
 *  Ordenação e busca textual não contam: não são filtro, são visualização. */
export function contarFiltrosAtivos(f) {
  let n = 0;
  if (f.cursoId) n += 1;
  if (f.periodo) n += 1;
  if (f.modalidades.length > 0) n += f.modalidades.length;
  if (f.somenteRemuneradas) n += 1;
  if (!f.somenteAbertas) n += 1;
  return n;
}

function textoBuscavel(o, instituicoes) {
  const inst = instituicoes.find((i) => i.id === o.instituicaoId);
  const cursos = (o.cursosAlvo || [])
    .map((id) => acharCurso(id)?.nome || "")
    .join(" ");
  return [
    o.titulo,
    o.descricao,
    inst?.nome,
    ROTULO_TIPO[o.tipo],
    ROTULO_MODALIDADE[o.modalidade],
    o.responsavelNome,
    o.cidade,
    cursos,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** Aplica os filtros sobre uma lista JÁ restrita pelo escopo de visibilidade.
 *  Esta função nunca deve ser o primeiro filtro de uma listagem de aluno — o
 *  escopo vem antes, sempre. */
export function aplicarFiltros(lista, filtros, instituicoes) {
  const f = { ...filtrosVazios, ...filtros };
  let r = [...lista];

  if (f.tipo) r = r.filter((o) => o.tipo === f.tipo);

  const busca = f.texto.trim().toLowerCase();
  if (busca) {
    const termos = busca.split(/\s+/);
    r = r.filter((o) => {
      const alvo = textoBuscavel(o, instituicoes);
      return termos.every((t) => alvo.includes(t));
    });
  }

  if (f.cursoId) {
    // Lista de cursos-alvo vazia = aberta a qualquer curso, então entra sempre.
    r = r.filter((o) => {
      const alvo = o.cursosAlvo || [];
      return alvo.length === 0 || alvo.includes(f.cursoId);
    });
  }

  if (f.periodo) {
    r = r.filter((o) => !o.periodoMinimo || o.periodoMinimo <= f.periodo);
  }

  if (f.modalidades.length > 0) {
    r = r.filter((o) => f.modalidades.includes(o.modalidade));
  }

  if (f.somenteAbertas) {
    r = r.filter((o) => !estaVencida(o.prazoInscricao));
  }

  if (f.somenteRemuneradas) {
    r = r.filter((o) => o.remunerada);
  }

  return ordenar(r, f.ordenacao);
}

export function ordenar(lista, ordenacao) {
  const r = [...lista];

  if (ordenacao === ORDENACAO.ENCERRANDO) {
    // ISO: ordem alfabética é ordem cronológica. Sem prazo vai para o fim.
    return r.sort((a, b) => {
      if (!a.prazoInscricao) return 1;
      if (!b.prazoInscricao) return -1;
      return a.prazoInscricao.localeCompare(b.prazoInscricao);
    });
  }

  if (ordenacao === ORDENACAO.MAIOR_BOLSA) {
    return r.sort((a, b) => (b.valorBolsa ?? 0) - (a.valorBolsa ?? 0));
  }

  // Recentes: publicada mais recentemente primeiro; rascunho (sem data) no fim.
  return r.sort((a, b) => {
    if (!a.publicadaEm) return 1;
    if (!b.publicadaEm) return -1;
    return b.publicadaEm.localeCompare(a.publicadaEm);
  });
}

/** Contagem por tipo, para os chips de categoria. Calculada sobre a lista já
 *  restrita pelo escopo — o número que o aluno vê é o que ele consegue abrir. */
export function contarPorTipo(lista) {
  return lista.reduce((acc, o) => {
    acc[o.tipo] = (acc[o.tipo] || 0) + 1;
    return acc;
  }, {});
}

/* ------------------------------------------------------------------ */
/* Filtros de candidato — usados no painel e no banco de talentos      */
/* ------------------------------------------------------------------ */

export const filtrosCandidatoVazios = {
  texto: "",
  universidadeId: null,
  cursoId: null,
  periodoMinimo: null,
  crMinimo: null,
  areas: [],
  tiposExperiencia: [],
};

export const TIPO_EXPERIENCIA = {
  PROFISSIONAL: "profissional",
  ACADEMICA: "academica",
  FORMACAO: "formacao",
};

export const ROTULO_EXPERIENCIA = {
  [TIPO_EXPERIENCIA.PROFISSIONAL]: "Profissional",
  [TIPO_EXPERIENCIA.ACADEMICA]: "Acadêmica",
  [TIPO_EXPERIENCIA.FORMACAO]: "Formação",
};

/** Áreas de interesse existentes — alimenta o filtro com o que de fato existe
 *  nos alunos, em vez de uma lista fixa que pode ter opção que nunca filtra. */
export function areasDisponiveis(alunos) {
  return [...new Set(alunos.flatMap((a) => a.areasInteresse || []))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** Filtra alunos. A lista de entrada já vem restrita por `alunosVisiveisPara`,
 *  que é quem garante que representante acadêmico só vê a própria universidade. */
export function aplicarFiltrosCandidato(alunos, filtros) {
  const f = { ...filtrosCandidatoVazios, ...filtros };
  let r = [...alunos];

  const busca = f.texto.trim().toLowerCase();
  if (busca) {
    r = r.filter((a) =>
      [a.nome, a.resumo, (a.habilidades || []).join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(busca),
    );
  }

  if (f.universidadeId) r = r.filter((a) => a.universidadeId === f.universidadeId);
  if (f.cursoId) r = r.filter((a) => a.cursoId === f.cursoId);
  if (f.periodoMinimo) r = r.filter((a) => a.periodo >= f.periodoMinimo);
  if (f.crMinimo != null) r = r.filter((a) => a.cr != null && a.cr >= f.crMinimo);
  if (f.areas.length > 0) {
    r = r.filter((a) => (a.areasInteresse || []).some((x) => f.areas.includes(x)));
  }

  // "Experiência" = tem ao menos uma do tipo marcado. Formação não entra no
  // filtro: todo aluno tem, e o filtro nunca reduziria nada.
  if (f.tiposExperiencia.length > 0) {
    r = r.filter((a) => (a.experiencias || []).some((x) => f.tiposExperiencia.includes(x.tipo)));
  }

  return r.sort((a, b) => (b.cr ?? 0) - (a.cr ?? 0));
}
