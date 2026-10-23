"""
URL configuration for Nexo project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from nexoapp.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home),
    path('templates/tela-inicial.html', home),
    path('templates/PROJETOtela_escolha_login.html', criar_conta, name='criar_conta'),
    path('templates/PROJETOtela_informacoes_estudante.html', cadastro_estudante),
    path('templates/PROJETOtela_informacoes_recrutador.html', cadastro_recrutador),
    path('templates/PROJETOtela_informacoes_representante.html', cadastro_representante),

    # Cadastro de aluno
    path('cadastro-aluno/', cadastro_aluno, name='cadastro_aluno'),

    path('templates/Inicio.html', inicio),
    path('templates/Iniciacao-Cientifica.html', iniciacao_cientifica),
    path('templates/Estagio.html', estagio),
    path('templates/Liga-Academica.html', liga_academica),
    path('templates/tela-minha-oportunidades-canditaturas-ativas.html', minha_oportunidade_candidaturas_ativas),
    path('templates/tela-minha-oportunidades-favoritos.html', minha_oportunidade_favoritos),
    path('templates/tela-minha-oportunidades-historico.html', minha_oportunidade_historico),
]
