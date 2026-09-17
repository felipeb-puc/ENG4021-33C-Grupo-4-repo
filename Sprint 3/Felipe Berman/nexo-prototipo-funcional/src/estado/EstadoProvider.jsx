import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { estadoInicial } from "../dados/seed.js";
import { acharContaDemo, contasDemo } from "../dados/contasDemo.js";
import { STATUS_CANDIDATURA } from "../dados/candidaturas.js";
import {
  PAPEL,
  papelDoMembro,
  podeEditarOportunidade,
  universidadeDoMembro,
} from "../regras/escopo.js";
import {
  normalizarOportunidade,
  podeEncerrar,
  validarOportunidade,
  validarRascunho,
} from "../regras/publicacao.js";
import { STATUS_OPORTUNIDADE } from "../dados/oportunidades.js";
import { normalizarPerfil, validarPerfil } from "../regras/perfil.js";
import {
  MOTIVO_NAO_VERIFICADO,
  normalizarInstituicao,
  podeEditarInstituicao,
  podePublicar,
  validarInstituicao,
} from "../regras/instituicao.js";
import { podeCandidatar } from "../regras/candidatura.js";
import { hojeISO } from "../regras/datas.js";
import { carregarEstado, limparEstado, salvarEstado } from "./armazenamento.js";

/* Estado da aplicação inteira.

   O protótipo anterior guardava "papel" como um campo que a tela de login
   trocava por clique — não havia conta nem sessão, e por isso não existia um
   perfil de empresa de verdade. Aqui a sessão aponta para um perfil (aluno ou
   membro de instituição) e o papel é derivado dele. */

const EstadoContexto = createContext(null);

export function EstadoProvider({ children }) {
  const [estado, setEstado] = useState(carregarEstado);

  useEffect(() => {
    salvarEstado(estado);
  }, [estado]);

  /* ---------------------------------------------------------------- */
  /* Quem está logado                                                  */
  /* ---------------------------------------------------------------- */

  const usuario = useMemo(() => {
    const sessao = estado.sessao;
    if (!sessao) return null;

    if (sessao.perfil === "aluno") {
      const aluno = estado.alunos.find((a) => a.id === sessao.perfilId);
      if (!aluno) return null;
      const universidade = estado.instituicoes.find(
        (i) => i.id === aluno.universidadeId,
      );
      return {
        papel: PAPEL.ALUNO,
        nome: aluno.nome,
        email: aluno.email,
        aluno,
        membro: null,
        instituicao: universidade || null,
        universidadeId: aluno.universidadeId,
      };
    }

    if (sessao.perfil === "admin") {
      return {
        papel: PAPEL.ADMIN,
        nome: "Administração NEXO",
        email: "admin@nexo.com.br",
        aluno: null,
        membro: null,
        instituicao: null,
        universidadeId: null,
      };
    }

    const membro = estado.membros.find((m) => m.id === sessao.perfilId);
    if (!membro) return null;
    const instituicao = estado.instituicoes.find(
      (i) => i.id === membro.instituicaoId,
    );
    return {
      papel: papelDoMembro(membro, estado.instituicoes),
      nome: membro.nome,
      email: membro.email,
      aluno: null,
      membro,
      instituicao: instituicao || null,
      universidadeId: universidadeDoMembro(membro, estado.instituicoes),
    };
  }, [estado]);

  /* ---------------------------------------------------------------- */
  /* Sessão                                                            */
  /* ---------------------------------------------------------------- */

  const entrar = useCallback((email, senha) => {
    const conta = acharContaDemo(email);

    if (!conta) {
      return {
        ok: false,
        erro: "Não encontramos uma conta com esse e-mail. Use uma das contas de demonstração abaixo.",
      };
    }
    if (conta.senha !== senha) {
      return { ok: false, erro: "Senha incorreta." };
    }

    setEstado((e) => ({
      ...e,
      sessao: { perfil: conta.perfil, perfilId: conta.perfilId },
    }));
    return { ok: true, perfil: conta.perfil };
  }, []);

  const sair = useCallback(() => {
    setEstado((e) => ({ ...e, sessao: null }));
  }, []);

  const recomecarDemonstracao = useCallback(() => {
    limparEstado();
    setEstado(estadoInicial());
  }, []);

  /* ---------------------------------------------------------------- */
  /* Cadastro                                                          */
  /* ---------------------------------------------------------------- */

  /** Cria conta de aluno. A universidade é escolhida aqui e não é editável
   *  depois — é ela que define tudo que a pessoa enxerga na plataforma. */
  const criarContaAluno = useCallback((dados) => {
    let novoId;
    setEstado((e) => {
      novoId = Math.max(0, ...e.alunos.map((a) => a.id)) + 1;
      const aluno = {
        id: novoId,
        nome: dados.nome,
        email: dados.email,
        universidadeId: Number(dados.universidadeId),
        matricula: dados.matricula,
        cursoId: Number(dados.cursoId),
        periodo: Number(dados.periodo),
        cr: dados.cr === "" || dados.cr == null ? null : Number(dados.cr),
        visivelParaRecrutadores: Boolean(dados.visivelParaRecrutadores),
        foto: "",
        resumo: "",
        areasInteresse: [],
        habilidades: [],
        experiencias: [],
      };
      return {
        ...e,
        alunos: [...e.alunos, aluno],
        sessao: { perfil: "aluno", perfilId: novoId },
      };
    });
    return { ok: true };
  }, []);

  /** Cria conta de quem publica. Nasce com `verificado: false` — RF03: a conta
   *  passa por aprovação antes de poder publicar. */
  const criarContaMembro = useCallback((dados) => {
    let novoId;
    setEstado((e) => {
      novoId = Math.max(0, ...e.membros.map((m) => m.id)) + 1;
      const membro = {
        id: novoId,
        nome: dados.nome,
        email: dados.email,
        instituicaoId: Number(dados.instituicaoId),
        cargo: dados.cargo || "",
        verificado: false,
      };
      return {
        ...e,
        membros: [...e.membros, membro],
        sessao: { perfil: "membro", perfilId: novoId },
      };
    });
    return { ok: true };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Ações do aluno                                                    */
  /* ---------------------------------------------------------------- */

  const alternarFavorito = useCallback(
    (oportunidadeId) => {
      if (!usuario?.aluno) return;
      const alunoId = usuario.aluno.id;
      setEstado((e) => {
        const existe = e.favoritos.some(
          (f) => f.alunoId === alunoId && f.oportunidadeId === oportunidadeId,
        );
        return {
          ...e,
          favoritos: existe
            ? e.favoritos.filter(
                (f) => !(f.alunoId === alunoId && f.oportunidadeId === oportunidadeId),
              )
            : [...e.favoritos, { alunoId, oportunidadeId }],
        };
      });
    },
    [usuario],
  );

  const ehFavorito = useCallback(
    (oportunidadeId) =>
      Boolean(usuario?.aluno) &&
      estado.favoritos.some(
        (f) => f.alunoId === usuario.aluno.id && f.oportunidadeId === oportunidadeId,
      ),
    [estado.favoritos, usuario],
  );

  /** Candidatar-se. Passa pelas validações de `podeCandidatar` — prazo, status,
   *  período mínimo, curso-alvo, CR e escopo de universidade. */
  const candidatar = useCallback(
    (oportunidadeId) => {
      if (!usuario?.aluno) {
        return { ok: false, erro: "Entre com uma conta de estudante para se candidatar." };
      }

      const oportunidade = estado.oportunidades.find((o) => o.id === oportunidadeId);
      const veredito = podeCandidatar(usuario.aluno, oportunidade, estado);
      if (!veredito.pode) return { ok: false, erro: veredito.motivo };

      setEstado((e) => ({
        ...e,
        candidaturas: [
          {
            id: Math.max(0, ...e.candidaturas.map((c) => c.id)) + 1,
            alunoId: usuario.aluno.id,
            oportunidadeId,
            data: hojeISO(),
            status: STATUS_CANDIDATURA.INSCRITA,
            observacoes: "",
          },
          ...e.candidaturas,
        ],
      }));

      return { ok: true };
    },
    [estado, usuario],
  );

  /** RF05: o aluno logado edita o próprio currículo. Só os campos de
   *  CAMPOS_EDITAVEIS chegam ao dado — universidade e curso não mudam aqui. */
  const salvarPerfil = useCallback(
    (formulario) => {
      if (!usuario?.aluno) return { ok: false, erros: { geral: "Entre com uma conta de estudante." } };
      const erros = validarPerfil(formulario);
      if (Object.keys(erros).length) return { ok: false, erros };
      const alunoId = usuario.aluno.id;
      const mudancas = normalizarPerfil(formulario);
      setEstado((e) => ({
        ...e,
        alunos: e.alunos.map((a) => (a.id === alunoId ? { ...a, ...mudancas } : a)),
      }));
      return { ok: true };
    },
    [usuario],
  );

  const atualizarAluno = useCallback((alunoId, mudancas) => {
    setEstado((e) => ({
      ...e,
      alunos: e.alunos.map((a) => (a.id === alunoId ? { ...a, ...mudancas } : a)),
    }));
  }, []);

  /* ---------------------------------------------------------------- */
  /* Ações de quem publica                                             */
  /* ---------------------------------------------------------------- */

  /** Só quem publicou a vaga muda o status das candidaturas dela (RNF04). */
  const mudarStatusCandidatura = useCallback(
    (candidaturaId, status) => {
      const c = estado.candidaturas.find((x) => x.id === candidaturaId);
      const o = estado.oportunidades.find((x) => x.id === c?.oportunidadeId);
      if (!podeEditarOportunidade(usuario?.membro, o)) {
        return { ok: false, erro: "Só quem publicou a oportunidade pode mudar o status." };
      }
      setEstado((e) => ({
        ...e,
        candidaturas: e.candidaturas.map((x) =>
          x.id === candidaturaId ? { ...x, status } : x,
        ),
      }));
      return { ok: true };
    },
    [estado, usuario],
  );

  /** Cria ou edita oportunidade. `id` nulo cria. `publicar` falso grava como
   *  rascunho, que só exige título. Uma vaga já publicada não volta a rascunho. */
  const salvarOportunidade = useCallback(
    (id, formulario, { publicar }) => {
      const membro = usuario?.membro;
      if (!membro) return { ok: false, erros: { geral: "Entre com uma conta de instituição." } };

      const existente = id ? estado.oportunidades.find((o) => o.id === id) : null;
      if (id && !podeEditarOportunidade(membro, existente)) {
        return { ok: false, erros: { geral: "Só quem publicou a oportunidade pode editá-la." } };
      }
      if (existente?.status === STATUS_OPORTUNIDADE.ENCERRADA) {
        return { ok: false, erros: { geral: "Oportunidade encerrada não pode ser editada." } };
      }

      const jaPublicada = existente?.status === STATUS_OPORTUNIDADE.ABERTA;
      const vaiPublicar = publicar || jaPublicada;
      // RF03: sem verificação, só rascunho.
      if (vaiPublicar && !podePublicar(membro)) {
        return { ok: false, erros: { geral: MOTIVO_NAO_VERIFICADO } };
      }
      const erros = vaiPublicar
        ? validarOportunidade(formulario, membro, estado.instituicoes)
        : validarRascunho(formulario);
      if (Object.keys(erros).length) return { ok: false, erros };

      const dados = normalizarOportunidade(formulario);
      const novoId = id || Math.max(0, ...estado.oportunidades.map((o) => o.id)) + 1;

      setEstado((e) => {
        const base = e.oportunidades.find((o) => o.id === id);
        const registro = {
          ...base,
          ...dados,
          id: novoId,
          instituicaoId: membro.instituicaoId,
          status: vaiPublicar ? STATUS_OPORTUNIDADE.ABERTA : STATUS_OPORTUNIDADE.RASCUNHO,
          publicadaEm: base?.publicadaEm || (vaiPublicar ? hojeISO() : null),
        };
        return {
          ...e,
          oportunidades: base
            ? e.oportunidades.map((o) => (o.id === id ? registro : o))
            : [...e.oportunidades, registro],
        };
      });
      return { ok: true, id: novoId };
    },
    [estado, usuario],
  );

  /** RF09: encerrar. Não apaga — as candidaturas continuam no histórico dos
   *  alunos. */
  const encerrarOportunidade = useCallback(
    (id) => {
      const o = estado.oportunidades.find((x) => x.id === id);
      if (!podeEncerrar(usuario?.membro, o)) {
        return { ok: false, erro: "Só quem publicou pode encerrar esta oportunidade." };
      }
      setEstado((e) => ({
        ...e,
        oportunidades: e.oportunidades.map((x) =>
          x.id === id ? { ...x, status: STATUS_OPORTUNIDADE.ENCERRADA } : x,
        ),
      }));
      return { ok: true };
    },
    [estado, usuario],
  );

  /** RF06: dono verificado edita o perfil público da própria instituição. */
  const salvarInstituicao = useCallback(
    (instituicaoId, formulario) => {
      const inst = estado.instituicoes.find((i) => i.id === instituicaoId);
      if (!podeEditarInstituicao(usuario?.membro, inst)) {
        return { ok: false, erros: { geral: "Só um membro verificado da instituição pode editar este perfil." } };
      }
      const erros = validarInstituicao(formulario);
      if (Object.keys(erros).length) return { ok: false, erros };
      const mudancas = normalizarInstituicao(formulario);
      setEstado((e) => ({
        ...e,
        instituicoes: e.instituicoes.map((i) => (i.id === instituicaoId ? { ...i, ...mudancas } : i)),
      }));
      return { ok: true };
    },
    [estado.instituicoes, usuario],
  );

  /** RF03: só o administrador aprova conta de quem publica. */
  const aprovarMembro = useCallback(
    (membroId) => {
      if (usuario?.papel !== PAPEL.ADMIN) {
        return { ok: false, erro: "Só a administração do NEXO aprova contas." };
      }
      setEstado((e) => ({
        ...e,
        membros: e.membros.map((m) => (m.id === membroId ? { ...m, verificado: true } : m)),
      }));
      return { ok: true };
    },
    [usuario],
  );

  const valor = useMemo(
    () => ({
      estado,
      usuario,
      contasDemo,
      entrar,
      sair,
      recomecarDemonstracao,
      criarContaAluno,
      criarContaMembro,
      alternarFavorito,
      ehFavorito,
      candidatar,
      atualizarAluno,
      salvarPerfil,
      mudarStatusCandidatura,
      salvarOportunidade,
      encerrarOportunidade,
      salvarInstituicao,
      aprovarMembro,
    }),
    [
      estado,
      usuario,
      entrar,
      sair,
      recomecarDemonstracao,
      criarContaAluno,
      criarContaMembro,
      alternarFavorito,
      ehFavorito,
      candidatar,
      atualizarAluno,
      salvarPerfil,
      mudarStatusCandidatura,
      salvarOportunidade,
      encerrarOportunidade,
      salvarInstituicao,
      aprovarMembro,
    ],
  );

  return <EstadoContexto.Provider value={valor}>{children}</EstadoContexto.Provider>;
}

export function useEstado() {
  const ctx = useContext(EstadoContexto);
  if (!ctx) {
    throw new Error("useEstado precisa estar dentro de <EstadoProvider>.");
  }
  return ctx;
}
