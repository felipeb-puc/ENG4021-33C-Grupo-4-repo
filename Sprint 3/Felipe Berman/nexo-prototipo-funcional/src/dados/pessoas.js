/* Pessoas: alunos e membros de instituição.

   Espelha os models `Aluno` (com os campos novos `cr` e
   `visivelParaRecrutadores`) e `MembroInstituicao` da proposta de modelo de
   dados — M2, M4, M5 e M8.

   `visivelParaRecrutadores` é o consentimento que resolve o conflito entre o
   banco de talentos e o RNF03: só quem liga aparece em busca de recrutador.
   Alguns alunos aqui estão com o consentimento desligado de propósito, para
   que dê para verificar que a regra funciona. */

export const alunos = [
  {
    id: 1,
    nome: "Isabela Corrêa",
    email: "isabela.correa@aluno.puc-rio.br",
    universidadeId: 1,
    matricula: "2410123",
    cursoId: 1,
    periodo: 5,
    cr: 8.4,
    visivelParaRecrutadores: true,
    foto: "05-perfil-estudante-retrato.jpg",
    resumo:
      "Monitora de Cálculo e integrante da Liga de Empreendedorismo. Busca estágio em operações.",
    areasInteresse: ["Operações", "Dados", "Consultoria"],
    habilidades: ["Excel avançado", "Power BI", "SQL básico", "Inglês fluente", "Lean"],
    experiencias: [
      {
        tipo: "formacao",
        titulo: "Engenharia de Produção — PUC-Rio",
        organizacao: "PUC-Rio",
        descricao: "5º período, ingresso em 2024.1.",
        inicio: "2024-02-01",
        fim: null,
      },
      {
        tipo: "academica",
        titulo: "Monitora de Cálculo a Várias Variáveis",
        organizacao: "Departamento de Matemática",
        descricao:
          "Plantão de dúvidas e correção de listas para duas turmas do diurno, 12h por semana.",
        inicio: "2026-03-01",
        fim: null,
      },
      {
        tipo: "academica",
        titulo: "Liga de Empreendedorismo — diretoria de projetos",
        organizacao: "Liga de Empreendedorismo",
        descricao: "Condução de dois projetos de consultoria com empresas parceiras do Rio.",
        inicio: "2025-03-01",
        fim: "2026-02-01",
      },
      {
        tipo: "profissional",
        titulo: "Jovem aprendiz",
        organizacao: "Opportunity",
        descricao:
          "Apoio na rotina de conciliação e nos relatórios da área de operações.",
        inicio: "2023-06-01",
        fim: "2024-06-01",
      },
    ],
  },
  {
    id: 2,
    nome: "Lucas Moreira",
    email: "lucas.moreira@aluno.puc-rio.br",
    universidadeId: 1,
    matricula: "2310455",
    cursoId: 2,
    periodo: 6,
    cr: 8.9,
    visivelParaRecrutadores: true,
    foto: "",
    resumo: "IC em visão computacional e eletrônica embarcada na Fórmula SAE.",
    areasInteresse: ["Dados", "Tecnologia"],
    habilidades: ["Python", "C", "Machine learning", "Git"],
    experiencias: [
      {
        tipo: "formacao",
        titulo: "Engenharia da Computação — PUC-Rio",
        organizacao: "PUC-Rio",
        descricao: "6º período.",
        inicio: "2023-08-01",
        fim: null,
      },
      {
        tipo: "academica",
        titulo: "Iniciação científica em visão computacional",
        organizacao: "Departamento de Informática",
        descricao: "Detecção de defeitos em imagens de linha de produção.",
        inicio: "2025-08-01",
        fim: null,
      },
    ],
  },
  {
    id: 3,
    nome: "Beatriz Farias",
    email: "beatriz.farias@aluno.puc-rio.br",
    universidadeId: 1,
    matricula: "2420188",
    cursoId: 4,
    periodo: 4,
    cr: 7.8,
    visivelParaRecrutadores: true,
    foto: "",
    resumo:
      "Diretoria de conteúdo da Liga de Finanças, com rotina de relatórios semanais de mercado.",
    areasInteresse: ["Finanças", "Dados"],
    habilidades: ["SQL", "Análise de dados", "Excel avançado"],
    experiencias: [
      {
        tipo: "formacao",
        titulo: "Economia — PUC-Rio",
        organizacao: "PUC-Rio",
        descricao: "4º período.",
        inicio: "2024-08-01",
        fim: null,
      },
      {
        tipo: "academica",
        titulo: "Liga de Finanças — diretoria de conteúdo",
        organizacao: "Liga de Finanças",
        descricao: "Relatórios semanais de mercado e publicações da liga.",
        inicio: "2025-03-01",
        fim: null,
      },
    ],
  },
  {
    id: 4,
    nome: "Rafael Sampaio",
    email: "rafael.sampaio@aluno.puc-rio.br",
    universidadeId: 1,
    matricula: "2210099",
    cursoId: 1,
    periodo: 7,
    cr: 8.1,
    visivelParaRecrutadores: true,
    foto: "",
    resumo: "Estágio anterior em melhoria contínua, com projeto de redução de setup.",
    areasInteresse: ["Operações", "Indústria"],
    habilidades: ["Lean", "Power BI", "Seis Sigma"],
    experiencias: [
      {
        tipo: "formacao",
        titulo: "Engenharia de Produção — PUC-Rio",
        organizacao: "PUC-Rio",
        descricao: "7º período.",
        inicio: "2022-08-01",
        fim: null,
      },
      {
        tipo: "profissional",
        titulo: "Estágio em melhoria contínua",
        organizacao: "Nortec Indústria",
        descricao: "Projeto de redução de tempo de setup na linha de montagem.",
        inicio: "2025-01-01",
        fim: "2026-01-01",
      },
    ],
  },
  {
    id: 5,
    nome: "Marina Tavares",
    email: "marina.tavares@aluno.puc-rio.br",
    universidadeId: 1,
    matricula: "2510321",
    cursoId: 2,
    periodo: 3,
    cr: 9.1,
    // Consentimento desligado: não deve aparecer no banco de talentos.
    visivelParaRecrutadores: false,
    foto: "",
    resumo: "Monitora de Programação I, primeira busca de estágio em dados.",
    areasInteresse: ["Dados", "Tecnologia"],
    habilidades: ["Python", "Git"],
    experiencias: [
      {
        tipo: "formacao",
        titulo: "Engenharia da Computação — PUC-Rio",
        organizacao: "PUC-Rio",
        descricao: "3º período.",
        inicio: "2025-02-01",
        fim: null,
      },
      {
        tipo: "academica",
        titulo: "Monitora de Programação I",
        organizacao: "Departamento de Informática",
        descricao: "Laboratório e correção de trabalhos em Python.",
        inicio: "2026-03-01",
        fim: null,
      },
    ],
  },
  {
    id: 6,
    nome: "André Coutinho",
    email: "andre.coutinho@aluno.puc-rio.br",
    universidadeId: 1,
    matricula: "2320777",
    cursoId: 4,
    periodo: 6,
    cr: 7.2,
    visivelParaRecrutadores: true,
    foto: "",
    resumo: "Equipe de Robótica e IC em métodos quantitativos aplicados a crédito.",
    areasInteresse: ["Finanças", "Dados"],
    habilidades: ["R", "Econometria", "Python"],
    experiencias: [
      {
        tipo: "formacao",
        titulo: "Economia — PUC-Rio",
        organizacao: "PUC-Rio",
        descricao: "6º período.",
        inicio: "2023-08-01",
        fim: null,
      },
    ],
  },

  // --- UFRJ: existem para provar que o escopo por universidade funciona ---
  {
    id: 7,
    nome: "Juliana Peixoto",
    email: "juliana.peixoto@ufrj.br",
    universidadeId: 2,
    matricula: "119045233",
    cursoId: 1,
    periodo: 6,
    cr: 8.6,
    visivelParaRecrutadores: true,
    foto: "",
    resumo: "IC em otimização de rotas na COPPE, interesse em logística.",
    areasInteresse: ["Operações", "Logística"],
    habilidades: ["Python", "Pesquisa operacional", "SQL"],
    experiencias: [
      {
        tipo: "formacao",
        titulo: "Engenharia de Produção — UFRJ",
        organizacao: "Universidade Federal do Rio de Janeiro",
        descricao: "6º período.",
        inicio: "2023-03-01",
        fim: null,
      },
    ],
  },
  {
    id: 8,
    nome: "Pedro Henrique Alves",
    email: "pedro.alves@ufrj.br",
    universidadeId: 2,
    matricula: "120088741",
    cursoId: 3,
    periodo: 4,
    cr: 7.4,
    visivelParaRecrutadores: true,
    foto: "",
    resumo: "Minerva Rockets, subsistema de propulsão.",
    areasInteresse: ["Tecnologia", "Indústria"],
    habilidades: ["C", "Simulação", "MATLAB"],
    experiencias: [
      {
        tipo: "formacao",
        titulo: "Ciência da Computação — UFRJ",
        organizacao: "Universidade Federal do Rio de Janeiro",
        descricao: "4º período.",
        inicio: "2024-03-01",
        fim: null,
      },
    ],
  },

  // --- UERJ ---
  {
    id: 9,
    nome: "Carolina Diniz",
    email: "carolina.diniz@uerj.br",
    universidadeId: 3,
    matricula: "20211033",
    cursoId: 4,
    periodo: 5,
    cr: 8.0,
    visivelParaRecrutadores: true,
    foto: "",
    resumo: "Monitora de Cálculo I no IME, interesse em economia aplicada.",
    areasInteresse: ["Finanças", "Dados"],
    habilidades: ["Excel avançado", "R"],
    experiencias: [
      {
        tipo: "formacao",
        titulo: "Economia — UERJ",
        organizacao: "Universidade do Estado do Rio de Janeiro",
        descricao: "5º período.",
        inicio: "2023-08-01",
        fim: null,
      },
    ],
  },
];

/* Membros de instituição — quem publica em nome de uma instituição.
   O papel não é um campo: é derivado do tipo da instituição (M2). */
export const membros = [
  {
    id: 1,
    nome: "Camila Duarte",
    email: "camila.duarte@visagio.com",
    instituicaoId: 50, // Visagio (empresa) -> recrutadora
    cargo: "Analista de gente e gestão",
    verificado: true,
  },
  {
    id: 2,
    nome: "Prof. Rafael Amorim",
    email: "rafael.amorim@puc-rio.br",
    instituicaoId: 11, // Departamento de Informática -> representante acadêmico
    cargo: "Professor associado",
    verificado: true,
  },
  {
    id: 3,
    nome: "Rodrigo Paes",
    email: "estagio@opportunity.com.br",
    instituicaoId: 51, // Opportunity (empresa)
    cargo: "Coordenador de BI",
    // Ainda não verificada: serve para verificar o bloqueio do RF03.
    verificado: false,
  },
  {
    id: 4,
    nome: "Marina Duarte",
    email: "selecao@ligaempreende.org",
    instituicaoId: 30, // Liga de Empreendedorismo -> representante acadêmico
    cargo: "Diretora de gente",
    verificado: true,
  },
];

export const acharAluno = (id) => alunos.find((a) => a.id === Number(id)) || null;
export const acharMembro = (id) => membros.find((m) => m.id === Number(id)) || null;
