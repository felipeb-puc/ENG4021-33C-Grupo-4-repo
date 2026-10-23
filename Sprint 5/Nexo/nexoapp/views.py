from django.shortcuts import render
from .models import Instituicao, Curso, Oportunidade, Candidatura, Favorito

# Create your views here.
def home(request):
    return render(request, "tela-inicial.html")

def criar_conta(request):
    return render(request, "PROJETOtela_escolha_login.html")

def cadastro_estudante(request):
    universidades = Instituicao.objects.filter(tipo="faculdade")
    cursos = Curso.objects.all()
    return render(request, "PROJETOtela_informacoes_estudante.html", {"universidades": universidades, "cursos": cursos})

def cadastro_recrutador(request):
    empresas = Instituicao.objects.filter(tipo="empresa")
    return render(request, "PROJETOtela_informacoes_recrutador.html", {"empresas": empresas})

def cadastro_representante(request):
    instituicoes = Instituicao.objects.exclude(tipo="empresa")
    return render(request, "PROJETOtela_informacoes_representante.html", {"instituicoes": instituicoes})

def inicio(request):
    oportunidades = Oportunidade.objects.order_by("prazo_inscricao")
    favoritos = Favorito.objects.all()
    candidaturas = Candidatura.objects.all()
    return render(request, "Inicio.html", {"oportunidades": oportunidades, "favoritos": favoritos, "candidaturas": candidaturas})

def iniciacao_cientifica(request):
    oportunidades = Oportunidade.objects.filter(tipo="ic")
    return render(request, "Iniciacao-Cientifica.html", {"oportunidades": oportunidades})

def estagio(request):
    oportunidades = Oportunidade.objects.filter(tipo="estagio")
    return render(request, "estagio.html", {"oportunidades": oportunidades})

def liga_academica(request):
    oportunidades = Oportunidade.objects.filter(tipo="liga")
    return render(request, "tela-liga-academica.html", {"oportunidades": oportunidades})

def minha_oportunidade_candidaturas_ativas(request):
    candidaturas = Candidatura.objects.all()
    return render(request, "tela-minha-oportunidades-canditaturas-ativas.html", {"candidaturas": candidaturas})

def minha_oportunidade_favoritos(request):
    favoritos = Favorito.objects.all()
    return render(request, "tela-minha-oportunidades-favoritos.html", {"favoritos": favoritos})

def minha_oportunidade_historico(request):
    candidaturas = Candidatura.objects.all()
    return render(request, "tela-minha-oportunidades-historico.html", {"candidaturas": candidaturas})
    
