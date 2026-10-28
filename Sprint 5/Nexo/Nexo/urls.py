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

    path('templates/tela-login.html', login),

    path('templates/Inicio.html', inicio),
    path('templates/tela-busca.html', busca),
    path('templates/Iniciacao-Cientifica.html', iniciacao_cientifica),
    path('templates/estagio.html', estagio),
    path('templates/tela-liga-academica.html', liga_academica),
    path('templates/tela-monitoria.html', monitoria),
    path('templates/tela-equipe-competicao.html', equipe_competicao),
    path('templates/tela-oportunidade.html', oportunidade),
    path('templates/tela-perfil.html', perfil),
    path('templates/tela-minha-oportunidades-canditaturas-ativas.html', minha_oportunidade_candidaturas_ativas),
    path('templates/tela-minha-oportunidades-favoritos.html', minha_oportunidade_favoritos),
    path('templates/tela-minha-oportunidades-historico.html', minha_oportunidade_historico),

    # Telas de quem publica (recrutador / representante acadêmico)
    path('templates/tela-painel.html', painel),
    path('templates/tela-nova-oportunidade.html', nova_oportunidade),
    path('templates/tela-candidaturas-recebidas.html', candidaturas_recebidas),
    path('templates/tela-banco-talentos.html', banco_talentos),
    path('templates/tela-curriculo-aluno.html', curriculo_aluno),
    path('templates/tela-instituicao.html', instituicao),
    path('templates/tela-admin.html', administracao),
]
