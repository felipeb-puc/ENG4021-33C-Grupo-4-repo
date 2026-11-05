import os
import sys
from datetime import date

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Nexo.settings")
django.setup()

from django.contrib.auth.models import User
from nexoapp.models import (
    Instituicao, Curso, Aluno, Recrutador, Representante,
    Oportunidade, Candidatura, Favorito,
)

SENHA_TESTE = "nexo2026"

if Oportunidade.objects.exists() or User.objects.exists():
    print("O banco já tem dados. Rode este script só num banco novo (apague o db.sqlite3 e rode o migrate).")
    sys.exit()


puc = Instituicao.objects.create(tipo="faculdade", nome="PUC-Rio", sede="Gávea, Rio de Janeiro")
ufrj = Instituicao.objects.create(tipo="faculdade", nome="UFRJ", sede="Ilha do Fundão, Rio de Janeiro")
uerj = Instituicao.objects.create(tipo="faculdade", nome="UERJ", sede="Maracanã, Rio de Janeiro")
uff = Instituicao.objects.create(tipo="faculdade", nome="UFF", sede="Niterói")

exacta = Instituicao.objects.create(tipo="empresa", nome="Exacta", sede="Gávea, Rio de Janeiro")
petrobras = Instituicao.objects.create(tipo="empresa", nome="Petrobras", sede="Centro, Rio de Janeiro")
visagio = Instituicao.objects.create(tipo="empresa", nome="Visagio", sede="Botafogo, Rio de Janeiro")

liga_financas = Instituicao.objects.create(tipo="liga", nome="Liga de Mercado Financeiro", sede="PUC-Rio")
liga_empreend = Instituicao.objects.create(tipo="liga", nome="Liga de Empreendedorismo", sede="UFRJ")

pegasus = Instituicao.objects.create(tipo="equipe", nome="Pegasus", sede="PUC-Rio")
baja = Instituicao.objects.create(tipo="equipe", nome="Baja", sede="PUC-Rio")


engenharia = Curso.objects.create(nome="Engenharia")
direito = Curso.objects.create(nome="Direito")
administracao = Curso.objects.create(nome="Administração")
psicologia = Curso.objects.create(nome="Psicologia")
computacao = Curso.objects.create(nome="Ciência da Computação")
economia = Curso.objects.create(nome="Economia")
design = Curso.objects.create(nome="Design")


def nova_oportunidade(instituicao, curso, tipo, titulo, descricao, requisitos,
                      carga_horaria, remuneracao, prazo, modalidade, periodo_minimo):
    return Oportunidade.objects.create(
        instituicao=instituicao,
        curso=curso,
        tipo=tipo,
        titulo=titulo,
        descricao=descricao,
        requisitos=requisitos,
        carga_horaria=carga_horaria,
        remuneracao=remuneracao,
        prazo_inscricao=prazo,
        modalidade=modalidade,
        periodo_minimo=periodo_minimo,
    )

mon_eng4021 = nova_oportunidade(
    puc, engenharia, "monitoria", "Monitoria de ENG4021",
    "Fazer a revisão das sprints",
    "Ter sido aprovado em ENG4021",
    2, 200, date(2026, 11, 18), "presencial", 3)
mon_calculo = nova_oportunidade(
    puc, engenharia, "monitoria", "Monitoria de Cálculo I",
    "Tirar dúvidas dos alunos em plantões semanais.",
    "Ter sido aprovado em Cálculo I com nota igual ou maior que 8.",
    8, 600, date(2026, 11, 20), "presencial", 3)
mon_economia = nova_oportunidade(
    ufrj, economia, "monitoria", "Monitoria de Introdução à Economia",
    "Apoiar o professor nas aulas práticas e organizar os plantões antes das provas.",
    "Ter sido aprovado em Introdução à Economia.",
    6, 400, date(2026, 11, 27), "presencial", 3)
mon_programacao = nova_oportunidade(
    uff, computacao, "monitoria", "Monitoria de Programação I",
    "Acompanhar os laboratórios de Python e ajudar os alunos com os exercícios da semana.",
    "Ter sido aprovado em Programação I.",
    10, 500, date(2026, 10, 20), "hibrido", 2)

ic_visao = nova_oportunidade(
    puc, computacao, "ic", "IC em Visão Computacional",
    "Pesquisa com visão computacional para inspeção de equipamentos.",
    "Saber programar em Python. Ter cursado Álgebra Linear.",
    12, 700, date(2026, 12, 5), "presencial", 3)
ic_direito = nova_oportunidade(
    uerj, direito, "ic", "IC em Direito Digital",
    "Pesquisa sobre proteção de dados pessoais e a aplicação da LGPD em plataformas digitais.",
    "Interesse em direito digital e disponibilidade para reuniões quinzenais.",
    10, 700, date(2026, 11, 30), "hibrido", 4)
ic_psicologia = nova_oportunidade(
    ufrj, psicologia, "ic", "IC em Psicologia do Desenvolvimento",
    "Ajudar na coleta e organização de dados de uma pesquisa com crianças em idade escolar.",
    "Ter cursado Psicologia do Desenvolvimento I. Vaga voluntária.",
    12, 0, date(2026, 12, 12), "presencial", 2)
ic_energia = nova_oportunidade(
    uff, engenharia, "ic", "IC em Energia Solar",
    "Testar a eficiência de painéis solares em diferentes condições de temperatura no laboratório.",
    "Ter cursado Física II.",
    20, 700, date(2026, 10, 15), "presencial", 4)

est_exacta = nova_oportunidade(
    exacta, engenharia, "estagio", "Exacta - vaga para estagio",
    "Laboratório de transformação digital do Departamento de Informática da PUC-Rio.",
    "Ter um conhecimento prévio da area de atuação do projeto",
    20, 1000, date(2026, 10, 29), "presencial", 3)
est_petrobras = nova_oportunidade(
    petrobras, administracao, "estagio", "Estagio Nivel iniciante na Petrobras",
    "Vagas para a área de back-end",
    "Estar entre o 3º e o 7º período.",
    20, 1800, date(2026, 12, 18), "hibrido", 3)
est_dados = nova_oportunidade(
    visagio, economia, "estagio", "Estágio em Análise de Dados",
    "Montar painéis e relatórios para projetos de consultoria, trabalhando com Excel, SQL e Power BI.",
    "Conhecimento de Excel. SQL é um diferencial.",
    30, 2200, date(2026, 12, 10), "hibrido", 5)
est_design = nova_oportunidade(
    exacta, design, "estagio", "Estágio em Design de Produto",
    "Criar protótipos de telas e participar de testes com usuários dos projetos do laboratório.",
    "Saber usar Figma. Ter portfólio.",
    20, 1200, date(2026, 11, 25), "remoto", 3)
est_juridico = nova_oportunidade(
    petrobras, direito, "estagio", "Estágio Jurídico",
    "Apoiar a equipe jurídica na análise de contratos e no acompanhamento de processos.",
    "Estar a partir do 6º período de Direito.",
    30, 2000, date(2027, 1, 15), "presencial", 6)

eq_pegasus = nova_oportunidade(
    pegasus, engenharia, "equipe", "Processo Seletivo da Pegasus",
    "Equipe que projeta e fabrica um carro estilo fórmula para a Fórmula SAE Brasil.",
    "Ter comprometimento com o projeto",
    8, 0, date(2026, 10, 29), "hibrido", 1)
eq_baja = nova_oportunidade(
    baja, engenharia, "equipe", "Processo Seletivo da Baja",
    "Equipe que projeta e constrói um veículo off-road para a competição Baja SAE.",
    "Disponibilidade para encontros aos sábados.",
    10, 0, date(2026, 11, 22), "presencial", 1)

liga_ps = nova_oportunidade(
    liga_financas, economia, "liga", "Processo Seletivo da Liga",
    "Liga que aproxima os estudantes do mercado financeiro.",
    "Ter habilidade de grupo e estar cursando algum curso na puc",
    6, 0, date(2026, 10, 29), "hibrido", 1)
liga_research = nova_oportunidade(
    liga_financas, economia, "liga", "Liga de Mercado Financeiro: Núcleo de Research",
    "Escrever relatórios de análise de empresas e apresentar para os membros da liga.",
    "Ter cursado Contabilidade ou Finanças.",
    6, 0, date(2026, 12, 3), "presencial", 2)
liga_empreend_ps = nova_oportunidade(
    liga_empreend, administracao, "liga", "Processo Seletivo da Liga de Empreendedorismo",
    "Participar de workshops e desenvolver ideias de negócio com mentoria de empreendedores.",
    "Vontade de aprender e de trabalhar em grupo.",
    4, 0, date(2026, 11, 28), "hibrido", 1)


def novo_usuario(email, nome, sobrenome):
    return User.objects.create_user(
        username=email,
        email=email,
        first_name=nome,
        last_name=sobrenome,
        password=SENHA_TESTE,
    )

User.objects.create_superuser(
    username="admin@nexo.teste",
    email="admin@nexo.teste",
    password=SENHA_TESTE,
    first_name="Administrador",
)

miguel = Aluno.objects.create(
    user=novo_usuario("miguel@nexo.teste", "Miguel", "Viana"),
    instituicao=puc, curso=engenharia, matricula="2616767", periodo=2,
    curriculo="Técnico de Informática", cr=7.8)
pedro = Aluno.objects.create(
    user=novo_usuario("pedro@nexo.teste", "Pedro", "Alves"),
    instituicao=puc, curso=direito, matricula="2520408", periodo=4,
    curriculo="6 meses de Pegasus", cr=8.4)
daniel = Aluno.objects.create(
    user=novo_usuario("daniel@nexo.teste", "Daniel", "Pessoa"),
    instituicao=ufrj, curso=economia, matricula="2310767", periodo=8,
    curriculo="1 ano de estágio na Apple Developer Academy", cr=9.1)
ana = Aluno.objects.create(
    user=novo_usuario("ana@nexo.teste", "Ana Luísa", "Ramos"),
    instituicao=uerj, curso=psicologia, matricula="2420067", periodo=5,
    curriculo="1 ano na Liga de Mercado Financeiro", cr=8.0)
beatriz = Aluno.objects.create(
    user=novo_usuario("beatriz@nexo.teste", "Beatriz", "Costa"),
    instituicao=uff, curso=computacao, matricula="2611234", periodo=3,
    curriculo="Monitora de Programação I. Projetos pessoais em Python.", cr=8.7)

Recrutador.objects.create(
    user=novo_usuario("carla@nexo.teste", "Carla", "Mendes"),
    empresa=visagio, cargo="Analista de RH")
Recrutador.objects.create(
    user=novo_usuario("rafael@nexo.teste", "Rafael", "Souza"),
    empresa=petrobras, cargo="Coordenador de Estágios")

Representante.objects.create(
    user=novo_usuario("lucas@nexo.teste", "Lucas", "Ferreira"),
    instituicao=puc, cargo="Coordenação de Monitoria")
Representante.objects.create(
    user=novo_usuario("marina@nexo.teste", "Marina", "Lopes"),
    instituicao=liga_financas, cargo="Presidente da Liga")


Candidatura.objects.create(aluno=miguel, oportunidade=mon_eng4021)
Candidatura.objects.create(aluno=pedro, oportunidade=est_juridico)
Candidatura.objects.create(aluno=daniel, oportunidade=est_dados)
Candidatura.objects.create(aluno=beatriz, oportunidade=ic_visao)

Favorito.objects.create(aluno=miguel, oportunidade=est_exacta)
Favorito.objects.create(aluno=daniel, oportunidade=eq_pegasus)
Favorito.objects.create(aluno=ana, oportunidade=ic_direito)

print("Dados criados:")
print(Instituicao.objects.count(), "instituições,", Curso.objects.count(), "cursos,",
      Oportunidade.objects.count(), "oportunidades")
print(Aluno.objects.count(), "alunos,", Recrutador.objects.count(), "recrutadores,",
      Representante.objects.count(), "representantes,", User.objects.count(), "usuários")
print(Candidatura.objects.count(), "candidaturas,", Favorito.objects.count(), "favoritos")
