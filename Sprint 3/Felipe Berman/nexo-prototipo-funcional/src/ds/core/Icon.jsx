import React from "react";
import * as lucide from "lucide-react";

/* Ícone Lucide, traço 2px, herdando currentColor — regra do design system NEXO.

   A versão original do design system buscava cada SVG de um CDN em runtime, o
   que dependia de rede, piscava enquanto carregava e injetava markup remoto com
   dangerouslySetInnerHTML. Aqui os ícones vêm do pacote lucide-react.

   A API (name em kebab-case, size, strokeWidth, style) é a mesma de antes, para
   que os demais componentes do design system continuem funcionando sem
   alteração. O import por namespace traz a biblioteca inteira, o que aumenta o
   bundle — aceitável num protótipo e o que mantém qualquer nome de ícone
   funcionando sem catálogo manual. */

const cache = new Map();

function pascal(name) {
  return String(name)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join("");
}

/* Nomes que mudaram entre versões do Lucide. O design system foi escrito com os
   nomes antigos; mapeamos para os atuais para não quebrar as telas. */
const aliases = {
  CheckCircle: "CircleCheck",
  AlertCircle: "CircleAlert",
  AlertTriangle: "TriangleAlert",
  CalendarCheck: "CalendarCheck",
  XCircle: "CircleX",
  HelpCircle: "CircleHelp",
};

function resolver(name) {
  if (cache.has(name)) return cache.get(name);

  const base = pascal(name);
  const componente =
    lucide[base] || lucide[aliases[base]] || lucide[`${base}Icon`] || null;

  cache.set(name, componente);
  return componente;
}

export function Icon({ name, size = 20, strokeWidth = 2, style, ...rest }) {
  const Glifo = resolver(name);

  const estilo = {
    display: "inline-block",
    flex: "0 0 auto",
    verticalAlign: "middle",
    ...style,
  };

  // Nome desconhecido: reserva o espaço em vez de quebrar o layout da tela.
  if (!Glifo) {
    return <span aria-hidden="true" style={{ ...estilo, width: size, height: size }} />;
  }

  return (
    <Glifo
      aria-hidden="true"
      {...rest}
      size={size}
      strokeWidth={strokeWidth}
      style={estilo}
    />
  );
}
