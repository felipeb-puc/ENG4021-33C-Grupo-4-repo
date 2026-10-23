from django.shortcuts import render
from .models import Instituicao, Oportunidade, Candidatura, Favorito
from .forms import CadastroRecrutadorForm, CadastroRepresentanteForm, CadastroAlunoForm
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

def inicio(request):
    oportunidades = Oportunidade.objects.order_by("prazo_inscricao")
    favoritos = Favorito.objects.all()
    candidaturas = Candidatura.objects.all()
    return render(request, "Inicio.html", {"oportunidades": oportunidades, "favoritos": favoritos, "candidaturas": candidaturas})

def minha_oportunidade_favoritos(request):
    favoritos = Favorito.objects.all()
    return render(request, "tela-minha-oportunidades-favoritos.html", {"favoritos": favoritos})

def iniciacao_cientifica(request):
    oportunidades = Oportunidade.objects.filter(tipo="ic")
    return render(request, "Iniciacao-Cientifica.html", {"oportunidades": oportunidades})

def minha_oportunidade_historico(request):
    candidaturas = Candidatura.objects.all()
    return render(request, "tela-minha-oportunidades-historico.html", {"candidaturas": candidaturas})

def estagio(request):
    oportunidades = Oportunidade.objects.filter(tipo="estagio")
    return render(request, "estagio.html", {"oportunidades": oportunidades})

def minha_oportunidade_candidaturas_ativas(request):
    candidaturas = Candidatura.objects.all()
    return render(request, "tela-minha-oportunidades-canditaturas-ativas.html", {"candidaturas": candidaturas})

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