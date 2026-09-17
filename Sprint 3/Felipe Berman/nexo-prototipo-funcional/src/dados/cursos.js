/* Cursos — entidade própria, não texto livre (proposta de modelo de dados, M3).

   O curso é global e aponta para as universidades que o oferecem. Assim uma
   vaga de estágio para "Engenharia de Produção" referencia um curso só, e não
   um por universidade — e o filtro por curso para de depender de grafia
   idêntica ("Eng. de Produção" ≠ "Engenharia de Produção"). */

export const cursos = [
  { id: 1, nome: "Engenharia de Produção", universidades: [1, 2, 3] },
  { id: 2, nome: "Engenharia da Computação", universidades: [1, 2] },
  { id: 3, nome: "Ciência da Computação", universidades: [1, 2, 3] },
  { id: 4, nome: "Economia", universidades: [1, 2, 3, 4] },
  { id: 5, nome: "Administração", universidades: [1, 4] },
  { id: 6, nome: "Direito", universidades: [1, 3, 4] },
  { id: 7, nome: "Engenharia Civil", universidades: [1, 2, 3] },
  { id: 8, nome: "Engenharia Mecânica", universidades: [1, 2] },
  { id: 9, nome: "Matemática", universidades: [1, 2, 3] },
  { id: 10, nome: "Física", universidades: [1, 2] },
];

export const acharCurso = (id) => cursos.find((c) => c.id === id) || null;

export const nomeDoCurso = (id) => acharCurso(id)?.nome ?? "";

/** Cursos oferecidos por uma universidade — alimenta os selects de filtro,
 *  para que o aluno nunca veja curso que a universidade dele não tem. */
export const cursosDaUniversidade = (universidadeId) =>
  cursos.filter((c) => c.universidades.includes(universidadeId));
