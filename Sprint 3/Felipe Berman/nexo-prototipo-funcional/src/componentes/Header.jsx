import { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { Logo } from "../ds/brand/Logo.jsx";
import { Button } from "../ds/core/Button.jsx";
import { Icon } from "../ds/core/Icon.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { PAPEL } from "../regras/escopo.js";
import { STATUS_ENCERRADOS } from "../dados/candidaturas.js";

/* Cabeçalho, diferente por papel.

   Duas correções em relação ao protótipo:

   1. O header do estudante não tinha navegação nenhuma — só logo, busca e dois
      ícones — e sobrava um vão vazio no meio. Agora tem abas, como o painel de
      quem publica já tinha.

   2. O papel aqui é o da sessão, não um botão que troca a tela. Um recrutador
      logado nunca vê a navegação de estudante. */

const estiloAba = ({ isActive }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  height: 38,
  padding: "0 16px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: isActive ? 600 : 500,
  textDecoration: "none",
  whiteSpace: "nowrap",
  flexShrink: 0,
  border: isActive ? "1px solid var(--green-600)" : "1px solid transparent",
  background: isActive ? "var(--green-600)" : "transparent",
  color: isActive ? "var(--paper)" : "var(--text-body)",
  transition: "background var(--dur) var(--ease-out), color var(--dur) var(--ease-out)",
});

function Contador({ n, ativo }) {
  if (!n) return null;
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        borderRadius: 999,
        padding: "1px 7px",
        color: ativo ? "var(--paper)" : "var(--green-700)",
        background: ativo
          ? "color-mix(in oklch, var(--green-900) 28%, transparent)"
          : "var(--green-50)",
      }}
    >
      {n}
    </span>
  );
}

function Avatar({ nome, tom = "claro" }) {
  const iniciais = (nome || "")
    .split(" ")
    .filter((p) => p.length > 2 || p === p.toUpperCase())
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <span
      title={nome}
      style={{
        width: 36,
        height: 36,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        fontSize: 12.5,
        fontWeight: 700,
        flex: "0 0 auto",
        background: tom === "escuro" ? "var(--green-800)" : "var(--green-500)",
        color: tom === "escuro" ? "var(--green-50)" : "var(--paper)",
      }}
    >
      {iniciais || "?"}
    </span>
  );
}

export default function Header() {
  const { usuario, estado, sair, recomecarDemonstracao } = useEstado();
  const navegar = useNavigate();
  const { pathname } = useLocation();

  /* No celular as abas rolam de lado; sem isso, abrir "Perfil da instituição"
     deixa a aba ativa fora da tela. No desktop, com tudo visível, não mexe. */
  useEffect(() => {
    document
      .querySelector(".header-nav a.active")
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  const aoSair = () => {
    sair();
    navegar("/");
  };

  const aoRecomecar = () => {
    recomecarDemonstracao();
    navegar("/");
  };

  const barra = {
    /* Altura mínima, não fixa: no celular o conteúdo quebra em duas linhas e,
       com height fixa, a segunda linha vazava por cima da página. */
    minHeight: 74,
    display: "flex",
    alignItems: "center",
    gap: "10px 20px",
    padding: "10px clamp(16px, 4vw, 40px)",
    borderBottom: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-xs)",
    position: "sticky",
    top: 0,
    background: "var(--paper)",
    zIndex: 20,
    flexWrap: "wrap",
  };

  /* ---------------- deslogado ---------------- */
  if (!usuario) {
    return (
      <header style={barra}>
        <Link to="/" aria-label="NEXO — início" style={{ display: "inline-flex" }}>
          <Logo size={22} />
        </Link>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <Button variant="ghost" size="sm" onClick={() => navegar("/entrar")}>
            Entrar
          </Button>
          <Button size="sm" icon="arrow-right" onClick={() => navegar("/criar-conta")}>
            Criar conta
          </Button>
        </div>
      </header>
    );
  }

  /* ---------------- estudante ---------------- */
  if (usuario.papel === PAPEL.ALUNO) {
    const alunoId = usuario.aluno.id;
    const nFavoritos = estado.favoritos.filter((f) => f.alunoId === alunoId).length;
    const nAtivas = estado.candidaturas.filter(
      (c) => c.alunoId === alunoId && !STATUS_ENCERRADOS.includes(c.status),
    ).length;

    return (
      <header style={barra}>
        <Link to="/inicio" aria-label="NEXO — início" style={{ display: "inline-flex" }}>
          <Logo size={22} />
        </Link>

        <nav className="header-nav" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <NavLink to="/inicio" style={estiloAba}>
            Início
          </NavLink>
          <NavLink to="/busca" style={estiloAba}>
            <Icon name="search" size={15} />
            Buscar
          </NavLink>
          <NavLink to="/minhas-oportunidades" style={estiloAba}>
            {({ isActive }) => (
              <>
                Minhas oportunidades
                <Contador n={nFavoritos + nAtivas} ativo={isActive} />
              </>
            )}
          </NavLink>
        </nav>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <span className="so-desktop" style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {usuario.instituicao?.sigla || usuario.instituicao?.nome}
          </span>
          <Link to="/perfil" aria-label="Meu perfil" style={{ display: "inline-flex" }}>
            <Avatar nome={usuario.nome} />
          </Link>
          <BotoesSessao aoSair={aoSair} aoRecomecar={aoRecomecar} />
        </div>
      </header>
    );
  }

  /* ---------------- administração ---------------- */
  if (usuario.papel === PAPEL.ADMIN) {
    return (
      <header style={barra}>
        <Link to="/admin" aria-label="NEXO — administração" style={{ display: "inline-flex" }}>
          <Logo size={21} />
        </Link>
        <nav className="header-nav" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <NavLink to="/admin" style={estiloAba}>
            Verificação de contas
          </NavLink>
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar nome={usuario.nome} tom="escuro" />
          <BotoesSessao aoSair={aoSair} aoRecomecar={aoRecomecar} />
        </div>
      </header>
    );
  }

  /* ---------------- quem publica ---------------- */
  const ehRecrutador = usuario.papel === PAPEL.RECRUTADOR;

  return (
    <header style={barra}>
      <Link to="/painel" aria-label="NEXO — painel" style={{ display: "inline-flex" }}>
        <Logo size={21} />
      </Link>

      <span
        className="so-desktop"
        style={{
          fontSize: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: "var(--green-700)",
          background: "var(--green-50)",
          border: "1px solid var(--green-100)",
          borderRadius: 999,
          padding: "6px 12px",
        }}
      >
        {ehRecrutador ? "Recrutador" : "Representante acadêmico"}
      </span>

      <nav className="header-nav" style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <NavLink to="/painel" end style={estiloAba}>
          Visão geral
        </NavLink>
        <NavLink to="/painel/candidaturas" style={estiloAba}>
          Candidaturas
        </NavLink>
        <NavLink to="/painel/talentos" style={estiloAba}>
          {ehRecrutador ? "Buscar candidatos" : "Alunos da universidade"}
        </NavLink>
        <NavLink to={`/instituicao/${usuario.instituicao?.id}`} style={estiloAba}>
          Perfil da instituição
        </NavLink>
      </nav>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <span className="so-desktop" style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {usuario.instituicao?.nome}
        </span>
        <Avatar nome={usuario.nome} tom="escuro" />
        <BotoesSessao aoSair={aoSair} aoRecomecar={aoRecomecar} />
      </div>
    </header>
  );
}

function BotoesSessao({ aoSair, aoRecomecar }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        type="button"
        onClick={aoRecomecar}
        title="Volta os dados da demonstração ao estado inicial"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontSize: 12.5,
          color: "var(--text-muted)",
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        Recomeçar<span className="so-desktop"> demonstração</span>
      </button>
      <Button variant="outline" size="sm" iconLeft="log-out" onClick={aoSair}>
        Sair
      </Button>
    </div>
  );
}
