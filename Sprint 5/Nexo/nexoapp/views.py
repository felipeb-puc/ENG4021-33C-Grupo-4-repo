from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, "tela-inicial.html")

def criar_conta(request):
    return render(request, "PROJETOtela_escolha_login.html")

def cadastro_estudante(request):
    return render(request, "PROJETOtela_informacoes_estudante.html")

def cadastro_recrutador(request):
    return render(request, "PROJETOtela_informacoes_recrutador.html")

def cadastro_representante(request):
    return render(request, "PROJETOtela_informacoes_representante.html")

def inicio(request):
    return render(request, "Inicio.html")

def iniciacao_cientifica(request):
    return render(request, "Iniciacao-Cientifica.html")

def estagio(request):
    return render(request, "estagio.html")

def liga_academica(request):
    return render( request, "tela-liga-academica.html")

def minha_oportunidade_candidaturas_ativas(request):
    return render (request, "tela-minha-oportunidade-candidaturas-ativas.html")

def minha_oportunidade_favoritos(request):
    return render (request, "minha-oportunidade-favoritos.html")

def minha_oportunidade_historico(request):
    return render (request, "minha-oportunidade-historico.html")

def login(request):
    return render(request, "tela-login.html")

def busca(request):
    return render(request, "tela-busca.html")

