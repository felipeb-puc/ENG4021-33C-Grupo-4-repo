/* Persistência no navegador.

   Toda leitura e escrita passa por try/catch: em janela anônima, com dados de
   site bloqueados ou com a cota cheia, o localStorage lança em vez de devolver
   vazio. O site tem que continuar funcionando nesse caso — só perde a
   persistência entre recarregamentos. */

import { estadoInicial, VERSAO_ESTADO } from "../dados/seed.js";

const CHAVE = `nexo:estado:v${VERSAO_ESTADO}`;

export function carregarEstado() {
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return estadoInicial();

    const salvo = JSON.parse(bruto);

    // Formato antigo: descarta em vez de tentar migrar e quebrar a tela.
    if (salvo?.versao !== VERSAO_ESTADO) return estadoInicial();

    return salvo;
  } catch {
    return estadoInicial();
  }
}

export function salvarEstado(estado) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // Sem persistência: o estado segue vivo em memória nesta aba.
  }
}

export function limparEstado() {
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    // Nada a fazer — o estado será recriado a partir do seed de qualquer forma.
  }
}
