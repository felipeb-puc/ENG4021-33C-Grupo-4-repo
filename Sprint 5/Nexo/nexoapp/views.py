from datetime import date, timedelta
from urllib.parse import urlencode, quote
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils.http import url_has_allowed_host_and_scheme
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
    TipoOportunidade,
)
from .forms import CadastroRecrutadorForm, CadastroRepresentanteForm, CadastroAlunoForm, LoginForm, OportunidadeForm, PerfilAlunoForm, InstituicaoForm, SugerirTipoForm
# Create your views here.
def home(request):
    sair(request)
    return render(request, "tela-inicial.html")

def criar_conta(request):
    sair(request)
    return render(request, "PROJETOtela_escolha_login.html")

def cadastro_aluno(request):
    sair(request)
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
                Aluno.objects.create(
                    user=usuario,
                    instituicao=dados["universidade"],
                    curso=dados["curso"],
                    matricula=dados["matricula"],
                    periodo=int(dados["periodo_atual"]),
                    curriculo="",
                    cr=dados["cr"],
                    aparecer_em_buscas=dados["aparecer_em_buscas"],
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

def tela_so_de_aluno(request):
    """Telas do aluno: quem não é aluno volta para a própria tela inicial.
    Devolve um redirect quando a pessoa não pode ver a tela, ou None quando pode."""
    if hasattr(request.user, "aluno"):
        return None
    messages.error(request, "Essa página é só para estudantes.")
    if hasattr(request.user, "recrutador") or hasattr(request.user, "representante"):
        return redirect("tela_painel")
    if request.user.is_staff:
        return redirect("tela_admin")
    return redirect("home")


def instituicao_do_usuario(user):
    """Instituição de quem publica (recrutador ou representante). Para aluno e admin devolve None."""
    if hasattr(user, "recrutador"):
        return user.recrutador.empresa
    if hasattr(user, "representante"):
        return user.representante.instituicao
    return None


def oportunidades_para_aluno(user):
    """Oportunidades que aparecem nas listagens: nunca rascunho, estágio direcionado só para as universidades
    escolhidas, e monitoria, IC, liga e equipe só da universidade do aluno."""
    oportunidades = Oportunidade.objects.filter(rascunho=False)
    if hasattr(user, "aluno"):
        universidade = user.aluno.instituicao
        # universidades_alvo=None: lista vazia, todas veem. distinct porque o ManyToMany repete linhas
        oportunidades = oportunidades.filter(
            Q(universidades_alvo=None) | Q(universidades_alvo=universidade)
        ).distinct()
        # estágio: todos veem. Acadêmicas: só as publicadas pela universidade do aluno
        # ou por uma liga, equipe etc. que pertence a ela.
        # O que uma empresa publica num tipo novo (ex.: programa de trainee) também aparece para todos.
        oportunidades = oportunidades.filter(
            Q(tipo="estagio")
            | Q(instituicao__tipo="empresa")
            | Q(instituicao=universidade)
            | Q(instituicao__universidade=universidade)
        )
    return oportunidades


def pode_ver_oportunidade(user, oportunidade):
    # quem publicou sempre vê a sua, inclusive rascunho
    if oportunidade.instituicao == instituicao_do_usuario(user):
        return True
    return oportunidades_para_aluno(user).filter(id=oportunidade.id).exists()


def alunos_do_banco_de_talentos(user):
    """Alunos que aparecem em "Buscar candidatos" para quem publica.
    Só entra quem deixou ligado "aparecer em buscas". Recrutador vê alunos de todas as universidades;
    representante vê só os da sua universidade (ou da universidade da sua liga, equipe etc.)."""
    alunos = Aluno.objects.filter(aparecer_em_buscas=True)
    if hasattr(user, "recrutador"):
        return alunos
    if hasattr(user, "representante"):
        instituicao = user.representante.instituicao
        if instituicao.tipo == "faculdade":
            universidade = instituicao
        else:
            universidade = instituicao.universidade
        return alunos.filter(instituicao=universidade)
    return Aluno.objects.none()


def conta_verificada(user):
    if hasattr(user, "recrutador"):
        return user.recrutador.verificado
    if hasattr(user, "representante"):
        return user.representante.verificado
    return False

def ids_dos_favoritos(request):
    ids = []
    if request.user.is_authenticated:
        for favorito in Favorito.objects.filter(aluno__user=request.user):
            ids.append(favorito.oportunidade_id)
    return ids

@login_required(login_url='login')
def inicio(request):
    bloqueio = tela_so_de_aluno(request)
    if bloqueio:
        return bloqueio
    abertas = oportunidades_para_aluno(request.user).filter(prazo_inscricao__gte=date.today()).order_by("prazo_inscricao")
    oportunidades = abertas[:4]
    favoritos = Favorito.objects.filter(aluno__user=request.user)
    candidaturas = Candidatura.objects.filter(aluno__user=request.user)
    candidaturas_ativas = candidaturas.filter(
            status__in=["inscrita", "em_analise", "entrevista"],
    )
    return render(request, "Inicio.html", {
        "oportunidades": oportunidades,
        "total_abertas": abertas.count(),
        "favoritos": favoritos,
        "candidaturas": candidaturas,
        "candidaturas_ativas": candidaturas_ativas,
        "ids_favoritos": ids_dos_favoritos(request),
    })

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
    bloqueio = tela_so_de_aluno(request)
    if bloqueio:
        return bloqueio
    favoritos = Favorito.objects.filter(aluno__user=request.user)
    candidaturas = Candidatura.objects.filter(aluno__user=request.user)
    candidaturas_ativas = candidaturas.filter(
        status__in=["inscrita", "em_analise", "entrevista"],
    )
    candidaturas_historico = candidaturas.filter(
        status__in=["aprovada", "recusada", "desistiu"],
    )
    candidaturas_por_oportunidade = {
        candidatura.oportunidade_id: candidatura
        for candidatura in candidaturas
    }
    for favorito in favoritos:
        favorito.link_agenda = link_google_agenda(favorito.oportunidade)
        favorito.prazo_encerrado = favorito.oportunidade.prazo_inscricao < date.today()
        favorito.candidatura = candidaturas_por_oportunidade.get(
            favorito.oportunidade_id
        )
    return render(request, "tela-minha-oportunidades-favoritos.html", {
        "favoritos": favoritos,
        "candidaturas_ativas": candidaturas_ativas,
        "candidaturas_historico": candidaturas_historico,
    })

@login_required(login_url='login')
def iniciacao_cientifica(request):
    bloqueio = tela_so_de_aluno(request)
    if bloqueio:
        return bloqueio
    oportunidades = oportunidades_para_aluno(request.user).filter(tipo="ic")
    return render(request, "Iniciacao-Cientifica.html", {"oportunidades": oportunidades, "ids_favoritos": ids_dos_favoritos(request)})

@login_required(login_url='login')
def minha_oportunidade_historico(request):
    bloqueio = tela_so_de_aluno(request)
    if bloqueio:
        return bloqueio
    candidaturas_ativas = Candidatura.objects.filter(
        aluno__user=request.user,
        status__in=["inscrita", "em_analise", "entrevista"],
    )
    candidaturas_historico = Candidatura.objects.filter(
        aluno__user=request.user,
        status__in=["aprovada", "recusada", "desistiu"],
    )
    favoritos = Favorito.objects.filter(aluno__user=request.user)
    return render(request, "tela-minha-oportunidades-historico.html", {
        "candidaturas_ativas": candidaturas_ativas,
        "candidaturas_historico": candidaturas_historico,
        "favoritos": favoritos,
    })

@login_required(login_url='login')
def estagio(request):
    bloqueio = tela_so_de_aluno(request)
    if bloqueio:
        return bloqueio
    oportunidades = oportunidades_para_aluno(request.user).filter(tipo="estagio")
    return render(request, "estagio.html", {"oportunidades": oportunidades, "ids_favoritos": ids_dos_favoritos(request)})

@login_required(login_url='login')
def tela_monitoria(request):
    bloqueio = tela_so_de_aluno(request)
    if bloqueio:
        return bloqueio
    oportunidades = oportunidades_para_aluno(request.user).filter(tipo="monitoria")
    return render(request, "tela-monitoria.html", {"oportunidades": oportunidades, "ids_favoritos": ids_dos_favoritos(request)})

@login_required(login_url='login')
def tela_equipe_competicao(request):
    bloqueio = tela_so_de_aluno(request)
    if bloqueio:
        return bloqueio
    oportunidades = oportunidades_para_aluno(request.user).filter(tipo="equipe")
    return render(request, "tela-equipe-competicao.html", {"oportunidades": oportunidades, "ids_favoritos": ids_dos_favoritos(request)})

@login_required(login_url='login')
def tela_perfil(request):
    bloqueio = tela_so_de_aluno(request)
    if bloqueio:
        return bloqueio
    aluno = request.user.aluno
    if request.method == "POST":
        # instance=aluno faz o form salvar em cima do aluno logado, em vez de criar outro
        form = PerfilAlunoForm(request.POST, instance=aluno)
        if form.is_valid():
            form.save()
            messages.success(request, "Perfil salvo.")
            return redirect("tela_perfil")
    else:
        form = PerfilAlunoForm(instance=aluno)
    return render(request, "tela-perfil.html", {"form": form, "aluno": aluno})

@login_required(login_url='login')
def tela_curriculo_aluno(request, id):
    aluno = get_object_or_404(Aluno, id=id)
    instituicao = instituicao_do_usuario(request.user)
    # candidaturas desse aluno para as oportunidades da instituição de quem está vendo
    candidaturas = Candidatura.objects.filter(aluno=aluno, oportunidade__instituicao=instituicao)

    # Podem ver o currículo: o próprio aluno, quem recebeu uma candidatura dele,
    # ou quem publica e encontra o aluno no banco de talentos (ele deixou ligado "aparecer em buscas").
    if hasattr(request.user, "aluno") and request.user.aluno == aluno:
        pode_ver = True
    elif instituicao is not None and candidaturas.exists():
        pode_ver = True
    elif alunos_do_banco_de_talentos(request.user).filter(id=aluno.id).exists():
        pode_ver = True
    else:
        pode_ver = False

    if not pode_ver:
        messages.error(request, "Você só pode ver o currículo de quem se candidatou às suas oportunidades.")
        if hasattr(request.user, "aluno"):
            return redirect("tela_perfil")
        if instituicao is not None:
            return redirect("tela_candidaturas_recebidas")
        return redirect("home")

    return render(request, "tela-curriculo-aluno.html", {
        "aluno": aluno,
        "candidaturas": candidaturas,
        "e_o_proprio_aluno": hasattr(request.user, "aluno") and request.user.aluno == aluno,
    })

@login_required(login_url='login')
def tela_instituicao(request, id):
    instituicao = get_object_or_404(Instituicao, id=id)
    # só quem é membro da instituição edita a descrição e o site
    e_membro = instituicao_do_usuario(request.user) == instituicao
    form = None
    if e_membro:
        form = InstituicaoForm(request.POST or None, instance=instituicao)
        if request.method == "POST" and form.is_valid():
            form.save()
            messages.success(request, "Perfil da instituição atualizado!")
            return redirect("tela_instituicao", id=instituicao.id)
    # as oportunidades da lista passam pela mesma regra das listagens do aluno
    oportunidades = oportunidades_para_aluno(request.user).filter(
        instituicao=instituicao,
        prazo_inscricao__gte=date.today(),
    ).order_by("prazo_inscricao")
    return render(request, "tela-instituicao.html", {
        "instituicao": instituicao,
        "oportunidades": oportunidades,
        "e_membro": e_membro,
        "form": form,
    })

def ajustar_tipos(form, user):
    """Tipos que aparecem no select: recrutador publica estágio, representante as acadêmicas.
    Se o admin já aprovou algum tipo novo, aparece também "Outro tipo"."""
    if hasattr(user, "recrutador"):
        tipos = [("estagio", "Estágio")]
    else:
        tipos = [
            ("monitoria", "Monitoria"),
            ("ic", "Iniciação científica"),
            ("equipe", "Equipe de competição"),
            ("liga", "Liga acadêmica"),
        ]
    if TipoOportunidade.objects.filter(aprovado=True).exists():
        tipos.append(("outro", "Outro tipo"))
    form.fields["tipo"].choices = tipos


def contexto_sugestao(user):
    """Form de sugerir tipo e as sugestões dessa pessoa que ainda esperam o admin."""
    return {
        "sugerir_form": SugerirTipoForm(),
        "sugestoes_em_analise": TipoOportunidade.objects.filter(sugerido_por=user, aprovado=False),
    }


@login_required(login_url='login')
def tela_nova_oportunidade(request):
    if hasattr(request.user, "recrutador"):
        instituicao = request.user.recrutador.empresa
    elif hasattr(request.user, "representante"):
        instituicao = request.user.representante.instituicao
    else:
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")

    if not conta_verificada(request.user):
        messages.error(request, "Sua conta ainda está em análise pela equipe do NEXO.")
        return redirect("tela_painel")

    form = OportunidadeForm(request.POST or None)
    ajustar_tipos(form, request.user)

    if request.method == "POST" and form.is_valid():
        oportunidade = form.save(commit=False)
        oportunidade.instituicao = instituicao
        # o botão "Salvar rascunho" manda name="rascunho" no POST; o "Publicar" não
        oportunidade.rascunho = "rascunho" in request.POST
        oportunidade.save()
        # com commit=False o ManyToMany (universidades_alvo) só é gravado aqui
        form.save_m2m()
        if oportunidade.rascunho:
            messages.success(request, "Rascunho salvo. Ele só aparece no seu painel até ser publicado.")
        else:
            messages.success(request, "Oportunidade publicada!")
        return redirect("tela_painel")

    contexto = {"form": form}
    contexto.update(contexto_sugestao(request.user))
    return render(request, "tela-nova-oportunidade.html", contexto)


@login_required(login_url='login')
def editar_oportunidade(request, id):
    oportunidade = get_object_or_404(Oportunidade, pk=id)
    instituicao = instituicao_do_usuario(request.user)
    if instituicao is None:
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    if oportunidade.instituicao_id != instituicao.id:
        messages.error(request, "Você não tem permissão para editar essa oportunidade.")
        return redirect("tela_painel")

    form = OportunidadeForm(request.POST or None, instance=oportunidade)
    ajustar_tipos(form, request.user)

    rascunho_antes = oportunidade.rascunho
    if request.method == "POST" and form.is_valid():
        editada = form.save(commit=False)
        # só um rascunho pode continuar rascunho; publicada não volta a ser rascunho
        editada.rascunho = rascunho_antes and "rascunho" in request.POST
        editada.save()
        form.save_m2m()
        if editada.rascunho:
            messages.success(request, "Rascunho salvo.")
        else:
            messages.success(request, "Oportunidade atualizada!")
        return redirect("tela_painel")

    contexto = {"form": form, "edicao": True}
    contexto.update(contexto_sugestao(request.user))
    return render(request, "tela-nova-oportunidade.html", contexto)


@login_required(login_url='login')
@require_POST
def sugerir_tipo(request):
    if instituicao_do_usuario(request.user) is None:
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    if not conta_verificada(request.user):
        messages.error(request, "Sua conta ainda está em análise pela equipe do NEXO.")
        return redirect("tela_painel")
    form = SugerirTipoForm(request.POST)
    if form.is_valid():
        TipoOportunidade.objects.create(nome=form.cleaned_data["nome"], sugerido_por=request.user)
        messages.success(request, "Sugestão enviada. O tipo aparece em \"Outro tipo\" depois que o admin aprovar.")
    else:
        # mostra o erro do campo nome (ex.: tipo repetido)
        for erro in form.errors.get("nome", []):
            messages.error(request, erro)
    # volta para a tela de onde veio (publicar ou editar)
    voltar = request.META.get("HTTP_REFERER", "")
    if voltar and url_has_allowed_host_and_scheme(voltar, allowed_hosts={request.get_host()}):
        return redirect(voltar)
    return redirect("tela_nova_oportunidade")


@login_required
@require_POST
def aprovar_tipo(request, id):
    if not request.user.is_staff:
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    tipo = get_object_or_404(TipoOportunidade, id=id)
    tipo.aprovado = True
    tipo.save()
    messages.success(request, "Tipo \"" + tipo.nome + "\" aprovado.")
    return redirect("tela_admin")


@login_required
@require_POST
def recusar_tipo(request, id):
    if not request.user.is_staff:
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    # só recusa o que ainda está em análise: um tipo aprovado pode já estar em uso
    tipo = get_object_or_404(TipoOportunidade, id=id, aprovado=False)
    nome = tipo.nome
    tipo.delete()
    messages.success(request, "Sugestão \"" + nome + "\" recusada.")
    return redirect("tela_admin")


@login_required(login_url='login')
@require_POST
def encerrar_oportunidade(request, id):
    oportunidade = get_object_or_404(Oportunidade, pk=id)
    instituicao = instituicao_do_usuario(request.user)
    if instituicao is None:
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    if oportunidade.instituicao_id != instituicao.id:
        messages.error(request, "Você não tem permissão para encerrar essa oportunidade.")
        return redirect("tela_painel")

    oportunidade.prazo_inscricao = date.today() - timedelta(days=1)
    oportunidade.save(update_fields=["prazo_inscricao"])
    messages.success(request, "Oportunidade encerrada.")
    return redirect("tela_painel")


@login_required(login_url='login')
@require_POST
def publicar_oportunidade(request, id):
    oportunidade = get_object_or_404(Oportunidade, pk=id)
    if oportunidade.instituicao != instituicao_do_usuario(request.user):
        messages.error(request, "Você não tem permissão para publicar essa oportunidade.")
        return redirect("tela_painel")
    if not conta_verificada(request.user):
        messages.error(request, "Sua conta ainda está em análise pela equipe do NEXO.")
        return redirect("tela_painel")
    oportunidade.rascunho = False
    oportunidade.save(update_fields=["rascunho"])
    messages.success(request, "Oportunidade publicada!")
    return redirect("tela_painel")


@login_required(login_url='login')
@require_POST
def excluir_oportunidade(request, id):
    oportunidade = get_object_or_404(Oportunidade, pk=id)
    instituicao = instituicao_do_usuario(request.user)
    if instituicao is None:
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    if oportunidade.instituicao_id != instituicao.id:
        messages.error(request, "Você não tem permissão para excluir essa oportunidade.")
        return redirect("tela_painel_encerradas")
    # excluir apagaria as candidaturas junto, e elas sumiriam do histórico dos alunos
    if oportunidade.candidatura_set.exists():
        messages.error(request, "Essa oportunidade tem candidaturas, então não pode ser excluída. Ela fica encerrada para guardar o histórico dos alunos.")
        return redirect("tela_painel_encerradas")

    oportunidade.delete()
    messages.success(request, "Oportunidade excluída.")
    return redirect("tela_painel_encerradas")

@login_required(login_url='login')
def minha_oportunidade_candidaturas_ativas(request):
    bloqueio = tela_so_de_aluno(request)
    if bloqueio:
        return bloqueio
    candidaturas_ativas = Candidatura.objects.filter(
        aluno__user=request.user,
        status__in=["inscrita", "em_analise", "entrevista"],
    )
    candidaturas_historico = Candidatura.objects.filter(
        aluno__user=request.user,
        status__in=["aprovada", "recusada", "desistiu"],
    )
    favoritos = Favorito.objects.filter(aluno__user=request.user)
    return render(request, "tela-minha-oportunidades-canditaturas-ativas.html", {
        "candidaturas_ativas": candidaturas_ativas,
        "candidaturas_historico": candidaturas_historico,
        "favoritos": favoritos,
    })

@login_required(login_url='login')
def liga_academica(request):
    bloqueio = tela_so_de_aluno(request)
    if bloqueio:
        return bloqueio
    oportunidades = oportunidades_para_aluno(request.user).filter(tipo="liga")
    return render(request, "tela-liga-academica.html", {"oportunidades": oportunidades, "ids_favoritos": ids_dos_favoritos(request)})
    
def cadastro_recrutador(request):
    sair(request)
    empresas = Instituicao.objects.filter(tipo="empresa")
    form = CadastroRecrutadorForm(request.POST or None)
    form.fields["empresa"].choices = [("", "Selecione")] + [
        (str(empresa.pk), empresa.nome) for empresa in empresas
    ] + [("outro", "Outro")]
    if request.method == "POST" and form.is_valid():
        dados = form.cleaned_data
        email = dados["email"].strip().lower()
        with transaction.atomic():
            if dados["empresa"] == "outro":
                empresa, _ = Instituicao.objects.get_or_create(
                    tipo="empresa",
                    nome=dados["nova_empresa"].strip(),
                    defaults={"sede": ""},
                )
            else:
                empresa = Instituicao.objects.get(
                    pk=dados["empresa"],
                    tipo="empresa",
                )
            usuario = User.objects.create_user(
                username=email,
                email=email,
                first_name=dados["nome"].strip(),
                password=dados["senha"],
            )
            Recrutador.objects.create(
                user=usuario,
                empresa=empresa,
                cargo=dados["cargo"].strip(),
            )
        messages.success(request, "Conta de recrutador criada. Faça login para continuar.")
        return redirect("login")

    return render(request, "PROJETOtela_informacoes_recrutador.html", {
        "form": form,
        "empresas": empresas,
    })



def cadastro_representante(request):
    sair(request)
    instituicoes = Instituicao.objects.exclude(tipo="empresa")
    form = CadastroRepresentanteForm(request.POST or None)
    form.fields["empresa"].choices = [("", "Selecione")] + [
        (str(instituicao.pk), instituicao.nome) for instituicao in instituicoes
    ] + [("outro", "Outro")]

    if request.method == "POST" and form.is_valid():
        dados = form.cleaned_data
        email = dados["email"].strip().lower()
        with transaction.atomic():
            if dados["empresa"] == "outro":
                # faculdade não pertence a outra universidade, então ali fica vazio
                universidade = dados["universidade_nova_instituicao"]
                if dados["tipo_nova_instituicao"] == "faculdade":
                    universidade = None
                instituicao, _ = Instituicao.objects.get_or_create(
                    tipo=dados["tipo_nova_instituicao"],
                    nome=dados["nova_instituicao"].strip(),
                    defaults={
                        "sede": dados["sede_nova_instituicao"].strip(),
                        "universidade": universidade,
                    },
                )
            else:
                instituicao = Instituicao.objects.get(pk=dados["empresa"])
            usuario = User.objects.create_user(
                username=email,
                email=email,
                first_name=dados["nome"].strip(),
                password=dados["senha"],
            )
            Representante.objects.create(
                user=usuario,
                instituicao=instituicao,
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
    if not (hasattr(request.user, "recrutador") or hasattr(request.user, "representante")):
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    todos = alunos_do_banco_de_talentos(request.user)
    candidatos = todos

    # os filtros chegam pela URL (GET), igual à tela de candidaturas recebidas
    nome = request.GET.get("nome", "").strip()
    universidade = request.GET.get("universidade", "")
    curso = request.GET.get("curso", "")
    periodo = request.GET.get("periodo", "")
    cr = request.GET.get("cr", "").replace(",", ".")

    # o que não é número é ignorado, para não dar erro 500
    if not universidade.isdigit():
        universidade = ""
    if not curso.isdigit():
        curso = ""
    if not periodo.isdigit():
        periodo = ""

    if nome:
        # procura no nome e no texto do currículo (onde ficam as habilidades)
        candidatos = candidatos.filter(Q(user__first_name__icontains=nome) | Q(curriculo__icontains=nome))
    if universidade:
        candidatos = candidatos.filter(instituicao__id=universidade)
    if curso:
        candidatos = candidatos.filter(curso__id=curso)
    if periodo:
        candidatos = candidatos.filter(periodo__gte=periodo)
    if cr:
        try:
            candidatos = candidatos.filter(cr__gte=float(cr))
        except ValueError:
            cr = ""

    context = {
        "candidatos": candidatos.order_by("-cr"),
        # opções dos selects: só universidades e cursos que existem entre os alunos do banco
        "universidades": Instituicao.objects.filter(aluno__in=todos).distinct().order_by("nome"),
        "cursos": Curso.objects.filter(aluno__in=todos).distinct().order_by("nome"),
        "periodos": range(1, 13),
        "filtro": {
            "nome": nome,
            "universidade": universidade,
            "curso": curso,
            "periodo": periodo,
            "cr": cr,
        },
    }

    return render(request, "tela-banco-talentos.html", context)


@login_required
def tela_painel(request):
    if not (hasattr(request.user, "recrutador") or hasattr(request.user, "representante")):
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    return render(request, "tela-painel.html", contexto_painel(request, mostrar_encerradas=False))


@login_required
def tela_painel_encerradas(request):
    if not (hasattr(request.user, "recrutador") or hasattr(request.user, "representante")):
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    return render(request, "tela-painel-encerradas.html", contexto_painel(request, mostrar_encerradas=True))


def contexto_painel(request, mostrar_encerradas):
    instituicao = instituicao_do_usuario(request.user)
    oportunidades_instituicao = Oportunidade.objects.filter(instituicao=instituicao)
    oportunidades_abertas = oportunidades_instituicao.filter(
        prazo_inscricao__gte=date.today(),
    )
    oportunidades_encerradas = oportunidades_instituicao.filter(
        prazo_inscricao__lt=date.today(),
    )
    total_oportunidades = oportunidades_instituicao.count()
    total_abertas = oportunidades_abertas.count()
    total_encerradas = oportunidades_encerradas.count()
    total_candidaturas = Candidatura.objects.filter(
        oportunidade__instituicao=instituicao,
    ).count()
    partes_nome = (request.user.get_full_name() or request.user.username).split()
    iniciais = (partes_nome[0][0] + partes_nome[-1][0]).upper()
    if len(partes_nome) == 1:
        iniciais = partes_nome[0][0].upper()

    return {
        "instituicao": instituicao,
        "iniciais": iniciais,
        "oportunidades": (
            oportunidades_encerradas if mostrar_encerradas else oportunidades_abertas
        ).order_by("-id"),
        "total_oportunidades": total_oportunidades,
        "total_abertas": total_abertas,
        "total_candidaturas": total_candidaturas,
        "total_encerradas": total_encerradas,
        "verificado": conta_verificada(request.user),
    }

@login_required
def tela_candidaturas_recebidas(request):
    if not (hasattr(request.user, "recrutador") or hasattr(request.user, "representante")):
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    instituicao = instituicao_do_usuario(request.user)
    # só as candidaturas das oportunidades desta instituição: outro recrutador não vê
    candidaturas = Candidatura.objects.filter(oportunidade__instituicao=instituicao)

    # os filtros chegam pela URL (GET), igual à tela de busca
    nome = request.GET.get("nome", "").strip()
    universidade = request.GET.get("universidade", "")
    curso = request.GET.get("curso", "")
    periodo = request.GET.get("periodo", "")
    cr = request.GET.get("cr", "").replace(",", ".")
    oportunidade = request.GET.get("oportunidade", "")
    status = request.GET.get("status", "")

    # universidade, curso, período e oportunidade têm que ser número.
    # Se vier texto pela URL (ex.: ?periodo=abc), o filtro é ignorado em vez de dar erro 500.
    if not universidade.isdigit():
        universidade = ""
    if not curso.isdigit():
        curso = ""
    if not periodo.isdigit():
        periodo = ""
    if not oportunidade.isdigit():
        oportunidade = ""

    if nome:
        candidaturas = candidaturas.filter(aluno__user__first_name__icontains=nome)
    if universidade:
        candidaturas = candidaturas.filter(aluno__instituicao__id=universidade)
    if curso:
        candidaturas = candidaturas.filter(aluno__curso__id=curso)
    if periodo:
        candidaturas = candidaturas.filter(aluno__periodo__gte=periodo)
    if cr:
        try:
            candidaturas = candidaturas.filter(aluno__cr__gte=float(cr))
        except ValueError:
            # texto que não é número no CR: ignora o filtro em vez de dar erro 500
            cr = ""
    if oportunidade:
        candidaturas = candidaturas.filter(oportunidade__id=oportunidade)
    if status:
        candidaturas = candidaturas.filter(status=status)

    # opções dos selects: só o que existe nas candidaturas desta instituição
    recebidas = Candidatura.objects.filter(oportunidade__instituicao=instituicao)
    universidades = Instituicao.objects.filter(aluno__candidatura__in=recebidas).distinct().order_by("nome")
    cursos = Curso.objects.filter(aluno__candidatura__in=recebidas).distinct().order_by("nome")
    oportunidades = Oportunidade.objects.filter(instituicao=instituicao).order_by("titulo")

    context = {
        "candidaturas": candidaturas.order_by("-data"),
        "universidades": universidades,
        "cursos": cursos,
        "oportunidades": oportunidades,
        "periodos": range(1, 11),
        "status_opcoes": Candidatura.STATUS_CHOICES,
        "filtro": {
            "nome": nome,
            "universidade": universidade,
            "curso": curso,
            "periodo": periodo,
            "cr": cr,
            "oportunidade": oportunidade,
            "status": status,
        },
    }

    return render(
        request,
        "tela-candidaturas-recebidas.html",
        context
    )

@login_required
def tela_admin(request):
    if not request.user.is_staff:
        messages.error(request, "Você não tem acesso a essa página.")
        if hasattr(request.user, "aluno"):
            return redirect("inicio")
        return redirect("tela_painel")
    contas = []
    for recrutador in Recrutador.objects.all():
        contas.append({
            "user_id": recrutador.user.id,
            "nome": recrutador.user.first_name,
            "instituicao": recrutador.empresa.nome,
            "tipo": "Recrutador",
            "data_cadastro": recrutador.user.date_joined,
            "verificada": recrutador.verificado,
        })
    for representante in Representante.objects.all():
        contas.append({
            "user_id": representante.user.id,
            "nome": representante.user.first_name,
            "instituicao": representante.instituicao.nome,
            "tipo": "Representante acadêmico",
            "data_cadastro": representante.user.date_joined,
            "verificada": representante.verificado,
        })
    contas = sorted(contas, key=lambda conta: conta["verificada"])

    context = {
        "contas": contas,
        "tipos_em_analise": TipoOportunidade.objects.filter(aprovado=False).order_by("data"),
        "tipos_aprovados": TipoOportunidade.objects.filter(aprovado=True).order_by("nome"),
    }

    return render(request, "tela-admin.html", context)


@login_required
@require_POST
def aprovar_conta(request, user_id):
    if not request.user.is_staff:
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    usuario = get_object_or_404(User, pk=user_id)
    if hasattr(usuario, "recrutador"):
        conta = usuario.recrutador
    elif hasattr(usuario, "representante"):
        conta = usuario.representante
    else:
        messages.error(request, "Essa conta não é de recrutador nem de representante.")
        return redirect("tela_admin")
    conta.verificado = True
    conta.save()
    messages.success(request, "Conta de " + usuario.first_name + " aprovada.")
    return redirect("tela_admin")


def conta_de_quem_publica(usuario):
    """Recrutador ou representante ligado a esse usuário, ou None."""
    if hasattr(usuario, "recrutador"):
        return usuario.recrutador
    if hasattr(usuario, "representante"):
        return usuario.representante
    return None


@login_required
@require_POST
def revogar_conta(request, user_id):
    if not request.user.is_staff:
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    usuario = get_object_or_404(User, pk=user_id)
    conta = conta_de_quem_publica(usuario)
    if conta is None:
        messages.error(request, "Essa conta não é de recrutador nem de representante.")
        return redirect("tela_admin")
    # a conta volta para "em análise": entra no site, mas não publica até ser aprovada de novo
    conta.verificado = False
    conta.save()
    messages.success(request, "Aprovação de " + usuario.first_name + " retirada. A conta voltou para análise.")
    return redirect("tela_admin")


@login_required
@require_POST
def recusar_conta(request, user_id):
    if not request.user.is_staff:
        messages.error(request, "Você não tem acesso a essa página.")
        return redirect("inicio")
    usuario = get_object_or_404(User, pk=user_id)
    conta = conta_de_quem_publica(usuario)
    if conta is None:
        messages.error(request, "Essa conta não é de recrutador nem de representante.")
        return redirect("tela_admin")
    # só recusa conta que ainda está em análise; conta aprovada se revoga primeiro
    if conta.verificado:
        messages.error(request, "Essa conta já foi aprovada. Retire a aprovação antes de recusar.")
        return redirect("tela_admin")
    nome = usuario.first_name
    # apagar o User apaga junto o Recrutador ou Representante (on_delete=CASCADE)
    usuario.delete()
    messages.success(request, "Cadastro de " + nome + " recusado e apagado.")
    return redirect("tela_admin")


def entrar(request):
    sair(request)
    # "next" é a página que a pessoa tentou abrir antes de fazer login (ex.: link de uma vaga no WhatsApp).
    # O @login_required coloca ele na URL do login, e o form manda de volta num campo escondido.
    proxima = request.POST.get("next") or request.GET.get("next", "")
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            senha = form.cleaned_data["senha"]
            usuario = authenticate(request, username=email, password=senha)
            if usuario is not None:
                login(request, usuario)
                # só volta se o endereço for do próprio site, para ninguém usar o login para mandar a pessoa a outro site
                if proxima and url_has_allowed_host_and_scheme(proxima, allowed_hosts={request.get_host()}):
                    return redirect(proxima)
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

    return render(request, "tela-login.html", {"form": form, "proxima": proxima})


@login_required(login_url='login')
def trocar_senha(request):
    if request.method == "POST":
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            usuario = form.save()
            update_session_auth_hash(request, usuario)
            messages.success(request, "Senha alterada.")
            return redirect("trocar_senha")
    else:
        form = PasswordChangeForm(request.user)
    return render(request, "tela-trocar-senha.html", {"form": form})


def sair(request):
    logout(request)
    return redirect("/")

@login_required(login_url='login')
def busca(request):
    bloqueio = tela_so_de_aluno(request)
    if bloqueio:
        return bloqueio
    q = request.GET.get("q", "")
    ordem = request.GET.get("ordem", "encerrando")
    oportunidades = oportunidades_para_aluno(request.user)
    if q:
        # Q permite juntar condições com | (OU): acha o texto no título, na instituição ou na descrição
        oportunidades = oportunidades.filter(
            Q(titulo__icontains=q)
            | Q(instituicao__nome__icontains=q)
            | Q(descricao__icontains=q)
            | Q(tipo_novo__nome__icontains=q)
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
    if not pode_ver_oportunidade(request.user, oportunidade):
        messages.error(request, "Essa oportunidade não está disponível para você.")
        return redirect("tela_busca")
    encerrada = oportunidade.prazo_inscricao < date.today()
    ja_candidatou = Candidatura.objects.filter(aluno__user=request.user, oportunidade=oportunidade).exists()
    favoritada = Favorito.objects.filter(aluno__user=request.user, oportunidade=oportunidade).exists()
    # o aluno ainda não chegou no período mínimo da vaga
    periodo_insuficiente = hasattr(request.user, "aluno") and request.user.aluno.periodo < oportunidade.periodo_minimo
    # só aluno vê os botões de candidatar e salvar; quem publicou vê o botão de editar
    e_aluno = hasattr(request.user, "aluno")
    e_dono = oportunidade.instituicao == instituicao_do_usuario(request.user)
    return render(request, "tela-oportunidade.html", {
        "oportunidade": oportunidade,
        "e_aluno": e_aluno,
        "e_dono": e_dono,
        "encerrada": encerrada,
        "periodo_insuficiente": periodo_insuficiente,
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
        elif not pode_ver_oportunidade(request.user, oportunidade):
            messages.error(request, "Essa oportunidade não está disponível para você.")
        elif oportunidade.prazo_inscricao < date.today():
            messages.error(request, "As inscrições para esta oportunidade já foram encerradas.")
        elif Candidatura.objects.filter(aluno=request.user.aluno, oportunidade=oportunidade).exists():
            messages.error(request, "Você já se candidatou a esta oportunidade.")
        elif request.user.aluno.periodo < oportunidade.periodo_minimo:
            messages.error(request, "Esta oportunidade é a partir do " + str(oportunidade.periodo_minimo) + "º período, e você está no " + str(request.user.aluno.periodo) + "º.")
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
            # tirar dos favoritos sempre pode
            favorito.delete()
        elif pode_ver_oportunidade(request.user, oportunidade):
            Favorito.objects.create(aluno=request.user.aluno, oportunidade=oportunidade)
        else:
            # rascunho ou vaga de outra universidade: o aluno não vê, então não favorita
            messages.error(request, "Essa oportunidade não está disponível para você.")
    # volta para a página de onde veio, desde que seja do próprio site
    voltar = request.META.get("HTTP_REFERER", "")
    if voltar and url_has_allowed_host_and_scheme(voltar, allowed_hosts={request.get_host()}):
        return redirect(voltar)
    return redirect("inicio")


@login_required(login_url='login')
def remover_favorito(request, favorito_id):
    if request.method == "POST":
        favorito = get_object_or_404(Favorito, id=favorito_id, aluno__user=request.user)
        favorito.delete()
        messages.success(request, "Favorito removido.")
    return redirect("/templates/tela-minha-oportunidades-favoritos.html")


@login_required
@require_POST
def desistir(request, candidatura_id):
    candidatura = get_object_or_404(
        Candidatura,
        id=candidatura_id,
        aluno__user=request.user,
    )
    candidatura.status = "desistiu"
    candidatura.save(update_fields=["status"])
    messages.success(request, "Você desistiu da candidatura.")
    return redirect("tela_minha_oportunidades")

@login_required(login_url='login')
@require_POST
def mudar_status(request, candidatura_id):
    candidatura = get_object_or_404(Candidatura, id=candidatura_id)
    instituicao = instituicao_do_usuario(request.user)

    # volta para a lista com os mesmos filtros que estavam na tela
    lista = reverse("tela_candidaturas_recebidas")
    voltar = request.POST.get("voltar", "")
    if not voltar.startswith(lista):
        voltar = lista

    # só quem publicou a oportunidade muda o status da candidatura
    if instituicao is None or candidatura.oportunidade.instituicao != instituicao:
        messages.error(request, "Você não pode mudar o status desta candidatura.")
        return redirect(voltar)

    # "desistiu" é escolha do aluno: o recrutador não marca e não muda depois
    status_permitidos = ["inscrita", "em_analise", "entrevista", "aprovada", "recusada"]
    novo_status = request.POST.get("status", "")
    if candidatura.status == "desistiu":
        messages.error(request, "O aluno desistiu desta candidatura, então o status não muda mais.")
    elif novo_status not in status_permitidos:
        messages.error(request, "Status inválido.")
    else:
        candidatura.status = novo_status
        candidatura.save()
        nome = candidatura.aluno.user.first_name
        messages.success(request, "Status de " + nome + " mudado para " + candidatura.get_status_display() + ".")
    return redirect(voltar)
