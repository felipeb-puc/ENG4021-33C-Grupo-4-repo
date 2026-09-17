/* Instituições — quem publica oportunidade.
   Espelha o model `Instituicao` (proposta de modelo de dados, M1).

   O campo `universidadeVinculada` é o que torna possível a regra central do
   produto: uma liga, equipe ou departamento da PUC só aparece para aluno da
   PUC. Faculdades e empresas têm esse campo nulo. */

export const TIPO_INSTITUICAO = {
  FACULDADE: "faculdade",
  DEPARTAMENTO: "departamento",
  LIGA_ACADEMICA: "liga_academica",
  EQUIPE_COMPETICAO: "equipe_competicao",
  EMPRESA: "empresa",
};

/* Tipos que representam uma organização interna de uma universidade.
   Todos exigem `universidadeVinculada`. */
export const TIPOS_INTERNOS = [
  TIPO_INSTITUICAO.DEPARTAMENTO,
  TIPO_INSTITUICAO.LIGA_ACADEMICA,
  TIPO_INSTITUICAO.EQUIPE_COMPETICAO,
];

export const instituicoes = [
  // --- Universidades ---------------------------------------------------
  {
    id: 1,
    nome: "PUC-Rio",
    tipo: TIPO_INSTITUICAO.FACULDADE,
    sigla: "PUC",
    cidade: "Rio de Janeiro, RJ",
    site: "https://www.puc-rio.br",
    logo: "pucrio.png",
    descricao:
      "Pontifícia Universidade Católica do Rio de Janeiro. Universidade privada com cursos de graduação em engenharia, ciências sociais, direito e economia.",
    universidadeVinculada: null,
  },
  {
    id: 2,
    nome: "Universidade Federal do Rio de Janeiro",
    tipo: TIPO_INSTITUICAO.FACULDADE,
    sigla: "UFRJ",
    cidade: "Rio de Janeiro, RJ",
    site: "https://ufrj.br",
    logo: "ufrj.svg",
    descricao:
      "Maior universidade federal do país, com forte tradição em pesquisa e iniciação científica.",
    universidadeVinculada: null,
  },
  {
    id: 3,
    nome: "Universidade do Estado do Rio de Janeiro",
    tipo: TIPO_INSTITUICAO.FACULDADE,
    sigla: "UERJ",
    cidade: "Rio de Janeiro, RJ",
    site: "https://www.uerj.br",
    logo: "uerj.svg",
    descricao:
      "Universidade estadual com campus no Maracanã e programas de extensão em toda a cidade.",
    universidadeVinculada: null,
  },
  {
    id: 4,
    nome: "FGV Rio",
    tipo: TIPO_INSTITUICAO.FACULDADE,
    sigla: "FGV",
    cidade: "Rio de Janeiro, RJ",
    site: "https://portal.fgv.br",
    logo: "fgv.png",
    descricao:
      "Fundação Getulio Vargas, com graduação em administração, direito e economia.",
    universidadeVinculada: null,
  },

  // --- Departamentos (PUC-Rio) -----------------------------------------
  {
    id: 10,
    nome: "Departamento de Matemática",
    tipo: TIPO_INSTITUICAO.DEPARTAMENTO,
    sigla: "MAT",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "pucrio.png",
    descricao:
      "Responsável pelas disciplinas de cálculo, álgebra linear e matemática discreta da PUC-Rio.",
    universidadeVinculada: 1,
  },
  {
    id: 11,
    nome: "Departamento de Informática",
    tipo: TIPO_INSTITUICAO.DEPARTAMENTO,
    sigla: "DI",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "pucrio.png",
    descricao:
      "Ensino e pesquisa em computação, com laboratórios de visão computacional, engenharia de software e inteligência artificial.",
    universidadeVinculada: 1,
  },
  {
    id: 12,
    nome: "Departamento de Física",
    tipo: TIPO_INSTITUICAO.DEPARTAMENTO,
    sigla: "FIS",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "pucrio.png",
    descricao: "Laboratórios de física básica e experimental da PUC-Rio.",
    universidadeVinculada: 1,
  },
  {
    id: 13,
    nome: "Departamento de Engenharia Civil",
    tipo: TIPO_INSTITUICAO.DEPARTAMENTO,
    sigla: "CIV",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "pucrio.png",
    descricao:
      "Pesquisa em materiais, estruturas e construção sustentável na PUC-Rio.",
    universidadeVinculada: 1,
  },
  {
    id: 14,
    nome: "Departamento de Economia",
    tipo: TIPO_INSTITUICAO.DEPARTAMENTO,
    sigla: "ECO",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "pucrio.png",
    descricao:
      "Um dos principais centros de pesquisa econômica do país, com linhas em microeconomia aplicada e economia comportamental.",
    universidadeVinculada: 1,
  },

  // --- Departamentos (UFRJ / UERJ) -------------------------------------
  {
    id: 20,
    nome: "Instituto de Computação",
    tipo: TIPO_INSTITUICAO.DEPARTAMENTO,
    sigla: "IC",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "ufrj.svg",
    descricao: "Instituto de Computação da UFRJ, no campus da Ilha do Fundão.",
    universidadeVinculada: 2,
  },
  {
    id: 21,
    nome: "COPPE — Engenharia de Produção",
    tipo: TIPO_INSTITUICAO.DEPARTAMENTO,
    sigla: "COPPE",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "ufrj.svg",
    descricao:
      "Instituto Alberto Luiz Coimbra de Pós-Graduação e Pesquisa de Engenharia da UFRJ.",
    universidadeVinculada: 2,
  },
  {
    id: 22,
    nome: "Instituto de Matemática e Estatística",
    tipo: TIPO_INSTITUICAO.DEPARTAMENTO,
    sigla: "IME",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "uerj.svg",
    descricao: "Instituto de Matemática e Estatística da UERJ.",
    universidadeVinculada: 3,
  },

  // --- Ligas acadêmicas -------------------------------------------------
  {
    id: 30,
    nome: "Liga de Empreendedorismo",
    tipo: TIPO_INSTITUICAO.LIGA_ACADEMICA,
    sigla: "LEMP",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "",
    descricao:
      "Liga estudantil que conduz projetos de consultoria com empresas parceiras e organiza eventos de empreendedorismo na PUC-Rio.",
    universidadeVinculada: 1,
  },
  {
    id: 31,
    nome: "Liga de Finanças",
    tipo: TIPO_INSTITUICAO.LIGA_ACADEMICA,
    sigla: "LFIN",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "",
    descricao:
      "Produz relatórios semanais de mercado e forma alunos em análise de investimentos.",
    universidadeVinculada: 1,
  },
  {
    id: 32,
    nome: "Liga de Direito e Tecnologia",
    tipo: TIPO_INSTITUICAO.LIGA_ACADEMICA,
    sigla: "LDT",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "",
    descricao:
      "Grupo de estudos sobre regulação de tecnologia, proteção de dados e direito digital.",
    universidadeVinculada: 1,
  },
  {
    id: 33,
    nome: "Liga de Engenharia e Inovação",
    tipo: TIPO_INSTITUICAO.LIGA_ACADEMICA,
    sigla: "LEI",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "",
    descricao:
      "Liga da UFRJ voltada a projetos de inovação em engenharia com empresas do Parque Tecnológico.",
    universidadeVinculada: 2,
  },

  // --- Equipes de competição -------------------------------------------
  {
    id: 40,
    nome: "Equipe Baja SAE",
    tipo: TIPO_INSTITUICAO.EQUIPE_COMPETICAO,
    sigla: "BAJA",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "",
    descricao:
      "Projeta e constrói um veículo off-road para a competição nacional Baja SAE Brasil.",
    universidadeVinculada: 1,
  },
  {
    id: 41,
    nome: "Equipe Fórmula SAE",
    tipo: TIPO_INSTITUICAO.EQUIPE_COMPETICAO,
    sigla: "FSAE",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "",
    descricao:
      "Desenvolve um carro de fórmula estudantil, da suspensão à eletrônica embarcada.",
    universidadeVinculada: 1,
  },
  {
    id: 42,
    nome: "Equipe de Robótica",
    tipo: TIPO_INSTITUICAO.EQUIPE_COMPETICAO,
    sigla: "ROBO",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "",
    descricao:
      "Constrói robôs autônomos e de combate para competições nacionais e latino-americanas.",
    universidadeVinculada: 1,
  },
  {
    id: 43,
    nome: "Minerva Rockets",
    tipo: TIPO_INSTITUICAO.EQUIPE_COMPETICAO,
    sigla: "MINERVA",
    cidade: "Rio de Janeiro, RJ",
    site: "",
    logo: "",
    descricao:
      "Equipe de foguetemodelismo da UFRJ, participante de competições internacionais de propulsão.",
    universidadeVinculada: 2,
  },

  // --- Empresas ---------------------------------------------------------
  {
    id: 50,
    nome: "Visagio",
    tipo: TIPO_INSTITUICAO.EMPRESA,
    sigla: "VSG",
    cidade: "Rio de Janeiro, RJ",
    site: "https://visagio.com",
    logo: "visagio.png",
    descricao:
      "Consultoria de gestão e tecnologia com atuação em operações, supply chain e analytics.",
    universidadeVinculada: null,
  },
  {
    id: 51,
    nome: "Opportunity",
    tipo: TIPO_INSTITUICAO.EMPRESA,
    sigla: "OPP",
    cidade: "Rio de Janeiro, RJ",
    site: "https://www.opportunity.com.br",
    logo: "opportunity_gestora_logo.jpeg",
    descricao:
      "Gestora de recursos independente, com áreas de análise, produto e tecnologia.",
    universidadeVinculada: null,
  },
  {
    id: 52,
    nome: "Nortec Indústria",
    tipo: TIPO_INSTITUICAO.EMPRESA,
    sigla: "NTC",
    cidade: "Duque de Caxias, RJ",
    site: "",
    logo: "",
    descricao:
      "Indústria de base com foco em melhoria contínua e engenharia de processos.",
    universidadeVinculada: null,
  },
];

export const acharInstituicao = (id) =>
  instituicoes.find((i) => i.id === id) || null;

/** Universidade que "governa" uma instituição.
 *  Para uma faculdade é ela mesma; para departamento/liga/equipe é a vinculada;
 *  para empresa é nulo (empresa não pertence a universidade nenhuma). */
export function universidadeDa(instituicao) {
  if (!instituicao) return null;
  if (instituicao.tipo === TIPO_INSTITUICAO.FACULDADE) return instituicao.id;
  return instituicao.universidadeVinculada ?? null;
}

export const universidades = instituicoes.filter(
  (i) => i.tipo === TIPO_INSTITUICAO.FACULDADE,
);
