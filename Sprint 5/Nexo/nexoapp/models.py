from django.db import models
from django.contrib.auth.models import User


class Instituicao(models.Model):
    TIPOS = [
        ("faculdade", "Faculdade"),
        ("empresa", "Empresa"),
        ("equipe", "Equipe de competição"),
        ("liga", "Liga acadêmica"),
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

    def __str__(self):
        return self.matricula


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

    def __str__(self):
        return self.titulo


class Candidatura(models.Model):
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE)
    oportunidade = models.ForeignKey(Oportunidade, on_delete=models.CASCADE)
    data = models.DateTimeField(auto_now_add=True)

class Favorito(models.Model):
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE)
    oportunidade = models.ForeignKey(Oportunidade, on_delete=models.CASCADE)
    data = models.DateTimeField(auto_now_add=True)