import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../ds/core/Button.jsx";
import { Checkbox } from "../ds/forms/Checkbox.jsx";
import { Input } from "../ds/forms/Input.jsx";
import { Select } from "../ds/forms/Select.jsx";
import LayoutCadastro from "../componentes/LayoutCadastro.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { TIPO_INSTITUICAO } from "../dados/instituicoes.js";
import imagemRecrutador from "../assets/03-cadastro-recrutador-entrevista.jpg";
import imagemAcademico from "../assets/04-cadastro-academico-laboratorio.jpg";

/* Cadastro de quem publica — recrutador de empresa ou representante acadêmico.

   É a mesma tela para os dois porque, no modelo de dados, os dois são a mesma
   entidade: um membro vinculado a uma instituição. O papel é derivado do tipo
   da instituição escolhida, não informado pelo usuário.

   A conta nasce não verificada (RF03): publicar exige aprovação. */

const CONFIG = {
  recrutador: {
    eyebrow: "Conta de recrutador",
    titulo: "Criar conta da empresa",
    subtitulo:
      "Depois de verificada, sua empresa publica vagas de estágio e busca candidatos por universidade, curso, período e CR.",
    imagem: imagemRecrutador,
    imagemAlt: "Aperto de mãos ao fim de uma entrevista de emprego",
    tiposInstituicao: [TIPO_INSTITUICAO.EMPRESA],
    rotuloInstituicao: "Empresa",
    passos: [
      { titulo: "Confirmar a empresa", texto: "Conferimos os dados em até um dia útil." },
      { titulo: "Montar a vaga", texto: "Sete campos obrigatórios, sem anúncio incompleto." },
      { titulo: "Escolher universidades", texto: "Publique em uma ou em várias de uma vez." },
    ],
    nota: "Só empresas verificadas aparecem para os estudantes e acessam o banco de currículos.",
    notaIcone: "shield-check",
  },
  academico: {
    eyebrow: "Conta de representante acadêmico",
    titulo: "Criar conta de representante",
    subtitulo:
      "Para coordenações, departamentos, laboratórios, ligas acadêmicas e equipes de competição que publicam oportunidades internas.",
    imagem: imagemAcademico,
    imagemAlt: "Pesquisadora trabalhando em laboratório universitário",
    tiposInstituicao: [
      TIPO_INSTITUICAO.FACULDADE,
      TIPO_INSTITUICAO.DEPARTAMENTO,
      TIPO_INSTITUICAO.LIGA_ACADEMICA,
      TIPO_INSTITUICAO.EQUIPE_COMPETICAO,
    ],
    rotuloInstituicao: "Vínculo institucional",
    passos: [
      { titulo: "Confirmar o vínculo", texto: "Departamento, laboratório, liga ou equipe." },
      { titulo: "Criar a oportunidade", texto: "Carga horária, bolsa e prazo obrigatórios." },
      { titulo: "Triar candidatos", texto: "Filtre por curso, período e CR." },
    ],
    nota: "Suas oportunidades aparecem apenas para alunos da universidade a que seu vínculo pertence.",
    notaIcone: "graduation-cap",
  },
};

export default function CriarContaMembro({ tipoConta }) {
  const config = CONFIG[tipoConta];
  const { estado, criarContaMembro } = useEstado();
  const navegar = useNavigate();

  const instituicoes = useMemo(
    () =>
      estado.instituicoes
        .filter((i) => config.tiposInstituicao.includes(i.tipo))
        .map((i) => {
          const universidade = i.universidadeVinculada
            ? estado.instituicoes.find((u) => u.id === i.universidadeVinculada)
            : null;
          return {
            value: String(i.id),
            label: universidade ? `${i.nome} — ${universidade.sigla}` : i.nome,
          };
        }),
    [estado.instituicoes, config.tiposInstituicao],
  );

  const [form, setForm] = useState({
    nome: "",
    email: "",
    cargo: "",
    senha: "",
    instituicaoId: "",
    termos: false,
  });
  const [erros, setErros] = useState({});

  const mudar = (campo) => (evento) => {
    const valor =
      evento?.target?.type === "checkbox" ? evento.target.checked : evento.target.value;
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: "" }));
  };

  const validar = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = "Informe seu nome completo.";
    if (!form.email.trim()) e.email = "Informe seu e-mail institucional.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail inválido.";
    if (!form.cargo.trim()) e.cargo = "Informe seu cargo ou função.";
    if (form.senha.length < 8) e.senha = "A senha precisa de pelo menos 8 caracteres.";
    if (!form.instituicaoId) e.instituicaoId = `Escolha ${config.rotuloInstituicao.toLowerCase()}.`;
    if (!form.termos) e.termos = "É preciso aceitar os termos para criar a conta.";

    setErros(e);
    return Object.keys(e).length === 0;
  };

  const enviar = (evento) => {
    evento.preventDefault();
    if (!validar()) return;

    criarContaMembro(form);
    navegar("/painel", { replace: true });
  };

  return (
    <LayoutCadastro
      eyebrow={config.eyebrow}
      titulo={config.titulo}
      subtitulo={config.subtitulo}
      imagem={config.imagem}
      imagemAlt={config.imagemAlt}
      passos={config.passos}
      nota={config.nota}
      notaIcone={config.notaIcone}
    >
      <form onSubmit={enviar}>
        <div style={{ marginTop: 32 }}>
          <h2
            style={{
              fontSize: "var(--fs-h4)",
              paddingBottom: 12,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            Seus dados
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 16,
              marginTop: 16,
            }}
          >
            <Input
              label="Nome completo"
              placeholder={tipoConta === "recrutador" ? "Camila Duarte" : "Prof. Rafael Amorim"}
              value={form.nome}
              onChange={mudar("nome")}
              error={erros.nome}
            />
            <Input
              label={tipoConta === "recrutador" ? "E-mail corporativo" : "E-mail institucional"}
              type="email"
              placeholder={
                tipoConta === "recrutador"
                  ? "camila.duarte@visagio.com"
                  : "rafael.amorim@puc-rio.br"
              }
              value={form.email}
              onChange={mudar("email")}
              error={erros.email}
            />
            <Input
              label="Cargo ou função"
              placeholder={
                tipoConta === "recrutador" ? "Analista de gente e gestão" : "Professor associado"
              }
              value={form.cargo}
              onChange={mudar("cargo")}
              error={erros.cargo}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo de 8 caracteres"
              value={form.senha}
              onChange={mudar("senha")}
              error={erros.senha}
            />
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <h2
            style={{
              fontSize: "var(--fs-h4)",
              paddingBottom: 12,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            {config.rotuloInstituicao}
          </h2>
          <div style={{ marginTop: 16, maxWidth: 520 }}>
            <Select
              label={config.rotuloInstituicao}
              options={[
                { value: "", label: "Selecione" },
                ...instituicoes,
              ]}
              value={form.instituicaoId}
              onChange={mudar("instituicaoId")}
              hint={
                erros.instituicaoId ||
                (tipoConta === "recrutador"
                  ? "Sua conta fica vinculada a esta empresa."
                  : "Define a universidade cujos alunos verão suas oportunidades.")
              }
            />
          </div>
        </div>

        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          <Checkbox
            label="Aceito os termos de uso e a política de privacidade"
            checked={form.termos}
            onChange={mudar("termos")}
          />
          {erros.termos ? (
            <p role="alert" style={{ fontSize: 13, color: "var(--danger)" }}>
              {erros.termos}
            </p>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 28,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button type="submit" size="lg" icon="arrow-right">
            Criar conta
          </Button>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            A verificação leva até um dia útil.
          </span>
        </div>
      </form>
    </LayoutCadastro>
  );
}
