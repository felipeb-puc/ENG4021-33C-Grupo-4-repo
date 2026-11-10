from datetime import date, timedelta
from urllib.parse import urlencode, quote
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q
from .models import (
    Instituicao,
    Curso,
    Aluno,
    Recrutador,
    Representante,
    Oportunidade,
    Candidatura,
    Favorito,
)
from .forms import CadastroRecrutadorForm, CadastroRepresentanteForm, CadastroAlunoForm, LoginForm
# Create your views here.
def home(request):
    return render(request, "tela-inicial.html")

def criar_conta(request):
    return render(request, "PROJETOtela_escolha_login.html")

def cadastro_estudante(request):
    return cadastro_aluno(request)

def cadastro_aluno(request):
    if request.method == "POST":
        form = CadastroAlunoForm(request.POST)
        if form.is_valid():
            dados = form.cleaned_data
            email = dados["email_academico"].strip().lower()
            # atomic: User e Aluno são criados juntos; se um falhar, o outro é desfeito
            with transaction.atomic():
                usuario = User.objects.create_user(
                    username=email,
                    email=email,
                    first_name=dados["nome_completo"].strip(),
                    password=dados["senha"],
                )
                # "aparecer_em_buscas" não é salvo: o campo saiu do model (migration 0004)
                Aluno.objects.create(
                    user=usuario,
                    instituicao=dados["universidade"],
                    curso=dados["curso"],
                    matricula=dados["matricula"],
                    periodo=int(dados["periodo_atual"]),
                    curriculo="",
                    cr=dados["cr"],
                )
            messages.success(request, "Conta de estudante criada. Faça login para continuar.")
            return redirect("login")
    else:
        form = CadastroAlunoForm()

    return render(
        request,
        "PROJETOtela_informacoes_estudante.html",
        {"form": form},
    )

def ids_dos_favoritos(request):
    ids = []
    if request.user.is_authenticated:
        for favorito in Favorito.objects.filter(aluno__user=request.user):
            ids.append(favorito.oportunidade_id)
    return ids

@login_required(login_url='login')
def inicio(request):
    oportunidades = Oportunidade.objects.order_by("prazo_inscricao")
    favoritos = Favorito.objects.filter(aluno__user=request.user)
    candidaturas = Candidatura.objects.filter(aluno__user=request.user)
    return render(request, "Inicio.html", {"oportunidades": oportunidades, "favoritos": favoritos, "candidaturas": candidaturas, "ids_favoritos": ids_dos_favoritos(request)})

def link_google_agenda(oportunidade):
    inicio = oportunidade.prazo_inscricao.strftime("%Y%m%d")
    fim = (oportunidade.prazo_inscricao + timedelta(days=1)).strftime("%Y%m%d")
    parametros = {
        "action": "TEMPLATE",
        "text": "Prazo: " + oportunidade.titulo,
        "dates": inicio + "/" + fim,
        "details": "Último dia para se inscrever em " + oportunidade.titulo + " (" + oportunidade.instituicao.nome + ").",
        "ctz": "America/Sao_Paulo",
    }
    return "https://calendar.google.com/calendar/render?" + urlencode(parametros)

@login_required(login_url='login')
def minha_oportunidade_favoritos(request):
    favoritos = Favorito.objects.filter(aluno__user=request.user)
    candidaturas = Candidatura.objects.filter(aluno__user=request.user)
    for favorito in favoritos:
        favorito.link_agenda = link_google_agenda(favorito.oportunidade)
        favorito.prazo_encerrado = favorito.oportunidade.prazo_inscricao < date.today()
    return render(request, "tela-minha-oportunidades-favoritos.html", {"favoritos": favoritos, "candidaturas": candidaturas})

def iniciacao_cientifica(request):
    oportunidades = Oportunidade.objects.filter(tipo="ic")
    return render(request, "Iniciacao-Cientifica.html", {"oportunidades": oportunidades, "ids_favoritos": ids_dos_favoritos(request)})

@login_required(login_url='login')
def minha_oportunidade_historico(request):
    candidaturas = Candidatura.objects.filter(aluno__user=request.user)
    favoritos = Favorito.objects.filter(aluno__user=request.user)
    return render(request, "tela-minha-oportunidades-historico.html", {"candidaturas": candidaturas, "favoritos": favoritos})

def estagio(request):
    oportunidades = Oportunidade.objects.filter(tipo="estagio")
    return render(request, "estagio.html", {"oportunidades": oportunidades, "ids_favoritos": ids_dos_favoritos(request)})

@login_required(login_url='login')
def tela_monitoria(request):
    oportunidades = Oportunidade.objects.filter(tipo="monitoria")
    return render(request, "tela-monitoria.html", {"oportunidades": oportunidades, "ids_favoritos": ids_dos_favoritos(request)})

@login_required(login_url='login')
def tela_equipe_competicao(request):
    oportunidades = Oportunidade.objects.filter(tipo="equipe")
    return render(request, "tela-equipe-competicao.html", {"oportunidades": oportunidades, "ids_favoritos": ids_dos_favoritos(request)})

@login_required(login_url='login')
def tela_perfil(request):
    return render(request, "tela-perfil.html")

@login_required(login_url='login')
def tela_curriculo_aluno(request):
    return render(request, "tela-curriculo-aluno.html")

@login_required(login_url='login')
def tela_instituicao(request):
    return render(request, "tela-instituicao.html")

@login_required(login_url='login')
def tela_nova_oportunidade(request):
    return render(request, "tela-nova-oportunidade.html")

@login_required(login_url='login')
def minha_oportunidade_candidaturas_ativas(request):
    candidaturas = Candidatura.objects.filter(aluno__user=request.user)
    favoritos = Favorito.objects.filter(aluno__user=request.user)
    return render(request, "tela-minha-oportunidades-canditaturas-ativas.html", {"candidaturas": candidaturas, "favoritos": favoritos})

def liga_academica(request):
    oportunidades = Oportunidade.objects.filter(tipo="liga")
    return render(request, "tela-liga-academica.html", {"oportunidades": oportunidades, "ids_favoritos": ids_dos_favoritos(request)})
    
def cadastro_recrutador(request):
    empresas = Instituicao.objects.filter(tipo="empresa")
    form = CadastroRecrutadorForm(request.POST or None)
    form.fields["empresa"].choices = [("", "Selecione")] + [
        (str(empresa.pk), empresa.nome) for empresa in empresas
    ]
    if request.method == "POST" and form.is_valid():
        dados = form.cleaned_data
        email = dados["email"].strip().lower()
        usuario = User.objects.create_user(
            username=email,
            email=email,
            first_name=dados["nome"].strip(),
            password=dados["senha"],
        )
        Recrutador.objects.create(
            user=usuario,
            empresa=Instituicao.objects.get(pk=dados["empresa"]),
            cargo=dados["cargo"].strip(),
        )
        messages.success(request, "Conta de recrutador criada. Faça login para continuar.")
        return redirect("login")

    return render(request, "PROJETOtela_informacoes_recrutador.html", {
        "form": form,
        "empresas": empresas,
    })



def cadastro_representante(request):
    instituicoes = Instituicao.objects.exclude(tipo="empresa")
    form = CadastroRepresentanteForm(request.POST or None)
    form.fields["empresa"].choices = [("", "Selecione")] + [
        (str(instituicao.pk), instituicao.nome) for instituicao in instituicoes
    ]

    if request.method == "POST" and form.is_valid():
        dados = form.cleaned_data
        email = dados["email"].strip().lower()
        usuario = User.objects.create_user(
            username=email,
            email=email,
            first_name=dados["nome"].strip(),
            password=dados["senha"],
        )
        Representante.objects.create(
            user=usuario,
            instituicao=Instituicao.objects.get(pk=dados["empresa"]),
            cargo=dados["cargo"].strip(),
        )
        messages.success(request, "Conta de representante criada. Faça login para continuar.")
        return redirect("login")

    return render(request, "PROJETOtela_informacoes_representante.html", {
        "form": form,
        "instituicoes": instituicoes,
    })
  
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

    return render(request, "tela-banco-talentos.html", context)


@login_required
def tela_painel(request):
    oportunidades = [
        {
            "id": 1,
            "tipo": "Estágio",
            "status": "Aberta",
            "titulo": "Estágio em tecnologia e automação",
            "data_limite": "20/11/2026",
            "data_publicacao": "08/09/2026",
            "inscritos": 0,
        },
        {
            "id": 2,
            "tipo": "Estágio",
            "status": "Aberta",
            "titulo": "Estágio em análise de dados de operações",
            "data_limite": "09/11/2026",
            "data_publicacao": "01/09/2026",
            "inscritos": 5,
        },
    ]

    context = {
        "instituicao": "Visagio",
        "iniciais": "CD",
        "oportunidades": oportunidades,
        "total_abertas": len(oportunidades),
        "total_candidaturas": sum(
            oportunidade["inscritos"]
            for oportunidade in oportunidades
        ),
        "aguardando_analise": 1,
        "total_rascunhos": 0,
        "total_encerradas": 0,
    }

    return render(request, "tela-painel.html", context)

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
                if usuario.is_staff:
                    return redirect("tela_admin")
                if hasattr(usuario, "aluno"):
                    return redirect("inicio")
                if hasattr(usuario, "recrutador") or hasattr(usuario, "representante"):
                    return redirect("tela_painel")
            else:
                messages.error(request, "Login inválido: e-mail ou senha incorretos.")
    else:
        form = LoginForm()

    return render(request, "tela-login.html", {"form": form})


def sair(request):
    logout(request)
    return redirect("/")

@login_required(login_url='login')
def busca(request):
    q = request.GET.get("q", "")
    ordem = request.GET.get("ordem", "encerrando")
    oportunidades = Oportunidade.objects.all()
    if q:
        # Q permite juntar condições com | (OU): acha o texto no título, na instituição ou na descrição
        oportunidades = oportunidades.filter(
            Q(titulo__icontains=q)
            | Q(instituicao__nome__icontains=q)
            | Q(descricao__icontains=q)
        )

    tipos = request.GET.getlist("tipo")
    if tipos:
        oportunidades = oportunidades.filter(tipo__in=tipos)

    curso = request.GET.get("curso", "")
    if curso:
        oportunidades = oportunidades.filter(curso_id=curso)

    periodo = request.GET.get("periodo", "")
    if periodo.isdigit():
        oportunidades = oportunidades.filter(periodo_minimo__lte=int(periodo))

    modalidades = request.GET.getlist("modalidade")
    if modalidades:
        oportunidades = oportunidades.filter(modalidade__in=modalidades)

    so_remuneradas = request.GET.get("remuneradas") == "1"
    if so_remuneradas:
        oportunidades = oportunidades.filter(remuneracao__gt=0)

    so_abertas = request.GET.get("abertas") == "1"
    if so_abertas:
        oportunidades = oportunidades.filter(prazo_inscricao__gte=date.today())
        
    if ordem == "recentes":
        oportunidades = oportunidades.order_by("-id")
    elif ordem == "maior_bolsa":
        oportunidades = oportunidades.order_by("-remuneracao")
    else:
        ordem = "encerrando"
        oportunidades = oportunidades.order_by("prazo_inscricao")
        
    return render(request, "tela-busca.html", {
        "oportunidades": oportunidades,
        "total_oportunidades": oportunidades.count(),
        "q": q,
        "ordem": ordem,
        "tipos_opcoes": Oportunidade.TIPOS,
        "tipos_selecionados": tipos,
        "cursos": Curso.objects.order_by("nome"),
        "curso_selecionado": curso,
        "periodo_selecionado": periodo,
        "modalidades_selecionadas": modalidades,
        "so_remuneradas": so_remuneradas,
        "so_abertas": so_abertas,
        "ids_favoritos": ids_dos_favoritos(request),
    })

def link_whatsapp(request, oportunidade):
    texto = (
        "Olha essa oportunidade no Nexo: " + oportunidade.titulo
        + " (" + oportunidade.instituicao.nome + "), inscrições até "
        + oportunidade.prazo_inscricao.strftime("%d/%m/%Y") + ". "
        + request.build_absolute_uri()
    )
    return "https://wa.me/?text=" + quote(texto)

@login_required(login_url='login')
def tela_oportunidade(request, id):
    oportunidade = get_object_or_404(Oportunidade, id=id)
    encerrada = oportunidade.prazo_inscricao < date.today()
    ja_candidatou = Candidatura.objects.filter(aluno__user=request.user, oportunidade=oportunidade).exists()
    favoritada = Favorito.objects.filter(aluno__user=request.user, oportunidade=oportunidade).exists()
    return render(request, "tela-oportunidade.html", {
        "oportunidade": oportunidade,
        "encerrada": encerrada,
        "ja_candidatou": ja_candidatou,
        "favoritada": favoritada,
        "link_agenda": link_google_agenda(oportunidade),
        "link_whatsapp": link_whatsapp(request, oportunidade),
    })

@login_required(login_url='login')
def candidatar(request, oportunidade_id):
    oportunidade = get_object_or_404(Oportunidade, id=oportunidade_id)
    if request.method == "POST":
        if not hasattr(request.user, "aluno"):
            messages.error(request, "Só estudantes podem se candidatar.")
        elif oportunidade.prazo_inscricao < date.today():
            messages.error(request, "As inscrições para esta oportunidade já foram encerradas.")
        elif Candidatura.objects.filter(aluno=request.user.aluno, oportunidade=oportunidade).exists():
            messages.error(request, "Você já se candidatou a esta oportunidade.")
        else:
            Candidatura.objects.create(aluno=request.user.aluno, oportunidade=oportunidade)
            messages.success(request, "Candidatura enviada!")
            return redirect("/templates/tela-minha-oportunidades-canditaturas-ativas.html")
    return redirect("tela_oportunidade", id=oportunidade.id)

@login_required(login_url='login')
def favoritar(request, oportunidade_id):
    if request.method == "POST" and hasattr(request.user, "aluno"):
        oportunidade = get_object_or_404(Oportunidade, id=oportunidade_id)
        favorito = Favorito.objects.filter(aluno=request.user.aluno, oportunidade=oportunidade).first()
        if favorito:
            favorito.delete()
        else:
            Favorito.objects.create(aluno=request.user.aluno, oportunidade=oportunidade)
    return redirect(request.META.get("HTTP_REFERER", "inicio"))


@login_required(login_url='login')
def remover_favorito(request, favorito_id):
    if request.method == "POST":
        favorito = get_object_or_404(Favorito, id=favorito_id, aluno__user=request.user)
        favorito.delete()
        messages.success(request, "Favorito removido.")
    return redirect("/templates/tela-minha-oportunidades-favoritos.html")
