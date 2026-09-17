import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../ds/core/Button.jsx";
import { Checkbox } from "../ds/forms/Checkbox.jsx";
import { Input } from "../ds/forms/Input.jsx";
import { Select } from "../ds/forms/Select.jsx";
import LayoutCadastro from "../componentes/LayoutCadastro.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { cursosDaUniversidade } from "../dados/cursos.js";
import { TIPO_INSTITUICAO } from "../dados/instituicoes.js";
import imagem from "../assets/02-cadastro-estudante-grupo-estudo.jpg";

/* Cadastro de estudante.

   A universidade é escolhida AQUI e só aqui: é ela que determina tudo que a
   pessoa enxerga depois. Trocar de universidade não é um seletor de interface —
   mudaria o escopo inteiro da conta.

   O select de curso é alimentado pela universidade escolhida, então nunca
   aparece um curso que aquela universidade não oferece. */

const PASSOS = [
  { titulo: "Escolher a universidade", texto: "Você vê só o que é da sua instituição." },
  { titulo: "Completar o currículo", texto: "Formação, monitorias, ligas e habilidades." },
  { titulo: "Candidatar-se em um clique", texto: "Sem repetir dados a cada anúncio." },
];

const PERIODOS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}º período`,
}));

export default function CriarContaAluno() {
  const { estado, criarContaAluno } = useEstado();
  const navegar = useNavigate();

  const universidades = useMemo(
    () => estado.instituicoes.filter((i) => i.tipo === TIPO_INSTITUICAO.FACULDADE),
    [estado.instituicoes],
  );

  const [form, setForm] = useState({
    nome: "",
    email: "",
    matricula: "",
    senha: "",
    universidadeId: String(universidades[0]?.id ?? ""),
    cursoId: "",
    periodo: "1",
    cr: "",
    visivelParaRecrutadores: true,
    termos: false,
  });
  const [erros, setErros] = useState({});

  const cursos = useMemo(() => {
    const id = Number(form.universidadeId);
    return id ? cursosDaUniversidade(id) : [];
  }, [form.universidadeId]);

  const mudar = (campo) => (evento) => {
    const valor =
      evento?.target?.type === "checkbox" ? evento.target.checked : evento.target.value;

    setForm((f) => {
      // Trocar de universidade invalida o curso escolhido: o curso pertence à
      // universidade.
      if (campo === "universidadeId") return { ...f, universidadeId: valor, cursoId: "" };
      return { ...f, [campo]: valor };
    });
    setErros((e) => ({ ...e, [campo]: "" }));
  };

  const validar = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = "Informe seu nome completo.";
    if (!form.email.trim()) e.email = "Informe seu e-mail acadêmico.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail inválido.";
    if (!form.matricula.trim()) e.matricula = "Informe sua matrícula.";
    if (form.senha.length < 8) e.senha = "A senha precisa de pelo menos 8 caracteres.";
    if (!form.universidadeId) e.universidadeId = "Escolha sua universidade.";
    if (!form.cursoId) e.cursoId = "Escolha seu curso.";

    if (form.cr !== "") {
      const cr = Number(form.cr.replace(",", "."));
      if (Number.isNaN(cr) || cr < 0 || cr > 10) e.cr = "O CR vai de 0 a 10.";
    }

    if (!form.termos) e.termos = "É preciso aceitar os termos para criar a conta.";

    setErros(e);
    return Object.keys(e).length === 0;
  };

  const enviar = (evento) => {
    evento.preventDefault();
    if (!validar()) return;

    criarContaAluno({
      ...form,
      cr: form.cr === "" ? null : Number(form.cr.replace(",", ".")),
    });
    navegar("/inicio", { replace: true });
  };

  return (
    <LayoutCadastro
      eyebrow="Conta de estudante"
      titulo="Criar sua conta de estudante"
      subtitulo="Com esses dados o NEXO já mostra apenas as oportunidades que a sua universidade alcança e que combinam com seu curso e período."
      imagem={imagem}
      imagemAlt="Estudantes estudando juntos em uma mesa comprida"
      passos={PASSOS}
      nota="Seu currículo do NEXO é montado a partir dessas informações e enviado quando você se candidata."
      notaIcone="file-text"
    >
      <form onSubmit={enviar}>
        <Secao titulo="Dados pessoais">
          <Input
            label="Nome completo"
            placeholder="Isabela Corrêa"
            value={form.nome}
            onChange={mudar("nome")}
            error={erros.nome}
          />
          <Input
            label="E-mail acadêmico"
            type="email"
            placeholder="isabela.correa@aluno.puc-rio.br"
            value={form.email}
            onChange={mudar("email")}
            error={erros.email}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo de 8 caracteres"
            hint="Use letras e números."
            value={form.senha}
            onChange={mudar("senha")}
            error={erros.senha}
          />
          <Input
            label="Matrícula"
            placeholder="2410123"
            value={form.matricula}
            onChange={mudar("matricula")}
            error={erros.matricula}
          />
        </Secao>

        <Secao
          titulo="Vida acadêmica"
          aviso="A universidade define tudo que você vê na plataforma e não pode ser trocada depois."
        >
          <Select
            label="Universidade"
            options={universidades.map((u) => ({ value: String(u.id), label: u.nome }))}
            value={form.universidadeId}
            onChange={mudar("universidadeId")}
            hint="Escolha definitiva."
          />
          <Select
            label="Curso"
            options={[
              { value: "", label: "Selecione o curso" },
              ...cursos.map((c) => ({ value: String(c.id), label: c.nome })),
            ]}
            value={form.cursoId}
            onChange={mudar("cursoId")}
            hint={
              erros.cursoId
                ? erros.cursoId
                : `${cursos.length} cursos nesta universidade`
            }
          />
          <Select
            label="Período atual"
            options={PERIODOS}
            value={form.periodo}
            onChange={mudar("periodo")}
          />
          <Input
            label="CR (opcional)"
            placeholder="8,4"
            hint="De 0 a 10. Algumas oportunidades exigem CR mínimo."
            value={form.cr}
            onChange={mudar("cr")}
            error={erros.cr}
          />
        </Secao>

        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          <Checkbox
            label="Quero aparecer em buscas de recrutadores"
            description="Empresas e coordenações podem encontrar seu perfil. Seu currículo completo continua visível apenas para quem você se candidatou. Dá para desligar quando quiser."
            checked={form.visivelParaRecrutadores}
            onChange={mudar("visivelParaRecrutadores")}
          />
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
            Leva menos de dois minutos.
          </span>
        </div>
      </form>
    </LayoutCadastro>
  );
}

function Secao({ titulo, aviso, children }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h2
        style={{
          fontSize: "var(--fs-h4)",
          paddingBottom: 12,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {titulo}
      </h2>
      {aviso ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>{aviso}</p>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(230px, 100%), 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}
