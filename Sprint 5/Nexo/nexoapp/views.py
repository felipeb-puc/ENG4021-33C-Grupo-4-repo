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
