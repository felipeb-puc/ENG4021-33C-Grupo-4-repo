/* Estado inicial da aplicação, montado a partir dos dados de referência.

   Este é o "banco de dados" do protótipo. Tudo que o usuário altera (favoritar,
   candidatar-se, publicar vaga, mudar status) é gravado sobre uma cópia deste
   objeto em localStorage — e o botão "recomeçar demonstração" volta para cá.

   Quando o projeto migrar para Django, este arquivo vira fixtures e as funções
   de regra viram querysets. */

import { instituicoes } from "./instituicoes.js";
import { cursos } from "./cursos.js";
import { oportunidades } from "./oportunidades.js";
import { alunos, membros } from "./pessoas.js";
import { candidaturas, favoritos } from "./candidaturas.js";

/* Versão do formato. Mudou a estrutura dos dados? Suba a versão: o estado
   antigo salvo no navegador é descartado em vez de quebrar a tela. */
export const VERSAO_ESTADO = 1;

export function estadoInicial() {
  // Cópia profunda para que o estado salvo nunca compartilhe referência com os
  // dados de referência importados.
  return structuredClone({
    versao: VERSAO_ESTADO,
    instituicoes,
    cursos,
    oportunidades,
    alunos,
    membros,
    candidaturas,
    favoritos,
    sessao: null,
  });
}
