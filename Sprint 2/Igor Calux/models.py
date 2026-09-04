"""
Models do app `oportunidades` — Grupo 4 (Projeto de Software, PUC).

Modelo de dados da plataforma de oportunidades acadêmicas e profissionais
(estágio, monitoria, iniciação científica, equipe de competição e liga acadêmica).

Estrutura:

    Instituicao 1 ──< Oportunidade 1 ──< Candidatura >── 1 Aluno

O relacionamento N:N entre Aluno e Oportunidade é representado pela entidade
associativa `Candidatura`, que carrega os dados do próprio processo seletivo
(data e status).
"""

from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone


# ---------------------------------------------------------------------------
# Instituição
# ---------------------------------------------------------------------------

class Instituicao(models.Model):
    """Quem publica a oportunidade.

    O que no diagrama original aparecia como atributos (Faculdades, Empresas,
    Ligas, Equipes de Competição) na verdade são *tipos* de instituição, e por
    isso viraram o campo `tipo`.
    """

    class Tipo(models.TextChoices):
        FACULDADE = "faculdade", "Faculdade"
        EMPRESA = "empresa", "Empresa"
        EQUIPE_COMPETICAO = "equipe_competicao", "Equipe de competição"
        LIGA_ACADEMICA = "liga_academica", "Liga acadêmica"

    nome = models.CharField(max_length=150)
    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    sigla = models.CharField(max_length=20, blank=True)
    cidade = models.CharField(max_length=100, blank=True)
    site = models.URLField(blank=True)
    criada_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "instituição"
        verbose_name_plural = "instituições"
        ordering = ["nome"]
        constraints = [
            # Evita "PUC-Rio" cadastrada duas vezes.
            models.UniqueConstraint(
                fields=["nome", "tipo"],
                name="instituicao_nome_tipo_unico",
            )
        ]

    def __str__(self):
        return self.nome


# ---------------------------------------------------------------------------
# Aluno
# ---------------------------------------------------------------------------

class Aluno(models.Model):
    """Perfil do estudante.

    Nome, e-mail e senha ficam no `User` do Django (`self.user`) — não são
    duplicados aqui. A senha nunca é guardada em texto puro: o Django cuida
    do hash. Este model guarda só o que é específico do aluno.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="aluno",
    )
    universidade = models.ForeignKey(
        Instituicao,
        on_delete=models.PROTECT,
        limit_choices_to={"tipo": Instituicao.Tipo.FACULDADE},
        related_name="alunos",
    )
    matricula = models.CharField(max_length=20)
    curso = models.CharField(max_length=100)
    periodo = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(14)],
    )
    curriculo = models.FileField(upload_to="curriculos/", blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "aluno"
        verbose_name_plural = "alunos"
        ordering = ["user__first_name"]
        constraints = [
            # Matrícula só é única dentro de uma universidade.
            models.UniqueConstraint(
                fields=["universidade", "matricula"],
                name="aluno_matricula_unica_por_universidade",
            )
        ]

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.matricula})"

    @property
    def nome(self):
        return self.user.get_full_name()


# ---------------------------------------------------------------------------
# Oportunidade
# ---------------------------------------------------------------------------

class Oportunidade(models.Model):
    """A vaga publicada por uma instituição.

    Monitoria, IC, estágio etc. são *tipos* de oportunidade — de novo, o que
    no diagrama original estava como atributo virou o campo `tipo`.
    """

    class Tipo(models.TextChoices):
        ESTAGIO = "estagio", "Estágio"
        MONITORIA = "monitoria", "Monitoria"
        INICIACAO_CIENTIFICA = "ic", "Iniciação científica"
        EQUIPE_COMPETICAO = "equipe_competicao", "Equipe de competição"
        LIGA_ACADEMICA = "liga_academica", "Liga acadêmica"

    class Modalidade(models.TextChoices):
        PRESENCIAL = "presencial", "Presencial"
        HIBRIDO = "hibrido", "Híbrido"
        REMOTO = "remoto", "Remoto"

    class Status(models.TextChoices):
        RASCUNHO = "rascunho", "Rascunho"
        ABERTA = "aberta", "Aberta"
        ENCERRADA = "encerrada", "Encerrada"

    instituicao = models.ForeignKey(
        Instituicao,
        on_delete=models.CASCADE,
        related_name="oportunidades",
    )
    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    requisitos = models.TextField(blank=True)

    # Filtros de busca — respondem ao relato de "não achar nada com a minha cara".
    curso_alvo = models.CharField(
        max_length=200,
        blank=True,
        help_text="Cursos aos quais a vaga se destina. Em branco = qualquer curso.",
    )
    periodo_minimo = models.PositiveSmallIntegerField(null=True, blank=True)

    carga_horaria_semanal = models.PositiveSmallIntegerField(null=True, blank=True)
    remunerada = models.BooleanField(default=False)
    valor_bolsa = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True,
    )
    modalidade = models.CharField(
        max_length=15, choices=Modalidade.choices, default=Modalidade.PRESENCIAL,
    )
    cidade = models.CharField(max_length=100, blank=True)

    prazo_inscricao = models.DateField(null=True, blank=True)

    # Endereça a dor de "não saber com quem falar" levantada nas entrevistas.
    responsavel_nome = models.CharField(max_length=150, blank=True)
    responsavel_contato = models.CharField(
        max_length=150, blank=True, help_text="E-mail ou telefone de contato.",
    )

    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.RASCUNHO,
    )
    publicada_em = models.DateTimeField(null=True, blank=True)
    atualizada_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "oportunidade"
        verbose_name_plural = "oportunidades"
        ordering = ["-publicada_em", "titulo"]
        indexes = [
            models.Index(fields=["tipo", "status"]),
            models.Index(fields=["prazo_inscricao"]),
        ]

    def __str__(self):
        return f"{self.get_tipo_display()} — {self.titulo} ({self.instituicao})"

    @property
    def esta_aberta(self):
        if self.status != self.Status.ABERTA:
            return False
        if self.prazo_inscricao and self.prazo_inscricao < timezone.localdate():
            return False
        return True

    @property
    def total_candidaturas(self):
        return self.candidaturas.count()


# ---------------------------------------------------------------------------
# Candidatura (entidade associativa)
# ---------------------------------------------------------------------------

class Candidatura(models.Model):
    """O relacionamento N:N entre Aluno e Oportunidade, com dados próprios.

    Data e status não pertencem nem ao aluno nem à vaga: pertencem ao encontro
    entre os dois. É o que permite ao aluno acompanhar em que pé está cada
    processo — a dor de "duração indefinida" levantada nas entrevistas.
    """

    class Status(models.TextChoices):
        INSCRITA = "inscrita", "Inscrita"
        EM_ANALISE = "em_analise", "Em análise"
        ENTREVISTA = "entrevista", "Entrevista marcada"
        APROVADA = "aprovada", "Aprovada"
        RECUSADA = "recusada", "Recusada"
        DESISTIU = "desistiu", "Aluno desistiu"

    aluno = models.ForeignKey(
        Aluno, on_delete=models.CASCADE, related_name="candidaturas",
    )
    oportunidade = models.ForeignKey(
        Oportunidade, on_delete=models.CASCADE, related_name="candidaturas",
    )
    data = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.INSCRITA,
    )
    atualizada_em = models.DateTimeField(auto_now=True)
    observacoes = models.TextField(blank=True)

    class Meta:
        verbose_name = "candidatura"
        verbose_name_plural = "candidaturas"
        ordering = ["-data"]
        constraints = [
            # Um aluno não se candidata duas vezes à mesma vaga.
            models.UniqueConstraint(
                fields=["aluno", "oportunidade"],
                name="candidatura_unica_por_aluno_e_oportunidade",
            )
        ]

    def __str__(self):
        return f"{self.aluno} → {self.oportunidade.titulo} [{self.get_status_display()}]"
