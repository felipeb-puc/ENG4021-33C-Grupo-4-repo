import { useState } from "react";

import { Button } from "../ds/core/Button.jsx";
import { Card } from "../ds/core/Card.jsx";
import { IconButton } from "../ds/core/IconButton.jsx";
import { Tag } from "../ds/core/Tag.jsx";
import { Toast } from "../ds/feedback/Toast.jsx";
import { Input } from "../ds/forms/Input.jsx";
import { Select } from "../ds/forms/Select.jsx";
import { Switch } from "../ds/forms/Switch.jsx";
import { Tabs } from "../ds/navigation/Tabs.jsx";
import AreaTexto from "../componentes/AreaTexto.jsx";
import Curriculo from "../componentes/Curriculo.jsx";
import { useEstado } from "../estado/EstadoProvider.jsx";
import { ROTULO_EXPERIENCIA, TIPO_EXPERIENCIA } from "../regras/filtros.js";
import { experienciaEmBranco, LIMITE_RESUMO, perfilParaFormulario } from "../regras/perfil.js";
import { nomeDoCurso } from "../dados/cursos.js";

/* Perfil e currículo do aluno (RF05).

   A aba "Como recrutadores veem" usa o mesmo componente que o painel de quem
   publica — o que aparece ali é literalmente o que a outra ponta recebe.

   O consentimento fica no topo, não escondido no fim do formulário: é a
   decisão com mais consequência da tela (define se a pessoa aparece no banco
   de talentos), então precisa ser lida antes do resto. */

const PERIODOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const ABA = { EDITAR: "editar", VER: "ver" };

export default function Perfil() {
  const { estado, usuario, salvarPerfil } = useEstado();
  const aluno = usuario.aluno;
  const [aba, setAba] = useState(ABA.EDITAR);
  const [form, setForm] = useState(() => perfilParaFormulario(aluno));
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);

  const uni = estado.instituicoes.find((i) => i.id === aluno.universidadeId);
  const mudar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };
  const mudarExperiencia = (i, campo, valor) => {
    mudar("experiencias", form.experiencias.map((x, j) => (j === i ? { ...x, [campo]: valor } : x)));
    setErros((e) => ({ ...e, [`experiencias.${i}`]: undefined }));
  };

  const salvar = () => {
    const r = salvarPerfil(form);
    if (r.ok) {
      setErros({});
      setAviso({ tom: "success", titulo: "Perfil salvo", msg: form.visivelParaRecrutadores ? "Você aparece no banco de talentos." : "Você não aparece no banco de talentos." });
    } else {
      setErros(r.erros);
      setAviso({ tom: "danger", titulo: "Revise os campos marcados", msg: "Nada foi salvo ainda." });
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 40px 80px" }}>
      <h1 style={{ fontSize: "var(--fs-h1)" }}>Perfil e currículo</h1>

      <Tabs
        style={{ marginTop: 24 }}
        value={aba}
        onChange={setAba}
        items={[
          { value: ABA.EDITAR, label: "Editar" },
          { value: ABA.VER, label: "Como recrutadores veem" },
        ]}
      />

      {aba === ABA.VER ? (
        <div style={{ marginTop: 24 }}>
          {!aluno.visivelParaRecrutadores ? (
            <Card tone="tint" padding={16} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: "var(--green-800)" }}>
                Você está fora do banco de talentos. Só vê este currículo quem recebeu uma candidatura sua.
              </p>
            </Card>
          ) : null}
          <Curriculo aluno={aluno} />
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>Mostra a última versão salva.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
          <Card padding={22}>
            <Switch
              label="Aparecer no banco de talentos"
              checked={form.visivelParaRecrutadores}
              onChange={(e) => mudar("visivelParaRecrutadores", e.target.checked)}
            />
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--text-muted)", marginTop: 10 }}>
              Ligado: recrutadores de empresas e representantes da {uni?.nome} podem encontrar seu currículo em buscas.
              Desligado: só vê seu currículo quem recebeu uma candidatura sua.
            </p>
          </Card>

          <Card padding={22} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: "var(--fs-h3)" }}>Dados acadêmicos</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              {uni?.nome} · {nomeDoCurso(aluno.cursoId)} · matrícula {aluno.matricula}. Universidade e curso vêm do cadastro e não são editáveis.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <Select label="Período" value={form.periodo} onChange={(e) => mudar("periodo", e.target.value)}
                options={PERIODOS.map((p) => ({ value: String(p), label: `${p}º período` }))} />
              <Input label="CR" type="number" step="0.1" min="0" max="10" hint="Opcional. Algumas vagas exigem." value={form.cr} error={erros.cr} onChange={(e) => mudar("cr", e.target.value)} />
            </div>
            {erros.periodo ? <span style={{ fontSize: "var(--fs-caption)", color: "var(--danger)" }}>{erros.periodo}</span> : null}
            <AreaTexto label="Resumo" linhas={4} value={form.resumo} error={erros.resumo}
              hint={`${form.resumo.length}/${LIMITE_RESUMO}`} onChange={(v) => mudar("resumo", v)} />
          </Card>

          <Card padding={22} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <ListaDeTags titulo="Áreas de interesse" itens={form.areasInteresse} onChange={(v) => mudar("areasInteresse", v)} placeholder="Ex.: Dados" />
            <ListaDeTags titulo="Habilidades" itens={form.habilidades} onChange={(v) => mudar("habilidades", v)} placeholder="Ex.: Power BI" />
          </Card>

          <Card padding={22} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <h2 style={{ fontSize: "var(--fs-h3)" }}>Experiências e formação</h2>
              <Button size="sm" variant="outline" iconLeft="plus" onClick={() => mudar("experiencias", [...form.experiencias, experienciaEmBranco()])}>
                Adicionar
              </Button>
            </div>
            {form.experiencias.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Nenhuma experiência ainda.</p>
            ) : null}
            {form.experiencias.map((x, i) => (
              <Card key={i} tone="tint" padding={16} style={{ display: "flex", flexDirection: "column", gap: 12 }} data-experiencia={i}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, alignItems: "end" }}>
                  <Select size="sm" label="Tipo" value={x.tipo} onChange={(e) => mudarExperiencia(i, "tipo", e.target.value)}
                    options={Object.values(TIPO_EXPERIENCIA).map((t) => ({ value: t, label: ROTULO_EXPERIENCIA[t] }))} />
                  <Input size="sm" label="Título" value={x.titulo} onChange={(e) => mudarExperiencia(i, "titulo", e.target.value)} />
                  <Input size="sm" label="Organização" value={x.organizacao} onChange={(e) => mudarExperiencia(i, "organizacao", e.target.value)} />
                  <Input size="sm" label="Início" type="date" value={x.inicio} onChange={(e) => mudarExperiencia(i, "inicio", e.target.value)} />
                  <Input size="sm" label="Fim" type="date" hint="Vazio = atual" value={x.fim} onChange={(e) => mudarExperiencia(i, "fim", e.target.value)} />
                </div>
                <AreaTexto label="Descrição" linhas={2} value={x.descricao || ""} onChange={(v) => mudarExperiencia(i, "descricao", v)} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "var(--fs-caption)", color: "var(--danger)" }}>{erros[`experiencias.${i}`] || ""}</span>
                  <Button size="sm" variant="ghost" iconLeft="trash-2" onClick={() => mudar("experiencias", form.experiencias.filter((_, j) => j !== i))}>
                    Remover
                  </Button>
                </div>
              </Card>
            ))}
          </Card>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={salvar}>Salvar perfil</Button>
          </div>
        </div>
      )}

      {aviso ? (
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 60 }}>
          <Toast tone={aviso.tom} title={aviso.titulo} message={aviso.msg} onClose={() => setAviso(null)} />
        </div>
      ) : null}
    </main>
  );
}

function ListaDeTags({ titulo, itens, onChange, placeholder }) {
  const [novo, setNovo] = useState("");
  const adicionar = () => {
    const t = novo.trim();
    if (t && !itens.includes(t)) onChange([...itens, t]);
    setNovo("");
  };
  return (
    <div>
      <span style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-semibold)" }}>{titulo}</span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
        {itens.map((t) => (
          <Tag key={t} onRemove={() => onChange(itens.filter((x) => x !== t))}>{t}</Tag>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", maxWidth: 360 }}>
        <Input size="sm" aria-label={`Adicionar ${titulo.toLowerCase()}`} placeholder={placeholder} value={novo} style={{ flex: 1 }}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }} />
        <IconButton name="plus" label={`Adicionar a ${titulo.toLowerCase()}`} variant="outline" size="sm" onClick={adicionar} />
      </div>
    </div>
  );
}
