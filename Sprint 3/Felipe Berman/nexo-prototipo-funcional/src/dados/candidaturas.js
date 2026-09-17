/* Candidaturas — a entidade associativa entre aluno e oportunidade.
   Carrega o status do processo, que é o que responde à queixa de "duração
   indefinida" levantada nas entrevistas. */

export const STATUS_CANDIDATURA = {
  INSCRITA: "inscrita",
  EM_ANALISE: "em_analise",
  ENTREVISTA: "entrevista",
  APROVADA: "aprovada",
  RECUSADA: "recusada",
  DESISTIU: "desistiu",
};

export const ROTULO_STATUS = {
  [STATUS_CANDIDATURA.INSCRITA]: "Inscrita",
  [STATUS_CANDIDATURA.EM_ANALISE]: "Em análise",
  [STATUS_CANDIDATURA.ENTREVISTA]: "Entrevista marcada",
  [STATUS_CANDIDATURA.APROVADA]: "Aprovada",
  [STATUS_CANDIDATURA.RECUSADA]: "Recusada",
  [STATUS_CANDIDATURA.DESISTIU]: "Desistiu",
};

/* Tom do Badge do design system por status, e ícone correspondente. */
export const TOM_STATUS = {
  [STATUS_CANDIDATURA.INSCRITA]: { tom: "neutral", icone: "clock" },
  [STATUS_CANDIDATURA.EM_ANALISE]: { tom: "neutral", icone: "clock" },
  [STATUS_CANDIDATURA.ENTREVISTA]: { tom: "accent", icone: "calendar-check" },
  [STATUS_CANDIDATURA.APROVADA]: { tom: "success", icone: "check-circle" },
  [STATUS_CANDIDATURA.RECUSADA]: { tom: "danger", icone: "alert-circle" },
  [STATUS_CANDIDATURA.DESISTIU]: { tom: "neutral", icone: "alert-circle" },
};

/* Status que contam como processo encerrado — vão para o Histórico (RF15),
   e não para a aba de candidaturas ativas (RF14). */
export const STATUS_ENCERRADOS = [
  STATUS_CANDIDATURA.APROVADA,
  STATUS_CANDIDATURA.RECUSADA,
  STATUS_CANDIDATURA.DESISTIU,
];

const S = STATUS_CANDIDATURA;

export const candidaturas = [
  // Isabela (aluna da conta de demonstração)
  { id: 1, alunoId: 1, oportunidadeId: 18, data: "2026-09-09", status: S.ENTREVISTA, observacoes: "Entrevista em 18/09, 15h." },
  { id: 2, alunoId: 1, oportunidadeId: 4, data: "2026-09-09", status: S.EM_ANALISE, observacoes: "" },
  { id: 3, alunoId: 1, oportunidadeId: 1, data: "2026-08-20", status: S.APROVADA, observacoes: "Início em 01/10." },
  { id: 4, alunoId: 1, oportunidadeId: 20, data: "2026-07-15", status: S.RECUSADA, observacoes: "Não selecionada na etapa final." },

  // Outros alunos — alimentam o painel de quem publica
  { id: 5, alunoId: 2, oportunidadeId: 4, data: "2026-09-08", status: S.ENTREVISTA, observacoes: "" },
  { id: 6, alunoId: 5, oportunidadeId: 4, data: "2026-09-07", status: S.EM_ANALISE, observacoes: "" },
  { id: 7, alunoId: 2, oportunidadeId: 2, data: "2026-09-06", status: S.INSCRITA, observacoes: "" },
  { id: 8, alunoId: 5, oportunidadeId: 2, data: "2026-09-06", status: S.INSCRITA, observacoes: "" },
  { id: 9, alunoId: 4, oportunidadeId: 18, data: "2026-09-05", status: S.EM_ANALISE, observacoes: "" },
  { id: 10, alunoId: 3, oportunidadeId: 18, data: "2026-09-04", status: S.INSCRITA, observacoes: "" },
  { id: 11, alunoId: 6, oportunidadeId: 18, data: "2026-09-04", status: S.RECUSADA, observacoes: "" },
  // Candidata da UFRJ ao estágio da Visagio: o estágio é publicado para PUC e
  // UFRJ, então ela pode se candidatar. Serve para verificar que o recrutador
  // empresarial vê candidatos de mais de uma universidade.
  { id: 12, alunoId: 7, oportunidadeId: 18, data: "2026-09-03", status: S.EM_ANALISE, observacoes: "" },
  { id: 13, alunoId: 3, oportunidadeId: 8, data: "2026-09-02", status: S.APROVADA, observacoes: "" },
  { id: 14, alunoId: 6, oportunidadeId: 6, data: "2026-09-02", status: S.INSCRITA, observacoes: "" },
];

/* Favoritos (RF13) — model próprio na proposta (M7). */
export const favoritos = [
  { alunoId: 1, oportunidadeId: 4 },
  { alunoId: 1, oportunidadeId: 7 },
  { alunoId: 1, oportunidadeId: 19 },
  { alunoId: 1, oportunidadeId: 11 },
];
