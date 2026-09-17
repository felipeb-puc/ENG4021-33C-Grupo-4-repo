/* Contas de demonstração.

   O protótipo anterior escolhia o "papel" clicando num botão da tela de login —
   por isso não existia perfil de empresa de verdade. Aqui cada conta é uma
   identidade: e-mail, senha e um perfil (aluno ou membro de instituição) do
   qual o papel é derivado.

   Ideia aproveitada do plano do Lovable: as contas ficam visíveis na
   própria tela de entrar, com um clique para preencher — em demonstração ao
   vivo, ninguém precisa digitar nem decorar senha. */

export const contasDemo = [
  {
    email: "isabela.correa@aluno.puc-rio.br",
    senha: "nexo1234",
    perfil: "aluno",
    perfilId: 1,
    rotulo: "Estudante",
    descricao: "Isabela Corrêa · Engenharia de Produção, 5º período · PUC-Rio",
  },
  {
    email: "camila.duarte@visagio.com",
    senha: "nexo1234",
    perfil: "membro",
    perfilId: 1,
    rotulo: "Recrutadora",
    descricao: "Camila Duarte · Gente e gestão · Visagio (empresa verificada)",
  },
  {
    email: "rafael.amorim@puc-rio.br",
    senha: "nexo1234",
    perfil: "membro",
    perfilId: 2,
    rotulo: "Representante acadêmico",
    descricao: "Prof. Rafael Amorim · Departamento de Informática · PUC-Rio",
  },
  {
    // Conta ainda não verificada: serve para mostrar o bloqueio do RF03.
    email: "estagio@opportunity.com.br",
    senha: "nexo1234",
    perfil: "membro",
    perfilId: 3,
    rotulo: "Recrutador aguardando verificação",
    descricao: "Rodrigo Paes · Opportunity · ainda não pode publicar",
  },
  {
    // Não há entidade de administrador no modelo: a conta existe só na sessão.
    email: "admin@nexo.com.br",
    senha: "nexo1234",
    perfil: "admin",
    perfilId: 1,
    rotulo: "Administração NEXO",
    descricao: "Aprova contas de empresas e instituições",
  },
];

export const acharContaDemo = (email) =>
  contasDemo.find((c) => c.email.toLowerCase() === String(email).trim().toLowerCase()) ||
  null;
