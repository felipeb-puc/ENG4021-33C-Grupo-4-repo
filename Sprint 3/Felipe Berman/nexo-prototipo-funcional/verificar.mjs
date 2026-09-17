/* Verificação das regras do NEXO — roda direto contra os módulos, sem browser.
 *
 *     cd nexo-site && node verificar.mjs
 *
 * Existe porque as regras que sustentam o produto (escopo por universidade,
 * papel derivado da instituição, validação de candidatura, ordenação) são
 * invisíveis na tela até estarem erradas. Rodar ao fim de cada etapa.
 *
 * Não é suíte de testes: é uma checagem rápida, legível e sem dependências.
 * Sai com código 1 se algo falhar. */

import { instituicoes } from "./src/dados/instituicoes.js";
import { oportunidades } from "./src/dados/oportunidades.js";
import { alunos, membros } from "./src/dados/pessoas.js";
import * as escopo from "./src/regras/escopo.js";
import { podeCandidatar, estaAberta } from "./src/regras/candidatura.js";
import { ordenar, ORDENACAO, aplicarFiltrosCandidato } from "./src/regras/filtros.js";
import * as pub from "./src/regras/publicacao.js";
import * as perfil from "./src/regras/perfil.js";
import * as inst from "./src/regras/instituicao.js";
import { estadoInicial } from "./src/dados/seed.js";

let falhas = 0;
const ok = (cond, msg, extra = "") => {
  console.log(`${cond ? "  OK  " : " FALHA"} | ${msg}${extra ? ` — ${extra}` : ""}`);
  if (!cond) falhas++;
};

const estado = estadoInicial();
const isabela = alunos.find((a) => a.id === 1); // PUC, Eng. Produção, 5º, CR 8.4
const juliana = alunos.find((a) => a.id === 7); // UFRJ, Eng. Produção, 6º
const carolina = alunos.find((a) => a.id === 9); // UERJ, Economia, 5º

console.log("\n=== 1. ESCOPO POR UNIVERSIDADE ===");

const vistasIsabela = escopo.oportunidadesVisiveisPara(isabela, oportunidades, instituicoes);
const vistasJuliana = escopo.oportunidadesVisiveisPara(juliana, oportunidades, instituicoes);
const vistasCarolina = escopo.oportunidadesVisiveisPara(carolina, oportunidades, instituicoes);

console.log(`  Isabela (PUC): ${vistasIsabela.length} | Juliana (UFRJ): ${vistasJuliana.length} | Carolina (UERJ): ${vistasCarolina.length}`);

// Liga de Empreendedorismo (PUC) = oportunidade 7
ok(vistasIsabela.some((o) => o.id === 7), "Aluna da PUC VÊ a Liga de Empreendedorismo (PUC)");
ok(!vistasJuliana.some((o) => o.id === 7), "Aluna da UFRJ NÃO vê a Liga de Empreendedorismo (PUC)");
ok(!vistasCarolina.some((o) => o.id === 7), "Aluna da UERJ NÃO vê a Liga de Empreendedorismo (PUC)");

// Minerva Rockets (UFRJ) = oportunidade 16
ok(vistasJuliana.some((o) => o.id === 16), "Aluna da UFRJ VÊ a Minerva Rockets (UFRJ)");
ok(!vistasIsabela.some((o) => o.id === 16), "Aluna da PUC NÃO vê a Minerva Rockets (UFRJ)");

// Estágio Visagio (id 18) publicado só para PUC (1) e UFRJ (2)
ok(vistasIsabela.some((o) => o.id === 18), "Estágio Visagio (alvo PUC+UFRJ) aparece para a PUC");
ok(vistasJuliana.some((o) => o.id === 18), "Estágio Visagio (alvo PUC+UFRJ) aparece para a UFRJ");
ok(!vistasCarolina.some((o) => o.id === 18), "Estágio Visagio NÃO aparece para a UERJ");

// Estágio Opportunity (id 19) com universidadesAlvo vazio = todas
ok(
  [vistasIsabela, vistasJuliana, vistasCarolina].every((v) => v.some((o) => o.id === 19)),
  "Estágio sem universidade-alvo aparece para todas as universidades",
);

// Rascunho (id 22) nunca aparece
ok(
  ![vistasIsabela, vistasJuliana, vistasCarolina].some((v) => v.some((o) => o.id === 22)),
  "Oportunidade em rascunho não aparece para aluno nenhum",
);

console.log("\n=== 2. PAPEL DERIVADO DA INSTITUIÇÃO ===");

const camila = membros.find((m) => m.id === 1); // Visagio (empresa)
const rafael = membros.find((m) => m.id === 2); // Depto Informática (PUC)
const marina = membros.find((m) => m.id === 4); // Liga de Empreendedorismo (PUC)

ok(escopo.papelDoMembro(camila, instituicoes) === escopo.PAPEL.RECRUTADOR, "Membro de empresa = recrutador");
ok(escopo.papelDoMembro(rafael, instituicoes) === escopo.PAPEL.REPRESENTANTE, "Membro de departamento = representante acadêmico");
ok(escopo.papelDoMembro(marina, instituicoes) === escopo.PAPEL.REPRESENTANTE, "Membro de liga = representante acadêmico");

ok(escopo.universidadeDoMembro(rafael, instituicoes) === 1, "Departamento da PUC resolve para universidade 1");
ok(escopo.universidadeDoMembro(marina, instituicoes) === 1, "Liga da PUC resolve para universidade 1");
ok(escopo.universidadeDoMembro(camila, instituicoes) === null, "Empresa não pertence a universidade");

const tiposRec = escopo.tiposQuePodePublicar(camila, instituicoes);
const tiposAca = escopo.tiposQuePodePublicar(rafael, instituicoes);
ok(tiposRec.length === 1 && tiposRec[0] === "estagio", "Recrutador só publica estágio");
ok(!tiposAca.includes("estagio") && tiposAca.length === 4, "Representante acadêmico publica os 4 tipos acadêmicos");

console.log("\n=== 3. QUEM VÊ QUAIS ALUNOS ===");

const alunosDoRecrutador = escopo.alunosVisiveisPara(camila, alunos, instituicoes);
const alunosDoProfessor = escopo.alunosVisiveisPara(rafael, alunos, instituicoes);

ok(
  alunosDoProfessor.every((a) => a.universidadeId === 1),
  "Representante da PUC só vê alunos da PUC",
  `${alunosDoProfessor.length} alunos`,
);
ok(
  new Set(alunosDoRecrutador.map((a) => a.universidadeId)).size > 1,
  "Recrutador de empresa vê alunos de mais de uma universidade",
  `${alunosDoRecrutador.length} alunos`,
);
ok(
  !alunosDoRecrutador.some((a) => a.id === 5) && !alunosDoProfessor.some((a) => a.id === 5),
  "Aluna sem consentimento (Marina, id 5) não aparece em busca nenhuma",
);

console.log("\n=== 4. VALIDAÇÃO DE CANDIDATURA ===");

const opPeriodo5 = oportunidades.find((o) => o.id === 5); // exige 5º período, CR 7.0, cursos [7,1]
const opVencida = oportunidades.find((o) => o.id === 12); // prazo 2026-09-10, já passou
const opRascunho = oportunidades.find((o) => o.id === 22);
const opCrAlto = oportunidades.find((o) => o.id === 4); // CR mínimo 7.5, cursos [2,3]

const marinaAluna = alunos.find((a) => a.id === 5); // 3º período, CR 9.1, Eng. Computação
const andre = alunos.find((a) => a.id === 6); // 6º período, CR 7.2, Economia

ok(!estaAberta(opVencida), "Oportunidade com prazo vencido não conta como aberta");

const r1 = podeCandidatar(marinaAluna, opPeriodo5, estado);
ok(!r1.pode && r1.motivo.includes("período"), "Bloqueia por período mínimo", r1.motivo);

const r2 = podeCandidatar(isabela, opVencida, estado);
ok(!r2.pode && r2.motivo.includes("encerraram"), "Bloqueia por prazo vencido", r2.motivo);

const r3 = podeCandidatar(isabela, opRascunho, estado);
ok(!r3.pode, "Bloqueia oportunidade em rascunho", r3.motivo);

// André é de Economia; a vaga 4 é para cursos de computação.
// (Isabela não serve para este teste: ela já tem candidatura nessa vaga no
// seed, então seria barrada antes por duplicidade e o teste passaria pelo
// motivo errado.)
const r4 = podeCandidatar(andre, opCrAlto, estado);
ok(!r4.pode && r4.motivo.includes("outros cursos"), "Bloqueia por curso-alvo", r4.motivo);

// Nenhum aluno do seed tem CR abaixo do mínimo de alguma vaga compatível, então
// o caso do CR precisa de um aluno sintético para ser exercitado de verdade.
const alunoCrBaixo = { ...alunos.find((a) => a.id === 2), id: 999, cr: 6.0 };
const r4b = podeCandidatar(alunoCrBaixo, opCrAlto, estado);
ok(!r4b.pode && r4b.motivo.includes("CR mínimo"), "Bloqueia por CR mínimo", r4b.motivo);

const alunoSemCr = { ...alunos.find((a) => a.id === 2), id: 998, cr: null };
const r4c = podeCandidatar(alunoSemCr, opCrAlto, estado);
ok(!r4c.pode && r4c.motivo.includes("Informe seu CR"), "Pede CR quando a vaga exige e o aluno não informou", r4c.motivo);

const r5 = podeCandidatar(andre, oportunidades.find((o) => o.id === 6), estado);
ok(r5.pode === false && r5.motivo.includes("já se candidatou"), "Bloqueia candidatura duplicada", r5.motivo);

const r6 = podeCandidatar(juliana, oportunidades.find((o) => o.id === 1), estado);
ok(!r6.pode && r6.motivo.includes("universidade"), "Bloqueia vaga de outra universidade", r6.motivo);

const r7 = podeCandidatar(isabela, oportunidades.find((o) => o.id === 19), estado);
ok(r7.pode, "Permite candidatura válida", r7.motivo || "sem impedimento");

console.log("\n=== 5. ORDENAÇÃO (bugs L1 e L2) ===");

const porPrazo = ordenar(vistasIsabela, ORDENACAO.ENCERRANDO).map((o) => o.prazoInscricao);
const ordenadoCorreto = porPrazo.every((d, i) => i === 0 || porPrazo[i - 1] <= d);
ok(ordenadoCorreto, "Ordenação por prazo está cronológica", `${porPrazo[0]} ... ${porPrazo.at(-1)}`);

const porBolsa = ordenar(vistasIsabela, ORDENACAO.MAIOR_BOLSA).map((o) => o.valorBolsa ?? 0);
const bolsaOk = porBolsa.every((v, i) => i === 0 || porBolsa[i - 1] >= v);
ok(bolsaOk, "Ordenação por bolsa é decrescente por valor", `${porBolsa[0]} ... ${porBolsa.at(-1)}`);

console.log("\n=== 6. ABRIR DETALHE (Etapa 3) ===");

const op1 = oportunidades.find((o) => o.id === 1);
ok(escopo.alunoPodeAbrir(op1, isabela, instituicoes), "Isabela abre monitoria da PUC");
ok(!escopo.alunoPodeAbrir(op1, juliana, instituicoes), "Juliana (UFRJ) não abre monitoria da PUC");
ok(!escopo.alunoPodeAbrir(opRascunho, isabela, instituicoes), "Rascunho não abre para aluno");
ok(escopo.alunoPodeAbrir({ ...op1, status: "encerrada" }, isabela, instituicoes), "Encerrada ainda abre (aluno chega pelo histórico)");
ok(escopo.alunoPodeAbrir(opVencida, isabela, instituicoes), "Prazo vencido abre, para mostrar o motivo do bloqueio");

console.log("\n=== 7. PAINEL DE QUEM PUBLICA (Etapa 4) ===");

const hoje = "2026-09-16";

const formValido = {
  ...pub.oportunidadeEmBranco(rafael, instituicoes),
  tipo: "monitoria",
  titulo: "Monitoria de Estruturas de Dados",
  descricao: "Plantão de dúvidas semanal e correção de listas das turmas de graduação.",
  requisitos: "Ter cursado Estruturas de Dados",
  cargaHorariaSemanal: "10",
  valorBolsa: "500",
  prazoInscricao: "2026-10-30",
};
ok(Object.keys(pub.validarOportunidade(formValido, rafael, instituicoes, hoje)).length === 0, "Formulário completo de monitoria passa na validação");

const eSemCampos = pub.validarOportunidade({ ...formValido, cargaHorariaSemanal: "", valorBolsa: "", prazoInscricao: "" }, rafael, instituicoes, hoje);
ok(eSemCampos.cargaHorariaSemanal && eSemCampos.valorBolsa && eSemCampos.prazoInscricao, "RF07: sem carga horária, bolsa e prazo não publica", Object.keys(eSemCampos).join(", "));

ok(pub.validarOportunidade({ ...formValido, prazoInscricao: "2026-09-01" }, rafael, instituicoes, hoje).prazoInscricao, "Prazo no passado é recusado");
ok(pub.validarOportunidade({ ...formValido, tipo: "estagio" }, rafael, instituicoes, hoje).tipo, "Representante acadêmico não publica estágio");
ok(pub.validarOportunidade({ ...formValido, tipo: "monitoria" }, camila, instituicoes, hoje).tipo, "Recrutador não publica monitoria");
ok(pub.validarOportunidade({ ...formValido, formaCandidatura: "externa", linkExterno: "site" }, rafael, instituicoes, hoje).linkExterno, "Candidatura externa exige link válido");

const normAcad = pub.normalizarOportunidade({ ...formValido, universidadesAlvo: [2] });
ok(normAcad.universidadesAlvo.length === 0, "Oportunidade acadêmica não grava universidades-alvo");
const normEst = pub.normalizarOportunidade({ ...formValido, tipo: "estagio", universidadesAlvo: [1, 2], remunerada: false });
ok(normEst.universidadesAlvo.join() === "1,2" && normEst.valorBolsa === null, "Estágio grava universidades-alvo; voluntária zera bolsa");

const recRafael = pub.candidaturasRecebidasPor(rafael, estado);
const recCamila = pub.candidaturasRecebidasPor(camila, estado);
const uniDe = (c) => alunos.find((a) => a.id === c.alunoId).universidadeId;
ok(recRafael.length > 0 && recRafael.every((c) => estado.oportunidades.find((o) => o.id === c.oportunidadeId).instituicaoId === 11), "Rafael só recebe candidaturas das vagas do Depto. de Informática", `${recRafael.length}`);
ok(new Set(recCamila.map(uniDe)).size >= 2, "Recrutadora vê candidatos de mais de uma universidade", [...new Set(recCamila.map(uniDe))].join(","));

// Candidatura inconsistente de aluna da UFRJ numa vaga da PUC: não deve aparecer
// para o representante mesmo assim.
const estadoSujo = { ...estado, candidaturas: [...estado.candidaturas, { id: 999, alunoId: 7, oportunidadeId: 2, data: hoje, status: "inscrita" }] };
ok(!pub.candidaturasRecebidasPor(rafael, estadoSujo).some((c) => c.id === 999), "Representante da PUC não vê candidata da UFRJ");

const filtroCr = aplicarFiltrosCandidato(recCamila.map((c) => alunos.find((a) => a.id === c.alunoId)), { crMinimo: 8.5 });
ok(filtroCr.length > 0 && filtroCr.every((a) => a.cr >= 8.5), "Filtro de CR mínimo reduz a lista corretamente", `${filtroCr.length}`);

ok(!pub.podeEncerrar(rafael, oportunidades.find((o) => o.id === 18)), "RNF04: Rafael não encerra vaga da Visagio");
ok(pub.podeEncerrar(camila, oportunidades.find((o) => o.id === 18)), "Camila encerra vaga da Visagio");

console.log("\n=== 8. BANCO DE TALENTOS E CURRÍCULO (Etapa 5) ===");

const marinaSemConsent = alunos.find((a) => a.id === 5); // PUC, sem consentimento
const julianaUfrj = alunos.find((a) => a.id === 7); // UFRJ, consentiu

ok(!escopo.podeVerCurriculo(rafael, julianaUfrj, estado), "Representante da PUC NÃO abre currículo de aluna da UFRJ, mesmo com consentimento");
ok(escopo.podeVerCurriculo(camila, julianaUfrj, estado), "Recrutadora abre currículo de aluna da UFRJ que consentiu");
ok(escopo.podeVerCurriculo(rafael, isabela, estado), "Representante da PUC abre currículo de aluna da PUC que consentiu");
ok(!escopo.podeVerCurriculo(camila, marinaSemConsent, estado), "Sem consentimento e sem candidatura: recrutadora não abre");
ok(escopo.podeVerCurriculo(rafael, marinaSemConsent, estado), "Sem consentimento, mas candidatou-se ao Depto. de Informática: Rafael abre (RNF03)");

const comExpProf = aplicarFiltrosCandidato(alunos, { tiposExperiencia: ["profissional"] });
ok(
  comExpProf.length > 0 && comExpProf.length < alunos.length && comExpProf.every((a) => a.experiencias.some((x) => x.tipo === "profissional")),
  "Filtro de experiência profissional reduz a lista corretamente",
  `${comExpProf.length}/${alunos.length}`,
);
const porArea = aplicarFiltrosCandidato(alunos, { areas: ["Logística"] });
ok(porArea.length > 0 && porArea.every((a) => a.areasInteresse.includes("Logística")), "Filtro de área de interesse funciona", `${porArea.length}`);

const formPerfil = perfil.perfilParaFormulario(isabela);
ok(Object.keys(perfil.validarPerfil(formPerfil)).length === 0, "Perfil do seed passa na validação");
ok(perfil.validarPerfil({ ...formPerfil, cr: "11" }).cr, "CR acima de 10 é recusado");
const expInvertida = { ...perfil.experienciaEmBranco(), titulo: "X", organizacao: "Y", inicio: "2025-05-01", fim: "2024-01-01" };
ok(perfil.validarPerfil({ ...formPerfil, experiencias: [expInvertida] })["experiencias.0"], "Experiência com fim antes do início é recusada");
const mud = perfil.normalizarPerfil({ ...formPerfil, universidadeId: 2, cursoId: 9, habilidades: [" SQL ", "SQL", ""] });
ok(!("universidadeId" in mud) && !("cursoId" in mud), "Universidade e curso não passam pela edição de perfil");
ok(mud.habilidades.join() === "SQL", "Habilidades vazias e repetidas são limpas");

console.log("\n=== 9. INSTITUIÇÃO E VERIFICAÇÃO (Etapa 6) ===");

const rodrigo = membros.find((m) => m.id === 3); // Opportunity, não verificado
const visagio = instituicoes.find((i) => i.id === 50);
const opportunityInst = instituicoes.find((i) => i.id === 51);
const ligaPuc = instituicoes.find((i) => i.id === 30);
const deptInfo = instituicoes.find((i) => i.id === 11);

ok(!inst.podePublicar(rodrigo), "RF03: conta não verificada não publica");
ok(inst.podePublicar(camila) && inst.podePublicar(rafael), "Contas verificadas publicam");
ok(inst.podeEditarInstituicao(camila, visagio), "Camila edita o perfil da Visagio");
ok(!inst.podeEditarInstituicao(camila, deptInfo), "Camila não edita perfil de outra instituição");
ok(!inst.podeEditarInstituicao(rodrigo, opportunityInst), "Membro não verificado não edita o perfil da própria instituição");

ok(inst.alunoPodeVerInstituicao(carolina, visagio), "Aluna da UERJ abre perfil de empresa");
ok(inst.alunoPodeVerInstituicao(isabela, ligaPuc), "Aluna da PUC abre perfil da liga da PUC");
ok(!inst.alunoPodeVerInstituicao(juliana, ligaPuc), "Aluna da UFRJ NÃO abre perfil da liga da PUC");

const visagioParaCarolina = escopo.oportunidadesVisiveisPara(carolina, oportunidades, instituicoes).filter((o) => o.instituicaoId === 50);
ok(visagioParaCarolina.length === 0, "Perfil da Visagio não lista para a UERJ estágios publicados só para PUC/UFRJ");

const formInst = inst.instituicaoParaFormulario(visagio);
ok(Object.keys(inst.validarInstituicao(formInst)).length === 0, "Perfil do seed passa na validação");
ok(inst.validarInstituicao({ ...formInst, site: "visagio.com" }).site, "Site sem https:// é recusado");
const mudInst = inst.normalizarInstituicao({ ...formInst, nome: "Outra", tipo: "faculdade", universidadeVinculada: 2 });
ok(!("nome" in mudInst) && !("tipo" in mudInst) && !("universidadeVinculada" in mudInst), "Nome, tipo e universidade não passam pela edição");

ok(inst.membrosPendentes(membros).map((m) => m.id).join() === "3", "Pendentes do seed: só o Rodrigo (Opportunity)");

console.log(`\n${falhas === 0 ? "TODAS AS VERIFICAÇÕES PASSARAM" : `${falhas} FALHA(S)`}\n`);
process.exit(falhas === 0 ? 0 : 1);
