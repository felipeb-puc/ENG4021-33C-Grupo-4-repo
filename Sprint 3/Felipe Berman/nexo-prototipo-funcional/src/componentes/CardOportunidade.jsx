import { Link } from "react-router-dom";

import { Badge } from "../ds/core/Badge.jsx";
import { Card } from "../ds/core/Card.jsx";
import { Icon } from "../ds/core/Icon.jsx";
import { IconButton } from "../ds/core/IconButton.jsx";
import { ROTULO_MODALIDADE, ROTULO_TIPO } from "../dados/oportunidades.js";
import { diasAte, textoPrazo } from "../regras/datas.js";
import { useEstado } from "../estado/EstadoProvider.jsx";
import logos from "../assets/logos.js";

/* Card de oportunidade.

   Mostra os fatos que as entrevistas apontaram como sempre ausentes nos
   anúncios — carga horária, bolsa, modalidade e prazo — direto no card, sem
   precisar abrir. É o "anúncio completo" que dá nome à proposta. */

export default function CardOportunidade({ oportunidade: o }) {
  const { estado, ehFavorito, alternarFavorito } = useEstado();

  const instituicao = estado.instituicoes.find((i) => i.id === o.instituicaoId);
  const favorito = ehFavorito(o.id);
  const dias = diasAte(o.prazoInscricao);
  const urgente = dias !== null && dias >= 0 && dias <= 7;

  const fatos = [
    { icone: "clock", texto: `${o.cargaHorariaSemanal}h por semana` },
    {
      icone: "wallet",
      texto: o.remunerada
        ? `R$ ${o.valorBolsa.toLocaleString("pt-BR")} por mês`
        : "Voluntária, com certificado",
    },
    { icone: "building-2", texto: ROTULO_MODALIDADE[o.modalidade] },
  ];

  return (
    <Card
      interactive
      padding={22}
      style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <Badge tone="neutral">{ROTULO_TIPO[o.tipo]}</Badge>
        <IconButton
          name={favorito ? "bookmark-check" : "bookmark"}
          label={favorito ? "Remover dos favoritos" : "Salvar para depois"}
          variant="outline"
          size="sm"
          onClick={() => alternarFavorito(o.id)}
        />
      </div>

      <Link to={`/oportunidade/${o.id}`} className="sem-sublinhado">
        <h3
          style={{
            fontSize: "var(--fs-h3)",
            lineHeight: "var(--lh-h3)",
            letterSpacing: "var(--tr-h3)",
          }}
        >
          {o.titulo}
        </h3>
      </Link>

      {/* Link próprio: <a> dentro de <a> é HTML inválido. */}
      <Link
        to={`/instituicao/${o.instituicaoId}`}
        className="sem-sublinhado"
        style={{ alignSelf: "flex-start", marginTop: -6 }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {logos[instituicao?.logo] ? (
            <img
              src={logos[instituicao.logo]}
              alt=""
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                objectFit: "contain",
                background: "var(--paper)",
                border: "1px solid var(--border-subtle)",
                padding: 2,
              }}
            />
          ) : null}
          <span style={{ fontSize: 14.5, color: "var(--green-600)" }}>{instituicao?.nome}</span>
        </span>
      </Link>

      <ul style={{ display: "flex", flexDirection: "column", gap: 7, padding: 0, listStyle: "none" }}>
        {fatos.map((f) => (
          <li key={f.texto} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--green-500)", display: "inline-flex" }}>
              <Icon name={f.icone} size={14} />
            </span>
            <span style={{ fontSize: 14, color: "var(--text-body)" }}>{f.texto}</span>
          </li>
        ))}
      </ul>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 12,
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: urgente ? 600 : 400,
            color: urgente ? "var(--warning)" : "var(--text-muted)",
          }}
        >
          {textoPrazo(o.prazoInscricao)}
        </span>
        <Link
          to={`/oportunidade/${o.id}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600 }}
        >
          Ver <Icon name="arrow-right" size={15} />
        </Link>
      </div>
    </Card>
  );
}
