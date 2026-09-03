"""
Models do app `oportunidades` — Grupo 4 (Projeto de Software, PUC).

Implementação fiel ao DER:

    Instituicao 1..1 ──publica──> 0..N Oportunidade
    Oportunidade 1..1 ──recebe──> 0..N Candidatura
    Aluno        1..1 ────faz───> 0..N Candidatura

`Candidatura` é a entidade associativa que resolve o N:N entre Aluno e
Oportunidade.
"""

from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone


# ---------------------------------------------------------------------------
# Instituição
# ---------------------------------------------------------------------------

class Instituicao(models.Model):
    """Id, Tipo, Nome, Sede."""

    class Tipo(models.TextChoices):
        FACULDADE = "faculdade", "Faculdade"
        EMPRESA = "empresa", "Empresa"
        EQUIPE_COMPETICAO = "equipe_competicao", "Equipe de competição"
        LIGA_ACADEMICA = "liga_academica", "Liga acadêmica"

    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    nome = models.CharField(max_length=150)
    sede = models.CharField(max_length=150)

    class Meta:
        verbose_name = "instituição"
        verbose_name_plural = "instituições"
        ordering = ["nome"]
        constraints = [
            # Evita a mesma instituição cadastrada duas vezes.
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
    """Id, Nome, Matrícula, Instituição_id, Curso, Período, Senha, Email, Currículo.

    Nome, Email e Senha do diagrama são atendidos pelo `User` do Django
    (`self.user`), conforme decidido: assim a senha fica com hash e o login,
    a sessão e o admin funcionam sem código extra. Os demais campos do
    diagrama ficam aqui.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,          # Nome, Email e Senha
        on_delete=models.CASCADE,
        related_name="aluno",
    )
    matricula = models.CharField(max_length=20)
    instituicao = models.ForeignKey(
        Instituicao,
        on_delete=models.PROTECT,
        limit_choices_to={"tipo": Instituicao.Tipo.FACULDADE},
        related_name="alunos",
    )
    curso = models.CharField(max_length=100)
    periodo = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(14)],
    )
    curriculo = models.FileField(upload_to="curriculos/", blank=True)

    class Meta:
        verbose_name = "aluno"
        verbose_name_plural = "alunos"
        ordering = ["matricula"]
        constraints = [
            # Matrícula só é única dentro de uma instituição.
            models.UniqueConstraint(
                fields=["instituicao", "matricula"],
                name="aluno_matricula_unica_por_instituicao",
            )
        ]

    def __str__(self):
        return f"{self.nome or self.user.username} ({self.matricula})"

    @property
    def nome(self):
        return self.user.get_full_name()

    @property
    def email(self):
        return self.user.email


# ---------------------------------------------------------------------------
# Oportunidade
# ---------------------------------------------------------------------------

class Oportunidade(models.Model):
    """Id, Instituição_id, Tipo, Título, Descrição, Requisitos, Curso Alvo,
    Carga Horária, Remuneração, Prazo de Inscrição, Modalidade."""

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

    instituicao = models.ForeignKey(
        Instituicao,
        on_delete=models.CASCADE,
        related_name="oportunidades",
    )
    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    requisitos = models.TextField(blank=True)
    curso_alvo = models.CharField(
        max_length=200,
        blank=True,
        help_text="Cursos a que a vaga se destina. Em branco = qualquer curso.",
    )
    carga_horaria = models.PositiveSmallIntegerField(
        null=True, blank=True, help_text="Horas por semana.",
    )
    remuneracao = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Valor mensal. Deixe em branco se não for remunerada.",
    )
    prazo_inscricao = models.DateField(null=True, blank=True)
    modalidade = models.CharField(
        max_length=15, choices=Modalidade.choices, default=Modalidade.PRESENCIAL,
    )

    class Meta:
        verbose_name = "oportunidade"
        verbose_name_plural = "oportunidades"
        ordering = ["prazo_inscricao", "titulo"]
        indexes = [
            models.Index(fields=["tipo"]),
            models.Index(fields=["prazo_inscricao"]),
        ]

    def __str__(self):
        return f"{self.get_tipo_display()} — {self.titulo} ({self.instituicao})"

    @property
    def remunerada(self):
        return self.remuneracao is not None

    @property
    def inscricoes_abertas(self):
        return self.prazo_inscricao is None or self.prazo_inscricao >= timezone.localdate()

    @property
    def total_candidaturas(self):
        return self.candidaturas.count()


# ---------------------------------------------------------------------------
# Candidatura (entidade associativa)
# ---------------------------------------------------------------------------

class Candidatura(models.Model):
    """Id, Aluno_id, Oportunidade_id, data.

    Resolve o N:N entre Aluno e Oportunidade.
    """

    aluno = models.ForeignKey(
        Aluno, on_delete=models.CASCADE, related_name="candidaturas",
    )
    oportunidade = models.ForeignKey(
        Oportunidade, on_delete=models.CASCADE, related_name="candidaturas",
    )
    data = models.DateTimeField(auto_now_add=True)

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
        return f"{self.aluno} → {self.oportunidade.titulo}"
