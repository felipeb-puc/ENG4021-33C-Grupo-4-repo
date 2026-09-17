import { Navigate, useLocation } from "react-router-dom";

import { useEstado } from "../estado/EstadoProvider.jsx";
import { PAPEL } from "../regras/escopo.js";

/* Guarda de rota por papel.

   No protótipo anterior qualquer tela era alcançável só mudando o estado — um
   "recrutador" conseguia abrir o perfil e o currículo de um aluno, o que fere o
   RNF03. Aqui cada rota declara quem pode entrar, e quem não pode é mandado
   para o próprio destino em vez de ver uma tela que não é dele. */

/** Para onde cada papel vai quando entra, ou quando tenta abrir tela alheia. */
export function destinoDoPapel(papel) {
  if (papel === PAPEL.ALUNO) return "/inicio";
  if (papel === PAPEL.RECRUTADOR || papel === PAPEL.REPRESENTANTE) return "/painel";
  if (papel === PAPEL.ADMIN) return "/admin";
  return "/entrar";
}

export function RotaProtegida({ papeis, children }) {
  const { usuario } = useEstado();
  const local = useLocation();

  // Não logado: manda entrar, lembrando de onde veio.
  if (!usuario) {
    return <Navigate to="/entrar" state={{ de: local.pathname }} replace />;
  }

  // Logado, mas com o papel errado para esta tela.
  if (papeis && !papeis.includes(usuario.papel)) {
    return <Navigate to={destinoDoPapel(usuario.papel)} replace />;
  }

  return children;
}

/** Inverso: telas que só fazem sentido deslogado (entrar, criar conta).
 *  Quem já está logado é levado direto ao seu painel. */
export function RotaPublica({ children }) {
  const { usuario } = useEstado();
  if (usuario) return <Navigate to={destinoDoPapel(usuario.papel)} replace />;
  return children;
}
