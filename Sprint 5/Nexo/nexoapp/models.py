from datetime import date

from django.db import models
from django.contrib.auth.models import User


class Instituicao(models.Model):
    TIPOS = [
        ("faculdade", "Faculdade"),
        ("empresa", "Empresa"),
        ("equipe", "Equipe de competição"),
        ("liga", "Liga acadêmica"),
        ("empresa_junior", "Empresa júnior"),
        ("departamento", "Departamento"),
    ]

    tipo = models.CharField(max_length=20, choices=TIPOS)
    nome = models.CharField(max_length=150)
    sede = models.CharField(max_length=100)

    def __str__(self):
        return self.nome


class Curso(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome


class Aluno(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    instituicao = models.ForeignKey(Instituicao, on_delete=models.CASCADE)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    matricula = models.CharField(max_length=20)
    periodo = models.IntegerField()
    curriculo = models.TextField()
    cr = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    
    def iniciais(self):
        partes = self.user.first_name.split()
        if not partes:
            return self.user.username[:1].upper()
        if len(partes) == 1:
            return partes[0][0].upper()
        return (partes[0][0] + partes[-1][0]).upper()
        
    def __str__(self):
        return self.matricula


class Recrutador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    empresa = models.ForeignKey(Instituicao, on_delete=models.CASCADE, limit_choices_to={"tipo": "empresa"},)
    cargo = models.CharField(max_length=100)

    def __str__(self):
        return self.user.get_full_name() or self.user.email


class Representante(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    instituicao = models.ForeignKey(
        Instituicao,
        on_delete=models.CASCADE,
        limit_choices_to={"tipo__in": ["faculdade", "equipe", "liga", "empresa_junior", "departamento"]},
    )
    cargo = models.CharField(max_length=100)

    def __str__(self):
        return self.user.get_full_name() or self.user.email


class Oportunidade(models.Model):
    TIPOS = [
        ("estagio", "Estágio"),
        ("monitoria", "Monitoria"),
        ("ic", "Iniciação científica"),
        ("equipe", "Equipe de competição"),
        ("liga", "Liga acadêmica"),
    ]

    MODALIDADES = [
        ("presencial", "Presencial"),
        ("hibrido", "Híbrido"),
        ("remoto", "Remoto"),
    ]

    instituicao = models.ForeignKey(Instituicao, on_delete=models.CASCADE)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=TIPOS)
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    requisitos = models.TextField()
    carga_horaria = models.IntegerField()
    remuneracao = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    prazo_inscricao = models.DateField()
    modalidade = models.CharField(max_length=20, choices=MODALIDADES)
    periodo_minimo = models.IntegerField(default=1)

    def dias_restantes(self):
        return (self.prazo_inscricao - date.today()).days

    def texto_prazo(self):
        dias = self.dias_restantes()
        if dias < 0:
            return ""
        if dias == 0:
            return "Último dia para se inscrever"
        if dias == 1:
            return "Falta 1 dia"
        return "Faltam " + str(dias) + " dias"

    def __str__(self):
        return self.titulo


class Candidatura(models.Model):
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE)
    oportunidade = models.ForeignKey(Oportunidade, on_delete=models.CASCADE)
    data = models.DateTimeField(auto_now_add=True)

    class Meta:
        # o mesmo aluno não pode se candidatar duas vezes à mesma oportunidade
        constraints = [
            models.UniqueConstraint(
                fields=["aluno", "oportunidade"],
                name="candidatura_unica_por_aluno_e_oportunidade",
            )
        ]

class Favorito(models.Model):
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE)
    oportunidade = models.ForeignKey(Oportunidade, on_delete=models.CASCADE)
    data = models.DateTimeField(auto_now_add=True)

    class Meta:
        # o mesmo aluno não pode favoritar a mesma oportunidade duas vezes
        constraints = [
            models.UniqueConstraint(
                fields=["aluno", "oportunidade"],
                name="favorito_unico_por_aluno_e_oportunidade",
            )
        ]
