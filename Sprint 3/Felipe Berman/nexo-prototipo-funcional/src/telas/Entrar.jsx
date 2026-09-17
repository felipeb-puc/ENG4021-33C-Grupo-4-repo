import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Icon } from "../ds/core/Icon.jsx";
import { Input } from "../ds/forms/Input.jsx";
import { Logo } from "../ds/brand/Logo.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { destinoDoPapel } from "../componentes/RotaProtegida.jsx";
import { PAPEL } from "../regras/escopo.js";

/* Entrar.

   Diferença central em relação ao protótipo: lá havia três botões de "papel"
   que só trocavam a aparência da tela seguinte. Aqui o papel vem da conta — o
   e-mail define quem você é e para onde vai.

   As contas de demonstração ficam à vista, com um clique para preencher. Em
   apresentação ao vivo ninguém precisa digitar nem lembrar de senha. */

const ICONE_DA_CONTA = {
  Estudante: "graduation-cap",
  Recrutadora: "building-2",
  "Representante acadêmico": "landmark",
};

export default function Entrar() {
  const { entrar, contasDemo } = useEstado();
  const navegar = useNavigate();
  const local = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const preencher = (conta) => {
    setEmail(conta.email);
    setSenha(conta.senha);
    setErro("");
  };

  const enviar = (evento) => {
    evento.preventDefault();
    setErro("");

    if (!email.trim()) return setErro("Informe o e-mail da sua conta.");
    if (!senha) return setErro("Informe a senha.");

    const r = entrar(email, senha);
    if (!r.ok) return setErro(r.erro);

    const papel = r.perfil === "aluno" ? PAPEL.ALUNO : r.perfil === "admin" ? PAPEL.ADMIN : null;
    // Membro pode ser recrutador ou representante — o destino de ambos é o
    // painel, então não precisamos derivar o papel exato aqui.
    navegar(local.state?.de || (papel ? destinoDoPapel(papel) : "/painel"), {
      replace: true,
    });
  };

  return (
    <main
      style={{
        display: "grid",
        placeItems: "start center",
        padding: "56px 24px 80px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center" }}>
          <Logo size={26} style={{ justifyContent: "center" }} />
          <h1
            style={{
              fontSize: "var(--fs-h1)",
              lineHeight: "var(--lh-h1)",
              letterSpacing: "var(--tr-h1)",
              marginTop: 24,
            }}
          >
            Entrar no NEXO
          </h1>
          <p style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-muted)", marginTop: 8 }}>
            Use o e-mail cadastrado na sua conta.
          </p>
        </div>

        <Card padding={26} style={{ marginTop: 26 }}>
          <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Input
              label="E-mail"
              type="email"
              icon="mail"
              placeholder="seu.email@universidade.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={erro && !email.trim() ? erro : ""}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            {erro && email.trim() ? (
              <p
                role="alert"
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: "var(--danger)",
                  background: "var(--danger-surface)",
                  border: "1px solid var(--danger)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 12px",
                }}
              >
                {erro}
              </p>
            ) : null}

            <Button type="submit" block size="lg" icon="arrow-right">
              Entrar
            </Button>
          </form>
        </Card>

        <div style={{ marginTop: 26 }}>
          <p
            style={{
              fontSize: "var(--fs-eyebrow)",
              letterSpacing: "var(--tr-eyebrow)",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "var(--green-700)",
              marginBottom: 12,
            }}
          >
            Contas de demonstração
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contasDemo.map((conta) => (
              <button
                key={conta.email}
                type="button"
                onClick={() => preencher(conta)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-default)",
                  background: "var(--paper)",
                  boxShadow: "var(--shadow-xs)",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: "var(--green-50)",
                    color: "var(--green-700)",
                    display: "grid",
                    placeItems: "center",
                    flex: "0 0 auto",
                  }}
                >
                  <Icon name={ICONE_DA_CONTA[conta.rotulo] || "user"} size={18} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 14.5,
                      fontWeight: 600,
                      color: "var(--text-heading)",
                    }}
                  >
                    {conta.rotulo}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    {conta.descricao}
                  </span>
                </span>
                <span style={{ color: "var(--green-600)", display: "inline-flex" }}>
                  <Icon name="arrow-right" size={16} />
                </span>
              </button>
            ))}
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 13.5,
            color: "var(--text-muted)",
            marginTop: 24,
          }}
        >
          Não tem conta?{" "}
          <Link to="/criar-conta" style={{ fontWeight: 600 }}>
            Criar agora
          </Link>
        </p>
      </div>
    </main>
  );
}
