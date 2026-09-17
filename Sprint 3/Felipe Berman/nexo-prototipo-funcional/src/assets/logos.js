/* Logos das instituições.

   O Vite precisa ver o import para incluir o arquivo no build, então não dá
   para montar o caminho por concatenação em runtime. Este mapa liga o nome
   guardado em `Instituicao.logo` ao arquivo importado.

   Instituição sem logo (ligas, equipes e parte das empresas) simplesmente não
   aparece aqui — o card cai no tratamento sem imagem, que é o correto: melhor
   não mostrar logo nenhuma do que mostrar uma genérica. */

import pucrio from "./logos/pucrio.png";
import ufrj from "./logos/ufrj.svg";
import uerj from "./logos/uerj.svg";
import fgv from "./logos/fgv.png";
import visagio from "./logos/visagio.png";
import opportunity from "./logos/opportunity_gestora_logo.jpeg";

export default {
  "pucrio.png": pucrio,
  "ufrj.svg": ufrj,
  "uerj.svg": uerj,
  "fgv.png": fgv,
  "visagio.png": visagio,
  "opportunity_gestora_logo.jpeg": opportunity,
};
