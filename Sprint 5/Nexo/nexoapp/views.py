from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import Instituicao, Oportunidade, Candidatura, Favorito
from .forms import CadastroRecrutadorForm, CadastroRepresentanteForm, CadastroAlunoForm, LoginForm
# Create your views here.
def home(request):
    return render(request, "tela-inicial.html")

def criar_conta(request):
    return render(request, "PROJETOtela_escolha_login.html")

def cadastro_estudante(request):
    return cadastro_aluno(request)

def cadastro_recrutador(request):
    empresas = Instituicao.objects.filter(tipo="empresa")
    return render(request, "PROJETOtela_informacoes_recrutador.html", {"empresas": empresas})

def cadastro_representante(request):
    instituicoes = Instituicao.objects.exclude(tipo="empresa")
    return render(request, "PROJETOtela_informacoes_representante.html", {"instituicoes": instituicoes})

def cadastro_aluno(request):
    if request.method == "POST":
        form = CadastroAlunoForm(request.POST)
        if form.is_valid():
            # O salvamento da conta será implementado na próxima etapa.
            return render(
                request,
                "PROJETOtela_informacoes_estudante.html",
                {
                    "form": CadastroAlunoForm(),
                    "sucesso": True,
                },
            )
    else:
        form = CadastroAlunoForm()

    return render(
        request,
        "PROJETOtela_informacoes_estudante.html",
        {"form": form},
    )

@login_required(login_url='login')
def inicio(request):
    oportunidades = Oportunidade.objects.order_by("prazo_inscricao")
    favoritos = Favorito.objects.filter(aluno__user=request.user)
    candidaturas = Candidatura.objects.filter(aluno__user=request.user)
    return render(request, "Inicio.html", {"oportunidades": oportunidades, "favoritos": favoritos, "candidaturas": candidaturas})

@login_required(login_url='login')
def minha_oportunidade_favoritos(request):
    favoritos = Favorito.objects.filter(aluno__user=request.user)
    candidaturas = Candidatura.objects.filter(aluno__user=request.user)
    return render(request, "tela-minha-oportunidades-favoritos.html", {"favoritos": favoritos, "candidaturas": candidaturas})

def iniciacao_cientifica(request):
    oportunidades = Oportunidade.objects.filter(tipo="ic")
    return render(request, "Iniciacao-Cientifica.html", {"oportunidades": oportunidades})

@login_required(login_url='login')
def minha_oportunidade_historico(request):
    candidaturas = Candidatura.objects.filter(aluno__user=request.user)
    favoritos = Favorito.objects.filter(aluno__user=request.user)
    return render(request, "tela-minha-oportunidades-historico.html", {"candidaturas": candidaturas, "favoritos": favoritos})

def estagio(request):
    oportunidades = Oportunidade.objects.filter(tipo="estagio")
    return render(request, "estagio.html", {"oportunidades": oportunidades})

@login_required(login_url='login')
def minha_oportunidade_candidaturas_ativas(request):
    candidaturas = Candidatura.objects.filter(aluno__user=request.user)
    favoritos = Favorito.objects.filter(aluno__user=request.user)
    return render(request, "tela-minha-oportunidades-canditaturas-ativas.html", {"candidaturas": candidaturas, "favoritos": favoritos})

def liga_academica(request):
    oportunidades = Oportunidade.objects.filter(tipo="liga")
    return render(request, "tela-liga-academica.html", {"oportunidades": oportunidades})
    
def cadastro_recrutador(request):
    if request.method == "POST":
        form = CadastroRecrutadorForm(request.POST)
        if form.is_valid():
            # Dados validados; o salvamento da conta será
            # implementado na próxima etapa.
            pass
    else:
        form = CadastroRecrutadorForm()

    return render(
        request,
        "PROJETOtela_informacoes_recrutador.html",
        {"form": form}
    )



@login_required
def tela_busca(request):
    oportunidades = [
        {
            "id": 1,
            "tipo": "Monitoria",
            "titulo": "Monitoria de Cálculo a Várias Variáveis",
            "instituicao": "Departamento de Matemática",
            "horas": "12h por semana",
            "remuneracao": "R$ 600 por mês",
            "modalidade": "Presencial",
            "data_limite": "06/11/2026",
            "curso": "Engenharia de Produção",
            "periodo": 1,
        },
        {
            "id": 2,
            "tipo": "Estágio",
            "titulo": "Estágio em análise de dados de operações",
            "instituicao": "Visagio",
            "horas": "30h por semana",
            "remuneracao": "R$ 2.200 por mês",
            "modalidade": "Híbrido",
            "data_limite": "09/11/2026",
            "curso": "Engenharia de Produção",
            "periodo": 5,
        },
        {
            "id": 3,
            "tipo": "Liga acadêmica",
            "titulo": "Processo seletivo 2026.2",
            "instituicao": "Liga de Empreendedorismo",
            "horas": "6h por semana",
            "remuneracao": "Voluntária, com certificado",
            "modalidade": "Híbrido",
            "data_limite": "12/11/2026",
            "curso": "Economia",
            "periodo": 1,
        },
        {
            "id": 4,
            "tipo": "Equipe de competição",
            "titulo": "Visão computacional do robô autônomo",
            "instituicao": "Equipe de Robótica",
            "horas": "8h por semana",
            "remuneracao": "Voluntária, com certificado",
            "modalidade": "Presencial",
            "data_limite": "03/11/2026",
            "curso": "Ciência da Computação",
            "periodo": 1,
        },
        {
            "id": 5,
            "tipo": "Iniciação científica",
            "titulo": "Visão computacional para inspeção industrial",
            "instituicao": "Departamento de Informática",
            "horas": "20h por semana",
            "remuneracao": "R$ 700 por mês",
            "modalidade": "Presencial",
            "data_limite": "20/11/2026",
            "curso": "Ciência da Computação",
            "periodo": 5,
        },
        {
            "id": 6,
            "tipo": "Monitoria",
            "titulo": "Monitoria de Programação I",
            "instituicao": "Departamento de Informática",
            "horas": "8h por semana",
            "remuneracao": "R$ 450 por mês",
            "modalidade": "Presencial",
            "data_limite": "10/11/2026",
            "curso": "Ciência da Computação",
            "periodo": 1,
        },
    ]

    context = {
        "oportunidades": oportunidades,
        "total_oportunidades": len(oportunidades),
        "universidade": "PUC-Rio",
        "iniciais": "IC",
    }

    return render(request, "tela-busca.html", context)
def cadastro_representante(request):
    if request.method == "POST":
        form = CadastroRepresentanteForm(request.POST)
        if form.is_valid():
            # Dados validados; o salvamento da conta será
            # implementado na próxima etapa.
            pass
    else:
        form = CadastroRepresentanteForm()

    return render(
        request,
        "PROJETOtela_informacoes_representante.html",
        {"form": form}
    )
@login_required
def tela_banco_talentos(request):
    candidatos = [
        {
            "nome": "Lucas Moreira",
            "cr": 8.9,
            "universidade": "PUC-Rio",
            "curso": "Engenharia da Computação",
            "periodo": 6,
            "habilidades": ["Python", "C", "Machine learning", "Git"],
            "areas": ["Dados", "Tecnologia"],
        },
        {
            "nome": "Juliana Peixoto",
            "cr": 8.6,
            "universidade": "UFRJ",
            "curso": "Engenharia de Produção",
            "periodo": 6,
            "habilidades": [
                "Python",
                "Pesquisa operacional",
                "SQL",
            ],
            "areas": ["Operações", "Logística"],
        },
        {
            "nome": "Isabela Corrêa",
            "cr": 8.4,
            "universidade": "PUC-Rio",
            "curso": "Engenharia de Produção",
            "periodo": 5,
            "habilidades": [
                "Excel avançado",
                "Power BI",
                "SQL básico",
                "Inglês fluente",
            ],
            "areas": ["Operações", "Dados", "Consultoria"],
        },
        {
            "nome": "Rafael Sampaio",
            "cr": 8.1,
            "universidade": "PUC-Rio",
            "curso": "Engenharia de Produção",
            "periodo": 7,
            "habilidades": ["Lean", "Power BI", "Seis Sigma"],
            "areas": ["Indústria", "Operações"],
        },
        {
            "nome": "Carolina Diniz",
            "cr": 8.0,
            "universidade": "UERJ",
            "curso": "Economia",
            "periodo": 5,
            "habilidades": ["Excel avançado", "R"],
            "areas": ["Finanças"],
        },
        {
            "nome": "Beatriz Farias",
            "cr": 7.8,
            "universidade": "PUC-Rio",
            "curso": "Economia",
            "periodo": 4,
            "habilidades": [
                "SQL",
                "Análise de dados",
                "Excel avançado",
            ],
            "areas": ["Dados", "Finanças"],
        },
    ]

    candidatos = sorted(
        candidatos,
        key=lambda candidato: candidato["cr"],
        reverse=True,
    )

    context = {
        "instituicao": "Visagio",
        "iniciais": "CD",
        "candidatos": candidatos,
    }

    return render(
        request,
        "tela-banco-talentos.html",
        context,
    )
@login_required
def tela_candidaturas_recebidas(request):
    candidaturas = [
        {
            "nome": "Juliana Peixoto",
            "universidade": "UFRJ",
            "curso": "Engenharia de Produção",
            "periodo": 6,
            "cr": 8.6,
            "oportunidade": "Estágio em análise de dados de operações",
            "data": "03/09/2026",
            "status": "Em análise",
        },
        {
            "nome": "Isabela Corrêa",
            "universidade": "PUC-Rio",
            "curso": "Engenharia de Produção",
            "periodo": 5,
            "cr": 8.4,
            "oportunidade": "Estágio em análise de dados de operações",
            "data": "09/09/2026",
            "status": "Entrevista marcada",
        },
        {
            "nome": "Rafael Sampaio",
            "universidade": "PUC-Rio",
            "curso": "Engenharia de Produção",
            "periodo": 7,
            "cr": 8.1,
            "oportunidade": "Estágio em análise de dados de operações",
            "data": "05/09/2026",
            "status": "Em análise",
        },
    ]

    context = {
        "instituicao": "Visagio",
        "iniciais": "CD",
        "candidaturas": candidaturas,
    }

    return render(
        request,
        "tela-candidaturas-recebidas.html",
        context
    )    
@login_required
def tela_admin(request):
    contas = [
        {
            "nome": "Rodrigo Paes",
            "instituicao": "Opportunity",
            "tipo": "Recrutador",
            "data_cadastro": "10/09/2026",
            "verificada": False,
        },
        {
            "nome": "Camila Duarte",
            "instituicao": "Visagio",
            "tipo": "Recrutador",
            "data_cadastro": None,
            "verificada": True,
        },
        {
            "nome": "Prof. Rafael Amorim",
            "instituicao": "Departamento de Informática",
            "tipo": "Representante acadêmico",
            "data_cadastro": None,
            "verificada": True,
        },
    ]

    context = {
        "contas": contas,
    }

    return render(request, "tela-admin.html", context)


def entrar(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            senha = form.cleaned_data["senha"]
            usuario = authenticate(request, username=email, password=senha)
            if usuario is not None:
                login(request, usuario)
                return redirect("/templates/Inicio.html")
            else:
                form.add_error(None, "E-mail ou senha incorretos.")
    else:
        form = LoginForm()

    return render(request, "tela-login.html", {"form": form})


def sair(request):
    logout(request)
    return redirect("/")
