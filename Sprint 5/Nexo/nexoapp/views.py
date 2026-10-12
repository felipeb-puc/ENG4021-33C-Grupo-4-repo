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