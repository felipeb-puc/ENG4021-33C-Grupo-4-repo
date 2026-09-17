import { useNavigate } from "react-router-dom";

import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Icon } from "../ds/core/Icon.jsx";

/* Marcador honesto para telas que ainda não foram construídas.

   Existe para que a navegação nunca leve a uma tela quebrada enquanto as etapas
   seguintes do plano não chegam — e para deixar explícito em que etapa cada
   tela entra, em vez de fingir que a funcionalidade existe. */

export default function EmBreve({ titulo, etapa }) {
  const navegar = useNavigate();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "80px 40px" }}>
      <Card tone="tint" padding={40} style={{ textAlign: "center" }}>
        <span
          style={{
            width: 52,
            height: 52,
            borderRadius: 999,
            background: "var(--paper)",
            border: "1px solid var(--green-100)",
            color: "var(--green-700)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto",
          }}
        >
          <Icon name="hammer" size={22} />
        </span>

        <h1 style={{ fontSize: "var(--fs-h2)", color: "var(--green-900)", marginTop: 18 }}>
          {titulo}
        </h1>
        <p
          style={{
            fontSize: 14.5,
            lineHeight: 1.6,
            color: "var(--green-800)",
            marginTop: 10,
            maxWidth: 420,
            marginInline: "auto",
          }}
        >
          Esta tela entra na etapa {etapa} do plano. A navegação e as permissões já
          funcionam — o conteúdo é o que falta.
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
          <Button variant="outline" size="sm" iconLeft="arrow-left" onClick={() => navegar(-1)}>
            Voltar
          </Button>
        </div>
      </Card>
    </main>
  );
}
