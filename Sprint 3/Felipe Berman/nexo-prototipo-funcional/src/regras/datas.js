/* Datas.

   Tudo no NEXO trafega em ISO (AAAA-MM-DD) e só vira texto legível na hora de
   exibir. Isso não é preciosismo: no protótipo anterior o prazo era a string
   "30/09/2026" e a ordenação por prazo comparava essas strings, o que compara o
   DIA primeiro — 05/10 vinha antes de 30/09 e a urgência aparecia invertida.

   Em ISO, ordem alfabética e ordem cronológica são a mesma coisa, então
   comparar como texto passa a estar correto. */

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** Data de hoje em ISO, no fuso local.
 *  `toISOString()` devolveria UTC, que no Brasil vira o dia seguinte depois das
 *  21h — e prazos passariam a vencer cedo demais. */
export function hojeISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** "2026-09-30" -> "30/09/2026" */
export function formatarData(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** "2026-09-30" -> "30 set" */
export function formatarDataCurta(iso) {
  if (!iso) return "";
  const [, mes, dia] = iso.split("-");
  return `${Number(dia)} ${MESES[Number(mes) - 1]}`;
}

/** Dias que faltam até a data. Negativo se já passou. */
export function diasAte(iso) {
  if (!iso) return null;
  const alvo = new Date(`${iso}T00:00:00`);
  const hoje = new Date(`${hojeISO()}T00:00:00`);
  return Math.round((alvo - hoje) / 86400000);
}

export function estaVencida(iso) {
  if (!iso) return false;
  return iso < hojeISO();
}

/** Texto de urgência a partir do prazo — "Encerra hoje", "Faltam 3 dias". */
export function textoPrazo(iso) {
  const dias = diasAte(iso);
  if (dias === null) return "Sem prazo definido";
  if (dias < 0) return "Inscrições encerradas";
  if (dias === 0) return "Encerra hoje";
  if (dias === 1) return "Encerra amanhã";
  if (dias <= 7) return `Faltam ${dias} dias`;
  return `Inscrições até ${formatarData(iso)}`;
}

/** Período de uma experiência: "2024 — atual", "2023 — 2024". */
export function periodoTexto(inicio, fim) {
  const ano = (iso) => (iso ? iso.slice(0, 4) : "");
  if (!inicio) return "";
  return fim ? `${ano(inicio)} — ${ano(fim)}` : `${ano(inicio)} — atual`;
}
